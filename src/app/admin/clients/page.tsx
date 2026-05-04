import type { Metadata } from "next";
import { Building2, Search, Plus, MoreHorizontal } from "lucide-react";

export const metadata: Metadata = { title: "Admin — Clients" };

const clients = [
  { id: "CL-001", name: "Acme Corporation", plan: "Enterprise Premium", mrr: "$4,500", status: "Active", since: "2023-01-15" },
  { id: "CL-002", name: "TechStart Logistics", plan: "Business Standard", mrr: "$1,200", status: "Active", since: "2023-04-22" },
  { id: "CL-003", name: "Global Finance Group", plan: "Enterprise Premium", mrr: "$8,900", status: "Active", since: "2022-11-05" },
  { id: "CL-004", name: "Hotel Del Mar", plan: "Hospitality IT", mrr: "$3,200", status: "At Risk", since: "2024-02-10" },
  { id: "CL-005", name: "Apex Manufacturing", plan: "Business Plus", mrr: "$2,400", status: "Active", since: "2023-08-30" },
];

export default function ClientsPage() {
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
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.5rem", borderRadius: "8px", border: "1px solid rgba(0,212,255,0.1)", fontSize: "0.875rem", outline: "none" }}
            />
          </div>
        </div>
        
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
                {["Client Name", "Service Plan", "MRR", "Status", "Client Since", ""].map(h => (
                  <th key={h} style={{ padding: "0.875rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", textAlign: "left", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} style={{ borderBottom: "1px solid rgba(0,212,255,0.05)" }}>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "8px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Building2 size={16} color="var(--color-neutral-500)" />
                      </div>
                      <div>
                        <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{client.name}</div>
                        <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>{client.id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>{client.plan}</td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{client.mrr}</td>
                  <td style={{ padding: "1.25rem 1.5rem" }}>
                    <span style={{
                      padding: "0.25rem 0.625rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 600,
                      background: client.status === "Active" ? "rgba(0,230,118,0.1)" : "rgba(255,68,68,0.1)",
                      color: client.status === "Active" ? "var(--color-success)" : "var(--color-danger)"
                    }}>
                      {client.status}
                    </span>
                  </td>
                  <td style={{ padding: "1.25rem 1.5rem", color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>{client.since}</td>
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
