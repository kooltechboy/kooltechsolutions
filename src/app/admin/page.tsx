"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Users, Ticket, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Activity, ArrowRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const revenueData = [38, 42, 35, 48, 44, 47.85];
const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

const priorityColor: Record<string, string> = {
  critical: "#FF4444", high: "#FFB300", normal: "#00D4FF", low: "#00E676",
};
const statusColor: Record<string, string> = {
  open: "#00D4FF", in_progress: "#FFB300", resolved: "#00E676", closed: "#64748B", waiting_on_client: "#A855F7",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ leads: 0, clients: 0, openTickets: 0, aiConversations: 0 });
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const maxRevenue = Math.max(...revenueData);

  useEffect(() => {
    async function fetchData() {
      const [leadsRes, clientsRes, ticketsRes, logsRes] = await Promise.all([
        supabase.from("leads").select("id", { count: "exact" }),
        supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client"),
        supabase.from("tickets").select("*, client:client_id(first_name, last_name, company_name)").order("created_at", { ascending: false }),
        supabase.from("agent_logs").select("id", { count: "exact" }),
      ]);

      const allTickets = ticketsRes.data || [];
      setStats({
        leads: leadsRes.count || 0,
        clients: clientsRes.count || 0,
        openTickets: allTickets.filter((t: any) => t.status === "open" || t.status === "in_progress").length,
        aiConversations: logsRes.count || 0,
      });
      setRecentTickets(allTickets.slice(0, 5));
      setLoading(false);
    }
    fetchData();
  }, []);

  const kpis = [
    { icon: DollarSign, label: "MRR", value: "$47,850", change: "+12%", up: true, color: "#00E676", note: "Projected" },
    { icon: Users, label: "Active Clients", value: loading ? "—" : stats.clients.toString(), change: "+8", up: true, color: "#00D4FF" },
    { icon: Ticket, label: "Open Tickets", value: loading ? "—" : stats.openTickets.toString(), change: "", up: false, color: "#FFB300" },
    { icon: TrendingUp, label: "Leads in Pipeline", value: loading ? "—" : stats.leads.toString(), change: "", up: true, color: "#A855F7" },
    { icon: AlertTriangle, label: "SLA Breach Risk", value: "2", change: "", up: false, color: "#FF4444" },
    { icon: Activity, label: "AI Conversations", value: loading ? "—" : stats.aiConversations.toString(), change: "+24%", up: true, color: "#4B84C8" },
  ];

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
        {kpis.map(kpi => (
          <div key={kpi.label} className="kpi-card">
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
          </div>
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
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white" }}>$47,850</div>
            </div>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>ARR Projection</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-accent-500)" }}>$574,200</div>
            </div>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>MoM Growth</div>
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-success)" }}>+12%</div>
            </div>
          </div>
        </div>

        {/* Integration Status */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>Integration Health</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {[
              { name: "Tactical RMM", status: "Connected", ok: true },
              { name: "Wazuh SIEM", status: "Connected", ok: true },
              { name: "Uptime Kuma", status: "Connected", ok: true },
              { name: "ITFlow", status: "Connected", ok: true },
              { name: "Action1", status: "Warning", ok: false },
              { name: "OpenVAS", status: "Connected", ok: true },
              { name: "Grafana", status: "Connected", ok: true },
              { name: "Discord", status: "Connected", ok: true },
            ].map(intg => (
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

      {/* Live Tickets Table */}
      <div className="kpi-card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>Recent Support Tickets</h2>
          <Link href="/admin/tickets" style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", textDecoration: "none", fontWeight: 600 }}>
            View All <ArrowRight size={13} />
          </Link>
        </div>
        {loading ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--color-neutral-500)" }}>Loading live ticket data...</div>
        ) : (
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
                ) : recentTickets.map(t => (
                  <tr key={t.id} style={{ borderBottom: "1px solid rgba(75,132,200,0.07)" }}>
                    <td style={{ padding: "0.875rem 0.75rem", color: "white", fontSize: "0.8125rem" }}>{t.client?.company_name || `${t.client?.first_name || ''} ${t.client?.last_name || ''}`.trim() || '—'}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
