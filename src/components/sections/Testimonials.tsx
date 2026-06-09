"use client";
import { useState } from "react";
import { Star, MessageSquare, Quote, ArrowLeft, ArrowRight, ShieldCheck, Cpu, Database } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

interface Testimonial {
  id: number;
  quoteKey: string;
  author: string;
  roleKey: string;
  company: string;
  industryKey: string;
  metric: string;
  metricLabelKey: string;
  icon: React.ComponentType<any>;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quoteKey: "testimonialsSection.t1Quote",
    author: "Dr. Sarah Jenkins",
    roleKey: "testimonialsSection.t1Role",
    company: "Apex Health Partners",
    industryKey: "testimonialsSection.t1Industry",
    metric: "100%",
    metricLabelKey: "testimonialsSection.t1MetricLabel",
    icon: ShieldCheck,
  },
  {
    id: 2,
    quoteKey: "testimonialsSection.t2Quote",
    author: "Marcus Vance",
    roleKey: "testimonialsSection.t2Role",
    company: "Beacon Finance Group",
    industryKey: "testimonialsSection.t2Industry",
    metric: "<5 min",
    metricLabelKey: "testimonialsSection.t2MetricLabel",
    icon: Database,
  },
  {
    id: 3,
    quoteKey: "testimonialsSection.t3Quote",
    author: "Elena Rostova",
    roleKey: "testimonialsSection.t3Role",
    company: "Velo E-Commerce",
    industryKey: "testimonialsSection.t3Industry",
    metric: "45%",
    metricLabelKey: "testimonialsSection.t3MetricLabel",
    icon: Cpu,
  },
];

export default function Testimonials() {
  const { t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[activeIndex];
  const Icon = current.icon;

  return (
    <section className="section dot-grid" style={{ position: "relative", background: "var(--color-primary-900)" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,11,24,0.92)", pointerEvents: "none" }} />
      
      <div className="container" style={{ position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>
            <MessageSquare size={12} style={{ marginRight: "0.25rem" }} />
            {t("testimonialsSection.badge")}
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
            {t("testimonialsSection.title")}
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "500px", margin: "0 auto" }}>
            {t("testimonialsSection.subtitle")}
          </p>
        </div>

        {/* Testimonial slider layout */}
        <div
          style={{
            maxWidth: "960px",
            margin: "0 auto",
            position: "relative",
          }}
        >
          {/* Main Card */}
          <div
            className="glass-card"
            style={{
              borderRadius: "20px",
              padding: "3rem 2.5rem",
              background: "rgba(10, 22, 40, 0.6)",
              border: "1px solid rgba(0, 212, 255, 0.12)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2.5rem",
              alignItems: "center",
              position: "relative",
            }}
          >
            {/* Top quote icon decoration */}
            <div
              style={{
                position: "absolute",
                top: "1.5rem",
                left: "2rem",
                opacity: 0.05,
                color: "var(--color-accent-500)",
                pointerEvents: "none",
              }}
            >
              <Quote size={80} />
            </div>

            {/* Testimonial details & quote */}
            <div>
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.25rem" }}>
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="var(--color-warning)" color="var(--color-warning)" />
                ))}
              </div>
              <p
                style={{
                  fontSize: "1.125rem",
                  lineHeight: 1.7,
                  color: "var(--color-neutral-200)",
                  marginBottom: "2rem",
                  fontStyle: "italic",
                }}
              >
                &ldquo;{t(current.quoteKey)}&rdquo;
              </p>
              <div>
                <h4 style={{ color: "white", fontWeight: 700, fontSize: "1rem", marginBottom: "0.25rem" }}>
                  {current.author}
                </h4>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>
                  {t(current.roleKey)} &bull; <span style={{ color: "var(--color-accent-400)" }}>{current.company}</span>
                </div>
              </div>
            </div>

            {/* Metric Display Box */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                padding: "2.5rem 1.5rem",
                borderRadius: "16px",
                background: "rgba(0, 212, 255, 0.03)",
                border: "1px solid rgba(0, 212, 255, 0.1)",
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: "rgba(0, 212, 255, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <Icon size={24} color="var(--color-accent-500)" />
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: "2.75rem",
                  fontWeight: 800,
                  color: "var(--color-accent-500)",
                  lineHeight: 1.1,
                  marginBottom: "0.5rem",
                  textShadow: "0 0 20px rgba(0, 212, 255, 0.2)",
                }}
              >
                {current.metric}
              </div>
              <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>
                {t(current.metricLabelKey)}
              </div>
              <div
                className="badge badge-cyan"
                style={{
                  fontSize: "0.6875rem",
                  padding: "0.15rem 0.5rem",
                  marginTop: "0.5rem",
                }}
              >
                {t(current.industryKey)}
              </div>
            </div>
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "1.5rem",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={prevSlide}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent-500)";
                e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: idx === activeIndex ? "var(--color-accent-500)" : "rgba(255, 255, 255, 0.2)",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </div>

            <button
              onClick={nextSlide}
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.02)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--color-accent-500)";
                e.currentTarget.style.background = "rgba(0, 212, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.02)";
              }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
