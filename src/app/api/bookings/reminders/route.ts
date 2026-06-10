import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateIcsInvite } from "@/lib/calendar/ics";

const resend = new Resend(process.env.RESEND_API_KEY);

// Use service role to bypass RLS for processing cron reminders
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function formatLocalTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      timeZone: "America/Santo_Domingo",
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " AST";
  } catch {
    return isoString;
  }
}

export async function POST(req: Request) {
  // ── Authentication Check ──────────────────────────────────────────────────
  const authHeader = req.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // ── 24h Reminder Range (23 to 25 hours out) ──────────────────────────────
    const range24hStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const range24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // ── 1h Reminder Range (15 to 75 minutes out) ─────────────────────────────
    const range1hStart = new Date(now.getTime() + 15 * 60 * 1000);
    const range1hEnd = new Date(now.getTime() + 75 * 60 * 1000);

    // Fetch bookings needing 24h reminder
    const { data: bookings24h, error: err24h } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("reminder_24h_sent", false)
      .gte("scheduled_at", range24hStart.toISOString())
      .lte("scheduled_at", range24hEnd.toISOString());

    if (err24h) throw err24h;

    // Fetch bookings needing 1h reminder
    const { data: bookings1h, error: err1h } = await supabase
      .from("bookings")
      .select("*")
      .eq("status", "confirmed")
      .eq("reminder_1h_sent", false)
      .gte("scheduled_at", range1hStart.toISOString())
      .lte("scheduled_at", range1hEnd.toISOString());

    if (err1h) throw err1h;

    let sent24hCount = 0;
    let sent1hCount = 0;

    // Send 24h reminders
    for (const b of bookings24h ?? []) {
      try {
        const clientName = `${b.first_name} ${b.last_name}`;
        const localTimeFormatted = formatLocalTime(b.scheduled_at);
        const icsContent = generateIcsInvite({
          id: b.id,
          name: clientName,
          email: b.email,
          service: b.service_interest,
          scheduledAt: b.scheduled_at,
          meetingLink: b.meeting_link,
          notes: b.notes || "",
        });

        const attachments = [
          {
            filename: "invite.ics",
            content: Buffer.from(icsContent),
          },
        ];

        await resend.emails.send({
          from: "KoolTech Solutions <onboarding@resend.dev>",
          to: [b.email],
          subject: `Reminder: Your KoolTech Solutions Demo is tomorrow`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">Upcoming Demo Reminder</h2>
              <p>Hi ${b.first_name},</p>
              <p>This is a quick reminder that your platform demo with KoolTech Solutions is scheduled for tomorrow:</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 1.2rem; font-weight: bold; color: #0A1628; margin: 0;">${localTimeFormatted}</p>
                ${b.meeting_link ? `<p style="margin: 10px 0 0 0;"><strong>Google Meet Link:</strong> <a href="${b.meeting_link}" style="color: #00d4ff; font-weight: bold;">Join Video Call</a></p>` : ""}
              </div>
              <p>An '.ics' calendar invitation is attached to help keep your schedule synchronized.</p>
              <p>If you need to reschedule or cancel, please reply directly to this email.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
            </div>
          `,
          attachments,
        });

        // Mark 24h reminder as sent
        await supabase
          .from("bookings")
          .update({ reminder_24h_sent: true })
          .eq("id", b.id);

        sent24hCount++;
      } catch (err) {
        console.error(`Failed to send 24h reminder for booking ${b.id}:`, err);
      }
    }

    // Send 1h reminders
    for (const b of bookings1h ?? []) {
      try {
        const clientName = `${b.first_name} ${b.last_name}`;
        const localTimeFormatted = formatLocalTime(b.scheduled_at);
        const icsContent = generateIcsInvite({
          id: b.id,
          name: clientName,
          email: b.email,
          service: b.service_interest,
          scheduledAt: b.scheduled_at,
          meetingLink: b.meeting_link,
          notes: b.notes || "",
        });

        const attachments = [
          {
            filename: "invite.ics",
            content: Buffer.from(icsContent),
          },
        ];

        await resend.emails.send({
          from: "KoolTech Solutions <onboarding@resend.dev>",
          to: [b.email],
          subject: `Reminder: Your KoolTech Solutions Demo starts in 1 hour`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">Demo Starting in 1 Hour</h2>
              <p>Hi ${b.first_name},</p>
              <p>Your platform demo with KoolTech Solutions is starting in 1 hour:</p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 1.2rem; font-weight: bold; color: #0A1628; margin: 0;">${localTimeFormatted}</p>
                ${b.meeting_link ? `<p style="margin: 10px 0 0 0; font-size: 1.1rem;"><strong>Google Meet Link:</strong> <a href="${b.meeting_link}" style="color: #00d4ff; font-weight: bold; background: #e0faff; padding: 4px 10px; border-radius: 4px;">Join Live Video Call Now</a></p>` : ""}
              </div>
              <p>If you have any issues joining, please reply to this email or reach us at support@kooltechsolutions.com.</p>
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
            </div>
          `,
          attachments,
        });

        // Mark 1h reminder as sent
        await supabase
          .from("bookings")
          .update({ reminder_1h_sent: true })
          .eq("id", b.id);

        sent1hCount++;
      } catch (err) {
        console.error(`Failed to send 1h reminder for booking ${b.id}:`, err);
      }
    }

    return NextResponse.json({
      success: true,
      processedAt: now.toISOString(),
      sent24hCount,
      sent1hCount,
    });
  } catch (err: any) {
    console.error("[Reminders API Error]:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
