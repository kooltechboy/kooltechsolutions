"use client";
import { useLanguage } from "./LanguageProvider";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div style={{ 
      display: "flex", gap: "0.25rem", padding: "0.25rem", 
      background: "rgba(255,255,255,0.05)", borderRadius: "8px", 
      border: "1px solid rgba(0,212,255,0.15)"
    }}>
      <button 
        onClick={() => setLanguage("en")} 
        style={{
          background: language === "en" ? "var(--color-accent-500)" : "transparent",
          color: language === "en" ? "white" : "var(--color-neutral-400)",
          border: "none", padding: "0.25rem 0.5rem", borderRadius: "6px", 
          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
        }}
      >
        EN
      </button>
      <button 
        onClick={() => setLanguage("es")} 
        style={{
          background: language === "es" ? "var(--color-accent-500)" : "transparent",
          color: language === "es" ? "white" : "var(--color-neutral-400)",
          border: "none", padding: "0.25rem 0.5rem", borderRadius: "6px", 
          fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
        }}
      >
        ES
      </button>
    </div>
  );
}
