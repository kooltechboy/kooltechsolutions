import React from 'react';
import { Search, Filter, MoreVertical, CheckCircle2, Clock, AlertCircle, MessageSquare } from 'lucide-react';

const MOCK_TICKETS = [
  { id: 'TKT-1042', subject: 'Exchange Server Migration Issue', client: 'Oceania Imports', status: 'critical', updated: '10 mins ago', assignee: 'Kira' },
  { id: 'TKT-1041', subject: 'New Employee Onboarding Setup', client: 'Nova Therapeutics', status: 'open', updated: '2 hours ago', assignee: 'Unassigned' },
  { id: 'TKT-1040', subject: 'Firewall Rule Adjustment', client: 'Apex Financial', status: 'in_progress', updated: '4 hours ago', assignee: 'Max' },
  { id: 'TKT-1039', subject: 'VPN Access Denied', client: 'Stellar Logistics', status: 'resolved', updated: '1 day ago', assignee: 'Kira' },
];

const getStatusColor = (status: string) => {
  switch(status) {
    case 'critical': return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', icon: <AlertCircle size={14} /> };
    case 'open': return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', icon: <MessageSquare size={14} /> };
    case 'in_progress': return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: <Clock size={14} /> };
    case 'resolved': return { bg: 'rgba(16,185,129,0.1)', text: '#10b981', icon: <CheckCircle2 size={14} /> };
    default: return { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', icon: <MessageSquare size={14} /> };
  }
};

export default function AdminTicketsPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--color-primary-900)", fontFamily: "Syne, sans-serif" }}>HelpDesk Command Center</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Manage, assign, and resolve active client support requests.</p>
        </div>
        <button className="btn-primary">Create Ticket</button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Open Tickets", value: "24", trend: "+3 today" },
          { label: "Avg Resolution Time", value: "1.4 hrs", trend: "-12% this week" },
          { label: "Critical Issues", value: "1", trend: "Needs immediate action", alert: true },
          { label: "SLA Compliance", value: "99.2%", trend: "Target: 99.0%" }
        ].map((metric, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderLeft: metric.alert ? "4px solid #ef4444" : "4px solid var(--color-accent-500)" }}>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{metric.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "var(--color-primary-900)", margin: "0.5rem 0" }}>{metric.value}</div>
            <div style={{ color: metric.alert ? "#ef4444" : "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 500 }}>{metric.trend}</div>
          </div>
        ))}
      </div>

      {/* Tickets Table Area */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", borderBottom: "1px solid var(--color-neutral-200)", background: "#fafafa" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-400)" }} />
            <input 
              type="text" 
              placeholder="Search tickets by ID, subject, or client..." 
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.75rem", borderRadius: "8px", border: "1px solid var(--color-neutral-300)", outline: "none", fontSize: "0.875rem" }}
            />
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1rem", borderRadius: "8px", border: "1px solid var(--color-neutral-300)", background: "white", color: "var(--color-primary-900)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}>
            <Filter size={16} /> Filter
          </button>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(240, 244, 248, 0.5)", borderBottom: "1px solid var(--color-neutral-200)" }}>
            <tr>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Ticket ID / Subject</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Client</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Assignee</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Last Updated</th>
              <th style={{ padding: "1rem 1.5rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_TICKETS.map(ticket => {
              const statusStyle = getStatusColor(ticket.status);
              return (
                <tr key={ticket.id} style={{ borderBottom: "1px solid var(--color-neutral-100)", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#fafafa"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", fontWeight: 600 }}>{ticket.id}</div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--color-primary-900)" }}>{ticket.subject}</div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-primary-800)", fontWeight: 500 }}>{ticket.client}</td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "999px", background: statusStyle.bg, color: statusStyle.text, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
                      {statusStyle.icon} {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-neutral-500)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {ticket.assignee !== 'Unassigned' && (
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "bold" }}>
                          {ticket.assignee.charAt(0)}
                        </div>
                      )}
                      {ticket.assignee}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-neutral-400)" }}>{ticket.updated}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <button style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}><MoreVertical size={16} /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
