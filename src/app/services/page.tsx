"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Cloud, Network, Monitor, Headphones, Award, ArrowRight, Zap, CheckCircle2, Server, Lock, Globe } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function ServicesPage() {
  const { t } = useLanguage();

  const serviceCategories = [
    {
      id: "security",
      title: t("servPage.catSecurityTitle"),
      icon: Shield,
      color: "#00D4FF",
      description: t("servPage.catSecurityDesc"),
      features: ["SIEM/SOC Operations", "Penetration Testing", "MFA & Identity Governance", "Encrypted Data At-Rest/In-Transit"],
      href: "/services/cybersecurity"
    },
    {
      id: "cloud",
      title: t("servPage.catCloudTitle"),
      icon: Cloud,
      color: "#A855F7",
      description: t("servPage.catCloudDesc"),
      features: ["Azure/AWS Governance", "Infrastructure as Code (IaC)", "Container Orchestration", "Predictive Scaling"],
      href: "/services/cloud"
    },
    {
      id: "network",
      title: t("servPage.catNetworkTitle"),
      icon: Network,
      color: "#00E676",
      description: t("servPage.catNetworkDesc"),
      features: ["SD-WAN Optimization", "Network Edge Security", "Fiber Mesh Deployment", "QoS Voice/Data Prioritization"],
      href: "/services/network"
    },
    {
      id: "monitoring",
      title: t("servPage.catMonitoringTitle"),
      icon: Monitor,
      color: "#FFB300",
      description: t("servPage.catMonitoringDesc"),
      features: ["AI-Driven Diagnostics", "Heuristic Health Checks", "Automatic Patch Management", "Hardware Lifecycle Auditing"],
      href: "/services/monitoring"
    },
    {
      id: "support",
      title: t("servPage.catSupportTitle"),
      icon: Headphones,
      color: "#FF4444",
      description: t("servPage.catSupportDesc"),
      features: ["L3 Senior Support", "Executive White-Glove Desk", "Rapid On-Site Dispatch", "Workflow Automation Support"],
      href: "/services/support"
    },
    {
      id: "compliance",
      title: t("servPage.catComplianceTitle"),
      icon: Award,
      color: "#33DDFF",
      description: t("servPage.catComplianceDesc"),
      features: ["Audit-Ready Reporting", "Continuous Data Audits", "HIPAA/PCI Hardening", "Disaster Recovery Testing"],
      href: "/services/compliance"
    }
  ];

  const blueprintSteps = [
    { 
      step: "01", 
      title: t("servPage.step1Title"), 
      desc: t("servPage.step1Desc"),
      details: ["Asset Mapping", "Security Baseline", "Cloud Readiness Assessment"]
    },
    { 
      step: "02", 
      title: t("servPage.step2Title"), 
      desc: t("servPage.step2Desc"),
      details: ["Architectural Design", "Zero-Downtime Migration", "Staff Onboarding"]
    },
    { 
      step: "03", 
      title: t("servPage.step3Title"), 
      desc: t("servPage.step3Desc"),
      details: ["Predictive Analytics", "Quarterly Strategy Reviews", "Infinite Scalability"]
    }
  ];

  const reachItems = [
    { icon: Globe, title: t("servPage.reach1Title"), desc: t("servPage.reach1Desc") },
    { icon: Server, title: t("servPage.reach2Title"), desc: t("servPage.reach2Desc") },
    { icon: Lock, title: t("servPage.reach3Title"), desc: t("servPage.reach3Desc") }
  ];

  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Hero Section */}
        <section style={{ padding: "8rem 0 4rem", textAlign: "center" }}>
          <div className="container">
            <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>{t("servPage.badge")}</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "white", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              {t("servPage.titleStart")} <span className="gradient-text">{t("servPage.titleGradient")}</span> <br />{t("servPage.titleEnd")}
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "700px", margin: "0 auto 3rem", fontSize: "1.1rem", lineHeight: 1.7 }}>
              {t("servPage.subtitle")}
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section style={{ padding: "2rem 0 8rem" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))", gap: "2rem" }}>
              {serviceCategories.map((service) => (
                <div 
                  key={service.id} 
                  className="glass-card" 
                  style={{ 
                    padding: "2.5rem", 
                    borderRadius: "24px", 
                    display: "flex", 
                    flexDirection: "column",
                    border: "1px solid rgba(255,255,255,0.05)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{
                    width: 60, height: 60, borderRadius: "16px",
                    background: `${service.color}15`, display: "flex",
                    alignItems: "center", justifyContent: "center", marginBottom: "1.5rem",
                    border: `1px solid ${service.color}30`
                  }}>
                    <service.icon size={28} color={service.color} />
                  </div>

                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", color: "white", marginBottom: "1rem" }}>{service.title}</h3>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "2rem", flex: 1 }}>
                    {service.description}
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "2rem" }}>
                    {service.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem" }}>
                        <CheckCircle2 size={14} color={service.color} /> {f}
                      </div>
                    ))}
                  </div>

                  <Link 
                    href={service.href} 
                    style={{ 
                      display: "inline-flex", 
                      alignItems: "center", 
                      gap: "0.5rem", 
                      color: service.color, 
                      textDecoration: "none", 
                      fontWeight: 600, 
                      fontSize: "0.875rem",
                      transition: "gap 0.2s"
                    }}
                    onMouseEnter={e => (e.currentTarget.style.gap = "0.75rem")}
                    onMouseLeave={e => (e.currentTarget.style.gap = "0.5rem")}
                  >
                    {t("servPage.exploreSolutions")} <ArrowRight size={16} />
                  </Link>

                  {/* Decorative background glow */}
                  <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", background: service.color, filter: "blur(80px)", opacity: 0.05, pointerEvents: "none" }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Methodology Section */}
        <section style={{ padding: "8rem 0", background: "linear-gradient(180deg, transparent 0%, rgba(0,212,255,0.03) 50%, transparent 100%)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "5rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>{t("servPage.procBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1.5rem" }}>
                {t("servPage.procTitle")} <span className="gradient-text">{t("servPage.procGradient")}</span>
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto" }}>
                {t("servPage.procSubtitle")}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "3rem" }}>
              {blueprintSteps.map((item) => (
                <div key={item.step} style={{ position: "relative" }}>
                  <div style={{ 
                    fontSize: "4rem", 
                    fontWeight: 900, 
                    fontFamily: "Syne, sans-serif", 
                    color: "rgba(0,212,255,0.08)",
                    lineHeight: 1,
                    marginBottom: "-1.5rem",
                    marginLeft: "-0.5rem"
                  }}>{item.step}</div>
                  <h3 style={{ color: "white", fontSize: "1.5rem", marginBottom: "1rem", position: "relative" }}>{item.title}</h3>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>{item.desc}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {item.details.map(d => (
                      <li key={d} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-neutral-300)", fontSize: "0.875rem" }}>
                        <Zap size={14} color="var(--color-accent-500)" /> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Global Infrastructure Section */}
        <section style={{ padding: "8rem 0", background: "rgba(255,255,255,0.02)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }} className="services-info-grid">
              <div>
                <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>{t("servPage.reachBadge")}</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1.5rem" }}>
                  {t("servPage.reachTitle")} <br /><span className="gradient-text">{t("servPage.reachGradient")}</span>
                </h2>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
                  {t("servPage.reachSubtitle")}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {reachItems.map(item => (
                    <div key={item.title} style={{ display: "flex", gap: "1rem" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon size={20} color="var(--color-accent-500)" />
                      </div>
                      <div>
                        <div style={{ color: "white", fontWeight: 600, fontSize: "1rem" }}>{item.title}</div>
                        <div style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ position: "relative" }}>
                <div className="glass-card" style={{ padding: "3rem", borderRadius: "32px", border: "1px solid rgba(0,212,255,0.15)", background: "rgba(6,11,24,0.6)" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "var(--color-accent-500)", fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>99.99%</div>
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>{t("servPage.uptimeGuarantee")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "var(--color-success)", fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>15min</div>
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>{t("servPage.avgResponseTime")}</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "white", fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>24/7/365</div>
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>{t("servPage.activeMonitoring")}</div>
                    </div>
                  </div>
                </div>
                {/* Background pulse effect */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", zIndex: -1 }} />
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section style={{ padding: "6rem 0", background: "rgba(0,212,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="container">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4rem", opacity: 0.6, filter: "grayscale(100%)" }}>
              {["Microsoft 365", "AWS", "Google Cloud", "Fortinet", "Cisco", "SentinelOne", "Datto"].map(vendor => (
                <div key={vendor} style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, fontFamily: "Syne, sans-serif", letterSpacing: "-0.02em" }}>{vendor}</div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ padding: "8rem 0", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1.5rem" }}>{t("servPage.ctaTitle")}</h2>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto 3rem", fontSize: "1.1rem" }}>
              {t("servPage.ctaSubtitle")}
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap", alignItems: "center" }}>
              <Link href="/contact" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1rem" }}>
                {t("servPage.ctaButton")}
              </Link>
            </div>
          </div>
        </section>

        <style>{`
          @media (max-width: 900px) {
            .services-info-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
