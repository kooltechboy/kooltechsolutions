"use client";
import { useState } from "react";
import { Phone, Calendar } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";

export default function CTASection() {
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
        <div className="badge badge-cyan" style={{ marginBottom: "1.25rem" }}>Start Today</div>
        <h2 style={{
          fontFamily: "Syne, sans-serif", fontWeight: 800,
          fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white",
          lineHeight: 1.15, marginBottom: "1.25rem",
        }}>
          Ready to Transform<br />
          <span className="gradient-text">Your IT Infrastructure?</span>
        </h2>
        <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto 2.5rem", lineHeight: 1.7, fontSize: "1.0625rem" }}>
          Get a free, no-obligation IT assessment from our senior engineers. We&apos;ll identify risks, opportunities, and craft a custom roadmap for your business.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => setBookingOpen(true)} className="btn-primary" style={{ padding: "1rem 2rem", fontSize: "1rem" }}>
            <Calendar size={18} /> Schedule Free Assessment
          </button>
          <a href="tel:+18297201611" className="btn-ghost" style={{ padding: "1rem 2rem", fontSize: "1rem" }}>
            <Phone size={18} /> Call Us Now
          </a>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", marginTop: "3rem", flexWrap: "wrap" }}>
          {["No contracts required", "Response in under 1 hour", "Serving DR · USA · Canada · Caribbean"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-500)" }} />
              {t}
            </div>
          ))}
        </div>
      </div>
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
