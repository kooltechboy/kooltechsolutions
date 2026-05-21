"use client";
import { useEffect, useState, useCallback } from "react";
import { Zap, Play, Pause, Plus, X, Loader2, Clock, BarChart2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  status: "Active" | "Paused" | "Disabled";
  run_count: number;
  last_run: string | null;
  description?: string;
  created_at: string;
}

const timeAgo = (d: string | null) => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " mins ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hrs ago";
  return new Date(d).toLocaleDateString();
};

const emptyForm = { name: "", trigger: "", description: "", status: "Active" };

export default function AutomationPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const supabase = createClient();

  const fetchWorkflows = useCallback(async () => {
    const { data } = await supabase
      .from("automation_workflows")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setWorkflows(data as Workflow[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleToggle = async (wf: Workflow) => {
    setTogglingId(wf.id);
    const newStatus = wf.status === "Active" ? "Paused" : "Active";
    await supabase.from("automation_workflows").update({ status: newStatus }).eq("id", wf.id);
    setTogglingId(null);
    fetchWorkflows();
  };

  const handleCreate = async () => {
    if (!form.name || !form.trigger) return;
    setSaving(true);
    await supabase.from("automation_workflows").insert({ ...form, run_count: 0 });
    setSaving(false);
    setShowModal(false);
    setForm({ ...emptyForm });
    fetchWorkflows();
  };

  const active = workflows.filter((w) => w.status === "Active").length;
  const paused = workflows.filter((w) => w.status === "Paused" || w.status === "Disabled").length;
  const totalRuns = workflows.reduce((sum, w) => sum + w.run_count, 0);

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
            Workflows &amp; Automation
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Automate tedious tasks using trigger-based workflow rules.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
          style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.375rem" }}
        >
          <Plus size={16} /> Create Workflow
        </button>
      </div>

      {/* KPI cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Workflows", value: workflows.length, icon: Zap, color: "#00D4FF" },
          { label: "Active", value: active, icon: Play, color: "#10b981" },
          { label: "Paused", value: paused, icon: Pause, color: "#f59e0b" },
          { label: "Total Runs", value: totalRuns.toLocaleString(), icon: BarChart2, color: "#a855f7" },
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

      {/* Workflows Table */}
      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem" }}>All Workflows</h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.04)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Workflow Name", "Trigger", "Status", "Total Runs", "Last Run", "Action"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.6875rem", textAlign: "left", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No workflows yet. Create your first automation above.
                  </td>
                </tr>
              ) : workflows.map((wf) => (
                <tr key={wf.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                      <Zap size={14} color="var(--color-accent-500)" /> {wf.name}
                    </div>
                    {wf.description && (
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.2rem", paddingLeft: "1.375rem" }}>{wf.description}</div>
                    )}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <span style={{ background: "rgba(0,212,255,0.08)", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, color: "var(--color-accent-600)" }}>
                      {wf.trigger}
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: wf.status === "Active" ? "#10b981" : "#94a3b8", fontSize: "0.8125rem", fontWeight: 700 }}>
                      {wf.status === "Active" ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />} {wf.status}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "white", fontSize: "0.875rem", fontWeight: 700, fontFamily: "monospace" }}>
                    {wf.run_count.toLocaleString()}
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
                      <Clock size={12} /> {timeAgo(wf.last_run)}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <button
                      onClick={() => handleToggle(wf)}
                      disabled={togglingId === wf.id}
                      style={{
                        padding: "0.375rem 0.875rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", border: "none",
                        background: wf.status === "Active" ? "rgba(245,158,11,0.12)" : "rgba(16,185,129,0.12)",
                        color: wf.status === "Active" ? "#f59e0b" : "#10b981",
                        opacity: togglingId === wf.id ? 0.5 : 1,
                      }}
                    >
                      {togglingId === wf.id ? "..." : wf.status === "Active" ? "Pause" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Workflow Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: "2rem", borderRadius: "16px", position: "relative", background: "#0a1628", border: "1px solid rgba(0,212,255,0.25)" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(255,255,255,0.06)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={20} color="#00D4FF" />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white" }}>New Workflow</h2>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Define a trigger-based automation rule</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { label: "Workflow Name *", key: "name", placeholder: "e.g. High CPU Alert → Create Ticket" },
                { label: "Trigger *", key: "trigger", placeholder: "e.g. Wazuh Alert, Form Submit, Schedule" },
                { label: "Description", key: "description", placeholder: "Optional: what does this workflow do?" },
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
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.4rem" }}>Initial Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem" }}>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={saving || !form.name || !form.trigger} className="btn-primary" style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Zap size={16} /> Create Workflow</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
