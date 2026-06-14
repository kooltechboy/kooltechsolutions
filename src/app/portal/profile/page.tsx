"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Building, Mail, Phone, Globe, Save, Loader2, CheckCircle2,
  Shield, Key, Bell, CreditCard, ChevronRight, ArrowUpRight,
  UserCheck, BadgeCheck, Camera, LogOut, Lock
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  role?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/profile") {
      router.replace("/portal?view=profile");
    }
  }, [router]);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    if (data) setProfile(data as ProfileData);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProfile();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchProfile]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('profiles').update({
      first_name: profile.first_name,
      last_name: profile.last_name,
      company_name: profile.company_name,
    }).eq('id', user?.id);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-[#00D4FF] animate-spin" />
          <User className="absolute inset-0 m-auto text-[#00D4FF]/40" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6" style={{ marginBottom: "1.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.25rem" }}>
            Account <span className="gradient-text">Console</span>
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
            Manage your professional identity and security parameters.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="p-3 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white transition-all">
            <Bell size={20} />
          </button>
          <button className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[10px] uppercase tracking-widest hover:bg-red-500/20 transition-all flex items-center gap-2">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: User, label: "Account Status", value: "Active", color: "#00E676", sub: "Billing current" },
          { icon: Shield, label: "Security Score", value: "84%", color: "#A855F7", sub: "Identity secure" },
          { icon: BadgeCheck, label: "Trust Tier", value: "Enterprise", color: "#00D4FF", sub: "SLA Connected" },
          { icon: Key, label: "MFA Status", value: "Enabled", color: "#FFB300", sub: "Hardware Keys" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{kpi.label}</div>
            <div style={{ color: kpi.color, fontSize: "0.75rem", marginTop: "0.25rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Trust */}
        <div className="space-y-6">
          <div className="kpi-card text-center space-y-4">
            <div className="relative inline-block mx-auto">
              <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#00D4FF]/20 to-[#A855F7]/20 border border-white/10 flex items-center justify-center overflow-hidden">
                <User size={64} className="text-white/40" />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2.5 rounded-xl bg-[#00D4FF] text-[#0A1628] shadow-xl border border-white/20 hover:scale-110 transition-transform">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-syne tracking-tight uppercase">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-neutral-500 text-[10px] font-black uppercase tracking-widest mt-1">
                {profile?.company_name}
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[#00D4FF] text-[9px] font-black uppercase tracking-widest">
              <BadgeCheck size={12} /> Verified Enterprise
            </div>
          </div>

          <div className="kpi-card space-y-4">
            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em] px-1">Security Score</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                <span>Identity Protection</span>
                <span className="text-[#00E676]">84%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#00E676] to-[#00D4FF] w-[84%] shadow-[0_0_10px_rgba(0,230,118,0.3)]" />
              </div>
              <p className="text-neutral-600 text-[10px] font-bold leading-relaxed">
                Your account is protected with MFA and hardware-security-key support.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="kpi-card space-y-8" style={{ padding: "2rem" }}>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck size={20} className="text-[#00D4FF]" />
              <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">Profile Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Given Name</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all font-medium"
                  value={profile?.first_name || ""} 
                  onChange={e => profile && setProfile({...profile, first_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Surname</label>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all font-medium"
                  value={profile?.last_name || ""} 
                  onChange={e => profile && setProfile({...profile, last_name: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Corporate Entity</label>
                <div className="relative">
                  <Building size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                  <input 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all font-medium"
                    value={profile?.company_name || ""} 
                    onChange={e => profile && setProfile({...profile, company_name: e.target.value})}
                  />
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Primary Communications (Immutable)</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-800" />
                  <input 
                    className="w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 pl-12 text-neutral-600 cursor-not-allowed font-medium"
                    value={profile?.email || ""} 
                    disabled
                  />
                  <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-800" />
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <button type="button" className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                  <Key size={14} /> Reset Credentials
                </button>
                <button type="button" className="text-[10px] font-black text-neutral-500 uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                  <CreditCard size={14} /> Payment Portal
                </button>
              </div>

              <div className="flex items-center gap-6">
                {success && (
                  <span className="text-[#00E676] text-[10px] font-black uppercase tracking-widest flex items-center gap-2 animate-in slide-in-from-right-4">
                    <CheckCircle2 size={16} /> Registry Updated
                  </span>
                )}
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="px-10 py-4 rounded-2xl bg-white text-[#0A1628] font-black text-xs uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl shadow-white/5 flex items-center gap-3 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Commit Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
