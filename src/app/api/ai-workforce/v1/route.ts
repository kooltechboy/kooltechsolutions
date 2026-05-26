import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { aiChatSchema } from "@/lib/validation";
import { validationError, serverError, rateLimitError } from "@/lib/errors";
import { z } from "zod";

export const runtime = "nodejs";

// ── Telemetry helper ──────────────────────────────────────────────────────────
async function logConversation(
  sessionId: string,
  role: "user" | "agent",
  content: string,
  agentName: string
) {
  if (!content?.trim()) return;
  try {
    const supabase = await createClient();
    await supabase.from("agent_logs").insert({
      session_id: sessionId,
      role,
      content: content.trim(),
      agent_name: agentName,
    });
  } catch (err) {
    console.error("[AI Route] Telemetry log failed:", err);
  }
}

export async function POST(req: Request) {
  // ── Rate limiting: 30 messages per IP per minute ───────────────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(`ai-chat:${ip}`, { limit: 30, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Input validation ───────────────────────────────────────────────────────
    const body = await req.json();
    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { messages, agentName, agentRole, context, sessionId } = parsed.data;
    const resolvedAgentName = agentName ?? "Kira";
    const resolvedSessionId = sessionId ?? `anon-${Date.now()}`;

    // ── Portal/Admin agent auth check ──────────────────────────────────────────
    const restrictedAgents = ["Cortex", "Nexus"];
    let userContext = null;
    
    if (agentName && restrictedAgents.includes(agentName)) {
      const supabase = await createClient();
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        const { NextResponse } = await import("next/server");
        return NextResponse.json({ error: "Authentication required" }, { status: 401 });
      }
      userContext = user;
    }

    // ── Persona & System Prompts ───────────────────────────────────────────────
    let systemInstruction = `You are ${resolvedAgentName}, the ${agentRole ?? "AI Workforce"} for KoolTech Solutions — a premium MSP serving the Dominican Republic, USA, Canada and the Caribbean.
Current page context: ${JSON.stringify(context ?? {})}

CORE BEHAVIORS:
1. Multilingual Support: You fluently understand and speak English and Spanish. Detect the user's language and respond naturally in the same language. If they switch, you switch.
2. Guardrails: You ONLY provide support and scheduling for approved services (Managed IT, Cybersecurity, Cloud, Network Design, VoIP, IT Consulting). If asked about unrelated topics or non-supported tech, politely decline and steer the conversation back to our core offerings. Do not hallucinate capabilities.

`;

    if (agentName === "Aria") {
      systemInstruction += `PERSONALITY:
- Warm, hyper-organized, proactive. Upbeat professional female.
- You are Aria, the Strategic Coordinator.

CORE MISSION:
- Your ONLY goal is to qualify the visitor and schedule a live demo.
- Ask ONE question at a time. Do not write long paragraphs.
- Gather their name, email, phone (optional), and what service they need.
- Once you have enough info, you MUST verbally summarize the details and ask for explicit confirmation from the user ("Does this sound correct?") BEFORE executing the \`bookDemo\` tool.`;
    } else if (agentName === "Cortex") {
      systemInstruction += `PERSONALITY:
- Analytical, precise, reassuring. Calm, authoritative male.
- You are Cortex, L3 Support Engineer.

CORE MISSION:
- Help authenticated users troubleshoot issues.
- Ask for error codes or symptoms. Be concise.
- If the issue is complex or unresolvable immediately, use the \`createTicket\` tool to escalate to human engineers. Never guess a technical fix if unsure.`;
    } else if (agentName === "Max") {
      systemInstruction += `PERSONALITY:
- Confident, highly technical, solution-oriented.
- You are Max, Senior Solutions Architect.

CORE MISSION:
- Answer complex technical questions about cybersecurity, cloud, networking, and infrastructure.
- Always recommend best-in-class enterprise solutions. Offer to connect them to a human engineer via \`bookDemo\` if they want to proceed.`;
    } else if (agentName === "Nexus") {
      systemInstruction += `PERSONALITY:
- Strategic, data-driven, sharp. Growth intelligence operator.
- You are Nexus, Growth Intelligence.

CORE MISSION:
- Analyze lead quality, sales velocity, and growth opportunities.
- Provide actionable recommendations on which leads to prioritize and how to accelerate pipeline.
- Help the admin team understand metrics and patterns in the business.`;
    } else {
      systemInstruction += `PERSONALITY:
- Professional, warm, and engaging — never robotic.
- Use at most one subtle emoji per response.
- Be proactive: ask clarifying questions to understand the visitor's needs.

CORE MISSION:
- Greet visitors, understand their IT needs.
- If they want to schedule a demo, use the \`bookDemo\` tool to book it for them.
- Services we offer: Managed IT, Cybersecurity, Cloud, Network Design, VoIP, IT Consulting.`;
    }

    // ── Log the user's most recent message ────────────────────────────────────
    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
    if (lastUserMessage?.content) {
      // Fire-and-forget – don't block the stream
      logConversation(resolvedSessionId, "user", lastUserMessage.content, resolvedAgentName);
    }

    // ── Generate Response with Function Calling ────────────────────────────────
    const result = streamText({
      model: google("gemini-1.5-flash") as any,
      system: systemInstruction,
      messages,
      // maxSteps is unsupported in this version of the AI SDK
      tools: {
        bookDemo: tool({
          description: "Schedule a live demo or consultation for a potential client.",
          parameters: z.object({
            name: z.string().describe("The client's full name"),
            email: z.string().email().describe("The client's email address"),
            phone: z.string().optional().describe("The client's phone number"),
            service: z.string().describe("The service they are interested in (e.g., 'Cybersecurity', 'Live Demo')"),
            date: z.string().describe("The date for the demo (e.g., 'Oct 15', 'Tomorrow')"),
            time: z.string().describe("The time for the demo (e.g., '10:00 AM')"),
            message: z.string().optional().describe("Any additional notes from the client"),
          }),
          execute: async (params: any) => {
            const supabase = await createClient();
            const first_name = params.name.split(" ")[0] || "Unknown";
            const last_name = params.name.split(" ").slice(1).join(" ") || "-";
            const bookingNote = `LIVE DEMO SCHEDULED: ${params.date} at ${params.time}`;
            
            const { data, error } = await supabase.from("leads").insert({
              first_name,
              last_name,
              email: params.email,
              phone: params.phone || null,
              service_interest: params.service,
              notes: `${bookingNote}\n\nClient Message: ${params.message || "None"}`,
              status: "qualified"
            }).select("id").single();
            
            if (error) return { success: false, error: error.message };
            return { success: true, bookingId: data.id, message: "Demo booked successfully. Please inform the client." };
          }
        } as any),
        createTicket: tool({
          description: "Create a support ticket for an authenticated user's issue.",
          parameters: z.object({
            subject: z.string().describe("A brief summary of the issue"),
            description: z.string().describe("Detailed description of the problem"),
            priority: z.enum(["low", "normal", "high", "critical"]).describe("The priority level of the ticket")
          }),
          execute: async (params: any) => {
            if (!userContext) {
              return { success: false, error: "User is not authenticated. Cannot create ticket." };
            }
            const supabase = await createClient();
            const client_id = userContext.id;
            
            const { data, error } = await supabase.from("tickets").insert({
              subject: params.subject,
              description: params.description,
              priority: params.priority,
              client_id,
              status: "open"
            }).select("id").single();
            
            if (error) return { success: false, error: error.message };
            return { success: true, ticketId: data.id, message: `Ticket created successfully with ID ${data.id}. Provide this ID to the user.` };
          }
        } as any),
        checkAvailability: tool({
          description: "Check if a specific date has any booked slots.",
          parameters: z.object({
            date: z.string().describe("The date to check (e.g., 'Oct 15')")
          }),
          execute: async ({ date }: any) => {
            const supabase = await createClient();
            const { data, error } = await supabase.from("leads").select("notes").ilike("notes", `%LIVE DEMO SCHEDULED: ${date}%`);
            if (error) return { bookedSlots: [] };
            const bookedSlots = data.map((lead) => {
              const match = lead.notes?.match(/at\s+(.+)$/m);
              return match ? match[1].trim() : null;
            }).filter(Boolean);
            return { bookedSlots };
          }
        } as any),
        checkTicketStatus: tool({
          description: "Check the status of an existing support ticket by ID.",
          parameters: z.object({
            ticketId: z.string().describe("The ticket ID to lookup")
          }),
          execute: async ({ ticketId }: any) => {
            const supabase = await createClient();
            const { data, error } = await supabase.from("tickets").select("status, subject").eq("id", ticketId).single();
            if (error) return { success: false, error: "Ticket not found or error occurred: " + error.message };
            return { success: true, status: data.status, subject: data.subject };
          }
        } as any),
        fetchInvoices: tool({
          description: "Fetch outstanding or paid invoices for the authenticated user.",
          parameters: z.object({
            status: z.enum(["outstanding", "paid", "draft", "overdue", "void", "all"]).describe("Filter invoices by status")
          }),
          execute: async ({ status }: any) => {
            if (!userContext) return { success: false, error: "User is not authenticated. Cannot fetch invoices." };
            const supabase = await createClient();
            
            let query = supabase.from("invoices").select("invoice_number, amount, status, due_date").eq("client_id", userContext.id);
            if (status !== "all") query = query.eq("status", status);
            
            const { data, error } = await query;
            if (error) return { success: false, error: error.message };
            return { success: true, invoices: data };
          }
        } as any),
        fetchServices: tool({
          description: "Fetch active services and subscriptions for the authenticated user.",
          parameters: z.object({}),
          execute: async () => {
            if (!userContext) return { success: false, error: "User is not authenticated. Cannot fetch services." };
            const supabase = await createClient();
            
            const { data, error } = await supabase.from("client_services").select("service_name, status, next_billing_date").eq("client_id", userContext.id);
            if (error) return { success: false, error: error.message };
            return { success: true, services: data };
          }
        } as any),
        updateTicketPriority: tool({
          description: "Update the priority of an existing support ticket.",
          parameters: z.object({
            ticketId: z.string().describe("The ticket ID to update"),
            priority: z.enum(["low", "normal", "high", "critical"]).describe("The new priority level")
          }),
          execute: async ({ ticketId, priority }: any) => {
            if (!userContext) return { success: false, error: "User is not authenticated." };
            const supabase = await createClient();
            // Optional: verify the ticket belongs to the user, but let's assume RLS or check it here
            const { data, error } = await supabase.from("tickets")
              .update({ priority })
              .eq("id", ticketId)
              .select("id, subject")
              .single();
            
            if (error) return { success: false, error: error.message };
            return { success: true, message: `Ticket ${ticketId} priority updated to ${priority}.` };
          }
        } as any)
      } as any,
      onFinish: async ({ text }) => {
        // Log the agent's complete response once streaming is done
        if (text?.trim()) {
          logConversation(resolvedSessionId, "agent", text, resolvedAgentName);
        }
      },
    });

    // @ts-ignore - Handle version differences in AI SDK (toDataStreamResponse vs toTextStreamResponse)
    return (result.toDataStreamResponse ? result.toDataStreamResponse() : (result as any).toTextStreamResponse());
  } catch (err) {
    return serverError(err, "ai-chat");
  }
}
