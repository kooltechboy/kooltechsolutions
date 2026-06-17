import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { createClient } from "@/utils/supabase/server";
import { rateLimitAsync, getClientIp } from "@/lib/rateLimit";
import { aiChatSchema } from "@/lib/validation";
import { validationError, serverError, rateLimitError } from "@/lib/errors";
import { buildCatalogContext } from "@/lib/knowledge/catalog";
import {
  retrieveRelevantKnowledge,
  formatKnowledgeContext,
  KNOWLEDGE_FALLBACK_TEXT,
} from "@/lib/knowledge/retrieve";
import { z } from "zod";
import { Resend } from "resend";
import { createCalendarEvent } from "@/lib/calendar/google";
import { generateIcsInvite } from "@/lib/calendar/ics";

export const runtime = "nodejs";

// ── Telemetry ─────────────────────────────────────────────────────────────────
async function logConversation(
  sessionId: string,
  role: "user" | "agent",
  content: string,
  agentName: string
) {
  return; // Disabled AI Workforce telemetry database writes
}

// ── Session tracking ──────────────────────────────────────────────────────────
async function upsertSession(
  sessionId: string,
  agentName: string,
  channel: string,
  pathname: string | undefined
) {
  return; // Disabled AI Workforce session tracking database writes
}

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

export async function POST(req: Request) {
  // ── Rate limiting (Upstash Redis when available, in-memory fallback) ───────
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`ai-chat:${ip}`, { limit: 30, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { messages, agentName, agentRole, context, sessionId } = parsed.data;
    const resolvedAgentName = agentName ?? "Kira";
    const resolvedSessionId = sessionId ?? `anon-${Date.now()}`;

    // ── Auth check for restricted agents ─────────────────────────────────────
    const restrictedAgents = ["Cortex", "Nexus"];
    let userContext = null;

    if (agentName && restrictedAgents.includes(agentName)) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        const { NextResponse } = await import("next/server");
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      userContext = user;
    }

    // ── RAG: retrieve relevant knowledge for the user's query ─────────────────
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    let knowledgeContext = "";

    if (lastUserMessage?.content) {
      const chunks = await retrieveRelevantKnowledge(
        typeof lastUserMessage.content === "string"
          ? lastUserMessage.content
          : "",
        { matchCount: 5, threshold: 0.65 }
      );
      knowledgeContext = formatKnowledgeContext(chunks);
    }

    // ── Service catalog context injection (GAP-05 fix) ────────────────────────
    const catalogContext = buildCatalogContext(resolvedAgentName);

    // ── Build system instruction ──────────────────────────────────────────────
    let systemInstruction = `You are ${resolvedAgentName}, the ${agentRole ?? "AI Assistant"} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.
Current page context: ${JSON.stringify(context ?? {})}

CORE BEHAVIORS:
1. Multilingual Support: You fluently understand and speak English and Spanish. Detect the user's language and respond naturally in the same language. If they switch, you switch.
2. Zero Hallucination Policy: You MUST only provide information grounded in the service catalog or retrieved knowledge below. If you don't have verified information, use this EXACT phrase: "${KNOWLEDGE_FALLBACK_TEXT}"
3. Guardrails: You ONLY provide support and scheduling for approved services. Do not discuss competitors, unrelated tech, or make up capabilities.
4. Tool Confirmation (R03): BEFORE executing bookDemo, you MUST verbally summarize details and ask for explicit confirmation.

${catalogContext}
${knowledgeContext}
`;

    // ── Persona-specific instructions ─────────────────────────────────────────
    if (agentName === "Aria") {
      systemInstruction += `
PERSONALITY: Warm, hyper-organized, proactive. Strategic Coordinator.
CORE MISSION:
- Your ONLY goal is to qualify the visitor and schedule a live demo.
- Ask ONE question at a time. Do not write long paragraphs.
- Gather name, email, phone (optional), service interest, date, and time.
- Use checkAvailability before proposing a time slot.
- Use getAvailableSlots to show real open times when asked.
- ALWAYS confirm details before calling bookDemo.`;
    } else if (agentName === "Cortex") {
      systemInstruction += `
PERSONALITY: Analytical, precise, reassuring. L3 Support Engineer.
CORE MISSION:
- Help authenticated users troubleshoot issues.
- Capture: affected system, error message, when it started, how many users affected.
- If complex or unresolvable, createTicket immediately. Never guess if unsure.
- For critical issues (system down, ransomware), escalateToHuman IMMEDIATELY.`;
    } else if (agentName === "Max") {
      systemInstruction += `
PERSONALITY: Confident, highly technical, solution-oriented. Senior Solutions Architect.
CORE MISSION:
- Answer complex technical questions about cybersecurity, cloud, networking, infrastructure.
- Recommend best-in-class enterprise solutions from our catalog.
- Offer to connect to a human engineer via bookDemo for complex scoping.`;
    } else if (agentName === "Nexus") {
      systemInstruction += `
PERSONALITY: Strategic, data-driven, sharp. Growth Intelligence operator.
CORE MISSION:
- Analyze lead quality, sales velocity, and growth opportunities.
- Help the admin team understand metrics and pipeline patterns.
- Provide actionable lead prioritization recommendations.`;
    } else {
      systemInstruction += `
PERSONALITY: Professional, warm, and engaging — never robotic. Use at most one subtle emoji per response.
CORE MISSION:
- Greet visitors, understand their IT needs, qualify their interest.
- If they want to schedule a demo, use bookDemo (with confirmation first).
- Use getAvailableSlots to show them real open time slots.`;
    }

    // ── Track session ─────────────────────────────────────────────────────────
    upsertSession(resolvedSessionId, resolvedAgentName, "text", context?.pathname);

    // ── Log user message ──────────────────────────────────────────────────────
    if (lastUserMessage?.content) {
      logConversation(
        resolvedSessionId,
        "user",
        typeof lastUserMessage.content === "string" ? lastUserMessage.content : "",
        resolvedAgentName
      );
    }

    // ── Stream response with tools ────────────────────────────────────────────
    const result = streamText({
      model: google("gemini-2.0-flash") as any,
      system: systemInstruction,
      messages,
      tools: {
        // ── Booking & Availability ──────────────────────────────────────────
        bookDemo: tool({
          description:
            "Schedule a live demo or consultation. MUST confirm with user before calling.",
          parameters: z.object({
            name: z.string().describe("Client's full name"),
            email: z.string().email().describe("Client's email address"),
            phone: z.string().optional().describe("Client's phone number"),
            service: z.string().describe("Service they are interested in"),
            date: z.string().describe("Date for the demo (e.g. 'June 15, 2026')"),
            time: z.string().describe("Time for the demo (e.g. '10:00 AM AST')"),
            scheduledAt: z
              .string()
              .optional()
              .describe("ISO 8601 UTC datetime if known (e.g. '2026-06-15T14:00:00Z')"),
            message: z.string().optional().describe("Additional notes from the client"),
          }),
          execute: async (params: any) => {
            const supabase = await createClient();
            const first_name = params.name.split(" ")[0] || "Unknown";
            const last_name = params.name.split(" ").slice(1).join(" ") || "-";

            let scheduled_at_date: Date;
            try {
              if (params.scheduledAt) {
                scheduled_at_date = new Date(params.scheduledAt);
              } else {
                scheduled_at_date = parseBookingDateTime(params.date, params.time);
              }
            } catch (err) {
              console.warn("[bookDemo] Date parsing failed, defaulting to tomorrow:", err);
              scheduled_at_date = new Date(Date.now() + 24 * 60 * 60 * 1000);
            }

            // ── Google Calendar Sync ─────────────────────────────────────────────────
            const { googleEventId, meetingLink } = await createCalendarEvent({
              name: params.name,
              email: params.email,
              service: params.service,
              scheduledAt: scheduled_at_date.toISOString(),
              notes: params.message || "",
            });

            // Try to insert into proper bookings table first, fall back to leads
            let bookingId: string | null = null;

            const { data: booking, error: bookingError } = await supabase
              .from("bookings")
              .insert({
                first_name,
                last_name,
                email: params.email,
                phone: params.phone || null,
                service_interest: params.service,
                notes: params.message || null,
                scheduled_at: scheduled_at_date.toISOString(),
                status: "confirmed",
                booked_via: "ai_agent",
                agent_name: resolvedAgentName,
                session_id: resolvedSessionId,
                google_event_id: googleEventId,
                meeting_link: meetingLink,
              })
              .select("id")
              .single();

            if (!bookingError) bookingId = booking?.id;

            // Always create a CRM lead record
            const bookingNote = `LIVE DEMO SCHEDULED: ${params.date} at ${params.time}`;
            const meetingNote = meetingLink ? `\nMeeting Link: ${meetingLink}` : "";
            const { data: lead, error: leadError } = await supabase
              .from("leads")
              .insert({
                first_name,
                last_name,
                email: params.email,
                phone: params.phone || null,
                service_interest: params.service,
                notes: `${bookingNote}${meetingNote}\n\nClient Message: ${params.message || "None"}`,
                status: "qualified",
              })
              .select("id")
              .single();

            if (leadError)
              return { success: false, error: leadError.message };

            // Email alerts
            if (process.env.RESEND_API_KEY) {
              try {
                const resend = new Resend(process.env.RESEND_API_KEY);
                const adminEmail =
                  process.env.ADMIN_NOTIFICATION_EMAIL ??
                  "sales@kooltechsolutions.com";

                const resolvedBookingId = bookingId ?? lead.id;

                const icsContent = generateIcsInvite({
                  id: resolvedBookingId,
                  name: params.name,
                  email: params.email,
                  service: params.service,
                  scheduledAt: scheduled_at_date.toISOString(),
                  meetingLink,
                  notes: params.message || "",
                });

                const attachments = [
                  {
                    filename: "invite.ics",
                    content: Buffer.from(icsContent),
                  },
                ];

                await resend.emails.send({
                  from: "KoolTech AI <onboarding@resend.dev>",
                  to: [adminEmail],
                  subject: `🚀 New AI Lead: ${params.name}`,
                  html: `<h2>New Lead — Booked by ${resolvedAgentName}</h2>
                    <p><strong>Name:</strong> ${params.name}</p>
                    <p><strong>Email:</strong> ${params.email}</p>
                    <p><strong>Phone:</strong> ${params.phone || "N/A"}</p>
                    <p><strong>Service:</strong> ${params.service}</p>
                    <p><strong>Slot:</strong> ${params.date} at ${params.time}</p>
                    ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
                    <p><strong>Notes:</strong> ${params.message || "None"}</p>`,
                  attachments,
                });

                await resend.emails.send({
                  from: "KoolTech Solutions <onboarding@resend.dev>",
                  to: [params.email],
                  subject: `Confirmed: Your KoolTech Solutions Demo`,
                  html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                      <h2 style="color: #00d4ff;">Demo Confirmed!</h2>
                      <p>Hi ${params.name},</p>
                      <p>Your live platform demo with KoolTech Solutions is confirmed for:</p>
                      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${params.date} at ${params.time}</p>
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
                console.error("[bookDemo] Email error:", e);
              }
            }

            return {
              success: true,
              bookingId: bookingId ?? lead.id,
              message: "Demo booked successfully. Confirmation email sent.",
            };
          },
        } as any),

        getAvailableSlots: tool({
          description:
            "Get real available booking slots for the next N days. Call this when the user asks 'when are you available?' or wants to pick a time.",
          parameters: z.object({
            days: z
              .number()
              .min(1)
              .max(14)
              .default(7)
              .describe("Number of days ahead to check"),
          }),
          execute: async ({ days }: { days: number }) => {
            try {
              const url = new URL(
                `/api/bookings/slots?days=${days}`,
                process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
              );
              const res = await fetch(url.toString());
              if (!res.ok) return { error: "Could not fetch availability" };
              const data = await res.json();

              // Return a human-readable summary (first 10 slots)
              const slots = (data.availableSlots ?? []).slice(0, 10);
              return {
                timezone: data.timezone,
                slots: slots.map((s: any) => ({
                  date: s.date,
                  time: s.time,
                  utc: s.utc,
                })),
                moreAvailable: (data.totalAvailable ?? 0) > 10,
              };
            } catch {
              return { error: "Availability service unavailable" };
            }
          },
        } as any),

        checkAvailability: tool({
          description: "Check if a specific date has any booked slots.",
          parameters: z.object({
            date: z.string().describe("The date to check (e.g. 'June 15')"),
          }),
          execute: async ({ date }: { date: string }) => {
            const supabase = await createClient();
            const { data, error } = await supabase
              .from("leads")
              .select("notes")
              .ilike("notes", `%LIVE DEMO SCHEDULED: ${date}%`);
            if (error) return { bookedSlots: [] };
            const bookedSlots = data
              .map((lead) => {
                const match = lead.notes?.match(/at\s+(.+)$/m);
                return match ? match[1].trim() : null;
              })
              .filter(Boolean);
            return { bookedSlots };
          },
        } as any),

        // ── Tickets & Support ───────────────────────────────────────────────
        createTicket: tool({
          description:
            "Create a support ticket for an authenticated user's issue.",
          parameters: z.object({
            subject: z.string().describe("Brief summary of the issue"),
            description: z.string().describe("Detailed problem description"),
            priority: z
              .enum(["low", "normal", "high", "critical"])
              .describe("Priority level"),
          }),
          execute: async (params: any) => {
            if (!userContext)
              return {
                success: false,
                error: "User not authenticated. Cannot create ticket.",
              };
            const supabase = await createClient();
            const { data, error } = await supabase
              .from("tickets")
              .insert({
                subject: params.subject,
                description: params.description,
                priority: params.priority,
                client_id: userContext.id,
                status: "open",
              })
              .select("id")
              .single();
            if (error) return { success: false, error: error.message };
            return {
              success: true,
              ticketId: data.id,
              message: `Ticket created (ID: ${data.id}). Priority: ${params.priority}.`,
            };
          },
        } as any),

        checkTicketStatus: tool({
          description: "Check the status of an existing support ticket by ID.",
          parameters: z.object({
            ticketId: z.string().describe("The ticket ID to look up"),
          }),
          execute: async ({ ticketId }: { ticketId: string }) => {
            const supabase = await createClient();
            const { data, error } = await supabase
              .from("tickets")
              .select("status, subject, priority, created_at")
              .eq("id", ticketId)
              .single();
            if (error) return { success: false, error: "Ticket not found." };
            return { success: true, ...data };
          },
        } as any),

        updateTicketPriority: tool({
          description: "Update the priority of an existing support ticket.",
          parameters: z.object({
            ticketId: z.string().describe("The ticket ID"),
            priority: z
              .enum(["low", "normal", "high", "critical"])
              .describe("New priority level"),
          }),
          execute: async ({ ticketId, priority }: any) => {
            if (!userContext)
              return { success: false, error: "Not authenticated." };
            const supabase = await createClient();
            const { error } = await supabase
              .from("tickets")
              .update({ priority })
              .eq("id", ticketId);
            if (error) return { success: false, error: error.message };
            return {
              success: true,
              message: `Ticket ${ticketId} priority updated to ${priority}.`,
            };
          },
        } as any),

        // ── Account / Portal Tools ──────────────────────────────────────────
        fetchInvoices: tool({
          description:
            "Fetch invoices for the authenticated user filtered by status.",
          parameters: z.object({
            status: z
              .enum(["outstanding", "paid", "draft", "overdue", "void", "all"])
              .describe("Invoice status filter"),
          }),
          execute: async ({ status }: any) => {
            if (!userContext)
              return { success: false, error: "Not authenticated." };
            const supabase = await createClient();
            let query = supabase
              .from("invoices")
              .select("invoice_number, amount, status, due_date")
              .eq("client_id", userContext.id);
            if (status !== "all") query = query.eq("status", status);
            const { data, error } = await query;
            if (error) return { success: false, error: error.message };
            return { success: true, invoices: data };
          },
        } as any),

        fetchServices: tool({
          description: "Fetch active services/subscriptions for the authenticated user.",
          parameters: z.object({}),
          execute: async () => {
            if (!userContext)
              return { success: false, error: "Not authenticated." };
            const supabase = await createClient();
            const { data, error } = await supabase
              .from("client_services")
              .select("service_name, status, next_billing_date")
              .eq("client_id", userContext.id);
            if (error) return { success: false, error: error.message };
            return { success: true, services: data };
          },
        } as any),

        // ── Knowledge Retrieval (RAG) ────────────────────────────────────────
        getKnowledge: tool({
          description:
            "Retrieve verified information from the KoolTech knowledge base. " +
            "Call this BEFORE answering any question about pricing, features, SLAs, " +
            "compliance, or technical specifications. Returns empty if no match found.",
          parameters: z.object({
            query: z
              .string()
              .describe("The specific question or topic to look up"),
            source: z
              .enum(["service_catalog", "faq", "policy", "any"])
              .optional()
              .default("any")
              .describe("Restrict to a specific knowledge source"),
          }),
          execute: async ({ query, source }: any) => {
            const chunks = await retrieveRelevantKnowledge(query, {
              matchCount: 3,
              threshold: 0.6,
              sourceFilter: source === "any" ? undefined : source,
            });

            if (chunks.length === 0) {
              return {
                found: false,
                fallback: KNOWLEDGE_FALLBACK_TEXT,
              };
            }

            return {
              found: true,
              results: chunks.map((c) => ({
                source: c.source,
                title: c.title,
                content: c.content,
                confidence: Math.round(c.similarity * 100),
              })),
            };
          },
        } as any),

        // ── Human Escalation ────────────────────────────────────────────────
        escalateToHuman: tool({
          description:
            "Escalate the conversation to a live human agent. Call this when: " +
            "(1) user explicitly requests a human, (2) critical issue is detected, " +
            "(3) complexity exceeds your scope, (4) user is frustrated or angry. " +
            "Always acknowledge the user BEFORE calling this tool.",
          parameters: z.object({
            reason: z
              .string()
              .describe("Clear one-line reason for escalation"),
            priority: z
              .enum(["low", "normal", "high", "critical"])
              .default("high"),
            summary: z
              .string()
              .describe(
                "3-5 sentence summary of the conversation for the human agent"
              ),
            userContact: z
              .object({
                name: z.string().optional(),
                email: z.string().optional(),
                phone: z.string().optional(),
              })
              .optional(),
          }),
          execute: async (params: any) => {
            try {
              const baseUrl =
                process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
              const res = await fetch(`${baseUrl}/api/ai-workforce/escalate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sessionId: resolvedSessionId,
                  agentName: resolvedAgentName,
                  channel: "text",
                  reason: params.reason,
                  priority: params.priority,
                  summary: params.summary,
                  userContact: params.userContact,
                  conversationContext: messages
                    .slice(-10)
                    .map((m: any) => `${m.role}: ${m.content}`)
                    .join("\n"),
                }),
              });

              if (!res.ok) throw new Error("Escalation API error");
              const data = await res.json();

              return {
                success: true,
                escalationId: data.escalationId,
                message:
                  "Human agent notified. They have your full conversation history.",
              };
            } catch {
              return {
                success: false,
                message:
                  "Our escalation system is temporarily unavailable. " +
                  "Please contact us directly at support@kooltechsolutions.com",
              };
            }
          },
        } as any),
      } as any,

      onFinish: async ({ text }) => {
        if (text?.trim()) {
          logConversation(resolvedSessionId, "agent", text, resolvedAgentName);
        }
      },
    });

    return (
      (result as any).toDataStreamResponse
        ? (result as any).toDataStreamResponse()
        : (result as any).toTextStreamResponse()
    );
  } catch (err) {
    return serverError(err, "ai-chat");
  }
}
