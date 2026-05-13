"use client";
import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, User, DollarSign, Calendar, TrendingUp, Building, Loader2 } from 'lucide-react';
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
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
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
                  <div key={lead.id} className="glass-card" style={{ padding: "1.25rem", cursor: "pointer", borderLeft: `3px solid ${stage === 'Closed Won' ? '#10b981' : 'var(--color-accent-500)'}` }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>{lead.first_name} {lead.last_name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", marginBottom: "0.5rem" }}>{lead.company_name || 'Individual'}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-accent-500)", fontWeight: 600, marginBottom: "1rem" }}>{lead.service_interest || 'General Inquiry'}</div>
                    
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "0.75rem" }}>
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
    </div>
  );
}

