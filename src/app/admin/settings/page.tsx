import type { Metadata } from "next";
import { Settings, Save, Shield, Key, Bell, Globe } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Settings" };

export default function SettingsPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "900px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Platform Settings
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Configure global variables, branding, and security policies.
          </p>
        </div>
        <button className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px" }}>
          <Save size={18} /> Save Changes
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Settings Navigation (Static mockup) */}
        <div style={{ width: "240px", flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", background: "rgba(0,212,255,0.05)", borderRadius: "8px", color: "white", fontWeight: 600, fontSize: "0.875rem", borderLeft: "3px solid var(--color-accent-500)" }}>
              <Globe size={18} /> General
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontWeight: 500, fontSize: "0.875rem" }}>
              <Shield size={18} /> Security
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontWeight: 500, fontSize: "0.875rem" }}>
              <Bell size={18} /> Notifications
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", color: "var(--color-neutral-500)", fontWeight: 500, fontSize: "0.875rem" }}>
              <Key size={18} /> API Keys
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div style={{ flex: 1 }}>
          <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "1.5rem" }}>
              Company Profile
            </h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Company Name</label>
                <input type="text" defaultValue="Kool Tech Solutions" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none" }} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Support Email</label>
                  <input type="email" defaultValue="support@kooltech.solutions" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none" }} />
                </div>
                <div>
                  <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Billing Email</label>
                  <input type="email" defaultValue="billing@kooltech.solutions" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none" }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Primary Business Address</label>
                <textarea rows={3} defaultValue="123 Tech Lane, Suite 400\nInnovation City, TX 75001" style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none", resize: "none" }} />
              </div>
            </div>
          </div>
          
          <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px",  }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "1.5rem" }}>
              Theme & Branding
            </h2>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ flex: 1, padding: "1rem", borderRadius: "8px", border: "2px solid var(--color-accent-500)", background: "rgba(0,212,255,0.05)", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "white", marginBottom: "0.25rem" }}>Enterprise Pristine</div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Light Mode Active</div>
              </div>
              <div style={{ flex: 1, padding: "1rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", background: "#060B18", cursor: "pointer" }}>
                <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "white", marginBottom: "0.25rem" }}>Cybernetic Luxury</div>
                <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem" }}>Dark Mode Disabled</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
