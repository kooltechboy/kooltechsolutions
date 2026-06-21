import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { sanitizeForEmail } from "@/lib/errors";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { services } = body; // Array of { service_name, service_sku, price }

    if (!services || !Array.isArray(services) || services.length === 0) {
      return NextResponse.json({ error: "No services selected" }, { status: 400 });
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const insertRows = services.map(s => ({
      client_id: user.id,
      service_name: s.service_name,
      service_sku: s.service_sku,
      price: s.price,
      status: "active",
      next_billing_date: nextBillingDate
    }));

    const { data, error } = await supabaseService
      .from("client_services")
      .insert(insertRows)
      .select();

    if (error) {
      console.error("[api/services] Error inserting services:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ── Email Notifications ───────────────────────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "danieljwilliams@kooltechsolutions.com";
        const clientEmail = user.email;

        const servicesListHtml = services.map(s => `
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 10px 0; font-weight: bold; color: #333;">${sanitizeForEmail(String(s.service_name))}</td>
            <td style="padding: 10px 0; color: #666; font-family: monospace;">${sanitizeForEmail(String(s.service_sku))}</td>
            <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #00d4ff;">$${Number(s.price).toFixed(2)}/mo</td>
          </tr>
        `).join("");

        const totalCost = services.reduce((sum, s) => sum + s.price, 0);

        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; background-color: #fafafa;">
            <div style="text-align: center; border-bottom: 2px solid #00d4ff; padding-bottom: 15px; margin-bottom: 20px;">
              <h2 style="color: #00d4ff; margin: 0;">🚀 Custom Stack Provisioned</h2>
              <p style="color: #666; margin: 5px 0 0;">KoolTech Solutions Client Portal</p>
            </div>
            
            <p>Hello,</p>
            <p>We are excited to confirm that the following infrastructure services have been provisioned for your account:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <thead>
                <tr style="border-bottom: 2px solid #ddd; text-align: left;">
                  <th style="padding-bottom: 10px;">Service</th>
                  <th style="padding-bottom: 10px;">SKU</th>
                  <th style="padding-bottom: 10px; text-align: right;">Cost</th>
                </tr>
              </thead>
              <tbody>
                ${servicesListHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #ddd; font-size: 16px;">
              <strong>Total Monthly Charge:</strong> 
              <span style="color: #00d4ff; font-size: 18px; font-weight: bold;">$${totalCost.toFixed(2)}/mo</span>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #eefbff; border-radius: 8px; border-left: 4px solid #00d4ff; font-size: 13px; color: #555;">
              <strong>Active Uptime Guarantee:</strong> This custom stack is fully backed by our 99.99% system uptime SLA and 15-minute response SLA.
            </div>
            
            <p style="margin-top: 30px; font-size: 12px; color: #999; text-align: center;">
              This is an automated receipt. To manage, monitor, or cancel any service, log in to your <a href="https://www.kooltechsolutions.com/portal" style="color: #00d4ff; text-decoration: none;">Client Portal</a>.
            </p>
          </div>
        `;

        await resend.emails.send({
          from: "KoolTech Infrastructure <onboarding@resend.dev>",
          to: [clientEmail, ADMIN_EMAIL].filter(Boolean) as string[],
          subject: `🚀 Custom Stack Provisioned: ${services.length} Services Added`,
          html: emailHtml,
        });
      }
    } catch (emailErr) {
      console.error("[api/services] Error sending email notification:", emailErr);
    }

    return NextResponse.json({ success: true, services: data });
  } catch (err: any) {
    console.error("[api/services] Exception in POST:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing service ID" }, { status: 400 });
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify ownership before deleting
    const { data: existingService, error: checkError } = await supabaseService
      .from("client_services")
      .select("client_id, service_name, service_sku, price")
      .eq("id", id)
      .single();

    if (checkError || !existingService) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (existingService.client_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { error: deleteError } = await supabaseService
      .from("client_services")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("[api/services] Error deleting service:", deleteError.message);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // ── Email Notifications for Cancellation ──────────────────────────────────
    try {
      if (process.env.RESEND_API_KEY) {
        const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "danieljwilliams@kooltechsolutions.com";
        const clientEmail = user.email;

        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #ef4444; margin: 0;">Service Cancelled</h2>
            <p style="color: #666; font-size: 14px;">An infrastructure service subscription has been cancelled and deprovisioned.</p>
            <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Service:</strong> ${sanitizeForEmail(String(existingService.service_name))}</p>
              <p><strong>SKU:</strong> ${sanitizeForEmail(String(existingService.service_sku))}</p>
              <p><strong>Monthly Price:</strong> $${Number(existingService.price).toFixed(2)}</p>
            </div>
            <p style="color: #999; font-size: 11px;">This is an automated notification from KoolTech Solutions HelpDesk.</p>
          </div>
        `;

        await resend.emails.send({
          from: "KoolTech Infrastructure <onboarding@resend.dev>",
          to: [clientEmail, ADMIN_EMAIL].filter(Boolean) as string[],
          subject: `🛑 Service Cancelled: ${existingService.service_name} [${existingService.service_sku}]`,
          html: emailHtml,
        });
      }
    } catch (emailErr) {
      console.error("[api/services] Error sending cancel email notification:", emailErr);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[api/services] Exception in DELETE:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
