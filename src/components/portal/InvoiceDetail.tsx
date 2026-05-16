"use client";
import { X, Download, Printer, CreditCard, Building2, MapPin, Mail, Phone, Calendar, Clock } from "lucide-react";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  });
};

interface InvoiceDetailProps {
  invoice: any;
  onClose: () => void;
  onPay: () => void;
}

export default function InvoiceDetail({ invoice, onClose, onPay }: InvoiceDetailProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const lineItems = invoice.line_items || [];
  const subtotal = lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.price), 0);
  const tax = subtotal * 0.18; // 18% ITBIS (DR)
  const total = subtotal + tax;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-white/10 bg-[#0A1628] shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
        {/* Header Actions */}
        <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              invoice.status === 'paid' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
              invoice.status === 'overdue' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
            }`}>
              {invoice.status}
            </span>
            <h2 className="text-white font-semibold text-sm">Invoice {invoice.invoice_number}</h2>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              title="Print Invoice"
            >
              <Printer size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Invoice Body */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 scrollbar-hide">
          <div id="invoice-printable" className="bg-white text-[#0A1628] p-8 sm:p-12 rounded-xl shadow-lg min-h-[800px] flex flex-col">
            {/* Logo & Header */}
            <div className="flex justify-between items-start mb-12">
              <div>
                <div className="text-2xl font-black tracking-tighter text-[#00D4FF] mb-4 flex items-center gap-2">
                  KOOLTECH <span className="text-[#0A1628]">SOLUTIONS</span>
                </div>
                <div className="text-xs text-neutral-500 space-y-1">
                  <p className="flex items-center gap-2"><MapPin size={12} /> Av. Winston Churchill, Santo Domingo, DR</p>
                  <p className="flex items-center gap-2"><Phone size={12} /> +1 (809) 555-0123</p>
                  <p className="flex items-center gap-2"><Mail size={12} /> billing@ktsolutions.com</p>
                </div>
              </div>
              <div className="text-right">
                <h1 className="text-4xl font-bold uppercase tracking-tight mb-2">Invoice</h1>
                <p className="text-sm font-semibold text-neutral-400">#{invoice.invoice_number}</p>
                <div className="mt-4 space-y-1">
                  <p className="text-xs text-neutral-500">Issued: {formatDate(invoice.issue_date)}</p>
                  <p className="text-xs text-neutral-500">Due: {formatDate(invoice.due_date)}</p>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="mb-12 grid grid-cols-2 gap-8">
              <div>
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Bill To</div>
                <div className="text-sm font-bold text-[#0A1628] mb-1">{invoice.client_name || 'Client Name'}</div>
                <div className="text-xs text-neutral-500 space-y-1">
                  <p>Client ID: {invoice.client_id?.substring(0, 8)}</p>
                  <p>Project: Enterprise Managed Support</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Amount Due</div>
                <div className="text-3xl font-black text-[#0A1628]">${invoice.amount.toLocaleString()}</div>
                <div className="text-[10px] text-neutral-400 mt-1 uppercase">Currency: USD</div>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b-2 border-[#0A1628] text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                    <th className="pb-4">Description</th>
                    <th className="pb-4 text-center">Qty</th>
                    <th className="pb-4 text-right">Price</th>
                    <th className="pb-4 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {lineItems.length > 0 ? lineItems.map((item: any, idx: number) => (
                    <tr key={idx} className="text-sm">
                      <td className="py-6 font-medium">{item.description}</td>
                      <td className="py-6 text-center">{item.quantity}</td>
                      <td className="py-6 text-right">${item.price.toLocaleString()}</td>
                      <td className="py-6 text-right font-bold">${(item.quantity * item.price).toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr className="text-sm">
                      <td className="py-6 font-medium">Standard Managed Services</td>
                      <td className="py-6 text-center">1</td>
                      <td className="py-6 text-right">${invoice.amount.toLocaleString()}</td>
                      <td className="py-6 text-right font-bold">${invoice.amount.toLocaleString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="mt-12 pt-8 border-t border-neutral-100 flex justify-end">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="font-semibold">${(subtotal || invoice.amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500">Tax (ITBIS 18%)</span>
                  <span className="font-semibold">${(tax || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[#0A1628]">
                  <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                  <span className="text-xl font-black text-[#0A1628]">${(total || invoice.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-12 text-center text-[10px] text-neutral-400 uppercase tracking-widest">
              Thank you for choosing KoolTech Solutions. Payment is due within 30 days.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-white/5 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-neutral-400 font-semibold hover:text-white transition-colors"
          >
            Close Viewer
          </button>
          {invoice.status !== 'paid' && (
            <button 
              onClick={onPay}
              className="bg-[#00D4FF] text-[#0A1628] px-8 py-2.5 rounded-xl font-bold hover:bg-[#00D4FF]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#00D4FF]/20"
            >
              <CreditCard size={18} /> Pay Now
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-printable, #invoice-printable * {
            visibility: visible;
          }
          #invoice-printable {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 0;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
