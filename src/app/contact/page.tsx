"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle, Calendar } from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";

const services = [
  "Managed IT (Essential)",
  "Managed IT (Advanced MDR)",
  "Managed IT (AI SOC)",
  "Help Desk as a Service",
  "NOC as a Service",
  "SOC as a Service",
  "Cybersecurity",
  "Managed Email Security",
  "Endpoint Detection & Response",
  "Cloud Services",
  "Business Continuity & DR",
  "Network Management",
  "Compliance as a Service",
  "Dark Web Monitoring",
  "AI as a Service (Kira/Max/Nova)",
  "Microsoft 365 / Google Workspace",
  "Enterprise VoIP / UCaaS",
  "Custom Web & Mobile Development",
  "Other / General Inquiry",
];

function ContactContent() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", company: "", email: "", phone: "", service: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("book") === "true") {
      setBookingOpen(true);
    }
  }, [searchParams]);

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
            <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>Get In Touch</div>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3rem)", color: "white", marginBottom: "1rem" }}>
              Let&apos;s Discuss Your <span className="gradient-text">IT Needs</span>
            </h1>
            <p style={{ color: "var(--color-neutral-400)", maxWidth: "520px", margin: "0 auto", lineHeight: 1.7 }}>
              Get a free, no-obligation IT assessment from our senior engineers. We respond within one business hour.
            </p>
          </div>
        </section>

        <section className="section" style={{ paddingTop: "2rem" }}>
          <div className="container">
            <div className="contact-layout-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: "3rem", alignItems: "start" }}>

              {/* Contact Info */}
              <div>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "1.5rem" }}>Contact Details</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
                  {[
                    { icon: Phone, label: "Phone", val: "+1 (829) 720-1611" },
                    { icon: Mail, label: "Email", val: "danieljwilliams@kooltechsolutions.com" },
                    { icon: MapPin, label: "HQ", val: "Santiago, Dominican Republic" },
                    { icon: Clock, label: "Hours", val: "Mon–Fri 8AM–6PM AST · Emergency 24/7" },
                  ].map(item => (
                    <div key={item.label} className="glass-card" style={{ borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ width: 40, height: 40, borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <item.icon size={18} color="var(--color-accent-500)" />
                      </div>
                      <div>
                        <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</div>
                        <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 500 }}>{item.val}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="glass-card" style={{ borderRadius: "12px", padding: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
                    <Calendar size={20} color="var(--color-accent-500)" />
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>Schedule a Demo</h3>
                  </div>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: "1rem" }}>
                    Prefer to see our platform in action? Book a 30-minute live demo with our team.
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setBookingOpen(true);
                    }} 
                    className="btn-primary" 
                    style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  >
                    Book a Demo Slot
                  </button>
                </div>

                <div className="badge badge-success" style={{ marginTop: "1.5rem", display: "flex", gap: "0.5rem", padding: "0.75rem 1rem", borderRadius: "12px", fontSize: "0.8125rem" }}>
                  🚨 Emergency IT support available 24/7 at +1 (829) 720-1611
                </div>
              </div>

              {/* Contact Form */}
              <div className="glass-card" style={{ borderRadius: "20px", padding: "2.5rem" }}>
                {submitted ? (
                  <div style={{ textAlign: "center", padding: "2rem 0" }}>
                    <CheckCircle size={56} color="var(--color-success)" style={{ margin: "0 auto 1rem" }} />
                    <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem" }}>Message Received!</h3>
                    <p style={{ color: "var(--color-neutral-400)", lineHeight: 1.6 }}>
                      Our team will reach out within one business hour. Check your email for a confirmation.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", marginBottom: "0.5rem" }}>Send Us a Message</h2>
                    <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Full Name *</label>
                        <input required className="input-field" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Company</label>
                        <input className="input-field" placeholder="Acme Corp" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
                      </div>
                    </div>
                    <div className="contact-form-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Email *</label>
                        <input required type="email" className="input-field" placeholder="john@company.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                      </div>
                      <div>
                        <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Phone</label>
                        <input className="input-field" placeholder="+1 (809) ..." value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Service Interest</label>
                      <select className="input-field" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                        <option value="">Select a service...</option>
                        {services.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.4rem" }}>Message *</label>
                      <textarea required className="input-field" placeholder="Tell us about your IT challenges and goals..." rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} style={{ resize: "vertical" }} />
                    </div>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: "center", padding: "1rem", opacity: loading ? 0.7 : 1 }}>
                      <Send size={17} /> {loading ? "Sending..." : "Send Message"}
                    </button>
                    <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "center" }}>
                      By submitting, you agree to our Privacy Policy. We never share your data.
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
