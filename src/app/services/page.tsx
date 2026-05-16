"use client";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Shield, Cloud, Network, Monitor, Headphones, Award, ArrowRight, Zap, CheckCircle2, Server, Lock, Globe } from "lucide-react";
import Link from "next/link";
import AIChatWidget from "@/components/ai/AIChatWidget";

const serviceCategories = [
  {
    id: "security",
    title: "Cybersecurity & Defense",
    icon: Shield,
    color: "#00D4FF",
    description: "Enterprise-grade threat protection, zero-trust architecture, and 24/7 security operations to keep your assets secure.",
    features: ["Threat Intelligence", "Incident Response", "Identity Management", "Endpoint Protection"],
    href: "/services/cybersecurity"
  },
  {
    id: "cloud",
    title: "Cloud & Infrastructure",
    icon: Cloud,
    color: "#A855F7",
    description: "Seamless cloud migration, hybrid infrastructure management, and high-performance server solutions scaled for growth.",
    features: ["Azure/AWS Management", "Hybrid Cloud", "Data Migration", "Disaster Recovery"],
    href: "/services/cloud"
  },
  {
    id: "network",
    title: "Network Intelligence",
    icon: Network,
    color: "#00E676",
    description: "Resilient, high-speed networking designed for zero-downtime and maximum data velocity across your organization.",
    features: ["SD-WAN", "Wireless Optimization", "Network Security", "Fiber Infrastructure"],
    href: "/services/network"
  },
  {
    id: "monitoring",
    title: "Proactive Monitoring",
    icon: Monitor,
    color: "#FFB300",
    description: "Always-on surveillance of your entire IT stack. We solve problems before they impact your business operations.",
    features: ["24/7 RMM", "System Health Audits", "Performance Tuning", "Automated Patching"],
    href: "/services/monitoring"
  },
  {
    id: "support",
    title: "Technical Help Desk",
    icon: Headphones,
    color: "#FF4444",
    description: "Elite technical support with rapid response times. Our engineers are an extension of your internal team.",
    features: ["VIP Remote Support", "On-site Dispatch", "VIP Escalation", "Asset Management"],
    href: "/services/support"
  },
  {
    id: "compliance",
    title: "Compliance & Auditing",
    icon: Award,
    color: "#33DDFF",
    description: "Meeting the highest regulatory standards. We ensure your infrastructure is audit-ready and legally compliant.",
    features: ["HIPAA/PCI Compliance", "Security Audits", "Data Privacy", "Risk Assessment"],
    href: "/services/compliance"
  }
];

export default function ServicesPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: "100vh" }}>
        {/* Hero Section */}
        <section style={{ padding: "8rem 0 4rem", textAlign: "center" }}>
          <div className="container">
            <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>Our Capabilities</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 6vw, 4rem)", color: "white", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              Enterprise <span className="gradient-text">Solutions</span> & <br />Managed IT Excellence
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "700px", margin: "0 auto 3rem", fontSize: "1.1rem", lineHeight: 1.7 }}>
              Kool Tech Solutions provides the technical backbone for modern enterprises. From zero-trust security to high-velocity cloud infrastructure, we deliver the elite engineering your business demands.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section style={{ padding: "2rem 0 8rem" }}>
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2rem" }}>
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
                    Explore Solutions <ArrowRight size={16} />
                  </Link>

                  {/* Decorative background glow */}
                  <div style={{ position: "absolute", top: "-20%", right: "-10%", width: "150px", height: "150px", background: service.color, filter: "blur(80px)", opacity: 0.05, pointerEvents: "none" }} />
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
                <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>Global Reach</div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1.5rem" }}>
                  Managed Infrastructure <br /><span className="gradient-text">Without Borders</span>
                </h2>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "1.1rem", lineHeight: 1.7, marginBottom: "2rem" }}>
                  We support organizations across the Dominican Republic, USA, Canada, and the Caribbean. Our centralized command centers provide real-time intelligence and rapid response dispatch regardless of your geographic footprint.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  {[
                    { icon: Globe, title: "Multinational Support", desc: "Coordinated IT strategy across regional offices." },
                    { icon: Server, title: "Edge Computing", desc: "Low-latency infrastructure located where you need it." },
                    { icon: Lock, title: "Unified Security", desc: "Consistent defense policies across global endpoints." }
                  ].map(item => (
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
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>Uptime Guarantee</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "var(--color-success)", fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>15min</div>
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>Average Response Time</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "white", fontSize: "3rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>24/7/365</div>
                      <div style={{ color: "var(--color-neutral-400)", textTransform: "uppercase", fontSize: "0.75rem", letterSpacing: "0.1em", fontWeight: 700 }}>Active Monitoring</div>
                    </div>
                  </div>
                </div>
                {/* Background pulse effect */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "120%", height: "120%", background: "radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)", zIndex: -1 }} />
              </div>
            </div>
          </div>
        </section>

        <section style={{ padding: "8rem 0", textAlign: "center" }}>
          <div className="container">
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", color: "white", marginBottom: "1.5rem" }}>Ready to Optimize Your Infrastructure?</h2>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto 3rem", fontSize: "1.1rem" }}>
              Our senior engineers are ready to build the technology foundation your business deserves.
            </p>
            <Link href="/contact" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1rem" }}>
              Book a Strategy Session
            </Link>
          </div>
        </section>

        <style>{`
          @media (max-width: 900px) {
            .services-info-grid { grid-template-columns: 1fr !important; gap: 3rem !important; }
          }
        `}</style>
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
