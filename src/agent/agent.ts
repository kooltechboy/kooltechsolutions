import { WorkerOptions, cli, defineAgent, llm, voice } from '@livekit/agents';
import { beta } from '@livekit/agents-plugin-google';
import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildVoiceCatalogSummary } from '../lib/knowledge/catalog';
import { KNOWLEDGE_FALLBACK_VOICE, retrieveRelevantKnowledge } from '../lib/knowledge/retrieve';
import { createCalendarEvent } from '../lib/calendar/google';
import { generateIcsInvite } from '../lib/calendar/ics';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parses free-text date and time strings into a precise UTC Date.
 * Assumes the business timezone America/Santo_Domingo (UTC-4, no DST).
 */
function parseBookingDateTime(dateStr: string, timeStr: string): Date {
  const timeRegex = /(\d+):(\d+)\s*(AM|PM)/i;
  const match = timeStr.match(timeRegex);
  if (!match) throw new Error("Invalid time format");
  
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const ampm = match[3].toUpperCase();
  
  if (ampm === "PM" && hours < 12) hours += 12;
  if (ampm === "AM" && hours === 12) hours = 0;
  
  const cleanDateStr = dateStr.replace(/^[a-zA-Z]+,\s*/, "").trim();
  
  let finalDateStr = cleanDateStr;
  if (!/\d{4}/.test(cleanDateStr)) {
    finalDateStr = `${cleanDateStr}, ${new Date().getFullYear()}`;
  }
  
  const dateObj = new Date(finalDateStr);
  if (isNaN(dateObj.getTime())) {
    throw new Error("Invalid date format");
  }
  
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const date = dateObj.getDate();
  
  const utcOffset = -4 * 60; // Santo Domingo is always UTC-4
  const utcDate = new Date(Date.UTC(year, month, date, hours - (utcOffset / 60), minutes, 0, 0));
  
  return utcDate;
}

// ── Telemetry ─────────────────────────────────────────────────────────────────
async function logToSupabase(
  sessionId: string,
  role: 'user' | 'agent',
  content: string,
  agentName: string
) {
  if (!supabaseUrl || !supabaseKey || !content?.trim()) return;
  try {
    await supabase.from('agent_logs').insert({
      session_id: sessionId,
      role,
      content: content.trim(),
      agent_name: agentName,
    });
  } catch (err) {
    console.error('[Agent] Telemetry log failed:', err);
  }
}

// ── Session tracking ──────────────────────────────────────────────────────────
async function upsertSession(sessionId: string, agentName: string) {
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await supabase.from('agent_sessions').upsert(
      {
        session_id: sessionId,
        agent_name: agentName,
        channel: 'voice',
        status: 'active',
        last_active_at: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );
  } catch { /* non-critical */ }
}

// ── Tool Definitions ──────────────────────────────────────────────────────────
const tools = {
  bookDemo: llm.tool({
    description: 'Schedule a live demo or consultation. ALWAYS confirm details with the user before calling this.',
    parameters: z.object({
      name: z.string().describe("Client's full name"),
      email: z.string().describe("Client's email address"),
      service: z.string().describe("Service they are interested in"),
      date: z.string().describe("Date for the demo (e.g. June 15)"),
      time: z.string().describe("Time for the demo (e.g. 10:00 AM)"),
      phone: z.string().optional().describe("Client's phone number"),
      message: z.string().optional().describe("Additional notes"),
    }),
    execute: async ({ name, email, service, date, time, phone, message }) => {
      const first_name = name.split(' ')[0] || 'Unknown';
      const last_name = name.split(' ').slice(1).join(' ') || '-';

      let scheduled_at_date: Date;
      try {
        scheduled_at_date = parseBookingDateTime(date, time);
      } catch (err) {
        console.warn('[Agent] Date parsing failed, defaulting to tomorrow:', err);
        scheduled_at_date = new Date(Date.now() + 24 * 60 * 60 * 1000);
      }

      // ── Google Calendar Sync ─────────────────────────────────────────────────
      const { googleEventId, meetingLink } = await createCalendarEvent({
        name,
        email,
        service,
        scheduledAt: scheduled_at_date.toISOString(),
        notes: message || "",
      });

      // Try to insert into proper bookings table
      let bookingId: string | null = null;
      const { data: bookingData, error: bookingDbError } = await supabase
        .from('bookings')
        .insert({
          first_name,
          last_name,
          email,
          phone: phone || null,
          service_interest: service,
          notes: message || null,
          scheduled_at: scheduled_at_date.toISOString(),
          status: 'confirmed',
          booked_via: 'ai_agent',
          agent_name: 'VoiceAgent',
          google_event_id: googleEventId,
          meeting_link: meetingLink,
        })
        .select('id')
        .single();

      if (!bookingDbError) {
        bookingId = bookingData?.id;
      } else {
        console.error('[Agent] Proper bookings table insert error:', bookingDbError.message);
      }

      // Always create a CRM lead record
      const bookingNote = `LIVE DEMO SCHEDULED: ${date} at ${time}`;
      const meetingNote = meetingLink ? `\nMeeting Link: ${meetingLink}` : "";
      const { data: leadData, error: leadError } = await supabase
        .from('leads')
        .insert({
          first_name,
          last_name,
          email,
          phone: phone || null,
          service_interest: service,
          notes: `${bookingNote}${meetingNote}\n\nClient Message: ${message || 'None'}`,
          status: 'qualified',
        })
        .select('id')
        .single();

      if (leadError) return `Error booking demo: ${leadError.message}`;

      const resolvedBookingId = bookingId ?? leadData.id;

      // Send email alert with ICS attachment
      if (process.env.RESEND_API_KEY) {
        try {
          const { Resend } = await import('resend');
          const resend = new Resend(process.env.RESEND_API_KEY);
          const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? 'sales@kooltechsolutions.com';

          const icsContent = generateIcsInvite({
            id: resolvedBookingId,
            name,
            email,
            service,
            scheduledAt: scheduled_at_date.toISOString(),
            meetingLink,
            notes: message || "",
          });

          const attachments = [
            {
              filename: 'invite.ics',
              content: Buffer.from(icsContent),
            },
          ];

          // Admin notification
          await resend.emails.send({
            from: 'KoolTech AI Voice <onboarding@resend.dev>',
            to: [adminEmail],
            subject: `🎙️ Voice Agent Lead: ${name}`,
            html: `<h2>Voice Agent Booking</h2>
              <p><strong>Name:</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Service:</strong> ${service}</p>
              <p><strong>Slot:</strong> ${date} at ${time}</p>
              ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}`,
            attachments,
          });

          // Client notification
          await resend.emails.send({
            from: 'KoolTech Solutions <onboarding@resend.dev>',
            to: [email],
            subject: `Confirmed: Your KoolTech Solutions Demo`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #00d4ff;">Demo Confirmed!</h2>
                <p>Hi ${name},</p>
                <p>Your live platform demo with KoolTech Solutions is confirmed for:</p>
                <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${date} at ${time}</p>
                  ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}" style="color: #00d4ff; font-weight: bold;">Join Video Call</a></p>` : ""}
                </div>
                <p>We've attached a calendar invite (.ics) to this email to add it to your calendar.</p>
                ${meetingLink ? "<p>You can use the Google Meet link above to join the call at the scheduled time.</p>" : "<p>We'll send you a meeting link 15 minutes before the session starts.</p>"}
                <p>If you need to reschedule, please reply to this email.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
              </div>
            `,
            attachments,
          });
        } catch (e) {
          console.error('[Agent] Email error:', e);
        }
      }

      return `Demo booked successfully. Booking ID: ${resolvedBookingId}. Confirmation sent to ${email}.`;
    }
  }),

  getAvailableSlots: llm.tool({
    description: 'Get available booking slots for the next N days.',
    parameters: z.object({
      days: z.number().optional().describe('Number of days ahead to check (1-14)'),
    }),
    execute: async ({ days }) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/bookings/slots?days=${days ?? 7}`);
        if (!res.ok) return 'Unable to fetch availability right now.';
        const data = await res.json();
        const slots = (data.availableSlots ?? []).slice(0, 6);
        if (slots.length === 0) return 'No available slots found in that range.';
        const slotList = slots.map((s: any) => `${s.date} at ${s.time}`).join(', ');
        return `Available slots (${data.timezone}): ${slotList}`;
      } catch {
        return 'Availability service is temporarily unavailable.';
      }
    }
  }),

  checkAvailability: llm.tool({
    description: 'Check if a specific date has booked slots.',
    parameters: z.object({
      date: z.string().describe("Date to check (e.g. 'June 15')"),
    }),
    execute: async ({ date }) => {
      const { data, error } = await supabase
        .from('leads')
        .select('notes')
        .ilike('notes', `%LIVE DEMO SCHEDULED: ${date}%`);
      if (error) return 'No booked slots found.';
      const booked = data
        .map((l: any) => l.notes?.match(/at\s+(.+)$/m)?.[1]?.trim())
        .filter(Boolean);
      return `Booked slots for ${date}: ${booked.join(', ') || 'None — this date is open!'}`;
    }
  }),

  checkTicketStatus: llm.tool({
    description: 'Check the status of an existing support ticket.',
    parameters: z.object({
      ticketId: z.string().describe('The ticket ID'),
    }),
    execute: async ({ ticketId }) => {
      const { data, error } = await supabase
        .from('tickets')
        .select('status, subject, priority')
        .eq('id', ticketId)
        .single();
      if (error) return `Ticket not found: ${error.message}`;
      return `Ticket "${data.subject}" — Status: ${data.status.toUpperCase()}, Priority: ${data.priority}.`;
    }
  }),

  createTicket: llm.tool({
    description: 'Create a support ticket for an issue.',
    parameters: z.object({
      subject: z.string().describe('Brief summary of the issue'),
      description: z.string().describe('Detailed description of the problem'),
      priority: z.string().describe('Priority: low, normal, high, or critical'),
    }),
    execute: async ({ subject, description, priority }) => {
      const validPriorities = ['low', 'normal', 'high', 'critical'];
      const safePriority = validPriorities.includes(priority) ? priority : 'normal';

      const { data, error } = await supabase
        .from('tickets')
        .insert({ subject, description, priority: safePriority, status: 'open' })
        .select('id')
        .single();

      if (error) return `Error creating ticket: ${error.message}`;
      return `Ticket created successfully. Your ticket ID is ${data.id}. Priority: ${safePriority}.`;
    }
  }),

  getKnowledge: llm.tool({
    description: 'Retrieve verified information from the KoolTech knowledge base. Call before answering pricing, features, or SLA questions.',
    parameters: z.object({
      query: z.string().describe('The specific question or topic to look up'),
    }),
    execute: async ({ query }) => {
      try {
        console.log(`[Agent] getKnowledge query: "${query}"`);
        const chunks = await retrieveRelevantKnowledge(query, {
          matchCount: 3,
          threshold: 0.6,
        });

        if (chunks.length === 0) {
          console.log(`[Agent] getKnowledge: No relevant chunks found.`);
          return KNOWLEDGE_FALLBACK_VOICE;
        }

        const context = chunks.map(c => `[Verified Info - ${c.title}]: ${c.content}`).join("\n\n");
        console.log(`[Agent] getKnowledge retrieved ${chunks.length} chunks.`);
        return context;
      } catch (err) {
        console.error('[Agent] getKnowledge error:', err);
        return KNOWLEDGE_FALLBACK_VOICE;
      }
    }
  }),

  escalateToHuman: llm.tool({
    description: 'Escalate the call to a human agent. Use when user requests human, has a critical issue, or is frustrated.',
    parameters: z.object({
      reason: z.string().describe('Clear reason for escalation'),
      priority: z.string().describe('Priority: low, normal, high, critical'),
      summary: z.string().describe('2-3 sentence summary for the human agent'),
      clientName: z.string().optional().describe("Client's name if known"),
      clientEmail: z.string().optional().describe("Client's email if known"),
    }),
    execute: async ({ reason, priority, summary, clientName, clientEmail }) => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
        await fetch(`${baseUrl}/api/ai-workforce/escalate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId: 'voice-session',
            agentName: 'VoiceAgent',
            channel: 'voice',
            reason,
            priority,
            summary,
            userContact: { name: clientName, email: clientEmail },
          }),
        });
        return 'I\'ve notified our team and they have your conversation details. A human specialist will contact you shortly. Is there anything else I can help with while you wait?';
      } catch {
        return 'I\'ve flagged your request for our team. Please also reach us directly at support@kooltechsolutions.com if urgent.';
      }
    }
  }),
};

// ── Agent Definition ──────────────────────────────────────────────────────────
export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    const roomName = ctx.room.name ?? 'unknown-room';
    console.log(`[Agent] Connected to room: ${roomName}`);

    const sessionId = roomName.replace(/^room-/, '') || roomName;
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Extract agentName from participant metadata
    let agentName = 'Kira';
    for (const p of ctx.room.remoteParticipants.values()) {
      if (p.metadata) {
        try {
          const meta = JSON.parse(p.metadata);
          if (meta.agentName) agentName = meta.agentName;
        } catch {}
      }
    }

    console.log(`[Agent] Persona: ${agentName} | Session: ${sessionId}`);
    await upsertSession(sessionId, agentName);

    // ── Persona voice + role mapping ─────────────────────────────────────────
    const personaMap: Record<string, { voice: string; role: string; instructions: string }> = {
      Aria: {
        voice: 'Kore',
        role: 'Strategic Coordinator',
        instructions: 'Your ONLY goal is to qualify the visitor and schedule a live demo. Ask ONE question at a time. Gather name, email, phone (optional), and service interest. Always use getAvailableSlots before proposing a time. Confirm all details before calling bookDemo.',
      },
      Cortex: {
        voice: 'Puck',
        role: 'L3 Support Engineer',
        instructions: 'Help users troubleshoot issues. Ask for error codes or symptoms. Be concise. For complex or unresolvable issues, use createTicket. For critical issues (system down, ransomware), call escalateToHuman immediately. Never guess a technical fix if unsure.',
      },
      Max: {
        voice: 'Charon',
        role: 'Senior Solutions Architect',
        instructions: 'Answer complex technical questions about cybersecurity, cloud, networking, and infrastructure. Use getKnowledge before quoting specs. Recommend enterprise solutions. Offer to connect to a human engineer via bookDemo for complex scoping.',
      },
      Nexus: {
        voice: 'Growth Intelligence',
        role: 'Growth Intelligence',
        instructions: 'Analyze sales velocity and lead quality. Provide growth insights and strategic recommendations for the admin team.',
      },
    };

    const persona = personaMap[agentName] ?? {
      voice: 'Aoede',
      role: 'Executive Concierge',
      instructions: 'Greet visitors and understand their IT needs. Use getAvailableSlots to show real open times. Confirm all details before booking. Use getKnowledge before answering any pricing or feature questions.',
    };

    // ── Service catalog summary for voice (compact) ───────────────────────────
    const catalogSummary = buildVoiceCatalogSummary(agentName);

    const systemInstruction = `You are ${agentName}, the ${persona.role} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.

CORE BEHAVIORS:
1. Multilingual: Detect the user's language (English or Spanish) and respond in the same language.
2. Voice format: You are speaking aloud. No markdown, no bullet points, no numbered lists. Keep sentences short and natural. Pause between thoughts.
3. Zero Hallucination: Use getKnowledge before answering pricing, feature, or SLA questions. If no data found, say: "${KNOWLEDGE_FALLBACK_VOICE}"
4. Tool Confirmation: Before calling bookDemo, verbally confirm all details and wait for the user to say "yes" or "confirm".
5. Escalation: If the user asks for a human or expresses frustration, call escalateToHuman immediately.

SERVICES OVERVIEW (for quick reference — always use getKnowledge for specific pricing):
${catalogSummary}

ROLE-SPECIFIC INSTRUCTIONS:
${persona.instructions}`;

    // ── Start Gemini multimodal agent ────────────────────────────────────────
    const model = new beta.realtime.RealtimeModel({
      model: 'models/gemini-2.0-flash-exp',
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
      voice: persona.voice,
      instructions: systemInstruction,
    });

    const agent = new voice.Agent({
      instructions: systemInstruction,
      llm: model,
      tools,
    });

    const session = new voice.AgentSession({
      llm: model,
    });

    // ── Transcript telemetry ──────────────────────────────────────────────────
    session.on(voice.AgentSessionEventTypes.UserInputTranscribed, (ev) => {
      if (ev.isFinal && ev.transcript) {
        console.log(`[Agent] User: ${ev.transcript}`);
        logToSupabase(sessionId, 'user', ev.transcript, agentName);
      }
    });

    session.on(voice.AgentSessionEventTypes.ConversationItemAdded, (ev) => {
      const item = ev.item as any;
      if (item.role === 'assistant') {
        const text = Array.isArray(item.content)
          ? item.content.map((c: any) => typeof c === 'string' ? c : c.text).filter(Boolean).join(' ')
          : item.content || '';
        if (text) {
          console.log(`[Agent] ${agentName}: ${text}`);
          logToSupabase(sessionId, 'agent', text, agentName);
        }
      }
    });

    await session.start({ agent, room: ctx.room });
    logToSupabase(sessionId, 'agent', `[Voice session started. Agent: ${agentName}]`, agentName);
  },
});

// ── Register worker with a stable agent name for dispatch ─────────────────────
// The name 'kooltech-workforce' matches what token/route.ts dispatches to.
cli.runApp(new WorkerOptions({ agent: __filename, agentName: 'kooltech-workforce' }));
