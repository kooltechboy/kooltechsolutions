"use client";
import { useEffect, useState, useCallback } from "react";
import {
  Monitor, Wifi, WifiOff, AlertTriangle, CheckCircle2, RefreshCw,
  Server, Cpu, MemoryStick, Clock, Shield, Bell, XCircle, Loader2,
  Activity, HardDrive, ChevronRight
} from "lucide-react";

interface Agent {
  id: string;
  hostname: string;
  description: string;
  client: string;
  site: string;
  os: string;
  status: "online" | "offline";
  last_seen: string;
  cpu_load: number;
  used_ram: number;
  total_ram: number;
  boot_time: string | null;
  checks: { passing: number; failing: number; warning: number; info: number };
  needs_reboot: boolean;
  overdue_dashboard_alert: boolean;
}

interface Alert {
  id: number;
  hostname: string;
  alert_type: string;
  severity: string;
  message: string;
  resolved: boolean;
  alert_time: string;
}

const timeAgo = (d: string | null) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return new Date(d).toLocaleDateString();
};

const uptime = (boot: string | null) => {
  if (!boot) return "—";
  const diff = Date.now() - new Date(boot).getTime();
  const days = Math.floor(diff / 86400000);
  const hrs = Math.floor((diff % 86400000) / 3600000);
  return days > 0 ? `${days}d ${hrs}h` : `${hrs}h`;
};

const UsageBar = ({ value, max, label, color }: { value: number; max: number; label: string; color: string }) => {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const barColor = pct > 85 ? "#ef4444" : pct > 65 ? "#f59e0b" : color;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--color-neutral-400)" }}>
        <span>{label}</span>
        <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: barColor, borderRadius: 999, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
};

const SeverityBadge = ({ severity }: { severity: string }) => {
  const map: Record<string, { bg: string; color: string }> = {
    error: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    info: { bg: "rgba(59,130,246,0.15)", color: "#3b82f6" },
  };
  const style = map[severity] ?? map.info;
  return (
    <span style={{ padding: "0.15rem 0.5rem", borderRadius: "5px", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", background: style.bg, color: style.color }}>
      {severity}
    </span>
  );
};

export default function RMMPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [source, setSource] = useState<string>("—");
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<"all" | "online" | "offline">("all");

  const fetchData = useCallback(async () => {
    try {
      const [agentRes, alertRes] = await Promise.all([
        fetch("/api/rmm", { cache: "no-store" }),
        fetch("/api/rmm/alerts", { cache: "no-store" }),
      ]);
      if (agentRes.ok) {
        const d = await agentRes.json();
        setAgents(d.agents ?? []);
        setSource(d.source ?? "live");
      }
      if (alertRes.ok) {
        const d = await alertRes.json();
        setAlerts(d.alerts ?? []);
      }
      setLastRefresh(new Date());
    } catch (err) {
      console.error("RMM fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const online = agents.filter(a => a.status === "online").length;
  const offline = agents.filter(a => a.status === "offline").length;
  const needsReboot = agents.filter(a => a.needs_reboot).length;
  const checksFailing = agents.reduce((acc, a) => acc + a.checks.failing, 0);

  const filtered = agents.filter(a =>
    filter === "all" ? true : filter === "online" ? a.status === "online" : a.status === "offline"
  );

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
        <p style={{ color: "var(--color-neutral-500)" }}>Connecting to Tactical RMM…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", margin: 0 }}>
              Tactical RMM
            </h1>
            <span style={{
              padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.6rem", fontWeight: 800,
              textTransform: "uppercase", letterSpacing: "0.06em",
              background: source === "live" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
              color: source === "live" ? "#10b981" : "#f59e0b",
              border: `1px solid ${source === "live" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              {source === "live" ? "● LIVE" : "○ DEMO DATA"}
            </span>
          </div>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
            Remote Monitoring & Management · Auto-refreshes every 60s
            {lastRefresh && <> · Last sync: {lastRefresh.toLocaleTimeString()}</>}
          </p>
        </div>
        <button
          onClick={fetchData}
          style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600 }}
        >
          <RefreshCw size={14} /> Refresh Now
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Agents", value: agents.length, icon: Monitor, color: "#00D4FF" },
          { label: "Online", value: online, icon: Wifi, color: "#10b981" },
          { label: "Offline", value: offline, icon: WifiOff, color: "#ef4444" },
          { label: "Needs Reboot", value: needsReboot, icon: Clock, color: "#f59e0b" },
          { label: "Check Failures", value: checksFailing, icon: AlertTriangle, color: "#ef4444" },
          { label: "Open Alerts", value: alerts.length, icon: Bell, color: "#a855f7" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.25rem 1.5rem", borderRadius: "12px", border: `1px solid ${stat.color}18` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.75rem" }}>
              <div style={{ width: 34, height: 34, borderRadius: "8px", background: `${stat.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={16} color={stat.color} />
              </div>
              <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600 }}>{stat.label}</span>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: stat.value > 0 && (stat.label === "Offline" || stat.label === "Check Failures" || stat.label === "Open Alerts") ? stat.color : "white" }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "1.5rem", alignItems: "start" }}>
        {/* Agent Table */}
        <div className="glass-card" style={{ borderRadius: "14px", overflow: "hidden" }}>
          <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", margin: 0 }}>
              Managed Agents
            </h2>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {(["all", "online", "offline"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.3rem 0.75rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700,
                    cursor: "pointer", textTransform: "capitalize", transition: "all 0.15s",
                    background: filter === f ? "rgba(0,212,255,0.15)" : "transparent",
                    border: filter === f ? "1px solid rgba(0,212,255,0.3)" : "1px solid rgba(255,255,255,0.06)",
                    color: filter === f ? "var(--color-accent-500)" : "var(--color-neutral-500)",
                  }}
                >{f}</button>
              ))}
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
                  {["Status", "Hostname", "OS", "CPU", "RAM", "Uptime", "Checks", ""].map(h => (
                    <th key={h} style={{ padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontSize: "0.6875rem", textAlign: "left", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                      No agents found.
                    </td>
                  </tr>
                ) : filtered.map(agent => (
                  <tr
                    key={agent.id}
                    onClick={() => setSelectedAgent(selectedAgent?.id === agent.id ? null : agent)}
                    style={{ borderBottom: "1px solid rgba(0,212,255,0.04)", cursor: "pointer", transition: "background 0.15s", background: selectedAgent?.id === agent.id ? "rgba(0,212,255,0.06)" : "transparent" }}
                    onMouseEnter={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = "rgba(0,212,255,0.025)"; }}
                    onMouseLeave={e => { if (selectedAgent?.id !== agent.id) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: agent.status === "online" ? "#10b981" : "#ef4444", boxShadow: agent.status === "online" ? "0 0 6px #10b981" : "none" }} />
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{agent.hostname}</div>
                      {agent.description && <div style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem" }}>{agent.description}</div>}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--color-neutral-400)", fontSize: "0.75rem", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {agent.os}
                    </td>
                    <td style={{ padding: "0.875rem 1rem", minWidth: 90 }}>
                      <UsageBar value={agent.cpu_load} max={100} label="CPU" color="#00D4FF" />
                    </td>
                    <td style={{ padding: "0.875rem 1rem", minWidth: 90 }}>
                      <UsageBar value={agent.used_ram} max={agent.total_ram || 1} label="RAM" color="#a855f7" />
                    </td>
                    <td style={{ padding: "0.875rem 1rem", color: "var(--color-neutral-400)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                      {uptime(agent.boot_time)}
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "nowrap" }}>
                        {agent.checks.failing > 0 && <span style={{ padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(239,68,68,0.15)", color: "#ef4444", fontSize: "0.6875rem", fontWeight: 700 }}>{agent.checks.failing}✗</span>}
                        {agent.checks.warning > 0 && <span style={{ padding: "0.1rem 0.4rem", borderRadius: "4px", background: "rgba(245,158,11,0.15)", color: "#f59e0b", fontSize: "0.6875rem", fontWeight: 700 }}>{agent.checks.warning}!</span>}
                        {agent.checks.failing === 0 && agent.checks.warning === 0 && <span style={{ color: "#10b981", fontSize: "0.6875rem", fontWeight: 700 }}>✓ {agent.checks.passing}</span>}
                      </div>
                    </td>
                    <td style={{ padding: "0.875rem 1rem" }}>
                      <ChevronRight size={14} color="var(--color-neutral-600)" style={{ transform: selectedAgent?.id === agent.id ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expanded Agent Detail */}
          {selectedAgent && (
            <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(0,212,255,0.12)", background: "rgba(0,212,255,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "white", fontSize: "1.125rem", margin: 0 }}>{selectedAgent.hostname}</h3>
                  <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "0.15rem" }}>{selectedAgent.os}</p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {selectedAgent.needs_reboot && (
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                      ⟳ Reboot Required
                    </span>
                  )}
                  {selectedAgent.overdue_dashboard_alert && (
                    <span style={{ padding: "0.25rem 0.75rem", borderRadius: "6px", fontSize: "0.6875rem", fontWeight: 700, background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}>
                      ⚠ Overdue Alert
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
                {[
                  { icon: Server, label: "Client", value: selectedAgent.client },
                  { icon: HardDrive, label: "Site", value: selectedAgent.site },
                  { icon: Clock, label: "Uptime", value: uptime(selectedAgent.boot_time) },
                  { icon: Activity, label: "Last Seen", value: timeAgo(selectedAgent.last_seen) },
                  { icon: CheckCircle2, label: "Checks Passing", value: String(selectedAgent.checks.passing) },
                  { icon: AlertTriangle, label: "Checks Failing", value: String(selectedAgent.checks.failing) },
                ].map((item, i) => (
                  <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                    <item.icon size={14} color="var(--color-neutral-500)" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem", fontWeight: 600 }}>{item.label}</div>
                      <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 700 }}>{item.value || "—"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column: Alerts */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {/* Active Alerts */}
          <div className="glass-card" style={{ borderRadius: "14px", overflow: "hidden" }}>
            <div style={{ padding: "1rem 1.25rem", borderBottom: "1px solid rgba(0,212,255,0.08)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Bell size={16} color="#a855f7" />
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", margin: 0 }}>
                Active Alerts
              </h2>
              {alerts.length > 0 && (
                <span style={{ marginLeft: "auto", minWidth: 22, height: 22, borderRadius: "50%", background: "#ef4444", color: "white", fontSize: "0.6875rem", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {alerts.length}
                </span>
              )}
            </div>
            <div>
              {alerts.length === 0 ? (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <CheckCircle2 size={32} color="#10b981" style={{ margin: "0 auto 0.75rem" }} />
                  <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>All clear — no active alerts</p>
                </div>
              ) : alerts.map((alert, i) => (
                <div key={alert.id} style={{ padding: "1rem 1.25rem", borderBottom: i < alerts.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.375rem" }}>
                    <span style={{ color: "white", fontWeight: 700, fontSize: "0.8125rem" }}>{alert.hostname}</span>
                    <SeverityBadge severity={alert.severity} />
                  </div>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", margin: "0 0 0.25rem" }}>{alert.message}</p>
                  <span style={{ color: "var(--color-neutral-600)", fontSize: "0.6875rem" }}>{timeAgo(alert.alert_time)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card" style={{ borderRadius: "14px", padding: "1.25rem" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "0.9375rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Shield size={15} color="#00D4FF" /> Health Summary
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem", fontSize: "0.8125rem" }}>
                  <span style={{ color: "var(--color-neutral-400)" }}>Agent Availability</span>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>{agents.length > 0 ? Math.round((online / agents.length) * 100) : 0}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${agents.length > 0 ? (online / agents.length) * 100 : 0}%`, background: "#10b981", borderRadius: 999, transition: "width 0.6s ease" }} />
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem", fontSize: "0.8125rem" }}>
                  <span style={{ color: "var(--color-neutral-400)" }}>Checks Passing</span>
                  <span style={{ color: "#00D4FF", fontWeight: 700 }}>
                    {agents.reduce((a, b) => a + b.checks.passing, 0)} / {agents.reduce((a, b) => a + b.checks.passing + b.checks.failing + b.checks.warning, 0)}
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  {(() => {
                    const total = agents.reduce((a, b) => a + b.checks.passing + b.checks.failing + b.checks.warning, 0);
                    const passing = agents.reduce((a, b) => a + b.checks.passing, 0);
                    return <div style={{ height: "100%", width: `${total > 0 ? (passing / total) * 100 : 100}%`, background: "#00D4FF", borderRadius: 999, transition: "width 0.6s ease" }} />;
                  })()}
                </div>
              </div>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.375rem", fontSize: "0.8125rem" }}>
                  <span style={{ color: "var(--color-neutral-400)" }}>Pending Reboots</span>
                  <span style={{ color: needsReboot > 0 ? "#f59e0b" : "#10b981", fontWeight: 700 }}>{needsReboot} agent{needsReboot !== 1 ? "s" : ""}</span>
                </div>
                <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${agents.length > 0 ? (needsReboot / agents.length) * 100 : 0}%`, background: "#f59e0b", borderRadius: 999, transition: "width 0.6s ease" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
