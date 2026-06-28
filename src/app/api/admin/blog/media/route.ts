import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/utils/supabase/server";

// Admin Supabase client (service role bypasses RLS)
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

export async function GET(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json(
      { error: adminCheck.error },
      { status: adminCheck.status }
    );
  }

  try {
    const supabase = getAdminSupabase();
    // List all files in the "covers" folder
    const { data: files, error: listError } = await supabase.storage
      .from("blog-images")
      .list("covers", {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (listError) {
      return NextResponse.json(
        { error: `Failed to list files: ${listError.message}` },
        { status: 500 }
      );
    }

    // Map files to retrieve their public URL
    const mediaFiles = (files || [])
      .filter((file) => file.name !== ".emptyFolderPlaceholder")
      .map((file) => {
        const {
          data: { publicUrl },
        } = supabase.storage
          .from("blog-images")
          .getPublicUrl(`covers/${file.name}`);
        return {
          name: file.name,
          id: file.id,
          created_at: file.created_at,
          url: publicUrl,
          size: file.metadata?.size,
          mimetype: file.metadata?.mimetype,
        };
      });

    return NextResponse.json(mediaFiles);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
