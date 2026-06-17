import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError, serverError, unauthorizedError } from "@/lib/errors";
import { z } from "zod";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

function getServiceRoleSupabase() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const escalationSchema = z.object({
  sessionId: z.string().max(200),
  agentName: z.string().max(50).default("Kira"),
  channel: z.enum(["text", "voice"]).default("text"),
  reason: z.string().max(500),
  priority: z.enum(["low", "normal", "high", "critical"]).default("high"),
  summary: z.string().max(2000),
  conversationContext: z.string().max(10000).optional(),
  userContact: z
    .object({
      name: z.string().max(100).optional(),
      email: z.string().email().optional(),
      phone: z.string().max(30).optional(),
    })
    .optional(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const rl = rateLimit(`escalate:${ip}`, { limit: 10, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = escalationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid escalation data", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const {
      sessionId,
      agentName,
      channel,
      reason,
      priority,
      summary,
      conversationContext,
      userContact,
    } = parsed.data;

    const supabase = getServiceRoleSupabase();

    // ── Create escalation record ──────────────────────────────────────────────
    const { data: escalation, error: escError } = await supabase
      .from("escalations")
      .insert({
        session_id: sessionId,
        agent_name: agentName,
        reason,
        priority,
        summary,
        conversation_context: conversationContext ?? null,
        user_name: userContact?.name ?? null,
        user_email: userContact?.email ?? null,
        user_phone: userContact?.phone ?? null,
        status: "pending",
      })
      .select("id")
      .single();

    if (escError) {
      console.error("[Escalation] DB insert error:", escError.message);
      return serverError(new Error(escError.message), "escalation-insert");
    }

    // ── Update the agent session status to 'escalated' ────────────────────────
    await supabase
      .from("agent_sessions")
      .update({ status: "escalated", escalation_id: escalation.id })
      .eq("session_id", sessionId);

    // ── Create a support ticket for tracking ──────────────────────────────────
    const { data: ticket } = await supabase
      .from("tickets")
      .insert({
        subject: `[${priority.toUpperCase()}] AI Escalation: ${reason.slice(0, 150)}`,
        description: [
          `Agent: ${agentName} (${channel})`,
          `Session: ${sessionId}`,
          `Reason: ${reason}`,
          ``,
          `SUMMARY:`,
          summary,
          ``,
          `CONVERSATION CONTEXT:`,
          conversationContext ?? "Not provided",
        ].join("\n"),
        priority,
        status: "open",
        // No client_id — this is an unauthenticated visitor escalation
      })
      .select("id")
      .single();

    // ── Discord notification ──────────────────────────────────────────────────
    const discordWebhook =
      process.env.DISCORD_TICKETS_WEBHOOK ?? process.env.DISCORD_LEADS_WEBHOOK;

    if (discordWebhook) {
      const priorityEmoji: Record<string, string> = {
        critical: "🚨",
        high: "🔴",
        normal: "🟡",
        low: "🟢",
      };

      fetch(discordWebhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content:
            priority === "critical"
              ? "@here 🚨 **CRITICAL ESCALATION — IMMEDIATE RESPONSE REQUIRED**"
              : null,
          embeds: [
            {
              title: `${priorityEmoji[priority] ?? "⚠️"} AI Escalation: ${agentName} → Human`,
              color:
                priority === "critical"
                  ? 0xef4444
                  : priority === "high"
                  ? 0xf59e0b
                  : 0x00d4ff,
              fields: [
                { name: "Agent", value: agentName, inline: true },
                { name: "Channel", value: channel, inline: true },
                { name: "Priority", value: priority.toUpperCase(), inline: true },
                {
                  name: "Client",
                  value: userContact?.name ?? "Anonymous",
                  inline: true,
                },
                {
                  name: "Contact",
                  value:
                    [userContact?.email, userContact?.phone]
                      .filter(Boolean)
                      .join(" | ") || "Not provided",
                  inline: true,
                },
                { name: "Reason", value: reason.slice(0, 300) },
                { name: "Summary", value: summary.slice(0, 500) },
              ],
              footer: {
                text: `Session: ${sessionId} | Escalation: ${escalation.id}`,
              },
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      }).catch((e) =>
        console.error("[Escalation] Discord notification failed:", e)
      );
    }

    // ── Resend email alert ────────────────────────────────────────────────────
    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      const adminEmail =
        process.env.ADMIN_NOTIFICATION_EMAIL ?? "support@kooltechsolutions.com";

      resend.emails
        .send({
          from: "KoolTech AI Assistants <onboarding@resend.dev>",
          to: [adminEmail],
          subject: `🔔 [${priority.toUpperCase()}] AI Escalation: ${agentName} → Human Agent`,
          html: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #eee;border-radius:10px">
              <h2 style="color:#00d4ff">AI Agent Escalation Request</h2>
              <p>An AI agent has flagged a conversation for human review.</p>
              <div style="background:#f9f9f9;padding:15px;border-radius:8px;margin:20px 0">
                <p><strong>Agent:</strong> ${agentName} (${channel})</p>
                <p><strong>Priority:</strong> <span style="background:${priority === "critical" ? "#ef4444" : priority === "high" ? "#f59e0b" : "#3b82f6"};color:white;padding:2px 8px;border-radius:4px">${priority.toUpperCase()}</span></p>
                <p><strong>Client:</strong> ${userContact?.name ?? "Anonymous"}</p>
                <p><strong>Email:</strong> ${userContact?.email ?? "Not provided"}</p>
                <p><strong>Phone:</strong> ${userContact?.phone ?? "Not provided"}</p>
                <p><strong>Reason:</strong> ${reason}</p>
              </div>
              <h3>Summary</h3>
              <p style="white-space:pre-wrap;background:#fff;padding:10px;border:1px solid #eee;border-radius:5px">${summary}</p>
              ${conversationContext ? `<h3>Conversation Context</h3><p style="white-space:pre-wrap;background:#fff;padding:10px;border:1px solid #eee;border-radius:5px;font-size:12px">${conversationContext.slice(0, 2000)}</p>` : ""}
              <hr style="border:0;border-top:1px solid #eee;margin:20px 0"/>
              <p style="font-size:12px;color:#888">Escalation ID: ${escalation.id} | Session: ${sessionId}</p>
            </div>
          `,
        })
        .catch((e: unknown) => console.error("[Escalation] Email failed:", e));
    }

    return NextResponse.json({
      success: true,
      escalationId: escalation.id,
      ticketId: ticket?.id ?? null,
      message:
        "Escalation logged. Our team has been notified and will respond based on priority SLA.",
    });
  } catch (err) {
    return serverError(err, "escalation");
  }
}
