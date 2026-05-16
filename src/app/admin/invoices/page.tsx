"use client";
import React, { useEffect, useState } from "react";
import { Download, Search, FileText, Loader2, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchInvoices();
  }, []);

  async function fetchInvoices() {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, client:client_id(first_name, last_name, company_name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setInvoices(data);
    }
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Billing & Invoices
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Track accounts receivable and generate billing statements.
          </p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search invoices by ID or Client..." 
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none", background: "transparent", color: "white" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
             <button style={{ padding: "0.625rem 1rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", background: "rgba(10,22,40,0.8)", color: "white", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer" }}>
              Filter Status
            </button>
            <button className="btn-primary" style={{ padding: "0.625rem 1rem", borderRadius: "8px", fontSize: "0.8125rem" }}>
              Generate Report
            </button>
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Invoice ID", "Client", "Issue Date", "Amount", "Status", "Action"].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No invoices generated yet.
                  </td>
                </tr>
              ) : invoices.map((inv) => {
                const isPaid = inv.status.toLowerCase() === "paid";
                const isPending = inv.status.toLowerCase() === "outstanding" || inv.status.toLowerCase() === "draft";
                const clientName = inv.client?.company_name || `${inv.client?.first_name || ''} ${inv.client?.last_name || ''}`.trim() || 'Unknown Client';
                
                return (
                  <tr key={inv.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,255,0.03)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontWeight: 600, fontSize: "0.875rem" }}>
                        <FileText size={16} color="var(--color-accent-500)" /> {inv.invoice_number || inv.id.slice(0, 8)}
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-300)", fontWeight: 500, fontSize: "0.875rem" }}>
                      {clientName}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                      {inv.issued_date ? new Date(inv.issued_date).toLocaleDateString() : new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "JetBrains Mono, monospace" }}>
                      ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{
                        padding: "0.35rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                        background: isPaid ? "rgba(16,185,129,0.1)" : isPending ? "rgba(245,158,11,0.1)" : "rgba(239,68,68,0.1)",
                        color: isPaid ? "#10b981" : isPending ? "#f59e0b" : "#ef4444"
                      }}>
                        {inv.status}
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.2)", padding: "0.375rem 0.75rem", borderRadius: "6px", cursor: "pointer", color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 600 }}>
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
