"use client";
import { useState } from "react";
import { Plug, RefreshCw, CheckCircle2, XCircle, X, Save, ShieldCheck } from "lucide-react";

type Integration = {
  id: string;
  name: string;
  category: string;
  status: "Connected" | "Disconnected";
  sync: string;
  apiKey?: string;
  endpoint?: string;
};

const initialIntegrations: Integration[] = [
  { id: "int-1", name: "Tactical RMM", category: "RMM", status: "Disconnected", sync: "Needs Auth", endpoint: "https://api.rmm.example.com" },
  { id: "int-2", name: "ITFlow", category: "PSA", status: "Disconnected", sync: "Needs Auth", endpoint: "https://itflow.example.com/api" },
  { id: "int-3", name: "Wazuh SIEM", category: "Security", status: "Connected", sync: "Just now" },
  { id: "int-5", name: "Stripe", category: "Billing", status: "Connected", sync: "1 hour ago" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations);
  const [selectedInt, setSelectedInt] = useState<Integration | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!selectedInt) return;
    setIsSaving(true);
    
    // Simulate API call to save securely
    setTimeout(() => {
      setIntegrations(prev => prev.map(int => 
        int.id === selectedInt.id 
          ? { ...selectedInt, status: "Connected", sync: "Just now" } 
          : int
      ));
      setIsSaving(false);
      setSelectedInt(null);
    }, 800);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white" }}>
            Platform <span className="gradient-text">Integrations</span>
          </h1>
          <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
            Manage API connections to your RMM, PSA, and Security tools. Keys are stored encrypted.
          </p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
        {integrations.map((intg) => (
          <div key={intg.id} className="glass-card" style={{ padding: "1.5rem", borderRadius: "16px", border: intg.status === "Connected" ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(255,255,255,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "12px", background: intg.status === "Connected" ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.05)", border: intg.status === "Connected" ? "1px solid rgba(0,212,255,0.2)" : "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plug size={24} color={intg.status === "Connected" ? "#00D4FF" : "var(--color-neutral-500)"} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "0.125rem" }}>{intg.name}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{intg.category}</div>
                </div>
              </div>
              <div style={{ color: intg.status === "Connected" ? "#10b981" : "var(--color-neutral-500)" }}>
                {intg.status === "Connected" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-neutral-400)", fontSize: "0.75rem", fontWeight: 600 }}>
                <RefreshCw size={12} className={intg.status === "Connected" ? "animate-spin-slow" : ""} /> Last sync: {intg.sync}
              </div>
              <button 
                onClick={() => setSelectedInt(intg)}
                style={{ 
                  padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.8125rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
                  background: intg.status === "Connected" ? "rgba(255,255,255,0.05)" : "var(--color-accent-500)",
                  border: intg.status === "Connected" ? "1px solid rgba(255,255,255,0.1)" : "none",
                  color: intg.status === "Connected" ? "white" : "white"
                }}
              >
                {intg.status === "Connected" ? "Configure" : "Connect API"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Configuration Modal */}
      {selectedInt && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="glass-card animate-in zoom-in duration-200" style={{ width: "100%", maxWidth: "500px", padding: "2rem", position: "relative", background: "#0a1628", border: "1px solid rgba(0,212,255,0.2)" }}>
            <button 
              onClick={() => setSelectedInt(null)}
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Plug size={24} color="#00D4FF" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>{selectedInt.name} Setup</h2>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Configure {selectedInt.category} API Connection</div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>API Endpoint URL</label>
                <input 
                  type="text" 
                  value={selectedInt.endpoint || ""}
                  onChange={(e) => setSelectedInt({...selectedInt, endpoint: e.target.value})}
                  placeholder="https://api.provider.com/v1"
                  style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9375rem" }}
                />
              </div>
              
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, marginBottom: "0.5rem" }}>Secure API Key / Bearer Token</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="password" 
                    value={selectedInt.apiKey || (selectedInt.status === "Connected" ? "••••••••••••••••••••••••" : "")}
                    onChange={(e) => setSelectedInt({...selectedInt, apiKey: e.target.value})}
                    placeholder="Enter integration API key..."
                    style={{ width: "100%", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "0.75rem 1rem", color: "white", outline: "none", fontSize: "0.9375rem" }}
                  />
                  <ShieldCheck size={18} color="#10b981" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                </div>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.5rem" }}>Keys are AES-256 encrypted at rest in the database.</p>
              </div>

              <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                <button 
                  onClick={() => setSelectedInt(null)}
                  style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="btn-primary"
                  style={{ flex: 1, padding: "0.875rem", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}
                >
                  {isSaving ? "Authenticating..." : <><Save size={18} /> Save Connection</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
