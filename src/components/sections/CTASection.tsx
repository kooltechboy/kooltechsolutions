"use client";
import { useState } from "react";
import { Phone, Calendar } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function CTASection() {
  const { t } = useLanguage();
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <section className="section" style={{ position: "relative", overflow: "hidden" }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(0,212,255,0.06) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "600px", height: "400px",
        background: "radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="container" style={{ position: "relative", textAlign: "center" }}>
        <div className="badge badge-cyan" style={{ marginBottom: "1.25rem" }}>{t("cta.badge")}</div>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white",
          lineHeight: 1.15, marginBottom: "1.25rem",
        }}>
          {t("cta.titleStart")}<br />
          <span className="gradient-text">{t("cta.titleGradient")}</span>
        </h2>
        <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.7, fontSize: "1.0625rem" }}>
          {t("cta.subtitle")}
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setBookingOpen(true)} className="btn-primary" style={{ padding: "1rem 2rem", fontSize: "1rem" }}>
            <Calendar size={18} /> {t("cta.schedule")}
          </button>
          <a href="tel:+18297201611" className="btn-ghost" style={{ padding: "1rem 2rem", fontSize: "1rem" }}>
            <Phone size={18} /> {t("cta.callUs")}
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", marginTop: "3rem", flexWrap: "wrap" }}>
          {[t("cta.noContracts"), t("cta.response"), t("cta.reach")].map(text => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-500)" }} />
              {text}
            </div>
          ))}
        </div>
      </div>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
