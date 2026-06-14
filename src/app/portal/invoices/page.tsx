"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Download, 
  CreditCard, 
  Eye, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PaymentModal from "@/components/shared/PaymentModal";
import InvoiceDetail from "@/components/portal/InvoiceDetail";

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  status: string;
  issue_date: string;
  due_date: string;
  stripe_payment_intent_id?: string;
  client_id?: string;
}

const getStatusBadgeStyle = (status: string) => {
  switch (status) {
    case 'paid':
      return {
        bg: 'rgba(16, 185, 129, 0.1)',
        color: '#10b981',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        icon: <CheckCircle2 size={12} />
      };
    case 'outstanding':
      return {
        bg: 'rgba(59, 130, 246, 0.1)',
        color: '#3b82f6',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        icon: <Clock size={12} />
      };
    case 'overdue':
      return {
        bg: 'rgba(239, 68, 68, 0.1)',
        color: '#ef4444',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        icon: <AlertCircle size={12} />
      };
    default:
      return {
        bg: 'rgba(107, 114, 128, 0.1)',
        color: '#6b7280',
        border: '1px solid rgba(107, 114, 128, 0.2)',
        icon: <AlertCircle size={12} />
      };
  }
};

export default function InvoicesPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/invoices") {
      router.replace("/portal?view=invoices");
    }
  }, [router]);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const supabase = createClient();

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', user.id)
      .order('issue_date', { ascending: false });

    if (!error && data) {
      setInvoices(data as Invoice[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchInvoices]);

  const handlePaymentSuccess = async () => {
    if (selectedInvoice) {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', selectedInvoice.id);

      if (!error) {
        fetchInvoices();
        setShowPayment(false);
        setShowDetail(false);
      }
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoice_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         inv.status?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || inv.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: invoices.reduce((acc, inv) => acc + (inv.amount || 0), 0),
    outstanding: invoices.filter(inv => inv.status !== 'paid').reduce((acc, inv) => acc + (inv.amount || 0), 0),
    paid: invoices.filter(inv => inv.status === 'paid').length,
    pending: invoices.filter(inv => inv.status === 'outstanding').length
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Styles */}
      <style>{`
        .invoices-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .invoices-header-left {
          flex: 1;
        }
        .invoices-kpi {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(8px);
        }
        .invoices-filter-row {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          align-items: center;
        }
        .invoices-search {
          position: relative;
          flex: 1;
          min-width: 250px;
        }
        .invoices-search input {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 0.75rem 1rem 0.75rem 2.75rem;
          color: white;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s;
        }
        .invoices-search input:focus {
          border-color: rgba(0, 212, 255, 0.5);
          box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
        }
        .invoices-tabs {
          display: flex;
          gap: 0.5rem;
          overflow-x: auto;
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none;  /* IE 10+ */
        }
        .invoices-tabs::-webkit-scrollbar {
          display: none; /* Safari and Chrome */
        }
        .invoices-tab-btn {
          padding: 0.625rem 1.125rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          color: var(--color-neutral-400);
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .invoices-tab-btn:hover {
          border-color: rgba(255, 255, 255, 0.2);
          color: white;
        }
        .invoices-tab-btn.active {
          background: #00D4FF;
          color: #0A1628;
          border-color: #00D4FF;
        }
        .desktop-table-view {
          display: block;
        }
        .mobile-cards-view {
          display: none;
        }
        .invoice-card {
          background: rgba(10, 22, 40, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.25rem;
          margin-bottom: 1rem;
        }
        .invoice-card:hover {
          border-color: rgba(0, 212, 255, 0.2);
        }
        .cta-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.08) 0%, rgba(10, 22, 40, 0.4) 100%);
          border: 1px solid rgba(0, 212, 255, 0.15);
          margin-top: 2rem;
        }
        
        @media (max-width: 768px) {
          .invoices-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .invoices-kpi {
            align-self: flex-start;
            width: 100%;
            box-sizing: border-box;
          }
          .invoices-filter-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .invoices-search {
            width: 100%;
          }
          .desktop-table-view {
            display: none !important;
          }
          .mobile-cards-view {
            display: flex !important;
            flex-direction: column;
            gap: 0.5rem;
          }
          .cta-banner {
            flex-direction: column;
            align-items: stretch;
            text-align: center;
            padding: 1.5rem;
          }
          .cta-banner button {
            width: 100%;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="invoices-header">
        <div className="invoices-header-left">
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Invoices <span className="text-[#00D4FF]">&</span> Billing
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Manage your service subscriptions, view payment history, and settle outstanding balances securely.
          </p>
        </div>
        
        <div className="invoices-kpi">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <div style={{ fontSize: "10px", fontWeight: "bold", color: "var(--color-neutral-500)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2px" }}>Total Outstanding</div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "white" }}>${stats.outstanding.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="invoices-filter-row">
        <div className="invoices-search">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text"
            placeholder="Search by invoice # or status..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="invoices-tabs">
          {["all", "outstanding", "paid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`invoices-tab-btn ${filterStatus === status ? "active" : ""}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="desktop-table-view glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-6 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Issue Date</th>
                <th className="px-6 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-5 text-[10px] font-bold text-neutral-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
                      <span className="text-neutral-500 text-sm font-medium">Retrieving financial records...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const badge = getStatusBadgeStyle(inv.status);
                  return (
                    <tr key={inv.id} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm tracking-tight">{inv.invoice_number}</span>
                          <span className="text-neutral-500 text-[10px] uppercase font-bold tracking-wider mt-1 flex items-center gap-1">
                            <ExternalLink size={10} /> {inv.id.substring(0, 8)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-neutral-300 text-sm">
                          <Clock size={14} className="text-neutral-500" />
                          {new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-white font-black text-lg">${inv.amount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div 
                          style={{
                            background: badge.bg,
                            color: badge.color,
                            border: badge.border
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest"
                        >
                          {badge.icon}
                          <span style={{ marginLeft: "0.25rem" }}>{inv.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setShowDetail(true);
                            }}
                            className="p-2 text-neutral-400 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/10"
                            title="View Detail"
                            style={{ cursor: "pointer" }}
                          >
                            <Eye size={16} />
                          </button>
                          {inv.status !== 'paid' && (
                            <button 
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setShowPayment(true);
                              }}
                              className="bg-[#00D4FF] text-[#0A1628] p-2 rounded-lg hover:bg-[#00D4FF]/90 transition-all shadow-lg shadow-[#00D4FF]/10"
                              title="Pay Now"
                              style={{ cursor: "pointer" }}
                            >
                              <CreditCard size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-neutral-600">
                        <AlertCircle size={32} />
                      </div>
                      <div>
                        <p className="text-white font-bold">No invoices found</p>
                        <p className="text-neutral-500 text-sm mt-1">Try adjusting your search or filters.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="mobile-cards-view">
        {loading ? (
          <div style={{ padding: "4rem 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <div className="w-8 h-8 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" />
            <span className="text-neutral-500 text-sm font-medium">Retrieving financial records...</span>
          </div>
        ) : filteredInvoices.length > 0 ? (
          filteredInvoices.map((inv) => {
            const badge = getStatusBadgeStyle(inv.status);
            return (
              <div key={inv.id} className="invoice-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ color: "white", fontWeight: "bold", fontSize: "0.9375rem" }}>{inv.invoice_number}</span>
                    <span style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                      <ExternalLink size={10} /> {inv.id.substring(0, 8)}
                    </span>
                  </div>
                  <div 
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      border: badge.border,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      padding: "0.25rem 0.625rem",
                      borderRadius: "999px",
                      fontSize: "0.6875rem",
                      fontWeight: 900,
                      textTransform: "uppercase",
                      letterSpacing: "0.05em"
                    }}
                  >
                    {badge.icon}
                    <span>{inv.status}</span>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1.25rem" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <span style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em" }}>Issue Date</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "var(--color-neutral-300)", fontSize: "0.8125rem" }}>
                      <Clock size={12} style={{ color: "var(--color-neutral-500)" }} />
                      {new Date(inv.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span style={{ color: "white", fontWeight: 900, fontSize: "1.375rem" }}>
                      ${inv.amount?.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => {
                      setSelectedInvoice(inv);
                      setShowDetail(true);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.625rem",
                      borderRadius: "10px",
                      background: "rgba(255, 255, 255, 0.05)",
                      border: "1px solid rgba(255, 255, 255, 0.1)",
                      color: "white",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.35rem",
                      transition: "all 0.2s"
                    }}
                  >
                    <Eye size={14} />
                    View Details
                  </button>
                  {inv.status !== 'paid' && (
                    <button
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setShowPayment(true);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.625rem",
                        borderRadius: "10px",
                        background: "#00D4FF",
                        border: "none",
                        color: "#0A1628",
                        fontSize: "0.8125rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.35rem",
                        transition: "all 0.2s"
                      }}
                    >
                      <CreditCard size={14} />
                      Pay Now
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="glass-card" style={{ padding: "3rem 1.5rem", borderRadius: "24px", textAlign: "center" }}>
            <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "50%", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem", color: "var(--color-neutral-500)" }}>
              <AlertCircle size={24} />
            </div>
            <h4 style={{ color: "white", fontWeight: "bold", fontSize: "0.9375rem" }}>No invoices found</h4>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Support CTA */}
      <div className="cta-banner">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }} className="cta-banner-left">
          <div style={{ width: "3rem", height: "3rem", borderRadius: "16px", background: "rgba(0, 212, 255, 0.15)", border: "1px solid rgba(0, 212, 255, 0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00D4FF" }}>
            <CheckCircle2 size={22} />
          </div>
          <div style={{ textAlign: "left" }}>
            <h3 style={{ color: "white", fontWeight: "bold", fontSize: "1rem", margin: 0 }}>Billing Support</h3>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", margin: "0.25rem 0 0" }}>
              Have a question about your statement? Our financial team is here to help.
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            window.location.href = "/portal/tickets";
          }}
          style={{
            whiteSpace: "nowrap",
            padding: "0.75rem 1.5rem",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "16px",
            color: "white",
            fontWeight: "bold",
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
        >
          Open Billing Ticket
        </button>
      </div>

      {/* Modals */}
      {showDetail && selectedInvoice && (
        <InvoiceDetail 
          invoice={selectedInvoice} 
          onClose={() => setShowDetail(false)} 
          onPay={() => {
            setShowDetail(false);
            setShowPayment(true);
          }}
        />
      )}

      {showPayment && selectedInvoice && (
        <PaymentModal 
          isOpen={showPayment} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess}
          invoice={selectedInvoice}
        />
      )}
    </div>
  );
}
