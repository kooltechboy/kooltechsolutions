import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { contactSchema } from "@/lib/validation";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import {
  validationError,
  serverError,
  rateLimitError,
  sanitizeForEmail,
} from "@/lib/errors";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "danieljwilliams2401@gmail.com";

export async function POST(request: Request) {
  // ── Rate limiting: 5 submissions per IP per 15 minutes ──────────────────────
  const ip = getClientIp(request);
  const rl = rateLimit(`contact:${ip}`, { limit: 5, windowSecs: 15 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Input validation ───────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, phone, company, service, message } = parsed.data;

    // ── Sanitize for safe embedding in HTML emails ─────────────────────────────
    const safeName = sanitizeForEmail(name);
    const safeEmail = sanitizeForEmail(email);
    const safePhone = phone ? sanitizeForEmail(phone) : "Not provided";
    const safeCompany = company ? sanitizeForEmail(company) : "Not provided";
    const safeService = sanitizeForEmail(service);
    const safeMessage = sanitizeForEmail(message);

    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] ?? "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "-";

    const supabase = await createClient();

    // ── Email alert ────────────────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: "KoolTech Alerts <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `🚀 New Lead: ${safeName} (${safeCompany})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">New Lead Captured</h2>
              <p>A new lead has submitted the contact form on <strong>KoolTech Solutions</strong>.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Phone:</strong> ${safePhone}</p>
                <p><strong>Company:</strong> ${safeCompany}</p>
                <p><strong>Service Interest:</strong> <span style="background: #e0faff; color: #007791; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${safeService}</span></p>
              </div>
              <div style="margin: 20px 0;">
                <strong>Message / Notes:</strong>
                <p style="font-style: italic; color: #555; white-space: pre-wrap;">${safeMessage}</p>
              </div>
              <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">Automated alert · KoolTech Solutions Lead Pipeline</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      // Email failure is non-fatal — log and continue
      console.error("[Contact] Email notification failed:", emailError);
    }

    // ── Persist to database ────────────────────────────────────────────────────
    let leadId: string | null = null;
    try {
      const { data: leadData, error: dbError } = await supabase
        .from("leads")
        .insert({
          first_name,
          last_name,
          email,
          phone: phone || null,
          company_name: company || null,
          service_interest: service,
          notes: message,
          status: "new",
        })
        .select("id")
        .single();

      if (dbError) {
        console.error("[Contact] Database insert error:", dbError.message);
      } else {
        leadId = leadData?.id ?? null;
      }
    } catch (dbEx) {
      console.error("[Contact] Database exception:", dbEx);
    }

    // ── Optional Discord webhook ───────────────────────────────────────────────
    try {
      const DISCORD_WEBHOOK = process.env.DISCORD_LEADS_WEBHOOK;
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            embeds: [
              {
                title: "🚀 New Lead",
                color: 0x00d4ff,
                fields: [
                  { name: "Contact", value: name, inline: true },
                  { name: "Company", value: company || "N/A", inline: true },
                  { name: "Service", value: service || "N/A", inline: true },
                  { name: "Email", value: email, inline: false },
                  { name: "Message", value: message.substring(0, 1000) },
                ],
                timestamp: new Date().toISOString(),
              },
            ],
          }),
        });
      }
    } catch (discordError) {
      console.error("[Contact] Discord alert failed:", discordError);
    }

    return NextResponse.json({ success: true, leadId });
  } catch (err) {
    return serverError(err, "contact");
  }
}
