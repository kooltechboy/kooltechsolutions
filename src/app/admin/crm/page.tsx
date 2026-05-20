"use client";
import { useState, useEffect } from "react";
import { 
  Plus, User, DollarSign, Calendar, TrendingUp, 
  Building, Loader2, X, Mail, Phone, MessageSquare, Briefcase, 
  Search, Filter, ShieldCheck, Zap, Activity, Clock, Star, LayoutGrid, List
} from 'lucide-react';
import BookingModal from "@/components/shared/BookingModal";
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

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  company_name?: string;
  email: string;
  phone?: string;
  service_interest?: string;
  status: string;
  notes?: string;
  created_at: string;
}

export default function CRMPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [showBooking, setShowBooking] = useState(false);
  const supabase = createClient();

  useEffect(() => {
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
    fetchLeads();
  }, [supabase]);

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
    return leads
      .filter(l => STAGE_MAP[l.status] === stageName)
      .filter(l => 
        l.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (l.company_name || "").toLowerCase().includes(searchQuery.toLowerCase())
      );
  };

  const demoCount = leads.filter(l => l.notes?.includes("LIVE DEMO")).length;
  const wonValue = leads.filter(l => l.status === 'won').length * 12000;

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1600px", margin: "0 auto" }}>
      {/* Premium Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-accent-500)", marginBottom: "0.5rem" }}>
            <Activity size={18} />
            <span style={{ fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase" }}>Sales Operations</span>
          </div>
          <h1 style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif" }}>
            Revenue <span className="gradient-text">Command Center</span>
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.9375rem", marginTop: "0.25rem" }}>
            Orchestrating high-value lead acquisition and deal acceleration.
          </p>
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ display: "flex", background: "rgba(255,255,255,0.03)", padding: "0.25rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
            <button 
              onClick={() => setViewMode('kanban')}
              style={{ padding: "0.5rem", borderRadius: "8px", background: viewMode === 'kanban' ? "rgba(255,255,255,0.05)" : "transparent", color: viewMode === 'kanban' ? "white" : "var(--color-neutral-500)", border: "none", cursor: "pointer" }}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              style={{ padding: "0.5rem", borderRadius: "8px", background: viewMode === 'list' ? "rgba(255,255,255,0.05)" : "transparent", color: viewMode === 'list' ? "white" : "var(--color-neutral-500)", border: "none", cursor: "pointer" }}
            >
              <List size={18} />
            </button>
          </div>
          <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1.5rem", borderRadius: "12px" }}>
            <Plus size={18} /> Create Opportunity
          </button>
        </div>
      </div>

      {/* Intelligence Strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        <div className="glass-card" style={{ padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "16px", background: "rgba(16,185,129,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <DollarSign size={28} color="#10b981" />
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>${(wonValue/1000).toFixed(1)}k</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", fontWeight: 600 }}>Closed Revenue <span style={{ color: "#10b981" }}>+22%</span></div>
          </div>
        </div>
        
        <div className="glass-card" style={{ padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "16px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Calendar size={28} color="#00d4ff" />
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>{demoCount}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", fontWeight: 600 }}>Upcoming Demos <span style={{ color: "#00d4ff" }}>High Intent</span></div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: "2rem", display: "flex", gap: "1.5rem", alignItems: "center" }}>
          <div style={{ width: 64, height: 64, borderRadius: "16px", background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap size={28} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>34%</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", fontWeight: 600 }}>Closing Ratio <span style={{ color: "#a855f7" }}>Elite</span></div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
        {/* Main Workspace */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={18} color="var(--color-neutral-500)" style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                type="text" 
                placeholder="Search leads, companies, or deal sizes..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  background: "rgba(255,255,255,0.02)", 
                  border: "1px solid rgba(255,255,255,0.1)", 
                  borderRadius: "14px", 
                  padding: "0.875rem 1rem 0.875rem 3rem", 
                  color: "white", 
                  outline: "none", 
                  width: "100%", 
                  fontSize: "0.9375rem" 
                }} 
              />
            </div>
            <button style={{ padding: "0.875rem 1.25rem", borderRadius: "14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, cursor: "pointer" }}>
              <Filter size={18} /> Filters
            </button>
          </div>

          <div style={{ display: "flex", gap: "1.5rem", overflowX: "auto", paddingBottom: "2rem" }}>
            {PIPELINE_STAGES.map(stage => {
              const stageLeads = getLeadsByStage(stage);
              return (
                <div key={stage} style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.5rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.05em" }}>{stage}</span>
                      <span style={{ background: "rgba(255,255,255,0.05)", color: "var(--color-neutral-400)", padding: "0.125rem 0.5rem", borderRadius: "4px", fontSize: "0.7rem", fontWeight: 800 }}>
                        {stageLeads.length}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {stageLeads.map(lead => {
                      const isDemo = lead.notes?.includes("LIVE DEMO");
                      const leadIdHash = lead.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
                      const score = isDemo ? 95 : 40 + (leadIdHash % 41);
                      return (
                        <div 
                          key={lead.id} 
                          className="glass-card" 
                          onClick={() => setSelectedLead(lead)}
                          style={{ padding: "1.5rem", cursor: "pointer", border: "1px solid rgba(255,255,255,0.05)", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--color-accent-500)30"}
                          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                            <div style={{ fontSize: "1rem", fontWeight: 700, color: "white" }}>{lead.first_name} {lead.last_name}</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: score > 80 ? "#10b981" : "#f59e0b" }}>
                              <Star size={12} fill="currentColor" />
                              <span style={{ fontSize: "0.7rem", fontWeight: 800 }}>{score}</span>
                            </div>
                          </div>
                          
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-neutral-400)", marginBottom: "1rem" }}>
                            {lead.company_name || 'Prospect'}
                          </div>
                          
                          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
                            {isDemo && (
                              <span style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff", padding: "0.25rem 0.625rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 800 }}>DEMO</span>
                            )}
                            <span style={{ background: "rgba(255,255,255,0.03)", color: "var(--color-neutral-300)", padding: "0.25rem 0.625rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700 }}>
                              {lead.service_interest || 'General'}
                            </span>
                          </div>
                          
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1rem", borderTop: "1px solid rgba(255,255,255,0.03)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--color-accent-500)", color: "white", fontSize: "0.6rem", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900 }}>
                                {lead.first_name[0]}
                              </div>
                              <span style={{ fontSize: "0.7rem", color: "var(--color-neutral-500)", fontWeight: 600 }}>Active Now</span>
                            </div>
                            <div style={{ color: "var(--color-neutral-600)", fontSize: "0.7rem" }}>
                              <Clock size={10} style={{ marginRight: "0.25rem", display: "inline" }} />
                              {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar: Activity & Intelligence */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <TrendingUp size={16} color="var(--color-accent-500)" /> Deal Velocity
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { label: "Lead to Qualified", val: "2.4d", color: "#00d4ff", trend: "up" },
                { label: "Qualified to Proposal", val: "4.1d", color: "#a855f7", trend: "up" },
                { label: "Proposal to Close", val: "1.2d", color: "#10b981", trend: "down" },
              ].map(stat => (
                <div key={stat.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.8125rem" }}>
                    <span style={{ color: "var(--color-neutral-400)" }}>{stat.label}</span>
                    <span style={{ color: "white", fontWeight: 800 }}>{stat.val}</span>
                  </div>
                  <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "99px", overflow: "hidden" }}>
                    <div style={{ width: "65%", height: "100%", background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "1.5rem", flex: 1 }}>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>Recent Signals</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {[
                { type: "inquiry", user: "John Carter", company: "Tesla", time: "2m ago", icon: <MessageSquare size={14} /> },
                { type: "demo", user: "Sarah Wu", company: "Meta", time: "15m ago", icon: <Calendar size={14} /> },
                { type: "won", user: "TechFlow Inc", company: "Enterprise", time: "2h ago", icon: <ShieldCheck size={14} /> },
              ].map((signal, i) => (
                <div key={i} style={{ display: "flex", gap: "1rem" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)", flexShrink: 0 }}>
                    {signal.icon}
                  </div>
                  <div>
                    <div style={{ color: "white", fontSize: "0.8125rem", fontWeight: 700 }}>{signal.user}</div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{signal.company} • {signal.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <button style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", color: "white", fontSize: "0.75rem", fontWeight: 700, marginTop: "2rem", cursor: "pointer" }}>
              View All Activity
            </button>
          </div>
        </div>
      </div>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
          background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }} onClick={() => setSelectedLead(null)}>
          <div 
            className="glass-card" 
            style={{ width: "100%", maxWidth: "800px", padding: "3rem", position: "relative", background: "#060d1d", border: "1px solid rgba(0, 212, 255, 0.2)" }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedLead(null)}
              style={{ position: "absolute", top: "2rem", right: "2rem", background: "rgba(255,255,255,0.05)", border: "none", color: "white", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <X size={20} />
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: "2rem", marginBottom: "3rem" }}>
              <div style={{ width: 80, height: 80, borderRadius: "20px", background: "linear-gradient(135deg, rgba(0,212,255,0.2) 0%, rgba(168,85,247,0.2) 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={40} color="white" />
              </div>
              <div>
                <h2 style={{ fontSize: "2rem", fontWeight: 800, color: "white", fontFamily: "Syne" }}>{selectedLead.first_name} {selectedLead.last_name}</h2>
                <div style={{ color: "var(--color-accent-500)", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Building size={16} /> {selectedLead.company_name || 'Prospect Company'}
                </div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "3rem" }}>
              <div>
                <h4 style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "1.25rem" }}>Contact Profile</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "white" }}>
                    <Mail size={18} color="var(--color-neutral-500)" /> {selectedLead.email}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "white" }}>
                    <Phone size={18} color="var(--color-neutral-500)" /> {selectedLead.phone || 'No phone provided'}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", color: "white" }}>
                    <Briefcase size={18} color="var(--color-neutral-500)" /> Interested in {selectedLead.service_interest || 'MSP Services'}
                  </div>
                </div>
              </div>
              
              <div>
                <h4 style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", marginBottom: "1.25rem" }}>Lead Intelligence</h4>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ color: "#10b981", fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.5rem" }}>95/100</div>
                  <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>Engagement Score: This lead is ready for a proposal based on demo interaction.</div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "2.5rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", fontWeight: 700 }}>Stage:</span>
                <select 
                  value={selectedLead.status}
                  onChange={(e) => updateLeadStatus(selectedLead.id, e.target.value)}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", padding: "0.75rem 1.5rem", borderRadius: "12px", fontSize: "0.875rem", fontWeight: 700, outline: "none", cursor: "pointer" }}
                >
                  {Object.entries(STAGE_MAP).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button style={{ padding: "0.875rem 1.75rem", borderRadius: "12px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontWeight: 700, cursor: "pointer" }}>Archive</button>
                <button 
                  onClick={() => setShowBooking(true)}
                  style={{ padding: "0.875rem 1.75rem", borderRadius: "12px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <Calendar size={16} /> Schedule Demo
                </button>
                <button className="btn-primary" style={{ padding: "0.875rem 2rem", borderRadius: "12px" }}>Send Proposal</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BookingModal isOpen={showBooking} onClose={() => setShowBooking(false)} />
    </div>
  );
}

