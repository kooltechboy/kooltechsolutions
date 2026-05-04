import type { Metadata } from "next";
import { Download, Search, FileText } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Invoices" };

const invoices = [
  { id: "INV-2024-089", client: "Acme Corporation", date: "May 01, 2026", amount: "$4,500.00", status: "Paid" },
  { id: "INV-2024-090", client: "TechStart Logistics", date: "May 01, 2026", amount: "$1,200.00", status: "Paid" },
  { id: "INV-2024-091", client: "Global Finance Group", date: "May 02, 2026", amount: "$8,900.00", status: "Pending" },
  { id: "INV-2024-092", client: "Hotel Del Mar", date: "Apr 15, 2026", amount: "$3,200.00", status: "Overdue" },
  { id: "INV-2024-093", client: "Apex Manufacturing", date: "May 03, 2026", amount: "$2,400.00", status: "Pending" },
];

export default function InvoicesPage() {
  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Billing & Invoices
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Track accounts receivable and generate billing statements.
        </p>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text" 
              placeholder="Search invoices by ID or Client..." 
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none" }}
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
              {invoices.map((inv) => (
                <tr key={inv.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-accent-600)", fontWeight: 600, fontSize: "0.875rem" }}>
                      <FileText size={16} /> {inv.id}
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 500, fontSize: "0.875rem" }}>{inv.client}</td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{inv.date}</td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{inv.amount}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: inv.status === "Paid" ? "rgba(0,230,118,0.1)" : inv.status === "Pending" ? "rgba(255,179,0,0.1)" : "rgba(255,68,68,0.1)",
                      color: inv.status === "Paid" ? "var(--color-success)" : inv.status === "Pending" ? "var(--color-warning)" : "var(--color-danger)"
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <button style={{ display: "flex", alignItems: "center", gap: "0.375rem", background: "none", border: "1px solid rgba(0,212,255,0.1)", padding: "0.375rem 0.75rem", borderRadius: "6px", cursor: "pointer", color: "var(--color-neutral-400)", fontSize: "0.75rem", fontWeight: 600 }}>
                      <Download size={14} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
