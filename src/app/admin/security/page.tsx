"use client";
import { useEffect, useState, useCallback } from "react";
import { ShieldCheck, Eye, AlertOctagon, Lock, Plus, X, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface SecurityEvent {
  id: string;
  event_id: string;
  type: string;
  target: string;
  status: "Blocked" | "Quarantined" | "Investigating" | "Resolved";
  severity: "Low" | "Medium" | "High" | "Critical";
  source_ip?: string;
  details?: string;
  created_at: string;
}

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " mins ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hrs ago";
  return new Date(d).toLocaleDateString();
};

const statusStyle = (s: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    Blocked:     { bg: "rgba(16,185,129,0.12)",  color: "#10b981" },
    Quarantined: { bg: "rgba(0,212,255,0.12)",   color: "#00D4FF" },
    Investigating:{ bg: "rgba(245,158,11,0.12)", color: "#f59e0b" },
    Resolved:    { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" },
  };
  const t = map[s] ?? { bg: "rgba(255,255,255,0.08)", color: "#fff" };
  return { padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: t.bg, color: t.color };
};

const severityStyle = (s: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.12)",   color: "#ef4444" },
    High:     { bg: "rgba(245,158,11,0.12)",  color: "#f59e0b" },
    Medium:   { bg: "rgba(251,191,36,0.12)",  color: "#fbbf24" },
    Low:      { bg: "rgba(16,185,129,0.12)",  color: "#10b981" },
  };
  const t = map[s] ?? { bg: "rgba(255,255,255,0.08)", color: "#fff" };
  return { padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, background: t.bg, color: t.color };
};

const emptyForm = { type: "", target: "", severity: "Medium", status: "Investigating", source_ip: "", details: "" };

export default function SecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const supabase = createClient();

  const fetchEvents = useCallback(async () => {
    const { data } = await supabase
      .from("security_events")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setEvents(data as SecurityEvent[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleLog = async () => {
    if (!form.type || !form.target) return;
    setSaving(true);
    const event_id = "TH-" + Math.floor(Math.random() * 90000 + 10000);
    await supabase.from("security_events").insert({ event_id, ...form });
    setSaving(false);
    setShowModal(false);
    setForm({ ...emptyForm });
    fetchEvents();
  };

  const totalBlocked = events.filter((e) => e.status === "Blocked").length;
  const totalCritical = events.filter((e) => e.severity === "Critical").length;
  const totalInvestigating = events.filter((e) => e.status === "Investigating").length;
  const totalResolved = events.filter((e) => e.status === "Resolved").length;

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Security Operations Center
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Active threat monitoring and automated remediation logs.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={fetchEvents}
            style={{ padding: "0.625rem 1rem", borderRadius: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={16} /> Log Threat
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Blocked", value: totalBlocked, icon: ShieldCheck, color: "#10b981" },
          { label: "Critical Events", value: totalCritical, icon: AlertOctagon, color: "#ef4444" },
          { label: "Investigating", value: totalInvestigating, icon: Eye, color: "#f59e0b" },
          { label: "Resolved", value: totalResolved, icon: Lock, color: "#94a3b8" },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "8px", background: `${stat.color}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <stat.icon size={18} color={stat.color} />
              </div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", fontWeight: 600 }}>{stat.label}</div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "white" }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Threat Feed Table */}
      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem" }}>
            Threat Intelligence Feed
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.04)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Event ID", "Time", "Threat Type", "Target", "Source IP", "Status", "Severity"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.6875rem", textAlign: "left", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No security events found. Log your first threat above.
                  </td>
                </tr>
              ) : events.map((ev) => (
                <tr key={ev.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(239,68,68,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "1rem 1.25rem", color: "white", fontWeight: 700, fontSize: "0.8125rem", fontFamily: "monospace" }}>{ev.event_id}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{timeAgo(ev.created_at)}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-200)", fontSize: "0.875rem", fontWeight: 500 }}>{ev.type}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{ev.target}</td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem", fontFamily: "monospace" }}>{ev.source_ip || "—"}</td>
                  <td style={{ padding: "1rem 1.25rem" }}><span style={statusStyle(ev.status)}>{ev.status}</span></td>
                  <td style={{ padding: "1rem 1.25rem" }}><span style={severityStyle(ev.severity)}>{ev.severity}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Threat Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: "2rem", borderRadius: "16px", position: "relative", background: "#0a1628", border: "1px solid rgba(239,68,68,0.3)" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(255,255,255,0.06)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(239,68,68,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertOctagon size={20} color="#ef4444" />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white" }}>Log Security Threat</h2>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Record a new security event</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { label: "Threat Type *", key: "type", placeholder: "e.g. Brute Force Attempt" },
                { label: "Target *", key: "target", placeholder: "e.g. VPN Gateway" },
                { label: "Source IP", key: "source_ip", placeholder: "e.g. 185.220.101.5" },
                { label: "Details", key: "details", placeholder: "Optional notes about this event" },
              ].map((f) => (
                <div key={f.key}>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.4rem" }}>{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem", boxSizing: "border-box" }}
                  />
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.4rem" }}>Severity</label>
                  <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem" }}>
                    {["Low", "Medium", "High", "Critical"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.4rem" }}>Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                    style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem" }}>
                    {["Blocked", "Quarantined", "Investigating", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleLog} disabled={saving || !form.type || !form.target} className="btn-primary" style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Logging...</> : <><Plus size={16} /> Log Threat</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
