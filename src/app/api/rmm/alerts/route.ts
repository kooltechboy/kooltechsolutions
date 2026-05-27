import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "Tactical RMM")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.RMM_API_KEY;
    const apiUrl = (dbConfig?.endpoint || process.env.RMM_API_URL || "").replace(/\/$/, "");

    if (!apiKey) {
      return NextResponse.json({ alerts: getMockAlerts(), source: "mock" });
    }

    try {
      const response = await fetch(`${apiUrl}/api/v3/alerts/?resolved=false`, {
        headers: { "X-API-KEY": apiKey, "Accept": "application/json" },
        cache: "no-store",
      });
      if (!response.ok) {
        return NextResponse.json({ alerts: getMockAlerts(), source: "fallback" });
      }
      const data = await response.json();
      const alerts = Array.isArray(data) ? data : data.results ?? [];
      return NextResponse.json({ alerts, source: "live", total: alerts.length });
    } catch {
      return NextResponse.json({ alerts: getMockAlerts(), source: "fallback" });
    }
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unknown error" }, { status: 500 });
  }
}

function getMockAlerts() {
  return [
    { id: 1, hostname: "FIREWALL-MAIN", alert_type: "availability", severity: "error", message: "Agent offline for over 24 hours", resolved: false, alert_time: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, hostname: "SERVER-DC01", alert_type: "check", severity: "warning", message: "Disk usage above 80% on C:\\", resolved: false, alert_time: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, hostname: "DESKTOP-CEO", alert_type: "patch", severity: "info", message: "Reboot required to complete updates", resolved: false, alert_time: new Date(Date.now() - 7200000).toISOString() },
  ];
}
