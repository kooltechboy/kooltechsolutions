import { useState } from "react";
import { BarChart3, TrendingUp, Shield, Clock, Download, ShieldCheck, Activity, Zap, AlertCircle, Loader2, CheckCircle } from "lucide-react";

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const ticketData = [3, 7, 4, 6, 2, 5, 1];
const uptimeData = [99.8, 99.9, 100, 99.7, 99.9, 100, 99.99];
const maxTickets = Math.max(...ticketData);

export default function ReportsPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      window.print();
    }, 1500);
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Operational <span className="gradient-text">Intelligence</span>
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Real-time infrastructure health and service performance metrics.
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "10px", border: "1px solid rgba(0,212,255,0.2)", background: "rgba(0,212,255,0.05)", color: "var(--color-accent-500)", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}
        >
          {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
          {exporting ? "Generating..." : "Export Full Report"}
        </button>
      </div>

      {/* Global Health Score */}
      <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "2rem", border: "1px solid rgba(0,230,118,0.2)", background: "linear-gradient(90deg, rgba(0,230,118,0.03) 0%, transparent 100%)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
              <circle cx="40" cy="40" r="36" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="40" cy="40" r="36" fill="transparent" stroke="#00E676" strokeWidth="6" strokeDasharray="226" strokeDashoffset="22" strokeLinecap="round" />
            </svg>
            <span style={{ position: "absolute", fontSize: "1.25rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>92</span>
          </div>
          <div>
            <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>System Health Score</div>
            <div style={{ color: "#00E676", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <TrendingUp size={14} /> +2.4% from last month
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Security Posture</div>
            <div style={{ color: "white", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end" }}>
              <ShieldCheck size={16} color="#00D4FF" /> Optimized
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>Policy Status</div>
            <div style={{ color: "white", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "flex-end" }}>
              <CheckCircle size={16} color="#00E676" /> Compliant
            </div>
          </div>
        </div>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { icon: Activity, label: "Avg Uptime", value: "99.99%", color: "#00E676", sub: "Enterprise Grade" },
          { icon: Clock, label: "Response Time", value: "12m", color: "#00D4FF", sub: "Critical Tickets" },
          { icon: Zap, label: "Automation", value: "84%", color: "#A855F7", sub: "Issues Self-Healed" },
          { icon: Shield, label: "Cyber Defense", value: "100%", color: "#FF4444", sub: "Threats Blocked" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ width: 44, height: 44, borderRadius: "12px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem", border: `1px solid ${kpi.color}20` }}>
              <kpi.icon size={20} color={kpi.color} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem", fontWeight: 600 }}>{kpi.label}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Ticket Volume Chart */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "2rem" }}>Support Velocity</h2>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "1rem", height: "160px" }}>
            {ticketData.map((val, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem", height: "100%" }}>
                <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                  <div style={{
                    width: "100%", borderRadius: "8px 8px 0 0",
                    height: `${(val / maxTickets) * 100}%`,
                    background: "linear-gradient(180deg, #00D4FF, rgba(0,212,255,0.2))",
                    border: "1px solid rgba(0,212,255,0.3)",
                    transition: "height 1s ease-out"
                  }} />
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem", fontWeight: 700 }}>{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime Trend */}
        <div className="kpi-card">
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "2rem" }}>SLA Performance Matrix</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {uptimeData.map((val, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: "40px", color: "var(--color-neutral-400)", fontSize: "0.75rem", fontWeight: 600 }}>{months[i]}</div>
                <div style={{ flex: 1, height: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "999px", overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: `${(val / 100) * 100}%`, height: "100%", background: val >= 99.9 ? "linear-gradient(90deg, #00E676, #00D4FF)" : "linear-gradient(90deg, #FFB300, #FF4444)", borderRadius: "999px" }} />
                </div>
                <div style={{ width: "52px", color: val >= 99.9 ? "#00E676" : "#FFB300", fontSize: "0.8125rem", fontWeight: 800, textAlign: "right" }}>{val}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Events */}
        <div className="kpi-card" style={{ gridColumn: "1 / -1" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>Recent SLA Milestones</h2>
            <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Last 30 days</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.5rem" }}>
              <thead>
                <tr style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Incident</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Priority</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Response</th>
                  <th style={{ textAlign: "left", padding: "0.75rem 1rem" }}>Resolution</th>
                  <th style={{ textAlign: "right", padding: "0.75rem 1rem" }}>SLA Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "INC-291", subj: "Primary ISP Failover Triggered", priority: "Critical", response: "2m", resolution: "Auto", met: true },
                  { id: "INC-284", subj: "Cloud Storage Capacity Alert", priority: "High", response: "12m", resolution: "45m", met: true },
                  { id: "INC-280", subj: "User VPN Authentication Loop", priority: "Normal", response: "15m", resolution: "1h 12m", met: true },
                  { id: "INC-277", subj: "Workstation Firmware Update", priority: "Low", response: "1h 05m", resolution: "4h 20m", met: true },
                ].map(row => (
                  <tr key={row.id} style={{ background: "rgba(255,255,255,0.02)", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}>
                    <td style={{ padding: "1rem", borderRadius: "10px 0 0 10px" }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{row.subj}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>{row.id}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span style={{ color: row.priority === "Critical" ? "#FF4444" : "#FFB300", fontSize: "0.75rem", fontWeight: 800 }}>{row.priority}</span>
                    </td>
                    <td style={{ padding: "1rem", color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{row.response}</td>
                    <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{row.resolution}</td>
                    <td style={{ padding: "1rem", borderRadius: "0 10px 10px 0", textAlign: "right" }}>
                      <span style={{ background: "rgba(0,230,118,0.1)", color: "#00E676", padding: "0.25rem 0.625rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 800 }}>✓ COMPLIANT</span>
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

