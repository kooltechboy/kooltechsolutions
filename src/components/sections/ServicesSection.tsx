"use client";
import Link from "next/link";
import { Shield, Cloud, Network, Monitor, Headphones, Award, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

const servicesList = [
  {
    icon: Shield, titleKey: "services.cybersecurity", color: "#FF4444",
    descKey: "services.cybersecurityDesc",
    features: ["Wazuh SIEM", "OpenVAS Scanning", "Firewall Management", "Security Awareness"],
    href: "/services/cybersecurity",
  },
  {
    icon: Cloud, titleKey: "services.cloud", color: "#00D4FF",
    descKey: "services.cloudDesc",
    features: ["Cloud Migration", "Infrastructure Design", "Cost Optimization", "Hybrid Cloud"],
    href: "/services/cloud",
  },
  {
    icon: Network, titleKey: "services.network", color: "#4B84C8",
    descKey: "services.networkDesc",
    features: ["Network Design", "VPN Solutions", "SD-WAN", "Performance Tuning"],
    href: "/services/network",
  },
  {
    icon: Monitor, titleKey: "services.monitoring", color: "#FFB300",
    descKey: "services.monitoringDesc",
    features: ["Uptime Kuma", "Tactical RMM", "Grafana Dashboards", "SMS/Email Alerts"],
    href: "/services/monitoring",
  },
  {
    icon: Headphones, titleKey: "services.support", color: "#00E676",
    descKey: "services.supportDesc",
    features: ["Ticket Management", "Remote Support", "AI-Assisted", "Multi-Channel"],
    href: "/services/support",
  },
  {
    icon: Award, titleKey: "services.compliance", color: "#A855F7",
    descKey: "services.complianceDesc",
    features: ["Compliance Audits", "Policy Creation", "Risk Assessment", "Reporting"],
    href: "/services/compliance",
  },
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="section" id="services">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("services.badge")}</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            {t("services.titleStart")} <span className="gradient-text">{t("services.titleGradient")}</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            {t("services.subtitle")}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(320px, 100%), 1fr))",
          gap: "1.5rem",
        }}>
          {servicesList.map(svc => (
            <ServiceCard key={svc.titleKey} icon={svc.icon} titleKey={svc.titleKey} color={svc.color} descKey={svc.descKey} features={svc.features} href={svc.href} t={t} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/services" className="btn-ghost">
            {t("services.readMore")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, titleKey, color, descKey, features, href, t }: any) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div className="glass-card" style={{ borderRadius: "16px", padding: "1.75rem", height: "100%", cursor: "pointer" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "14px",
          background: `${color}15`,
          border: `1px solid ${color}30`,
          display: "flex", alignItems: "center", justifyContent: "center",
          marginBottom: "1.25rem",
        }}>
          <Icon size={24} color={color} />
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "0.625rem" }}>
          {t(titleKey)}
        </h3>
        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          {t(descKey)}
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {features.map((f: string) => (
            <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
              <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{f}</span>
            </li>
          ))}
        </ul>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.35rem",
          color: color, fontSize: "0.8125rem", fontWeight: 600,
          marginTop: "1.5rem",
        }}>
          {t("services.learnMore")} <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
