import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";
import { z } from "zod";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") return { error: "Forbidden", status: 403 };
  return { user };
}

const MAX_PDF_BYTES = 25 * 1024 * 1024; // 25 MB

const updateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional().nullable(),
  cta_button_text: z.string().max(100).optional(),
  active: z.boolean().optional(),
  post_id: z.string().uuid().optional().nullable(),
});

// ── GET: list all lead magnets (with linked post titles) ─────
export async function GET(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const supabase = getAdminSupabase();

  try {
    if (id) {
      const { data, error } = await supabase
        .from("lead_magnets")
        .select("*, posts(id, title, slug)")
        .eq("id", id)
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("lead_magnets")
      .select("*, posts(id, title, slug)")
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data || []);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── POST: create a new lead magnet (multipart/form-data with PDF) ──
export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File | null;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const cta_button_text = (formData.get("cta_button_text") as string) || "Download Free Guide";
    const post_id = (formData.get("post_id") as string) || null;

    if (!title || !pdfFile) {
      return NextResponse.json({ error: "title and pdf file are required" }, { status: 400 });
    }

    // Validate PDF
    if (pdfFile.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }
    if (pdfFile.size > MAX_PDF_BYTES) {
      return NextResponse.json({ error: "PDF too large. Maximum size is 25MB." }, { status: 400 });
    }

    const safeName = pdfFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `guides/${Date.now()}-${safeName}`;

    const bytes = await pdfFile.arrayBuffer();
    const supabase = getAdminSupabase();

    const { error: uploadError } = await supabase.storage
      .from("lead-magnets")
      .upload(storagePath, new Uint8Array(bytes), {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: `PDF upload failed: ${uploadError.message}` }, { status: 500 });
    }

    const { data, error } = await supabase
      .from("lead_magnets")
      .insert([{
        title,
        description: description || null,
        cta_button_text,
        post_id: post_id || null,
        pdf_url: storagePath,
        pdf_filename: pdfFile.name,
        active: true,
      }])
      .select("*, posts(id, title, slug)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── PATCH: update lead magnet metadata ────────────────────────
export async function PATCH(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", issues: parsed.error.issues }, { status: 400 });
    }
    const { id, ...changes } = parsed.data;
    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("lead_magnets")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, posts(id, title, slug)")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

// ── DELETE: remove lead magnet + PDF from storage ─────────────
export async function DELETE(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const supabase = getAdminSupabase();

  try {
    // Fetch the pdf_url first so we can clean up storage
    const { data: magnet } = await supabase
      .from("lead_magnets")
      .select("pdf_url")
      .eq("id", id)
      .single();

    if (magnet?.pdf_url) {
      await supabase.storage.from("lead-magnets").remove([magnet.pdf_url]);
    }

    const { error } = await supabase.from("lead_magnets").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
