"use client";
import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingSection from "@/components/sections/PricingSection";
import BookingModal from "@/components/shared/BookingModal";
import { Shield, Cloud, Server, Headphones, Check, Plus, ArrowRight, HelpCircle } from "lucide-react";

const individualServices = [
  {
    name: "Cybersecurity Suite",
    icon: Shield,
    price: "Starts at $150/mo",
    desc: "Standalone zero-trust security architecture, endpoint protection, and 24/7 SOC monitoring.",
    features: ["Next-Gen Antivirus", "EDR / XDR", "Dark Web Monitoring", "Phishing Simulation"],
  },
  {
    name: "Cloud Infrastructure",
    icon: Cloud,
    price: "Starts at $200/mo",
    desc: "AWS & Azure cloud management, optimization, and secure migration services.",
    features: ["Cloud Architecture", "Cost Optimization", "Daily Backups", "Disaster Recovery"],
  },
  {
    name: "Network Operations",
    icon: Server,
    price: "Starts at $250/mo",
    desc: "Complete network management, firewall configuration, and ISP vendor management.",
    features: ["Firewall Management", "SD-WAN Routing", "Wi-Fi Optimization", "VPN Setup"],
  },
  {
    name: "Help Desk Support",
    icon: Headphones,
    price: "Starts at $100/user",
    desc: "Dedicated L1-L3 support for your team, available during business hours or 24/7.",
    features: ["Remote Support", "Ticketing System", "SLA Guarantees", "Software Troubleshooting"],
  }
];

const faqs = [
  {
    q: "Do you require long-term contracts?",
    a: "We offer flexible month-to-month agreements for our standard tiers. Annual contracts are available with a 15% discount for long-term partnerships."
  },
  {
    q: "How does onboarding work?",
    a: "Our onboarding process typically takes 14-30 days. We deploy our agents, map your network, audit your security, and document everything without disrupting your daily operations."
  },
  {
    q: "Can I customize a package?",
    a: "Absolutely. Our Bronze, Silver, and Gold tiers cover most businesses, but we can tailor a specific combination of services to match your exact compliance and operational requirements."
  },
  {
    q: "What is included in 'unlimited endpoints'?",
    a: "Our Gold tier includes management and security for all company-owned devices (workstations, laptops, servers, and mobile devices) under your primary domain."
  }
];

export default function PricingPage() {
  const [bookingOpen, setBookingOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        
        {/* Hero Section */}
        <section style={{ padding: "5rem 0 3rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)", textAlign: "center" }}>
          <div className="container">
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Plans & Pricing</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              Transparent Pricing.<br />
              <span className="gradient-text">No Surprises.</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto", fontSize: "1.125rem", lineHeight: 1.6 }}>
              Choose a bundled combo package for comprehensive coverage, or build your own stack with our individual service offerings.
            </p>
          </div>
        </section>

        {/* Combo Packages (Reused Section) */}
        <PricingSection />

        {/* Individual Services & Add-ons */}
        <section className="section" style={{ position: "relative" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white", marginBottom: "1rem" }}>
                Individual Solutions & Add-ons
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto" }}>
                Need something specific? Build a customized IT plan with our standalone services tailored to fill gaps in your existing infrastructure.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
              {individualServices.map((service, index) => (
                <div key={index} className="glass-card" style={{ padding: "2rem", borderRadius: "16px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                    <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)" }}>
                      <service.icon size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", margin: 0 }}>{service.name}</h3>
                      <div style={{ color: "var(--color-accent-500)", fontSize: "0.875rem", fontWeight: 600 }}>{service.price}</div>
                    </div>
                  </div>
                  
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "1.5rem", flexGrow: 1 }}>
                    {service.desc}
                  </p>

                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 1.5rem 0", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {service.features.map((feature, i) => (
                      <li key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.8125rem", color: "var(--color-neutral-300)" }}>
                        <Plus size={14} color="var(--color-accent-500)" /> {feature}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={() => setBookingOpen(true)}
                    className="btn-secondary" 
                    style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  >
                    Request Quote
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section" style={{ background: "rgba(10,22,40,0.4)" }}>
          <div className="container" style={{ maxWidth: "800px" }}>
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>FAQ</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white" }}>
                Common Questions
              </h2>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {faqs.map((faq, index) => (
                <div key={index} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", borderLeft: "4px solid var(--color-accent-500)" }}>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "0.75rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                    <HelpCircle size={20} color="var(--color-accent-500)" style={{ flexShrink: 0, marginTop: "2px" }} />
                    {faq.q}
                  </h3>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.9375rem", lineHeight: 1.6, paddingLeft: "1.75rem", margin: 0 }}>
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="section">
          <div className="container">
            <div className="glass-card" style={{ padding: "4rem 2rem", borderRadius: "24px", textAlign: "center", background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(30,77,140,0.1))" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white", marginBottom: "1rem" }}>
                Need a Custom Solution?
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "500px", margin: "0 auto 2rem" }}>
                Let our engineering team build a pricing model tailored specifically to your exact infrastructure requirements.
              </p>
              <button 
                onClick={() => setBookingOpen(true)}
                className="btn-primary" 
                style={{ margin: "0 auto", padding: "1rem 2rem", fontSize: "1rem" }}
              >
                Schedule Consultation <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
