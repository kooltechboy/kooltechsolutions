"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Users, Ticket, BarChart3, DollarSign,
  PenSquare, Plug, Bot, Monitor, Shield, Zap, Settings, Database,
  LogOut, Bell, User, ChevronDown, Menu, X,
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
      { icon: Bot, label: "AI Workers", href: "/admin/ai-workforce" },
      { icon: Database, label: "AI Logs", href: "/admin/ai-logs" },
      { icon: Zap, label: "Services", href: "/admin/services" },
      { icon: Plug, label: "Integrations", href: "/admin/integrations" },
      { icon: Settings, label: "Automation", href: "/admin/automation" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState("/admin");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mesh-gradient" style={{ display: "flex", minHeight: "100vh", background: "var(--color-primary-950)" }}>
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        style={{
          width: 248, flexShrink: 0,
          background: "rgba(10,22,40,0.95)",
          borderRight: "1px solid rgba(0,212,255,0.08)",
          display: "flex", flexDirection: "column",
          position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
          transition: "transform 0.3s ease",
        }} 
        className={`admin-sidebar ${sidebarOpen ? "open" : ""}`}
      >
        {/* Logo */}
        <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(0,212,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "8px", background: "linear-gradient(135deg, #00D4FF, #1E4D8C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "white", fontWeight: 800, fontFamily: "Syne, sans-serif", fontSize: "0.875rem" }}>KT</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontFamily: "Syne, sans-serif", fontSize: "0.875rem" }}>Admin Portal</div>
              <div style={{ color: "var(--color-danger)", fontSize: "0.6rem", letterSpacing: "0.08em", fontWeight: 600 }}>RESTRICTED ACCESS</div>
            </div>
          </div>
          <button className="mobile-only" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        {/* Nav Groups */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: "1.5rem" }}>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 0.5rem", marginBottom: "0.5rem" }}>
                {group.label}
              </div>
              {group.items.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setActive(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`nav-item ${active === item.href ? "active" : ""}`}
                  style={{ marginBottom: "0.125rem", display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.625rem 0.75rem", borderRadius: "8px", color: "var(--color-neutral-400)", textDecoration: "none", fontSize: "0.875rem", fontWeight: 500 }}
                >
                  <item.icon size={16} />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.02)" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 700 }}>SA</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600 }}>Super Admin</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>kts@kooltech.solutions</div>
            </div>
            <Link href="/" style={{ color: "var(--color-neutral-400)", background: "none", border: "none" }}>
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }} className="admin-main">
        {/* Topbar */}
        <header style={{
          height: 64, background: "rgba(10,22,40,0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button className="mobile-only" onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", color: "white", cursor: "pointer", display: "flex", alignItems: "center" }}>
              <Menu size={24} />
            </button>
            <div className="desktop-only" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--color-success)" }} className="pulse-online" />
              <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>All integrations nominal</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", position: "relative" }}>
              <Bell size={20} />
              <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }} />
            </button>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "var(--color-accent-500)", fontSize: "0.7rem", fontWeight: 700 }}>SA</span>
              </div>
              <ChevronDown size={14} color="var(--color-neutral-400)" />
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "1rem" }}>
          {children}
        </main>
      </div>

      <style>{`
        .admin-sidebar { transform: translateX(-100%); }
        .admin-sidebar.open { transform: translateX(0); }
        .admin-main { margin-left: 0 !important; }
        .mobile-only { display: flex !important; }
        .desktop-only { display: none !important; }

        @media (min-width: 900px) {
          .admin-sidebar { transform: translateX(0); }
          .admin-main { margin-left: 248px !important; }
          .mobile-only { display: none !important; }
          .desktop-only { display: flex !important; }
        }
        
        .nav-item {
          transition: all 0.2s ease;
        }
        .nav-item:hover {
          background: rgba(0, 212, 255, 0.05);
          color: white !important;
        }
        .nav-item.active {
          background: rgba(0, 212, 255, 0.1);
          color: var(--color-accent-500) !important;
          border: 1px solid rgba(0, 212, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
