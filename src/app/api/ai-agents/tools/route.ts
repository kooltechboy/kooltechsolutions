import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createCalendarEvent } from "@/lib/calendar/google";
import { generateIcsInvite } from "@/lib/calendar/ics";
import { Resend } from "resend";
import { retrieveRelevantKnowledge, formatKnowledgeContext, KNOWLEDGE_FALLBACK_TEXT } from "@/lib/knowledge/retrieve";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createSupabaseClient(supabaseUrl, supabaseKey);

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { toolName, arguments: args, sessionId, agentName, userContext } = body;

    if (!toolName) {
      return NextResponse.json({ error: "Missing toolName" }, { status: 400 });
    }

    const resolvedSessionId = sessionId || `anon-${Date.now()}`;
    const resolvedAgentName = agentName || "Kira";

    switch (toolName) {
      case "bookDemo": {
        const first_name = args.name.split(" ")[0] || "Unknown";
        const last_name = args.name.split(" ").slice(1).join(" ") || "-";

        let scheduled_at_date: Date;
        try {
          if (args.scheduledAt) {
            scheduled_at_date = new Date(args.scheduledAt);
          } else {
            scheduled_at_date = parseBookingDateTime(args.date, args.time);
          }
        } catch (err) {
          console.warn("[Tool Gateway] bookDemo date parsing failed, defaulting to tomorrow:", err);
          scheduled_at_date = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        // Google Calendar Sync
        const { googleEventId, meetingLink } = await createCalendarEvent({
          name: args.name,
          email: args.email,
          service: args.service,
          scheduledAt: scheduled_at_date.toISOString(),
          notes: args.message || "",
        });

        let bookingId: string | null = null;
        const { data: booking, error: bookingError } = await supabase
          .from("bookings")
          .insert({
            first_name,
            last_name,
            email: args.email,
            phone: args.phone || null,
            service_interest: args.service,
            notes: args.message || null,
            scheduled_at: scheduled_at_date.toISOString(),
            status: "confirmed",
            booked_via: "ai_agent",
            agent_name: resolvedAgentName,
            session_id: resolvedSessionId,
            google_event_id: googleEventId,
            meeting_link: meetingLink,
          })
          .select("id")
          .single();

        if (!bookingError) bookingId = booking?.id;

        // Always create a CRM lead record
        const bookingNote = `LIVE DEMO SCHEDULED: ${args.date} at ${args.time}`;
        const meetingNote = meetingLink ? `\nMeeting Link: ${meetingLink}` : "";
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .insert({
            first_name,
            last_name,
            email: args.email,
            phone: args.phone || null,
            service_interest: args.service,
            notes: `${bookingNote}${meetingNote}\n\nClient Message: ${args.message || "None"}`,
            status: "qualified",
          })
          .select("id")
          .single();

        if (leadError) return NextResponse.json({ success: false, error: leadError.message });

        // Email notifications
        if (process.env.RESEND_API_KEY) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "sales@kooltechsolutions.com";
            const resolvedBookingId = bookingId ?? lead.id;

            const icsContent = generateIcsInvite({
              id: resolvedBookingId,
              name: args.name,
              email: args.email,
              service: args.service,
              scheduledAt: scheduled_at_date.toISOString(),
              meetingLink,
              notes: args.message || "",
            });

            const attachments = [
              {
                filename: "invite.ics",
                content: Buffer.from(icsContent),
              },
            ];

            // Notify Admin
            await resend.emails.send({
              from: "KoolTech AI <onboarding@resend.dev>",
              to: [adminEmail],
              subject: `🚀 New AI Lead: ${args.name}`,
              html: `<h2>New Lead — Booked by ${resolvedAgentName}</h2>
                <p><strong>Name:</strong> ${args.name}</p>
                <p><strong>Email:</strong> ${args.email}</p>
                <p><strong>Phone:</strong> ${args.phone || "N/A"}</p>
                <p><strong>Service:</strong> ${args.service}</p>
                <p><strong>Slot:</strong> ${args.date} at ${args.time}</p>
                ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}">${meetingLink}</a></p>` : ""}
                <p><strong>Notes:</strong> ${args.message || "None"}</p>`,
              attachments,
            });

            // Notify Client
            await resend.emails.send({
              from: "KoolTech Solutions <onboarding@resend.dev>",
              to: [args.email],
              subject: `Confirmed: Your KoolTech Solutions Demo`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                  <h2 style="color: #00d4ff;">Demo Confirmed!</h2>
                  <p>Hi ${args.name},</p>
                  <p>Your live platform demo with KoolTech Solutions is confirmed for:</p>
                  <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${args.date} at ${args.time}</p>
                    ${meetingLink ? `<p><strong>Google Meet Link:</strong> <a href="${meetingLink}" style="color: #00d4ff; font-weight: bold;">Join Video Call</a></p>` : ""}
                  </div>
                  <p>We've attached a calendar invite (.ics) to this email to add it to your calendar.</p>
                  ${meetingLink ? "<p>You can use the Google Meet link above to join the call at the scheduled time.</p>" : "<p>We'll send you a meeting link 15 minutes before the session starts.</p>"}
                  <p>If you need to reschedule, please reply to this email.</p>
                  <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                  <p style="font-size: 12px; color: #888;">KoolTech Solutions — Enterprise IT Managed Services</p>
                </div>
              `,
              attachments,
            });
          } catch (e) {
            console.error("[Tool Gateway] bookDemo Email error:", e);
          }
        }

        return NextResponse.json({
          success: true,
          bookingId: bookingId ?? lead.id,
          message: "Demo booked successfully. Confirmation email sent.",
        });
      }

      case "getAvailableSlots": {
        const days = args.days || 7;
        try {
          const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
          const res = await fetch(`${baseUrl}/api/bookings/slots?days=${days}`);
          if (!res.ok) return NextResponse.json({ error: "Could not fetch availability" });
          const data = await res.json();
          const slots = (data.availableSlots ?? []).slice(0, 10);
          return NextResponse.json({
            timezone: data.timezone,
            slots: slots.map((s: any) => ({
              date: s.date,
              time: s.time,
              utc: s.utc,
            })),
            moreAvailable: (data.totalAvailable ?? 0) > 10,
          });
        } catch {
          return NextResponse.json({ error: "Availability service unavailable" });
        }
      }

      case "checkAvailability": {
        const { date } = args;
        const { data, error } = await supabase
          .from("leads")
          .select("notes")
          .ilike("notes", `%LIVE DEMO SCHEDULED: ${date}%`);
        if (error) return NextResponse.json({ bookedSlots: [] });
        const bookedSlots = data
          .map((lead) => {
            const match = lead.notes?.match(/at\s+(.+)$/m);
            return match ? match[1].trim() : null;
          })
          .filter(Boolean);
        return NextResponse.json({ bookedSlots });
      }

      case "createTicket": {
        let client_id = userContext?.id;

        if (!client_id && args.email) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", args.email)
            .single();
          if (profile) {
            client_id = profile.id;
          }
        }

        if (!client_id) {
          return NextResponse.json({ success: false, error: "Client account not found. Please provide the email associated with your client account to file a support ticket, or request a call back if you don't have an account." }, { status: 401 });
        }

        const { data, error } = await supabase
          .from("tickets")
          .insert({
            subject: args.subject,
            description: args.description,
            priority: args.priority || "normal",
            client_id,
            status: "open",
          })
          .select("id")
          .single();

        if (error) return NextResponse.json({ success: false, error: error.message });
        return NextResponse.json({
          success: true,
          ticketId: data.id,
          message: `Ticket created (ID: ${data.id}). Priority: ${args.priority}.`,
        });
      }

      case "scheduleCallback": {
        const first_name = args.name.split(" ")[0] || "Unknown";
        const last_name = args.name.split(" ").slice(1).join(" ") || "-";

        const callbackNote = `CALLBACK REQUESTED: ${args.date || "ASAP"} at ${args.time || "anytime"}`;
        const reasonNote = args.reason ? `\nTopic: ${args.reason}` : "";

        // Insert CRM lead record
        const { data: lead, error: leadError } = await supabase
          .from("leads")
          .insert({
            first_name,
            last_name,
            email: args.email || null,
            phone: args.phone,
            service_interest: "Callback",
            notes: `${callbackNote}${reasonNote}`,
            status: "new",
          })
          .select("id")
          .single();

        if (leadError) return NextResponse.json({ success: false, error: leadError.message });

        // Email notifications using Resend
        if (process.env.RESEND_API_KEY) {
          try {
            const resend = new Resend(process.env.RESEND_API_KEY);
            const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? "sales@kooltechsolutions.com";

            await resend.emails.send({
              from: "KoolTech AI <onboarding@resend.dev>",
              to: [adminEmail],
              subject: `📞 New Callback Request: ${args.name}`,
              html: `<h2>New Callback Request — Booked by ${resolvedAgentName}</h2>
                <p><strong>Name:</strong> ${args.name}</p>
                <p><strong>Phone:</strong> ${args.phone}</p>
                <p><strong>Email:</strong> ${args.email || "N/A"}</p>
                <p><strong>Preferred Time:</strong> ${args.date || "ASAP"} at ${args.time || "anytime"}</p>
                <p><strong>Topic / Reason:</strong> ${args.reason || "General inquiry"}</p>`,
            });
          } catch (e) {
            console.error("[Tool Gateway] scheduleCallback Email error:", e);
          }
        }

        return NextResponse.json({
          success: true,
          leadId: lead.id,
          message: "Callback requested successfully. Our team will contact you shortly.",
        });
      }

      case "checkTicketStatus": {
        const { ticketId } = args;
        const { data, error } = await supabase
          .from("tickets")
          .select("status, subject, priority, created_at")
          .eq("id", ticketId)
          .single();
        if (error) return NextResponse.json({ success: false, error: "Ticket not found." });
        return NextResponse.json({ success: true, ...data });
      }

      case "updateTicketPriority": {
        if (!userContext?.id) {
          return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
        }
        const { ticketId, priority } = args;
        const { error } = await supabase
          .from("tickets")
          .update({ priority })
          .eq("id", ticketId);
        if (error) return NextResponse.json({ success: false, error: error.message });
        return NextResponse.json({
          success: true,
          message: `Ticket ${ticketId} priority updated to ${priority}.`,
        });
      }

      case "fetchInvoices": {
        const client_id = userContext?.id;
        if (!client_id) {
          return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
        }
        const status = args.status || "all";
        let query = supabase
          .from("invoices")
          .select("invoice_number, amount, status, due_date")
          .eq("client_id", client_id);
        if (status !== "all") query = query.eq("status", status);
        const { data, error } = await query;
        if (error) return NextResponse.json({ success: false, error: error.message });
        return NextResponse.json({ success: true, invoices: data });
      }

      case "fetchServices": {
        const client_id = userContext?.id;
        if (!client_id) {
          return NextResponse.json({ success: false, error: "Not authenticated." }, { status: 401 });
        }
        const { data, error } = await supabase
          .from("client_services")
          .select("service_name, status, next_billing_date")
          .eq("client_id", client_id);
        if (error) return NextResponse.json({ success: false, error: error.message });
        return NextResponse.json({ success: true, services: data });
      }

      case "getKnowledge": {
        const { query, source } = args;
        const chunks = await retrieveRelevantKnowledge(query, {
          matchCount: 3,
          threshold: 0.6,
          sourceFilter: !source || source === "any" ? undefined : source,
        });

        if (chunks.length === 0) {
          return NextResponse.json({
            found: false,
            fallback: KNOWLEDGE_FALLBACK_TEXT,
          });
        }

        return NextResponse.json({
          found: true,
          results: chunks.map((c) => ({
            source: c.source,
            title: c.title,
            content: c.content,
            confidence: Math.round(c.similarity * 100),
          })),
        });
      }

      case "escalateToHuman": {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
        const res = await fetch(`${baseUrl}/api/ai-agents/escalate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId: resolvedSessionId,
            agentName: resolvedAgentName,
            channel: "voice",
            reason: args.reason,
            priority: args.priority || "high",
            summary: args.summary,
            userContact: args.userContact || {},
          }),
        });

        if (!res.ok) throw new Error("Escalation API error");
        const data = await res.json();

        return NextResponse.json({
          success: true,
          escalationId: data.escalationId,
          message: "Human agent notified. They have your conversation history.",
        });
      }

      default:
        return NextResponse.json({ error: `Unknown tool: ${toolName}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error("[Tool Gateway] Error executing tool:", error);
    return NextResponse.json({ error: error?.message || "Internal server error" }, { status: 500 });
  }
}
