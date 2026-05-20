"use client";
import { useState } from "react";
import { Check, Star, ArrowRight } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function PricingSection() {
  const { t } = useLanguage();
  const [bookingOpen, setBookingOpen] = useState(false);

  const tiers = [
    {
      name: t("pricing.bronze.name"),
      price: 299,
      color: "#CD7F32",
      desc: t("pricing.bronze.desc"),
      popular: false,
      features: [
        t("pricing.bronze.f1"), t("pricing.bronze.f2"), t("pricing.bronze.f3"),
        t("pricing.bronze.f4"), t("pricing.bronze.f5"), t("pricing.bronze.f6"),
      ],
    },
    {
      name: t("pricing.silver.name"),
      price: 599,
      color: "#00D4FF",
      desc: t("pricing.silver.desc"),
      popular: true,
      features: [
        t("pricing.silver.f1"), t("pricing.silver.f2"), t("pricing.silver.f3"),
        t("pricing.silver.f4"), t("pricing.silver.f5"), t("pricing.silver.f6"),
        t("pricing.silver.f7"), t("pricing.silver.f8"),
      ],
    },
    {
      name: t("pricing.gold.name"),
      price: 999,
      color: "#FFB300",
      desc: t("pricing.gold.desc"),
      popular: false,
      features: [
        t("pricing.gold.f1"), t("pricing.gold.f2"), t("pricing.gold.f3"),
        t("pricing.gold.f4"), t("pricing.gold.f5"), t("pricing.gold.f6"),
        t("pricing.gold.f7"), t("pricing.gold.f8"), t("pricing.gold.f9"),
        t("pricing.gold.f10"),
      ],
    },
  ];

  return (
    <section className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("pricing.badge")}</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            {t("pricing.titleStart")} <span className="gradient-text">{t("pricing.titleGradient")}</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto" }}>
            {t("pricing.subtitle")}
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          gap: "1.5rem", alignItems: "start",
        }}>
          {tiers.map(tier => (
            <div key={tier.name} className={tier.popular ? "pricing-popular-card" : ""} style={{
              position: "relative",
              background: tier.popular ? "rgba(0,212,255,0.06)" : "rgba(10,22,40,0.7)",
              border: tier.popular ? "2px solid rgba(0,212,255,0.5)" : "1px solid rgba(75,132,200,0.15)",
              borderRadius: "20px", padding: "2rem",
              boxShadow: tier.popular ? "0 0 40px rgba(0,212,255,0.15)" : "none",
              transform: tier.popular ? "scale(1.03)" : "scale(1)",
            }}>
              {tier.popular && (
                <div style={{
                  position: "absolute", top: -16, left: "50%", transform: "translateX(-50%)",
                  background: "linear-gradient(135deg, #00D4FF, #0099CC)",
                  color: "#0A1628", padding: "0.25rem 1rem", borderRadius: "100px",
                  fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em",
                  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem",
                }}>
                  <Star size={12} fill="#0A1628" /> {t("pricing.popular")}
                </div>
              )}
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: tier.color, boxShadow: `0 0 10px ${tier.color}` }} />
                  <span style={{ color: tier.color, fontWeight: 700, fontSize: "0.875rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{tier.name}</span>
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "1.25rem", color: "var(--color-neutral-400)" }}>$</span>
                  <span style={{ fontFamily: "Syne, sans-serif", fontSize: "3rem", fontWeight: 800, color: "white" }}>{tier.price}</span>
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{t("pricing.monthly")}</span>
                </div>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{tier.desc}</p>
              </div>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2rem" }}>
                {tier.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                    <Check size={16} color={tier.popular ? "var(--color-accent-500)" : "var(--color-success)"} style={{ flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.875rem" }}>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setBookingOpen(true)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  width: "100%", padding: "0.875rem",
                  background: tier.popular ? "linear-gradient(135deg, #00D4FF, #0099CC)" : "transparent",
                  border: tier.popular ? "none" : `1px solid ${tier.color}50`,
                  borderRadius: "10px", color: tier.popular ? "#0A1628" : tier.color,
                  textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                  transition: "all 0.2s ease", cursor: "pointer"
                }}
              >
                {t("pricing.getStarted")} <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "2rem" }}>
          {t("pricing.footnote")}
        </p>
      </div>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
