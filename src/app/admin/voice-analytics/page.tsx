"use client";

import { useEffect, useState, useMemo } from "react";
import { 
  Bot, Phone, PhoneCall, Clock, Calendar, Ticket, 
  TrendingUp, Activity, Search, X, Loader2, 
  MessageSquare, User, AlertCircle, ArrowUpRight, Eye
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, BarChart, Bar, Cell, Legend
} from "recharts";

// Types
interface AgentStat {
  agent: string;
  totalSessions: number;
  avgSessionLength: string;
  escalationRate: string;
  compressionEvents: number;
}

interface TrendRow {
  date: string;
  Kira?: number;
  Aria?: number;
  Max?: number;
  Cortex?: number;
  Nexus?: number;
}

interface IntentRow {
  name: string;
  count: number;
}

interface AnalyticsData {
  totalSessions: number;
  totalMessages: number;
  avgMessagesPerSession: number;
  todaySessions: number;
  todayMessages: number;
  bookingsTriggered: number;
  ticketsCreated: number;
  perAgentStats: AgentStat[];
  trendData: TrendRow[];
  topIntents: IntentRow[];
}

interface Session {
  id: string;
  agent: string;
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  lastContent: string;
  firstUserMessage: string;
}

interface TranscriptItem {
  role: string;
  content: string;
  agent_name: string;
  created_at: string;
}

export default function VoiceAnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selected Session for Transcript Modal
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [transcriptLoading, setTranscriptLoading] = useState(false);

  // Fetch Analytics & Sessions data
  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsRes, sessionsRes] = await Promise.all([
          fetch("/api/admin/ai-analytics"),
          fetch("/api/admin/ai-sessions?limit=50"),
        ]);

        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalytics(data);
        }
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load voice analytics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Fetch full transcript when modal opens
  useEffect(() => {
    if (!selectedSessionId) {
      setTranscript([]);
      return;
    }

    async function loadTranscript() {
      setTranscriptLoading(true);
      try {
        const res = await fetch(`/api/admin/ai-sessions?sessionId=${selectedSessionId}`);
        if (res.ok) {
          const data = await res.json();
          setTranscript(data.transcript || []);
        }
      } catch (err) {
        console.error("Failed to load transcript:", err);
      } finally {
        setTranscriptLoading(false);
      }
    }
    loadTranscript();
  }, [selectedSessionId]);

  // Filtered Sessions list
  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.agent.toLowerCase().includes(q) ||
        (s.firstUserMessage && s.firstUserMessage.toLowerCase().includes(q)) ||
        (s.lastContent && s.lastContent.toLowerCase().includes(q))
    );
  }, [sessions, searchQuery]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "80vh" }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-accent-500)" />
      </div>
    );
  }

  // Pre-calculate colors for Agent Intent graph
  const COLORS = ["#00D4FF", "#00E676", "#FFB300", "#FF4444", "#A855F7", "#4B84C8"];

  const kpis = [
    { 
      icon: Phone, 
      label: "Total Sessions", 
      value: analytics?.totalSessions?.toString() || "0", 
      color: "#00D4FF",
      desc: "All time voice calls logs"
    },
    { 
      icon: Activity, 
      label: "Today's Calls", 
      value: analytics?.todaySessions?.toString() || "0", 
      color: "#00E676",
      desc: "Sessions started today"
    },
    { 
      icon: Calendar, 
      label: "AI Bookings", 
      value: analytics?.bookingsTriggered?.toString() || "0", 
      color: "#FFB300",
      desc: "Live demos booked by AI"
    },
    { 
      icon: Ticket, 
      label: "Tickets Created", 
      value: analytics?.ticketsCreated?.toString() || "0", 
      color: "#FF4444",
      desc: "Unresolved issues logged"
    },
  ];

  return (
    <div style={{ paddingBottom: "3rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          Voice <span className="gradient-text">Analytics</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Real-time conversation tracking, intents, metrics, and logs for KoolTech AI Agent Personas.
        </p>
      </div>

      {/* KPIs Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {kpis.map((kpi, idx) => (
          <motion.div 
            key={kpi.label} 
            className="kpi-card glass"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.4 }}
            whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
            style={{ 
              background: "rgba(15, 32, 68, 0.4)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(0, 212, 255, 0.1)",
              borderRadius: "16px",
              padding: "1.5rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div style={{ width: 42, height: 42, borderRadius: "12px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
              <span style={{ fontSize: "0.7rem", color: "var(--color-neutral-500)" }}>30-Day Activity</span>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.875rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "white", fontSize: "0.825rem", fontWeight: 600, marginTop: "0.2rem" }}>{kpi.label}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem", marginTop: "0.1rem" }}>{kpi.desc}</div>
          </motion.div>
        ))}
      </div>

      {/* Graphs Section */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        
        {/* Trend Area Chart */}
        <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(10, 22, 40, 0.5)", borderRadius: "16px", border: "1px solid rgba(0, 212, 255, 0.08)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "1rem" }}>
            7-Day Call Volume <span style={{ color: "var(--color-accent-500)" }}>Trend</span>
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.trendData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKira" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAria" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E676" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00E676" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMax" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FFB300" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FFB300" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCortex" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4444" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={11} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ background: "#0F2044", border: "1px solid rgba(0, 212, 255, 0.2)", borderRadius: "8px" }}
                  labelStyle={{ color: "white", fontWeight: 700 }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Area type="monotone" dataKey="Kira" stroke="#00D4FF" fillOpacity={1} fill="url(#colorKira)" name="Kira (Concierge)" strokeWidth={2} />
                <Area type="monotone" dataKey="Aria" stroke="#00E676" fillOpacity={1} fill="url(#colorAria)" name="Aria (Sales)" strokeWidth={2} />
                <Area type="monotone" dataKey="Max" stroke="#FFB300" fillOpacity={1} fill="url(#colorMax)" name="Max (Architect)" strokeWidth={2} />
                <Area type="monotone" dataKey="Cortex" stroke="#FF4444" fillOpacity={1} fill="url(#colorCortex)" name="Cortex (Support)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Intents Bar Chart */}
        <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(10, 22, 40, 0.5)", borderRadius: "16px", border: "1px solid rgba(0, 212, 255, 0.08)" }}>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "1rem" }}>
            Top User <span style={{ color: "var(--color-accent-500)" }}>Intents</span>
          </h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.topIntents || []} layout="vertical" margin={{ top: 10, right: 20, left: 30, bottom: 5 }}>
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ background: "#0F2044", border: "1px solid rgba(0, 212, 255, 0.2)", borderRadius: "8px" }}
                  labelStyle={{ color: "white" }}
                />
                <Bar dataKey="count" fill="#00D4FF" radius={[0, 4, 4, 0]} barSize={20}>
                  {(analytics?.topIntents || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Agent Performance Table */}
      <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(10, 22, 40, 0.5)", borderRadius: "16px", border: "1px solid rgba(0, 212, 255, 0.08)", marginBottom: "2rem" }}>
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white", marginBottom: "1rem" }}>
          Persona Performance & <span style={{ color: "var(--color-accent-500)" }}>Productivity</span>
        </h2>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--color-neutral-400)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Persona Agent</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Total Sessions</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Avg. Call Length</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Escalation Rate</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Telemetry Events</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.perAgentStats?.map((stat, idx) => (
                <tr key={stat.agent} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", color: "white" }}>
                  <td style={{ padding: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[idx % COLORS.length] }}></div>
                    {stat.agent} AI
                  </td>
                  <td style={{ padding: "1rem" }}>{stat.totalSessions} sessions</td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                      <Clock size={12} color="var(--color-neutral-400)" />
                      {stat.avgSessionLength}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span style={{ 
                      padding: "0.2rem 0.5rem", 
                      borderRadius: "6px", 
                      fontSize: "0.75rem", 
                      fontWeight: 600,
                      background: parseInt(stat.escalationRate) > 30 ? "rgba(255,68,68,0.15)" : "rgba(0,230,118,0.15)",
                      color: parseInt(stat.escalationRate) > 30 ? "#FF4444" : "#00E676"
                    }}>
                      {stat.escalationRate}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "var(--color-neutral-500)" }}>{stat.compressionEvents} events</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sessions Logs Section */}
      <div className="glass-card" style={{ padding: "1.5rem", background: "rgba(10, 22, 40, 0.5)", borderRadius: "16px", border: "1px solid rgba(0, 212, 255, 0.08)" }}>
        
        {/* Table Filter Controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
          <div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: "1.125rem", color: "white" }}>
              Call Sessions <span style={{ color: "var(--color-accent-500)" }}>Log</span>
            </h2>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Click any session to view its full voice transcript.</p>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "0.3rem 0.75rem", width: "100%", maxWidth: 300 }}>
            <Search size={16} color="var(--color-neutral-500)" />
            <input 
              type="text" 
              placeholder="Search session ID, agent, text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: "none", border: "none", color: "white", fontSize: "0.85rem", width: "100%", outline: "none" }}
            />
          </div>
        </div>

        {/* Sessions Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", color: "var(--color-neutral-400)" }}>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Session ID</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Agent Persona</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Messages Count</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>First User Msg</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Last Active At</th>
                <th style={{ padding: "0.75rem 1rem", fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "2rem", color: "var(--color-neutral-500)" }}>
                    No matching voice sessions found.
                  </td>
                </tr>
              ) : (
                filteredSessions.map((session) => (
                  <tr key={session.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", color: "white" }}>
                    <td style={{ padding: "1rem", fontFamily: "monospace", fontSize: "0.8rem", color: "var(--color-neutral-400)" }}>
                      {session.id.substring(0, 16)}...
                    </td>
                    <td style={{ padding: "1rem", fontWeight: 600 }}>
                      {session.agent}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      {session.messageCount} msg
                    </td>
                    <td style={{ padding: "1rem", color: "var(--color-neutral-400)", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {session.firstUserMessage || "—"}
                    </td>
                    <td style={{ padding: "1rem", fontSize: "0.8rem", color: "var(--color-neutral-400)" }}>
                      {new Date(session.lastMessage).toLocaleString()}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <button 
                        onClick={() => setSelectedSessionId(session.id)}
                        style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "0.4rem", 
                          border: "1px solid rgba(0,212,255,0.2)",
                          background: "rgba(0,212,255,0.06)",
                          color: "var(--color-accent-500)",
                          borderRadius: "6px",
                          padding: "0.3rem 0.625rem",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          fontWeight: 500,
                          transition: "all 0.2s ease"
                        }}
                        className="hover:bg-[#00D4FF]/10"
                      >
                        <Eye size={12} />
                        View Transcript
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Transcript Modal Dialog */}
      <AnimatePresence>
        {selectedSessionId && (
          <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            {/* Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: "absolute", inset: 0, background: "rgba(6, 11, 24, 0.85)", backdropFilter: "blur(4px)" }}
              onClick={() => setSelectedSessionId(null)}
            />
            
            {/* Container */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{ 
                position: "relative",
                width: "100%",
                maxWidth: "680px",
                height: "80vh",
                background: "#0A1628",
                border: "1px solid rgba(0, 212, 255, 0.15)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 25px 50px -12px rgba(0,0,0,0.8)"
              }}
            >
              {/* Header */}
              <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.1rem", fontWeight: 700, color: "white" }}>
                    Call Session <span style={{ color: "var(--color-accent-500)" }}>Transcript</span>
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-neutral-400)", fontFamily: "monospace" }}>ID: {selectedSessionId}</span>
                </div>
                <button 
                  onClick={() => setSelectedSessionId(null)}
                  style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Transcript Area */}
              <div style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1rem" }}>
                {transcriptLoading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", justifyContent: "center", height: "100%" }}>
                    <Loader2 className="animate-spin" size={32} color="var(--color-accent-500)" />
                    <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem" }}>Loading voice transcript...</span>
                  </div>
                ) : transcript.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--color-neutral-500)", gap: "0.5rem" }}>
                    <AlertCircle size={24} />
                    <span>No transcript items found in this session.</span>
                  </div>
                ) : (
                  transcript.map((item, idx) => {
                    const isUser = item.role === "user";
                    const isSystem = item.role === "system";
                    
                    if (isSystem) {
                      return (
                        <div key={idx} style={{ alignSelf: "center", background: "rgba(255,179,0,0.1)", border: "1px solid rgba(255,179,0,0.2)", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "#FFB300", maxWidth: "90%", textAlign: "center" }}>
                          {item.content}
                        </div>
                      );
                    }
                    
                    // Format timed metadata tags (e.g. [Voice session started], [Ticket created: #...])
                    const isSpecialEvent = item.content.startsWith("[") && item.content.endsWith("]");

                    if (isSpecialEvent) {
                      return (
                        <div key={idx} style={{ alignSelf: "center", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.15)", borderRadius: "8px", padding: "0.4rem 0.8rem", fontSize: "0.75rem", color: "#00D4FF", maxWidth: "90%", textAlign: "center", fontFamily: "monospace" }}>
                          {item.content}
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={idx}
                        style={{ 
                          alignSelf: isUser ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isUser ? "flex-end" : "flex-start"
                        }}
                      >
                        <div style={{ fontSize: "0.7rem", color: "var(--color-neutral-500)", marginBottom: "0.2rem" }}>
                          {isUser ? "User" : `${item.agent_name || "Kira"} AI`} · {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                        <div 
                          style={{ 
                            background: isUser ? "var(--color-primary-500)" : "rgba(255,255,255,0.04)",
                            border: isUser ? "none" : "1px solid rgba(255,255,255,0.06)",
                            borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                            padding: "0.75rem 1rem",
                            color: "white",
                            fontSize: "0.875rem",
                            lineHeight: "1.4"
                          }}
                        >
                          {item.content}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end", background: "rgba(0,0,0,0.15)" }}>
                <button 
                  onClick={() => setSelectedSessionId(null)}
                  style={{ 
                    border: "none",
                    background: "var(--color-primary-500)",
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.85rem"
                  }}
                >
                  Close Transcript
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
