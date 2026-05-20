"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Shield, Cloud, Network, Monitor, Headphones, Award, CheckCircle2, Zap, Lock, Globe, Server } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import BookingModal from "@/components/shared/BookingModal";

interface FeatureDetail {
  title: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>;
}

interface ServiceDetail {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: React.CSSProperties }>;
  description: string;
  features: FeatureDetail[];
  details: string;
}

const serviceData: Record<string, ServiceDetail> = {
  "cybersecurity": {
    title: "Enterprise Cybersecurity",
    subtitle: "Advanced Threat Intelligence & SOC as a Service",
    icon: Shield,
    description: "Protect your digital assets with our military-grade security stack. From 24/7 SOC monitoring to proactive threat hunting, we ensure your business remains resilient against evolving cyber threats.",
    features: [
      { title: "SOC as a Service", desc: "24/7 Security Operations Center with real-time incident response.", icon: Lock },
      { title: "Managed EDR", desc: "Next-gen endpoint detection and response to block ransomware.", icon: Shield },
      { title: "Vulnerability Management", desc: "Continuous scanning and automated patching of security gaps.", icon: Zap },
      { title: "Penetration Testing", desc: "Ethical hacking to identify and harden network weaknesses.", icon: Globe }
    ],
    details: "Our cybersecurity solutions are built on a 'Zero Trust' architecture. We don't just react to threats; we anticipate them. With integrated SIEM and AI-driven analysis, we provide the visibility you need to sleep soundly."
  },
  "cloud": {
    title: "Cloud Infrastructure",
    subtitle: "Scalable SaaS & Public Cloud Management",
    icon: Cloud,
    description: "Modernize your workforce with seamless cloud integration. We manage your entire SaaS ecosystem, from Microsoft 365 and Google Workspace to complex Azure/AWS cloud environments.",
    features: [
      { title: "M365 & Google Workspace", desc: "Full licensing, migration, and ongoing security management.", icon: Cloud },
      { title: "Cloud Backup & DR", desc: "Immutable backups to ensure your data is always recoverable.", icon: Server },
      { title: "Infrastructure as Code", desc: "Automated cloud provisioning for maximum efficiency.", icon: Zap },
      { title: "SaaS Security Audit", desc: "Continuous monitoring of cloud tenants for unauthorized access.", icon: Lock }
    ],
    details: "Transitioning to the cloud shouldn't be complex. Our team handles the heavy lifting, ensuring your migration is zero-downtime and your ongoing costs are optimized for performance."
  },
  "compliance": {
    title: "Compliance & Auditing",
    subtitle: "Regulatory Alignment & Risk Management",
    icon: Award,
    description: "Navigate the complex landscape of regulatory compliance with confidence. We provide the tools and expertise to meet HIPAA, PCI-DSS, SOC2, and local data privacy laws.",
    features: [
      { title: "Compliance as a Service", desc: "Continuous evidence collection and framework monitoring.", icon: Award },
      { title: "Risk Assessments", desc: "Comprehensive gap analysis to prepare for formal audits.", icon: Shield },
      { title: "Ley 172-13 (DR)", desc: "Local Dominican Republic data protection law alignment.", icon: Globe },
      { title: "Policy Development", desc: "Custom security policy drafting and employee training.", icon: Lock }
    ],
    details: "Compliance is not a one-time event; it's a continuous process. Our CaaS platform automates the tedious parts of compliance, allowing your team to focus on growth."
  },
  "network": {
    title: "Network Management",
    subtitle: "Enterprise Connectivity & NOC Services",
    icon: Network,
    description: "Build a foundation for growth with a resilient, high-speed network infrastructure. We design, deploy, and manage enterprise-grade networking solutions with 24/7 monitoring.",
    features: [
      { title: "NOC as a Service", desc: "Proactive network monitoring and automated incident remediation.", icon: Zap },
      { title: "SD-WAN Implementation", desc: "Optimize traffic flow and reduce latency across multiple sites.", icon: Network },
      { title: "Managed Firewalls", desc: "Zero Trust perimeter defense with granular access controls.", icon: Lock },
      { title: "VPN & Remote Access", desc: "Secure encrypted tunnels for your distributed workforce.", icon: Shield }
    ],
    details: "Your network is the nervous system of your business. Our NOC team ensures it remains healthy, fast, and secure, utilizing advanced SD-WAN and NGFW technologies to keep you connected."
  },
  "support": {
    title: "Help Desk Support",
    subtitle: "SLA-Backed Technical Excellence",
    icon: Headphones,
    description: "Experience IT support that feels like an extension of your own team. Our 24/7 Help Desk provides rapid resolution to end-user issues with white-glove service.",
    features: [
      { title: "Help Desk as a Service", desc: "Unlimited 24/7 support across phone, chat, and email.", icon: Headphones },
      { title: "Onboarding Automation", desc: "Zero-touch deployment for new employee workstations.", icon: Zap },
      { title: "Remote Remediation", desc: "Secure remote access tools to fix issues in seconds.", icon: Monitor },
      { title: "Asset Management", desc: "Full lifecycle tracking of all hardware and software.", icon: Shield }
    ],
    details: "We don't just close tickets; we solve business problems. Our support engineers are trained in both technical excellence and customer service, ensuring your team stays productive."
  }
};

export default function ServiceDetailPage() {
  const params = useParams();
  const [bookingOpen, setBookingOpen] = useState(false);
  const slug = params.slug as string;
  const data = serviceData[slug] || serviceData["cybersecurity"]; // Fallback for demo

  const Icon = data.icon;

  return (
    <div style={{ background: "var(--color-primary-950)", minHeight: "100vh" }}>
      <Navbar />
      
      {/* Hero Section */}
      <section style={{ 
        padding: "10rem 0 6rem", 
        background: "radial-gradient(circle at top right, rgba(0, 212, 255, 0.05), transparent 40%)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="container">
          <div style={{ maxWidth: "800px" }}>
            <div className="badge badge-primary" style={{ marginBottom: "1.5rem" }}>
              Our Solutions
            </div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2.5rem, 5vw, 4rem)", lineHeight: 1.1, marginBottom: "1.5rem" }}>
              {data.title} <span className="gradient-text">{data.subtitle}</span>
            </h1>
            <p style={{ fontSize: "1.25rem", color: "var(--color-neutral-400)", lineHeight: 1.6, marginBottom: "2.5rem" }}>
              {data.description}
            </p>
            <div style={{ display: "flex", gap: "1rem" }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setBookingOpen(true);
                }}
                className="btn-primary" 
                style={{ padding: "1rem 2rem", fontSize: "1rem" }}
              >
                Get Started
              </button>
              <button 
                type="button"
                className="btn-secondary" 
                style={{ padding: "1rem 2rem", fontSize: "1rem" }}
                onClick={() => window.print()} // Mock for now, replace with PDF download logic if needed
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ padding: "6rem 0" }}>
        <div className="container">
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
            gap: "2rem" 
          }}>
            {data.features.map((feature, idx) => {
              const FeatIcon = feature.icon;
              return (
                <div key={idx} className="glass-card" style={{ padding: "2.5rem", borderRadius: "24px" }}>
                  <div style={{ 
                    width: "56px", height: "56px", borderRadius: "14px", 
                    background: "rgba(0, 212, 255, 0.1)", 
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "var(--color-accent-500)",
                    marginBottom: "1.5rem"
                  }}>
                    <FeatIcon size={28} />
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", marginBottom: "1rem" }}>
                    {feature.title}
                  </h3>
                  <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.6 }}>
                    {feature.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Deep Dive Section */}
      <section style={{ padding: "6rem 0", background: "rgba(255,255,255,0.02)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem", alignItems: "center" }}>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2.5rem", marginBottom: "2rem" }}>
                The <span className="gradient-text">Approach</span>
              </h2>
              <p style={{ fontSize: "1.125rem", color: "var(--color-neutral-300)", lineHeight: 1.8, marginBottom: "2rem" }}>
                {data.details}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  "99.99% Uptime SLA Guaranteed",
                  "24/7/365 Incident Response Team",
                  "Monthly Executive Reporting",
                  "Dedicated Account Technologist"
                ].map((item, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "white", fontWeight: 500 }}>
                    <CheckCircle2 size={18} color="var(--color-success)" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ position: "relative" }}>
              <div style={{ 
                aspectRatio: "1/1", 
                borderRadius: "32px", 
                background: "linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(30,77,140,0.1) 100%)",
                border: "1px solid rgba(0,212,255,0.2)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Icon size={120} strokeWidth={1} color="var(--color-accent-500)" style={{ opacity: 0.5 }} />
                {/* Visual Accent */}
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "150%", height: "150%", background: "radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: "8rem 0" }}>
        <div className="container">
          <div className="glass-card" style={{ 
            padding: "4rem", 
            borderRadius: "40px", 
            textAlign: "center",
            background: "linear-gradient(135deg, rgba(10,22,40,0.8) 0%, rgba(6,11,24,0.9) 100%)"
          }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "3rem", marginBottom: "1.5rem" }}>
              Ready to Secure Your <span className="gradient-text">Future?</span>
            </h2>
            <p style={{ fontSize: "1.25rem", color: "var(--color-neutral-400)", maxWidth: "700px", margin: "0 auto 3rem" }}>
              Join hundreds of enterprise clients who trust Kool Tech Solutions for their mission-critical infrastructure.
            </p>
            <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setBookingOpen(true);
                }}
                className="btn-primary" 
                style={{ padding: "1.25rem 3rem", fontSize: "1.125rem" }}
              >
                Schedule a Consultation
              </button>
              <Link href="/contact" className="btn-secondary" style={{ padding: "1.25rem 3rem", fontSize: "1.125rem", display: "inline-flex", alignItems: "center", textDecoration: "none" }}>
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>


      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Footer />
    </div>
  );
}
