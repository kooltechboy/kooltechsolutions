"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ChevronDown, Shield, Cloud, Network, Monitor, Headphones, Award, Phone, MessageCircle, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

const servicesKeys = [
  { nameKey: "services.cybersecurity", href: "/services/cybersecurity", icon: Shield, descKey: "services.cybersecurityDesc" },
  { nameKey: "services.cloud", href: "/services/cloud", icon: Cloud, descKey: "services.cloudDesc" },
  { nameKey: "services.network", href: "/services/network", icon: Network, descKey: "services.networkDesc" },
  { nameKey: "services.monitoring", href: "/services/monitoring", icon: Monitor, descKey: "services.monitoringDesc" },
  { nameKey: "services.support", href: "/services/support", icon: Headphones, descKey: "services.supportDesc" },
  { nameKey: "services.compliance", href: "/services/compliance", icon: Award, descKey: "services.complianceDesc" },
];

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: "all 0.3s ease",
          background: isScrolled
            ? "rgba(6, 11, 24, 0.95)"
            : "transparent",
          backdropFilter: isScrolled ? "blur(20px)" : "none",
          borderBottom: isScrolled
            ? "1px solid rgba(0, 212, 255, 0.1)"
            : "1px solid transparent",
        }}
      >
        {/* Top Contact Bar */}
        <div className="top-contact-bar" style={{
          background: "linear-gradient(90deg, rgba(10,22,40,0.9) 0%, rgba(6,11,24,0.95) 100%)",
          borderBottom: "1px solid rgba(0, 212, 255, 0.05)",
          padding: "0.375rem 0",
          fontSize: "0.75rem",
          fontWeight: 600,
          color: "var(--color-neutral-400)",
        }}>
          <div className="container" style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "1.5rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Phone size={12} color="var(--color-accent-500)" />
              <a href="tel:829-720-1611" style={{ color: "var(--color-neutral-300)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-neutral-300)"}>829-720-1611</a>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <MessageCircle size={12} color="#25D366" />
              <a href="https://wa.me/18297201611" style={{ color: "var(--color-neutral-300)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-neutral-300)"}>WhatsApp</a>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <Headphones size={12} color="var(--color-accent-500)" />
              <a href="mailto:support@kooltechsolutions.com" style={{ color: "var(--color-neutral-300)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-neutral-300)"}>support@kooltechsolutions.com</a>
            </span>
            <Link href="/portal" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-accent-500)", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "white"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-accent-500)"}>
              {t("nav.clientPortal")} <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: "72px" }}>
          {/* Logo */}
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #00D4FF, #1E4D8C)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
            }}>
              <span style={{ color: "#fff", fontWeight: 800, fontSize: "1rem", fontFamily: "Syne, sans-serif" }}>KT</span>
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", fontFamily: "Syne, sans-serif", lineHeight: 1.2 }}>
                Kool Tech
              </div>
              <div style={{ color: "var(--color-accent-500)", fontSize: "0.65rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Solutions
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }} className="desktop-nav">
            <NavLink href="/">{t("nav.home")}</NavLink>
            <NavLink href="/about">{t("nav.about")}</NavLink>

            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <Link 
                href="/services"
                style={{
                  display: "flex", alignItems: "center", gap: "0.25rem",
                  padding: "0.5rem 0.75rem", background: "transparent",
                  border: "none", color: "var(--color-neutral-400)",
                  fontSize: "0.875rem", fontWeight: 500, cursor: "pointer",
                  fontFamily: "DM Sans, sans-serif", transition: "color 0.2s ease",
                  textDecoration: "none"
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--color-neutral-400)")}
              >
                {t("nav.services")} <ChevronDown size={14} />
              </Link>
              {servicesOpen && (
                <div style={{
                  position: "absolute", top: "calc(100% + 8px)", left: "-160px",
                  width: "480px", background: "rgba(6, 11, 24, 0.97)",
                  backdropFilter: "blur(24px)", border: "1px solid rgba(0,212,255,0.15)",
                  borderRadius: "16px", padding: "1rem",
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem", boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
                }}>
                  {servicesKeys.map(s => (
                    <Link key={s.nameKey} href={s.href} style={{
                      display: "flex", alignItems: "center", gap: "0.75rem",
                      padding: "0.75rem", borderRadius: "10px", textDecoration: "none",
                      transition: "background 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.08)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div style={{
                        width: 36, height: 36, borderRadius: "8px",
                        background: "rgba(0,212,255,0.1)", display: "flex",
                        alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        <s.icon size={16} color="var(--color-accent-500)" />
                      </div>
                      <div>
                        <div style={{ color: "#fff", fontSize: "0.8125rem", fontWeight: 600 }}>{t(s.nameKey)}</div>
                        <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{t(s.descKey)}</div>
                      </div>
                    </Link>
                  ))}
                  <div style={{ gridColumn: "span 2", borderTop: "1px solid rgba(0,212,255,0.1)", paddingTop: "0.75rem", marginTop: "0.25rem" }}>
                    <Link href="/services" style={{
                      display: "flex", alignItems: "center", justifyContent: "center",
                      gap: "0.5rem", padding: "0.5rem", borderRadius: "8px",
                      color: "var(--color-accent-500)", textDecoration: "none",
                      fontSize: "0.8125rem", fontWeight: 600,
                      background: "rgba(0,212,255,0.06)",
                      transition: "background 0.2s ease",
                    }}>
                      {t("services.readMore")} →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <NavLink href="/pricing">{t("nav.pricing")}</NavLink>
            <NavLink href="/blog">{t("nav.blog")}</NavLink>
            <NavLink href="/contact">{t("nav.contact")}</NavLink>
          </div>

          {/* CTA Buttons & Language Switcher */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }} className="desktop-nav">
            <Link href="/contact?book=true" className="btn-primary" style={{ padding: "0.5rem 1.25rem", fontSize: "0.875rem" }}>
              {t("hero.ctaAssessment")}
            </Link>

            {/* Language Selection Toggle */}
            <div style={{ 
              display: "flex", gap: "0.25rem", padding: "0.25rem", 
              background: "rgba(255,255,255,0.05)", borderRadius: "8px", 
              border: "1px solid rgba(0,212,255,0.15)", marginLeft: "0.5rem" 
            }}>
              <button 
                onClick={() => setLanguage("en")} 
                style={{
                  background: language === "en" ? "var(--color-accent-500)" : "transparent",
                  color: language === "en" ? "white" : "var(--color-neutral-400)",
                  border: "none", padding: "0.25rem 0.5rem", borderRadius: "6px", 
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                EN
              </button>
              <button 
                onClick={() => setLanguage("es")} 
                style={{
                  background: language === "es" ? "var(--color-accent-500)" : "transparent",
                  color: language === "es" ? "white" : "var(--color-neutral-400)",
                  border: "none", padding: "0.25rem 0.5rem", borderRadius: "6px", 
                  fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                ES
              </button>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "none", background: "none", border: "none",
              color: "white", cursor: "pointer", padding: "0.5rem",
            }}
            className="mobile-menu-btn"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="mobile-menu" style={{
            background: "rgba(6, 11, 24, 0.98)", backdropFilter: "blur(24px)",
            borderTop: "1px solid rgba(0,212,255,0.1)",
            padding: "1.5rem 1rem", display: "flex", flexDirection: "column", gap: "0.5rem",
          }}>
            {[
              { label: t("nav.home"), href: "/" },
              { label: t("nav.about"), href: "/about" },
              { label: t("nav.services"), href: "/services" },
              { label: t("nav.pricing"), href: "/pricing" },
              { label: t("nav.blog"), href: "/blog" },
              { label: t("nav.contact"), href: "/contact" }
            ].map(item => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "0.75rem 1rem", borderRadius: "8px", color: "white",
                  textDecoration: "none", fontSize: "1rem", fontWeight: 500,
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/portal" onClick={() => setMobileOpen(false)} style={{
              padding: "0.75rem 1rem", borderRadius: "8px",
              color: "var(--color-neutral-400)", textDecoration: "none", fontSize: "1rem",
            }}>
              {t("nav.clientPortal")}
            </Link>
            <Link href="/contact?book=true" onClick={() => setMobileOpen(false)} className="btn-primary" style={{ justifyContent: "center", marginTop: "0.5rem" }}>
              {t("hero.ctaAssessment")}
            </Link>

            {/* Mobile Language Switcher */}
            <div style={{ 
              display: "flex", gap: "0.5rem", padding: "0.5rem", 
              background: "rgba(255,255,255,0.05)", borderRadius: "8px", 
              border: "1px solid rgba(0,212,255,0.1)", marginTop: "1rem",
              justifyContent: "center"
            }}>
              <button 
                onClick={() => { setLanguage("en"); setMobileOpen(false); }} 
                style={{
                  flex: 1,
                  background: language === "en" ? "var(--color-accent-500)" : "transparent",
                  color: language === "en" ? "white" : "var(--color-neutral-400)",
                  border: "none", padding: "0.5rem", borderRadius: "6px", 
                  fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                English
              </button>
              <button 
                onClick={() => { setLanguage("es"); setMobileOpen(false); }} 
                style={{
                  flex: 1,
                  background: language === "es" ? "var(--color-accent-500)" : "transparent",
                  color: language === "es" ? "white" : "var(--color-neutral-400)",
                  border: "none", padding: "0.5rem", borderRadius: "6px", 
                  fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                }}
              >
                Español
              </button>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        .desktop-nav { display: none !important; }
        .mobile-menu-btn { display: flex !important; }

        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{
      padding: "0.5rem 0.75rem", color: "var(--color-neutral-400)",
      textDecoration: "none", fontSize: "0.875rem", fontWeight: 500,
      borderRadius: "6px", transition: "color 0.2s ease",
    }}
    onMouseEnter={e => (e.currentTarget.style.color = "white")}
    onMouseLeave={e => (e.currentTarget.style.color = "var(--color-neutral-400)")}
    >
      {children}
    </Link>
  );
}
