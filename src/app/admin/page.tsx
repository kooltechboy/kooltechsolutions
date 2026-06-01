"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Users, Ticket, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Activity, ArrowRight, Loader2, Monitor, Package, ShieldCheck, ShieldAlert } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

const priorityColor: Record<string, string> = {
  critical: "#FF4444", high: "#FFB300", normal: "#00D4FF", low: "#00E676",
};
const statusColor: Record<string, string> = {
  open: "#00D4FF", in_progress: "#FFB300", resolved: "#00E676", closed: "#64748B", waiting_on_client: "#A855F7",
};

interface RMMDevice {
  id: string;
  name: string;
  os: string;
  status: string;
  last_seen: string;
  note?: string;
}

interface ITFlowAsset {
  id: string;
  type: string;
  model: string;
  assignment: string;
  purchase_date: string;
  warranty_expires: string;
  note?: string;
}

interface Action1Endpoint {
  id: string;
  name: string;
  os: string;
  patches_missing: number;
  patches_installed: number;
  last_scan: string;
  status: string;
  note?: string;
}

interface Action1Summary {
  total_endpoints: number;
  compliant: number;
  needs_attention: number;
  critical: number;
  total_missing_patches: number;
}

interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  status: string;
}

interface WazuhEvent {
  id: string;
  rule_level: number;
  description: string;
  agent_name: string;
  timestamp: string;
}

interface WazuhData {
  agents: WazuhAgent[];
  summary: { total_agents: number; active: number; disconnected: number };
  recent_events: WazuhEvent[];
  _mock?: boolean;
  _error?: string;
}

interface ClientDetails {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface Ticket {
  id: string;
  client?: ClientDetails | ClientDetails[] | null;
  subject: string;
  priority: string;
  status: string;
  created_at: string;
}

interface IntegrationHealth {
  name: string;
  status: string;
  ok: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ leads: 0, clients: 0, openTickets: 0, aiConversations: 0 });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [revenueData, setRevenueData] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [currentMrr, setCurrentMrr] = useState(0);
  const [integrations, setIntegrations] = useState<IntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);

  // Live Telemetry State
  const [rmmDevices, setRmmDevices] = useState<RMMDevice[]>([]);
  const [rmmSource, setRmmSource] = useState<string>("mock");
  const [itflowAssets, setItflowAssets] = useState<ITFlowAsset[]>([]);
  const [itflowMock, setItflowMock] = useState<boolean>(true);
  const [action1Endpoints, setAction1Endpoints] = useState<Action1Endpoint[]>([]);
  const [action1Summary, setAction1Summary] = useState<Action1Summary | null>(null);
  const [action1Mock, setAction1Mock] = useState<boolean>(true);
  const [wazuhData, setWazuhData] = useState<WazuhData | null>(null);
  const [telemetryLoading, setTelemetryLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const [leadsRes, clientsRes, ticketsRes, logsRes, invoicesRes, integrationsRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client"),
        supabase.from("tickets").select("*, client:client_id(first_name, last_name, company_name)").order("created_at", { ascending: false }),
        supabase.from("agent_logs").select("id", { count: "exact" }),
        supabase.from("invoices").select("amount, created_at").eq("status", "paid"),
        supabase.from("integration_configs").select("name, status").order("category"),
      ]);

      const allTickets = (ticketsRes.data || []) as Ticket[];
      setStats({
        leads: leadsRes.count || 0,
        clients: clientsRes.count || 0,
        openTickets: allTickets.filter((t) => t.status === "open" || t.status === "in_progress").length,
        aiConversations: logsRes.count || 0,
      });
      setRecentTickets(allTickets.slice(0, 5));

      // Calculate MRR Trend (Last 6 Months)
      const invs = invoicesRes.data || [];
      const now = new Date();
      const last6Months = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        return {
          monthStr: d.toLocaleString("default", { month: "short" }),
          year: d.getFullYear(),
          month: d.getMonth(),
          total: 0,
        };
      });

      invs.forEach((inv) => {
        const d = new Date(inv.created_at);
        const target = last6Months.find((m) => m.year === d.getFullYear() && m.month === d.getMonth());
        if (target) target.total += inv.amount;
      });

      setMonths(last6Months.map((m) => m.monthStr));
      const rData = last6Months.map((m) => m.total);
      setRevenueData(rData);
      setCurrentMrr(rData[5] || 0);

      // Integration Health
      const intgs = integrationsRes.data || [];
      setIntegrations(intgs.map(i => ({
        name: i.name,
        status: i.status,
        ok: i.status === "Connected"
      })));

      setLoading(false);
    }
    fetchData();

    // Fetch live telemetry from the integration proxies
    async function fetchTelemetry() {
      try {
        const [rmmRes, itflowRes, action1Res, wazuhRes] = await Promise.allSettled([
          fetch("/api/rmm"),
          fetch("/api/itflow?endpoint=assets"),
          fetch("/api/action1"),
          fetch("/api/wazuh"),
        ]);

        if (rmmRes.status === "fulfilled" && rmmRes.value.ok) {
          const json = await rmmRes.value.json();
          const agents = json.agents || [];
          setRmmSource(json.source || "mock");
          setRmmDevices(agents.map((a: any) => ({
            id: a.id || a.agent_id,
            name: a.hostname,
            os: a.os,
            status: a.status,
            last_seen: a.last_seen,
          })));
        }
        if (itflowRes.status === "fulfilled" && itflowRes.value.ok) {
          const json = await itflowRes.value.json();
          setItflowMock(!!json._mock);
          setItflowAssets(json.data || []);
        }
        if (action1Res.status === "fulfilled" && action1Res.value.ok) {
          const json = await action1Res.value.json();
          setAction1Mock(!!json._mock);
          setAction1Endpoints(json.endpoints || []);
          setAction1Summary(json.summary || null);
        }
        if (wazuhRes.status === "fulfilled" && wazuhRes.value.ok) {
          const json = await wazuhRes.value.json();
          setWazuhData(json);
        }
      } catch (e) {
        console.warn("Telemetry fetch error:", e);
      } finally {
        setTelemetryLoading(false);
      }
    }
    fetchTelemetry();
  }, [supabase]);

  const maxRevenue = Math.max(...revenueData, 1000); // minimum scale

  const kpis = [
    { icon: DollarSign, label: "MRR", value: loading ? "—" : `$${currentMrr.toLocaleString()}`, change: "+12%", up: true, color: "#00E676", note: "Projected" },
    { icon: Users, label: "Active Clients", value: loading ? "—" : stats.clients.toString(), change: "+8", up: true, color: "#00D4FF" },
    { icon: Ticket, label: "Open Tickets", value: loading ? "—" : stats.openTickets.toString(), change: "", up: false, color: "#FFB300" },
    { icon: TrendingUp, label: "Leads in Pipeline", value: loading ? "—" : stats.leads.toString(), change: "", up: true, color: "#A855F7" },
    { icon: AlertTriangle, label: "SLA Breach Risk", value: "2", change: "", up: false, color: "#FF4444" },
    { icon: Activity, label: "AI Conversations", value: loading ? "—" : stats.aiConversations.toString(), change: "+24%", up: true, color: "#4B84C8" },
  ];

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-accent-500)" />
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Operations <span className="gradient-text">Overview</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Real-time business intelligence for Kool Tech Solutions.</p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.label} 
            className="kpi-card"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={18} color={kpi.color} />
              </div>
              {kpi.change && (
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: kpi.up ? "#00E676" : "#FF4444", fontSize: "0.75rem", fontWeight: 600 }}>
                  {kpi.up ? <ArrowUp size={12} /> : <ArrowDown size={12} />} {kpi.change}
                </div>
              )}
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.625rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem", marginTop: "0.2rem" }}>{kpi.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        {/* Revenue Chart */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.5rem" }}>MRR Trend (6 Months)</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", height: "120px" }}>
            {revenueData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0",
                    height: `${(val / maxRevenue) * 100}%`,
                    background: i === revenueData.length - 1 ? "linear-gradient(180deg, #00D4FF, #1E4D8C)" : "rgba(75,132,200,0.25)",
                    border: i === revenueData.length - 1 ? "1px solid rgba(0,212,255,0.4)" : "1px solid rgba(75,132,200,0.15)",
                    transition: "height 0.5s ease",
                  }} />
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem", textAlign: "center" }}>{months[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(75,132,200,0.1)" }}>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Current MRR</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white" }}>${currentMrr.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>ARR Projection</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-accent-500)" }}>${(currentMrr * 12).toLocaleString()}</div>
            </div>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>MoM Growth</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-success)" }}>
                {revenueData[4] ? `+${Math.round(((currentMrr - revenueData[4]) / revenueData[4]) * 100)}%` : '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>Integration Health</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem", maxHeight: "200px", overflowY: "auto", paddingRight: "0.5rem" }}>
            {integrations.length === 0 ? (
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", textAlign: "center", padding: "2rem 0" }}>No integrations configured.</div>
            ) : integrations.map(intg => (
              <div key={intg.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.8125rem" }}>{intg.name}</span>
                <span className={`badge ${intg.ok ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
                  {intg.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live Systems Telemetry ── */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.1rem" }}>
            Live Systems <span className="gradient-text">Telemetry</span>
          </h2>
          <Link href="/admin/integrations" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
            Manage Integrations <ArrowRight size={13} />
          </Link>
        </div>

        {telemetryLoading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "120px" }}>
            <Loader2 className="animate-spin" size={32} color="var(--color-accent-500)" />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.25rem" }}>

            {/* ── Tactical RMM Panel ── */}
            <motion.div className="kpi-card" style={{ padding: "1.25rem" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.015 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Monitor size={16} color="#00D4FF" />
                </div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Tactical RMM</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Managed Devices</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: rmmDevices.length > 0 ? (rmmSource === "live" ? "#00E676" : "#FFB300") : "#FF4444",
                    boxShadow: rmmDevices.length > 0 ? (rmmSource === "live" ? "0 0 6px #00E676" : "0 0 6px #FFB300") : "none"
                  }} />
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem" }}>
                    {rmmDevices.length > 0 ? (rmmSource === "live" ? "Live" : "Mock Data") : "No Data"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {rmmDevices.length === 0 ? (
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", textAlign: "center", padding: "1.5rem 0" }}>No devices found. Configure Tactical RMM in Integrations.</div>
                ) : rmmDevices.map(device => (
                  <div key={device.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.625rem", borderRadius: "8px", background: "rgba(75,132,200,0.07)", border: "1px solid rgba(75,132,200,0.1)" }}>
                    <div>
                      <div style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{device.name}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>{device.os}</div>
                    </div>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "20px", textTransform: "capitalize",
                      background: device.status === "online" ? "rgba(0,230,118,0.15)" : "rgba(255,68,68,0.15)",
                      color: device.status === "online" ? "#00E676" : "#FF4444",
                      border: `1px solid ${device.status === "online" ? "rgba(0,230,118,0.3)" : "rgba(255,68,68,0.3)"}`
                    }}>{device.status}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(75,132,200,0.1)", display: "flex", gap: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#00E676", fontSize: "1.1rem" }}>{rmmDevices.filter(d => d.status === "online").length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Online</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#FF4444", fontSize: "1.1rem" }}>{rmmDevices.filter(d => d.status === "offline").length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Offline</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.1rem" }}>{rmmDevices.length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Total</div>
                </div>
              </div>
            </motion.div>

            {/* ── ITFlow Panel ── */}
            <motion.div className="kpi-card" style={{ padding: "1.25rem" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.015 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: "rgba(168,85,247,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Package size={16} color="#A855F7" />
                </div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>ITFlow PSA</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Live Sync: Tickets, Clients & Assets</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: itflowAssets.length > 0 ? (itflowMock ? "#FFB300" : "#00E676") : "#FF4444",
                    boxShadow: itflowAssets.length > 0 ? (itflowMock ? "0 0 6px #FFB300" : "0 0 6px #00E676") : "none"
                  }} />
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem" }}>
                    {itflowAssets.length > 0 ? (itflowMock ? "Mock Data" : "Live") : "No Data"}
                  </span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "180px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {itflowAssets.length === 0 ? (
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", textAlign: "center", padding: "1.5rem 0" }}>No assets found. Configure ITFlow in Integrations.</div>
                ) : itflowAssets.map(asset => (
                  <div key={asset.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.625rem", borderRadius: "8px", background: "rgba(75,132,200,0.07)", border: "1px solid rgba(75,132,200,0.1)" }}>
                    <div>
                      <div style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{asset.model}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>{asset.type} · {asset.assignment}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "var(--color-neutral-400)", fontSize: "0.65rem" }}>Warranty</div>
                      <div style={{ color: new Date(asset.warranty_expires) > new Date() ? "#00E676" : "#FF4444", fontSize: "0.68rem", fontWeight: 600 }}>
                        {new Date(asset.warranty_expires).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "0.875rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(75,132,200,0.1)", display: "flex", gap: "1rem" }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#A855F7", fontSize: "1.1rem" }}>{itflowAssets.length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Total Assets</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#00E676", fontSize: "1.1rem" }}>{itflowAssets.filter(a => new Date(a.warranty_expires) > new Date()).length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Under Warranty</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#FF4444", fontSize: "1.1rem" }}>{itflowAssets.filter(a => new Date(a.warranty_expires) <= new Date()).length}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>Expired</div>
                </div>
              </div>
            </motion.div>

            {/* ── Action1 Patch Status Panel ── */}
            <motion.div className="kpi-card" style={{ padding: "1.25rem" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.015 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: "rgba(255,179,0,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldCheck size={16} color="#FFB300" />
                </div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Action1</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Patch Compliance</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: action1Endpoints.length > 0 ? (action1Mock ? "#FFB300" : "#00E676") : "#FF4444",
                    boxShadow: action1Endpoints.length > 0 ? (action1Mock ? "0 0 6px #FFB300" : "0 0 6px #00E676") : "none"
                  }} />
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem" }}>
                    {action1Endpoints.length > 0 ? (action1Mock ? "Mock Data" : "Live") : "No Data"}
                  </span>
                </div>
              </div>
              {action1Summary && (
                <div style={{ display: "flex", gap: "0.625rem", marginBottom: "0.875rem" }}>
                  <div style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#00E676", fontSize: "1.1rem" }}>{action1Summary.compliant}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem" }}>Compliant</div>
                  </div>
                  <div style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)", textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#FFB300", fontSize: "1.1rem" }}>{action1Summary.needs_attention}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem" }}>Needs Attn</div>
                  </div>
                  <div style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", textAlign: "center" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#FF4444", fontSize: "1.1rem" }}>{action1Summary.critical}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem" }}>Critical</div>
                  </div>
                </div>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "150px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {action1Endpoints.length === 0 ? (
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", textAlign: "center", padding: "1.5rem 0" }}>No endpoints found. Configure Action1 in Integrations.</div>
                ) : action1Endpoints.map(ep => (
                  <div key={ep.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem 0.625rem", borderRadius: "8px", background: "rgba(75,132,200,0.07)", border: "1px solid rgba(75,132,200,0.1)" }}>
                    <div>
                      <div style={{ color: "white", fontSize: "0.8rem", fontWeight: 600 }}>{ep.name}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>{ep.os}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{
                        fontSize: "0.63rem", fontWeight: 700, padding: "0.18rem 0.5rem", borderRadius: "20px",
                        background: ep.status === "Compliant" ? "rgba(0,230,118,0.15)" : ep.status === "Critical" ? "rgba(255,68,68,0.15)" : "rgba(255,179,0,0.15)",
                        color: ep.status === "Compliant" ? "#00E676" : ep.status === "Critical" ? "#FF4444" : "#FFB300",
                        border: `1px solid ${ep.status === "Compliant" ? "rgba(0,230,118,0.3)" : ep.status === "Critical" ? "rgba(255,68,68,0.3)" : "rgba(255,179,0,0.3)"}`
                      }}>{ep.status}</span>
                      {ep.patches_missing > 0 && (
                        <div style={{ color: "#FF4444", fontSize: "0.65rem", marginTop: "0.15rem" }}>{ep.patches_missing} missing</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {action1Summary && (
                <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(75,132,200,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Total Missing Patches</span>
                  <span style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: action1Summary.total_missing_patches === 0 ? "#00E676" : "#FF4444", fontSize: "1rem" }}>{action1Summary.total_missing_patches}</span>
                </div>
              )}
            </motion.div>

            {/* ── Wazuh SIEM Panel ── */}
            <motion.div className="kpi-card" style={{ padding: "1.25rem" }}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              whileHover={{ scale: 1.015 }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1rem" }}>
                <div style={{ width: 34, height: 34, borderRadius: "9px", background: "rgba(255,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <ShieldAlert size={16} color="#FF4444" />
                </div>
                <div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "0.9rem" }}>Wazuh SIEM</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Threat Detection</div>
                </div>
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <div style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: wazuhData ? (wazuhData._mock ? "#FFB300" : "#00E676") : "#FF4444",
                    boxShadow: wazuhData ? (wazuhData._mock ? "0 0 6px #FFB300" : "0 0 6px #00E676") : "none"
                  }} />
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem" }}>
                    {wazuhData ? (wazuhData._mock ? "Mock Data" : "Live") : "No Data"}
                  </span>
                </div>
              </div>

              {wazuhData && wazuhData._error && (
                <div style={{
                  padding: "0.5rem 0.75rem",
                  borderRadius: "6px",
                  background: "rgba(255,68,68,0.1)",
                  border: "1px solid rgba(255,68,68,0.2)",
                  color: "#FF4444",
                  fontSize: "0.7rem",
                  marginBottom: "0.75rem",
                  wordBreak: "break-word"
                }}>
                  <strong>Connection Error:</strong> {wazuhData._error}
                </div>
              )}
              
              {wazuhData && (
                <>
                  <div style={{ display: "flex", gap: "0.625rem", marginBottom: "0.875rem" }}>
                    <div style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", textAlign: "center" }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#00E676", fontSize: "1.1rem" }}>{wazuhData.summary.active}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem" }}>Active Agents</div>
                    </div>
                    <div style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)", textAlign: "center" }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "#FFB300", fontSize: "1.1rem" }}>{wazuhData.summary.disconnected}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem" }}>Disconnected</div>
                    </div>
                  </div>
                  
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.5rem", fontWeight: 600 }}>Recent Alerts</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "120px", overflowY: "auto", paddingRight: "0.25rem" }}>
                    {wazuhData.recent_events.length === 0 ? (
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", textAlign: "center", padding: "1rem 0" }}>No recent alerts.</div>
                    ) : wazuhData.recent_events.map(evt => (
                      <div key={evt.id} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", padding: "0.5rem 0.625rem", borderRadius: "8px", background: "rgba(255,68,68,0.07)", border: "1px solid rgba(255,68,68,0.1)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 600 }}>{evt.agent_name}</span>
                          <span style={{ color: "#FF4444", fontSize: "0.65rem", fontWeight: 700, background: "rgba(255,68,68,0.15)", padding: "0.1rem 0.4rem", borderRadius: "4px" }}>Level {evt.rule_level}</span>
                        </div>
                        <div style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem", lineHeight: "1.2" }}>{evt.description}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

          </div>
        )}
      </div>

      {/* Live Tickets Table */}
      <div className="kpi-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>Recent Support Tickets</h2>
          <Link href="/admin/tickets" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(75,132,200,0.15)" }}>
                {["Client", "Subject", "Priority", "Status", "Date"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.75rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTickets.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: "var(--color-neutral-500)" }}>No tickets yet.</td></tr>
              ) : recentTickets.map(t => {
                const clientObj = Array.isArray(t.client) ? t.client[0] : t.client;
                const clientName = clientObj?.company_name || `${clientObj?.first_name || ''} ${clientObj?.last_name || ''}`.trim() || '—';
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(75,132,200,0.07)" }}>
                    <td style={{ padding: "0.875rem 0.75rem", color: "white", fontSize: "0.8125rem" }}>{clientName}</td>
                    <td style={{ padding: "0.875rem 0.75rem" }}>
                      <Link href={`/admin/tickets/${t.id}`} style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", textDecoration: "none" }}>
                        {t.subject}
                      </Link>
                    </td>
                  <td style={{ padding: "0.875rem 0.75rem" }}>
                    <span style={{ color: priorityColor[t.priority] || "#94A3B8", fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase" }}>{t.priority}</span>
                  </td>
                  <td style={{ padding: "0.875rem 0.75rem" }}>
                    <span style={{ color: statusColor[t.status] || "#94A3B8", fontSize: "0.78rem", textTransform: "capitalize" }}>{t.status?.replace("_", " ")}</span>
                  </td>
                  <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-400)", fontSize: "0.78rem" }}>{new Date(t.created_at).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
