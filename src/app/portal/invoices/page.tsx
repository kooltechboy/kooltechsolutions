"use client";
import { useState } from "react";
import { FileText, Download, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

const mockInvoices = [
  { id: "INV-2026-0042", date: "May 1, 2026", due: "May 15, 2026", amount: "$2,340.00", status: "outstanding", items: ["Managed IT Pro (Monthly)", "Email Security Add-on", "Cloud Monitoring"] },
  { id: "INV-2026-0035", date: "Apr 1, 2026", due: "Apr 15, 2026", amount: "$2,340.00", status: "paid", items: ["Managed IT Pro (Monthly)", "Email Security Add-on", "Cloud Monitoring"] },
  { id: "INV-2026-0028", date: "Mar 1, 2026", due: "Mar 15, 2026", amount: "$2,190.00", status: "paid", items: ["Managed IT Pro (Monthly)", "Email Security Add-on"] },
  { id: "INV-2026-0021", date: "Feb 1, 2026", due: "Feb 15, 2026", amount: "$2,190.00", status: "paid", items: ["Managed IT Pro (Monthly)", "Email Security Add-on"] },
  { id: "INV-2025-0089", date: "Dec 1, 2025", due: "Dec 15, 2025", amount: "$2,190.00", status: "paid", items: ["Managed IT Pro (Monthly)", "Email Security Add-on"] },
];

const statusConfig: Record<string, { color: string; bg: string; label: string; icon: any }> = {
  paid: { color: "#00E676", bg: "rgba(0,230,118,0.1)", label: "Paid", icon: CheckCircle },
  outstanding: { color: "#FFB300", bg: "rgba(255,179,0,0.1)", label: "Outstanding", icon: Clock },
  overdue: { color: "#FF4444", bg: "rgba(255,68,68,0.1)", label: "Overdue", icon: AlertCircle },
};

export default function InvoicesPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const outstanding = mockInvoices.filter(i => i.status === "outstanding");
  const paid = mockInvoices.filter(i => i.status === "paid");

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
          { icon: DollarSign, label: "Outstanding Balance", value: "$2,340.00", color: "#FFB300" },
          { icon: CheckCircle, label: "Paid This Year", value: "$8,910.00", color: "#00E676" },
          { icon: FileText, label: "Total Invoices", value: mockInvoices.length.toString(), color: "#00D4FF" },
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
            const s = statusConfig[inv.status];
            return (
              <div key={inv.id} className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", marginBottom: "0.75rem", borderLeft: `4px solid ${s.color}` }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                  <div>
                    <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem" }}>{inv.id}</div>
                    <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>Due: {inv.due}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem", marginTop: "0.375rem" }}>
                      {inv.items.join(" · ")}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, color: "white", fontSize: "1.25rem" }}>{inv.amount}</div>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: s.color, background: s.bg, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>
                        <s.icon size={11} /> {s.label}
                      </span>
                    </div>
                    <button className="btn-primary" style={{ padding: "0.625rem 1.25rem", fontSize: "0.875rem" }}>
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
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {paid.map(inv => {
            const s = statusConfig[inv.status];
            return (
              <div key={inv.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid rgba(75,132,200,0.08)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                  <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,230,118,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FileText size={16} color="#00E676" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{inv.id}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{inv.date}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", color: s.color, background: s.bg, padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.72rem", fontWeight: 600 }}>
                    <s.icon size={11} /> {s.label}
                  </span>
                  <div style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem" }}>{inv.amount}</div>
                  <button style={{ display: "flex", alignItems: "center", gap: "0.3rem", background: "none", border: "1px solid rgba(75,132,200,0.2)", borderRadius: "6px", color: "var(--color-neutral-400)", fontSize: "0.75rem", padding: "0.375rem 0.75rem", cursor: "pointer" }}>
                    <Download size={13} /> PDF
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
