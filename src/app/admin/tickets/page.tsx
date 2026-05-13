"use client";
import React, { useEffect, useState } from 'react';
import { Search, Filter, CheckCircle2, Clock, AlertCircle, MessageSquare, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const getStatusColor = (status: string) => {
  switch(status) {
    case 'critical': return { bg: 'rgba(239,68,68,0.1)', text: '#ef4444', icon: <AlertCircle size={14} /> };
    case 'open': return { bg: 'rgba(59,130,246,0.1)', text: '#3b82f6', icon: <MessageSquare size={14} /> };
    case 'in_progress': return { bg: 'rgba(245,158,11,0.1)', text: '#f59e0b', icon: <Clock size={14} /> };
    case 'resolved': return { bg: 'rgba(16,185,129,0.1)', text: '#10b981', icon: <CheckCircle2 size={14} /> };
    case 'closed': return { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', icon: <CheckCircle2 size={14} /> };
    default: return { bg: 'rgba(107,114,128,0.1)', text: '#6b7280', icon: <MessageSquare size={14} /> };
  }
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchTickets();
  }, []);

  async function fetchTickets() {
    const { data, error } = await supabase
      .from('tickets')
      .select('*, client:client_id(first_name, last_name, company_name), assignee:assigned_to(first_name, last_name)')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setTickets(data);
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
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>HelpDesk Command Center</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Manage, assign, and resolve active client support requests.</p>
        </div>
        <button className="btn-primary">Create Ticket</button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Open Tickets", value: tickets.filter(t => t.status === 'open').length.toString(), trend: "Real-time" },
          { label: "Critical Issues", value: tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length.toString(), trend: "Needs immediate action", alert: tickets.some(t => t.priority === 'critical' && t.status !== 'closed') },
          { label: "Assigned to Kira", value: tickets.filter(t => t.assignee?.first_name === 'Kira').length.toString(), trend: "Agent workload" },
          { label: "Total Tickets", value: tickets.length.toString(), trend: "Lifetime count" }
        ].map((metric, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderLeft: metric.alert ? "4px solid #ef4444" : "4px solid var(--color-accent-500)" }}>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{metric.label}</div>
            <div style={{ fontSize: "2rem", fontWeight: 700, color: "white", margin: "0.5rem 0" }}>{metric.value}</div>
            <div style={{ color: metric.alert ? "#ef4444" : "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: 500 }}>{metric.trend}</div>
          </div>
        ))}
      </div>

      {/* Tickets Table Area */}
      <div className="glass-card" style={{ overflow: "hidden" }}>
        <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-400)" }} />
            <input 
              type="text" 
              placeholder="Search tickets..." 
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white", outline: "none", fontSize: "0.875rem" }}
            />
          </div>
        </div>
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "rgba(0, 212, 255, 0.05)", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
            <tr>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Subject / ID</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Client</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Status</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Priority</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Assignee</th>
              <th style={{ padding: "1rem 1.5rem", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "var(--color-neutral-500)", textTransform: "uppercase" }}>Created</th>
              <th style={{ padding: "1rem 1.5rem" }}></th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                  No support tickets found.
                </td>
              </tr>
            ) : tickets.map(ticket => {
              const statusStyle = getStatusColor(ticket.status);
              return (
                <tr key={ticket.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", transition: "background 0.2s", cursor: "pointer" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.03)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600, color: "white" }}>{ticket.subject}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", fontWeight: 500, fontFamily: "JetBrains Mono, monospace" }}>{ticket.id.slice(0, 8)}...</div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-neutral-300)", fontWeight: 500 }}>
                    {ticket.client?.company_name || `${ticket.client?.first_name} ${ticket.client?.last_name}` || 'Unknown'}
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", padding: "0.35rem 0.75rem", borderRadius: "999px", background: statusStyle.bg, color: statusStyle.text, fontSize: "0.75rem", fontWeight: 600, textTransform: "capitalize" }}>
                      {statusStyle.icon} {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem" }}>
                    <span style={{ 
                      fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                      color: ticket.priority === 'critical' ? '#ef4444' : ticket.priority === 'high' ? '#f59e0b' : 'var(--color-neutral-400)'
                    }}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-neutral-500)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      {ticket.assignee ? (
                        <>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "bold" }}>
                            {ticket.assignee.first_name?.charAt(0)}
                          </div>
                          {ticket.assignee.first_name}
                        </>
                      ) : 'Unassigned'}
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.5rem", fontSize: "0.875rem", color: "var(--color-neutral-400)" }}>{new Date(ticket.created_at).toLocaleDateString()}</td>
                  <td style={{ padding: "1rem 1.5rem", textAlign: "right" }}>
                    <a
                      href={`/admin/tickets/${ticket.id}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.375rem 0.75rem", borderRadius: "6px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 600, textDecoration: "none" }}
                    >
                      View
                    </a>
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

