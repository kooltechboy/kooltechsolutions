"use client";
import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, User, DollarSign, Calendar, TrendingUp, Building, Loader2, X, Mail, Phone, MessageSquare, Briefcase } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const STAGE_MAP: Record<string, string> = {
  'new': 'New Lead',
  'contacted': 'Contacted',
  'qualified': 'Qualified',
  'proposal': 'Proposal Sent',
  'won': 'Closed Won',
  'lost': 'Closed Lost'
};

const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed Won'];

export default function CRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchLeads();
  }, []);

  async function fetchLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setLeads(data);
    }
    setLoading(false);
  }

  async function updateLeadStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('leads')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      if (selectedLead && selectedLead.id === id) {
        setSelectedLead({ ...selectedLead, status: newStatus });
      }
    }
  }

  const getLeadsByStage = (stageName: string) => {
    return leads.filter(l => STAGE_MAP[l.status] === stageName);
  };

  const calculateTotalValue = () => {
    // In a real app, you'd have a 'value' column. For now we use a placeholder or derived value.
    return leads.length * 2500; 
  };

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>CRM Pipeline</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Track leads, deals, and revenue velocity.</p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> New Lead
        </button>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Active Leads", value: leads.length.toString(), icon: <TrendingUp size={20} color="var(--color-accent-500)" /> },
          { label: "Pipeline Value", value: `$${calculateTotalValue().toLocaleString()}`, icon: <DollarSign size={20} color="#10b981" /> },
          { label: "Win Rate", value: "64%", icon: <Building size={20} color="#3b82f6" /> },
          { label: "Avg Sales Cycle", value: "12 Days", icon: <Calendar size={20} color="#8b5cf6" /> },
        ].map((m, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 48, height: 48, borderRadius: "12px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {m.icon}
            </div>
            <div>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{m.label}</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "white" }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "1rem" }}>
        {PIPELINE_STAGES.map(stage => {
          const stageLeads = getLeadsByStage(stage);
          return (
            <div key={stage} style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary-100)" }}>{stage}</span>
                  <span style={{ background: "rgba(255,255,255,0.1)", color: "var(--color-neutral-400)", padding: "0.125rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>
                    {stageLeads.length}
                  </span>
                </div>
                <button style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}><MoreHorizontal size={16} /></button>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {stageLeads.map(lead => (
                  <div 
                    key={lead.id} 
                    className="glass-card" 
                    onClick={() => setSelectedLead(lead)}
                    style={{ padding: "1.25rem", cursor: "pointer", borderLeft: `3px solid ${stage === 'Closed Won' ? '#10b981' : 'var(--color-accent-500)'}`, transition: 'transform 0.2s ease' }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
                  >
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>{lead.first_name} {lead.last_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", marginBottom: "0.5rem" }}>{lead.company_name || 'Individual'}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-accent-500)", fontWeight: 600, marginBottom: "1rem" }}>{lead.service_interest || 'General Inquiry'}</div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }} onClick={e => e.stopPropagation()}>
                      <select 
                        value={lead.status}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        style={{ background: "transparent", border: "none", color: "var(--color-accent-500)", fontSize: "0.7rem", fontWeight: 700, outline: "none", cursor: "pointer" }}
                      >
                        {Object.entries(STAGE_MAP).map(([val, label]) => (
                          <option key={val} value={val} style={{ background: "#0a1628", color: "white" }}>{label}</option>
                        ))}
                      </select>
                      <div style={{ fontSize: "0.7rem", color: "var(--color-neutral-500)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        <Calendar size={12} /> {new Date(lead.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button style={{ width: "100%", padding: "1rem", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "12px", background: "transparent", color: "var(--color-neutral-500)", cursor: "pointer", display: "flex", justifyContent: "center" }}>
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lead Qualification Modal */}
      {selectedLead && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100
        }} onClick={() => setSelectedLead(null)}>
          <div 
            className="glass-card" 
            style={{ width: "100%", maxWidth: "600px", borderRadius: "16px", padding: "2rem", position: "relative", background: "linear-gradient(180deg, #0f2044 0%, #060d1d 100%)", border: "1px solid rgba(0, 212, 255, 0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedLead(null)}
              style={{ position: "absolute", top: "1.5rem", right: "1.5rem", background: "rgba(255,255,255,0.1)", border: "none", color: "white", borderRadius: "50%", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={16} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={24} color="var(--color-accent-500)" />
              </div>
              <div>
                <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>
                  {selectedLead.first_name} {selectedLead.last_name}
                </h2>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <Building size={14} /> {selectedLead.company_name || 'Individual'}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>Email Address</div>
                <div style={{ color: "white", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={14} color="var(--color-accent-500)" />
                  <a href={`mailto:${selectedLead.email}`} style={{ color: "white", textDecoration: "none" }}>{selectedLead.email}</a>
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "12px" }}>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "0.25rem" }}>Phone Number</div>
                <div style={{ color: "white", fontSize: "0.875rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={14} color="var(--color-accent-500)" />
                  <a href={`tel:${selectedLead.phone}`} style={{ color: "white", textDecoration: "none" }}>{selectedLead.phone || 'Not provided'}</a>
                </div>
              </div>
            </div>

            <div style={{ background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
              <div style={{ color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Briefcase size={14} /> Service Interest
              </div>
              <div style={{ color: "white", fontWeight: 600 }}>{selectedLead.service_interest || 'General Inquiry'}</div>
            </div>

            <div style={{ background: "rgba(0,0,0,0.2)", padding: "1.25rem", borderRadius: "12px", marginBottom: "1.5rem" }}>
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MessageSquare size={14} /> Message / Notes
              </div>
              <div style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {selectedLead.notes ? `"${selectedLead.notes}"` : 'No notes provided.'}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <span style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>Update Status:</span>
                <select 
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                  style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "white", padding: "0.5rem 1rem", borderRadius: "8px", fontSize: "0.875rem", fontWeight: 600, outline: "none", cursor: "pointer" }}
                >
                  {Object.entries(STAGE_MAP).map(([val, label]) => (
                    <option key={val} value={val} style={{ background: "#0a1628", color: "white" }}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-neutral-500)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
                <Calendar size={14} /> Created: {new Date(selectedLead.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
