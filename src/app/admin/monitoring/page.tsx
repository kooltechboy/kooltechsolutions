import type { Metadata } from "next";
import { Server, Activity, HardDrive, Wifi, CheckCircle2, AlertTriangle } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Monitoring" };

const servers = [
  { id: "SRV-DC-01", name: "Primary Domain Controller", status: "Online", uptime: "99.99%", cpu: "24%", ram: "42%" },
  { id: "SRV-EX-01", name: "Exchange Hub", status: "Online", uptime: "99.95%", cpu: "58%", ram: "76%" },
  { id: "SRV-FS-02", name: "Client File Share", status: "Warning", uptime: "99.80%", cpu: "89%", ram: "92%" },
  { id: "SRV-BK-01", name: "Backup Appliance", status: "Online", uptime: "99.99%", cpu: "12%", ram: "28%" },
];

export default function MonitoringPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Infrastructure Monitoring
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Real-time health and performance metrics across all managed environments.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Active Nodes", value: "1,204", icon: Server, color: "#00D4FF" },
          { label: "Avg Response Time", value: "42ms", icon: Activity, color: "#00E676" },
          { label: "Storage Utilization", value: "68%", icon: HardDrive, color: "#FFB300" },
          { label: "Network Traffic", value: "2.4 TB/s", icon: Wifi, color: "#A855F7" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px",  }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", fontWeight: 600 }}>{stat.label}</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px",  }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "1.25rem" }}>
          Critical Systems Health
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Server ID", "Name", "Status", "Uptime", "CPU", "RAM"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {servers.map((srv) => (
                <tr key={srv.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                  <td style={{ padding: "1rem", color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{srv.id}</td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{srv.name}</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: srv.status === "Online" ? "var(--color-success)" : "var(--color-warning)", fontSize: "0.8125rem", fontWeight: 600 }}>
                      {srv.status === "Online" ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {srv.status}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{srv.uptime}</td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{srv.cpu}</td>
                  <td style={{ padding: "1rem", color: srv.ram > "90%" ? "var(--color-danger)" : "var(--color-neutral-600)", fontSize: "0.875rem", fontWeight: srv.ram > "90%" ? 700 : 400 }}>{srv.ram}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
