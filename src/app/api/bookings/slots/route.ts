import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError, serverError } from "@/lib/errors";

// ── Business Hours Configuration ─────────────────────────────────────────────
const BUSINESS_TIMEZONE = "America/Santo_Domingo"; // UTC-4
const SLOT_DURATION_MINS = 30;
const BUSINESS_START_HOUR = 9;    // 9:00 AM
const BUSINESS_END_HOUR = 16;     // Last slot at 4:30 PM → ends at 17:00
const BUSINESS_END_MIN = 30;
const BUSINESS_DAYS = [1, 2, 3, 4, 5]; // Mon–Fri (0=Sun)

const DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

function formatTime12h(hours: number, mins: number): string {
  const ampm = hours >= 12 ? "PM" : "AM";
  const h = hours % 12 || 12;
  const m = mins.toString().padStart(2, "0");
  return `${h}:${m} ${ampm}`;
}

function formatDate(d: Date, tz: string): string {
  const local = new Date(d.toLocaleString("en-US", { timeZone: tz }));
  return `${DAY_NAMES[local.getDay()]}, ${MONTH_NAMES[local.getMonth()]} ${local.getDate()}`;
}

/**
 * Generate all potential time slots for a given UTC day, filtering by
 * business hours in the business timezone and requiring 2h advance notice.
 */
function generateSlotsForDate(
  dateUtc: Date,
  tz: string,
  twoHoursFromNow: Date
): Array<{ utc: string; local: string; date: string; time: string }> {
  const slots: Array<{ utc: string; local: string; date: string; time: string }> = [];

  // Get local date components in the business timezone
  const localStr = dateUtc.toLocaleString("en-US", { timeZone: tz, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit" });
  const [month, day, year] = localStr.split("/").map(Number);

  // Get day-of-week in business timezone
  const localDateObj = new Date(
    dateUtc.toLocaleString("en-US", { timeZone: tz })
  );
  const dayOfWeek = localDateObj.getDay();

  if (!BUSINESS_DAYS.includes(dayOfWeek)) return slots;

  // Generate half-hour slots
  let h = BUSINESS_START_HOUR;
  let m = 0;
  while (h < BUSINESS_END_HOUR || (h === BUSINESS_END_HOUR && m <= BUSINESS_END_MIN)) {
    // Build a UTC date for this slot by constructing it in the local TZ
    // We use Date.parse with the explicit offset for Santo Domingo (UTC-4, no DST)
    const utcOffset = -4 * 60; // Santo Domingo is always UTC-4
    const slotUtc = new Date(
      Date.UTC(year, month - 1, day, h - utcOffset / 60, m, 0, 0)
    );

    if (slotUtc > twoHoursFromNow) {
      const dateLabel = formatDate(slotUtc, tz);
      const timeLabel = formatTime12h(h, m);
      slots.push({
        utc: slotUtc.toISOString(),
        local: `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")} ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`,
        date: dateLabel,
        time: `${timeLabel} AST`,
      });
    }

    m += SLOT_DURATION_MINS;
    if (m >= 60) { h++; m = 0; }
  }

  return slots;
}

/**
 * GET /api/bookings/slots?days=7
 * Returns available booking slots for the next N business days.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = await rateLimit(`booking-slots:${ip}`, { limit: 60, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const { searchParams } = new URL(request.url);
    const daysAhead = Math.min(
      parseInt(searchParams.get("days") ?? "7", 10),
      30
    );

    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const rangeEnd = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    const supabase = await createClient();

    // Fetch booked slots from new bookings table
    const { data: bookedRows } = await supabase
      .from("bookings")
      .select("scheduled_at")
      .gte("scheduled_at", now.toISOString())
      .lte("scheduled_at", rangeEnd.toISOString())
      .not("status", "in", '("cancelled","no_show")');

    // Also check legacy leads table for backwards compatibility
    const { data: legacyRows } = await supabase
      .from("leads")
      .select("notes")
      .ilike("notes", "%LIVE DEMO SCHEDULED:%")
      .eq("status", "qualified");

    const bookedSet = new Set<string>(
      (bookedRows ?? []).map((r: any) => new Date(r.scheduled_at).toISOString())
    );

    // Generate slots for each day in range
    const allSlots: Array<{ utc: string; local: string; date: string; time: string }> = [];
    const cursor = new Date(now);
    cursor.setHours(0, 0, 0, 0);

    while (cursor < rangeEnd) {
      const daySlots = generateSlotsForDate(new Date(cursor), BUSINESS_TIMEZONE, twoHoursFromNow);
      for (const slot of daySlots) {
        if (!bookedSet.has(slot.utc)) {
          allSlots.push(slot);
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    return NextResponse.json({
      timezone: BUSINESS_TIMEZONE,
      slotDurationMins: SLOT_DURATION_MINS,
      businessHours: `${formatTime12h(BUSINESS_START_HOUR, 0)} – ${formatTime12h(BUSINESS_END_HOUR, BUSINESS_END_MIN)} AST, Mon–Fri`,
      availableSlots: allSlots,
      totalAvailable: allSlots.length,
    });
  } catch (err) {
    return serverError(err, "booking-slots");
  }
}
