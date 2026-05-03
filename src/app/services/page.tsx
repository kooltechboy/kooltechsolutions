import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import PricingSection from "@/components/sections/PricingSection";
import CTASection from "@/components/sections/CTASection";
import { Shield, Cloud, Network, Monitor, Headphones, Award, Check, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "IT Services & Managed Plans",
  description: "Explore Kool Tech Solutions' full service portfolio — cybersecurity, cloud, networking, monitoring, help desk, and compliance. Bronze, Silver & Gold plans.",
};

const services = [
  { slug: "cybersecurity", icon: Shield, color: "#FF4444", title: "Cybersecurity", desc: "Enterprise-grade threat protection, 24/7 SIEM monitoring with Wazuh, vulnerability management via OpenVAS, firewall administration, and security awareness training.", features: ["Wazuh SIEM & SOC", "OpenVAS Vulnerability Scanning", "OPNsense Firewall Management", "Endpoint Detection & Response", "Security Awareness Training", "Incident Response Planning"] },
  { slug: "cloud", icon: Cloud, color: "#00D4FF", title: "Cloud Services", desc: "Full-lifecycle cloud management from strategy and migration through ongoing optimization of your AWS, Azure, or hybrid infrastructure.", features: ["Cloud Strategy & Architecture", "Migration Planning & Execution", "Cost Optimization", "Hybrid Cloud Design", "Backup & Disaster Recovery", "Cloud Security Posture"] },
  { slug: "network", icon: Network, color: "#4B84C8", title: "Network Management", desc: "Enterprise network design, implementation, and continuous management including SD-WAN, VPN, and high-availability configurations.", features: ["Network Architecture Design", "SD-WAN Implementation", "VPN & Remote Access", "Nginx Proxy Management", "Bandwidth Optimization", "Network Monitoring"] },
  { slug: "monitoring", icon: Monitor, color: "#FFB300", title: "24/7 Monitoring", desc: "Proactive infrastructure monitoring through Uptime Kuma, Tactical RMM, and Grafana dashboards with automated alerting.", features: ["Uptime Kuma Monitoring", "Tactical RMM Agent Deployment", "Grafana Dashboard Visibility", "Real-Time SMS/Email Alerts", "Action1 Endpoint Management", "Prometheus Metrics"] },
  { slug: "support", icon: Headphones, color: "#00E676", title: "Help Desk Support", desc: "Multi-channel technical support powered by AI-assisted ticket routing, remote access tools, and certified engineers.", features: ["AI-Powered Ticket Routing", "Remote Desktop Support", "ITFlow Ticketing System", "Multi-Channel Support", "Priority Escalation", "Knowledge Base Access"] },
  { slug: "compliance", icon: Award, color: "#A855F7", title: "IT Compliance", desc: "Navigate complex regulatory landscapes with structured compliance programs for HIPAA, SOC 2, PCI-DSS, and ISO 27001.", features: ["Compliance Gap Analysis", "Policy & Procedure Creation", "Risk Assessment & Management", "Audit Preparation", "Compliance Reporting", "Ongoing Advisory"] },
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Service Portfolio</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1rem" }}>
              Complete IT <span className="gradient-text">Solutions</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "560px", margin: "0 auto", lineHeight: 1.7, fontSize: "1.0625rem" }}>
              From endpoint security to cloud infrastructure — we manage your entire IT environment so you can focus on growing your business.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
              {services.map(svc => (
                <div key={svc.slug} className="glass-card" style={{ borderRadius: "16px", padding: "2rem" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "14px", background: `${svc.color}15`, border: `1px solid ${svc.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                    <svc.icon size={26} color={svc.color} />
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "0.75rem" }}>{svc.title}</h2>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem" }}>{svc.desc}</p>
                  <ul style={{ listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {svc.features.map(f => (
                      <li key={f} style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Check size={13} color={svc.color} style={{ flexShrink: 0 }} />
                        <span style={{ color: "var(--color-neutral-400)", fontSize: "0.78rem" }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/contact" style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: svc.color, textDecoration: "none", fontSize: "0.875rem", fontWeight: 600 }}>
                    Get This Service <ArrowRight size={14} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <PricingSection />
        <CTASection />
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
