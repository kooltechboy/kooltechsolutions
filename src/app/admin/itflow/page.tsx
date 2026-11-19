"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Server, Ticket, Users, DollarSign, Plus, RefreshCw, Loader2,
  CheckCircle2, AlertCircle, XCircle, Search, Filter, ShieldCheck,
  Laptop, HardDrive, Cpu, Terminal, ArrowUpRight, X, Save
} from "lucide-react";

interface Asset {
  id: string;
  client_name: string;
  name: string;
  asset_tag: string;
  type: string;
  model?: string;
  serial?: string;
  ip_address?: string;
  location?: string;
  status: string;
  assigned_to?: string;
  purchase_date?: string;
  warranty_expires?: string;
  health_status: string;
  created_at?: string;
}

const ASSET_TYPES = [
  "Server", "Firewall", "Laptop", "Desktop", "Switch", "NAS", "Access Point", "Cloud Instance"
];

const INITIAL_FORM = {
  client_name: "",
  name: "",
  asset_tag: "",
  type: "Server",
  model: "",
  serial: "",
  ip_address: "",
  location: "",
  status: "In Use",
  assigned_to: "",
  purchase_date: "",
  warranty_expires: "",
  health_status: "healthy",
};

export default function NativePSAPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/psa/assets");
      const json = await res.json();
      if (json.data) {
        setAssets(json.data);
      }
    } catch (e) {
      console.error("Failed to fetch assets:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/psa/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setModalOpen(false);
        setForm(INITIAL_FORM);
        fetchAssets();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to create asset");
      }
    } catch {
      alert("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = 
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.asset_tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.ip_address && a.ip_address.includes(searchQuery));
    const matchesType = typeFilter === "all" || a.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const healthyCount = assets.filter(a => a.health_status === "healthy").length;
  const inUseCount = assets.filter(a => a.status === "In Use").length;

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              fontSize: "0.6875rem", fontFamily: "JetBrains Mono, monospace",
              padding: "0.2rem 0.6rem", borderRadius: "9999px",
              background: "rgba(0, 212, 255, 0.1)", color: "var(--color-accent-400)",
              border: "1px solid rgba(0, 212, 255, 0.2)"
            }}>
              <Terminal size={12} /> NATIVE PSA ARCHITECTURE
            </span>
          </div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white" }}>
            Client Asset & <span className="gradient-text">PSA Registry</span>
          </h1>
          <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
            In-house enterprise hardware inventory, cloud instances, and telemetry health metrics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => fetchAssets()}
            disabled={loading}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1rem", borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer"
            }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Sync Telemetry
          </button>
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.625rem 1.25rem", borderRadius: "10px",
              background: "var(--color-accent-500)",
              border: "none", color: "#020408", fontSize: "0.875rem", fontWeight: 700, cursor: "pointer"
            }}
          >
            <Plus size={16} /> Add Managed Asset
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>Total Endpoints</span>
            <HardDrive size={18} color="var(--color-accent-400)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono" }}>
            {assets.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginTop: "0.25rem" }}>
            Across all managed tenant domains
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>Operational Health</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#10b981", fontFamily: "JetBrains Mono" }}>
            {healthyCount} / {assets.length}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginTop: "0.25rem" }}>
            100% telemetry verification
          </div>
        </div>

        <div className="glass-card" style={{ padding: "1.25rem", borderRadius: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>Active Production</span>
            <Cpu size={18} color="var(--color-accent-500)" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", fontFamily: "JetBrains Mono" }}>
            {inUseCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginTop: "0.25rem" }}>
            Live production instances
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
          <Search size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder="Search by tag, name, IP, or client..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem",
              background: "rgba(10, 16, 28, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px", color: "white", fontSize: "0.875rem", outline: "none"
            }}
          />
        </div>

        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: "0.625rem 1rem", borderRadius: "10px",
            background: "rgba(10, 16, 28, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white", fontSize: "0.875rem", outline: "none"
          }}
        >
          <option value="all">All Hardware Types</option>
          {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Asset Table */}
      <div className="glass-card" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(0,0,0,0.2)" }}>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Tag & Name</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Client</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Type / Model</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>IP Address</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Status</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Health</th>
              <th style={{ padding: "1rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>Warranty</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--color-neutral-500)" }}>
                  <Loader2 className="animate-spin" size={24} style={{ margin: "0 auto 0.5rem" }} />
                  Loading native asset registry...
                </td>
              </tr>
            ) : filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", padding: "3rem", color: "var(--color-neutral-500)" }}>
                  No matching assets found.
                </td>
              </tr>
            ) : (
              filteredAssets.map(asset => (
                <tr key={asset.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ color: "white", fontWeight: 700 }}>{asset.name}</div>
                    <div style={{ fontFamily: "JetBrains Mono", fontSize: "0.75rem", color: "var(--color-accent-400)" }}>
                      {asset.asset_tag}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "white" }}>
                    {asset.client_name}
                    {asset.assigned_to && (
                      <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)" }}>
                        User: {asset.assigned_to}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ color: "white" }}>{asset.type}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)" }}>{asset.model || "—"}</div>
                  </td>
                  <td style={{ padding: "1rem", fontFamily: "JetBrains Mono", color: "var(--color-neutral-300)" }}>
                    {asset.ip_address || "DHCP / Dynamic"}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{
                      padding: "0.2rem 0.5rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                      background: asset.status === "In Use" ? "rgba(16, 185, 129, 0.15)" : "rgba(245, 158, 11, 0.15)",
                      color: asset.status === "In Use" ? "#10b981" : "#f59e0b",
                    }}>
                      {asset.status}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        background: asset.health_status === "healthy" ? "#10b981" : "#ef4444"
                      }} />
                      <span style={{ color: "white", fontSize: "0.8125rem", textTransform: "capitalize" }}>
                        {asset.health_status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>
                    {asset.warranty_expires || "Lifetime SLA"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 560, padding: "2rem", borderRadius: "16px", background: "#0a101d", border: "1px solid rgba(0,212,255,0.2)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ color: "white", fontSize: "1.25rem", fontWeight: 800, fontFamily: "Syne" }}>
                Add Managed Enterprise Asset
              </h2>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>Client Organization</label>
                  <input
                    required
                    value={form.client_name}
                    onChange={e => setForm({ ...form, client_name: e.target.value })}
                    placeholder="e.g. Nexus Corp"
                    style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>Asset Tag</label>
                  <input
                    required
                    value={form.asset_tag}
                    onChange={e => setForm({ ...form, asset_tag: e.target.value })}
                    placeholder="e.g. SRV-002"
                    style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>Asset / Node Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Core Database Cluster"
                  style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                    style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", background: "#0a101d", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  >
                    {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", marginBottom: "0.35rem" }}>IP Address</label>
                  <input
                    value={form.ip_address}
                    onChange={e => setForm({ ...form, ip_address: e.target.value })}
                    placeholder="192.168.1.10"
                    style={{ width: "100%", padding: "0.625rem", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ flex: 1, padding: "0.75rem", borderRadius: "8px", background: "var(--color-accent-500)", border: "none", color: "#020408", fontWeight: 700, cursor: "pointer" }}
                >
                  {submitting ? "Saving..." : "Save to Registry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
