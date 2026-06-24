"use client";
import Link from "next/link";
import { Globe } from "lucide-react";

interface LanguageSwitchBannerProps {
  currentLang: "en" | "es";
  alternateUrl: string | null;
}

export default function LanguageSwitchBanner({ currentLang, alternateUrl }: LanguageSwitchBannerProps) {
  if (!alternateUrl) return null;

  const isEnglish = currentLang === "en";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      padding: "0.75rem 1.25rem",
      background: "rgba(0, 212, 255, 0.06)",
      border: "1px solid rgba(0, 212, 255, 0.15)",
      borderRadius: "12px",
      marginBottom: "2rem",
      fontSize: "0.875rem",
    }}>
      <Globe size={18} color="#00D4FF" style={{ flexShrink: 0 }} />
      <span style={{ color: "#94A3B8" }}>
        {isEnglish
          ? "Este artículo está disponible en Español"
          : "This article is available in English"}
      </span>
      <Link
        href={alternateUrl}
        style={{
          color: "#00D4FF",
          fontWeight: 600,
          textDecoration: "none",
          marginLeft: "auto",
          whiteSpace: "nowrap",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
        }}
      >
        {isEnglish ? "Leer en Español →" : "Read in English →"}
      </Link>
    </div>
  );
}
