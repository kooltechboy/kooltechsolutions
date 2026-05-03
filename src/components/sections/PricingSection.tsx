"use client";
import Link from "next/link";
import { Check, Star, Zap, ArrowRight } from "lucide-react";

const tiers = [
  {
    name: "Bronze",
    price: 299,
    color: "#CD7F32",
    desc: "Essential IT management for small teams",
    popular: false,
    features: [
      "Up to 10 endpoints", "Business hours support (8-6 PM)", "Basic antivirus & patching",
      "Monthly health reports", "Remote helpdesk", "Email support",
    ],
  },
  {
    name: "Silver",
    price: 599,
    color: "#00D4FF",
    desc: "Full-service IT management for growing businesses",
    popular: true,
    features: [
      "Up to 30 endpoints", "24/7 monitoring & alerts", "Advanced EDR security",
      "Weekly health reports", "Priority helpdesk", "Phone & email support",
      "Cloud backup management", "Quarterly IT reviews",
    ],
  },
  {
    name: "Gold",
    price: 999,
    color: "#FFB300",
    desc: "Enterprise-grade IT with AI-powered automation",
    popular: false,
    features: [
      "Unlimited endpoints", "24/7 SOC monitoring", "Full cybersecurity stack",
      "Daily reports & dashboards", "Dedicated account manager", "On-site support",
      "Compliance management", "AI helpdesk assistant",
      "Custom SLA agreements", "Strategic IT roadmap",
    ],
  },
];

export default function PricingSection() {
  return (
    <section className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Transparent Pricing</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            Service Plans <span className="gradient-text">Built for You</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto" }}>
            Flat-rate monthly pricing. No hidden fees. Scale up or down as your business evolves.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem", alignItems: "start",
        }}>
          {tiers.map(tier => (
            <div key={tier.name} style={{
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
                  <Star size={12} fill="#0A1628" /> MOST POPULAR
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
                  <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>/month</span>
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
              <Link
                href="/contact"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                  width: "100%", padding: "0.875rem",
                  background: tier.popular ? "linear-gradient(135deg, #00D4FF, #0099CC)" : "transparent",
                  border: tier.popular ? "none" : `1px solid ${tier.color}50`,
                  borderRadius: "10px", color: tier.popular ? "#0A1628" : tier.color,
                  textDecoration: "none", fontWeight: 700, fontSize: "0.9rem",
                  transition: "all 0.2s ease",
                }}
              >
                Get Started <ArrowRight size={16} />
              </Link>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "2rem" }}>
          * All plans billed monthly. Annual plans available with 15% discount. Custom enterprise pricing available.
        </p>
      </div>
    </section>
  );
}
