"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  LayoutDashboard, Ticket, FileText, Server, BarChart3,
  HardDrive, FolderOpen, Bot, User, LogOut, Bell, ChevronDown,
  Menu, X,
} from "lucide-react";
import NotificationHub from "@/components/shared/NotificationHub";
import BookingModal from "@/components/shared/BookingModal";

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
  const [bookingOpen, setBookingOpen] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from("profiles").select("first_name, last_name, company_name").eq("id", user.id).single();
        setProfile({ ...data, email: user.email });
      }
    }
    loadUser();
  }, []);

  const displayName = profile
    ? profile.company_name || `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Client"
    : "Loading...";

  const initials = profile
    ? (profile.company_name?.[0] || profile.first_name?.[0] || "C").toUpperCase()
    : "C";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-primary-950)" }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 90 }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: "rgba(10,22,40,0.95)",
        borderRight: "1px solid rgba(0,212,255,0.08)",
        display: "flex", flexDirection: "column",
        position: "fixed", left: 0, top: 0, bottom: 0, zIndex: 100,
        transition: "transform 0.3s ease",
      }} className={`portal-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        {/* Logo */}
        <div style={{ padding: "1.25rem 1.25rem", borderBottom: "1px solid rgba(0,212,255,0.08)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.625rem", textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, borderRadius: "8px", background: "linear-gradient(135deg, #00D4FF, #1E4D8C)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "0.75rem", fontFamily: "Syne, sans-serif" }}>KT</span>
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "Syne, sans-serif" }}>Kool Tech</div>
              <div style={{ color: "var(--color-accent-500)", fontSize: "0.6rem", letterSpacing: "0.08em" }}>CLIENT PORTAL</div>
            </div>
          </Link>
          <button className="mobile-menu-close" onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}>
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "1rem 0.75rem", overflowY: "auto" }}>
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== "/portal" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`nav-item ${isActive ? "active" : ""}`}
                style={{ marginBottom: "0.125rem" }}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div style={{ padding: "1rem", borderTop: "1px solid rgba(0,212,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <span style={{ color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 700 }}>{initials}</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{displayName}</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Active Client</div>
            </div>
            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
              title="Sign out"
              style={{ color: "var(--color-neutral-500)", background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center" }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="portal-main">
        {/* Top bar */}
        <header style={{
          height: 64, background: "rgba(10,22,40,0.8)", backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 1.5rem", gap: "1rem",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <button
            className="mobile-hamburger"
            onClick={() => setSidebarOpen(true)}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
          >
            <Menu size={22} />
          </button>
          <div style={{ flex: 1 }} />
          <NotificationHub />
                <Link href="/portal/profile" style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", textDecoration: "none" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ color: "var(--color-accent-500)", fontSize: "0.7rem", fontWeight: 700 }}>{initials}</span>
                  </div>
                  <span style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.875rem" }}>{displayName}</span>
                  <ChevronDown size={14} color="var(--color-neutral-500)" />
                </Link>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setBookingOpen(true);
                  }}
                  className="btn-primary" 
                  style={{ padding: "0.5rem 1rem", fontSize: "0.75rem", borderRadius: "8px", marginLeft: "0.5rem" }}
                >
                  Book Demo
                </button>
              </header>

        <main style={{ flex: 1, padding: "2rem 1.5rem" }}>
          {children}
        </main>
      </div>

      <BookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        initialName={profile ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() : ""}
        initialEmail={profile?.email || ""}
      />

      <style>{`
        .portal-sidebar { transform: translateX(-100%); }
        .portal-sidebar.sidebar-open { transform: translateX(0); }
        .portal-main { margin-left: 0 !important; }
        .mobile-hamburger { display: flex !important; }
        .mobile-menu-close { display: block !important; }

        @media (min-width: 900px) {
          .portal-sidebar { transform: translateX(0); }
          .portal-main { margin-left: 240px !important; }
          .mobile-hamburger { display: none !important; }
          .mobile-menu-close { display: none !important; }
        }
      `}</style>
    </div>
  );
}
