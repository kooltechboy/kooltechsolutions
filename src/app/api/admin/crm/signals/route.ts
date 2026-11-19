import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function verifyAdmin() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { error: "Forbidden", status: 403 };
  }

  return { user };
}

export async function GET(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("lead_id");

  const adminSupabase = getAdminSupabase();
  let query = adminSupabase.from("crm_signals").select("*").order("created_at", { ascending: false });

  if (leadId) query = query.eq("lead_id", leadId);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const { lead_id, type, title, details } = body;

    if (!type || !title) {
      return NextResponse.json({ error: "Type and title are required" }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    const { data, error } = await adminSupabase
      .from("crm_signals")
      .insert({
        lead_id: lead_id || null,
        type,
        title,
        details: details || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
