"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, Activity, Terminal, CheckCircle2, Cpu, Globe } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function HeroSection() {
  const { t } = useLanguage();
  const [bookingOpen, setBookingOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    const count = Math.min(45, Math.floor(width / 25));
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.5 + 1,
      });
    }

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, width, height);

      nodes.forEach(n => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 212, 255, 0.4)";
        ctx.fill();
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        background: "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 212, 255, 0.12), transparent 70%), #020408",
      }}
    >
      {/* Background Interactive Mesh Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.8,
        }}
      />

      {/* Subtle Hairline Grid Pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          pointerEvents: "none",
        }}
      />

      <div
        className="container hero-padding-top"
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: "9rem",
          paddingBottom: "6rem",
          width: "100%",
        }}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "3.5rem", alignItems: "center" }} className="hero-grid-layout">
          {/* Hero Content Left */}
          <div style={{ maxWidth: "820px" }}>
            {/* Live Status Pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.75rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.35rem 0.85rem",
                  borderRadius: "9999px",
                  background: "rgba(9, 13, 22, 0.8)",
                  border: "1px solid rgba(0, 212, 255, 0.25)",
                  boxShadow: "0 0 16px rgba(0, 212, 255, 0.1)",
                  fontSize: "0.75rem",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "var(--color-neutral-300)",
                }}
              >
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
                AUTONOMOUS SYSTEMS ARCHITECTURE · TIER-1 OPS
              </span>
            </div>

            {/* High-Conviction Headline */}
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)",
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: "-0.04em",
                color: "white",
                marginBottom: "1.5rem",
              }}
            >
              Engineering <span className="gradient-text">Autonomous AI</span> & Mission-Critical Infrastructure
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1.05rem, 1.8vw, 1.25rem)",
                color: "var(--color-neutral-400)",
                lineHeight: 1.6,
                marginBottom: "2.5rem",
                maxWidth: "620px",
              }}
            >
              KoolTech Solutions deploys enterprise multi-agent workflows, zero-trust cloud architectures, and 24/7 proactive telemetry for ambitious enterprises across North America and the Caribbean.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", marginBottom: "3.5rem" }}>
              <button
                onClick={() => setBookingOpen(true)}
                className="btn-primary"
                style={{
                  padding: "0.875rem 2rem",
                  fontSize: "0.9375rem",
                  borderRadius: "10px",
                }}
              >
                Schedule Technical Consultation <ArrowRight size={16} />
              </button>

              <Link
                href="#roi-calculator"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.875rem 1.75rem",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  color: "white",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "var(--color-accent-400)";
                  e.currentTarget.style.background = "rgba(0, 212, 255, 0.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
                  e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                }}
              >
                Estimate Scope & ROI
              </Link>
            </div>

            {/* Live Telemetry Benchmark HUD */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "1.25rem",
                padding: "1.25rem 1.5rem",
                borderRadius: "14px",
                background: "rgba(9, 13, 22, 0.65)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(12px)",
              }}
            >
              {[
                { val: "99.99%", label: "Uptime SLA", sub: "Enterprise Guarantee" },
                { val: "< 15 min", label: "Incident Triage", sub: "Direct Engineer Response" },
                { val: "Sub-15ms", label: "Edge Latency", sub: "Regional Fiber Mesh" },
                { val: "100%", label: "Zero-Trust", sub: "SOC 2 & ISO 27001 Ready" },
              ].map(stat => (
                <div key={stat.label}>
                  <div
                    style={{
                      fontFamily: "JetBrains Mono, monospace",
                      fontWeight: 700,
                      fontSize: "1.375rem",
                      color: "white",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.val}
                  </div>
                  <div
                    style={{
                      color: "var(--color-accent-400)",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      marginTop: "0.15rem",
                    }}
                  >
                    {stat.label}
                  </div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem", marginTop: "0.1rem" }}>
                    {stat.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </section>
  );
}
