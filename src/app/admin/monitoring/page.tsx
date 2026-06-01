"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Server, Activity, Shield, Wifi, CheckCircle2, AlertTriangle, XCircle, Wrench, RefreshCw, Loader2, Thermometer, Cpu, HardDrive } from "lucide-react";

interface RmmAgent {
  id: string;
  hostname: string;
  client: string;
  site: string;
  os: string;
  status: string;
  last_seen: string;
  cpu_load: number;
  used_ram: number;
  total_ram: number;
}

interface WazuhAgent {
  id: string;
  name: string;
  ip: string;
  os: string;
  version: string;
  status: string;
  lastKeepAlive: string;
}

interface SecurityEvent {
  id: string;
  rule_level: number;
  rule_id: string;
  description: string;
  agent_name: string;
  timestamp: string;
}

interface MergedNode {
  id: string;
  name: string;
  type: string;
  status: "Online" | "Warning" | "Offline" | "Maintenance";
  os: string;
  ip: string;
  last_seen: string;
  cpu_usage: number;
  ram_usage: number;
  sources: ("RMM" | "WAZUH")[];
  client: string;
}

const timeAgo = (d: string) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " mins ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hrs ago";
  return new Date(d).toLocaleDateString();
};

const UsageBar = ({ value, label }: { value: number; label: string }) => {
  const color = value > 80 ? "#ef4444" : value > 60 ? "#f59e0b" : "#10b981";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <div style={{ flex: 1, height: 6, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${value}%`, background: color, borderRadius: 999, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: "0.75rem", fontWeight: 700, color, minWidth: 32, textAlign: "right" }}>{value}%</span>
    </div>
  );
};

export default function MonitoringPage() {
  const [nodes, setNodes] = useState<MergedNode[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [wazuhStatus, setWazuhStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [rmmRes, wazuhRes] = await Promise.all([
        fetch("/api/rmm", { cache: "no-store" }),
        fetch("/api/wazuh", { cache: "no-store" }),
      ]);

      const rmmJson = await rmmRes.json().catch(() => ({ agents: [] }));
      const wazuhJson = await wazuhRes.json().catch(() => ({ agents: [], recent_events: [], summary: {} }));

      const rmmAgents: RmmAgent[] = rmmJson.agents || [];
      const wazuhAgents: WazuhAgent[] = wazuhJson.agents || [];
      
      setEvents(wazuhJson.recent_events || []);
      setWazuhStatus(wazuhJson.summary || null);

      // Merge data by hostname
      const mergedMap = new Map<string, MergedNode>();

      // Process RMM agents
      for (const a of rmmAgents) {
        let ramPct = 0;
        if (a.total_ram > 0 && a.used_ram > 0) {
          ramPct = Math.round((a.used_ram / a.total_ram) * 100);
        }

        mergedMap.set(a.hostname.toLowerCase(), {
          id: a.id,
          name: a.hostname,
          type: "Workstation/Server",
          status: a.status === "online" ? "Online" : "Offline",
          os: a.os,
          ip: "—",
          last_seen: a.last_seen,
          cpu_usage: a.cpu_load || 0,
          ram_usage: ramPct,
          sources: ["RMM"],
          client: a.client,
        });
      }

      // Process Wazuh agents
      for (const a of wazuhAgents) {
        const key = a.name.toLowerCase();
        if (mergedMap.has(key)) {
          const existing = mergedMap.get(key)!;
          existing.sources.push("WAZUH");
          if (existing.ip === "—") existing.ip = a.ip;
          if (a.status === "disconnected") existing.status = "Warning";
        } else {
          mergedMap.set(key, {
            id: a.id,
            name: a.name,
            type: "Agent",
            status: a.status === "active" ? "Online" : "Offline",
            os: a.os,
            ip: a.ip,
            last_seen: a.lastKeepAlive,
            cpu_usage: 0,
            ram_usage: 0,
            sources: ["WAZUH"],
            client: "—",
          });
        }
      }

      setNodes(Array.from(mergedMap.values()));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const online = nodes.filter(n => n.status === "Online").length;
  const warning = nodes.filter(n => n.status === "Warning").length;
  const offline = nodes.filter(n => n.status === "Offline").length;
  const threats = events.length;

  const statusColor = (s: string) => {
    if (s === "Online") return "#10b981";
    if (s === "Warning") return "#f59e0b";
    if (s === "Maintenance") return "#a855f7";
    return "#ef4444";
  };

  const statusIcon = (s: string) => {
    if (s === "Online") return <CheckCircle2 size={14} />;
    if (s === "Warning") return <AlertTriangle size={14} />;
    if (s === "Maintenance") return <Wrench size={14} />;
    return <XCircle size={14} />;
  };

  if (loading && nodes.length === 0) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Initializing SIEM & RMM Telemetry…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: 1600, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.25rem" }}>
            Infrastructure Security & Monitoring
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
            Unified telemetry from Tactical RMM and Wazuh SIEM. Auto-refreshes every 60s.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={refreshing}
          style={{ padding: "0.625rem 1rem", borderRadius: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", cursor: refreshing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600, opacity: refreshing ? 0.7 : 1 }}
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Endpoints", value: nodes.length, icon: Server, color: "#00D4FF", sub: "RMM + SIEM nodes" },
          { label: "Healthy / Online", value: online, icon: CheckCircle2, color: "#10b981", sub: `${warning} warnings` },
          { label: "Offline Devices", value: offline, icon: XCircle, color: "#ef4444", sub: "Requires attention" },
          { label: "Security Events", value: threats, icon: Shield, color: threats > 0 ? "#ef4444" : "#10b981", sub: threats > 0 ? "High severity alerts" : "All clear" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", border: `1px solid ${stat.color}20` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>{stat.label}</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "white" }}>{stat.value}</div>
            <div style={{ color: stat.color, fontSize: "0.75rem", marginTop: "0.25rem" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1.5rem" }}>
        {/* Unified Nodes Table */}
        <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity size={18} color="#00D4FF" /> Unified Endpoint Telemetry
            </h2>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                  {["Hostname", "Status", "Client", "OS", "IP", "CPU / RAM", "Sources", "Last Seen"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.6875rem", textAlign: "left", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                      No endpoints connected.
                    </td>
                  </tr>
                ) : nodes.map((node, idx) => (
                  <tr key={node.name + idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.025)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <td style={{ padding: "1rem 1.25rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                      {node.name}
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: statusColor(node.status), fontSize: "0.75rem", fontWeight: 700, background: `${statusColor(node.status)}15`, padding: "0.2rem 0.6rem", borderRadius: "999px", width: "fit-content" }}>
                        {statusIcon(node.status)} {node.status}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                      {node.client}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {node.os}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontFamily: "monospace" }}>
                      {node.ip}
                    </td>
                    <td style={{ padding: "1rem 1.25rem", minWidth: 140 }}>
                      <UsageBar value={node.cpu_usage} label="CPU" />
                      <div style={{ height: 4 }} />
                      <UsageBar value={node.ram_usage} label="RAM" />
                    </td>
                    <td style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem" }}>
                        {node.sources.map(s => (
                          <span key={s} style={{ padding: "0.15rem 0.4rem", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800, background: s === "RMM" ? "rgba(0,212,255,0.15)" : "rgba(168,85,247,0.15)", color: s === "RMM" ? "#00D4FF" : "#a855f7" }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {timeAgo(node.last_seen)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Wazuh Security Events Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", borderTop: "3px solid #ef4444" }}>
            <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={18} color="#ef4444" /> Active SIEM Alerts
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: 400, overflowY: "auto", paddingRight: "0.5rem" }}>
              {events.length === 0 ? (
                <div style={{ textAlign: "center", padding: "2rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 1rem", opacity: 0.5 }} />
                  No critical security events detected in the last 24 hours.
                </div>
              ) : events.map(evt => (
                <div key={evt.id} style={{ padding: "0.875rem", borderRadius: "8px", background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                    <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>Level {evt.rule_level} Alert</span>
                    <span style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>{timeAgo(evt.timestamp)}</span>
                  </div>
                  <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>{evt.description}</div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", fontFamily: "monospace" }}>Host: {evt.agent_name} | Rule: {evt.rule_id}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Status */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem" }}>System Health</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                <span style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Server size={14} color="#00D4FF" /> Tactical RMM
                </span>
                <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>Connected</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                <span style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Shield size={14} color="#a855f7" /> Wazuh SIEM
                </span>
                <span className={`badge badge-${wazuhStatus ? "success" : "warning"}`} style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>
                  {wazuhStatus ? "Connected" : "Degraded"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
