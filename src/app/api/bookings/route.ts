import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "placeholder_key_to_bypass_build_error");
const ADMIN_EMAIL = "danieljwilliams2401@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, date, time } = body;

    const supabase = await createClient();

    // Split name into first and last
    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] || "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "-";

    const bookingNote = `LIVE DEMO SCHEDULED: ${date} at ${time}`;

    // 1. Send Automated Email Alert to Admin
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [ADMIN_EMAIL],
          subject: `📅 New Demo Booking: ${first_name} ${last_name}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">New Demo Booking Confirmed</h2>
              <p>A new potential client has just scheduled a live platform demo.</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Scheduled Slot:</strong> <span style="background: #e0faff; color: #007791; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${date} at ${time}</span></p>
              </div>

              <a href="https://ktsolutions-admin.vercel.app/admin/crm" style="display: inline-block; background: #00d4ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in CRM</a>
            </div>
          `
        });

        // Send Confirmation to User
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [email],
          subject: `Confirmed: Your KoolTech Solutions Demo`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">Demo Confirmed!</h2>
              <p>Hi ${first_name},</p>
              <p>Your live platform demo with KoolTech Solutions is confirmed for:</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 1.25rem; font-weight: bold; color: #0A1628;">${date} at ${time}</p>
              </div>

              <p>We'll send you a meeting link 15 minutes before the session starts.</p>
              <p>If you need to reschedule, please reply to this email.</p>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">KoolTech Solutions - Enterprise IT Managed Services</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    // 2. Save to CRM (Leads Table)
    const { data: leadData, error: dbError } = await supabase.from("leads").insert({
      first_name,
      last_name,
      email,
      service_interest: "Live Demo",
      notes: bookingNote,
      status: "qualified" // Booked demos are immediately qualified
    }).select().single();

    if (dbError) {
      console.error("Supabase error:", dbError);
    }

    return NextResponse.json({ success: true, bookingId: leadData?.id });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) return NextResponse.json({ bookedSlots: [] });

    const supabase = await createClient();
    
    // Fetch all bookings for this specific date
    // Note format: "LIVE DEMO SCHEDULED: Wednesday, May 20 at 10:30 AM"
    const { data, error } = await supabase
      .from('leads')
      .select('notes')
      .ilike('notes', `%LIVE DEMO SCHEDULED: ${date}%`);

    if (error) throw error;

    // Extract time slots from the notes
    const bookedSlots = data
      .map(lead => {
        const match = lead.notes?.match(/at\s+(.+)$/);
        return match ? match[1].trim() : null;
      })
      .filter(Boolean);

    return NextResponse.json({ bookedSlots });
  } catch (err: any) {
    console.error("Availability Check Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
