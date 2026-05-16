"use client";
import { useState } from "react";
import { 
  HardDrive, Monitor, Laptop, Server, Printer, Network, Search, Filter, 
  CheckCircle, AlertTriangle, Shield, Clock, Cpu, Zap, Activity, 
  ExternalLink, Settings, Tool, X, Info, Calendar, User, Hash, Terminal,
  ChevronRight, ArrowUpRight
} from "lucide-react";

const assetTypes: Record<string, any> = {
  laptop: { icon: Laptop, color: "#00D4FF", bg: "rgba(0,212,255,0.05)" },
  workstation: { icon: Monitor, color: "#A855F7", bg: "rgba(168,85,247,0.05)" },
  server: { icon: Server, color: "#FF4444", bg: "rgba(255,68,68,0.05)" },
  printer: { icon: Printer, color: "#FFB300", bg: "rgba(255,179,0,0.05)" },
  network: { icon: Network, color: "#00E676", bg: "rgba(0,230,118,0.05)" },
};

const assets = [
  { id: "AST-001", name: "MacBook Pro 14\" M3", type: "laptop", user: "Sarah Johnson", serial: "C02X1234", os: "macOS 14.4", status: "healthy", lastSeen: "2 min ago", warranty: "Oct 2027", cpu: "M3 Max", ram: "32GB", disk: "1TB SSD", health: 98 },
  { id: "AST-002", name: "Dell OptiPlex 7010", type: "workstation", user: "Marcus Rivera", serial: "4X9K782", os: "Windows 11 Pro", status: "healthy", lastSeen: "5 min ago", warranty: "Mar 2026", cpu: "i7-13700", ram: "16GB", disk: "512GB SSD", health: 94 },
  { id: "AST-003", name: "HP LaserJet Pro 4001dn", type: "printer", user: "Shared (Floor 2)", serial: "TH83VQ2", os: "Firmware 2.12", status: "warning", lastSeen: "1h ago", warranty: "Expired", cpu: "Integrated", ram: "512MB", disk: "N/A", health: 65 },
  { id: "AST-004", name: "Dell PowerEdge R750", type: "server", user: "IT Infrastructure", serial: "GQ7V003", os: "Ubuntu 22.04 LTS", status: "healthy", lastSeen: "1 min ago", warranty: "Dec 2028", cpu: "Dual Xeon Gold", ram: "128GB", disk: "4TB RAID 10", health: 99 },
  { id: "AST-005", name: "Cisco Meraki MX68", type: "network", user: "Network Firewall", serial: "Q2TS-4921", os: "MX 18.211", status: "healthy", lastSeen: "Just now", warranty: "May 2027", cpu: "Custom ARM", ram: "4GB", disk: "N/A", health: 100 },
  { id: "AST-006", name: "Lenovo ThinkPad X1 Carbon", type: "laptop", user: "James Park", serial: "PF3L9002", os: "Windows 11 Pro", status: "healthy", lastSeen: "12 min ago", warranty: "Jan 2027", cpu: "i7-1265U", ram: "16GB", disk: "512GB SSD", health: 92 },
  { id: "AST-007", name: "HP EliteBook 840 G9", type: "laptop", user: "Ana Morales", serial: "5CD2X0014", os: "Windows 11 Pro", status: "warning", lastSeen: "3h ago", warranty: "Jun 2026", cpu: "i5-1240P", ram: "8GB", disk: "256GB SSD", health: 78 },
];

export default function AssetsPage() {
  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  
  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.serial.toLowerCase().includes(search.toLowerCase())
  );

  const healthy = assets.filter(a => a.status === "healthy").length;
  const warnings = assets.filter(a => a.status === "warning").length;

  return (
    <div>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Asset <span className="gradient-text">Intelligence</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Automated hardware lifecycle management and real-time health telemetry.
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.25rem", marginBottom: "2.5rem" }}>
        {[
          { icon: HardDrive, label: "Managed Nodes", value: assets.length, color: "#00D4FF", sub: "+2 this month" },
          { icon: CheckCircle, label: "Uptime Health", value: `${Math.round((healthy/assets.length)*100)}%`, color: "#00E676", sub: "Operational" },
          { icon: Shield, label: "Compliance", value: "100%", color: "#A855F7", sub: "All patched" },
          { icon: Calendar, label: "Lifecycle", value: "3.2y", color: "#FFB300", sub: "Avg. Fleet Age" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card" style={{ border: `1px solid ${kpi.color}15`, background: `linear-gradient(135deg, ${kpi.color}05 0%, transparent 100%)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <div style={{ color: kpi.color, fontSize: "0.75rem", fontWeight: 700 }}>LIVE</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.875rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600, marginTop: "0.25rem" }}>{kpi.label}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Inventory Table */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem" }}>Managed Fleet</h2>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Displaying all monitored assets</div>
          </div>
          <div style={{ position: "relative" }}>
            <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by name, serial, or user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                padding: "0.75rem 1rem 0.75rem 2.5rem", 
                borderRadius: "12px", 
                border: "1px solid rgba(255,255,255,0.1)", 
                background: "rgba(0,0,0,0.2)", 
                color: "white", 
                fontSize: "0.875rem", 
                outline: "none", 
                width: "320px",
                transition: "border-color 0.2s"
              }}
              onFocus={e => e.target.style.borderColor = "var(--color-accent-500)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 0.25rem" }}>
            <thead>
              <tr style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>
                <th style={{ textAlign: "left", padding: "1rem" }}>Asset Detail</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>User Context</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Hardware State</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Health</th>
                <th style={{ textAlign: "left", padding: "1rem" }}>Lifecycle</th>
                <th style={{ textAlign: "right", padding: "1rem" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(asset => {
                const config = assetTypes[asset.type];
                return (
                  <tr 
                    key={asset.id} 
                    style={{ background: "rgba(255,255,255,0.02)", cursor: "pointer", transition: "all 0.2s" }}
                    onClick={() => setSelectedAsset(asset)}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <td style={{ padding: "1rem", borderRadius: "12px 0 0 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: 42, height: 42, borderRadius: "10px", background: config.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <config.icon size={20} color={config.color} />
                        </div>
                        <div>
                          <div style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>{asset.name}</div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontFamily: "monospace" }}>{asset.serial}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{asset.user}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Last Active: {asset.lastSeen}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600 }}>{asset.os}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{asset.cpu} • {asset.ram}</div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ flex: 1, width: "60px", height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ width: `${asset.health}%`, height: "100%", background: asset.health > 90 ? "#00E676" : asset.health > 70 ? "#FFB300" : "#FF4444" }} />
                        </div>
                        <span style={{ color: asset.health > 90 ? "#00E676" : "#FFB300", fontSize: "0.75rem", fontWeight: 800 }}>{asset.health}%</span>
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ 
                        display: "inline-flex", 
                        padding: "0.25rem 0.625rem", 
                        borderRadius: "6px", 
                        fontSize: "0.7rem", 
                        fontWeight: 800,
                        background: asset.warranty === "Expired" ? "rgba(255,68,68,0.1)" : "rgba(0,212,255,0.1)",
                        color: asset.warranty === "Expired" ? "#FF4444" : "#00D4FF"
                      }}>
                        {asset.warranty === "Expired" ? "EOL REACHED" : `EXP ${asset.warranty}`}
                      </div>
                    </td>
                    <td style={{ padding: "1rem", borderRadius: "0 12px 12px 0", textAlign: "right" }}>
                      <button style={{ background: "transparent", border: "none", color: "var(--color-neutral-500)", padding: "0.5rem" }}>
                        <ChevronRight size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Asset Detail Slide-over */}
      {selectedAsset && (
        <div style={{ 
          position: "fixed", top: 0, right: 0, bottom: 0, width: "450px", 
          background: "rgba(10,15,25,0.98)", backdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255,255,255,0.1)", zIndex: 1000,
          boxShadow: "-20px 0 50px rgba(0,0,0,0.5)",
          padding: "2.5rem", animation: "slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "14px", background: assetTypes[selectedAsset.type].bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(() => {
                const Icon = assetTypes[selectedAsset.type].icon;
                return <Icon size={28} color={assetTypes[selectedAsset.type].color} />;
              })()}
            </div>
            <button 
              onClick={() => setSelectedAsset(null)}
              style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "0.5rem", borderRadius: "8px", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>

          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 800, color: "white", marginBottom: "0.5rem" }}>{selectedAsset.name}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem", marginBottom: "2.5rem" }}>
            <Hash size={14} /> {selectedAsset.id} • <Terminal size={14} /> {selectedAsset.serial}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Processor</div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Cpu size={16} color="#00D4FF" /> {selectedAsset.cpu}
              </div>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>Memory</div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Activity size={16} color="#A855F7" /> {selectedAsset.ram}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "2.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Live Telemetry</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { label: "CPU Usage", value: 42, color: "#00D4FF" },
                { label: "Memory Load", value: 68, color: "#A855F7" },
                { label: "Disk Health", value: 94, color: "#00E676" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-neutral-400)" }}>{stat.label}</span>
                    <span style={{ color: "white", fontWeight: 700 }}>{stat.value}%</span>
                  </div>
                  <div style={{ height: "6px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: `${stat.value}%`, height: "100%", background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "16px", padding: "1.25rem", marginBottom: "2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
              <Shield size={18} color="#00D4FF" />
              <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>Enterprise Protection</span>
            </div>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>
              This device is currently covered under the Global Managed Security Policy. All patches are up to date.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <button style={{ 
              background: "white", color: "black", border: "none", borderRadius: "12px", 
              padding: "1rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
            }}>
              <Tool size={16} /> Request Service
            </button>
            <button style={{ 
              background: "rgba(255,255,255,0.05)", color: "white", border: "1px solid rgba(255,255,255,0.1)", 
              borderRadius: "12px", padding: "1rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
            }}>
              <ArrowUpRight size={16} /> Remote View
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

