"use client";
import { BarChart3, TrendingUp, Shield, Clock, Download } from "lucide-react";

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const ticketData = [3, 7, 4, 6, 2, 5, 1];
const uptimeData = [99.8, 99.9, 100, 99.7, 99.9, 100, 99.99];
const maxTickets = Math.max(...ticketData);

export default function ReportsPage() {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Performance <span className="gradient-text">Reports</span>
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            7-month service health and support performance overview.
          </p>
        </div>
        <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.05)", color: "var(--color-accent-500)", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>
          <Download size={15} /> Export PDF
        </button>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: Shield, label: "Avg Uptime", value: "99.9%", color: "#00E676", sub: "Last 30 days" },
          { icon: Clock, label: "Avg Response", value: "< 15 min", color: "#00D4FF", sub: "P1/P2 tickets" },
          { icon: BarChart3, label: "Tickets Resolved", value: "28", color: "#A855F7", sub: "This quarter" },
          { icon: TrendingUp, label: "CSAT Score", value: "4.9/5", color: "#FFB300", sub: "Client satisfaction" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.875rem" }}>
              <kpi.icon size={20} color={kpi.color} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.625rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.2rem" }}>{kpi.label}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Ticket Volume Chart */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.5rem" }}>Ticket Volume (7 Months)</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "0.75rem", height: "140px" }}>
            {ticketData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0",
                    height: `${(val / maxTickets) * 100}%`,
                    background: "linear-gradient(180deg, #A855F7, rgba(168,85,247,0.3))",
                    border: "1px solid rgba(168,85,247,0.3)",
                  }} />
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem", textAlign: "center" }}>{months[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid rgba(75,132,200,0.1)", display: "flex", justifyContent: "space-between" }}>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem" }}>Total this period:</div>
            <div style={{ color: "white", fontWeight: 700 }}>{ticketData.reduce((a, b) => a + b, 0)} tickets</div>
          </div>
        </div>

        {/* Uptime Chart */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.5rem" }}>System Uptime (7 Months)</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {uptimeData.map((val, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", color: "var(--color-neutral-500)", fontSize: "0.7rem", flexShrink: 0 }}>{months[i]}</div>
                <div style={{ flex: 1, height: "10px", background: "rgba(75,132,200,0.1)", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{ width: `${(val / 100) * 100}%`, height: "100%", background: val >= 99.9 ? "linear-gradient(90deg, #00E676, #00D4FF)" : "linear-gradient(90deg, #FFB300, #FF4444)", borderRadius: "999px" }} />
                </div>
                <div style={{ width: "48px", color: val >= 99.9 ? "#00E676" : "#FFB300", fontSize: "0.75rem", fontWeight: 700, textAlign: "right" }}>{val}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="kpi-card" style={{ gridColumn: "1 / -1" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>SLA Compliance History</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(75,132,200,0.15)" }}>
                  {["Ticket ID", "Subject", "Priority", "Response Time", "Resolution Time", "SLA Met"].map(h => (
                    <th key={h} style={{ padding: "0.625rem 0.75rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "TKT-001", subj: "VPN connectivity issue", priority: "High", response: "8 min", resolution: "2h 14m", met: true },
                  { id: "TKT-002", subj: "Email delivery failure", priority: "Critical", response: "4 min", resolution: "1h 02m", met: true },
                  { id: "TKT-003", subj: "Software installation request", priority: "Low", response: "32 min", resolution: "24h 00m", met: true },
                  { id: "TKT-004", subj: "User account locked", priority: "Normal", response: "12 min", resolution: "45m", met: true },
                  { id: "TKT-005", subj: "Printer not connecting", priority: "Low", response: "1h 04m", resolution: "6h 20m", met: false },
                ].map(row => (
                  <tr key={row.id} style={{ borderBottom: "1px solid rgba(75,132,200,0.07)" }}>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-accent-500)", fontSize: "0.8125rem", fontWeight: 600 }}>{row.id}</td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem" }}>{row.subj}</td>
                    <td style={{ padding: "0.875rem 0.75rem" }}>
                      <span style={{ color: row.priority === "Critical" ? "#FF4444" : row.priority === "High" ? "#FFB300" : "var(--color-neutral-400)", fontSize: "0.78rem", fontWeight: 600 }}>{row.priority}</span>
                    </td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "white", fontSize: "0.8125rem", fontWeight: 600 }}>{row.response}</td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem" }}>{row.resolution}</td>
                    <td style={{ padding: "0.875rem 0.75rem" }}>
                      <span style={{ color: row.met ? "#00E676" : "#FF4444", fontSize: "0.78rem", fontWeight: 700 }}>{row.met ? "✓ Met" : "✗ Missed"}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
