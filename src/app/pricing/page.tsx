"use client";
import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingSection from "@/components/sections/PricingSection";
import BookingModal from "@/components/shared/BookingModal";
import { ArrowRight, HelpCircle, ShoppingCart, Check } from "lucide-react";
import { serviceCatalog, Service } from "@/data/services";
import * as Icons from "lucide-react";
import { useLanguage } from "@/components/shared/LanguageProvider";

export default function PricingPage() {
  const { t, language } = useLanguage();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);

  const faqs = [
    { q: t("pricing.faq1Q"), a: t("pricing.faq1A") },
    { q: t("pricing.faq2Q"), a: t("pricing.faq2A") },
    { q: t("pricing.faq3Q"), a: t("pricing.faq3A") },
    { q: t("pricing.faq4Q"), a: t("pricing.faq4A") }
  ];

  const getCategoryTranslation = (name: string, defaultDesc: string) => {
    if (language === "es") {
      switch (name) {
        case "Managed IT & Security Bundles":
          return {
            name: "Paquetes de TI y Seguridad Gestionados",
            desc: "Pilas de gestión y seguridad de TI de nivel empresarial para empresas modernas."
          };
        case "Add-On Managed Services":
          return {
            name: "Servicios Gestionados Adicionales",
            desc: "Complementos especializados de seguridad y gestión para proteger su infraestructura."
          };
        case "NOC as a Service":
          return {
            name: "NOC como Servicio",
            desc: "Centro de Operaciones de Red 24/7 que ofrece garantías de tiempo de inactividad de infraestructura."
          };
        case "SOC as a Service":
          return {
            name: "SOC como Servicio",
            desc: "Centro de Operaciones de Seguridad con despliegue de SIEM y cobertura de analistas humanos."
          };
        case "Compliance as a Service":
          return {
            name: "Cumplimiento como Servicio",
            desc: "Gestión de cumplimiento continuo para HIPAA, PCI-DSS, SOC2 y más."
          };
        case "AI as a Service (AIaaS) & Digital Web":
          return {
            name: "IA como Servicio (AIaaS) y Web Digital",
            desc: "Empleados de IA personalizados, agentes autónomos y plataformas web de alto rendimiento."
          };
        case "Cloud Licensing & SaaS":
          return {
            name: "Licencias de Nube y SaaS",
            desc: "Licenciamiento oficial y administración profesional para M365 y Google Workspace."
          };
        case "Secure Cloud Communications":
          return {
            name: "Comunicaciones Seguras en la Nube",
            desc: "Soluciones VoIP empresariales y plataformas de comunicaciones unificadas."
          };
        default:
          return { name, desc: defaultDesc };
      }
    }
    return { name, desc: defaultDesc };
  };

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
    return language === "es"
      ? `Estoy interesado en un paquete personalizado que incluya los siguientes servicios:\n\n${list}`
      : `I am interested in a custom package including the following services:\n\n${list}`;
  }, [selectedServices, language]);

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
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("pricing.pageBadge")}</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", color: "white", marginBottom: "1.5rem", lineHeight: 1.1 }}>
              {t("pricing.titleStart")}<br />
              <span className="gradient-text">{t("pricing.titleGradient")}</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "600px", margin: "0 auto", fontSize: "1.125rem", lineHeight: 1.6 }}>
              {t("pricing.subtitle")}
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
                {t("pricing.customTitle")}
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "700px", margin: "0 auto", fontSize: "1.0625rem", lineHeight: 1.6 }}>
                {t("pricing.customSubtitle")}
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "4rem" }}>
              {serviceCatalog.map((category) => {
                const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[category.icon] || Icons.HelpCircle;
                const translated = getCategoryTranslation(category.name, category.description);
                
                return (
                  <div key={category.name}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "1rem" }}>
                      <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)", flexShrink: 0 }}>
                        <IconComponent size={24} />
                      </div>
                      <div>
                        <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.5rem", margin: 0 }}>
                          {translated.name}
                        </h3>
                        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", margin: "0.25rem 0 0 0" }}>
                          {translated.desc}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(min(320px, 100%), 1fr))", gap: "1.5rem" }}>
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
                                    <span style={{ fontSize: "0.6rem", background: "rgba(255,68,68,0.1)", color: "#ff4444", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>
                                      {language === "es" ? "Crítico" : "Critical"}
                                    </span>
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
                                {service.price === "Custom" && language === "es" ? "A medida" : service.price}
                              </div>
                              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                                {language === "es" 
                                  ? (service.priceType === "Monthly" ? "Mensual" : service.priceType === "One-time" ? "Única vez" : "Ad Hoc")
                                  : service.priceType
                                }
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
              <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("pricing.faqBadge")}</div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "white" }}>
                {t("pricing.faqTitle")}
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
                {t("pricing.needCustom")}
              </h2>
              <p style={{ color: "var(--color-neutral-400)", maxWidth: "500px", margin: "0 auto 2rem" }}>
                {t("pricing.needCustomDesc")}
              </p>
              <button 
                onClick={() => setBookingOpen(true)}
                className="btn-primary" 
                style={{ margin: "0 auto", padding: "1rem 2rem", fontSize: "1rem" }}
              >
                {t("pricing.scheduleConsultation")} <ArrowRight size={18} />
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
                  <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>
                    {t("pricing.servicesSelected").replace("{num}", selectedServices.length.toString())}
                  </div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{t("pricing.customBuilder")}</div>
                </div>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1.5rem", marginLeft: "0.5rem" }}>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{t("pricing.estMonthly")}</div>
                <div style={{ color: "var(--color-accent-500)", fontWeight: 800, fontSize: "1.25rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                  ${customPriceInfo.totalMonthly.toFixed(2)}
                  {customPriceInfo.hasCustom && <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", fontWeight: 500 }}> {t("pricing.plusCustom")}</span>}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <button 
                onClick={() => setSelectedServices([])}
                style={{ background: "none", border: "none", color: "var(--color-neutral-400)", fontSize: "0.875rem", cursor: "pointer", fontWeight: 600 }}
              >
                {t("pricing.clearCart")}
              </button>
              <button 
                onClick={() => setBookingOpen(true)}
                className="btn-primary" 
                style={{ padding: "0.75rem 1.5rem" }}
              >
                {t("pricing.requestQuote")}
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
