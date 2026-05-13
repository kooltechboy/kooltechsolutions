"use client";
import React, { useEffect, useState } from "react";
import { User, Building, Mail, Phone, Globe, Save, Loader2, CheckCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      company_name: profile.company_name,
      // phone: profile.phone, // Assuming column exists or adding it
    }).eq('id', user?.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>Account Settings</h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Manage your personal and company information.</p>
      </div>

      <form onSubmit={handleSave} className="glass-card" style={{ padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2rem" }}>
          <div>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>First Name</label>
            <input 
              className="input-field" 
              value={profile?.first_name || ""} 
              onChange={e => setProfile({...profile, first_name: e.target.value})}
            />
          </div>
          <div>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Last Name</label>
            <input 
              className="input-field" 
              value={profile?.last_name || ""} 
              onChange={e => setProfile({...profile, last_name: e.target.value})}
            />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Company Name</label>
            <div style={{ position: "relative" }}>
              <Building size={16} color="var(--color-neutral-500)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                className="input-field" 
                style={{ paddingLeft: "3rem" }} 
                value={profile?.company_name || ""} 
                onChange={e => setProfile({...profile, company_name: e.target.value})}
              />
            </div>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Email Address (Read-only)</label>
            <div style={{ position: "relative" }}>
              <Mail size={16} color="var(--color-neutral-600)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                className="input-field" 
                style={{ paddingLeft: "3rem", color: "var(--color-neutral-600)" }} 
                value={profile?.email || ""} 
                disabled
              />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1.5rem" }}>
          {success && (
            <span style={{ color: "var(--color-success)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle size={16} /> Profile updated successfully
            </span>
          )}
          <button type="submit" disabled={saving} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
