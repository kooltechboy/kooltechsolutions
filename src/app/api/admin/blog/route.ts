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

const blogPostSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(300).regex(/^[a-z0-9-]+$/),
  content: z.string().max(100000),
  excerpt: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  status: z.enum(["draft", "published"]).default("draft"),
  featured_image: z.string().url().max(2000).optional().nullable(),
  read_time: z.string().max(20).optional(),
  author: z.string().max(100).optional(),
  lang: z.enum(["en", "es"]).default("en"),
  translated_from: z.string().uuid().optional().nullable(),
  meta_title: z.string().max(300).optional().nullable(),
  published_at: z.string().optional().nullable(),
  tags: z.array(z.string()).optional(),
  lead_magnet_id: z.string().uuid().optional().nullable(),
});

const blogPostUpdateSchema = blogPostSchema.partial().extend({
  id: z.string().uuid(),
});

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
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data);
    } else {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(data || []);
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = blogPostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid post data", issues: parsed.error.issues }, { status: 400 });
    }
    const supabase = getAdminSupabase();

    const { lead_magnet_id, ...postData } = parsed.data;

    const { data, error } = await supabase
      .from("posts")
      .insert([postData])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (lead_magnet_id) {
      await supabase.from("lead_magnets").update({ post_id: data.id }).eq("id", lead_magnet_id);
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  try {
    const body = await request.json();
    const parsed = blogPostUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update data", issues: parsed.error.issues }, { status: 400 });
    }
    const { id, lead_magnet_id, ...changes } = parsed.data;

    const supabase = getAdminSupabase();

    const { data, error } = await supabase
      .from("posts")
      .update(changes)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (lead_magnet_id !== undefined) {
      // First unlink any existing lead magnet linked to this post
      await supabase.from("lead_magnets").update({ post_id: null }).eq("post_id", id);
      // Then link the new one if provided
      if (lead_magnet_id) {
        await supabase.from("lead_magnets").update({ post_id: id }).eq("id", lead_magnet_id);
      }
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  try {
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
