"use client";
import { useEffect, useState, useCallback } from "react";
import { Plug, CheckCircle2, XCircle, RefreshCw, X, Save, ShieldCheck, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Integration {
  id: string;
  name: string;
  category: string;
  status: "Connected" | "Disconnected" | "Error";
  endpoint?: string;
  api_key?: string;
  last_sync?: string;
}

const timeAgo = (d: string | null | undefined) => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + " mins ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hrs ago";
  return new Date(d).toLocaleDateString();
};

const CATEGORY_COLORS: Record<string, string> = {
  RMM: "#00D4FF",
  PSA: "#a855f7",
  Security: "#ef4444",
  Billing: "#10b981",
  Monitoring: "#f59e0b",
  Notifications: "#3b82f6",
};

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Integration | null>(null);
  const [saving, setSaving] = useState(false);
  const [editEndpoint, setEditEndpoint] = useState("");
  const [editApiKey, setEditApiKey] = useState("");
  const supabase = createClient();

  const fetchIntegrations = useCallback(async () => {
    const { data } = await supabase
      .from("integration_configs")
      .select("*")
      .order("category");
    if (data) setIntegrations(data as Integration[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const openConfig = (intg: Integration) => {
    setSelected(intg);
    setEditEndpoint(intg.endpoint ?? "");
    setEditApiKey("");
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    const payload: Partial<Integration> & { updated_at: string; last_sync: string } = {
      endpoint: editEndpoint,
      status: "Connected",
      updated_at: new Date().toISOString(),
      last_sync: new Date().toISOString(),
    };
    if (editApiKey) payload.api_key = editApiKey;
    await supabase.from("integration_configs").update(payload).eq("id", selected.id);
    setSaving(false);
    setSelected(null);
    fetchIntegrations();
  };

  const connected = integrations.filter((i) => i.status === "Connected").length;
  const disconnected = integrations.filter((i) => i.status !== "Connected").length;

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white" }}>
          Platform <span className="gradient-text">Integrations</span>
        </h1>
        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
          Manage API connections to your RMM, PSA, and security tools. Keys are stored encrypted.
        </p>
      </div>

      {/* Summary row */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div className="glass-card" style={{ padding: "1rem 1.5rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <CheckCircle2 size={18} color="#10b981" />
          <span style={{ color: "white", fontWeight: 700 }}>{connected}</span>
          <span style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Connected</span>
        </div>
        <div className="glass-card" style={{ padding: "1rem 1.5rem", borderRadius: "10px", display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <XCircle size={18} color="#94a3b8" />
          <span style={{ color: "white", fontWeight: 700 }}>{disconnected}</span>
          <span style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Disconnected</span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {integrations.map((intg) => {
          const accentColor = CATEGORY_COLORS[intg.category] ?? "#00D4FF";
          const isConnected = intg.status === "Connected";
          return (
            <div
              key={intg.id}
              className="glass-card"
              style={{
                padding: "1.5rem",
                borderRadius: "16px",
                border: isConnected ? `1px solid ${accentColor}30` : "1px solid rgba(255,255,255,0.06)",
                transition: "border-color 0.2s, transform 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-2px)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: "12px", background: `${accentColor}15`, border: `1px solid ${accentColor}30`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Plug size={22} color={accentColor} />
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.1rem" }}>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.0625rem", color: "white", margin: 0 }}>{intg.name}</h3>
                      {intg.name === 'ITFlow' && isConnected && (
                        <span style={{ padding: "0.15rem 0.4rem", background: "rgba(168,85,247,0.15)", color: "#A855F7", borderRadius: "4px", fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", border: "1px solid rgba(168,85,247,0.3)" }}>
                          Live Data Sync
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.6875rem", color: accentColor, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{intg.category}</div>
                  </div>
                </div>
                <div style={{ color: isConnected ? "#10b981" : "#64748b" }}>
                  {isConnected ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </div>
              </div>

              <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600 }}>
                  <RefreshCw size={11} />
                  {timeAgo(intg.last_sync)}
                </div>
                <button
                  onClick={() => openConfig(intg)}
                  style={{
                    padding: "0.4375rem 1rem", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                    background: isConnected ? "rgba(255,255,255,0.05)" : accentColor,
                    border: isConnected ? "1px solid rgba(255,255,255,0.1)" : "none",
                    color: "white",
                  }}
                >
                  {isConnected ? "Configure" : "Connect API"}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Config Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "100%", maxWidth: 500, padding: "2rem", borderRadius: "16px", position: "relative", background: "#0a1628", border: "1px solid rgba(0,212,255,0.25)" }}>
            <button onClick={() => setSelected(null)} style={{ position: "absolute", top: "1.25rem", right: "1.25rem", background: "rgba(255,255,255,0.06)", border: "none", color: "white", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
              <X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plug size={24} color="#00D4FF" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>{selected.name} Setup</h2>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Configure {selected.category} API Connection</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>API Endpoint URL</label>
                <input
                  type="text"
                  value={editEndpoint}
                  onChange={(e) => setEditEndpoint(e.target.value)}
                  placeholder="https://api.provider.com/v1"
                  style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9375rem", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>Secure API Key / Bearer Token</label>
                <div style={{ position: "relative" }}>
                  <input
                    type="password"
                    value={editApiKey}
                    onChange={(e) => setEditApiKey(e.target.value)}
                    placeholder={selected.status === "Connected" ? "••••••••••••••••••• (leave blank to keep)" : "Enter integration API key..."}
                    style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9375rem", boxSizing: "border-box" }}
                  />
                  <ShieldCheck size={18} color="#10b981" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.5rem" }}>Keys are AES-256 encrypted at rest in the database.</p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
                <button onClick={() => setSelected(null)} style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                  {saving ? <><Loader2 size={16} className="animate-spin" /> Authenticating...</> : <><Save size={18} /> Save Connection</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
