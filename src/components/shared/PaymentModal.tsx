"use client";
import React, { useState } from "react";
import { X, CreditCard, ShieldCheck, Lock, CheckCircle, Loader2 } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: any;
  onSuccess: (invoiceId: string) => void;
}

export default function PaymentModal({ isOpen, onClose, invoice, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "apple">("card");

  if (!isOpen || !invoice) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setStep(2);
      onSuccess(invoice.id);
    }, 2000);
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center",
      padding: "1rem", animation: "fadeIn 0.2s ease"
    }}>
      <div className="glass-card" style={{
        width: "100%", maxWidth: "450px", borderRadius: "20px",
        overflow: "hidden", position: "relative",
        border: "1px solid rgba(0,212,255,0.2)",
        background: "linear-gradient(180deg, #0f2044 0%, #060d1d 100%)"
      }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.25rem", color: "white", margin: 0 }}>
            {step === 2 ? "Payment Success" : "Secure Payment"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: "2rem" }}>
          {step === 1 && (
            <form onSubmit={handlePayment}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Amount Due</div>
                <div style={{ color: "white", fontSize: "1.75rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>
                  ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ color: "var(--color-accent-500)", fontSize: "0.8125rem", marginTop: "0.25rem", fontWeight: 600 }}>
                  Invoice: {invoice.invoice_number || invoice.id.slice(0, 8)}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ color: "white", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.75rem", display: "block" }}>Payment Method</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    style={{
                      padding: "0.75rem", borderRadius: "10px", border: paymentMethod === "card" ? "1px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.1)",
                      background: paymentMethod === "card" ? "rgba(0,212,255,0.05)" : "transparent",
                      color: "white", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                    }}
                  >
                    <CreditCard size={18} /> Card
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("apple")}
                    style={{
                      padding: "0.75rem", borderRadius: "10px", border: paymentMethod === "apple" ? "1px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.1)",
                      background: paymentMethod === "apple" ? "rgba(0,212,255,0.05)" : "transparent",
                      color: "white", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                    }}
                  >
                    <div style={{ fontWeight: 700 }}> Pay</div>
                  </button>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem", animation: "slideUp 0.3s ease" }}>
                  <div>
                    <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>Card Number</label>
                    <div style={{ position: "relative" }}>
                      <input required className="input-field" placeholder="xxxx xxxx xxxx xxxx" maxLength={19} />
                      <CreditCard size={16} color="var(--color-neutral-500)" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div>
                      <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>Expiry Date</label>
                      <input required className="input-field" placeholder="MM/YY" maxLength={5} />
                    </div>
                    <div>
                      <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>CVC</label>
                      <div style={{ position: "relative" }}>
                        <input required className="input-field" placeholder="xxx" maxLength={3} />
                        <Lock size={14} color="var(--color-neutral-500)" style={{ position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)" }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "apple" && (
                <div style={{ padding: "2rem 0", textAlign: "center", animation: "slideUp 0.3s ease" }}>
                  <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Ready to pay with Apple Pay.</p>
                </div>
              )}

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "1rem", marginTop: "2rem", gap: "0.5rem" }}>
                {loading ? <Loader2 className="animate-spin" size={18} /> : <><ShieldCheck size={18} /> Pay Now</>}
              </button>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem", color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>
                <Lock size={12} /> SSL Encrypted & Secure
              </div>
            </form>
          )}

          {step === 2 && (
            <div style={{ textAlign: "center", padding: "2rem 0", animation: "slideUp 0.3s ease" }}>
              <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(0,230,118,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem" }}>
                <CheckCircle size={48} color="#00E676" />
              </div>
              <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.5rem", color: "white", marginBottom: "0.75rem" }}>Payment Complete</h3>
              <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "2rem" }}>
                Transaction successful. A receipt has been sent to your email. Your service status will update shortly.
              </p>
              <button onClick={onClose} className="btn-primary" style={{ width: "100%", justifyContent: "center", padding: "0.875rem" }}>
                Back to Invoices
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
