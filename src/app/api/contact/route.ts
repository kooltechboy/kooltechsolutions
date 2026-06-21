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
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "sales@kooltechsolutions.com";

export async function POST(request: Request) {
  // ── Rate limiting: 5 submissions per IP per 15 minutes ──────────────────────
  const ip = getClientIp(request);
  const rl = await rateLimit(`contact:${ip}`, { limit: 5, windowSecs: 15 * 60 });
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

    // ── Email alerts ───────────────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        let targetEmail = ADMIN_EMAIL;
        const salesIntents = ["Free Vulnerability Assessment", "Cloud & Network Audit", "Get a Custom IT Quote", "Book AI Consultation", "Request a Quote"];
        if (salesIntents.includes(service)) targetEmail = "sales@kooltechsolutions.com";
        else if (service === "Technical Support") targetEmail = "support@kooltechsolutions.com";
        else targetEmail = "info@kooltechsolutions.com";

        // ── Admin notification ──────────────────────────────────────────────────
        await resend.emails.send({
          from: "KoolTech Alerts <noreply@kooltechsolutions.com>",
          replyTo: email,
          to: [targetEmail],
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

        // ── Client confirmation email ───────────────────────────────────────────
        await resend.emails.send({
          from: "KoolTech Solutions <noreply@kooltechsolutions.com>",
          replyTo: targetEmail,
          to: [email],
          subject: "We've received your message — KoolTech Solutions",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <div style="display: inline-block; width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, #00D4FF, #1E4D8C); line-height: 48px; text-align: center;">
                  <span style="color: #fff; font-weight: 800; font-size: 16px; font-family: sans-serif;">KT</span>
                </div>
              </div>
              <h2 style="color: #00d4ff; text-align: center;">Thank You, ${safeName}!</h2>
              <p>We've received your message and a member of our team will get back to you within <strong>one business hour</strong>.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 8px;"><strong>Your inquiry:</strong> ${safeService}</p>
                <p style="margin: 0; font-style: italic; color: #555; white-space: pre-wrap;">${safeMessage}</p>
              </div>
              <p>In the meantime, here are some ways to reach us immediately:</p>
              <ul style="color: #555; line-height: 1.8;">
                <li>📞 Call: <a href="tel:829-720-1611" style="color: #00d4ff;">+1 (829) 720-1611</a></li>
                <li>💬 WhatsApp: <a href="https://wa.me/18297201611" style="color: #25D366;">Chat with us</a></li>
                <li>🚨 Emergency? Call us 24/7</li>
              </ul>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888; text-align: center;">KoolTech Solutions — Enterprise IT Managed Services<br/>Santiago, Dominican Republic</p>
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
