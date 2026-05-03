"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Zap } from "lucide-react";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const nodes: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
    for (let i = 0; i < 70; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 1,
      });
    }

    let animId: number;
    function draw() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,212,255,0.6)";
        ctx.fill();
      });
      nodes.forEach((a, i) => {
        nodes.slice(i + 1).forEach(b => {
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - d / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        });
      });
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <section style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center",
      overflow: "hidden",
    }} className="mesh-gradient">
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} />
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(0,212,255,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "8rem", paddingBottom: "6rem" }}>
        <div style={{ maxWidth: "800px" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1.5rem" }}>
            <Zap size={12} /> Enterprise IT · MSP · AI-Powered
          </div>

          <h1 style={{
            fontFamily: "Syne, sans-serif", fontWeight: 800,
            fontSize: "clamp(2.5rem, 6vw, 5rem)",
            lineHeight: 1.1, marginBottom: "1.5rem",
            color: "white",
          }}>
            Enterprise IT.{" "}
            <span className="gradient-text">Managed</span>{" "}
            <br />Perfectly.
          </h1>

          <p style={{
            fontSize: "clamp(1rem, 2vw, 1.25rem)",
            color: "var(--color-neutral-400)", lineHeight: 1.7,
            marginBottom: "2.5rem", maxWidth: "560px",
          }}>
            AI-powered managed IT services for businesses across the Dominican Republic, USA, Canada & Caribbean. 24/7 cybersecurity, cloud, and expert support.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <Link href="/contact" className="btn-primary">
              Get Free IT Assessment <ArrowRight size={16} />
            </Link>
            <Link href="/services" className="btn-ghost">
              Explore Services
            </Link>
          </div>

          <div style={{
            display: "flex", gap: "2rem", marginTop: "3rem",
            flexWrap: "wrap",
          }}>
            {[
              { val: "99.9%", label: "Uptime SLA" },
              { val: "< 1hr", label: "Avg Response" },
              { val: "150+", label: "Clients Served" },
              { val: "10+", label: "Years Experience" },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{
                  fontFamily: "Syne, sans-serif", fontWeight: 800,
                  fontSize: "1.75rem", color: "var(--color-accent-500)",
                  textShadow: "0 0 20px rgba(0,212,255,0.4)",
                }}>{stat.val}</div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating card */}
      <div style={{
        position: "absolute", right: "8%", top: "50%",
        transform: "translateY(-50%)",
        display: "none",
      }} className="hero-card-float">
        <div className="glass-card" style={{ borderRadius: "16px", padding: "1.5rem", width: "240px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,230,118,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={18} color="var(--color-success)" />
            </div>
            <div>
              <div style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>Security Status</div>
              <div style={{ color: "var(--color-success)", fontSize: "0.7rem" }}>All systems secure</div>
            </div>
          </div>
          {["Firewall Active", "Threats Blocked: 847", "Last Scan: 2min ago"].map(t => (
            <div key={t} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0" }}>
              <span className="status-dot status-online" />
              <span style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{t}</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(min-width:1100px){.hero-card-float{display:block!important}}`}</style>
    </section>
  );
}
