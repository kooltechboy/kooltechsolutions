import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import CTASection from "@/components/sections/CTASection";
import { MapPin, Heart, Zap, Users, Globe, ArrowRight, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Careers | Kool Tech Solutions",
  description: "Join the Kool Tech Solutions team — careers in IT, cybersecurity, AI, cloud, and operations across the Caribbean and USA.",
};

const benefits = [
  { icon: Globe, title: "Remote-First Culture", desc: "Work from anywhere in the Caribbean or USA with flexible hours." },
  { icon: Zap, title: "Cutting-Edge Stack", desc: "Work with the latest AI, cloud, and cybersecurity technologies." },
  { icon: Heart, title: "Health & Wellness", desc: "Full medical, dental, and vision coverage for you and dependents." },
  { icon: Users, title: "Growth Opportunities", desc: "Paid certifications: CISSP, AWS, Azure, ITIL, and more." },
];

const openRoles = [
  { title: "Senior Cybersecurity Analyst", dept: "Security Operations", loc: "Santo Domingo, DR / Remote", type: "Full-time", badge: "SOC", color: "#A855F7" },
  { title: "NOC Engineer (L2)", dept: "Network Operations", loc: "Santo Domingo, DR", type: "Full-time", badge: "NOC", color: "#00D4FF" },
  { title: "AI Solutions Engineer", dept: "AI & Automation", loc: "Remote (LATAM/USA)", type: "Full-time", badge: "AI", color: "#00E676" },
  { title: "Cloud Infrastructure Architect", dept: "Cloud Services", loc: "Remote (LATAM/USA)", type: "Full-time", badge: "Cloud", color: "#FFB300" },
  { title: "Help Desk Technician (L1)", dept: "Client Services", loc: "Santiago, DR", type: "Full-time", badge: "HDS", color: "#4B84C8" },
  { title: "Compliance & Risk Analyst", dept: "Compliance", loc: "Remote", type: "Contract", badge: "GRC", color: "#FF6B35" },
];

export default function CareersPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>We're Hiring</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1rem" }}>
              Build the Future of<br /><span className="gradient-text">Caribbean IT</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "560px", margin: "0 auto 2rem", lineHeight: 1.8, fontSize: "1.0625rem" }}>
              Join a world-class team of engineers, security analysts, and AI specialists who are transforming how businesses operate across the Dominican Republic, USA, Canada, and the Caribbean.
            </p>
            <a href="#roles" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
              View Open Positions <ArrowRight size={16} />
            </a>
          </div>
        </section>

        {/* Benefits */}
        <section className="section">
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Why KTS</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                More Than a Job, <span className="gradient-text">A Mission</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
              {benefits.map(b => (
                <div key={b.title} className="glass-card" style={{ borderRadius: "16px", padding: "2rem", textAlign: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,212,255,0.1)", border: "2px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
                    <b.icon size={24} color="var(--color-accent-500)" />
                  </div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem", marginBottom: "0.75rem" }}>{b.title}</h3>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section id="roles" className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Open Positions</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.5rem, 3vw, 2.25rem)", color: "white" }}>
                {openRoles.length} <span className="gradient-text">Roles Available</span>
              </h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {openRoles.map(role => (
                <div key={role.title} className="glass-card" style={{ padding: "1.5rem 2rem", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem", borderLeft: `4px solid ${role.color}` }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
                      <span style={{ background: `${role.color}15`, color: role.color, padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em" }}>{role.badge}</span>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.0625rem" }}>{role.title}</h3>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                      <span style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{role.dept}</span>
                      <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <MapPin size={13} /> {role.loc}
                      </span>
                      <span style={{ background: "rgba(75,132,200,0.1)", color: "var(--color-neutral-400)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem" }}>{role.type}</span>
                    </div>
                  </div>
                  <a href={`mailto:careers@kooltech.solutions?subject=Application: ${role.title}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", borderRadius: "8px", border: `1px solid ${role.color}40`, background: `${role.color}10`, color: role.color, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
                    Apply Now <ArrowRight size={14} />
                  </a>
                </div>
              ))}
            </div>

            {/* General Application */}
            <div className="glass-card" style={{ padding: "2rem", borderRadius: "16px", textAlign: "center", marginTop: "2rem", background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(168,85,247,0.05))" }}>
              <Mail size={32} color="var(--color-accent-500)" style={{ marginBottom: "1rem" }} />
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.25rem", marginBottom: "0.75rem" }}>Don't See Your Role?</h3>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "480px", margin: "0 auto 1.5rem", lineHeight: 1.7 }}>
                We're always looking for exceptional talent. Send us your resume and tell us how you'd add value to the KTS team.
              </p>
              <a href="mailto:careers@kooltech.solutions" className="btn-primary" style={{ display: "inline-flex", textDecoration: "none" }}>
                Send General Application <ArrowRight size={16} />
              </a>
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
      <AIChatWidget />
    </>
  );
}
