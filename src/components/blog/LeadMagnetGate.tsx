"use client";
import { useState } from "react";
import { Download, Mail, CheckCircle, AlertCircle, Loader2, FileText } from "lucide-react";

interface LeadMagnet {
  id: string;
  title: string;
  description: string | null;
  cta_button_text: string;
  pdf_filename: string | null;
}

interface LeadMagnetGateProps {
  magnet: LeadMagnet;
}

type State = "idle" | "open" | "submitting" | "success" | "error";

export default function LeadMagnetGate({ magnet }: LeadMagnetGateProps) {
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({ name: "", email: "", consent: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      setErrorMsg("Please agree to the privacy policy to continue.");
      return;
    }
    setState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("/api/lead-magnets/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead_magnet_id: magnet.id,
          name: form.name,
          email: form.email,
          consent: form.consent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setState("error");
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(75,132,200,0.08) 100%)",
        border: "1px solid rgba(0,212,255,0.2)",
        borderRadius: "20px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1.5rem 1.5rem 1rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.25rem 0.65rem",
            background: "rgba(0,212,255,0.1)",
            borderRadius: "100px",
            marginBottom: "0.85rem",
          }}
        >
          <FileText size={11} color="#00D4FF" />
          <span
            style={{
              fontSize: "0.65rem",
              fontWeight: 700,
              color: "#00D4FF",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Free Download
          </span>
        </div>

        <h3
          style={{
            fontFamily: "Syne, sans-serif",
            fontWeight: 800,
            fontSize: "1rem",
            color: "white",
            margin: "0 0 0.5rem",
            lineHeight: 1.3,
          }}
        >
          {magnet.title}
        </h3>

        {magnet.description && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--color-neutral-400)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {magnet.description}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: "0 1.5rem 1.5rem" }}>
        {state === "success" ? (
          // ── Success state ──────────────────────────────────
          <div
            style={{
              textAlign: "center",
              padding: "1.5rem 1rem",
              background: "rgba(0,230,118,0.05)",
              border: "1px solid rgba(0,230,118,0.15)",
              borderRadius: "12px",
            }}
          >
            <CheckCircle size={36} color="#00E676" style={{ marginBottom: "0.75rem" }} />
            <p
              style={{
                color: "#00E676",
                fontWeight: 700,
                fontSize: "0.9375rem",
                margin: "0 0 0.35rem",
              }}
            >
              Check your inbox!
            </p>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem", margin: 0, lineHeight: 1.5 }}>
              We emailed you a secure download link. It expires in 1 hour.
            </p>
          </div>
        ) : state === "open" || state === "submitting" || state === "error" ? (
          // ── Lead capture form ─────────────────────────────
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              required
              type="text"
              placeholder="Your first name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              style={{ fontSize: "0.875rem", padding: "0.625rem 0.875rem" }}
            />
            <input
              required
              type="email"
              placeholder="Your work email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              className="input-field"
              style={{ fontSize: "0.875rem", padding: "0.625rem 0.875rem" }}
            />

            {/* GDPR Consent */}
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.6rem",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                required
                checked={form.consent}
                onChange={(e) => setForm((p) => ({ ...p, consent: e.target.checked }))}
                style={{ marginTop: "2px", accentColor: "#00D4FF", width: "15px", height: "15px", flexShrink: 0 }}
              />
              <span style={{ fontSize: "0.72rem", color: "var(--color-neutral-500)", lineHeight: 1.5 }}>
                I agree to receive this resource and occasional IT insights from Kool Tech Solutions.
                I can unsubscribe at any time. See our{" "}
                <a href="/privacy" style={{ color: "#00D4FF", textDecoration: "none" }}>
                  Privacy Policy
                </a>
                .
              </span>
            </label>

            {errorMsg && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.875rem",
                  background: "rgba(255,68,68,0.08)",
                  border: "1px solid rgba(255,68,68,0.2)",
                  borderRadius: "8px",
                  color: "#FF4444",
                  fontSize: "0.78rem",
                }}
              >
                <AlertCircle size={14} />
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={state === "submitting"}
              style={{
                padding: "0.75rem",
                borderRadius: "10px",
                border: "none",
                cursor: state === "submitting" ? "default" : "pointer",
                background: "linear-gradient(135deg, #00D4FF, #4B84C8)",
                color: "#060B18",
                fontWeight: 800,
                fontSize: "0.875rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "opacity 0.2s",
                opacity: state === "submitting" ? 0.7 : 1,
              }}
            >
              {state === "submitting" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <Mail size={16} /> Email Me the Download
                </>
              )}
            </button>
          </form>
        ) : (
          // ── Idle CTA ──────────────────────────────────────
          <button
            type="button"
            onClick={() => setState("open")}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #00D4FF, #4B84C8)",
              color: "#060B18",
              fontWeight: 800,
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <Download size={16} />
            {magnet.cta_button_text || "Download Free Guide"}
          </button>
        )}

        {state === "idle" && (
          <p
            style={{
              textAlign: "center",
              margin: "0.6rem 0 0",
              fontSize: "0.68rem",
              color: "var(--color-neutral-600)",
            }}
          >
            🔒 Free · No spam · Instant email delivery
          </p>
        )}
      </div>
    </div>
  );
}
