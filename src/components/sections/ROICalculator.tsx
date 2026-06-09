"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Calculator, Check, Shield, Cloud, Monitor, Cpu, TrendingDown } from "lucide-react";
import Link from "next/link";

interface ServiceOption {
  id: string;
  name: string;
  pricePerUser: number;
  icon: React.ComponentType<any>;
}

const serviceOptions: ServiceOption[] = [
  { id: "cybersecurity", name: "Zero Trust Cybersecurity", pricePerUser: 40, icon: Shield },
  { id: "cloud", name: "Cloud & Network Management", pricePerUser: 35, icon: Cloud },
  { id: "helpdesk", name: "24/7 Managed IT & Helpdesk", pricePerUser: 50, icon: Monitor },
  { id: "ai", name: "AI Workforce Integrations", pricePerUser: 60, icon: Cpu },
];

export default function ROICalculator() {
  const [users, setUsers] = useState<number>(25);
  const [selectedServices, setSelectedServices] = useState<string[]>(["cybersecurity", "helpdesk"]);
  const [calculatedCosts, setCalculatedCosts] = useState({
    ktsCost: 0,
    inHouseCost: 0,
    savings: 0,
  });

  const toggleService = (id: string) => {
    setSelectedServices((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    // Calculate Kooltech solutions cost
    const baseRate = selectedServices.reduce((acc, serviceId) => {
      const option = serviceOptions.find((o) => o.id === serviceId);
      return acc + (option ? option.pricePerUser : 0);
    }, 0);

    // Apply volume discount based on employee count
    let discount = 1.0;
    if (users > 100) discount = 0.80; // 20% discount
    else if (users > 50) discount = 0.85; // 15% discount
    else if (users > 20) discount = 0.90; // 10% discount

    const ktsCost = Math.round(users * baseRate * discount);

    // In-house IT cost approximation:
    // A single IT admin salary (with benefits/overhead) is roughly $7,000/mo.
    // For every 50 users, companies usually require an additional IT resource or tool licensing.
    // We can estimate this at $130 per user, with a minimum floor of $6,500/month (representing 1 admin).
    const inHouseCost = Math.max(6500, users * 140);

    const savings = Math.max(0, inHouseCost - ktsCost);

    setCalculatedCosts({
      ktsCost,
      inHouseCost,
      savings,
    });
  }, [users, selectedServices]);

  const getContactUrl = () => {
    const servicesParam = selectedServices
      .map((s) => serviceOptions.find((o) => o.id === s)?.name)
      .filter(Boolean)
      .join(", ");
    return `/contact?intent=Get+a+Custom+IT+Quote&message=Estimated+ROI+Calculator+Quote:+User+Count+is+${users}.+Services+selected:+${encodeURIComponent(
      servicesParam
    )}.`;
  };

  return (
    <section className="section" style={{ position: "relative", background: "var(--color-primary-950)" }}>
      {/* Visual background accents */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          left: "5%",
          width: "300px",
          height: "300px",
          background: "rgba(0, 212, 255, 0.05)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          right: "5%",
          width: "300px",
          height: "300px",
          background: "rgba(30, 77, 140, 0.1)",
          borderRadius: "50%",
          filter: "blur(80px)",
          pointerEvents: "none",
        }}
      />

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>
            <Calculator size={12} style={{ marginRight: "0.25rem" }} />
            ROI & Cost Calculator
          </div>
          <h2
            className="font-display"
            style={{
              fontWeight: 800,
              fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              color: "white",
              marginBottom: "1rem",
            }}
          >
            Calculate Your <span className="gradient-text">IT Savings</span>
          </h2>
          <p
            style={{
              color: "var(--color-neutral-400)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Compare the cost of your custom outsourced Kooltech plan against hiring and training a full-time, in-house IT team.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))",
            gap: "2.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Controls Panel */}
          <div
            className="glass-card"
            style={{
              borderRadius: "18px",
              padding: "2rem",
              background: "rgba(10, 22, 40, 0.5)",
              border: "1px solid rgba(0, 212, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "2rem",
            }}
          >
            {/* Step 1: User Count */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  className="font-display"
                  style={{ color: "white", fontSize: "1.125rem", fontWeight: 700 }}
                >
                  1. Users / Devices
                </h3>
                <span
                  className="font-mono"
                  style={{
                    color: "var(--color-accent-500)",
                    fontWeight: 700,
                    fontSize: "1.25rem",
                    textShadow: "0 0 10px rgba(0, 212, 255, 0.2)",
                  }}
                >
                  {users} Employees
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="250"
                step="5"
                value={users}
                onChange={(e) => setUsers(Number(e.target.value))}
                style={{
                  width: "100%",
                  height: "6px",
                  borderRadius: "3px",
                  background: "rgba(255, 255, 255, 0.1)",
                  outline: "none",
                  cursor: "pointer",
                  accentColor: "var(--color-accent-500)",
                }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "var(--color-neutral-500)",
                  fontSize: "0.75rem",
                  marginTop: "0.5rem",
                }}
              >
                <span>5 Users</span>
                <span>125 Users</span>
                <span>250+ Users</span>
              </div>
            </div>

            {/* Step 2: Select Services */}
            <div>
              <h3
                className="font-display"
                style={{ color: "white", fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}
              >
                2. Select Required Modules
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {serviceOptions.map((opt) => {
                  const isSelected = selectedServices.includes(opt.id);
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => toggleService(opt.id)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "1rem",
                        borderRadius: "12px",
                        background: isSelected
                          ? "rgba(0, 212, 255, 0.04)"
                          : "rgba(255, 255, 255, 0.01)",
                        border: isSelected
                          ? "1px solid rgba(0, 212, 255, 0.3)"
                          : "1px solid rgba(255, 255, 255, 0.05)",
                        cursor: "pointer",
                        textAlign: "left",
                        width: "100%",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "8px",
                            background: isSelected
                              ? "rgba(0, 212, 255, 0.1)"
                              : "rgba(255, 255, 255, 0.03)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: isSelected
                              ? "1px solid rgba(0, 212, 255, 0.2)"
                              : "1px solid rgba(255, 255, 255, 0.05)",
                          }}
                        >
                          <Icon
                            size={18}
                            color={isSelected ? "var(--color-accent-500)" : "var(--color-neutral-400)"}
                          />
                        </div>
                        <div>
                          <div
                            style={{
                              color: isSelected ? "white" : "var(--color-neutral-300)",
                              fontWeight: 600,
                              fontSize: "0.875rem",
                            }}
                          >
                            {opt.name}
                          </div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                            ${opt.pricePerUser}/user/mo standard rate
                          </div>
                        </div>
                      </div>
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: isSelected
                            ? "1px solid var(--color-accent-500)"
                            : "1px solid rgba(255, 255, 255, 0.2)",
                          background: isSelected ? "var(--color-accent-500)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected && <Check size={12} color="#060B18" strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ROI Results Display */}
          <div
            className="glass-card glow-cyan-sm"
            style={{
              borderRadius: "18px",
              padding: "2rem",
              background: "rgba(10, 22, 40, 0.8)",
              border: "1px solid rgba(0, 212, 255, 0.2)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "2rem",
            }}
          >
            <div>
              <h3
                className="font-display"
                style={{
                  color: "white",
                  fontSize: "1.25rem",
                  fontWeight: 800,
                  marginBottom: "1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  paddingBottom: "0.75rem",
                }}
              >
                Estimated Savings Summary
              </h3>

              {/* Savings callout */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(0, 230, 118, 0.08) 0%, rgba(0, 212, 255, 0.02) 100%)",
                  border: "1px solid rgba(0, 230, 118, 0.2)",
                  borderRadius: "12px",
                  padding: "1.5rem",
                  marginBottom: "2rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "rgba(0, 230, 118, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TrendingDown size={24} color="var(--color-success)" />
                </div>
                <div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 600 }}>
                    ESTIMATED MONTHLY SAVINGS
                  </div>
                  <div
                    className="font-mono"
                    style={{
                      color: "var(--color-success)",
                      fontSize: "2rem",
                      fontWeight: 800,
                      textShadow: "0 0 15px rgba(0, 230, 118, 0.2)",
                    }}
                  >
                    ${calculatedCosts.savings.toLocaleString()}/mo
                  </div>
                </div>
              </div>

              {/* Comparison list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                    In-House IT Dept Cost:
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--color-danger)", fontWeight: 700, fontSize: "1.125rem" }}
                  >
                    ${calculatedCosts.inHouseCost.toLocaleString()}/mo
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                    Kooltech Managed Plan:
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "white", fontWeight: 700, fontSize: "1.125rem" }}
                  >
                    ${calculatedCosts.ktsCost.toLocaleString()}/mo
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                    Annual Savings Advantage:
                  </span>
                  <span
                    className="font-mono"
                    style={{ color: "var(--color-success)", fontWeight: 800, fontSize: "1.125rem" }}
                  >
                    ${(calculatedCosts.savings * 12).toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>

            <div>
              <Link
                href={getContactUrl()}
                className="btn-primary"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "1rem",
                  fontSize: "1rem",
                  borderRadius: "10px",
                }}
              >
                Claim This Offer & Get Free Assessment
                <ArrowRight size={16} />
              </Link>
              <div
                style={{
                  textAlign: "center",
                  color: "var(--color-neutral-500)",
                  fontSize: "0.75rem",
                  marginTop: "0.75rem",
                }}
              >
                Calculations based on average US IT staff overhead and volume discount brackets.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
