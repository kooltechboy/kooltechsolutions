"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, Users, Ticket, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Activity, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const priorityColor: Record<string, string> = {
  critical: "#FF4444", high: "#FFB300", normal: "#00D4FF", low: "#00E676",
};
const statusColor: Record<string, string> = {
  open: "#00D4FF", in_progress: "#FFB300", resolved: "#00E676", closed: "#64748B", waiting_on_client: "#A855F7",
};

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
