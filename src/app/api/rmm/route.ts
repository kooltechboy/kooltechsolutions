import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch configuration dynamically from database or env
    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "Tactical RMM")
      .maybeSingle();

    const apiKey = dbConfig?.api_key || process.env.RMM_API_KEY;
    const apiUrl = (dbConfig?.endpoint || process.env.RMM_API_URL || "").replace(/\/$/, "");
    const isConnected = dbConfig?.status === "Connected" || !!process.env.RMM_API_KEY;

    if (!isConnected || !apiKey) {
      return NextResponse.json({ agents: getMockAgents(), source: "mock" });
    }

    // Real API fetch from Tactical RMM v3
    try {
      const response = await fetch(`${apiUrl}/api/v3/agents/`, {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        cache: "no-store",
      });

      if (!response.ok) {
        console.warn(`Tactical RMM API responded ${response.status} ${response.statusText}`);
        return NextResponse.json({ agents: getMockAgents(), source: "fallback", error: `API ${response.status}` });
      }

      const data = await response.json();

      // Normalise the Tactical RMM response shape
      const rawAgents = Array.isArray(data) ? data : data.agents ?? [];
      const agents = rawAgents.map((a: any) => ({
        id: a.agent_id ?? a.id,
        hostname: a.hostname,
        description: a.description ?? "",
        client: a.client_name ?? a.client ?? "",
        site: a.site_name ?? a.site ?? "",
        os: a.operating_system ?? a.os ?? "",
        status: a.status === "online" || a.overdue_text === false ? "online" : "offline",
        last_seen: a.last_seen,
        cpu_load: a.cpu_load ?? 0,
        used_ram: a.used_ram ?? 0,
        total_ram: a.total_ram ?? 0,
        boot_time: a.boot_time,
        checks: {
          passing: a.checks?.passing ?? 0,
          failing: a.checks?.failing ?? 0,
          warning: a.checks?.warning ?? 0,
          info: a.checks?.info ?? 0,
        },
        patch_policy: a.patch_policy ?? null,
        needs_reboot: a.needs_reboot ?? false,
        overdue_dashboard_alert: a.overdue_dashboard_alert ?? false,
      }));

      return NextResponse.json({ agents, source: "live", total: agents.length });
    } catch (fetchErr) {
      console.warn("Tactical RMM fetch failed, falling back to mock:", fetchErr);
      return NextResponse.json({ agents: getMockAgents(), source: "fallback" });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("RMM API Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function getMockAgents() {
  return [
    {
      id: "mock-001",
      hostname: "SERVER-DC01",
      description: "Primary Domain Controller",
      client: "KoolTech Solutions",
      site: "Main Office",
      os: "Windows Server 2022 Standard",
      status: "online",
      last_seen: new Date().toISOString(),
      cpu_load: 12,
      used_ram: 8,
      total_ram: 32,
      boot_time: new Date(Date.now() - 86400000 * 7).toISOString(),
      checks: { passing: 18, failing: 0, warning: 1, info: 2 },
      needs_reboot: false,
      overdue_dashboard_alert: false,
    },
    {
      id: "mock-002",
      hostname: "DESKTOP-CEO",
      description: "Executive Workstation",
      client: "KoolTech Solutions",
      site: "Main Office",
      os: "Windows 11 Pro",
      status: "online",
      last_seen: new Date().toISOString(),
      cpu_load: 35,
      used_ram: 14,
      total_ram: 16,
      boot_time: new Date(Date.now() - 86400000 * 2).toISOString(),
      checks: { passing: 12, failing: 0, warning: 0, info: 1 },
      needs_reboot: true,
      overdue_dashboard_alert: false,
    },
    {
      id: "mock-003",
      hostname: "FIREWALL-MAIN",
      description: "Edge Firewall",
      client: "KoolTech Solutions",
      site: "Main Office",
      os: "pfSense 2.7.2",
      status: "offline",
      last_seen: new Date(Date.now() - 86400000).toISOString(),
      cpu_load: 0,
      used_ram: 0,
      total_ram: 8,
      boot_time: null,
      checks: { passing: 0, failing: 3, warning: 0, info: 0 },
      needs_reboot: false,
      overdue_dashboard_alert: true,
    },
    {
      id: "mock-004",
      hostname: "NAS-STORAGE01",
      description: "Primary NAS",
      client: "KoolTech Solutions",
      site: "Server Room",
      os: "TrueNAS SCALE",
      status: "online",
      last_seen: new Date().toISOString(),
      cpu_load: 8,
      used_ram: 24,
      total_ram: 64,
      boot_time: new Date(Date.now() - 86400000 * 30).toISOString(),
      checks: { passing: 10, failing: 0, warning: 0, info: 0 },
      needs_reboot: false,
      overdue_dashboard_alert: false,
    },
  ];
}
