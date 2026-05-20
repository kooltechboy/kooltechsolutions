import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Proxy request to RMM platform (e.g. Tactical RMM, Syncro, etc.)
    const RMM_API_KEY = process.env.RMM_API_KEY;
    // const RMM_API_URL = process.env.RMM_API_URL || "https://api.rmm.example.com";

    if (!RMM_API_KEY) {
      // Return mock data if not configured
      return NextResponse.json({
        devices: [
          { id: "1", name: "SERVER-01", os: "Windows Server 2022", status: "online", last_seen: new Date().toISOString() },
          { id: "2", name: "DESKTOP-CEO", os: "Windows 11 Pro", status: "online", last_seen: new Date().toISOString() },
          { id: "3", name: "FIREWALL-MAIN", os: "pfSense", status: "offline", last_seen: new Date(Date.now() - 86400000).toISOString() }
        ]
      });
    }

    // Real API fetch would go here
    /*
    const response = await fetch(`${RMM_API_URL}/v1/devices?client_id=${user.id}`, {
      headers: {
        "Authorization": `Bearer ${RMM_API_KEY}`,
        "Content-Type": "application/json"
      }
    });
    const data = await response.json();
    return NextResponse.json(data);
    */

    return NextResponse.json({ error: "Not implemented" }, { status: 501 });
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("RMM API Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
