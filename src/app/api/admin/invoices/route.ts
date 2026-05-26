import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

async function verifyAdmin() {
  const supabase = await createClient();
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

  return { user, supabase };
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdmin();
  if ("error" in adminCheck) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { supabase } = adminCheck;

  try {
    const body = await request.json();
    const { client_id, invoice_number, amount, status, due_date, line_items, notes } = body;

    if (!client_id || !amount || !invoice_number) {
      return NextResponse.json({ error: "Client, Invoice Number and Amount are required" }, { status: 400 });
    }

    const { data: invoice, error } = await supabase
      .from("invoices")
      .insert([
        {
          client_id,
          invoice_number,
          amount,
          status: status || "outstanding",
          due_date,
          line_items: line_items || [],
          notes: notes || "",
          issued_date: new Date().toISOString().split("T")[0],
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ invoice });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
