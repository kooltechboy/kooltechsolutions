import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { ITFlowClient } from "@/lib/itflow";

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

interface OpenSearchHits<TSource> {
  hits?: {
    hits?: Array<{ _source?: TSource }>;
  };
}

interface AgentBucket {
  key: string;
  latest: { hits: { hits: Array<{ _source: Record<string, unknown> }> } };
}

interface AgentAggregationResponse {
  aggregations?: {
    agents?: {
      buckets?: AgentBucket[];
    };
  };
}

async function opensearchQuery(index: string, body: object): Promise<unknown> {
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
      rejectUnauthorized: process.env.WAZUH_TLS_VERIFY !== "0", // Only skip TLS for explicitly configured self-signed certs
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
      return NextResponse.json({
        agents: [],
        summary: { total_agents: 0, active: 0, disconnected: 0, never_connected: 0, pending: 0 },
        recent_events: [],
        _error: "Wazuh is not configured",
        _mock: false
      });
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
      }) as OpenSearchHits<{ timestamp?: string }>;

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
      }) as AgentAggregationResponse;

      const agentBuckets = agentsRes.aggregations?.agents?.buckets ?? [];

      let agents = agentBuckets.map((bucket) => {
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

      // Filter agents by ITFlow assets if user is a client (not admin)
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_name")
        .eq("id", user.id)
        .single();

      if (profile && profile.role !== "admin") {
        const { data: dbConfig } = await supabase
          .from("integration_configs")
          .select("endpoint, api_key, status")
          .eq("name", "ITFlow")
          .maybeSingle();

        const apiKey = dbConfig?.api_key || process.env.ITFLOW_API_KEY;
        const apiUrl = dbConfig?.endpoint || process.env.ITFLOW_API_URL || "https://itflow.example.com/api";
        const isConnected = dbConfig?.status === "Connected" || !!process.env.ITFLOW_API_KEY;

        if (isConnected && apiKey && apiUrl) {
          try {
            const itflowClient = new ITFlowClient({ apiUrl, apiKey });
            const itflowAssets = await itflowClient.getItems<any>("assets");

            if (itflowAssets && itflowAssets.data && Array.isArray(itflowAssets.data)) {
              const clientCompany = (profile.company_name || "").toLowerCase().trim();
              const clientAssets = itflowAssets.data
                .filter((item: any) => {
                  const clientName = (item.client_name || "").toLowerCase().trim();
                  return (
                    clientCompany !== "" &&
                    (clientName === clientCompany ||
                      clientName.includes(clientCompany) ||
                      clientCompany.includes(clientName))
                  );
                })
                .map((item: any) => ({
                  model: item.asset_model || item.asset_name || "",
                  serial: item.asset_serial || "",
                }));

              // Only keep Wazuh agents that match the client's ITFlow assets
              agents = agents.filter((dev: any) => {
                return clientAssets.some((asset: any) => {
                  return (
                    (asset.model && dev.name && asset.model.toLowerCase() === dev.name.toLowerCase()) ||
                    (asset.serial && dev.name && asset.serial.toLowerCase().includes(dev.name.toLowerCase()))
                  );
                });
              });
            } else {
              agents = [];
            }
          } catch (itflowErr) {
            console.error("Failed to query ITFlow assets in Wazuh route:", itflowErr);
            agents = [];
          }
        } else {
          agents = [];
        }
      }

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
        }) as OpenSearchHits<Record<string, unknown>>;

        recent_events = (alertsRes?.hits?.hits ?? []).map(
          (
            hit: any,
            idx: number
          ) => {
            const src = hit._source ?? {};
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

      if (profile && profile.role !== "admin") {
        const agentNames = new Set(agents.map((a: any) => a.name.toLowerCase()));
        recent_events = (recent_events as any[]).filter((evt: any) => {
          return evt.agent_name && agentNames.has(evt.agent_name.toLowerCase());
        });
      }

      return NextResponse.json({ agents, summary, recent_events });
    } catch (apiError) {
      console.error("Wazuh OpenSearch query failed:", apiError);
      return NextResponse.json({
        agents: [],
        summary: { total_agents: 0, active: 0, disconnected: 0, never_connected: 0, pending: 0 },
        recent_events: [],
        _error: apiError instanceof Error ? apiError.message : "Wazuh connection failed",
        _mock: false
      });
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Wazuh Route Error:", err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
