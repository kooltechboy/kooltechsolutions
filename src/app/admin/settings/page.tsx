"use client";
import { useEffect, useState, useCallback } from "react";
import { Globe, Shield, Bell, Key, Save, Loader2, CheckCircle2, Building2, Mail, Phone, MapPin, Link2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface OrgSettings {
  id: string;
  company_name: string;
  support_email: string;
  billing_email: string;
  address: string;
  phone: string;
  website: string;
}

type NavSection = "general" | "security" | "notifications" | "apikeys";

const NAV_ITEMS: { id: NavSection; label: string; icon: React.ElementType }[] = [
  { id: "general",       label: "General",       icon: Globe   },
  { id: "security",      label: "Security",      icon: Shield  },
  { id: "notifications", label: "Notifications", icon: Bell    },
  { id: "apikeys",       label: "API Keys",      icon: Key     },
];

const Field = ({
  label, icon: Icon, value, onChange, type = "text", placeholder,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) => (
  <div>
    <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <Icon size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }} />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "0.75rem 1rem 0.75rem 2.5rem",
          borderRadius: "8px",
          background: "rgba(0,0,0,0.2)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "white",
          fontSize: "0.9rem",
          outline: "none",
          boxSizing: "border-box",
          transition: "border-color 0.2s",
        }}
        onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  </div>
);

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<NavSection>("general");
  const [org, setOrg] = useState<OrgSettings | null>(null);
  const [form, setForm] = useState<Omit<OrgSettings, "id">>({
    company_name: "",
    support_email: "",
    billing_email: "",
    address: "",
    phone: "",
    website: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const fetchOrg = useCallback(async () => {
    const { data } = await supabase.from("organizations").select("*").limit(1).single();
    if (data) {
      setOrg(data as OrgSettings);
      setForm({
        company_name: data.company_name ?? "",
        support_email: data.support_email ?? "",
        billing_email: data.billing_email ?? "",
        address: data.address ?? "",
        phone: data.phone ?? "",
        website: data.website ?? "",
      });
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrg();
  }, [fetchOrg]);

  const handleSave = async () => {
    if (!org) return;
    setSaving(true);
    await supabase
      .from("organizations")
      .update({ ...form, updated_at: new Date().toISOString() })
      .eq("id", org.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Platform Settings
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Configure global variables, branding, and security policies.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || activeSection !== "general"}
          className="btn-primary"
          style={{ padding: "0.75rem 1.5rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem", opacity: activeSection !== "general" ? 0.4 : 1 }}
        >
          {saved
            ? <><CheckCircle2 size={16} /> Saved!</>
            : saving
              ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
              : <><Save size={16} /> Save Changes</>
          }
        </button>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Sidebar Navigation */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.75rem 1rem",
                    borderRadius: "8px",
                    background: isActive ? "rgba(0,212,255,0.06)" : "transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottom: "none",
                    borderLeft: isActive ? "3px solid var(--color-accent-500)" : "3px solid transparent",
                    color: isActive ? "white" : "var(--color-neutral-500)",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.15s",
                    textAlign: "left",
                    width: "100%",
                  }}
                  onMouseEnter={e => { if (!isActive) (e.currentTarget.style.color = "white"); }}
                  onMouseLeave={e => { if (!isActive) (e.currentTarget.style.color = "var(--color-neutral-500)"); }}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Panel */}
        <div style={{ flex: 1 }}>
          {/* General */}
          {activeSection === "general" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.75rem" }}>
                  <Building2 size={18} color="var(--color-accent-500)" />
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>Company Profile</h2>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <Field
                    label="Company Name"
                    icon={Building2}
                    value={form.company_name}
                    onChange={(v) => setForm({ ...form, company_name: v })}
                    placeholder="Kool Tech Solutions"
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Field
                      label="Support Email"
                      icon={Mail}
                      type="email"
                      value={form.support_email}
                      onChange={(v) => setForm({ ...form, support_email: v })}
                      placeholder="support@kooltech.solutions"
                    />
                    <Field
                      label="Billing Email"
                      icon={Mail}
                      type="email"
                      value={form.billing_email}
                      onChange={(v) => setForm({ ...form, billing_email: v })}
                      placeholder="billing@kooltech.solutions"
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
                    <Field
                      label="Phone Number"
                      icon={Phone}
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      placeholder="+1-809-000-0000"
                    />
                    <Field
                      label="Website"
                      icon={Link2}
                      value={form.website}
                      onChange={(v) => setForm({ ...form, website: v })}
                      placeholder="https://www.kooltechsolutions.com"
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.5rem" }}>Business Address</label>
                    <div style={{ position: "relative" }}>
                      <MapPin size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "0.875rem", top: "0.875rem" }} />
                      <textarea
                        rows={3}
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        placeholder="Santo Domingo, Dominican Republic"
                        style={{
                          width: "100%",
                          padding: "0.75rem 1rem 0.75rem 2.5rem",
                          borderRadius: "8px",
                          background: "rgba(0,0,0,0.2)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          color: "white",
                          fontSize: "0.9rem",
                          outline: "none",
                          resize: "vertical",
                          boxSizing: "border-box",
                          fontFamily: "inherit",
                        }}
                        onFocus={e => (e.target.style.borderColor = "rgba(0,212,255,0.4)")}
                        onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                  <Globe size={18} color="var(--color-accent-500)" />
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>Theme &amp; Branding</h2>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  {[
                    { label: "Cybernetic Luxury", desc: "Dark Mode — Active", accent: "#00D4FF", active: true, bg: "#060B18" },
                    { label: "Enterprise Pristine", desc: "Light Mode — Coming Soon", accent: "#6366f1", active: false, bg: "#f8fafc" },
                  ].map((theme) => (
                    <div
                      key={theme.label}
                      style={{
                        flex: 1,
                        padding: "1.25rem",
                        borderRadius: "10px",
                        background: theme.active ? "rgba(0,212,255,0.05)" : "rgba(255,255,255,0.03)",
                        border: theme.active ? "2px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.08)",
                        cursor: theme.active ? "default" : "not-allowed",
                        opacity: theme.active ? 1 : 0.5,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                        <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "white" }}>{theme.label}</div>
                        {theme.active && <CheckCircle2 size={16} color="var(--color-accent-500)" />}
                      </div>
                      <div style={{ width: "100%", height: 40, borderRadius: "6px", background: theme.bg, border: "1px solid rgba(255,255,255,0.08)", marginBottom: "0.5rem" }} />
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{theme.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Placeholder */}
          {activeSection === "security" && (
            <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <Shield size={18} color="var(--color-accent-500)" />
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>Security Policy</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { label: "Two-Factor Authentication", desc: "Require 2FA for all admin accounts", enabled: true },
                  { label: "Session Timeout", desc: "Auto-logout after 30 minutes of inactivity", enabled: true },
                  { label: "IP Allowlisting", desc: "Restrict dashboard access to approved IPs", enabled: false },
                  { label: "Audit Log Retention", desc: "Keep security logs for 90 days", enabled: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{item.label}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.2rem" }}>{item.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: "999px", background: item.enabled ? "var(--color-accent-500)" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: item.enabled ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notifications Placeholder */}
          {activeSection === "notifications" && (
            <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <Bell size={18} color="var(--color-accent-500)" />
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>Notification Preferences</h2>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                {[
                  { label: "Critical Security Alerts", desc: "Receive email + SMS on critical threats", enabled: true },
                  { label: "Ticket SLA Breaches", desc: "Notify when a ticket exceeds its SLA window", enabled: true },
                  { label: "New Client Registration", desc: "Get notified when a new client signs up", enabled: true },
                  { label: "Weekly Summary Report", desc: "Receive a digest every Monday at 9AM", enabled: false },
                  { label: "Infrastructure Alerts", desc: "Notify on node status changes", enabled: true },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{item.label}</div>
                      <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.2rem" }}>{item.desc}</div>
                    </div>
                    <div style={{ width: 44, height: 24, borderRadius: "999px", background: item.enabled ? "var(--color-accent-500)" : "rgba(255,255,255,0.1)", position: "relative", cursor: "pointer", flexShrink: 0 }}>
                      <div style={{ position: "absolute", top: 3, left: item.enabled ? "calc(100% - 21px)" : 3, width: 18, height: 18, borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* API Keys Placeholder */}
          {activeSection === "apikeys" && (
            <div className="glass-card" style={{ padding: "2rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "1.5rem" }}>
                <Key size={18} color="var(--color-accent-500)" />
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>API Keys</h2>
              </div>
              <div style={{ padding: "3rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                <Key size={40} style={{ margin: "0 auto 1rem", opacity: 0.3 }} />
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "var(--color-neutral-400)" }}>API Key Management</div>
                <div style={{ fontSize: "0.875rem" }}>
                  Manage API keys from the <strong style={{ color: "var(--color-accent-500)" }}>Integrations</strong> page or your Supabase dashboard.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
