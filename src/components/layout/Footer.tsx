"use client";

import Link from "next/link";
import { Mail, Phone, MapPin, Twitter, Linkedin, Github, Globe } from "@/components/shared/SocialIcons";

const footerLinks = {
  Services: [
    { name: "Cybersecurity", href: "/services/cybersecurity" },
    { name: "Cloud Services", href: "/services/cloud" },
    { name: "Network Management", href: "/services/network" },
    { name: "24/7 Monitoring", href: "/services/monitoring" },
    { name: "Help Desk", href: "/services/support" },
    { name: "IT Compliance", href: "/services/compliance" },
  ],
  Company: [
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog & Insights", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
  ],
  Portal: [
    { name: "Client Login", href: "/portal" },
    { name: "Submit a Ticket", href: "/portal/tickets" },
    { name: "View Invoices", href: "/portal/invoices" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  const year = new Date().getFullYear();
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
              Enterprise-grade IT Managed Services for the Dominican Republic, USA, Canada, and the Caribbean. Technology that works as hard as you do.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <ContactItem icon={Phone} text="+1 (829) 720-1611" />
              <ContactItem icon={Mail} text="danieljwilliams@kooltechsolutions.com" />
              <ContactItem icon={MapPin} text="Santiago, Dominican Republic" />
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
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 style={{
                color: "#fff", fontFamily: "Syne, sans-serif",
                fontWeight: 700, fontSize: "0.875rem",
                letterSpacing: "0.05em", textTransform: "uppercase",
                marginBottom: "1rem",
              }}>
                {category}
              </h4>
              <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {links.map(link => (
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
            © {year} Kool Tech Solutions. All rights reserved. Built with ❤️ in the Dominican Republic.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span className="badge badge-success">
              <span className="status-dot status-online pulse-online" />
              All Systems Operational
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function ContactItem({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <Icon size={14} color="var(--color-accent-500)" />
      <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>{text}</span>
    </div>
  );
}
