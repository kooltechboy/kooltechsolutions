import { WorkerOptions, cli, defineAgent, llm } from '@livekit/agents';
// @ts-ignore
import { multimodal } from '@livekit/agents-plugin-google';
import * as dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { buildVoiceCatalogSummary } from '../lib/knowledge/catalog';
import { KNOWLEDGE_FALLBACK_VOICE } from '../lib/knowledge/retrieve';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

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
class AgentTools extends llm.FunctionContext {

  @llm.aiCallable({ description: 'Schedule a live demo or consultation. ALWAYS confirm details with the user before calling this.' })
  async bookDemo(
    @llm.aiParam({ description: "Client's full name" }) name: string,
    @llm.aiParam({ description: "Client's email address" }) email: string,
    @llm.aiParam({ description: 'Service they are interested in' }) service: string,
    @llm.aiParam({ description: 'Date for the demo (e.g. June 15)' }) date: string,
    @llm.aiParam({ description: 'Time for the demo (e.g. 10:00 AM)' }) time: string,
    @llm.aiParam({ description: "Client's phone number", required: false }) phone?: string,
    @llm.aiParam({ description: 'Additional notes', required: false }) message?: string
  ) {
    const first_name = name.split(' ')[0] || 'Unknown';
    const last_name = name.split(' ').slice(1).join(' ') || '-';
    const bookingNote = `LIVE DEMO SCHEDULED: ${date} at ${time}`;

    const { data, error } = await supabase
      .from('leads')
      .insert({
        first_name,
        last_name,
        email,
        phone: phone || null,
        service_interest: service,
        notes: `${bookingNote}\n\nClient Message: ${message || 'None'}`,
        status: 'qualified',
      })
      .select('id')
      .single();

    if (error) return `Error booking demo: ${error.message}`;

    // Send admin email alert
    if (process.env.RESEND_API_KEY) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'KoolTech AI Voice <onboarding@resend.dev>',
          to: [process.env.ADMIN_NOTIFICATION_EMAIL ?? 'sales@kooltechsolutions.com'],
          subject: `🎙️ Voice Agent Lead: ${name}`,
          html: `<h2>Voice Agent Booking</h2>
            <p><strong>Agent:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Service:</strong> ${service}</p>
            <p><strong>Slot:</strong> ${date} at ${time}</p>`,
        });
      } catch (e) {
        console.error('[Agent] Email error:', e);
      }
    }

    return `Demo booked successfully. Booking ID: ${data.id}. Confirmation sent to ${email}.`;
  }

  @llm.aiCallable({ description: 'Get available booking slots for the next N days.' })
  async getAvailableSlots(
    @llm.aiParam({ description: 'Number of days ahead to check (1-14)', required: false }) days?: number
  ) {
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

  @llm.aiCallable({ description: 'Check if a specific date has booked slots.' })
  async checkAvailability(
    @llm.aiParam({ description: "Date to check (e.g. 'June 15')" }) date: string
  ) {
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

  @llm.aiCallable({ description: 'Check the status of an existing support ticket.' })
  async checkTicketStatus(
    @llm.aiParam({ description: 'The ticket ID' }) ticketId: string
  ) {
    const { data, error } = await supabase
      .from('tickets')
      .select('status, subject, priority')
      .eq('id', ticketId)
      .single();
    if (error) return `Ticket not found: ${error.message}`;
    return `Ticket "${data.subject}" — Status: ${data.status.toUpperCase()}, Priority: ${data.priority}.`;
  }

  @llm.aiCallable({ description: 'Create a support ticket for an issue.' })
  async createTicket(
    @llm.aiParam({ description: 'Brief summary of the issue' }) subject: string,
    @llm.aiParam({ description: 'Detailed description of the problem' }) description: string,
    @llm.aiParam({ description: 'Priority: low, normal, high, or critical' }) priority: string
  ) {
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

  @llm.aiCallable({ description: 'Retrieve verified information from the KoolTech knowledge base. Call before answering pricing, features, or SLA questions.' })
  async getKnowledge(
    @llm.aiParam({ description: 'The specific question or topic to look up' }) query: string
  ) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const res = await fetch(`${baseUrl}/api/ai-workforce/v1`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Knowledge lookup: ${query}` }],
          agentName: 'Kira',
          sessionId: 'voice-kb-lookup',
        }),
      });
      // For voice, return a simple fallback since we can't stream
      return KNOWLEDGE_FALLBACK_VOICE;
    } catch {
      return KNOWLEDGE_FALLBACK_VOICE;
    }
  }

  @llm.aiCallable({ description: 'Escalate the call to a human agent. Use when user requests human, has a critical issue, or is frustrated.' })
  async escalateToHuman(
    @llm.aiParam({ description: 'Clear reason for escalation' }) reason: string,
    @llm.aiParam({ description: 'Priority: low, normal, high, critical' }) priority: string,
    @llm.aiParam({ description: '2-3 sentence summary for the human agent' }) summary: string,
    @llm.aiParam({ description: "Client's name if known", required: false }) clientName?: string,
    @llm.aiParam({ description: "Client's email if known", required: false }) clientEmail?: string
  ) {
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
}

// ── Agent Definition ──────────────────────────────────────────────────────────
export default defineAgent({
  entry: async (ctx) => {
    await ctx.connect();
    console.log(`[Agent] Connected to room: ${ctx.room.name}`);

    const sessionId = ctx.room.name.replace(/^room-/, '') || ctx.room.name;
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
        voice: 'Fenrir',
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
    const agent = new multimodal.MultimodalAgent({
      model: 'models/gemini-2.0-flash-exp',
      fncCtx: new AgentTools(),
    });

    agent.updateSessionOptions({
      systemInstruction,
      voice: { prebuiltVoiceConfig: { voiceName: persona.voice } },
    });

    // ── Transcript telemetry ──────────────────────────────────────────────────
    agent.on('input_speech_transcription_completed', (transcription: any) => {
      const text = transcription?.transcript || transcription || '';
      if (text) {
        console.log(`[Agent] User: ${text}`);
        logToSupabase(sessionId, 'user', text, agentName);
      }
    });

    let agentBuffer = '';
    agent.on('agent_started_speaking', () => { agentBuffer = ''; });
    agent.on('response_output_added', (output: any) => {
      const text = output?.text || output?.content || '';
      if (text) agentBuffer += (agentBuffer ? ' ' : '') + text;
    });
    agent.on('agent_stopped_speaking', () => {
      if (agentBuffer.trim()) {
        console.log(`[Agent] ${agentName}: ${agentBuffer.slice(0, 100)}...`);
        logToSupabase(sessionId, 'agent', agentBuffer, agentName);
        agentBuffer = '';
      }
    });

    agent.start(ctx.room);
    logToSupabase(sessionId, 'agent', `[Voice session started. Agent: ${agentName}]`, agentName);
  },
});

// ── Register worker with a stable agent name for dispatch ─────────────────────
// The name 'kooltech-workforce' matches what token/route.ts dispatches to.
cli.runApp(new WorkerOptions({ agent: __filename, agentName: 'kooltech-workforce' }));
