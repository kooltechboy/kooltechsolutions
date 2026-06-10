/**
 * iCalendar (.ics) File Generator
 *
 * Generates standard RFC 5545 calendar invitations in-memory.
 * Compatible with Google Calendar, Outlook, and Apple Calendar.
 */

function formatIcsDate(date: Date): string {
  // Format: YYYYMMDDTHHMMSSZ (e.g., 20260610T123000Z)
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

export function generateIcsInvite(params: {
  id: string;
  name: string;
  email: string;
  service: string;
  scheduledAt: string; // ISO string
  durationMins?: number;
  meetingLink?: string | null;
  notes?: string;
}): string {
  const { id, name, email, service, scheduledAt, durationMins = 30, meetingLink, notes = "" } = params;

  const now = new Date();
  const startTime = new Date(scheduledAt);
  const endTime = new Date(startTime.getTime() + durationMins * 60 * 1000);

  const dtStamp = formatIcsDate(now);
  const dtStart = formatIcsDate(startTime);
  const dtEnd = formatIcsDate(endTime);

  const uid = `${id}@kooltechsolutions.com`;
  const summary = `KoolTech Consultation: ${name} (${service})`;
  
  // Safe line escaping for ICS format
  const safeNotes = notes.replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  const description = [
    `Client: ${name}`,
    `Email: ${email}`,
    `Service Interest: ${service}`,
    meetingLink ? `Meeting Link: ${meetingLink}` : "",
    notes ? `Client Notes: ${safeNotes}` : "",
  ]
    .filter(Boolean)
    .join("\\n");

  const location = meetingLink ?? "Google Meet / Online";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//KoolTech Solutions//AI Workforce//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `ORGANIZER;CN="KoolTech Solutions":mailto:sales@kooltechsolutions.com`,
    `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE;CN="${name}":mailto:${email}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}
