"use client";
import { useEffect, useState } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  CreditCard, 
  Eye, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import PaymentModal from "@/components/shared/PaymentModal";
import InvoiceDetail from "@/components/portal/InvoiceDetail";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  
  const supabase = createClient();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('client_id', user.id)
      .order('issue_date', { ascending: false });

    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  };

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

  const statusConfig: any = {
    paid: { color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20", icon: CheckCircle2 },
    outstanding: { color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", icon: Clock },
    overdue: { color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", icon: AlertCircle },
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Invoices <span className="text-[#00D4FF]">&</span> Billing
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Manage your service subscriptions, view payment history, and settle outstanding balances securely.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
            <div>
              <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Total Outstanding</div>
              <div className="text-xl font-black text-white">${stats.outstanding.toLocaleString()}</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
          <input 
            type="text"
            placeholder="Search by invoice # or status..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 focus:border-[#00D4FF]/40 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["all", "outstanding", "paid", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                filterStatus === status 
                  ? "bg-[#00D4FF] text-[#0A1628] border-[#00D4FF]" 
                  : "bg-white/5 text-neutral-400 border-white/10 hover:border-white/20"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Invoices Table/Grid */}
      <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
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
                  const StatusIcon = statusConfig[inv.status]?.icon || AlertCircle;
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
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusConfig[inv.status]?.bg} ${statusConfig[inv.status]?.color} ${statusConfig[inv.status]?.border}`}>
                          <StatusIcon size={12} />
                          {inv.status}
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

      {/* Support CTA */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#00D4FF]/10 to-transparent border border-[#00D4FF]/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/30 shadow-inner">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Billing Support</h3>
            <p className="text-neutral-400 text-sm">Have a question about your statement? Our financial team is here to help.</p>
          </div>
        </div>
        <button className="whitespace-nowrap px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10">
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
