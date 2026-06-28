"use client";
import { useState } from "react";
import { Search, Globe, Share2, HelpCircle } from "lucide-react";

interface SeoPreviewProps {
  title: string;
  metaTitle: string;
  excerpt: string;
  slug: string;
  imageUrl: string;
  category: string;
}

type Tab = "google" | "x" | "linkedin";

export default function SeoPreview({
  title,
  metaTitle,
  excerpt,
  slug,
  imageUrl,
  category
}: SeoPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("google");
  const [isMobileGoogle, setIsMobileGoogle] = useState(false);

  const displayTitle = metaTitle || title || "Untitled Blog Post";
  const displayExcerpt = excerpt || "Write an excerpt or summary here to see how your article will look in search results and social media shares...";
  const displaySlug = slug || "slug-url-goes-here";
  const categoryColor = "#00D4FF"; // Accent color

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.05)",
      borderRadius: "16px",
      padding: "1.5rem",
      marginTop: "1.5rem"
    }}>
      {/* Header and Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h3 style={{ fontSize: "0.9375rem", color: "white", margin: 0, fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Share2 size={16} color="var(--color-accent-500)" /> Live Search &amp; Social Preview
          </h3>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", margin: "0.25rem 0 0" }}>
            Preview how this article appears across search engines and social platforms.
          </p>
        </div>

        <div style={{ display: "inline-flex", background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "3px", border: "1px solid rgba(255,255,255,0.07)" }}>
          {(["google", "x", "linkedin"] as Tab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.35rem 0.85rem",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 600,
                transition: "all 0.15s",
                background: activeTab === tab ? "rgba(0,212,255,0.15)" : "transparent",
                color: activeTab === tab ? "#00D4FF" : "var(--color-neutral-500)"
              }}
            >
              {tab === "google" ? "Google Search" : tab === "x" ? "X / Twitter" : "LinkedIn"}
            </button>
          ))}
        </div>
      </div>

      {/* Preview Mocks */}
      <div style={{
        background: "rgba(0,0,0,0.25)",
        border: "1px solid rgba(255,255,255,0.05)",
        borderRadius: "12px",
        padding: "1.5rem",
        minHeight: "160px"
      }}>
        {activeTab === "google" && (
          <div>
            {/* Google Header Controls */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
              <button
                type="button"
                onClick={() => setIsMobileGoogle(!isMobileGoogle)}
                style={{
                  background: "none", border: "none", color: "#00D4FF", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", padding: 0
                }}
              >
                Switch to {isMobileGoogle ? "Desktop" : "Mobile"} Layout
              </button>
            </div>

            {/* Google Mock */}
            <div style={{
              maxWidth: isMobileGoogle ? "360px" : "600px",
              margin: isMobileGoogle ? "0 auto" : "0",
              fontFamily: "Arial, sans-serif",
              textAlign: "left"
            }}>
              {/* URL bar */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8125rem", color: "#dadce0", marginBottom: "0.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#303134", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.55rem" }}>
                  🌐
                </div>
                <span>kooltechsolutions.com</span>
                <span style={{ color: "#bdc1c6" }}>› blog › {displaySlug}</span>
              </div>

              {/* Title */}
              <h4 style={{
                color: "#8ab4f8",
                fontSize: isMobileGoogle ? "1.25rem" : "1.25rem",
                fontWeight: 400,
                margin: "0 0 0.25rem",
                lineHeight: 1.3,
                textDecoration: "none",
                cursor: "pointer",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {displayTitle}
              </h4>

              {/* Snippet */}
              <p style={{
                color: "#bdc1c6",
                fontSize: "0.875rem",
                lineHeight: 1.5,
                margin: 0,
                display: "-webkit-box",
                WebkitLineClamp: isMobileGoogle ? 3 : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden"
              }}>
                {displayExcerpt}
              </p>
            </div>
          </div>
        )}

        {activeTab === "x" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {/* X Layout */}
            <div style={{
              width: "100%",
              maxWidth: "500px",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "16px",
              overflow: "hidden",
              background: "#000000",
              fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}>
              {/* Preview Image */}
              <div style={{ width: "100%", aspectRatio: "1.91/1", position: "relative", background: "#16181c", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                {imageUrl ? (
                  <img src={imageUrl} alt="Card preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.2)", fontSize: "0.875rem" }}>
                    No Cover Image
                  </div>
                )}
                <div style={{
                  position: "absolute",
                  bottom: "0.5rem",
                  left: "0.5rem",
                  background: "rgba(0,0,0,0.8)",
                  padding: "0.2rem 0.5rem",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  color: "white"
                }}>
                  kooltechsolutions.com
                </div>
              </div>
              
              {/* Details Box */}
              <div style={{ padding: "0.75rem 1rem", textAlign: "left" }}>
                <div style={{ fontSize: "0.75rem", color: "#71767b", marginBottom: "0.25rem", textTransform: "uppercase", fontWeight: 700 }}>
                  {category || "Technology"}
                </div>
                <h4 style={{ color: "#e7e9ea", fontSize: "0.9375rem", fontWeight: 700, margin: "0 0 0.25rem", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.3 }}>
                  {displayTitle}
                </h4>
                <p style={{ color: "#71767b", fontSize: "0.875rem", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", lineHeight: 1.4 }}>
                  {displayExcerpt}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "linkedin" && (
          <div style={{ display: "flex", justifyContent: "center" }}>
            {/* LinkedIn Layout */}
            <div style={{
              width: "100%",
              maxWidth: "520px",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              background: "#1d2226",
              padding: "0.75rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              fontFamily: "-apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}>
              {/* Profile Mock */}
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "0.75rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#4B84C8", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                  K
                </div>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#f8f9fa", lineHeight: 1.2 }}>Kool Tech Solutions</div>
                  <div style={{ fontSize: "0.6875rem", color: "#a8b2b9" }}>Promoted</div>
                </div>
              </div>

              {/* Card Container */}
              <div style={{
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "4px",
                overflow: "hidden",
                cursor: "pointer",
                background: "#2a3138"
              }}>
                <div style={{ width: "100%", aspectRatio: "1.91/1", position: "relative", background: "#1d2226" }}>
                  {imageUrl ? (
                    <img src={imageUrl} alt="Card preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.15)", fontSize: "0.875rem" }}>
                      No Cover Image
                    </div>
                  )}
                </div>
                <div style={{ padding: "0.75rem 1rem", borderTop: "1px solid rgba(255,255,255,0.1)", textAlign: "left" }}>
                  <h4 style={{ color: "#f8f9fa", fontSize: "0.875rem", fontWeight: 600, margin: "0 0 0.25rem", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {displayTitle}
                  </h4>
                  <div style={{ fontSize: "0.72rem", color: "#a8b2b9" }}>kooltechsolutions.com</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
