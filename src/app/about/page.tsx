"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CTASection from "@/components/sections/CTASection";
import { Globe, Target, Heart } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    { icon: Target, title: t("about.missionTitle"), color: "#00D4FF", desc: t("about.missionDesc") },
    { icon: Globe, title: t("about.visionTitle"), color: "#00E676", desc: t("about.visionDesc") },
    { icon: Heart, title: t("about.valuesTitle"), color: "#FF4444", desc: t("about.valuesDesc") },
  ];

  const milestones = [
    { year: "2014", event: t("about.m2014") },
    { year: "2016", event: t("about.m2016") },
    { year: "2018", event: t("about.m2018") },
    { year: "2020", event: t("about.m2020") },
    { year: "2022", event: t("about.m2022") },
    { year: "2024", event: t("about.m2024") },
    { year: "2026", event: t("about.m2026") },
  ];

  const team = [
    { name: "Daniel J Williams", title: "CEO & Founder", emoji: "👨‍💼", bio: t("about.teamBio") },
  ];

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("about.storyBadge")}</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1rem" }}>
              {t("about.titleStart")} <span className="gradient-text">{t("about.titleGradient")}</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto", lineHeight: 1.8, fontSize: "1.0625rem" }}>
              {t("about.subtitle")}
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
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("about.teamBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                {t("about.teamTitle")} <span className="gradient-text">{t("about.teamGradient")}</span>
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
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("about.journeyBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                {t("about.journeyTitle")} <span className="gradient-text">{t("about.journeyGradient")}</span>
              </h2>
            </div>
            <div className="timeline-container" style={{ position: "relative", maxWidth: "640px", margin: "0 auto" }}>
              <div className="timeline-line" style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px", background: "rgba(0,212,255,0.15)", transform: "translateX(-50%)" }} />
              {milestones.map((m, i) => (
                <div key={m.year} className="timeline-item" style={{
                  display: "flex", gap: "1.5rem", marginBottom: "2rem",
                  flexDirection: i % 2 === 0 ? "row" : "row-reverse", alignItems: "center",
                }}>
                  <div className="timeline-content" style={{ flex: 1, textAlign: i % 2 === 0 ? "right" : "left" }}>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "var(--color-accent-500)", fontSize: "0.875rem" }}>{m.year}</div>
                    <div style={{ color: "var(--color-neutral-300, #CBD5E1)", fontSize: "0.875rem" }}>{m.event}</div>
                  </div>
                  <div className="timeline-dot" style={{ width: 12, height: 12, borderRadius: "50%", background: "var(--color-accent-500)", flexShrink: 0, boxShadow: "0 0 12px rgba(0,212,255,0.5)" }} />
                  <div className="timeline-spacer" style={{ flex: 1 }} />
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
