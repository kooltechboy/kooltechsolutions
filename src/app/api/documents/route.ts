import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Fallback in-memory store for documents if database table is missing
const mockStore: Record<string, any[]> = {};

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Try DB first
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("DB documents query failed, falling back to mock storage:", error.message);
      // Return user specific mock storage
      const userDocs = mockStore[user.id] || [];
      return NextResponse.json({ documents: userDocs });
    }

    return NextResponse.json({ documents: data || [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, size, type, locked } = body;

    if (!name || !size) {
      return NextResponse.json({ error: "Name and size are required" }, { status: 400 });
    }

    const docRecord = {
      client_id: user.id,
      name,
      size,
      type: type || "PDF",
      locked: !!locked,
      created_at: new Date().toISOString(),
    };

    // Try database insert
    const { data, error } = await supabase
      .from("documents")
      .insert([docRecord])
      .select()
      .single();

    if (error) {
      console.warn("DB documents insert failed, saving to mock store:", error.message);
      if (!mockStore[user.id]) {
        mockStore[user.id] = [];
      }
      const newDoc = { id: `doc-${Math.random().toString(36).substr(2, 9)}`, ...docRecord };
      mockStore[user.id].unshift(newDoc);
      return NextResponse.json({ document: newDoc });
    }

    return NextResponse.json({ document: data });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
