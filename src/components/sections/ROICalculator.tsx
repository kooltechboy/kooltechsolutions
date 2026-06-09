"use client";
import { useState, useEffect } from "react";
import { ArrowRight, Calculator, Check, Shield, Cloud, Monitor, Cpu, TrendingDown } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

interface ServiceOption {
  id: string;
  nameKey: string;
  pricePerUser: number;
  icon: React.ComponentType<any>;
}

const serviceOptions: ServiceOption[] = [
  { id: "cybersecurity", nameKey: "roi.serviceCyber", pricePerUser: 25, icon: Shield },
  { id: "cloud", nameKey: "roi.serviceCloud", pricePerUser: 20, icon: Cloud },
  { id: "helpdesk", nameKey: "roi.serviceHelpdesk", pricePerUser: 29, icon: Monitor },
  { id: "ai", nameKey: "roi.serviceAI", pricePerUser: 39, icon: Cpu },
];

export default function ROICalculator() {
  const { t } = useLanguage();
  const [users, setUsers] = useState<number>(25);
  const [region, setRegion] = useState<"NA" | "Carib">("Carib");
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
    const baseRate = selectedServices.reduce((acc, serviceId) => {
      const option = serviceOptions.find((o) => o.id === serviceId);
      return acc + (option ? option.pricePerUser : 0);
    }, 0);

    let discount = 1.0;
    if (users > 100) discount = 0.80;
    else if (users > 50) discount = 0.85;
    else if (users > 20) discount = 0.90;

    const ktsCost = Math.round(users * baseRate * discount);
    
    let inHouseCost = 0;
    if (region === "NA") {
      inHouseCost = Math.max(6500, users * 140);
    } else {
      inHouseCost = Math.max(1500, users * 35);
    }
    
    const savings = Math.max(0, inHouseCost - ktsCost);

    setCalculatedCosts({
      ktsCost,
      inHouseCost,
      savings,
    });
  }, [users, selectedServices, region]);

  const getContactUrl = () => {
    const servicesParam = selectedServices
      .map((s) => t(serviceOptions.find((o) => o.id === s)?.nameKey || ""))
      .filter(Boolean)
      .join(", ");
    return `/contact?intent=Get+a+Custom+IT+Quote&message=Estimated+ROI+Calculator+Quote:+User+Count+is+${users}.+Region+is+${region === "NA" ? "North+America" : "Caribbean/LATAM"}.+Services+selected:+${encodeURIComponent(
      servicesParam
    )}.`;
  };

  return (
    <section className="section" style={{ position: "relative", background: "var(--color-primary-950)" }}>
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
            {t("roi.badge")}
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
            {t("roi.title")}
          </h2>
          <p
            style={{
              color: "var(--color-neutral-400)",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            {t("roi.subtitle")}
          </p>
        </div>

        <div
          className="roi-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(450px, 100%), 1fr))",
            gap: "2.5rem",
            alignItems: "stretch",
          }}
        >
          {/* Controls Panel */}
          <div
            className="glass-card roi-card-panel"
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
            {/* Region Selector */}
            <div>
              <label
                style={{
                  display: "block",
                  color: "var(--color-neutral-400)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                }}
              >
                {t("roi.regionLabel")}
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as "NA" | "Carib")}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  background: "rgba(10, 22, 40, 0.8)",
                  border: "1px solid rgba(0, 212, 255, 0.2)",
                  color: "white",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"white\" height=\"24\" viewBox=\"0 0 24 24\" width=\"24\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 10px center",
                  paddingRight: "30px",
                }}
              >
                <option value="Carib" style={{ background: "#0A1628" }}>{t("roi.regionCarib")}</option>
                <option value="NA" style={{ background: "#0A1628" }}>{t("roi.regionNA")}</option>
              </select>
            </div>

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
                  1. {t("roi.usersDevices")}
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
                  {users} {t("roi.employeesText")}
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
                <span>5 {t("roi.employeesText")}</span>
                <span>125 {t("roi.employeesText")}</span>
                <span>250+ {t("roi.employeesText")}</span>
              </div>
            </div>

            {/* Step 2: Select Services */}
            <div>
              <h3
                className="font-display"
                style={{ color: "white", fontSize: "1.125rem", fontWeight: 700, marginBottom: "1.25rem" }}
              >
                2. {t("roi.selectModules")}
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
                            {t(opt.nameKey)}
                          </div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                            ${opt.pricePerUser}/{t("roi.stdRate")}
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
                {t("roi.estSavings")}
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
                    {t("roi.estMonthlySavings")}
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
                    {t("roi.inHouseCost")}
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
                    {t("roi.ktsCost")}
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
                    {t("roi.annualSavings")}
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
                {t("roi.claimOffer")}
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
                {t("roi.footnote")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
