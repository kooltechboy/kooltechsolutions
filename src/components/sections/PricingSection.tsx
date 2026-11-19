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
      name: t("pricing.lite.name"),
      price: 99,
      color: "#94A3B8",
      desc: t("pricing.lite.desc"),
      popular: false,
      features: [
        t("pricing.lite.f1"), t("pricing.lite.f2"), t("pricing.lite.f3"),
        t("pricing.lite.f4"), t("pricing.lite.f5"), t("pricing.lite.f6"),
      ],
    },
    {
      name: t("pricing.bronze.name"),
      price: 199,
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
      price: 499,
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
        t("pricing.gold.f7"), t("pricing.gold.f8"),
      ],
    },
    {
      name: t("pricing.platinum.name"),
      price: 1999,
      color: "#E2E8F0",
      desc: t("pricing.platinum.desc"),
      popular: false,
      features: [
        t("pricing.platinum.f1"), t("pricing.platinum.f2"), t("pricing.platinum.f3"),
        t("pricing.platinum.f4"), t("pricing.platinum.f5"), t("pricing.platinum.f6"),
        t("pricing.platinum.f7"), t("pricing.platinum.f8"), t("pricing.platinum.f9"),
        t("pricing.platinum.f10"),
      ],
    },
  ];

  return (
    <section className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
      <div className="container" style={{ maxWidth: "1500px" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("pricing.badge")}</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            {t("pricing.titleStart")} <span className="gradient-text">{t("pricing.titleGradient")}</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto" }}>
            {t("pricing.subtitle")}
          </p>
        </div>

        <div className="pricing-grid">
          {tiers.map(tier => (
            <div key={tier.name} className={tier.popular ? "pricing-popular-card" : ""} style={{
              position: "relative",
              background: tier.popular ? "rgba(9, 13, 22, 0.9)" : "rgba(9, 13, 22, 0.65)",
              border: tier.popular ? "1px solid rgba(0, 212, 255, 0.45)" : "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "16px", padding: "2rem",
              boxShadow: tier.popular ? "0 12px 40px rgba(0, 212, 255, 0.15)" : "none",
              transform: tier.popular ? "scale(1.02)" : "scale(1)",
              backdropFilter: "blur(12px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}>
              {tier.popular && (
                <div style={{
                  position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                  background: "var(--color-accent-500)",
                  color: "#020408", padding: "0.2rem 0.85rem", borderRadius: "9999px",
                  fontSize: "0.6875rem", fontWeight: 800, letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "0.35rem",
                  boxShadow: "0 4px 16px rgba(0, 212, 255, 0.4)"
                }}>
                  <Star size={11} fill="#020408" /> {t("pricing.popular")}
                </div>
              )}
              <div>
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
                    <span style={{ color: tier.color, fontWeight: 700, fontSize: "0.8125rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>{tier.name}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "1.25rem", color: "var(--color-neutral-400)", fontFamily: "JetBrains Mono" }}>$</span>
                    <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: "2.75rem", fontWeight: 800, color: "white" }}>{tier.price}</span>
                    <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{t("pricing.monthly")}</span>
                  </div>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{tier.desc}</p>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.625rem", marginBottom: "2rem" }}>
                  {tier.features.map(f => (
                    <li key={f} style={{ display: "flex", alignItems: "flex-start", gap: "0.625rem" }}>
                      <Check size={15} color={tier.popular ? "var(--color-accent-400)" : "#10b981"} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setBookingOpen(true)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  width: "100%", padding: "0.75rem",
                  background: tier.popular ? "var(--color-accent-500)" : "rgba(255, 255, 255, 0.04)",
                  border: tier.popular ? "none" : "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px", color: tier.popular ? "#020408" : "white",
                  textDecoration: "none", fontWeight: 700, fontSize: "0.875rem",
                  transition: "all 0.2s ease", cursor: "pointer"
                }}
              >
                {t("pricing.getStarted")} <ArrowRight size={15} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3.5rem" }}>
          <p style={{ color: "var(--color-neutral-400)", marginBottom: "1.25rem", fontSize: "1rem" }}>Need a custom or enterprise plan?</p>
          <a href="mailto:sales@kooltechsolutions.com" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
            Contact Enterprise Sales
          </a>
        </div>

        <p style={{ textAlign: "center", color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "2rem" }}>
          {t("pricing.footnote")}
        </p>
      </div>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
