"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Globe } from "@/components/shared/SocialIcons";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  const footerCategories = [
    {
      title: t("footer.solutions"),
      links: [
        { name: t("services.cybersecurity"), href: "/services/cybersecurity" },
        { name: t("services.cloud"), href: "/services/cloud" },
        { name: t("services.network"), href: "/services/network" },
        { name: t("services.monitoring"), href: "/services/monitoring" },
        { name: t("services.support"), href: "/services/support" },
        { name: t("services.compliance"), href: "/services/compliance" },
      ]
    },
    {
      title: t("footer.company"),
      links: [
        { name: t("footer.about"), href: "/about" },
        { name: t("nav.pricing"), href: "/pricing" },
        { name: t("nav.blog"), href: "/blog" },
        { name: t("footer.careers"), href: "/careers" },
        { name: t("footer.contact"), href: "/contact" },
      ]
    },
    {
      title: t("footer.legal"),
      links: [
        { name: t("nav.clientPortal"), href: "/portal" },
        { name: t("footer.privacy"), href: "/privacy" },
        { name: t("footer.terms"), href: "/terms" },
      ]
    }
  ];

  return (
    <footer style={{
      background: "var(--color-primary-950)",
      borderTop: "1px solid rgba(0,212,255,0.1)",
      paddingTop: "4rem",
    }}>
      <div className="container">
        <div className="footer-layout-grid" style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr 1fr 1fr",
          gap: "3rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid rgba(75,132,200,0.1)",
        }}>
          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{
                width: 44, height: 44, borderRadius: "10px",
                background: "linear-gradient(135deg, #00D4FF, #1E4D8C)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 20px rgba(0,212,255,0.3)",
              }}>
                <span style={{ color: "#fff", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>KT</span>
              </div>
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>Kool Tech Solutions</div>
                <div style={{ color: "var(--color-accent-500)", fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>Enterprise MSP</div>
              </div>
            </div>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", lineHeight: 1.7, marginBottom: "1.5rem", maxWidth: "300px" }}>
              {t("footer.desc")}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <ContactItem icon={Phone} text="+1 (829) 720-1611" href="tel:18297201611" />
              <ContactItem icon={Mail} text="info@kooltechsolutions.com" href="mailto:info@kooltechsolutions.com" />
              <ContactItem icon={Mail} text="support@kooltechsolutions.com" href="mailto:support@kooltechsolutions.com" />
              <ContactItem icon={MapPin} text={t("footer.location")} />
            </div>
            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
              {[Twitter, Linkedin, Github, Globe].map((Icon, i) => (
                <a key={i} href="#" style={{
                  width: 36, height: 36, borderRadius: "8px",
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-neutral-400)", transition: "all 0.2s ease",
                  textDecoration: "none",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = "rgba(0,212,255,0.1)";
                  e.currentTarget.style.color = "var(--color-accent-500)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.4)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "var(--color-neutral-400)";
                  e.currentTarget.style.borderColor = "rgba(0,212,255,0.15)";
                }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {footerCategories.map(cat => (
            <div key={cat.title}>
              <h4 style={{
                color: "#fff", fontFamily: "Syne, sans-serif",
                fontWeight: 700, fontSize: "0.875rem",
                letterSpacing: "0.05em", textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                {cat.title}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {cat.links.map(link => (
                  <li key={link.name}>
                    <Link href={link.href} style={{
                      color: "var(--color-neutral-500)", textDecoration: "none",
                      fontSize: "0.875rem", transition: "color 0.2s ease",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--color-accent-500)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--color-neutral-500)")}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "1.5rem 0", flexWrap: "wrap", gap: "1rem",
        }}>
          <p style={{ color: "var(--color-neutral-600, #475569)", fontSize: "0.8125rem" }}>
            © {year} Kool Tech Solutions. {t("footer.rights")} Built with ❤️ in the Dominican Republic.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span className="badge badge-success">
              <span className="status-dot status-online pulse-online" />
              {t("footer.operational")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({ icon: Icon, text, href }: { icon: React.ElementType; text: string; href?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Icon size={14} color="var(--color-accent-500)" style={{ flexShrink: 0 }} />
      {href ? (
        <a href={href} style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent-500)"} onMouseLeave={e => e.currentTarget.style.color = "var(--color-neutral-500)"}>
          {text}
        </a>
      ) : (
        <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>{text}</span>
      )}
    </div>
  );
}
