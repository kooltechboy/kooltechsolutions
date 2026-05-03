import type { Metadata } from "next";
import { DollarSign, Users, Ticket, TrendingUp, AlertTriangle, ArrowUp, ArrowDown, Activity } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Dashboard" };

const kpis = [
  { icon: DollarSign, label: "MRR", value: "$47,850", change: "+12%", up: true, color: "#00E676" },
  { icon: Users, label: "Active Clients", value: "152", change: "+8", up: true, color: "#00D4FF" },
  { icon: Ticket, label: "Open Tickets", value: "23", change: "-5", up: false, color: "#FFB300" },
  { icon: TrendingUp, label: "Leads in Pipeline", value: "18", change: "+3", up: true, color: "#A855F7" },
  { icon: AlertTriangle, label: "SLA Breach Risk", value: "2", change: "", up: false, color: "#FF4444" },
  { icon: Activity, label: "AI Conversations", value: "1,248", change: "+24%", up: true, color: "#4B84C8" },
];

const recentTickets = [
  { id: "TKT-1041", client: "Acme Corp", subject: "VPN dropping", priority: "High", status: "Open", sla: "4h left" },
  { id: "TKT-1040", client: "TechStart DR", subject: "Server reboots", priority: "Critical", status: "In Progress", sla: "1h left" },
  { id: "TKT-1039", client: "FinGroup SA", subject: "New user setup", priority: "Medium", status: "Open", sla: "18h left" },
  { id: "TKT-1038", client: "Hotel Del Mar", subject: "Email migration", priority: "Low", status: "Resolved", sla: "—" },
];

const priorityColor: Record<string, string> = {
  Critical: "#FF4444", High: "#FFB300", Medium: "#00D4FF", Low: "#00E676",
};
const statusColor: Record<string, string> = {
  Open: "#00D4FF", "In Progress": "#FFB300", Resolved: "#00E676",
};

const revenueData = [38, 42, 35, 48, 44, 47.85];
const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May"];

export default function AdminDashboard() {
  const maxRevenue = Math.max(...revenueData);
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
                    background: i === revenueData.length - 1
                      ? "linear-gradient(180deg, #00D4FF, #1E4D8C)"
                      : "rgba(75,132,200,0.25)",
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

      {/* Tickets Table */}
      <div className="kpi-card">
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Tickets</h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(75,132,200,0.15)" }}>
                {["ID", "Client", "Subject", "Priority", "Status", "SLA"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.75rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentTickets.map(t => (
                <tr key={t.id} style={{ borderBottom: "1px solid rgba(75,132,200,0.07)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-accent-500)", fontWeight: 600, fontSize: "0.8125rem" }}>{t.id}</td>
                  <td style={{ padding: "0.875rem 0.75rem", color: "white", fontSize: "0.8125rem" }}>{t.client}</td>
                  <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{t.subject}</td>
                  <td style={{ padding: "0.875rem 0.75rem" }}>
                    <span style={{ color: priorityColor[t.priority], fontSize: "0.78rem", fontWeight: 600 }}>{t.priority}</span>
                  </td>
                  <td style={{ padding: "0.875rem 0.75rem" }}>
                    <span style={{ color: statusColor[t.status], fontSize: "0.78rem" }}>{t.status}</span>
                  </td>
                  <td style={{ padding: "0.875rem 0.75rem", color: t.sla.includes("1h") ? "#FF4444" : "var(--color-neutral-400)", fontSize: "0.78rem", fontWeight: t.sla.includes("1h") ? 700 : 400 }}>{t.sla}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
