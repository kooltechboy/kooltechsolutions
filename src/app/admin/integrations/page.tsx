import type { Metadata } from "next";
import { Plug, RefreshCw, CheckCircle2, XCircle } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Integrations" };

const integrations = [
  { id: "int-1", name: "Tactical RMM", category: "RMM", status: "Connected", sync: "2 mins ago" },
  { id: "int-2", name: "Wazuh SIEM", category: "Security", status: "Connected", sync: "Just now" },
  { id: "int-3", name: "ITFlow", category: "PSA", status: "Connected", sync: "5 mins ago" },
  { id: "int-4", name: "Action1", category: "Patch Management", status: "Disconnected", sync: "Needs Auth" },
  { id: "int-5", name: "Stripe", category: "Billing", status: "Connected", sync: "1 hour ago" },
  { id: "int-6", name: "Office 365", category: "Identity", status: "Connected", sync: "15 mins ago" },
];

export default function IntegrationsPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Platform Integrations
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Manage API connections to your RMM, PSA, and Security tools.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
        {integrations.map((intg) => (
          <div key={intg.id} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px",  }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <div style={{ width: 48, height: 48, borderRadius: "10px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plug size={24} color={intg.status === "Connected" ? "var(--color-primary-900)" : "var(--color-neutral-400)"} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "0.125rem" }}>{intg.name}</h3>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600 }}>{intg.category}</div>
                </div>
              </div>
              <div style={{ color: intg.status === "Connected" ? "var(--color-success)" : "var(--color-danger)" }}>
                {intg.status === "Connected" ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--color-neutral-100)", paddingTop: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>
                <RefreshCw size={12} /> Last sync: {intg.sync}
              </div>
              <button style={{ 
                padding: "0.5rem 1rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer",
                background: intg.status === "Connected" ? "transparent" : "var(--color-primary-900)",
                border: intg.status === "Connected" ? "1px solid var(--color-neutral-200)" : "none",
                color: intg.status === "Connected" ? "var(--color-primary-900)" : "white"
              }}>
                {intg.status === "Connected" ? "Configure" : "Connect"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
