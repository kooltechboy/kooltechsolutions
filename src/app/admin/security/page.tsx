import type { Metadata } from "next";
import { ShieldCheck, Lock, Eye, AlertOctagon } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Security Operations" };

const recentThreats = [
  { id: "TH-9921", time: "10 mins ago", type: "Brute Force Attempt", target: "VPN Gateway", status: "Blocked", severity: "High" },
  { id: "TH-9920", time: "1 hr ago", type: "Malware Signature", target: "Endpoint-04", status: "Quarantined", severity: "Critical" },
  { id: "TH-9919", time: "3 hrs ago", type: "Anomalous Login", target: "Office 365", status: "Investigating", severity: "Medium" },
  { id: "TH-9918", time: "5 hrs ago", type: "Port Scan", target: "Firewall Ext", status: "Blocked", severity: "Low" },
];

export default function SecurityPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Security Operations Center (SOC)
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Active threat monitoring and automated remediation logs.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Threats Blocked (24h)", value: "1,492", icon: ShieldCheck, color: "var(--color-success)" },
          { label: "Active Investigations", value: "3", icon: Eye, color: "var(--color-warning)" },
          { label: "Vulnerabilities Detected", value: "12", icon: AlertOctagon, color: "var(--color-danger)" },
          { label: "Zero-Trust Compliance", value: "98.5%", icon: Lock, color: "var(--color-accent-500)" },
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
          Threat Intelligence Feed
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Event ID", "Time", "Threat Type", "Target", "Status", "Severity"].map(h => (
                  <th key={h} style={{ padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentThreats.map((threat) => (
                <tr key={threat.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                  <td style={{ padding: "1rem", color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{threat.id}</td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>{threat.time}</td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-300)", fontSize: "0.875rem", fontWeight: 500 }}>{threat.type}</td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{threat.target}</td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: threat.status === "Blocked" ? "rgba(0,230,118,0.1)" : threat.status === "Quarantined" ? "rgba(0,212,255,0.1)" : "rgba(255,179,0,0.1)",
                      color: threat.status === "Blocked" ? "var(--color-success)" : threat.status === "Quarantined" ? "var(--color-accent-600)" : "var(--color-warning)"
                    }}>
                      {threat.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                     <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: threat.severity === "Critical" ? "rgba(255,68,68,0.1)" : threat.severity === "High" ? "rgba(255,179,0,0.1)" : "rgba(0,230,118,0.1)",
                      color: threat.severity === "Critical" ? "var(--color-danger)" : threat.severity === "High" ? "var(--color-warning)" : "var(--color-success)"
                    }}>
                      {threat.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
