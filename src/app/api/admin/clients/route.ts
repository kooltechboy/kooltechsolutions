import { createClient as createServerClient } from "@/utils/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

// Helper to create client with Service Role Key for admin tasks
function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Helper to verify if the requesting user is an admin
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

const createClientSchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(8).max(128),
  first_name: z.string().trim().min(1).max(100),
  last_name: z.string().trim().min(1).max(100),
  company_name: z.string().trim().max(200).optional(),
  phone: z.string().trim().max(30).regex(/^[+\d\s\-().]*$/).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = createClientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid client data", issues: parsed.error.issues }, { status: 400 });
    }
    const { email, password, first_name, last_name, company_name, phone } = parsed.data;

    const adminSupabase = getAdminSupabase();

    // Create user in auth.users
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name, company_name }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const newUser = authData.user;

    // Update public.profiles
    // Note: A trigger might already create the profile, so we use upsert / update
    const { error: profileError } = await adminSupabase
      .from("profiles")
      .upsert({
        id: newUser.id,
        first_name,
        last_name,
        company_name,
        phone,
        role: "client",
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({ user: newUser });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json({ error: "Valid user ID is required" }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();

    // Delete from auth.users (cascade will handle profiles if foreign key is set with cascade,
    // otherwise profiles is deleted first or manually deleted)
    const { error: profileError } = await adminSupabase.from("profiles").delete().eq("id", id);
    if (profileError) {
      console.warn("Profile delete warning:", profileError.message);
    }

    const { error: authError } = await adminSupabase.auth.admin.deleteUser(id);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
