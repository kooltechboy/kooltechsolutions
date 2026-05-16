"use client";
import React, { useState } from "react";
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, Loader2, Apple } from "lucide-react";

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
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-[#0A1628] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
          <h2 className="text-white font-bold text-lg font-syne tracking-tight">
            {step === 2 ? "Payment Confirmed" : "Secure Payment"}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {step === 1 && (
            <form onSubmit={handlePayment} className="space-y-6">
              {/* Summary Card */}
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-inner">
                <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Amount to Settle</div>
                <div className="text-3xl font-black text-white font-syne">
                  ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-[#00D4FF] mt-2 font-bold uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#00D4FF]" />
                  Invoice {invoice.invoice_number || invoice.id.slice(0, 8)}
                </div>
              </div>

              {/* Method Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest block px-1">Choose Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${
                      paymentMethod === "card" 
                        ? "bg-[#00D4FF] text-[#0A1628] border-[#00D4FF]" 
                        : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <CreditCard size={18} /> Card
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod("apple")}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl font-bold text-sm transition-all border ${
                      paymentMethod === "apple" 
                        ? "bg-[#00D4FF] text-[#0A1628] border-[#00D4FF]" 
                        : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/20"
                    }`}
                  >
                    <Apple size={18} /> Pay
                  </button>
                </div>
              </div>

              {/* Card Inputs */}
              {paymentMethod === "card" && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Card Number</label>
                    <div className="relative">
                      <input 
                        required 
                        placeholder="0000 0000 0000 0000" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/40 transition-all text-sm font-mono"
                        maxLength={19} 
                      />
                      <CreditCard size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">Expiry</label>
                      <input 
                        required 
                        placeholder="MM/YY" 
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/40 transition-all text-sm font-mono"
                        maxLength={5} 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest px-1">CVC</label>
                      <div className="relative">
                        <input 
                          required 
                          placeholder="000" 
                          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder:text-neutral-700 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/40 transition-all text-sm font-mono"
                          maxLength={3} 
                        />
                        <Lock size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-600" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "apple" && (
                <div className="py-8 text-center animate-in slide-in-from-bottom-2 duration-300">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 border border-white/10">
                    <Apple size={32} className="text-white" />
                  </div>
                  <p className="text-neutral-400 text-sm">Ready to authenticate with Apple Pay</p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 rounded-2xl bg-[#00D4FF] text-[#0A1628] font-bold text-sm hover:bg-[#00D4FF]/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00D4FF]/20 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><ShieldCheck size={20} /> Authorize Payment</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-neutral-500 font-bold uppercase tracking-[0.2em]">
                <Lock size={12} className="text-[#00D4FF]" /> 256-Bit AES Encryption
              </div>
            </form>
          )}

          {step === 2 && (
            <div className="text-center py-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6 border border-green-500/20 shadow-lg shadow-green-500/5">
                <CheckCircle2 size={40} className="text-green-400" />
              </div>
              <h3 className="text-2xl font-black text-white font-syne mb-2 uppercase tracking-tight">Success!</h3>
              <p className="text-neutral-400 text-sm leading-relaxed mb-8">
                Your payment has been processed and your account status will be updated momentarily. A digital receipt is on its way to your inbox.
              </p>
              <button 
                onClick={onClose} 
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all border border-white/10"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
