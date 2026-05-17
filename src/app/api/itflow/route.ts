import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'assets';

    // Proxy request to ITFlow instance
    const ITFLOW_API_KEY = process.env.ITFLOW_API_KEY;
    const ITFLOW_API_URL = process.env.ITFLOW_API_URL || "https://itflow.example.com/api";

    if (!ITFLOW_API_KEY) {
      // Return mock data based on requested endpoint
      if (endpoint === 'assets') {
        return NextResponse.json({
          data: [
            { id: "A-001", type: "Laptop", model: "Dell Latitude 5520", assignment: "John Doe", purchase_date: "2023-01-15", warranty_expires: "2026-01-15" },
            { id: "A-002", type: "Server", model: "Dell PowerEdge R740", assignment: "Main Rack", purchase_date: "2022-06-10", warranty_expires: "2025-06-10" },
            { id: "A-003", type: "Network", model: "Unifi Dream Machine Pro", assignment: "Network Closet", purchase_date: "2023-11-20", warranty_expires: "2026-11-20" }
          ]
        });
      }
      return NextResponse.json({ data: [] });
    }

    // Real API fetch
    /*
    const response = await fetch(`${ITFLOW_API_URL}/v1/${endpoint}?client_id=${user.id}`, {
      headers: {
        "Authorization": `Bearer ${ITFLOW_API_KEY}`,
        "Accept": "application/json"
      }
    });
    const data = await response.json();
    return NextResponse.json(data);
    */

    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  } catch (err: any) {
    console.error("ITFlow API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
