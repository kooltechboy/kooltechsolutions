import type { Metadata } from "next";
import { RefreshCw, Settings, CheckCircle, AlertTriangle, XCircle, Clock } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Integration Hub" };

const integrations = [
  { name: "Tactical RMM", category: "Monitoring", status: "active", lastSync: "2 min ago", metric: "152 agents online", color: "#00E676" },
  { name: "Wazuh SIEM", category: "Security", status: "active", lastSync: "5 min ago", metric: "0 critical alerts", color: "#00E676" },
  { name: "ITFlow", category: "Ticketing", status: "active", lastSync: "3 min ago", metric: "23 open tickets", color: "#00E676" },
  { name: "Uptime Kuma", category: "Monitoring", status: "active", lastSync: "1 min ago", metric: "47/47 monitors up", color: "#00E676" },
  { name: "Grafana", category: "Analytics", status: "active", lastSync: "Live", metric: "12 dashboards", color: "#00E676" },
  { name: "Action1", category: "Endpoint", status: "warning", lastSync: "32 min ago", metric: "Sync delayed", color: "#FFB300" },
  { name: "OpenVAS", category: "Security", status: "active", lastSync: "1h ago", metric: "Last scan: clean", color: "#00E676" },
  { name: "OPNsense", category: "Network", status: "active", lastSync: "10 min ago", metric: "847 threats blocked", color: "#00E676" },
  { name: "Nginx PM", category: "Proxy", status: "active", lastSync: "15 min ago", metric: "18 hosts · 3 expiring", color: "#FFB300" },
  { name: "Vaultwarden", category: "Passwords", status: "active", lastSync: "1h ago", metric: "156 users · 2,341 items", color: "#00E676" },
  { name: "n8n", category: "Automation", status: "active", lastSync: "Live", metric: "24 active workflows", color: "#00E676" },
  { name: "Shuffle", category: "Automation", status: "active", lastSync: "Live", metric: "8 playbooks active", color: "#00E676" },
  { name: "Discord", category: "Notifications", status: "active", lastSync: "Live", metric: "3 webhooks active", color: "#00E676" },
  { name: "Prometheus", category: "Metrics", status: "active", lastSync: "30s ago", metric: "Platform metrics OK", color: "#00E676" },
  { name: "Resend", category: "Email", status: "active", lastSync: "Live", metric: "247 emails sent today", color: "#00E676" },
];

const statusIcon = {
  active: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};
const statusColor = {
  active: "#00E676",
  warning: "#FFB300",
  error: "#FF4444",
};

export default function IntegrationsPage() {
  const active = integrations.filter(i => i.status === "active").length;
  const warning = integrations.filter(i => i.status === "warning").length;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Integration <span className="gradient-text">Hub</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Monitor and manage all 15 MSP tool connections.</p>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {[
          { label: "Active", count: active, color: "#00E676" },
          { label: "Warning", count: warning, color: "#FFB300" },
          { label: "Total Tools", count: integrations.length, color: "#00D4FF" },
        ].map(s => (
          <div key={s.label} style={{
            padding: "0.875rem 1.5rem", background: `${s.color}10`,
            border: `1px solid ${s.color}25`, borderRadius: "12px",
            display: "flex", alignItems: "center", gap: "0.75rem",
          }}>
            <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: s.color }}>{s.count}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {integrations.map(intg => {
          const Icon = statusIcon[intg.status as keyof typeof statusIcon] || CheckCircle;
          const color = statusColor[intg.status as keyof typeof statusColor];
          return (
            <div key={intg.name} className="glass-card" style={{ borderRadius: "14px", padding: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.875rem" }}>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>{intg.name}</div>
                  <span className="badge" style={{ background: "rgba(75,132,200,0.1)", color: "var(--color-neutral-400)", border: "1px solid rgba(75,132,200,0.2)", fontSize: "0.65rem", marginTop: "0.35rem" }}>{intg.category}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <Icon size={15} color={color} />
                  <span style={{ color, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>{intg.status}</span>
                </div>
              </div>

              <div style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.8125rem", marginBottom: "0.5rem", fontWeight: 500 }}>{intg.metric}</div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>
                  <Clock size={11} /> {intg.lastSync}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.3rem 0.625rem", background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(75,132,200,0.15)", borderRadius: "6px",
                    color: "var(--color-neutral-400)", fontSize: "0.7rem", cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                  }}>
                    <RefreshCw size={11} /> Sync
                  </button>
                  <button style={{
                    display: "flex", alignItems: "center", gap: "0.3rem",
                    padding: "0.3rem 0.625rem", background: "rgba(0,212,255,0.08)",
                    border: "1px solid rgba(0,212,255,0.2)", borderRadius: "6px",
                    color: "var(--color-accent-500)", fontSize: "0.7rem", cursor: "pointer",
                    fontFamily: "DM Sans, sans-serif",
                  }}>
                    <Settings size={11} /> Config
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
