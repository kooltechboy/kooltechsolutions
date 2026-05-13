import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "danieljwilliams@kooltechsolutions.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, description, priority, client_id } = body;

    const supabase = await createClient();

    // 1. Create Ticket in Supabase
    const { data: ticket, error: dbError } = await supabase
      .from('tickets')
      .insert({
        subject,
        description,
        priority: priority || 'normal',
        client_id,
        status: 'open'
      })
      .select('*, client:client_id(first_name, last_name, company_name)')
      .single();

    if (dbError) {
      console.error("Ticket Creation Error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // 2. Send Automated Alert
    try {
      if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_your_api_key_here') {
        const priorityColor = priority === 'critical' ? '#ef4444' : priority === 'high' ? '#f59e0b' : '#3b82f6';
        
        await resend.emails.send({
          from: 'HelpDesk <support@kooltechsolutions.com>',
          to: [ADMIN_EMAIL],
          subject: `🎟️ New Ticket [${priority?.toUpperCase() || 'NORMAL'}]: ${subject}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <h2 style="color: #00d4ff; margin: 0;">New Support Ticket</h2>
                <span style="background: ${priorityColor}; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                  ${priority || 'normal'}
                </span>
              </div>
              <p style="color: #666; font-size: 14px;">Ticket ID: <strong>${ticket.id.slice(0, 8)}</strong></p>
              
              <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Client:</strong> ${ticket.client?.company_name || 'Individual Client'}</p>
                <p><strong>Contact:</strong> ${ticket.client?.first_name} ${ticket.client?.last_name}</p>
                <p><strong>Subject:</strong> ${subject}</p>
              </div>

              <div style="margin: 20px 0;">
                <strong>Issue Description:</strong>
                <p style="white-space: pre-wrap; color: #333; line-height: 1.6; background: #fff; padding: 10px; border: 1px solid #eee; border-radius: 5px;">${description}</p>
              </div>

              <a href="https://ktsolutions-admin.vercel.app/admin/tickets" style="display: inline-block; background: #00d4ff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Respond to Ticket</a>
              
              <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
              <p style="font-size: 12px; color: #888;">Automated HelpDesk Alert · KoolTech Solutions</p>
            </div>
          `
        });
      }

      // Optional Discord Alert
      const DISCORD_WEBHOOK = process.env.DISCORD_TICKETS_WEBHOOK || process.env.DISCORD_LEADS_WEBHOOK;
      if (DISCORD_WEBHOOK) {
        await fetch(DISCORD_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: priority === 'critical' ? "🚨 **CRITICAL TICKET ALERT** 🚨" : null,
            embeds: [{
              title: `🎟️ New Ticket: ${subject}`,
              color: priority === 'critical' ? 0xef4444 : 0x00d4ff,
              fields: [
                { name: "Priority", value: priority || "normal", inline: true },
                { name: "Client", value: ticket.client?.company_name || "Private", inline: true },
                { name: "Description", value: description.substring(0, 500) }
              ],
              footer: { text: `Ticket ID: ${ticket.id}` },
              timestamp: new Date().toISOString()
            }]
          })
        });
      }

    } catch (alertError) {
      console.error("Ticket alert failed:", alertError);
    }

    return NextResponse.json({ success: true, ticketId: ticket.id });
  } catch (err: any) {
    console.error("API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
