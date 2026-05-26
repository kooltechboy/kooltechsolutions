import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch configuration dynamically from database
    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "Tactical RMM")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.RMM_API_KEY;
    const apiUrl = dbConfig?.endpoint || process.env.RMM_API_URL || "https://api.rmm.example.com";
    const isConnected = dbConfig?.status === "Connected" || !!process.env.RMM_API_KEY;

    if (!isConnected || !apiKey) {
      // Return mock data if not configured
      return NextResponse.json({
        devices: [
          { id: "1", name: "SERVER-01", os: "Windows Server 2022", status: "online", last_seen: new Date().toISOString() },
          { id: "2", name: "DESKTOP-CEO", os: "Windows 11 Pro", status: "online", last_seen: new Date().toISOString() },
          { id: "3", name: "FIREWALL-MAIN", os: "pfSense", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() }
        ]
      });
    }

    // Real API fetch from Tactical RMM
    try {
      const response = await fetch(`${apiUrl}/api/v1/hosts/`, {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json"
        }
      });
      if (!response.ok) {
        throw new Error(`RMM API error: ${response.statusText}`);
      }
      const data = await response.json();
      return NextResponse.json(data);
    } catch (fetchErr) {
      console.warn("RMM fetch failed, falling back to mock data:", fetchErr);
      return NextResponse.json({
        devices: [
          { id: "1", name: "SERVER-01", os: "Windows Server 2022", status: "online", last_seen: new Date().toISOString(), note: "Fallback mock data due to API connection error" },
          { id: "2", name: "DESKTOP-CEO", os: "Windows 11 Pro", status: "online", last_seen: new Date().toISOString() },
          { id: "3", name: "FIREWALL-MAIN", os: "pfSense", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() }
        ]
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("RMM API Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
