"use client";
import React, { useEffect, useState } from "react";
import { Download, Search, FileText, Loader2, Plus, X, Trash2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ClientDetails {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface Invoice {
  id: string;
  invoice_number?: string;
  client?: ClientDetails | ClientDetails[] | null;
  issued_date?: string;
  created_at: string;
  amount: number;
  status: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unit_price: number;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [clients, setClients] = useState<ClientDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState({
    client_id: "",
    invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  });
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: "Managed IT Services", quantity: 1, unit_price: 150.0 },
  ]);

  const supabase = createClient();

  async function fetchInvoicesAndClients() {
    setLoading(true);
    // Fetch Invoices
    const { data: invData, error: invErr } = await supabase
      .from("invoices")
      .select("*, client:client_id(id, first_name, last_name, company_name)")
      .order("created_at", { ascending: false });

    if (!invErr && invData) {
      setInvoices(invData);
    }

    // Fetch Clients for Selector
    const { data: clientData, error: clientErr } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, company_name")
      .eq("role", "client");

    if (!clientErr && clientData) {
      setClients(clientData);
    }

    setLoading(false);
  }

  useEffect(() => {
    fetchInvoicesAndClients();
  }, []);

  const handleAddLineItem = () => {
    setLineItems([...lineItems, { description: "", quantity: 1, unit_price: 0.0 }]);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleLineItemChange = (index: number, field: keyof LineItem, value: any) => {
    const updated = [...lineItems];
    if (field === "description") {
      updated[index].description = value;
    } else {
      updated[index][field] = Number(value);
    }
    setLineItems(updated);
  };

  const totalAmount = lineItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id) {
      setError("Please select a client");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: totalAmount,
          line_items: lineItems,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create invoice");
      }

      setShowAddModal(false);
      setForm({
        client_id: "",
        invoice_number: `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "",
      });
      setLineItems([{ description: "Managed IT Services", quantity: 1, unit_price: 150.0 }]);
      fetchInvoicesAndClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const term = searchQuery.toLowerCase();
    const clientObj = Array.isArray(inv.client) ? inv.client[0] : inv.client;
    const clientName = (clientObj?.company_name || `${clientObj?.first_name || ""} ${clientObj?.last_name || ""}`).toLowerCase();
    const matchesSearch = inv.invoice_number?.toLowerCase().includes(term) || clientName.includes(term);
    const matchesStatus = filterStatus === "All" || inv.status.toLowerCase() === filterStatus.toLowerCase();
    return matchesSearch && matchesStatus;
  });

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
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "8px" }}
        >
          <Plus size={16} /> Create Invoice
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", gap: "1rem", justifyContent: "space-between", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px", minWidth: "250px" }}>
            <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search invoices by ID or Client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none", background: "transparent", color: "white" }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {["All", "Outstanding", "Paid", "Overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                style={{
                  padding: "0.625rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid rgba(0,212,255,0.1)",
                  background: filterStatus === status ? "var(--color-accent-500)" : "rgba(10,22,40,0.8)",
                  color: filterStatus === status ? "var(--color-neutral-900)" : "white",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Invoice ID", "Client", "Issue Date", "Amount", "Status", "Action"].map((h) => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.status.toLowerCase() === "paid";
                  const isPending = inv.status.toLowerCase() === "outstanding" || inv.status.toLowerCase() === "draft";
                  const clientObj = Array.isArray(inv.client) ? inv.client[0] : inv.client;
                  const clientName = clientObj?.company_name || `${clientObj?.first_name || ""} ${clientObj?.last_name || ""}`.trim() || "Unknown Client";

                  return (
                    <tr
                      key={inv.id}
                      style={{ borderBottom: "1px solid rgba(0,212,255,0.05)", transition: "background 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(0,212,255,0.03)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
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
                          color: isPaid ? "#10b981" : isPending ? "#f59e0b" : "#ef4444",
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "90%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", position: "relative" }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "1.5rem" }}>Create New Invoice</h2>

            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleCreateInvoice} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Select Client *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                >
                  <option value="" style={{ background: "#0A1628" }}>-- Select Client --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id} style={{ background: "#0A1628" }}>
                      {c.company_name || `${c.first_name || ""} ${c.last_name || ""}`}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Invoice Number *</label>
                  <input
                    required
                    type="text"
                    value={form.invoice_number}
                    onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Due Date *</label>
                  <input
                    required
                    type="date"
                    value={form.due_date}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <label style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    style={{ background: "none", border: "none", color: "var(--color-accent-500)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.25rem" }}
                  >
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {lineItems.map((item, idx) => (
                    <div key={idx} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        required
                        type="text"
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => handleLineItemChange(idx, "description", e.target.value)}
                        style={{ flex: 2, padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.875rem" }}
                      />
                      <input
                        required
                        type="number"
                        placeholder="Qty"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleLineItemChange(idx, "quantity", e.target.value)}
                        style={{ width: "60px", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.875rem" }}
                      />
                      <input
                        required
                        type="number"
                        placeholder="Price"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleLineItemChange(idx, "unit_price", e.target.value)}
                        style={{ width: "90px", padding: "0.5rem", borderRadius: "6px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.875rem" }}
                      />
                      {lineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(idx)}
                          style={{ background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem 0", borderTop: "1px solid rgba(255,255,255,0.05)", marginTop: "0.5rem" }}>
                <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Total Amount:</span>
                <span style={{ color: "white", fontSize: "1.25rem", fontWeight: 800 }}>${totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Notes (Optional)</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", resize: "none" }}
                  rows={2}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: "100%", padding: "0.875rem", borderRadius: "8px", marginTop: "1rem", fontWeight: 700 }}
              >
                {submitting ? "Creating..." : "Create Invoice"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
