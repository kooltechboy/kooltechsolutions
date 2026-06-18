"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Calendar } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";
import { useLanguage } from "@/components/shared/LanguageProvider";

const services = [
  { value: "Free Vulnerability Assessment", labelKey: "contactServices.vulnerability" },
  { value: "Cloud & Network Audit", labelKey: "contactServices.audit" },
  { value: "Get a Custom IT Quote", labelKey: "contactServices.quote" },
  { value: "Book AI Consultation", labelKey: "contactServices.ai" },
  { value: "Technical Support", labelKey: "contactServices.support" },
  { value: "General Inquiry", labelKey: "contactServices.inquiry" },
];

function ContactContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ 
    name: "", company: "", email: "", phone: "", 
    service: searchParams.get("intent") || "", 
    message: "" 
  });
  const [loading, setLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(() => searchParams.get("book") === "true");
  const [prevBook, setPrevBook] = useState(() => searchParams.get("book"));

  const currentBook = searchParams.get("book");
  if (currentBook !== prevBook) {
    setPrevBook(currentBook);
    setBookingOpen(currentBook === "true");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        {/* Hero */}
        <section style={{ padding: "5rem 0 4rem", background: "linear-gradient(180deg, rgba(15,32,68,0.5) 0%, transparent 100%)" }}>
          <div className="container" style={{ textAlign: "center" }}>
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>{t("contact.badge")}</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              {t("contact.titleStart")} <span className="gradient-text">{t("contact.titleGradient")}</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              {t("contact.subtitle")}
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: "2rem" }}>
          <div className="container">
            <div className="contact-layout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "3rem", alignItems: "start" }}>

              {/* Contact Info */}
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "1.5rem" }}>{t("contact.detailsTitle")}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                  {[
                    { icon: Phone, label: t("contact.phone"), val: "+1 (829) 720-1611", isLink: true, href: "tel:18297201611" },
                    { icon: Mail, label: "Sales Inquiries", val: "sales@kooltechsolutions.com", desc: "Looking for an IT assessment or custom quote?", isLink: true, href: "mailto:sales@kooltechsolutions.com" },
                    { icon: Mail, label: "General Questions", val: "info@kooltechsolutions.com", desc: "For general business inquiries.", isLink: true, href: "mailto:info@kooltechsolutions.com" },
                    { icon: Mail, label: "Technical Issues", val: "support@kooltechsolutions.com", desc: "Existing clients needing assistance.", isLink: true, href: "mailto:support@kooltechsolutions.com" },
                    { icon: MapPin, label: t("contact.hq"), val: "Santiago, Dominican Republic" },
                    { icon: Clock, label: t("contact.hours"), val: t("contact.hoursVal") },
                  ].map(item => (
                    <div key={item.label} className="glass-card" style={{ borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon size={18} color="var(--color-accent-500)" />
                      </div>
                      <div>
                        <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                        {item.isLink ? (
                          <a href={item.href} style={{ color: "white", fontSize: "0.875rem", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }} onMouseEnter={e => e.currentTarget.style.color = "var(--color-accent-500)"} onMouseLeave={e => e.currentTarget.style.color = "white"}>{item.val}</a>
                        ) : (
                          <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 500 }}>{item.val}</div>
                        )}
                        {item.desc && <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.2rem" }}>{item.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card" style={{ borderRadius: "12px", padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <Calendar size={20} color="var(--color-accent-500)" />
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>{t("contact.demoTitle")}</h3>
                  </div>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                    {t("contact.demoDesc")}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setBookingOpen(true);
                      }} 
                      className="btn-primary" 
                      style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                    >
                      {t("contact.demoButton")}
                    </button>
                  </div>
                </div>

                <div className="badge badge-success" style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", fontSize: "0.8125rem" }}>
                  {t("contact.emergency")}
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass-card" style={{ borderRadius: "20px", padding: "2.5rem" }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <CheckCircle size={56} color="var(--color-success)" style={{ margin: "0 auto 1rem" }} />
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem" }}>{t("contact.successTitle")}</h3>
                    <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.6 }}>
                      {t("contact.successDesc")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "0.5rem" }}>{t("contact.formTitle")}</h2>
                    <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contact.formName")}</label>
                        <input required className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contact.formCompany")}</label>
                        <input className="input-field" placeholder="Acme Corp" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                      </div>
                    </div>
                    <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contact.formEmail")}</label>
                        <input required type="email" className="input-field" placeholder="john@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contact.formPhone")}</label>
                        <input className="input-field" placeholder="+1 (809) ..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contactServices.formServiceLabel")}</label>
                      <select className="input-field" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                        <option value="">{t("contact.formServicePlaceholder")}</option>
                        {services.map(s => <option key={s.value} value={s.value}>{t(s.labelKey)}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>{t("contact.formMessage")}</label>
                      <textarea required className="input-field" placeholder={t("contact.formMessagePlaceholder")} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: "center", padding: "1rem", opacity: loading ? 0.7 : 1 }}>
                      <Send size={17} /> {loading ? t("contact.formSending") : t("contact.formSubmit")}
                    </button>
                    <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "center" }}>
                      {t("contact.formAgreement")}
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="mesh-gradient" style={{ minHeight: "100vh" }} />}>
      <ContactContent />
    </Suspense>
  );
}
