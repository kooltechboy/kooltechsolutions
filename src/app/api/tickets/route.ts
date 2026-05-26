import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { ticketSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  validationError,
  serverError,
  rateLimitError,
  unauthorizedError,
  sanitizeForEmail,
} from "@/lib/errors";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "danieljwilliams@kooltechsolutions.com";

export async function POST(request: Request) {
  // ── Rate limiting: 10 tickets per IP per hour ──────────────────────────────
  const ip = getClientIp(request);
  const rl = rateLimit(`tickets:${ip}`, { limit: 10, windowSecs: 60 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const supabase = await createClient();

    // ── Authentication (must come before reading body for efficiency) ──────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) return unauthorizedError();

    // ── Input validation ───────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = ticketSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { subject, description, priority } = parsed.data;

    // ── IDOR prevention: always use the authenticated user's own client record ─
    // Ignore any client_id sent in the body — derive it from the authenticated session.
    // Since client profiles are stored directly in public.profiles (whose id matches user.id),
    // we use user.id directly as the client_id.
    const client_id = user.id;

    // ── Create ticket ──────────────────────────────────────────────────────────
    const { data: ticket, error: dbError } = await supabase
      .from("tickets")
      .insert({
        subject,
        description,
        priority: priority ?? "normal",
        client_id,
        status: "open",
      })
      .select("*, client:client_id(first_name, last_name, company_name)")
      .single();

    if (dbError) {
      console.error("[Tickets] Creation error:", dbError.message);
      return serverError(new Error(dbError.message), "tickets-insert");
    }

    // ── Sanitize for emails ────────────────────────────────────────────────────
    const safeSubject = sanitizeForEmail(subject);
    const safeDescription = sanitizeForEmail(description);

    // ── Notifications ──────────────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        const priorityColor =
          priority === "critical"
            ? "#ef4444"
            : priority === "high"
            ? "#f59e0b"
            : "#3b82f6";

        await resend.emails.send({
          from: "KoolTech HelpDesk <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `🎟️ New Ticket [${priority?.toUpperCase() ?? "NORMAL"}]: ${safeSubject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: #00d4ff; margin: 0;">New Support Ticket</h2>
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${priority ?? "normal"}
                </span>
              </div>
              <p style="color: #666; font-size: 14px;">Ticket ID: <strong>${ticket.id.slice(0, 8)}</strong></p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Client:</strong> ${sanitizeForEmail(ticket.client?.company_name ?? "Individual Client")}</p>
                <p><strong>Contact:</strong> ${sanitizeForEmail(ticket.client?.first_name ?? "")} ${sanitizeForEmail(ticket.client?.last_name ?? "")}</p>
                <p><strong>Subject:</strong> ${safeSubject}</p>
              </div>
              <div style="margin: 20px 0;">
                <strong>Issue Description:</strong>
                <p style="white-space: pre-wrap; color: #333; line-height: 1.6; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 5px;">${safeDescription}</p>
              </div>
              <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">Automated HelpDesk Alert · KoolTech Solutions</p>
            </div>
          `,
        });
      }

      const DISCORD_WEBHOOK =
        process.env.DISCORD_TICKETS_WEBHOOK ?? process.env.DISCORD_LEADS_WEBHOOK;
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: priority === "critical" ? "🚨 **CRITICAL TICKET** 🚨" : null,
            embeds: [
              {
                title: `🎟️ New Ticket: ${subject}`,
                color: priority === "critical" ? 0xef4444 : 0x00d4ff,
                fields: [
                  { name: "Priority", value: priority ?? "normal", inline: true },
                  {
                    name: "Client",
                    value: ticket.client?.company_name ?? "Private",
                    inline: true,
                  },
                  {
                    name: "Description",
                    value: description.substring(0, 500),
                  },
                ],
                footer: { text: `Ticket ID: ${ticket.id}` },
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    } catch (alertError) {
      console.error("[Tickets] Alert failed:", alertError);
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (err) {
    return serverError(err, "tickets");
  }
}
