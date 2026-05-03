"use client";
import { ShieldCheck, Clock, Globe, Users, TrendingUp, Award } from "lucide-react";

const partners = [
  "Microsoft", "Cisco", "AWS", "Fortinet", "SentinelOne",
  "Acronis", "Veeam", "Dell", "HP", "VMware",
  "Microsoft", "Cisco", "AWS", "Fortinet", "SentinelOne",
  "Acronis", "Veeam", "Dell", "HP", "VMware",
];

const stats = [
  { icon: Users, val: "150+", label: "Clients Served" },
  { icon: Clock, val: "99.9%", label: "Uptime SLA" },
  { icon: TrendingUp, val: "<1hr", label: "Avg Response" },
  { icon: Award, val: "10+", label: "Years Experience" },
  { icon: Globe, val: "4", label: "Countries Served" },
  { icon: ShieldCheck, val: "24/7", label: "SOC Monitoring" },
];

export default function TrustBar() {
  return (
    <div style={{ borderTop: "1px solid rgba(0,212,255,0.08)", borderBottom: "1px solid rgba(0,212,255,0.08)", background: "rgba(10,22,40,0.6)", overflow: "hidden" }}>
      {/* Stats */}
      <div className="container" style={{ padding: "2.5rem 1.5rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "1.5rem", textAlign: "center" }}>
          {stats.map(s => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
              <s.icon size={20} color="var(--color-accent-500)" />
              <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white" }}>{s.val}</div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
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
    </div>
  );
}
