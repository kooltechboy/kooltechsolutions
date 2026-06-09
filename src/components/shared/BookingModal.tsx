"use client";
import { useState } from "react";
import { X, Calendar, Clock, User, Mail, CheckCircle, Loader2, Phone, MessageSquare, Briefcase } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

export default function BookingModal({ 
  isOpen, 
  onClose,
  initialName = "",
  initialEmail = "",
  initialService = "",
  initialMessage = ""
}: { 
  isOpen: boolean; 
  onClose: () => void;
  initialName?: string;
  initialEmail?: string;
  initialService?: string;
  initialMessage?: string;
}) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [form, setForm] = useState({ 
    name: initialName, 
    email: initialEmail,
    phone: "",
    service: initialService,
    message: initialMessage
  });

  // Update form if initial values change (e.g. after profile loads or custom package changes) using render-phase synchronization to avoid set-state-in-effect warnings
  const [prevProps, setPrevProps] = useState({ initialName, initialEmail, initialService, initialMessage });
  if (
    initialName !== prevProps.initialName ||
    initialEmail !== prevProps.initialEmail ||
    initialService !== prevProps.initialService ||
    initialMessage !== prevProps.initialMessage
  ) {
    setPrevProps({ initialName, initialEmail, initialService, initialMessage });
    setForm(prev => ({
      ...prev,
      name: prev.name || initialName,
      email: prev.email || initialEmail,
      service: initialService || prev.service,
      message: initialMessage || prev.message
    }));
  }

  if (!isOpen) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          date: selectedDate,
          time: selectedTime,
          phone: form.phone,
          service: form.service,
          message: form.message,
        }),
      });

      if (!res.ok) throw new Error("Failed to book");
      
      setStep(3);
    } catch (error) {
      console.error("Booking failed:", error);
      alert("Booking failed. Please try again or contact us directly.");
    } finally {
      setLoading(false);
    }
  };

  const checkAvailability = async (date: string) => {
    setCheckingAvailability(true);
    setSelectedTime(null);
    try {
      const res = await fetch(`/api/bookings?date=${encodeURIComponent(date)}`);
      const data = await res.json();
      setBookedSlots(data.bookedSlots || []);
    } catch (error) {
      console.error("Failed to check availability:", error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const getGoogleCalendarLink = () => {
    if (!selectedDate || !selectedTime) return "";
    
    const dateMatch = selectedDate.match(/(\w+), (\w+) (\d+)/);
    if (!dateMatch) return "";
    
    const [, , monthName, dayNum] = dateMatch;
    const year = new Date().getFullYear();
    const monthMap: Record<string, string> = {
      'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
      'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
    };
    
    const month = monthMap[monthName.substring(0, 3)];
    const day = dayNum.padStart(2, '0');
    
    const timeMatch = selectedTime.match(/(\d+):(\d+) (\w+)/);
    if (!timeMatch) return "";
    
    const [, hour, minute, ampm] = timeMatch;
    let h = parseInt(hour);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    const startStr = `${year}${month}${day}T${h.toString().padStart(2, '0')}${minute}00Z`;
    
    let endH = h;
    let endM = parseInt(minute) + 30;
    if (endM >= 60) {
      endM -= 60;
      endH += 1;
    }
    const endStr = `${year}${month}${day}T${endH.toString().padStart(2, '0')}${endM.toString().padStart(2, '0')}00Z`;

    const text = encodeURIComponent("KoolTech Solutions - Live Platform Demo");
    const details = encodeURIComponent("30-minute live walkthrough of the KoolTech MSP platform.");
    const location = encodeURIComponent("Virtual Meeting Link (Sent via Email)");
    
    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  const getOutlookLink = () => {
    if (!selectedDate || !selectedTime) return "";
    
    const dateMatch = selectedDate.match(/(\w+), (\w+) (\d+)/);
    if (!dateMatch) return "";
    
    const [, , monthName, dayNum] = dateMatch;
    const year = new Date().getFullYear();
    const monthMap: Record<string, string> = {
      'Jan': '0', 'Feb': '1', 'Mar': '2', 'Apr': '3', 'May': '4', 'Jun': '5',
      'Jul': '6', 'Aug': '7', 'Sep': '8', 'Oct': '9', 'Nov': '10', 'Dec': '11'
    };
    
    const month = parseInt(monthMap[monthName.substring(0, 3)]);
    const day = parseInt(dayNum);
    
    const timeMatch = selectedTime.match(/(\d+):(\d+) (\w+)/);
    if (!timeMatch) return "";
    
    const [, hour, minute, ampm] = timeMatch;
    let h = parseInt(hour);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    
    const startDate = new Date(year, month, day, h, parseInt(minute));
    const isoStart = startDate.toISOString();
    
    const text = encodeURIComponent("KoolTech Solutions - Live Platform Demo");
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${text}&startdt=${isoStart}&enddt=${isoStart}`;
  };

  const generateDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      if (d.getDay() !== 0 && d.getDay() !== 6) {
        dates.push(d);
      }
    }
    return dates;
  };

  const dates = generateDates();
  const times = ["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM", "04:00 PM"];

  return (
    <div 
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
        zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem", animation: "fadeIn 0.2s ease"
      }}
    >
      <div className="glass-card" style={{
        width: "100%", maxWidth: "500px", borderRadius: "20px",
        overflow: "hidden", position: "relative",
        border: "1px solid rgba(0,212,255,0.2)"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,212,255,0.02)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0 }}>
            {step === 3 
              ? t("bookingServices.stepConfirmTitle") 
              : t("bookingServices.modalTitle")
            }
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "2rem" }}>
          {step === 1 && (
            <div>
              <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
                {language === "es" 
                  ? "Seleccione una fecha y hora conveniente para una demostración de la plataforma de 30 minutos con uno de nuestros ingenieros."
                  : "Select a convenient date and time for a 30-minute platform walkthrough with one of our engineers."
                }
              </p>
              
              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem" }}>
                  <Calendar size={16} color="var(--color-accent-500)" /> {t("bookingServices.selectDate")}
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                  {dates.map((d, i) => {
                    const dateStr = d.toLocaleDateString(language === "es" ? 'es-ES' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          checkAvailability(dateStr);
                        }}
                        style={{
                          padding: "0.8rem 1rem", borderRadius: "12px",
                          background: isSelected ? "var(--color-accent-500)" : "rgba(255,255,255,0.03)",
                          border: isSelected ? "1px solid var(--color-accent-400)" : "1px solid rgba(255,255,255,0.1)",
                          color: isSelected ? "#060B18" : "white",
                          fontSize: "0.875rem", fontWeight: 700, cursor: "pointer", transition: "all 0.2s"
                        }}
                      >
                        {d.toLocaleDateString(language === "es" ? 'es-ES' : 'en-US', { weekday: 'short', day: 'numeric' })}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div style={{ animation: "slideUp 0.3s ease", marginBottom: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 800, textTransform: "uppercase" }}>
                      <Clock size={14} /> {t("bookingServices.availableSlots")}
                    </label>
                    {checkingAvailability && <Loader2 size={12} className="animate-spin" color="var(--color-accent-500)" />}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                    {times.map(tVal => {
                      const isBooked = bookedSlots.includes(tVal);
                      return (
                        <button
                          key={tVal}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(tVal)}
                          style={{
                            padding: "0.6rem", borderRadius: "8px",
                            background: selectedTime === tVal ? "var(--color-accent-500)" : "rgba(255,255,255,0.05)",
                            border: selectedTime === tVal ? "1px solid var(--color-accent-400)" : "1px solid rgba(255,255,255,0.1)",
                            color: selectedTime === tVal ? "#060B18" : isBooked ? "rgba(255,255,255,0.1)" : "var(--color-neutral-300)",
                            fontSize: "0.8125rem", fontWeight: 600, cursor: isBooked ? "not-allowed" : "pointer", 
                            transition: "all 0.2s",
                            textDecoration: isBooked ? "line-through" : "none"
                          }}
                        >
                          {tVal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(2)}
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", padding: "0.875rem", marginTop: "1rem", opacity: (!selectedDate || !selectedTime) ? 0.5 : 1 }}
              >
                {language === "es" ? "Continuar" : "Continue"}
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleBook} style={{ animation: "slideUp 0.3s ease" }}>
              <div style={{ background: "rgba(0,212,255,0.05)", padding: "1rem", borderRadius: "8px", marginBottom: "1.5rem", border: "1px solid rgba(0,212,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>{t("bookingServices.selectedSlot")}</div>
                  <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{selectedDate} {t("bookingServices.at")} {selectedTime}</div>
                </div>
                <button type="button" onClick={() => setStep(1)} style={{ background: "none", border: "none", color: "var(--color-accent-500)", fontSize: "0.75rem", cursor: "pointer", fontWeight: 600 }}>{t("bookingServices.change")}</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.4rem" }}>
                    <User size={14} /> {t("bookingServices.fullName")}
                  </label>
                  <input required className="input-field" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.4rem" }}>
                    <Mail size={14} /> {t("bookingServices.workEmail")}
                  </label>
                  <input required type="email" className="input-field" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.4rem" }}>
                    <Phone size={14} /> {t("bookingServices.phone")}
                  </label>
                  <input required type="tel" className="input-field" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (829) 000-0000" />
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.4rem" }}>
                    <Briefcase size={14} /> {t("bookingServices.interestedIn")}
                  </label>
                  <select required className="input-field" value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                    <option value="">{t("bookingServices.placeholder")}</option>
                    <option value="Cybersecurity">{t("bookingServices.cybersecurity")}</option>
                    <option value="Cloud Services">{t("bookingServices.cloud")}</option>
                    <option value="Managed IT">{t("bookingServices.managedIt")}</option>
                    <option value="Help Desk Support">{t("bookingServices.helpdesk")}</option>
                    <option value="Network Management">{t("bookingServices.network")}</option>
                    <option value="IT Compliance">{t("bookingServices.compliance")}</option>
                    <option value="Custom Package">{t("bookingServices.custom")}</option>
                    <option value="Other">{t("bookingServices.other")}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginBottom: "0.4rem" }}>
                    <MessageSquare size={14} /> {t("bookingServices.briefMessage")}
                  </label>
                  <textarea className="input-field" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder={t("bookingServices.messagePlaceholder")} style={{ resize: "none" }} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.875rem", marginTop: "2rem" }}>
                {loading ? t("bookingServices.confirming") : t("bookingServices.confirmBooking")}
              </button>
            </form>
          )}

          {step === 3 && (
            <div style={{ textAlign: "center", padding: "2rem 0", animation: "slideUp 0.3s ease" }}>
              <CheckCircle size={64} color="var(--color-success)" style={{ margin: "0 auto 1.5rem" }} />
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem" }}>{t("bookingServices.successTitle")}</h3>
              <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                {language === "es" ? (
                  <>Su demo está confirmada para el <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong>. Se ha enviado un correo de confirmación a <strong>{form.email}</strong>.</>
                ) : (
                  <>Your demo is confirmed for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>. A confirmation email has been sent to <strong>{form.email}</strong>.</>
                )}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <a 
                  href={getGoogleCalendarLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-primary" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.875rem", gap: "0.5rem" }}
                >
                  <Calendar size={18} /> {t("bookingServices.addGoogle")}
                </a>
                <a 
                  href={getOutlookLink()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary" 
                  style={{ width: "100%", justifyContent: "center", padding: "0.875rem", gap: "0.5rem" }}
                >
                  <Calendar size={18} /> {t("bookingServices.syncOutlook")}
                </a>
                <button onClick={onClose} className="btn-ghost" style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}>
                  {t("bookingServices.done")}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
