"use client";
import React, { useEffect, useState, useCallback } from "react";
import { Ticket, DollarSign, Server, Activity, ArrowRight, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

const statusMap: Record<string, { color: string; icon: typeof CheckCircle }> = {
  "in_progress": { color: "#FFB300", icon: Clock },
  "open": { color: "#00D4FF", icon: AlertTriangle },
  "resolved": { color: "#00E676", icon: CheckCircle },
  "closed": { color: "var(--color-neutral-500)", icon: CheckCircle },
};

interface UserProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  role?: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  created_at: string;
}

export default function PortalDashboard() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState({ openTickets: 0, activeServices: 0, outstanding: 0, uptime: "99.99%" });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const supabase = createClient();

  const fetchDashboardData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Fetch Profile
    const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(profileData);

    // 2. Fetch Tickets
    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (ticketsData) {
      setRecentTickets(ticketsData.slice(0, 3) as Ticket[]);
      setStats(prev => ({
        ...prev,
        openTickets: ticketsData.filter(t => t.status !== 'closed' && t.status !== 'resolved').length
      }));
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDashboardData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchDashboardData]);

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  const kpis = [
    { icon: Ticket, label: "Open Tickets", value: stats.openTickets.toString(), color: "#FFB300", sub: "Needs attention" },
    { icon: Server, label: "Active Services", value: "Managed IT", color: "#00D4FF", sub: "Service: Pro" },
    { icon: DollarSign, label: "Outstanding", value: `$${stats.outstanding}`, color: "#00E676", sub: "Current balance" },
    { icon: Activity, label: "System Uptime", value: stats.uptime, color: "#A855F7", sub: "Last 30 days" },
  ];

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.25rem" }}>
          Welcome back, <span className="gradient-text">{profile?.company_name || profile?.first_name || 'Valued Client'}</span> 👋
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Here&apos;s a snapshot of your IT environment today.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {kpis.map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{kpi.label}</div>
            <div style={{ color: kpi.color, fontSize: "0.75rem", marginTop: "0.25rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      <div className="portal-dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }}>
        {/* Recent Tickets */}
        <div className="kpi-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>Recent Tickets</h2>
            <Link href="/portal/tickets" style={{ color: "var(--color-accent-500)", fontSize: "0.8125rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.25rem" }}>
              View All <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            {recentTickets.length === 0 ? (
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", textAlign: "center", padding: "1rem" }}>No recent tickets found.</p>
            ) : recentTickets.map(t => {
              const st = statusMap[t.status] || statusMap['open'];
              return (
                <Link key={t.id} href={`/portal/tickets/${t.id}`} style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "1rem", padding: "0.875rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(75,132,200,0.1)", transition: "border-color 0.2s" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem", marginBottom: "0.2rem" }}>{t.id.slice(0,8)}</div>
                    <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.subject}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", flexShrink: 0 }}>
                    <st.icon size={13} color={st.color} />
                    <span style={{ color: st.color, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>{t.status.replace('_', ' ')}</span>
                  </div>
                </Link>
              );
            })}
          </div>
          <Link href="/portal/tickets" className="btn-ghost" style={{ display: "flex", justifyContent: "center", marginTop: "1.25rem", padding: "0.625rem" }}>
            Submit New Ticket
          </Link>
        </div>

        {/* Quick Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="kpi-card">
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1rem" }}>Quick Actions</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              {[
                { label: "Submit a Ticket", href: "/portal/tickets", color: "#00D4FF" },
                { label: "Pay Invoice", href: "/portal/invoices", color: "#00E676" },
                { label: "Chat with AI Support", href: "/portal/ai-assistant", color: "#A855F7" },
                { label: "View My Assets", href: "/portal/assets", color: "#FFB300" },
              ].map(a => (
                <Link key={a.label} href={a.href} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "0.75rem 1rem", background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${a.color}20`, borderRadius: "10px",
                  textDecoration: "none", color: "white", fontSize: "0.875rem", fontWeight: 500,
                  transition: "background 0.2s ease",
                }}>
                  {a.label}
                  <ArrowRight size={14} color={a.color} />
                </Link>
              ))}
            </div>
          </div>

          <div className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} className="pulse-online" />
              <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>System Health</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {["Email Services", "Cloud Backup", "VPN Gateway", "Monitoring"].map(s => (
                <div key={s} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{s}</span>
                  <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.15rem 0.5rem" }}>Operational</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

