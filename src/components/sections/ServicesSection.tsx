"use client";

import Link from "next/link";
import {
  Shield, Cloud, Network, Bot, Cpu, Terminal, ArrowRight,
  Server, Lock, Activity, CheckCircle2, type LucideIcon
} from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

interface ServiceCapability {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  features: string[];
  sla: string;
  href: string;
  accent: string;
}

const CAPABILITIES: ServiceCapability[] = [
  {
    icon: Bot,
    badge: "AI SYSTEMS & WORKFLOWS",
    title: "Autonomous Agent Fleets & Process Automation",
    description: "Production-grade multi-agent architectures, dynamic generative UI sandboxes, automated lead qualification, and fine-tuned enterprise knowledge systems.",
    features: ["Agentic workflow orchestration", "BANT autonomous lead qualification", "Vector RAG & private knowledge bases", "Generative UI portal widgets"],
    sla: "Custom model fine-tuning & sub-second inference",
    href: "/services",
    accent: "var(--color-accent-400)",
  },
  {
    icon: Shield,
    badge: "ZERO-TRUST CYBERSECURITY",
    title: "SOC Operations & Threat Isolation",
    description: "24/7 continuous threat hunting, endpoint detection & response (EDR), automated breach containment, and identity governance.",
    features: ["Automated threat containment in < 60s", "Zero-Trust network access (ZTNA)", "Security awareness simulations", "Continuous vulnerability scanning"],
    sla: "< 15 minute emergency incident escalation",
    href: "/services/cybersecurity",
    accent: "#ef4444",
  },
  {
    icon: Cloud,
    badge: "ENTERPRISE CLOUD ARCHITECTURE",
    title: "Multi-Cloud & Kubernetes Infrastructure",
    description: "Architecting resilient, scalable hybrid cloud foundations on AWS, Azure, and Google Cloud with Terraform IaC and automated FinOps cost governance.",
    features: ["Infrastructure as Code (Terraform)", "Multi-region Kubernetes clusters", "Disaster recovery & hot-standby", "Cloud FinOps cost reduction (-30% avg)"],
    sla: "99.99% multi-region infrastructure SLA",
    href: "/services/cloud",
    accent: "#6366f1",
  },
  {
    icon: Server,
    badge: "MISSION-CRITICAL MSP",
    title: "24/7 Proactive Managed Telemetry & Desk",
    description: "Full-spectrum endpoint lifecycle management, native PSA asset tracking, automated patch rollouts, and direct access to senior engineers.",
    features: ["Native asset & telemetry tracking", "Automated patch management", "Priority ticket desk with SLA guarantee", "Executive quarterly roadmap sessions"],
    sla: "Guaranteed 1-hour ticket resolution SLA",
    href: "/services/support",
    accent: "#10b981",
  },
  {
    icon: Network,
    badge: "GLOBAL NETWORKING",
    title: "Enterprise SD-WAN & Secure Mesh",
    description: "High-throughput SD-WAN deployment, low-latency cross-border site mesh, and business-grade unified VoIP softphone configurations.",
    features: ["Sub-15ms regional fiber mesh", "Hardware failover & LTE backup", "Enterprise VoIP & softphone deployments", "Zero-downtime cutover migrations"],
    sla: "Sub-15ms latency across US/Canada/Caribbean",
    href: "/services/network",
    accent: "#00d4ff",
  },
  {
    icon: Lock,
    badge: "COMPLIANCE & GOVERNANCE",
    title: "GRC, SOC 2 & Regulatory Readiness",
    description: "Continuous audit readiness and compliance engineering covering SOC 2 Type II, ISO 27001, HIPAA, and PCI-DSS frameworks.",
    features: ["Automated compliance evidence capture", "Third-party vendor risk audits", "Cryptographic key & credential vaults", "Executive board-level compliance reports"],
    sla: "100% audit audit-readiness guarantee",
    href: "/services/compliance",
    accent: "#f59e0b",
  },
];

export default function ServicesSection() {
  const { t } = useLanguage();

  return (
    <section className="section" id="services" style={{ background: "#050811", position: "relative" }}>
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span
              style={{
                fontSize: "0.6875rem",
                fontFamily: "JetBrains Mono, monospace",
                padding: "0.25rem 0.75rem",
                borderRadius: "9999px",
                background: "rgba(0, 212, 255, 0.1)",
                color: "var(--color-accent-400)",
                border: "1px solid rgba(0, 212, 255, 0.2)",
              }}
            >
              CAPABILITY MATRIX
            </span>
          </div>

          <h2
            className="font-display"
            style={{
              fontSize: "clamp(2rem, 4vw, 3rem)",
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.035em",
              marginBottom: "1rem",
            }}
          >
            Mission-Critical <span className="gradient-text">Engineering Capabilities</span>
          </h2>

          <p
            style={{
              color: "var(--color-neutral-400)",
              maxWidth: "600px",
              margin: "0 auto",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
            }}
          >
            We replace generic IT ticketing with high-conviction engineering: autonomous AI workflows, zero-trust cybersecurity, and enterprise cloud architecture.
          </p>
        </div>

        {/* Capability Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(360px, 100%), 1fr))",
            gap: "1.5rem",
          }}
        >
          {CAPABILITIES.map(cap => {
            const Icon = cap.icon;
            return (
              <div
                key={cap.title}
                className="glass-card"
                style={{
                  borderRadius: "16px",
                  padding: "2rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "rgba(9, 13, 22, 0.7)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div>
                  {/* Top Bar with Icon and Badge */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "12px",
                        background: `${cap.accent}15`,
                        border: `1px solid ${cap.accent}30`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon size={22} color={cap.accent} />
                    </div>

                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontFamily: "JetBrains Mono, monospace",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "4px",
                        background: "rgba(255, 255, 255, 0.05)",
                        color: "var(--color-neutral-400)",
                        border: "1px solid rgba(255, 255, 255, 0.08)",
                        letterSpacing: "0.05em",
                      }}
                    >
                      {cap.badge}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3
                    className="font-display"
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "white",
                      lineHeight: 1.3,
                      marginBottom: "0.75rem",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {cap.title}
                  </h3>

                  <p
                    style={{
                      color: "var(--color-neutral-400)",
                      fontSize: "0.875rem",
                      lineHeight: 1.6,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {cap.description}
                  </p>

                  {/* Features List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.5rem" }}>
                    {cap.features.map(f => (
                      <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--color-neutral-300)" }}>
                        <CheckCircle2 size={14} color={cap.accent} style={{ flexShrink: 0 }} />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer SLA readout & link */}
                <div
                  style={{
                    borderTop: "1px solid rgba(255, 255, 255, 0.06)",
                    paddingTop: "1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.75rem",
                  }}
                >
                  <span style={{ fontFamily: "JetBrains Mono", color: "var(--color-neutral-400)" }}>
                    SLA: <strong style={{ color: "white" }}>{cap.sla}</strong>
                  </span>

                  <Link
                    href={cap.href}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "var(--color-accent-400)",
                      textDecoration: "none",
                      fontWeight: 700,
                    }}
                  >
                    Explore <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
