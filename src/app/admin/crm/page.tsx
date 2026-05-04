import React from 'react';
import { Plus, MoreHorizontal, User, DollarSign, Calendar, TrendingUp, Building } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: "Admin — CRM & Pipeline" };

const PIPELINE_STAGES = ['New Lead', 'Contacted', 'Proposal Sent', 'Negotiation', 'Closed Won'];

const MOCK_DEALS = [
  { id: 1, title: 'Office 365 Migration', company: 'Oceania Imports', value: '$4,500', stage: 'New Lead', date: '2d ago' },
  { id: 2, title: 'Managed Security Services', company: 'Nova Therapeutics', value: '$1,200/mo', stage: 'Contacted', date: '5d ago' },
  { id: 3, title: 'Network Infrastructure Upgrade', company: 'Apex Financial', value: '$12,000', stage: 'Proposal Sent', date: '1w ago' },
  { id: 4, title: 'Cloud Backup Solution', company: 'Stellar Logistics', value: '$500/mo', stage: 'Negotiation', date: '3d ago' },
  { id: 5, title: '24/7 Helpdesk Retainer', company: 'Vanguard Medical', value: '$2,500/mo', stage: 'Closed Won', date: '2w ago' },
];

export default function CRMPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>CRM Pipeline</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Track leads, deals, and revenue velocity.</p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={16} /> New Deal
        </button>
      </div>

      {/* Metrics Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {[
          { label: "Active Deals", value: "14", icon: <TrendingUp size={20} color="var(--color-accent-500)" /> },
          { label: "Pipeline Value", value: "$48,500", icon: <DollarSign size={20} color="#10b981" /> },
          { label: "Win Rate", value: "68%", icon: <Building size={20} color="#3b82f6" /> },
          { label: "Avg Sales Cycle", value: "18 Days", icon: <Calendar size={20} color="#8b5cf6" /> },
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
        {PIPELINE_STAGES.map(stage => (
          <div key={stage} style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary-800)" }}>{stage}</span>
                <span style={{ background: "var(--color-neutral-200)", color: "var(--color-neutral-400)", padding: "0.125rem 0.5rem", borderRadius: "999px", fontSize: "0.7rem", fontWeight: 600 }}>
                  {MOCK_DEALS.filter(d => d.stage === stage).length}
                </span>
              </div>
              <button style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}><MoreHorizontal size={16} /></button>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {MOCK_DEALS.filter(d => d.stage === stage).map(deal => (
                <div key={deal.id} className="glass-card" style={{ padding: "1.25rem", cursor: "grab", borderLeft: "3px solid var(--color-accent-500)" }}>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600, color: "white", marginBottom: "0.25rem" }}>{deal.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginBottom: "1rem" }}>{deal.company}</div>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--color-neutral-100)", paddingTop: "0.75rem" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-accent-600)" }}>{deal.value}</div>
                    <div style={{ fontSize: "0.7rem", color: "var(--color-neutral-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <Calendar size={12} /> {deal.date}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Empty Drop Zone */}
              <button style={{ width: "100%", padding: "1rem", border: "2px dashed var(--color-neutral-200)", borderRadius: "12px", background: "transparent", color: "var(--color-neutral-400)", cursor: "pointer", display: "flex", justifyContent: "center", transition: "all 0.2s" }}>
                <Plus size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
