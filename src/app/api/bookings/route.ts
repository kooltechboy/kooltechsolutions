import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { bookingSchema } from "@/lib/validation";
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
  // ── Rate limiting: 3 bookings per IP per hour ──────────────────────────────
  const ip = getClientIp(request);
  const rl = rateLimit(`bookings:${ip}`, { limit: 3, windowSecs: 60 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Input validation ───────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, date, time, phone, service, message } = parsed.data;

    // ── Sanitize for HTML email embedding ──────────────────────────────────────
    const safeName = sanitizeForEmail(name);
    const safeEmail = sanitizeForEmail(email);
    const safePhone = phone ? sanitizeForEmail(phone) : "N/A";
    const safeService = service ? sanitizeForEmail(service) : "Live Demo";
    const safeMessage = message ? sanitizeForEmail(message) : "No message provided.";
    const safeDate = sanitizeForEmail(date);
    const safeTime = sanitizeForEmail(time);

    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] ?? "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "-";

    const bookingNote = `LIVE DEMO SCHEDULED: ${date} at ${time}`;

    const supabase = await createClient();

    // ── Email alerts ───────────────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        // Admin notification
        await resend.emails.send({
          from: "KoolTech Bookings <onboarding@resend.dev>",
          to: [ADMIN_EMAIL],
          subject: `📅 New Demo Booking: ${safeName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">New Demo Booking Confirmed</h2>
              <p>A potential client has scheduled a live platform demo.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Phone / WhatsApp:</strong> ${safePhone}</p>
                <p><strong>Interest:</strong> ${safeService}</p>
                <p><strong>Message:</strong> ${safeMessage}</p>
                <p><strong>Scheduled Slot:</strong> <span style="background: #e0faff; color: #007791; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${safeDate} at ${safeTime}</span></p>
              </div>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions · Automated Booking Alert</p>
            </div>
          `,
        });

        // Client confirmation
        await resend.emails.send({
          from: "KoolTech Solutions <onboarding@resend.dev>",
          to: [email],
          subject: `Confirmed: Your KoolTech Solutions Demo`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">Demo Confirmed!</h2>
              <p>Hi ${safeName},</p>
              <p>Your live platform demo with KoolTech Solutions is confirmed for:</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${safeDate} at ${safeTime}</p>
              </div>
              <p>We'll send you a meeting link 15 minutes before the session starts.</p>
              <p>If you need to reschedule, please reply to this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
            </div>
          `,
        });
      }
    } catch (emailError) {
      console.error("[Bookings] Email notification failed:", emailError);
    }

    // ── Persist to CRM ─────────────────────────────────────────────────────────
    const { data: leadData, error: dbError } = await supabase
      .from("leads")
      .insert({
        first_name,
        last_name,
        email,
        phone: phone || null,
        service_interest: service || "Live Demo",
        notes: `${bookingNote}\n\nClient Message: ${message || "None"}`,
        status: "qualified",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[Bookings] Database error:", dbError.message);
    }

    return NextResponse.json({ success: true, bookingId: leadData?.id ?? null });
  } catch (err) {
    return serverError(err, "bookings");
  }
}

export async function GET(request: Request) {
  // ── Rate limiting: 30 availability checks per IP per minute ───────────────
  const ip = getClientIp(request);
  const rl = rateLimit(`bookings-get:${ip}`, { limit: 30, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    // Validate the date param — only allow alphanumeric, spaces, and commas
    if (!date || !/^[a-zA-Z0-9 ,]+$/.test(date) || date.length > 60) {
      return NextResponse.json({ bookedSlots: [] });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("leads")
      .select("notes")
      .ilike("notes", `%LIVE DEMO SCHEDULED: ${date}%`);

    if (error) {
      console.error("[Bookings GET] DB error:", error.message);
      return NextResponse.json({ bookedSlots: [] });
    }

    const bookedSlots = data
      .map((lead) => {
        const match = lead.notes?.match(/at\s+(.+)$/m);
        return match ? match[1].trim() : null;
      })
      .filter(Boolean);

    return NextResponse.json({ bookedSlots });
  } catch (err) {
    return serverError(err, "bookings-get");
  }
}
