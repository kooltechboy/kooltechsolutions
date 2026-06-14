"use client";
import React, { useEffect, useState } from 'react';
import { Search, CheckCircle2, Clock, AlertCircle, MessageSquare, Loader2, X } from 'lucide-react';
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

interface ClientDetails {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface AssigneeDetails {
  first_name?: string;
  last_name?: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  client?: ClientDetails | ClientDetails[] | null;
  assignee?: AssigneeDetails | AssigneeDetails[] | null;
}

interface Profile {
  id: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  email?: string;
}

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const supabase = createClient();

  // Modal and creation form states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [clients, setClients] = useState<Profile[]>([]);
  const [admins, setAdmins] = useState<Profile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [form, setForm] = useState({
    client_id: '',
    subject: '',
    description: '',
    priority: 'normal',
    assigned_to: ''
  });

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Fetch tickets
  useEffect(() => {
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
    fetchTickets();
  }, [supabase, refreshKey]);

  // Fetch client & admin profiles for creation dropdowns
  useEffect(() => {
    async function fetchProfiles() {
      const [{ data: clientsData }, { data: adminsData }] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, first_name, last_name, company_name, email')
          .eq('role', 'client')
          .order('company_name', { ascending: true }),
        supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .eq('role', 'admin')
          .order('first_name', { ascending: true })
      ]);

      if (clientsData) setClients(clientsData);
      if (adminsData) setAdmins(adminsData);
    }
    fetchProfiles();
  }, [supabase]);

  // Subscribe to real-time changes on the tickets table
  useEffect(() => {
    const channel = supabase
      .channel('admin-tickets-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        setRefreshKey(k => k + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Handle ticket creation
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.client_id || !form.subject.trim() || !form.description.trim()) {
      setCreateError("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    setCreateError(null);

    const insertData: any = {
      client_id: form.client_id,
      subject: form.subject.trim(),
      description: form.description.trim(),
      priority: form.priority,
      status: 'open'
    };

    if (form.assigned_to) {
      insertData.assigned_to = form.assigned_to;
    }

    const { error } = await supabase
      .from('tickets')
      .insert([insertData]);

    if (error) {
      setCreateError(error.message || "Failed to create ticket.");
    } else {
      setForm({
        client_id: '',
        subject: '',
        description: '',
        priority: 'normal',
        assigned_to: ''
      });
      setShowCreateModal(false);
      setRefreshKey(k => k + 1);
    }
    setSubmitting(false);
  };

  // Perform search and filters on tickets
  const filteredTickets = tickets.filter(ticket => {
    const clientObj = Array.isArray(ticket.client) ? ticket.client[0] : ticket.client;
    const clientName = (clientObj?.company_name || `${clientObj?.first_name || ''} ${clientObj?.last_name || ''}`.trim() || 'Unknown').toLowerCase();
    const subject = (ticket.subject || '').toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchesSearch = !query || subject.includes(query) || clientName.includes(query) || ticket.id.toLowerCase().includes(query);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

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
        <button className="btn-primary" onClick={() => setShowCreateModal(true)}>Create Ticket</button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Open Tickets", value: tickets.filter(t => t.status === 'open').length.toString(), trend: "Real-time" },
          { label: "Critical Issues", value: tickets.filter(t => t.priority === 'critical' && t.status !== 'closed').length.toString(), trend: "Needs immediate action", alert: tickets.some(t => t.priority === 'critical' && t.status !== 'closed') },
          { label: "Assigned to Kira", value: tickets.filter(t => {
            const a = Array.isArray(t.assignee) ? t.assignee[0] : t.assignee;
            return a?.first_name === 'Kira';
          }).length.toString(), trend: "Agent workload" },
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
        <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ position: "relative", flex: 1, minWidth: "250px", maxWidth: "400px" }}>
            <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-400)" }} />
            <input 
              type="text" 
              placeholder="Search by subject, client name, or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", padding: "0.625rem 1rem 0.625rem 2.75rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.15)", color: "white", outline: "none", fontSize: "0.875rem" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginLeft: "auto" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ padding: "0.5rem 1.5rem 0.5rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "#0D1526", color: "white", fontSize: "0.8125rem", outline: "none", cursor: "pointer" }}
              >
                <option value="all" style={{ background: "#0D1526" }}>All Statuses</option>
                <option value="open" style={{ background: "#0D1526" }}>Open</option>
                <option value="in_progress" style={{ background: "#0D1526" }}>In Progress</option>
                <option value="resolved" style={{ background: "#0D1526" }}>Resolved</option>
                <option value="closed" style={{ background: "#0D1526" }}>Closed</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 600, textTransform: "uppercase" }}>Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                style={{ padding: "0.5rem 1.5rem 0.5rem 0.75rem", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.1)", background: "#0D1526", color: "white", fontSize: "0.8125rem", outline: "none", cursor: "pointer" }}
              >
                <option value="all" style={{ background: "#0D1526" }}>All Priorities</option>
                <option value="low" style={{ background: "#0D1526" }}>Low</option>
                <option value="normal" style={{ background: "#0D1526" }}>Normal</option>
                <option value="high" style={{ background: "#0D1526" }}>High</option>
                <option value="critical" style={{ background: "#0D1526" }}>Critical</option>
              </select>
            </div>
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
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                  No support tickets found matching criteria.
                </td>
              </tr>
            ) : filteredTickets.map(ticket => {
              const statusStyle = getStatusColor(ticket.status);
              const clientObj = Array.isArray(ticket.client) ? ticket.client[0] : ticket.client;
              const assigneeObj = Array.isArray(ticket.assignee) ? ticket.assignee[0] : ticket.assignee;
              
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
                    {clientObj?.company_name || `${clientObj?.first_name || ''} ${clientObj?.last_name || ''}`.trim() || 'Unknown'}
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
                      {assigneeObj ? (
                        <>
                          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent-500)", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.6rem", fontWeight: "bold" }}>
                            {assigneeObj.first_name?.charAt(0)}
                          </div>
                          {assigneeObj.first_name}
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

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div className="glass-card" style={{ width: "90%", maxWidth: "500px", padding: "2rem", borderRadius: "16px", border: "1px solid rgba(255, 255, 255, 0.1)", position: "relative" }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.25rem", fontWeight: 800, color: "white", marginBottom: "1.5rem" }}>
              Create New Support Ticket
            </h2>

            {createError && (
              <div style={{ padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.875rem" }}>
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTicket} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Client Profile *</label>
                <select
                  required
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                >
                  <option value="" style={{ background: "#0D1526", color: "var(--color-neutral-400)" }}>Select a client profile...</option>
                  {clients.map(c => {
                    const nameStr = `${c.first_name || ''} ${c.last_name || ''}`.trim();
                    const displayName = c.company_name
                      ? `${c.company_name} (${nameStr || c.email || 'No Name'})`
                      : nameStr || c.email || 'Unnamed Client';
                    return (
                      <option key={c.id} value={c.id} style={{ background: "#0D1526" }}>
                        {displayName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Subject *</label>
                <input
                  required
                  type="text"
                  maxLength={200}
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Summarize the support request..."
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Priority *</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", textTransform: "capitalize" }}
                  >
                    <option value="low" style={{ background: "#0D1526" }}>Low</option>
                    <option value="normal" style={{ background: "#0D1526" }}>Normal</option>
                    <option value="high" style={{ background: "#0D1526" }}>High</option>
                    <option value="critical" style={{ background: "#0D1526" }}>Critical</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Assignee</label>
                  <select
                    value={form.assigned_to}
                    onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none" }}
                  >
                    <option value="" style={{ background: "#0D1526", color: "var(--color-neutral-400)" }}>Leave unassigned...</option>
                    {admins.map(a => {
                      const nameStr = `${a.first_name || ''} ${a.last_name || ''}`.trim();
                      return (
                        <option key={a.id} value={a.id} style={{ background: "#0D1526" }}>
                          {nameStr || a.email || 'Unnamed Support Agent'}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: "block", color: "var(--color-neutral-400)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Description *</label>
                <textarea
                  required
                  rows={4}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detail the issue or steps to reproduce..."
                  style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", resize: "none", fontFamily: "inherit" }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "white", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary"
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.625rem 1.25rem", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem" }}
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : null}
                  Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
