import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// ──────────────────────────────────────────────────────────────────────────────
// Wazuh data is fetched via the OpenSearch Dashboard's /api/console/proxy
// endpoint using Basic Auth. The Wazuh Manager REST API (port 55000) is not
// exposed externally, but all data lives in the OpenSearch indices.
// ──────────────────────────────────────────────────────────────────────────────

import https from "https";

const DASHBOARD_URL = process.env.WAZUH_API_URL || "";
const BASIC_AUTH = Buffer.from(
  `${process.env.WAZUH_API_USER || "admin"}:${process.env.WAZUH_API_PASSWORD || ""}`
).toString("base64");

const OPENSEARCH_HEADERS = {
  Authorization: `Basic ${BASIC_AUTH}`,
  "Content-Type": "application/json",
  "osd-xsrf": "true",
};

async function opensearchQuery(index: string, body: object): Promise<any> {
  const encodedPath = encodeURIComponent(`/${index}/_search`);
  const url = `${DASHBOARD_URL}/api/console/proxy?path=${encodedPath}&method=GET`;

  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === "https:" ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: "POST",
      headers: OPENSEARCH_HEADERS,
      rejectUnauthorized: false, // Bypass self-signed cert validation issues in Next.js
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Invalid JSON response: ${data.slice(0, 100)}`));
          }
        } else {
          reject(new Error(`HTTP Error ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    // Handle timeout
    req.setTimeout(12000, () => {
      req.destroy(new Error("Request timeout"));
    });

    req.write(JSON.stringify(body));
    req.end();
  });
}

export async function GET(_request: Request) {
  // Disable self-signed cert rejection for internal SIEM server
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!DASHBOARD_URL || !process.env.WAZUH_API_PASSWORD) {
      return NextResponse.json(getMockData());
    }

    try {
      // ── 1. Find the latest monitoring snapshot timestamp ───────────────────
      // The wazuh-monitoring-* index stores periodic snapshots (every ~15 min).
      // Querying all history returns stale/deleted agents; we only want the
      // most recent snapshot window to get the true current agent inventory.
      const latestDoc = await opensearchQuery("wazuh-monitoring-*", {
        size: 1,
        sort: [{ timestamp: { order: "desc" } }],
        _source: ["timestamp"],
      });

      const latestTimestamp: string | null =
        latestDoc?.hits?.hits?.[0]?._source?.timestamp ?? null;

      // Build the time filter: use the exact latest snapshot timestamp,
      // otherwise fall back to the last 30 minutes.
      const snapshotFilter = latestTimestamp
        ? {
            term: {
              timestamp: latestTimestamp
            }
          }
        : {
            range: {
              timestamp: { gte: "now-30m" },
            },
          };

      // ── 2. Fetch agents from that snapshot window only ─────────────────────
      const agentsRes = await opensearchQuery("wazuh-monitoring-*", {
        size: 0,
        query: snapshotFilter,
        aggs: {
          agents: {
            terms: { field: "id", size: 200 },
            aggs: {
              latest: {
                top_hits: {
                  size: 1,
                  sort: [{ timestamp: { order: "desc" } }],
                  _source: [
                    "id",
                    "name",
                    "ip",
                    "status",
                    "os.name",
                    "os.platform",
                    "version",
                    "lastKeepAlive",
                  ],
                },
              },
            },
          },
        },
      });

      const agentBuckets: Array<{
        key: string;
        latest: { hits: { hits: Array<{ _source: Record<string, unknown> }> } };
      }> = agentsRes?.aggregations?.agents?.buckets ?? [];

      const agents = agentBuckets.map((bucket) => {
        const src = bucket.latest?.hits?.hits?.[0]?._source ?? {};
        const os = src.os as Record<string, string> | undefined;
        return {
          id: src.id ?? bucket.key,
          name: src.name ?? "Unknown",
          ip: src.ip ?? "N/A",
          os: os?.name ?? os?.platform ?? "Unknown",
          version: src.version ?? "Unknown",
          status: src.status ?? "unknown",
          lastKeepAlive: src.lastKeepAlive ?? null,
        };
      });

      // Build summary from actual agent statuses (not aggregation doc counts)
      const summary = {
        total_agents: agents.length,
        active: agents.filter((a) => a.status === "active").length,
        disconnected: agents.filter((a) => a.status === "disconnected").length,
        never_connected: agents.filter((a) => a.status === "never_connected").length,
        pending: agents.filter((a) => a.status === "pending").length,
      };

      // ── 2. Fetch recent high-severity alerts ───────────────────────────────
      let recent_events: unknown[] = [];
      try {
        const alertsRes = await opensearchQuery("wazuh-alerts-*", {
          size: 10,
          sort: [{ timestamp: { order: "desc" } }],
          _source: ["rule.level", "rule.description", "rule.id", "agent.name", "timestamp"],
          query: {
            range: { "rule.level": { gte: 7 } },
          },
        });

        recent_events = (alertsRes?.hits?.hits ?? []).map(
          (
            hit: { _source: Record<string, unknown> },
            idx: number
          ) => {
            const src = hit._source;
            const rule = src.rule as Record<string, unknown> | undefined;
            const agent = src.agent as Record<string, string> | undefined;
            return {
              id: `evt-${idx}`,
              rule_level: rule?.level ?? 0,
              rule_id: rule?.id ?? "unknown",
              description: rule?.description ?? "Security event",
              agent_name: agent?.name ?? "Unknown",
              timestamp: src.timestamp,
            };
          }
        );
      } catch (alertErr) {
        console.warn("Could not fetch Wazuh alerts:", alertErr);
      }

      return NextResponse.json({ agents, summary, recent_events });
    } catch (apiError) {
      console.error("Wazuh OpenSearch query failed, falling back to mock:", apiError);
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
        name: "pve-host",
        ip: "192.168.250.11",
        os: "Debian GNU/Linux",
        version: "Wazuh v4.14.5",
        status: "active",
        lastKeepAlive: new Date().toISOString(),
      },
    ],
    summary: { total_agents: 2, active: 2, disconnected: 0, never_connected: 0, pending: 0 },
    recent_events: [],
  };
}
