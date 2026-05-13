"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Send, AlertCircle, CheckCircle, Clock, Search, Plus, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'normal' });
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchMyTickets();
  }, []);

  async function fetchMyTickets() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('tickets')
      .select('*')
      .eq('client_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please log in to submit a ticket.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, client_id: user.id })
      });

      if (res.ok) {
        setSuccess(true);
        setForm({ subject: '', description: '', priority: 'normal' });
        setTimeout(() => {
          setSuccess(false);
          setShowNewForm(false);
          fetchMyTickets();
        }, 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>Support Tickets</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Track and manage your IT support requests.</p>
        </div>
        {!showNewForm && (
          <button onClick={() => setShowNewForm(true)} className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Plus size={18} /> New Ticket
          </button>
        )}
      </div>

      {showNewForm ? (
        <div className="glass-card" style={{ padding: "2rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.25rem" }}>Open New Request</h2>
            <button onClick={() => setShowNewForm(false)} style={{ background: "none", border: "none", color: "var(--color-neutral-500)", cursor: "pointer" }}>Cancel</button>
          </div>

          {success ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              <CheckCircle size={48} color="var(--color-success)" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ color: "white", marginBottom: "0.5rem" }}>Ticket Submitted Successfully</h3>
              <p style={{ color: "var(--color-neutral-400)" }}>Our engineers have been notified and will respond shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Subject / Summary *</label>
                <input 
                  required
                  className="input-field" 
                  placeholder="e.g., Cannot access email on mobile" 
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                />
              </div>
              <div>
                <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Priority Level</label>
                <select 
                  className="input-field"
                  value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}
                >
                  <option value="low">Low - General Inquiry</option>
                  <option value="normal">Normal - Standard Issue</option>
                  <option value="high">High - Impacting Work</option>
                  <option value="critical">Critical - Business Halted</option>
                </select>
              </div>
              <div>
                <label style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", display: "block", marginBottom: "0.5rem" }}>Description *</label>
                <textarea 
                  required
                  className="input-field" 
                  rows={6} 
                  placeholder="Please provide as much detail as possible..."
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary" style={{ justifyContent: "center", padding: "1rem" }}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </button>
            </form>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {tickets.length === 0 ? (
            <div className="glass-card" style={{ padding: "4rem", textAlign: "center" }}>
              <Ticket size={48} color="var(--color-neutral-600)" style={{ margin: "0 auto 1rem" }} />
              <h3 style={{ color: "var(--color-neutral-400)" }}>No active tickets</h3>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>When you have a technical issue, open a ticket here.</p>
            </div>
          ) : tickets.map(t => (
            <div key={t.id} className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "1.5rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--color-neutral-500)", background: "rgba(255,255,255,0.05)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                    {t.id.slice(0, 8)}
                  </span>
                  <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 600 }}>{t.subject}</h3>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", color: "var(--color-neutral-400)" }}>
                    <Clock size={14} /> Created: {new Date(t.created_at).toLocaleDateString()}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.8125rem", color: t.priority === 'critical' ? '#ef4444' : 'var(--color-neutral-400)' }}>
                    <AlertCircle size={14} /> Priority: <span style={{ textTransform: "capitalize" }}>{t.priority}</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ 
                  padding: "0.35rem 0.75rem", borderRadius: "99px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
                  background: t.status === 'open' ? 'rgba(0,212,255,0.1)' : 'rgba(16,185,129,0.1)',
                  color: t.status === 'open' ? 'var(--color-accent-500)' : 'var(--color-success)'
                }}>
                  {t.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
