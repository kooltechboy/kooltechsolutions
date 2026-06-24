"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CTASection from "@/components/sections/CTASection";
import { Globe, Target, Heart, Link2, Mail, ExternalLink, Users, MapPin, Clock, Shield, Quote, Building2, Award, Briefcase } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    { icon: Target, title: t("about.missionTitle"), color: "#00D4FF", desc: t("about.missionDesc") },
    { icon: Globe, title: t("about.visionTitle"), color: "#00E676", desc: t("about.visionDesc") },
    { icon: Heart, title: t("about.valuesTitle"), color: "#FF4444", desc: t("about.valuesDesc") },
  ];

  const stats = [
    { icon: Users, value: t("about.overviewStat1Value"), label: t("about.overviewStat1Label"), color: "#00D4FF" },
    { icon: MapPin, value: t("about.overviewStat2Value"), label: t("about.overviewStat2Label"), color: "#00E676" },
    { icon: Shield, value: t("about.overviewStat3Value"), label: t("about.overviewStat3Label"), color: "#A78BFA" },
    { icon: Clock, value: t("about.overviewStat4Value"), label: t("about.overviewStat4Label"), color: "#FFB300" },
  ];

  const founderHighlights = [
    { icon: Briefcase, text: "15+ Years Enterprise IT" },
    { icon: Building2, text: "Former Fortune 500 IT Director" },
    { icon: Award, text: "Zero-Trust Security Pioneer" },
    { icon: Globe, text: "DR · USA · Canada · Caribbean" },
  ];

  /* ── Daniel's social links ── */
  const LINKEDIN_URL = "https://www.linkedin.com/in/daniel-joseph-williams";
  const TWITTER_URL  = "https://x.com/djwilliams2401";
  const EMAIL_ADDRESS = "danieljwilliams@kooltechsolutions.com";

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>

        {/* ═══════════════ HERO ═══════════════ */}
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

        {/* ═══════════════ COMPANY OVERVIEW ═══════════════ */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("about.overviewBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                {t("about.overviewTitle")} <span className="gradient-text">{t("about.overviewGradient")}</span>
              </h2>
            </div>

            {/* Overview text block */}
            <div className="glass-card" style={{
              borderRadius: "20px",
              padding: "clamp(1.75rem, 4vw, 3rem)",
              marginBottom: "2rem",
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Decorative glow */}
              <div style={{
                position: "absolute", top: "-80px", right: "-80px",
                width: "220px", height: "220px", borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
                pointerEvents: "none",
              }} />
              <div style={{ position: "relative", maxWidth: "860px", margin: "0 auto" }}>
                <p style={{ color: "var(--color-neutral-300)", lineHeight: 1.85, fontSize: "1.0625rem", marginBottom: "1.25rem" }}>
                  {t("about.overviewP1")}
                </p>
                <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.85, fontSize: "1rem", marginBottom: "1.25rem" }}>
                  {t("about.overviewP2")}
                </p>
                <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.85, fontSize: "1rem" }}>
                  {t("about.overviewP3")}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1.25rem" }}>
              {stats.map(s => (
                <div key={s.label} className="glass-card" style={{
                  borderRadius: "16px", padding: "1.5rem", textAlign: "center",
                  borderTop: `3px solid ${s.color}30`,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    background: `${s.color}12`, border: `2px solid ${s.color}25`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 0.75rem",
                  }}>
                    <s.icon size={22} color={s.color} />
                  </div>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.25rem" }}>
                    {s.value}
                  </div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ FOUNDER / CEO SPOTLIGHT ═══════════════ */}
        <section className="section" style={{ background: "rgba(10,22,40,0.5)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("about.founderBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                {t("about.founderTitle")} <span className="gradient-text">{t("about.founderGradient")}</span>
              </h2>
            </div>

            <div className="glass-card" style={{
              borderRadius: "24px",
              padding: "0",
              overflow: "hidden",
              position: "relative",
            }}>
              {/* Ambient glow behind the card */}
              <div style={{
                position: "absolute", top: "0", left: "0", right: "0", bottom: "0",
                background: "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, rgba(167,139,250,0.04) 100%)",
                pointerEvents: "none",
              }} />

              <div style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr)",
                gap: "0",
                position: "relative",
              }}>

                {/* ─── Content Column ─── */}
                <div style={{ padding: "clamp(2rem, 4vw, 3rem)" }}>
                  {/* Avatar + Name Header */}
                  <div style={{
                    display: "flex", alignItems: "center", gap: "1.25rem",
                    marginBottom: "1.75rem", flexWrap: "wrap",
                  }}>
                    {/* Large monogram avatar */}
                    <div style={{
                      width: 88, height: 88, borderRadius: "50%",
                      background: "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(167,139,250,0.2) 100%)",
                      border: "3px solid rgba(0,212,255,0.35)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "2rem", fontWeight: 800, color: "#00D4FF",
                      fontFamily: "Syne, sans-serif",
                      flexShrink: 0,
                      boxShadow: "0 0 30px rgba(0,212,255,0.15)",
                    }}>
                      DW
                    </div>
                    <div>
                      <h3 style={{
                        fontFamily: "Syne, sans-serif", fontWeight: 800,
                        fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)", color: "white",
                        marginBottom: "0.35rem",
                      }}>
                        {t("about.founderName")}
                      </h3>
                      <div className="badge badge-cyan" style={{ fontSize: "0.7rem" }}>
                        {t("about.founderRole")}
                      </div>
                    </div>
                  </div>

                  {/* Highlight pills */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: "0.5rem",
                    marginBottom: "1.75rem",
                  }}>
                    {founderHighlights.map(h => (
                      <div key={h.text} style={{
                        display: "inline-flex", alignItems: "center", gap: "0.4rem",
                        padding: "0.35rem 0.75rem", borderRadius: "9999px",
                        background: "rgba(0,212,255,0.06)",
                        border: "1px solid rgba(0,212,255,0.15)",
                        color: "var(--color-neutral-300)", fontSize: "0.75rem",
                        fontWeight: 500,
                      }}>
                        <h.icon size={13} color="#00D4FF" />
                        {h.text}
                      </div>
                    ))}
                  </div>

                  {/* Bio paragraphs */}
                  <div style={{ marginBottom: "1.75rem" }}>
                    <p style={{ color: "var(--color-neutral-300)", lineHeight: 1.85, fontSize: "0.9375rem", marginBottom: "1rem" }}>
                      {t("about.founderBio1")}
                    </p>
                    <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.85, fontSize: "0.9375rem", marginBottom: "1rem" }}>
                      {t("about.founderBio2")}
                    </p>
                    <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.85, fontSize: "0.9375rem" }}>
                      {t("about.founderBio3")}
                    </p>
                  </div>

                  {/* Inspirational Quote */}
                  <div style={{
                    padding: "1.25rem 1.5rem",
                    borderLeft: "3px solid rgba(0,212,255,0.4)",
                    background: "rgba(0,212,255,0.04)",
                    borderRadius: "0 12px 12px 0",
                    marginBottom: "2rem",
                    position: "relative",
                  }}>
                    <Quote size={20} color="rgba(0,212,255,0.3)" style={{ position: "absolute", top: "0.75rem", right: "1rem" }} />
                    <p style={{
                      color: "var(--color-neutral-200)", fontStyle: "italic",
                      lineHeight: 1.75, fontSize: "0.9375rem",
                      fontFamily: "Syne, sans-serif", fontWeight: 600,
                    }}>
                      {t("about.founderQuote")}
                    </p>
                  </div>

                  {/* Social Links */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.625rem 1.25rem", borderRadius: "10px",
                        background: "linear-gradient(135deg, #0077B5 0%, #005A8E 100%)",
                        color: "white", fontWeight: 600, fontSize: "0.85rem",
                        textDecoration: "none", transition: "all 0.3s ease",
                        border: "1px solid rgba(255,255,255,0.1)",
                        boxShadow: "0 4px 15px rgba(0,119,181,0.25)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 6px 20px rgba(0,119,181,0.4)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 4px 15px rgba(0,119,181,0.25)";
                      }}
                    >
                      <Link2 size={17} />
                      {t("about.founderLinkedIn")}
                    </a>

                    <a
                      href={`https://x.com/${TWITTER_URL.split('/').pop()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.625rem 1.25rem", borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--color-neutral-300)", fontWeight: 600, fontSize: "0.85rem",
                        textDecoration: "none", transition: "all 0.3s ease",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.3)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <ExternalLink size={17} />
                      {t("about.founderTwitter")}
                    </a>

                    <a
                      href={`mailto:${EMAIL_ADDRESS}`}
                      style={{
                        display: "inline-flex", alignItems: "center", gap: "0.5rem",
                        padding: "0.625rem 1.25rem", borderRadius: "10px",
                        background: "rgba(255,255,255,0.05)",
                        color: "var(--color-neutral-300)", fontWeight: 600, fontSize: "0.85rem",
                        textDecoration: "none", transition: "all 0.3s ease",
                        border: "1px solid rgba(255,255,255,0.1)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(0,212,255,0.3)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                        (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.1)";
                      }}
                    >
                      <Mail size={17} />
                      {t("about.founderEmail")}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════ MISSION / VISION / VALUES ═══════════════ */}
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

        <CTASection />
      </main>
      <Footer />
    </>
  );
}
