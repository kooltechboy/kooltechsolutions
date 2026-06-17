"use client";
import { useState, useEffect } from "react";
import { ShieldAlert, X, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function FloatingCTA() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="floating-cta-wrapper"
      style={{
        position: "fixed",
        bottom: "2rem",
        left: "2rem",
        zIndex: 999,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Expanded Quick Form/Links Card */}
      {isExpanded ? (
        <div
          className="glass glow-cyan floating-cta-card"
          style={{
            width: "min(320px, calc(100vw - 2.5rem))",
            borderRadius: "16px",
            padding: "1.5rem",
            marginBottom: "1rem",
            background: "rgba(10, 22, 40, 0.95)",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "1rem",
            }}
          >
            <div>
              <div
                className="badge badge-cyan"
                style={{
                  fontSize: "0.625rem",
                  padding: "0.15rem 0.5rem",
                  marginBottom: "0.35rem",
                }}
              >
                <Sparkles size={10} style={{ marginRight: "0.2rem" }} />
                {t("floating.badge")}
              </div>
              <h4 style={{ color: "white", fontWeight: 800, fontSize: "1rem", margin: 0 }}>
                {t("floating.title")}
              </h4>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-neutral-400)",
                cursor: "pointer",
                padding: "0.25rem",
                minWidth: "32px",
                minHeight: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
            {t("floating.desc")}
          </p>

          <Link
            href="/contact?intent=Free+Vulnerability+Assessment"
            onClick={() => setIsExpanded(false)}
            className="btn-primary"
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "0.625rem",
              fontSize: "0.875rem",
              borderRadius: "8px",
            }}
          >
            {t("floating.cta")}
            <ArrowRight size={14} />
          </Link>
        </div>
      ) : null}

      {/* Main Pulse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-label="Open free assessment"
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, var(--color-accent-500) 0%, #0099cc 100%)",
          border: "none",
          color: "var(--color-primary-950)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 4px 24px rgba(0, 212, 255, 0.4)",
          position: "relative",
          transition: "transform 0.2s ease",
          flexShrink: 0,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-4px",
            borderRadius: "50%",
            border: "2px solid var(--color-accent-500)",
            animation: "pulse 2s infinite",
            opacity: 0,
            pointerEvents: "none",
          }}
        />
        <ShieldAlert size={24} strokeWidth={2.2} />
      </button>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(0.95); opacity: 0.8; }
          70% { transform: scale(1.2); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
