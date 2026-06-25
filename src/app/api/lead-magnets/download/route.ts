import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);

const schema = z.object({
  lead_magnet_id: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().max(320),
  consent: z.boolean(),
});

const SIGNED_URL_EXPIRES_IN = 3600; // 1 hour in seconds

export async function POST(request: Request) {
  try {
    // ── 1. Parse & validate body ──────────────────────────────
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid submission", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { lead_magnet_id, name, email, consent } = parsed.data;

    if (!consent) {
      return NextResponse.json(
        { error: "You must agree to the privacy policy to download." },
        { status: 400 }
      );
    }

    // ── 2. Fetch lead magnet record ───────────────────────────
    const supabase = getAdminSupabase();
    const { data: magnet, error: magnetErr } = await supabase
      .from("lead_magnets")
      .select("id, title, pdf_url, pdf_filename, active")
      .eq("id", lead_magnet_id)
      .single();

    if (magnetErr || !magnet) {
      return NextResponse.json({ error: "Lead magnet not found." }, { status: 404 });
    }

    if (!magnet.active) {
      return NextResponse.json({ error: "This resource is no longer available." }, { status: 410 });
    }

    // ── 3. Deduplication — one email per magnet ───────────────
    // (We still allow re-sending the email if already registered — just skip insert)
    const { data: existing } = await supabase
      .from("lead_magnet_downloads")
      .select("id")
      .eq("lead_magnet_id", lead_magnet_id)
      .eq("email", email)
      .single();

    if (!existing) {
      // Record the lead capture
      const ip =
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

      await supabase.from("lead_magnet_downloads").insert([{
        lead_magnet_id,
        email,
        name,
        consent,
        ip_address: ip,
      }]);

      // Also upsert into the main leads table for CRM visibility
      await supabase.from("leads").upsert(
        [{
          email,
          name,
          source: "lead_magnet",
          notes: `Downloaded: ${magnet.title}`,
          status: "New",
        }],
        { onConflict: "email", ignoreDuplicates: true }
      );

      // Increment download counter
      await supabase.rpc("increment_lead_magnet_downloads", {
        magnet_id: lead_magnet_id,
      });
    }

    // ── 4. Generate a short-lived signed URL for the PDF ─────
    const { data: signedUrlData, error: signedErr } = await supabase.storage
      .from("lead-magnets")
      .createSignedUrl(magnet.pdf_url, SIGNED_URL_EXPIRES_IN);

    if (signedErr || !signedUrlData?.signedUrl) {
      return NextResponse.json(
        { error: "Failed to generate download link. Please try again." },
        { status: 500 }
      );
    }

    const downloadUrl = signedUrlData.signedUrl;
    const firstName = name.split(" ")[0];

    // ── 5. Send email via Resend ─────────────────────────────
    const emailHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${magnet.title}</title>
</head>
<body style="margin:0;padding:0;background:#060B18;font-family:Inter,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#060B18;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="padding:0 0 32px 0;text-align:center;">
              <div style="display:inline-block;padding:10px 20px;background:rgba(0,212,255,0.08);border:1px solid rgba(0,212,255,0.2);border-radius:8px;">
                <span style="color:#00D4FF;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;">Kool Tech Solutions</span>
              </div>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:rgba(10,22,40,0.95);border:1px solid rgba(0,212,255,0.15);border-radius:20px;padding:48px 40px;">
              
              <h1 style="margin:0 0 8px;font-size:28px;font-weight:800;color:#ffffff;line-height:1.2;">
                Your download is ready, ${firstName}! 🎉
              </h1>
              <p style="margin:0 0 32px;font-size:16px;color:#94A3B8;line-height:1.7;">
                Here's your free resource: <strong style="color:#ffffff;">${magnet.title}</strong>
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td>
                    <a href="${downloadUrl}"
                       style="display:inline-block;padding:16px 36px;background:linear-gradient(135deg,#00D4FF,#4B84C8);color:#060B18;font-size:16px;font-weight:800;text-decoration:none;border-radius:12px;letter-spacing:0.02em;">
                      ↓ Download Your Free Guide
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:14px;color:#64748B;line-height:1.6;">
                ⏱ This link expires in <strong style="color:#94A3B8;">1 hour</strong> for security. If it expires, simply visit the blog post and request a new one.
              </p>

              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.06);margin:0 0 32px;" />

              <p style="margin:0;font-size:13px;color:#475569;line-height:1.6;">
                You're receiving this because you requested a download from 
                <a href="https://kooltechsolutions.com" style="color:#00D4FF;text-decoration:none;">kooltechsolutions.com</a>.<br/>
                We respect your privacy. We will never share your information with third parties.<br/>
                <a href="https://kooltechsolutions.com/privacy" style="color:#475569;">Privacy Policy</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#334155;">
                © ${new Date().getFullYear()} Kool Tech Solutions. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await resend.emails.send({
      from: "Kool Tech Solutions <noreply@kooltechsolutions.com>",
      to: email,
      subject: `Your free download: ${magnet.title}`,
      html: emailHtml,
    });

    // Also notify admin
    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await resend.emails.send({
        from: "Kool Tech Solutions <noreply@kooltechsolutions.com>",
        to: adminEmail,
        subject: `📥 New Lead Magnet Download — ${magnet.title}`,
        html: `<p><strong>${name}</strong> (${email}) downloaded <em>${magnet.title}</em>. Consent: ${consent ? "Yes" : "No"}.</p>`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[lead-magnets/download]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
