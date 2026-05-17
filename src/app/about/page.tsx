import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CTASection from "@/components/sections/CTASection";
import { Globe, Target, Heart, Users, Award, Zap, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Kool Tech Solutions — our story, mission, values, and the expert team delivering enterprise IT across the Dominican Republic, USA, Canada & Caribbean.",
};

const team = [
  { name: "Daniel J Williams", title: "CEO & Founder", emoji: "👨‍💼", bio: "15+ years in enterprise IT. Former IT Director at a Fortune 500 company. Built KTS to bring world-class IT to Caribbean businesses." },
];

const values = [
  { icon: Target, title: "Mission", color: "#00D4FF", desc: "To empower Caribbean and global businesses with enterprise-grade IT solutions that were previously only accessible to large corporations." },
  { icon: Globe, title: "Vision", color: "#00E676", desc: "To become the most trusted IT Managed Service Provider in the Caribbean region, known for innovation, reliability, and exceptional client outcomes." },
  { icon: Heart, title: "Values", color: "#FF4444", desc: "Integrity first. Client obsession. Continuous improvement. Accountability in every interaction, every ticket, every deployment." },
];

const milestones = [
  { year: "2014", event: "Founded in Santiago, Dominican Republic" },
  { year: "2016", event: "Expanded to 50+ clients" },
  { year: "2018", event: "Launched Cybersecurity practice" },
  { year: "2020", event: "Opened USA operations" },
  { year: "2022", event: "Achieved 99.9% uptime SLA" },
  { year: "2024", event: "Launched AI Workforce platform" },
  { year: "2026", event: "150+ clients across 4 countries" },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Our Story</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1rem" }}>
              Built for the <span className="gradient-text">Caribbean. Built for the World.</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.8, fontSize: "1.0625rem" }}>
              Kool Tech Solutions was founded with a simple but powerful belief: businesses in the Dominican Republic and the Caribbean deserve the same enterprise-grade IT infrastructure as companies in Silicon Valley.
            </p>
          </div>
        </section>

        {/* Mission / Vision / Values */}
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {values.map(v => (
                <div key={v.title} className="glass-card" style={{ borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
                  <div style={{ width: 60, height: 60, borderRadius: "50%", background: `${v.color}15`, border: `2px solid ${v.color}30`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <v.icon size={26} color={v.color} />
                  </div>
                  <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.25rem", color: "white", marginBottom: "0.75rem" }}>{v.title}</h2>
                  <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.7, fontSize: "0.9rem" }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>The Team</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                Expert Engineers, <span className="gradient-text">Real Humans</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              {team.map(member => (
                <div key={member.name} className="glass-card" style={{ borderRadius: "16px", padding: "1.75rem", textAlign: "center" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(0,212,255,0.1)", border: "2px solid rgba(0,212,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", fontSize: "2rem" }}>
                    {member.emoji}
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", marginBottom: "0.25rem" }}>{member.name}</h3>
                  <div className="badge badge-cyan" style={{ marginBottom: "1rem", fontSize: "0.65rem" }}>{member.title}</div>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Our Journey</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                A Decade of <span className="gradient-text">Growth</span>
              </h2>
            </div>
            <div style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}>
              <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(0,212,255,0.15)", transform: "translateX(-50%)" }} />
              {milestones.map((m, i) => (
                <div key={m.year} style={{
                  display: "flex", gap: "1.5rem", marginBottom: "2rem",
                  flexDirection: i % 2 === 0 ? "row" : "row-reverse", alignItems: "center",
                }}>
                  <div style={{ flex: 1, textAlign: i % 2 === 0 ? "right" : "left" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-accent-500)", fontSize: "0.875rem" }}>{m.year}</div>
                    <div style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.875rem" }}>{m.event}</div>
                  </div>
                  <div style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--color-accent-500)", flexShrink: 0, boxShadow: "0 0 12px rgba(0,212,255,0.5)" }} />
                  <div style={{ flex: 1 }} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
