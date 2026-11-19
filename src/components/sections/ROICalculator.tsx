"use client";

import { useState } from "react";
import { ArrowRight, Calculator, Check, Shield, Cloud, Bot, Cpu, TrendingDown, DollarSign, Sparkles } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/components/shared/LanguageProvider";

interface ServicePillar {
  id: string;
  name: string;
  description: string;
  ratePerUser: number;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}

const PILLARS: ServicePillar[] = [
  { id: "ai_workflows", name: "Autonomous AI Workflows", description: "Multi-agent process automation & lead triage", ratePerUser: 45, icon: Bot },
  { id: "cybersecurity", name: "Zero-Trust Cybersecurity", description: "24/7 SOC detection & rapid containment", ratePerUser: 25, icon: Shield },
  { id: "cloud_infra", name: "Cloud & Kubernetes", description: "Multi-cloud architecture & Terraform IaC", ratePerUser: 30, icon: Cloud },
  { id: "managed_msp", name: "Mission-Critical MSP", description: "Proactive telemetry & 15-min SLA desk", ratePerUser: 35, icon: Cpu },
];

export default function ROICalculator() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<number>(35);
  const [region, setRegion] = useState<"NA" | "Carib">("Carib");
  const [selectedPillars, setSelectedPillars] = useState<string[]>(["ai_workflows", "cybersecurity", "managed_msp"]);
  const [bookingOpen, setBookingOpen] = useState(false);

  const togglePillar = (id: string) => {
    setSelectedPillars(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const baseRate = selectedPillars.reduce((acc, id) => {
    const pillar = PILLARS.find(p => p.id === id);
    return acc + (pillar ? pillar.ratePerUser : 0);
  }, 0);

  // Volume scale discount
  let volumeDiscount = 1.0;
  if (users > 100) volumeDiscount = 0.78;
  else if (users > 50) volumeDiscount = 0.84;
  else if (users > 20) volumeDiscount = 0.90;

  const monthlyKts = Math.round(users * baseRate * volumeDiscount);
  const annualKts = monthlyKts * 12;

  // In-house equivalent cost calculation
  const engineerMultiplier = region === "NA" ? 140 : 55;
  const inHouseMonthly = Math.max(
    region === "NA" ? 8500 : 3200,
    Math.round(users * engineerMultiplier)
  );
  const inHouseAnnual = inHouseMonthly * 12;

  const monthlySavings = Math.max(0, inHouseMonthly - monthlyKts);
  const annualSavings = Math.max(0, inHouseAnnual - annualKts);
  const hoursSavedPerMonth = Math.round(users * (selectedPillars.includes("ai_workflows") ? 4.8 : 2.2));

  return (
    <section id="roi-calculator" className="section" style={{ position: "relative", background: "#020408" }}>
      {/* Background radial glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
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
              FINANCIAL TELEMETRY
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
            Dynamic ROI & <span className="gradient-text">Engineering Scope Estimator</span>
          </h2>

          <p
            style={{
              color: "var(--color-neutral-400)",
              maxWidth: "640px",
              margin: "0 auto",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
            }}
          >
            Model your actual enterprise operational savings when replacing fragmented third-party vendors and manual IT overhead with KoolTech autonomous engineering.
          </p>
        </div>

        {/* Interactive Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.15fr 0.85fr",
            gap: "2rem",
            alignItems: "start",
          }}
          className="roi-interactive-grid"
        >
          {/* Controls Panel */}
          <div
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "2rem",
              background: "rgba(9, 13, 22, 0.75)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            {/* Region Toggle */}
            <div style={{ marginBottom: "2rem" }}>
              <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                Target Geographic Market
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setRegion("Carib")}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: region === "Carib" ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: region === "Carib" ? "1px solid var(--color-accent-400)" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Caribbean & LATAM
                </button>
                <button
                  type="button"
                  onClick={() => setRegion("NA")}
                  style={{
                    padding: "0.75rem",
                    borderRadius: "10px",
                    background: region === "NA" ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.03)",
                    border: region === "NA" ? "1px solid var(--color-accent-400)" : "1px solid rgba(255, 255, 255, 0.08)",
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  USA & Canada
                </button>
              </div>
            </div>

            {/* Slider for Users / Endpoints */}
            <div style={{ marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                <label style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Managed Users & Endpoints
                </label>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--color-accent-400)",
                  }}
                >
                  {users} Seats
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={users}
                onChange={e => setUsers(Number(e.target.value))}
                style={{
                  width: "100%",
                  accentColor: "var(--color-accent-500)",
                  cursor: "pointer",
                }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.5rem", fontFamily: "JetBrains Mono" }}>
                <span>5 Seats (Boutique)</span>
                <span>100 Seats (Growth)</span>
                <span>250+ (Enterprise)</span>
              </div>
            </div>

            {/* Service Pillars Checkbox Grid */}
            <div>
              <label style={{ display: "block", color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>
                Integrated Architecture Modules
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "0.75rem" }}>
                {PILLARS.map(pillar => {
                  const Icon = pillar.icon;
                  const isSelected = selectedPillars.includes(pillar.id);
                  return (
                    <div
                      key={pillar.id}
                      onClick={() => togglePillar(pillar.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.875rem 1rem",
                        borderRadius: "10px",
                        background: isSelected ? "rgba(0, 212, 255, 0.08)" : "rgba(255, 255, 255, 0.02)",
                        border: isSelected ? "1px solid rgba(0, 212, 255, 0.35)" : "1px solid rgba(255, 255, 255, 0.06)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: isSelected ? "rgba(0, 212, 255, 0.15)" : "rgba(255, 255, 255, 0.05)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={18} color={isSelected ? "var(--color-accent-400)" : "var(--color-neutral-400)"} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{pillar.name}</div>
                        <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{pillar.description}</div>
                      </div>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "6px",
                          border: isSelected ? "1px solid var(--color-accent-400)" : "1px solid rgba(255, 255, 255, 0.2)",
                          background: isSelected ? "var(--color-accent-500)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && <Check size={14} color="#020408" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Results Summary Card */}
          <div
            className="glass-card"
            style={{
              borderRadius: "16px",
              padding: "2rem",
              background: "linear-gradient(180deg, rgba(9, 13, 22, 0.9) 0%, rgba(5, 8, 17, 0.95) 100%)",
              border: "1px solid rgba(0, 212, 255, 0.25)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.5), 0 0 32px rgba(0, 212, 255, 0.1)",
              position: "sticky",
              top: "100px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ fontSize: "0.75rem", fontFamily: "JetBrains Mono", color: "var(--color-neutral-400)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Estimated Cost Model
              </span>
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontFamily: "JetBrains Mono",
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#10b981",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "4px",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                }}
              >
                ● 100% SLA Guarantee
              </span>
            </div>

            {/* Monthly Investment */}
            <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
              <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.25rem" }}>
                KoolTech Managed Retainer
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span
                  style={{
                    fontFamily: "JetBrains Mono, monospace",
                    fontSize: "2.5rem",
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.03em",
                  }}
                >
                  ${monthlyKts.toLocaleString()}
                </span>
                <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>/ month</span>
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginTop: "0.25rem" }}>
                Annual commitment: ${annualKts.toLocaleString()} / year
              </div>
            </div>

            {/* Savings & Efficiency Readout */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>In-House Equivalent:</span>
                <span style={{ fontFamily: "JetBrains Mono", color: "var(--color-neutral-300)", fontSize: "0.875rem" }}>
                  ${inHouseMonthly.toLocaleString()} / mo
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#10b981", fontSize: "0.875rem", fontWeight: 700 }}>Projected Annual Savings:</span>
                <span style={{ fontFamily: "JetBrains Mono", color: "#10b981", fontSize: "1.125rem", fontWeight: 800 }}>
                  +${annualSavings.toLocaleString()}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "var(--color-accent-400)", fontSize: "0.8125rem" }}>Team Hours Saved / Month:</span>
                <span style={{ fontFamily: "JetBrains Mono", color: "var(--color-accent-400)", fontSize: "0.875rem", fontWeight: 700 }}>
                  ~{hoursSavedPerMonth} hours
                </span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={() => setBookingOpen(true)}
              className="btn-primary"
              style={{
                width: "100%",
                padding: "0.875rem 1.25rem",
                borderRadius: "10px",
                fontSize: "0.9375rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              Lock in Architecture Proposal <ArrowRight size={16} />
            </button>

            <div style={{ textAlign: "center", marginTop: "1rem" }}>
              <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                No credit card required · Free 30-min discovery session
              </span>
            </div>
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
