"use client";
import React, { useState, useEffect } from "react";
import { FileText, Download, DollarSign, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PaymentModal from "@/components/shared/PaymentModal";

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  paid: { color: "#00E676", bg: "rgba(0,230,118,0.1)", label: "Paid", icon: CheckCircle },
  outstanding: { color: "#FFB300", bg: "rgba(255,179,0,0.1)", label: "Outstanding", icon: Clock },
  overdue: { color: "#FF4444", bg: "rgba(255,68,68,0.1)", label: "Overdue", icon: AlertCircle },
  draft: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Draft", icon: FileText },
  void: { color: "#6b7280", bg: "rgba(107,114,128,0.1)", label: "Void", icon: AlertCircle }
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  
  const supabase = createClient();

  useEffect(() => {
    fetchMyInvoices();
  }, []);

  async function fetchMyInvoices() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  }

  const handlePayNow = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (invoiceId: string) => {
    // Update local state first for instant feedback
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid', paid_date: new Date().toISOString() } : inv
    ));

    // Update database
    const { error } = await supabase
      .from('invoices')
      .update({ 
        status: 'paid', 
        paid_date: new Date().toISOString() 
      })
      .eq('id', invoiceId);

    if (error) console.error("Error updating invoice status:", error);
  };

  const handleDownloadPDF = (inv: any) => {
    // Basic simulation of a print/PDF export
    alert(`Generating PDF for invoice ${inv.invoice_number || inv.id.slice(0, 8)}...`);
    window.print();
  };

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  const outstanding = invoices.filter(i => i.status === "outstanding" || i.status === "overdue");
  const paid = invoices.filter(i => i.status === "paid");

  const totalOutstanding = outstanding.reduce((sum, inv) => sum + Number(inv.amount), 0);
  const totalPaid = paid.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Invoices & <span className="gradient-text">Billing</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Review and pay your Kool Tech Solutions invoices.
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: DollarSign, label: "Outstanding Balance", value: `$${totalOutstanding.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#FFB300" },
          { icon: CheckCircle, label: "Total Paid", value: `$${totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "#00E676" },
          { icon: FileText, label: "Total Invoices", value: invoices.length.toString(), color: "#00D4FF" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
              <kpi.icon size={20} color={kpi.color} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.75rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Outstanding */}
      {outstanding.length > 0 && (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1rem" }}>
            Outstanding Invoices
          </h2>
          {outstanding.map(inv => {
            const s = statusConfig[inv.status] || statusConfig.outstanding;
            const itemsList = inv.line_items ? (inv.line_items as any[]).map((i: any) => i.description).join(" · ") : "Standard Services";
            return (
              <div key={inv.id} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", marginBottom: "0.75rem", borderLeft: `4px solid ${s.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>{inv.invoice_number || inv.id.slice(0, 8)}</div>
                    <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>Due: {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : 'Upon receipt'}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem", marginTop: "0.375rem" }}>
                      {itemsList}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "white", fontSize: "1.25rem" }}>
                        ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: s.color, background: s.bg, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>
                        <s.icon size={11} /> {s.label}
                      </span>
                    </div>
                    <button 
                      onClick={() => handlePayNow(inv)}
                      className="btn-primary" 
                      style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}
                    >
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Invoice History */}
      <div className="kpi-card">
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>
          Invoice History
        </h2>
        {paid.length === 0 && <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>No invoice history found.</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {paid.map(inv => {
            const s = statusConfig[inv.status] || statusConfig.paid;
            return (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(75,132,200,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,230,118,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={16} color="#00E676" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{inv.invoice_number || inv.id.slice(0, 8)}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
                      {inv.issued_date ? new Date(inv.issued_date).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: s.color, background: s.bg, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>
                    <s.icon size={11} /> {s.label}
                  </span>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem", fontFamily: "JetBrains Mono, monospace" }}>
                    ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <button 
                    onClick={() => handleDownloadPDF(inv)}
                    style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "1px solid rgba(75,132,200,0.2)", borderRadius: "6px", color: "var(--color-neutral-400)", fontSize: "0.75rem", padding: "0.375rem 0.75rem", cursor: "pointer" }}
                  >
                    <Download size={13} /> PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        invoice={selectedInvoice}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
