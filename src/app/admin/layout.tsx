"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Ticket, BarChart3, DollarSign,
  PenSquare, Plug, Bot, Monitor, Shield, Zap, Settings,
  LogOut, Bell, User, ChevronDown,
} from "lucide-react";

const navGroups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Monitor, label: "Monitoring", href: "/admin/monitoring" },
      { icon: Shield, label: "Security", href: "/admin/security" },
    ],
  },
  {
    label: "Business",
    items: [
      { icon: Users, label: "Clients", href: "/admin/clients" },
      { icon: Ticket, label: "Tickets", href: "/admin/tickets" },
      { icon: BarChart3, label: "CRM & Pipeline", href: "/admin/crm" },
      { icon: DollarSign, label: "Invoices", href: "/admin/invoices" },
    ],
  },
  {
    label: "Platform",
    items: [
      { icon: PenSquare, label: "Blog CMS", href: "/admin/blog" },
      { icon: Plug, label: "Integrations", href: "/admin/integrations" },
      { icon: Bot, label: "AI Agent Logs", href: "/admin/ai-logs" },
      { icon: Zap, label: "Automation", href: "/admin/automation" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("/admin");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{
        width: 248, flexShrink: 0,
        background: "white",
        borderRight: "1px solid var(--color-neutral-200)",
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid var(--color-neutral-200)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: 36, height: 36, borderRadius: "8px", background: "linear-gradient(135deg, #00D4FF, #0099CC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "white", fontWeight: 800, fontFamily: "Syne, sans-serif", fontSize: "0.875rem" }}>KT</span>
          </div>
          <div>
            <div style={{ color: "var(--color-primary-900)", fontWeight: 700, fontFamily: "Syne, sans-serif", fontSize: "0.875rem" }}>Admin Portal</div>
            <div style={{ color: "#ef4444", fontSize: "0.6rem", letterSpacing: "0.08em", fontWeight: 600 }}>RESTRICTED ACCESS</div>
          </div>
        </div>

        {/* Nav Groups */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: "1.5rem" }}>
              <div style={{ color: "var(--color-neutral-600, #475569)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
                {group.label}
              </div>
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setActive(item.href)}
                  className={`nav-item ${active === item.href ? "active" : ""}`}
                  style={{ marginBottom: "0.125rem" }}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid var(--color-neutral-200)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(0,0,0,0.02)", border: "1px solid var(--color-neutral-100)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "linear-gradient(135deg, #00D4FF, #0099CC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontSize: "0.75rem", fontWeight: 700 }}>SA</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "var(--color-primary-900)", fontSize: "0.8125rem", fontWeight: 600 }}>Super Admin</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>kts@kooltech.solutions</div>
            </div>
            <Link href="/" style={{ color: "var(--color-neutral-400)", background: "none", border: "none" }}>
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 248, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <header style={{
          height: 64, background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--color-neutral-200)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Alert strip */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} className="pulse-online" />
            <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>All integrations nominal</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button style={{ background: "none", border: "none", color: "var(--color-neutral-500)", cursor: "pointer", position: "relative" }}>
              <Bell size={20} />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg, #00D4FF, #0099CC)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontSize: "0.7rem", fontWeight: 700 }}>SA</span>
              </div>
              <ChevronDown size={14} color="var(--color-neutral-400)" />
            </div>
          </div>
        </header>

        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
