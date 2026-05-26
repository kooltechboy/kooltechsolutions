"use client";
import React, { useEffect, useState } from "react";
import { Building2, Search, Plus, Trash2, X, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ClientProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  created_at: string;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form fields
  const [form, setForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    company_name: "",
    phone: "",
  });

  const supabase = createClient();

  async function fetchClients() {
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "client")
      .order("created_at", { ascending: false });

    if (!fetchError && data) {
      setClients(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchClients();
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create client");
      }

      setShowAddModal(false);
      setForm({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        company_name: "",
        phone: "",
      });
      fetchClients();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;

    try {
      const res = await fetch(`/api/admin/clients?id=${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete client");
      }

      fetchClients();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete client");
    }
  };

  const filteredClients = clients.filter((c) => {
    const term = searchQuery.toLowerCase();
    return (
      (c.first_name || "").toLowerCase().includes(term) ||
      (c.last_name || "").toLowerCase().includes(term) ||
      (c.company_name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
            Client Directory
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Manage client profiles, contracts, and service health.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary"
          style={{ padding: "0.75rem 1.25rem", borderRadius: "8px", display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <Plus size={18} /> Add Client
        </button>
      </div>

      <div className="glass-card" style={{ borderRadius: "12px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={16} color="var(--color-neutral-400)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.625rem 1rem 0.625rem 2.5rem",
                borderRadius: "8px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "white",
                fontSize: "0.875rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Client / Company", "Contact Info", "Role", "Status", "Joined", "Actions"].map((h) => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No clients found in the database.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Building2 size={16} color="var(--color-accent-500)" />
                        </div>
                        <div>
                          <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{client.first_name} {client.last_name}</div>
                          <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{client.company_name || "Individual"}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                      <div>{client.email || "No Email"}</div>
                      <div style={{ fontSize: "0.75rem" }}>{client.phone || "No Phone"}</div>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem", textTransform: "capitalize" }}>{client.role}</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <span style={{
                        padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                        background: "rgba(0,230,118,0.1)",
                        color: "var(--color-success)",
                      }}>
                        Active
                      </span>
                    </td>
                    <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{new Date(client.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: "1.25rem 1.5rem" }}>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#EF4444", display: "flex", alignItems: "center", gap: "0.25rem" }}
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "90%", maxWidth: "500px", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", position: "relative" }}>
            <button
              onClick={() => setShowAddModal(false)}
              style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "1.5rem" }}>Add New Client</h2>

            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAddClient} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Email Address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Temporary Password *</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>First Name</label>
                  <input
                    type="text"
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Company Name</label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary"
                style={{ width: "100%", padding: "0.875rem", borderRadius: "8px", marginTop: "1rem", fontWeight: 700 }}
              >
                {submitting ? "Creating..." : "Create Client Account"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
