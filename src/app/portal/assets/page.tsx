"use client";
import { useState } from "react";
import { HardDrive, Monitor, Laptop, Server, Printer, Network, Search, Filter, CheckCircle, AlertTriangle } from "lucide-react";

const assetTypes: Record<string, any> = {
  laptop: { icon: Laptop, color: "#00D4FF" },
  workstation: { icon: Monitor, color: "#A855F7" },
  server: { icon: Server, color: "#FF4444" },
  printer: { icon: Printer, color: "#FFB300" },
  network: { icon: Network, color: "#00E676" },
};

const assets = [
  { id: "AST-001", name: "MacBook Pro 14\" M3", type: "laptop", user: "Sarah Johnson", serial: "C02X1234", os: "macOS 14.4", status: "healthy", lastSeen: "2 min ago", warranty: "Oct 2027" },
  { id: "AST-002", name: "Dell OptiPlex 7010", type: "workstation", user: "Marcus Rivera", serial: "4X9K782", os: "Windows 11 Pro", status: "healthy", lastSeen: "5 min ago", warranty: "Mar 2026" },
  { id: "AST-003", name: "HP LaserJet Pro 4001dn", type: "printer", user: "Shared (Floor 2)", serial: "TH83VQ2", os: "Firmware 2.12", status: "warning", lastSeen: "1h ago", warranty: "Expired" },
  { id: "AST-004", name: "Dell PowerEdge R750", type: "server", user: "IT Infrastructure", serial: "GQ7V003", os: "Ubuntu 22.04 LTS", status: "healthy", lastSeen: "1 min ago", warranty: "Dec 2028" },
  { id: "AST-005", name: "Cisco Meraki MX68", type: "network", user: "Network Firewall", serial: "Q2TS-4921", os: "MX 18.211", status: "healthy", lastSeen: "Just now", warranty: "May 2027" },
  { id: "AST-006", name: "Lenovo ThinkPad X1 Carbon", type: "laptop", user: "James Park", serial: "PF3L9002", os: "Windows 11 Pro", status: "healthy", lastSeen: "12 min ago", warranty: "Jan 2027" },
  { id: "AST-007", name: "HP EliteBook 840 G9", type: "laptop", user: "Ana Morales", serial: "5CD2X0014", os: "Windows 11 Pro", status: "warning", lastSeen: "3h ago", warranty: "Jun 2026" },
];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.serial.toLowerCase().includes(search.toLowerCase())
  );

  const healthy = assets.filter(a => a.status === "healthy").length;
  const warnings = assets.filter(a => a.status === "warning").length;

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Asset <span className="gradient-text">Inventory</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          All managed devices, hardware, and infrastructure under KoolTech monitoring.
        </p>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: HardDrive, label: "Total Assets", value: assets.length, color: "#00D4FF" },
          { icon: CheckCircle, label: "Healthy", value: healthy, color: "#00E676" },
          { icon: AlertTriangle, label: "Warnings", value: warnings, color: "#FFB300" },
          { icon: Server, label: "Servers", value: assets.filter(a => a.type === "server").length, color: "#A855F7" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Asset Table */}
      <div className="kpi-card">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", flex: 1 }}>All Assets</h2>
          <div style={{ position: "relative" }}>
            <Search size={15} color="var(--color-neutral-400)" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: "2.25rem", padding: "0.5rem 0.75rem 0.5rem 2.25rem", borderRadius: "8px", border: "1px solid rgba(75,132,200,0.2)", background: "rgba(255,255,255,0.03)", color: "white", fontSize: "0.8125rem", outline: "none", width: "220px" }}
            />
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(75,132,200,0.15)" }}>
                {["Device", "Assigned To", "Serial #", "Operating System", "Last Seen", "Status", "Warranty"].map(h => (
                  <th key={h} style={{ padding: "0.625rem 0.75rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const typeConfig = assetTypes[asset.type];
                const TypeIcon = typeConfig.icon;
                return (
                  <tr key={asset.id} style={{ borderBottom: "1px solid rgba(75,132,200,0.07)" }}>
                    <td style={{ padding: "0.875rem 0.75rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 34, height: 34, borderRadius: "8px", background: `${typeConfig.color}10`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <TypeIcon size={16} color={typeConfig.color} />
                        </div>
                        <div>
                          <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{asset.name}</div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>{asset.id}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem" }}>{asset.user}</td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-400)", fontSize: "0.78rem", fontFamily: "monospace" }}>{asset.serial}</td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-400)", fontSize: "0.78rem" }}>{asset.os}</td>
                    <td style={{ padding: "0.875rem 0.75rem", color: "var(--color-neutral-500)", fontSize: "0.78rem" }}>{asset.lastSeen}</td>
                    <td style={{ padding: "0.875rem 0.75rem" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.3rem",
                        padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600,
                        color: asset.status === "healthy" ? "#00E676" : "#FFB300",
                        background: asset.status === "healthy" ? "rgba(0,230,118,0.1)" : "rgba(255,179,0,0.1)",
                      }}>
                        {asset.status === "healthy" ? <CheckCircle size={10} /> : <AlertTriangle size={10} />}
                        {asset.status === "healthy" ? "Healthy" : "Warning"}
                      </span>
                    </td>
                    <td style={{ padding: "0.875rem 0.75rem", color: asset.warranty === "Expired" ? "#FF4444" : "var(--color-neutral-400)", fontSize: "0.78rem" }}>{asset.warranty}</td>
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
