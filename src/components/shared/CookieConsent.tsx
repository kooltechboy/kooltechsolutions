"use client";

import React, { useState, useEffect } from "react";
import { Shield, Settings, X, Check } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const { t } = useLanguage();
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentState>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const savedConsent = localStorage.getItem("kts_cookie_consent");
    if (!savedConsent) {
      setShowBanner(true);
    } else {
      applyConsent(JSON.parse(savedConsent));
    }
  }, []);

  const applyConsent = (consent: ConsentState) => {
    (window as any).ktsConsent = consent;
    window.dispatchEvent(new CustomEvent("ktsConsentChanged", { detail: consent }));
    if (consent.marketing) {
      activateAdSense();
    }
  };

  const activateAdSense = () => {
    const adsScript = document.querySelector('script[src*="adsbygoogle.js"]');
    if (adsScript) {
      adsScript.setAttribute("data-consent-loaded", "true");
    }
  };

  const handleAcceptAll = () => {
    const allConsent = { necessary: true, analytics: true, marketing: true };
    setPreferences(allConsent);
    localStorage.setItem("kts_cookie_consent", JSON.stringify(allConsent));
    applyConsent(allConsent);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem("kts_cookie_consent", JSON.stringify(preferences));
    applyConsent(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        left: "24px",
        zIndex: 999,
        maxWidth: "420px",
        backgroundColor: "rgba(10, 22, 40, 0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(0, 212, 255, 0.15)",
        padding: "24px",
        borderRadius: "24px",
        boxShadow: "0 20px 40px rgba(0,0,0,0.5), 0 0 30px rgba(0, 212, 255, 0.05)",
        fontFamily: "'DM Sans', sans-serif",
        transition: "all 0.3s ease",
      }}
    >
      {!showPreferences ? (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "rgba(0, 212, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent-500)",
              }}
            >
              <Shield size={18} />
            </div>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>
              {t("cookieConsent.title")}
            </h4>
          </div>
          <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", lineHeight: 1.6, marginBottom: "16px" }}>
            {t("cookieConsent.description")}{" "}
            <a
              href="/privacy"
              style={{ color: "var(--color-accent-500)", textDecoration: "underline", fontWeight: 500 }}
            >
              {t("cookieConsent.linkText")}
            </a>.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={() => setShowPreferences(true)}
              style={{
                padding: "8px 16px",
                backgroundColor: "transparent",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                color: "var(--color-neutral-300)",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
              }}
            >
              <Settings size={13} /> {t("cookieConsent.preferences")}
            </button>
            <button
              onClick={handleAcceptAll}
              style={{
                padding: "8px 16px",
                background: "linear-gradient(135deg, var(--color-accent-500) 0%, var(--color-primary-500) 100%)",
                border: "none",
                color: "white",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "4px",
                boxShadow: "0 4px 12px rgba(0, 212, 255, 0.2)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <Check size={13} /> {t("cookieConsent.acceptAll")}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <h4 style={{ color: "white", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>
              {t("cookieConsent.prefTitle")}
            </h4>
            <button
              onClick={() => setShowPreferences(false)}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-neutral-500)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                padding: "4px",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--color-neutral-500)")}
            >
              <X size={16} />
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
            {/* Essential */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                padding: "10px",
                borderRadius: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.03)",
              }}
            >
              <div>
                <div style={{ color: "white", fontSize: "0.75rem", fontWeight: 600, marginBottom: "2px" }}>
                  {t("cookieConsent.necessaryTitle")}
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.625rem", lineHeight: 1.4 }}>
                  {t("cookieConsent.necessaryDesc")}
                </div>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                style={{ marginTop: "4px", accentColor: "var(--color-accent-500)" }}
              />
            </div>

            {/* Analytics */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                padding: "10px",
                borderRadius: "12px",
                backgroundColor: "transparent",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div>
                <div style={{ color: "white", fontSize: "0.75rem", fontWeight: 600, marginBottom: "2px" }}>
                  {t("cookieConsent.analyticsTitle")}
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.625rem", lineHeight: 1.4 }}>
                  {t("cookieConsent.analyticsDesc")}
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.analytics}
                onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                style={{ marginTop: "4px", accentColor: "var(--color-accent-500)", cursor: "pointer" }}
              />
            </div>

            {/* Marketing */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                padding: "10px",
                borderRadius: "12px",
                backgroundColor: "transparent",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <div>
                <div style={{ color: "white", fontSize: "0.75rem", fontWeight: 600, marginBottom: "2px" }}>
                  {t("cookieConsent.marketingTitle")}
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.625rem", lineHeight: 1.4 }}>
                  {t("cookieConsent.marketingDesc")}
                </div>
              </div>
              <input
                type="checkbox"
                checked={preferences.marketing}
                onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                style={{ marginTop: "4px", accentColor: "var(--color-accent-500)", cursor: "pointer" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              onClick={handleSavePreferences}
              style={{
                padding: "8px 20px",
                backgroundColor: "var(--color-accent-500)",
                border: "none",
                color: "var(--color-primary-950)",
                borderRadius: "12px",
                fontSize: "0.75rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00c2eb")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-accent-500)")}
            >
              {t("cookieConsent.saveChoices")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
