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

    // Fetch configuration dynamically from database
    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "ITFlow")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";
    const isConnected = dbConfig?.status === "Connected" || !!process.env.ITFLOW_API_KEY;

    if (!isConnected || !apiKey) {
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

    // Real API fetch from ITFlow
    try {
      const response = await fetch(`${apiUrl}/v1/${endpoint}`, {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Accept": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`ITFlow API error: ${response.statusText}`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchErr) {
      console.warn("ITFlow fetch failed, falling back to mock data:", fetchErr);
      if (endpoint === 'assets') {
        return NextResponse.json({
          data: [
            { id: "A-001", type: "Laptop", model: "Dell Latitude 5520", assignment: "John Doe", purchase_date: "2023-01-15", warranty_expires: "2026-01-15", note: "Fallback mock data due to API connection error" },
            { id: "A-002", type: "Server", model: "Dell PowerEdge R740", assignment: "Main Rack", purchase_date: "2022-06-10", warranty_expires: "2025-06-10" },
            { id: "A-003", type: "Network", model: "Unifi Dream Machine Pro", assignment: "Network Closet", purchase_date: "2023-11-20", warranty_expires: "2026-11-20" }
          ]
        });
      }
      return NextResponse.json({ data: [] });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("ITFlow API Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
