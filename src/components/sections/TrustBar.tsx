"use client";
import { ShieldCheck, Clock, Globe, Users, TrendingUp, Award } from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

const partners = [
  "Microsoft", "Cisco", "AWS", "Fortinet", "SentinelOne",
  "Acronis", "Veeam", "Dell", "HP", "VMware",
  "Microsoft", "Cisco", "AWS", "Fortinet", "SentinelOne",
  "Acronis", "Veeam", "Dell", "HP", "VMware",
];

const statsKeys = [
  { icon: Users, val: "150+", labelKey: "hero.clients" },
  { icon: Clock, val: "99.9%", labelKey: "hero.uptime" },
  { icon: TrendingUp, val: "<1hr", labelKey: "hero.response" },
  { icon: Award, val: "10+", labelKey: "hero.experience" },
  { icon: Globe, val: "4", labelKey: "trust.countries" },
  { icon: ShieldCheck, val: "24/7", labelKey: "trust.soc" },
];

export default function TrustBar() {
  const { t } = useLanguage();

  return (
    <div style={{ borderTop: "1px solid rgba(0,212,255,0.08)", borderBottom: "1px solid rgba(0,212,255,0.08)", background: "rgba(10,22,40,0.6)", overflow: "hidden" }}>
      {/* Stats */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
          {statsKeys.map(s => (
            <div key={s.labelKey} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <s.icon size={20} color="var(--color-accent-500)" />
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white" }}>{s.val}</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t(s.labelKey)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Partner ticker */}
      <div style={{ borderTop: "1px solid rgba(75,132,200,0.1)", padding: "1.25rem 0", overflow: "hidden", position: "relative" }}>
        <div style={{
          display: "flex", gap: "3rem",
          width: "max-content",
          animation: "ticker 25s linear infinite",
        }}>
          {partners.map((p, i) => (
            <span key={i} style={{ color: "var(--color-neutral-600, #475569)", fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap" }}>
              {p}
            </span>
          ))}
        </div>
      </div>

      {/* Compliance badges */}
      <div style={{ borderTop: "1px solid rgba(0,212,255,0.08)", padding: "1.5rem 1.5rem", background: "rgba(6,11,24,0.4)" }}>
        <div className="container" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "2rem" }}>
          <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
            {t("trust.complianceTitle")}
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {[
              "trust.soc2",
              "trust.hipaa",
              "trust.pci",
              "trust.iso"
            ].map((key, idx) => (
              <div key={idx} className="badge badge-cyan" style={{ fontSize: "0.7rem", gap: "0.35rem", padding: "0.35rem 0.85rem" }}>
                <ShieldCheck size={12} color="var(--color-accent-500)" />
                {t(key)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
