"use client";
import React, { useEffect, useState } from 'react';
import { Building2, Search, Plus, MoreHorizontal, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

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
  const supabase = createClient();

  useEffect(() => {
    async function fetchClients() {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client')
        .order('created_at', { ascending: false });
      
      if (!error && data) {
        setClients(data);
      }
      setLoading(false);
    }
    fetchClients();
  }, [supabase]);

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
        <button className="btn-primary" style={{ padding: "0.75rem 1.25rem", borderRadius: "8px" }}>
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
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Client / Company", "Contact Info", "Role", "Status", "Joined", ""].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                    No clients found in the database.
                  </td>
                </tr>
              ) : clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={16} color="var(--color-accent-500)" />
                      </div>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{client.first_name} {client.last_name}</div>
                        <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{client.company_name || 'Individual'}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
                    <div>{client.email || 'No Email'}</div>
                    <div style={{ fontSize: "0.75rem" }}>{client.phone || 'No Phone'}</div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem", textTransform: "capitalize" }}>{client.role}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: "rgba(0,230,118,0.1)",
                      color: "var(--color-success)"
                    }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{new Date(client.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "1.25rem 1.5rem", textAlign: "right" }}>
                    <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-neutral-400)" }}>
                      <MoreHorizontal size={18} />
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

