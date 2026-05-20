"use client";
import { Zap, Lock, HeadphonesIcon, BarChart3, Globe, Cpu } from "lucide-react";

const reasons = [
  { icon: Zap, title: "AI-Powered Operations", color: "#00D4FF", desc: "Six specialized AI agents handle customer service, sales, support, and security awareness 24/7 — autonomously." },
  { icon: Lock, title: "Zero-Trust Security", color: "#FF4444", desc: "We implement layered, zero-trust security architectures using enterprise-grade tools across your entire environment." },
  { icon: HeadphonesIcon, title: "Real Humans Behind AI", color: "#00E676", desc: "AI handles the routine. When complexity demands it, our certified engineers step in — in under one hour." },
  { icon: BarChart3, title: "Full Transparency", color: "#FFB300", desc: "Live dashboards, monthly reports, and real-time alerting keep you informed about your IT environment at all times." },
  { icon: Globe, title: "Caribbean & Global Reach", color: "#4B84C8", desc: "Serving businesses in DR, USA, Canada, and the Caribbean with local knowledge and international standards." },
  { icon: Cpu, title: "15+ Tool Integrations", color: "#A855F7", desc: "From Tactical RMM to Wazuh to Grafana — we integrate best-of-breed MSP tools into a unified platform." },
];

export default function WhyUsSection() {
  return (
    <section className="section dot-grid" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,11,24,0.85)", pointerEvents: "none" }} />
      <div className="container" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Our Edge</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            Why <span className="gradient-text">Kool Tech Solutions</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            We combine enterprise-grade technology with personalized service to deliver IT outcomes that directly impact your bottom line.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "1.25rem" }}>
          {reasons.map(r => (
            <div key={r.title} className="glass-card" style={{ borderRadius: "14px", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                background: `${r.color}12`, border: `1px solid ${r.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <r.icon size={20} color={r.color} />
              </div>
              <div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", marginBottom: "0.375rem" }}>
                  {r.title}
                </h3>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
