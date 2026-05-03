"use client";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard, Ticket, FileText, Server, BarChart3,
  HardDrive, FolderOpen, Bot, User, LogOut, Bell, ChevronDown,
  Menu, X,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/portal" },
  { icon: Ticket, label: "Support Tickets", href: "/portal/tickets" },
  { icon: FileText, label: "Invoices", href: "/portal/invoices" },
  { icon: Server, label: "My Services", href: "/portal/services" },
  { icon: BarChart3, label: "Reports", href: "/portal/reports" },
  { icon: HardDrive, label: "Asset Inventory", href: "/portal/assets" },
  { icon: FolderOpen, label: "Documents", href: "/portal/documents" },
  { icon: Bot, label: "AI Assistant", href: "/portal/ai-assistant" },
  { icon: User, label: "My Profile", href: "/portal/profile" },
];

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [active, setActive] = useState("/portal");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-primary-950)" }}>
      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "rgba(10,22,40,0.95)",
        borderRight: "1px solid rgba(0,212,255,0.08)",
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
        transform: sidebarOpen ? "translateX(0)" : undefined,
        transition: "transform 0.3s ease",
      }} className="portal-sidebar">
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #00D4FF, #1E4D8C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.75rem", fontFamily: "Syne, sans-serif" }}>KT</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "Syne, sans-serif" }}>Kool Tech</div>
              <div style={{ color: "var(--color-accent-500)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>CLIENT PORTAL</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setActive(item.href)}
              className={`nav-item ${active === item.href ? "active" : ""}`}
              style={{ marginBottom: "0.125rem" }}
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={15} color="var(--color-accent-500)" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Acme Corp</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Gold Plan</div>
            </div>
            <Link href="/" style={{ color: "var(--color-neutral-500)" }}>
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="portal-main">
        {/* Top bar */}
        <header style={{
          height: 64, background: "rgba(10,22,40,0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
          padding: "0 1.5rem", gap: "1rem",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", position: "relative" }}>
            <Bell size={20} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, borderRadius: "50%", background: "var(--color-danger)" }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={15} color="var(--color-accent-500)" />
            </div>
            <span style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.875rem" }}>John Smith</span>
            <ChevronDown size={14} color="var(--color-neutral-500)" />
          </div>
        </header>

        <main style={{ flex: 1, padding: "2rem 1.5rem" }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .portal-sidebar { transform: translateX(-100%); }
          .portal-main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
