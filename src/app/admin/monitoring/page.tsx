"use client";
import { useEffect, useState, useCallback } from "react";
import { Server, Activity, HardDrive, Wifi, CheckCircle2, AlertTriangle, XCircle, Plus, X, Loader2, RefreshCw, Wrench } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface InfraNode {
  id: string;
  node_id: string;
  name: string;
  type: string;
  status: "Online" | "Warning" | "Offline" | "Maintenance";
  uptime: string;
  cpu_usage: number;
  ram_usage: number;
  ip_address?: string;
  location?: string;
  last_seen: string;
}

const timeAgo = (d: string) => {
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
  const [nodes, setNodes] = useState<InfraNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ node_id: "", name: "", type: "Server", ip_address: "", location: "" });
  const supabase = createClient();

  const fetchNodes = useCallback(async () => {
    const { data } = await supabase
      .from("infrastructure_nodes")
      .select("id, node_id, name, type, status, uptime, cpu_usage, ram_usage, ip_address, location, last_seen")
      .order("created_at", { ascending: false });
    if (data) setNodes(data as InfraNode[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchNodes();
    const interval = setInterval(fetchNodes, 30000);
    return () => clearInterval(interval);
  }, [fetchNodes]);

  const handleAddNode = async () => {
    if (!form.node_id || !form.name) return;
    setSaving(true);
    await supabase.from("infrastructure_nodes").insert({
      ...form,
      status: "Online",
      uptime: "100%",
      cpu_usage: 0,
      ram_usage: 0,
    });
    setSaving(false);
    setShowModal(false);
    setForm({ node_id: "", name: "", type: "Server", ip_address: "", location: "" });
    fetchNodes();
  };

  const total = nodes.length;
  const online = nodes.filter((n) => n.status === "Online").length;
  const warning = nodes.filter((n) => n.status === "Warning").length;
  const offline = nodes.filter((n) => n.status === "Offline" || n.status === "Maintenance").length;

  const statusIcon = (s: string) => {
    if (s === "Online") return <CheckCircle2 size={14} />;
    if (s === "Warning") return <AlertTriangle size={14} />;
    if (s === "Maintenance") return <Wrench size={14} />;
    return <XCircle size={14} />;
  };
  const statusColor = (s: string) => {
    if (s === "Online") return "#10b981";
    if (s === "Warning") return "#f59e0b";
    if (s === "Maintenance") return "#a855f7";
    return "#ef4444";
  };

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
            Infrastructure Monitoring
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Real-time health and performance metrics. Auto-refreshes every 30s.
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={fetchNodes}
            style={{ padding: "0.625rem 1rem", borderRadius: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
            style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.375rem" }}
          >
            <Plus size={16} /> Add Node
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { label: "Total Nodes", value: total, icon: Server, color: "#00D4FF" },
          { label: "Online", value: online, icon: CheckCircle2, color: "#10b981" },
          { label: "Warning", value: warning, icon: AlertTriangle, color: "#f59e0b" },
          { label: "Offline / Maint.", value: offline, icon: XCircle, color: "#ef4444" },
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

      {/* Nodes Table */}
      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem" }}>
            Node Health Status
          </h2>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.04)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Node ID", "Name", "Type", "Status", "Uptime", "CPU", "RAM", "Last Seen"].map((h) => (
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
                    No infrastructure nodes found. Add your first node above.
                  </td>
                </tr>
              ) : nodes.map((node) => (
                <tr key={node.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.04)", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.025)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-accent-500)", fontWeight: 700, fontSize: "0.8125rem", fontFamily: "monospace" }}>
                    {node.node_id}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "white", fontWeight: 600, fontSize: "0.875rem" }}>
                    {node.name}
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(0,212,255,0.08)", color: "var(--color-accent-600)", fontSize: "0.75rem", fontWeight: 700 }}>
                      {node.type}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: statusColor(node.status), fontSize: "0.8125rem", fontWeight: 700 }}>
                      {statusIcon(node.status)} {node.status}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                    {node.uptime}
                  </td>
                  <td style={{ padding: "1rem 1.25rem", minWidth: 120 }}>
                    <UsageBar value={node.cpu_usage} label="CPU" />
                  </td>
                  <td style={{ padding: "1rem 1.25rem", minWidth: 120 }}>
                    <UsageBar value={node.ram_usage} label="RAM" />
                  </td>
                  <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                    {timeAgo(node.last_seen)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Node Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 480, padding: "2rem", borderRadius: "16px", position: "relative", background: "#0a1628", border: "1px solid rgba(0,212,255,0.25)" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(255,255,255,0.06)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(0,212,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Server size={20} color="#00D4FF" />
              </div>
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white" }}>Add Infrastructure Node</h2>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Register a new managed node</p>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { label: "Node ID *", key: "node_id", placeholder: "e.g. SRV-DC-02" },
                { label: "Display Name *", key: "name", placeholder: "e.g. Secondary Domain Controller" },
                { label: "IP Address", key: "ip_address", placeholder: "e.g. 192.168.1.10" },
                { label: "Location", key: "location", placeholder: "e.g. Rack A, DC1" },
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
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.4rem" }}>Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  style={{ width: "100%", background: "#0a1628", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9rem" }}
                >
                  {["Server", "Workstation", "Network", "Firewall", "Switch", "Appliance", "Cloud"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button onClick={() => setShowModal(false)} style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleAddNode} disabled={saving || !form.node_id || !form.name} className="btn-primary" style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : <><Plus size={16} /> Add Node</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
