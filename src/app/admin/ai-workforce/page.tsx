"use client";
import React, { useState, useEffect } from "react";
import { Activity, MessageSquare, Zap, Shield, Loader2, Brain } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AgentLog {
  id: string;
  created_at: string;
  agent_name?: string;
  role?: string;
  content?: string;
}

const agents = [
  { id: 'kira', name: 'Kira', role: 'Support Agent', icon: MessageSquare, color: '#00D4FF', desc: 'Handles level 1 technical support and ticket triaging.', tasks24h: 38 },
  { id: 'max', name: 'Max', role: 'System Optimizer', icon: Zap, color: '#FFB300', desc: 'Monitors infrastructure health and automates patches.', tasks24h: 47 },
  { id: 'nova', name: 'Nova', role: 'Security Analyst', icon: Shield, color: '#A855F7', desc: 'Detects threats and manages compliance drift.', tasks24h: 23 },
];

export default function AIWorkforceDashboard() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLogs() {
      const { data, error } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (!error && data) setLogs(data);
      setLoading(false);
    }
    fetchLogs();
  }, [supabase]);

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>AI Workforce Console</h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Manage and monitor your autonomous digital employees.</p>
      </div>

      {/* Agent Status Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2.5rem" }}>
        {agents.map(agent => (
          <div key={agent.id} className="glass-card" style={{ padding: "1.5rem", borderTop: `4px solid ${agent.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div style={{ width: 48, height: 48, borderRadius: "12px", background: `${agent.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <agent.icon size={24} color={agent.color} />
              </div>
              <span className="badge badge-success" style={{ fontSize: "0.7rem", padding: "0.2rem 0.6rem" }}>Online</span>
            </div>
            <h2 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.25rem" }}>{agent.name}</h2>
            <div style={{ color: agent.color, fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{agent.role}</div>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>{agent.desc}</p>
            
            <div style={{ display: "flex", gap: "1rem", paddingTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Tasks (24h)</div>
                <div style={{ color: "white", fontWeight: 700 }}>{agent.tasks24h}</div>
              </div>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>Efficiency</div>
                <div style={{ color: "white", fontWeight: 700 }}>98.2%</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "2rem" }}>
        {/* Live Activity Stream */}
        <div className="glass-card">
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
            <Activity size={20} color="var(--color-accent-500)" />
            <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700 }}>Autonomous Activity Stream</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {logs.length === 0 ? (
              <p style={{ color: "var(--color-neutral-500)", textAlign: "center", padding: "2rem" }}>Waiting for agent telemetry...</p>
            ) : logs.map(log => {
              const agentName = log.agent_name || "Kira";
              const agent = agents.find(a => a.name === agentName) || agents[0];
              const roleLabel = log.role === "user" ? "User Query" : "Agent Response";
              return (
                <div key={log.id} style={{ display: "flex", gap: "1rem", padding: "1rem", background: "rgba(255,255,255,0.02)", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "8px", background: `${agent.color}15`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <agent.icon size={16} color={agent.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                      <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{agentName} <span style={{ color: "var(--color-neutral-500)", fontWeight: 400 }}>· {roleLabel}</span></span>
                      <span style={{ color: "var(--color-neutral-500)", fontSize: "0.7rem" }}>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", margin: 0, whiteSpace: "pre-wrap" }}>{log.content?.slice(0, 200)}{(log.content?.length ?? 0) > 200 ? "..." : ""}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intelligence Settings */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card">
            <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Brain size={18} color="var(--color-accent-500)" />
              Collective Intelligence
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ padding: "1rem", borderRadius: "8px", background: "rgba(0,212,255,0.05)", border: "1px solid rgba(0,212,255,0.1)" }}>
                <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>GPT-4o Integration</div>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>Powering complex reasoning and triage.</div>
              </div>
              <div style={{ padding: "1rem", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.25rem" }}>Knowledge Base Sync</div>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>Last synced 2h ago (842 documents).</div>
              </div>
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: "1.5rem" }}>Update Knowledge Base</button>
          </div>

          <div className="glass-card" style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.1), rgba(168,85,247,0.1))" }}>
            <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>AI Uptime</h3>
            <div style={{ fontSize: "2rem", fontWeight: 800, color: "white" }}>100%</div>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>No service interruptions in the last 90 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
