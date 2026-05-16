import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

// Provide a fallback placeholder to prevent Vercel build crashes if the key isn't added yet
const resend = new Resend(process.env.RESEND_API_KEY || "placeholder_key_to_bypass_build_error");
const ADMIN_EMAIL = "danieljwilliams2401@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, company, service, message } = body;

    const supabase = await createClient();

    // Split name into first and last
    const nameParts = name.trim().split(" ");
    const first_name = nameParts[0] || "Unknown";
    const last_name = nameParts.slice(1).join(" ") || "-";

    // 1. Send Automated Email Alert
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
        await resend.emails.send({
          from: 'onboarding@resend.dev',
          to: [ADMIN_EMAIL],
          subject: `🚀 New High-Value Lead: ${first_name} ${last_name} (${company})`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h2 style="color: #00d4ff;">New Lead Captured</h2>
              <p>A new lead has just submitted the contact form on <strong>KoolTech Solutions</strong>.</p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${first_name} ${last_name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
                <p><strong>Company:</strong> ${company || 'Not provided'}</p>
                <p><strong>Service Interest:</strong> <span style="background: #e0faff; color: #007791; padding: 2px 8px; border-radius: 4px; font-weight: bold;">${service}</span></p>
              </div>

              <div style="margin: 20px 0;">
                <strong>Message / Notes:</strong>
                <p style="font-style: italic; color: #555;">"${message}"</p>
              </div>

              <a href="https://ktsolutions-admin.vercel.app/admin/crm" style="display: inline-block; background: #00d4ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">View in CRM</a>
              
              <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">This is an automated alert from the KoolTech Solutions Lead Pipeline.</p>
            </div>
          `
        });
      }
    } catch (emailError) {
      console.error("Email notification failed:", emailError);
    }

    // 2. Save to Database (done after email to ensure email sends even if DB fails)
    let leadId = null;
    try {
      const { data: leadData, error: dbError } = await supabase.from("leads").insert({
        first_name,
        last_name,
        email,
        phone,
        company_name: company,
        service_interest: service,
        notes: message,
        status: "new"
      }).select().single();

      if (dbError) {
        console.error("Supabase error:", dbError);
      } else {
        leadId = leadData?.id;
      }
    } catch (dbEx) {
      console.error("Database exception:", dbEx);
    }

    // 3. Optional: Discord Webhook Alert (Instant)
    try {
      const DISCORD_WEBHOOK = process.env.DISCORD_LEADS_WEBHOOK;
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            embeds: [{
              title: "🚀 New High-Value Lead",
              color: 0x00d4ff,
              fields: [
                { name: "Contact", value: `${first_name} ${last_name}`, inline: true },
                { name: "Company", value: company || "N/A", inline: true },
                { name: "Service", value: service || "N/A", inline: true },
                { name: "Email", value: email, inline: false },
                { name: "Message", value: message.substring(0, 1000) }
              ],
              timestamp: new Date().toISOString()
            }]
          })
        });
      }
    } catch (discordError) {
      console.error("Discord alert failed:", discordError);
    }

    return NextResponse.json({ success: true, leadId });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
