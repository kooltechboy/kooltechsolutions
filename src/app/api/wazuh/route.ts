import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Wazuh API client with JWT auth
async function getWazuhToken(apiUrl: string, username: string, password: string): Promise<string> {
  const credentials = Buffer.from(`${username}:${password}`).toString("base64");

  const response = await fetch(`${apiUrl}/security/user/authenticate`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
    // Wazuh often uses self-signed certs in internal deployments
    // In production, ensure proper cert validation
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`Wazuh auth failed (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const token = data?.data?.token;

  if (!token) {
    throw new Error("No token returned from Wazuh auth endpoint");
  }

  return token;
}

async function wazuhFetch(apiUrl: string, token: string, endpoint: string) {
  const response = await fetch(`${apiUrl}${endpoint}`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`Wazuh API error at ${endpoint}: ${response.status}`);
  }

  return response.json();
}

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Pull config from DB or env vars
    const { data: dbConfig } = await supabase
      .from("integration_configs")
      .select("endpoint, api_key, status")
      .eq("name", "Wazuh SIEM")
      .maybeSingle();

    const apiUrl = dbConfig?.endpoint || process.env.WAZUH_API_URL;
    const apiUser = process.env.WAZUH_API_USER || "admin";
    const apiPassword = dbConfig?.api_key || process.env.WAZUH_API_PASSWORD;

    // Fall back to mock data if not configured
    if (!apiUrl || !apiPassword) {
      return NextResponse.json(getMockData());
    }

    // --- Real Wazuh API flow ---
    try {
      const token = await getWazuhToken(apiUrl, apiUser, apiPassword);

      // Fetch agents
      const agentsRes = await wazuhFetch(apiUrl, token, "/agents?limit=100&sort=-lastKeepAlive");
      const rawAgents = agentsRes?.data?.affected_items ?? [];

      const agents = rawAgents.map((a: Record<string, unknown>) => ({
        id: a.id,
        name: a.name,
        ip: a.ip || a.registerIP || "N/A",
        os: typeof a.os === 'object' && a.os !== null ? (a.os as Record<string, string>).platform || "Unknown" : "Unknown",
        version: a.version || "Unknown",
        status: a.status,
        lastKeepAlive: a.lastKeepAlive || a.dateAdd,
      }));

      const summary = {
        total_agents: agentsRes?.data?.total_affected_items ?? agents.length,
        active: agents.filter((a: { status: string }) => a.status === "active").length,
        disconnected: agents.filter((a: { status: string }) => a.status === "disconnected").length,
        never_connected: agents.filter((a: { status: string }) => a.status === "never_connected").length,
        pending: agents.filter((a: { status: string }) => a.status === "pending").length,
      };

      // Fetch recent security alerts (level 7+)
      let recent_events: unknown[] = [];
      try {
        const alertsRes = await wazuhFetch(
          apiUrl,
          token,
          "/security/events?limit=10&sort=-timestamp&q=rule.level>6"
        );
        const rawAlerts = alertsRes?.data?.affected_items ?? [];
        recent_events = rawAlerts.map((evt: Record<string, unknown>, idx: number) => ({
          id: `evt-${idx}`,
          rule_level: typeof evt.rule === 'object' && evt.rule !== null ? (evt.rule as Record<string, unknown>).level ?? 0 : 0,
          description: typeof evt.rule === 'object' && evt.rule !== null ? (evt.rule as Record<string, unknown>).description ?? "Security event" : "Security event",
          agent_name: typeof evt.agent === 'object' && evt.agent !== null ? (evt.agent as Record<string, string>).name ?? "Unknown" : "Unknown",
          timestamp: evt.timestamp,
        }));
      } catch {
        // Alerts endpoint may not be available on all Wazuh versions; non-fatal
        console.warn("Could not fetch Wazuh alerts — may be a version compatibility issue.");
      }

      return NextResponse.json({ agents, summary, recent_events });

    } catch (apiError) {
      console.error("Live Wazuh API call failed, returning mock data:", apiError);
      // Return mock data with an error flag so the frontend can show a warning
      return NextResponse.json({
        ...getMockData(),
        _error: apiError instanceof Error ? apiError.message : "Wazuh connection failed",
        _mock: true,
      });
    }

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Wazuh Route Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function getMockData() {
  return {
    _mock: true,
    agents: [
      {
        id: "000",
        name: "wazuh-server",
        ip: "127.0.0.1",
        os: "Ubuntu 22.04.4 LTS",
        version: "Wazuh v4.7.2",
        status: "active",
        lastKeepAlive: new Date().toISOString(),
      },
      {
        id: "001",
        name: "DESKTOP-CEO",
        ip: "192.168.1.105",
        os: "Windows 11 Pro",
        version: "Wazuh v4.7.2",
        status: "active",
        lastKeepAlive: new Date().toISOString(),
      },
      {
        id: "002",
        name: "SERVER-DC-01",
        ip: "192.168.1.10",
        os: "Windows Server 2022",
        version: "Wazuh v4.7.2",
        status: "active",
        lastKeepAlive: new Date().toISOString(),
      },
      {
        id: "003",
        name: "LAPTOP-EMP-04",
        ip: "192.168.1.112",
        os: "Windows 10 Pro",
        version: "Wazuh v4.6.0",
        status: "disconnected",
        lastKeepAlive: new Date(Date.now() - 86400000).toISOString(),
      },
    ],
    summary: {
      total_agents: 4,
      active: 3,
      disconnected: 1,
      never_connected: 0,
      pending: 0,
    },
    recent_events: [
      {
        id: "evt-1",
        rule_level: 12,
        description: "Multiple authentication failures",
        agent_name: "SERVER-DC-01",
        timestamp: new Date(Date.now() - 1500000).toISOString(),
      },
      {
        id: "evt-2",
        rule_level: 10,
        description: "Suspicious network connection detected",
        agent_name: "DESKTOP-CEO",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  };
}
