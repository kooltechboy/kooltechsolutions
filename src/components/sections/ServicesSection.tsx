"use client";
import Link from "next/link";
import { Shield, Cloud, Network, Monitor, Headphones, Award, ArrowRight } from "lucide-react";

const services = [
  {
    icon: Shield, title: "Cybersecurity", color: "#FF4444",
    desc: "Zero-trust architecture, 24/7 threat monitoring, vulnerability scanning, and incident response.",
    features: ["Wazuh SIEM", "OpenVAS Scanning", "Firewall Management", "Security Awareness"],
    href: "/services/cybersecurity",
  },
  {
    icon: Cloud, title: "Cloud Services", color: "#00D4FF",
    desc: "Scalable cloud infrastructure design, migration, and ongoing management.",
    features: ["Cloud Migration", "Infrastructure Design", "Cost Optimization", "Hybrid Cloud"],
    href: "/services/cloud",
  },
  {
    icon: Network, title: "Network Management", color: "#4B84C8",
    desc: "Enterprise networking solutions with OPNsense firewall and Nginx Proxy management.",
    features: ["Network Design", "VPN Solutions", "SD-WAN", "Performance Tuning"],
    href: "/services/network",
  },
  {
    icon: Monitor, title: "24/7 Monitoring", color: "#FFB300",
    desc: "Proactive infrastructure monitoring with real-time alerting and automated response.",
    features: ["Uptime Kuma", "Tactical RMM", "Grafana Dashboards", "SMS/Email Alerts"],
    href: "/services/monitoring",
  },
  {
    icon: Headphones, title: "Help Desk", color: "#00E676",
    desc: "Expert technical support with AI-assisted ticket routing and resolution.",
    features: ["Ticket Management", "Remote Support", "AI-Assisted", "Multi-Channel"],
    href: "/services/support",
  },
  {
    icon: Award, title: "IT Compliance", color: "#A855F7",
    desc: "Regulatory compliance frameworks including HIPAA, SOC 2, PCI-DSS, and ISO 27001.",
    features: ["Compliance Audits", "Policy Creation", "Risk Assessment", "Reporting"],
    href: "/services/compliance",
  },
];

export default function ServicesSection() {
  return (
    <section className="section" id="services">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>What We Do</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            Complete IT <span className="gradient-text">Service Portfolio</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7 }}>
            From cybersecurity to cloud infrastructure, we provide end-to-end managed IT solutions tailored to your business needs.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1.5rem",
        }}>
          {services.map(svc => (
            <ServiceCard key={svc.title} {...svc} />
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <Link href="/services" className="btn-ghost">
            View Full Service Catalog <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ icon: Icon, title, color, desc, features, href }: typeof services[0]) {
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
          {title}
        </h3>
        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.25rem" }}>
          {desc}
        </p>
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.375rem" }}>
          {features.map(f => (
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
          Learn More <ArrowRight size={14} />
        </div>
      </div>
    </Link>
  );
}
