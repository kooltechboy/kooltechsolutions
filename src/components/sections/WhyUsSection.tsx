"use client";
import { Zap, Lock, HeadphonesIcon, BarChart3, Globe, Cpu } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

const reasonsList = [
  { icon: Zap, titleKey: "whyus.aiOps", color: "#00D4FF", descKey: "whyus.aiOpsDesc" },
  { icon: Lock, titleKey: "whyus.zeroTrust", color: "#FF4444", descKey: "whyus.zeroTrustDesc" },
  { icon: HeadphonesIcon, titleKey: "whyus.humans", color: "#00E676", descKey: "whyus.humansDesc" },
  { icon: BarChart3, titleKey: "whyus.transparency", color: "#FFB300", descKey: "whyus.transparencyDesc" },
  { icon: Globe, titleKey: "whyus.reach", color: "#4B84C8", descKey: "whyus.reachDesc" },
  { icon: Cpu, titleKey: "whyus.integrations", color: "#A855F7", descKey: "whyus.integrationsDesc" },
];

export default function WhyUsSection() {
  const { t } = useLanguage();

  return (
    <section className="section dot-grid" style={{ position: "relative" }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(6,11,24,0.85)", pointerEvents: "none" }} />
      <div className="container" style={{ position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("whyus.badge")}</div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            {t("whyus.titleStart")} <span className="gradient-text">{t("whyus.titleGradient")}</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
            {t("whyus.subtitle")}
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(300px, 100%), 1fr))", gap: "1.25rem" }}>
          {reasonsList.map(r => (
            <div key={r.titleKey} className="glass-card" style={{ borderRadius: "14px", padding: "1.5rem", display: "flex", gap: "1rem", alignItems: "flex-start" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
                background: `${r.color}12`, border: `1px solid ${r.color}25`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <r.icon size={20} color={r.color} />
              </div>
              <div>
                <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1rem", color: "white", marginBottom: "0.375rem" }}>
                  {t(r.titleKey)}
                </h3>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{t(r.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
