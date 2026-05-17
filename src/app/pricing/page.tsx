"use client";
import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingSection from "@/components/sections/PricingSection";
import BookingModal from "@/components/shared/BookingModal";
import { ArrowRight, HelpCircle, ShoppingCart, Check } from "lucide-react";
import { serviceCatalog, Service } from "@/data/services";
import * as Icons from "lucide-react";

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
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  const customMessage = useMemo(() => {
    if (selectedServices.length === 0) return "";
    const list = selectedServices.map(s => `- ${s.name} (${s.code})`).join("\n");
    return `I am interested in a custom package including the following services:\n\n${list}`;
  }, [selectedServices]);

  const customPriceInfo = useMemo(() => {
    let hasCustom = false;
    let totalMonthly = 0;
    
    selectedServices.forEach(s => {
      if (s.price.toLowerCase() === "custom") {
        hasCustom = true;
      } else {
        const numPrice = parseFloat(s.price.replace(/[^0-9.]/g, ""));
        if (!isNaN(numPrice) && s.priceType === "Monthly") {
          totalMonthly += numPrice;
        }
      }
    });

    return { totalMonthly, hasCustom };
  }, [selectedServices]);

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px", paddingBottom: selectedServices.length > 0 ? "80px" : "0", transition: "padding 0.3s ease" }}>
        
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

        {/* Comprehensive Catalog & Custom Builder */}
        <section className="section" id="custom-builder" style={{ position: "relative" }}>
          <div className="container">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white", marginBottom: "1rem" }}>
                Build Your Custom Stack
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "700px", margin: "0 auto", fontSize: "1.0625rem", lineHeight: 1.6 }}>
                Need something specific? Browse our comprehensive catalog below and select the services you need to build a custom package. We'll give you a tailored quote.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
              {serviceCatalog.map((category) => {
                const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;
                
                return (
                  <div key={category.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)", flexShrink: 0 }}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.5rem", margin: 0 }}>
                          {category.name}
                        </h3>
                        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                      {category.services.map((service) => {
                        const isSelected = selectedServices.some(s => s.id === service.id);
                        
                        return (
                          <div 
                            key={service.id} 
                            onClick={() => toggleService(service)}
                            className="glass-card" 
                            style={{ 
                              padding: "1.5rem", 
                              borderRadius: "16px", 
                              display: "flex", 
                              flexDirection: "column",
                              border: isSelected ? "1px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.05)",
                              background: isSelected ? "rgba(0,212,255,0.05)" : "rgba(10,22,40,0.6)",
                              cursor: "pointer",
                              transition: "all 0.2s ease"
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                              <div style={{ flex: 1, paddingRight: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                  <h4 style={{ color: "white", fontSize: "1rem", fontWeight: 600, margin: 0 }}>{service.name}</h4>
                                  {service.priority === "High" && (
                                    <span style={{ fontSize: "0.6rem", background: "rgba(255,68,68,0.1)", color: "#ff4444", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>Critical</span>
                                  )}
                                </div>
                                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.25rem" }}>{service.code}</div>
                              </div>
                              <div style={{ 
                                width: 24, height: 24, borderRadius: "6px", 
                                background: isSelected ? "var(--color-accent-500)" : "rgba(255,255,255,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                color: isSelected ? "#060B18" : "transparent",
                                flexShrink: 0,
                                transition: "all 0.2s ease"
                              }}>
                                <Check size={14} strokeWidth={3} />
                              </div>
                            </div>
                            
                            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: "1.5rem", flexGrow: 1 }}>
                              {service.description}
                            </p>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ color: "var(--color-accent-500)", fontSize: "1.125rem", fontWeight: 700 }}>
                                {service.price}
                              </div>
                              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                                {service.priceType}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
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

      {/* Sticky Custom Package Builder Footer */}
      {selectedServices.length > 0 && (
        <div style={{ 
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(10,22,40,0.95)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(0,212,255,0.2)",
          padding: "1rem", display: "flex", justifyContent: "center",
          animation: "slideUp 0.3s ease",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.5)"
        }}>
          <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)", border: "1px solid rgba(0,212,255,0.2)" }}>
                  <ShoppingCart size={20} />
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>{selectedServices.length} Services Selected</div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>Custom Package Builder</div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1.5rem", marginLeft: "0.5rem" }}>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>Est. Monthly Total</div>
                <div style={{ color: "var(--color-accent-500)", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                  ${customPriceInfo.totalMonthly.toFixed(2)}
                  {customPriceInfo.hasCustom && <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", fontWeight: 500 }}>+ Custom Pricing</span>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button 
                onClick={() => setSelectedServices([])}
                style={{ background: "none", border: "none", color: "var(--color-neutral-400)", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}
              >
                Clear Cart
              </button>
              <button 
                onClick={() => setBookingOpen(true)}
                className="btn-primary" 
                style={{ padding: "0.75rem 1.5rem" }}
              >
                Request Quote
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
      <BookingModal 
        isOpen={bookingOpen} 
        onClose={() => setBookingOpen(false)} 
        initialService={selectedServices.length > 0 ? "Custom Package" : ""}
        initialMessage={customMessage}
      />
      <style>{`
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </>
  );
}
