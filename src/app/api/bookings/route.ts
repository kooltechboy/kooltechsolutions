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
import { createCalendarEvent } from "@/lib/calendar/google";
import { generateIcsInvite } from "@/lib/calendar/ics";

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "danieljwilliams@kooltechsolutions.com";

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

export async function POST(request: Request) {
  // ── Rate limiting: 3 bookings per IP per hour ──────────────────────────────
  const ip = getClientIp(request);
  const rl = await rateLimit(`bookings:${ip}`, { limit: 3, windowSecs: 60 * 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    // ── Input validation ───────────────────────────────────────────────────────
    const body = await request.json();
    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { name, email, date, time, phone, service, message, customStack } = parsed.data;

    // ── Sanitize for HTML email embedding ──────────────────────────────────────
    const safeName = sanitizeForEmail(name);
    const safeEmail = sanitizeForEmail(email);
    const safePhone = phone ? sanitizeForEmail(phone) : "N/A";
    const safeService = service ? sanitizeForEmail(service) : "Consultation";
    const safeMessage = message ? sanitizeForEmail(message) : "No message provided.";
    const safeDate = sanitizeForEmail(date);
    const safeTime = sanitizeForEmail(time);

    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] ?? "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "-";

    const scheduled_at = parseBookingDateTime(date, time);

    // ── Google Calendar Sync ─────────────────────────────────────────────────
    const { googleEventId, meetingLink } = await createCalendarEvent({
      name,
      email,
      service: safeService,
      scheduledAt: scheduled_at.toISOString(),
      notes: message || "",
    });

    const supabase = await createClient();

    // ── Persist to proper bookings table ──────────────────────────────────────
    const { data: bookingData, error: bookingDbError } = await supabase
      .from("bookings")
      .insert({
        first_name,
        last_name,
        email,
        phone: phone || null,
        service_interest: safeService,
        notes: message || null,
        scheduled_at: scheduled_at.toISOString(),
        google_event_id: googleEventId,
        meeting_link: meetingLink,
        booked_via: "web_form",
      })
      .select("id")
      .single();

    if (bookingDbError) {
      console.error("[Bookings] Proper bookings table insert error:", bookingDbError.message);
    }

    // ── Persist to legacy CRM leads table ──────────────────────────────────────
    const bookingNote = `CONSULTATION SCHEDULED: ${date} at ${time}`;
    const meetingNote = meetingLink ? `\nMeeting Link: ${meetingLink}` : "";
    const { data: leadData, error: dbError } = await supabase
      .from("leads")
      .insert({
        first_name,
        last_name,
        email,
        phone: phone || null,
        service_interest: service || "Consultation",
        notes: `${bookingNote}${meetingNote}\n\nClient Message: ${message || "None"}`,
        status: "qualified",
      })
      .select("id")
      .single();

    if (dbError) {
      console.error("[Bookings] Database error:", dbError.message);
    }

    const resolvedBookingId = bookingData?.id ?? leadData?.id ?? "booking";

    // ── Email alerts ───────────────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        // Generate ICS attachment
        const icsContent = generateIcsInvite({
          id: resolvedBookingId,
          name,
          email,
          service: safeService,
          scheduledAt: scheduled_at.toISOString(),
          meetingLink,
          notes: message || "",
        });

        const attachments = [
          {
            filename: "invite.ics",
            content: Buffer.from(icsContent),
          },
        ];

        // Format custom stack HTML if available
        let customStackHtml = "";
        if (customStack && customStack.length > 0) {
          const rows = customStack.map(s => `
            <tr style="border-bottom: 1px solid #eee;">
              <td style="padding: 10px 0; font-weight: bold; color: #333;">${sanitizeForEmail(s.name)}</td>
              <td style="padding: 10px 0; color: #666; font-family: monospace; font-size: 12px;">${sanitizeForEmail(s.code)}</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #00d4ff;">${sanitizeForEmail(s.price)} (${sanitizeForEmail(s.priceType)})</td>
            </tr>
          `).join("");

          customStackHtml = `
            <h3 style="color: #0A1628; border-bottom: 2px solid #00d4ff; padding-bottom: 8px; margin-top: 25px; font-family: sans-serif;">Requested Custom Stack Services</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-family: sans-serif; font-size: 14px;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd; text-align: left; font-size: 12px; color: #666;">
                  <th style="padding-bottom: 8px;">Service</th>
                  <th style="padding-bottom: 8px;">SKU</th>
                  <th style="padding-bottom: 8px; text-align: right;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${rows}
              </tbody>
            </table>
          `;
        }

        // Admin notification
        await resend.emails.send({
          from: "KoolTech Bookings <noreply@kooltechsolutions.com>",
          replyTo: email,
          to: [ADMIN_EMAIL],
          subject: `📅 New Consultation Booking: ${safeName}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">New Consultation Booking</h2>
              <p>A potential client has scheduled a consultation appointment.</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${safeName}</p>
                <p><strong>Email:</strong> ${safeEmail}</p>
                <p><strong>Phone / WhatsApp:</strong> ${safePhone}</p>
                <p><strong>Interest:</strong> ${safeService}</p>
                <p><strong>Message:</strong> ${safeMessage}</p>
                <p><strong>Scheduled Slot:</strong> <span style="background: #e0faff; color: #007791; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${safeDate} at ${safeTime}</span></p>
                ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
              </div>
              ${customStackHtml}
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions · Automated Booking Alert</p>
            </div>
          `,
          attachments,
        });

        // Client confirmation
        await resend.emails.send({
          from: "KoolTech Solutions <noreply@kooltechsolutions.com>",
          replyTo: ADMIN_EMAIL,
          to: [email],
          subject: `Confirmed: Your KoolTech Solutions Consultation`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">Consultation Confirmed!</h2>
              <p>Hi ${safeName},</p>
              <p>Your consultation with KoolTech Solutions is confirmed for:</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${safeDate} at ${safeTime}</p>
                ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}" style="color: #00d4ff; font-weight: bold;">Join Video Call</a></p>` : ""}
              </div>
              ${customStackHtml}
              <p>We've attached a calendar invite (.ics) to this email to add it to your calendar.</p>
              ${meetingLink ? "<p>You can use the Google Meet link above to join the call at the scheduled time.</p>" : "<p>We'll send you a meeting link 15 minutes before the session starts.</p>"}
              <p>If you need to reschedule, please reply to this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
            </div>
          `,
          attachments,
        });
      }
    } catch (emailError) {
      console.error("[Bookings] Email notification failed:", emailError);
    }

    return NextResponse.json({ success: true, bookingId: resolvedBookingId });
  } catch (err) {
    return serverError(err, "bookings");
  }
}

export async function GET(request: Request) {
  // ── Rate limiting: 30 availability checks per IP per minute ───────────────
  const ip = getClientIp(request);
  const rl = await rateLimit(`bookings-get:${ip}`, { limit: 30, windowSecs: 60 });
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
      .ilike("notes", `%SCHEDULED: ${date}%`);

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
