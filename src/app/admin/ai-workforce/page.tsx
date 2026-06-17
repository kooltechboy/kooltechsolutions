"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Activity,
  MessageSquare,
  Zap,
  Shield,
  Brain,
  Calendar,
  TrendingUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Mic,
  MessageCircle,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface AgentLog {
  id: string;
  created_at: string;
  session_id: string;
  agent_name?: string;
  role?: string;
  content?: string;
}

// ── Workforce personas aligned with the actual running agents ─────────────────
const AGENTS = [
  {
    id: "kira",
    name: "Kira",
    role: "Executive Concierge",
    icon: MessageSquare,
    color: "#00D4FF",
    desc: "Greets visitors, triages inquiries, and routes to the right specialist.",
    channel: "Text + Voice",
  },
  {
    id: "aria",
    name: "Aria",
    role: "Strategic Coordinator",
    icon: Calendar,
    color: "#FFB300",
    desc: "Qualifies leads and schedules live demos with the engineering team.",
    channel: "Text + Voice",
  },
  {
    id: "cortex",
    name: "Cortex",
    role: "L3 Support Engineer",
    icon: Shield,
    color: "#00E676",
    desc: "Handles deep technical troubleshooting and escalates via ticket creation.",
    channel: "Text + Voice",
  },
  {
    id: "max",
    name: "Max",
    role: "Senior Solutions Architect",
    icon: Zap,
    color: "#FF6B35",
    desc: "Answers complex infrastructure questions and recommends enterprise solutions.",
    channel: "Text + Voice",
  },
  {
    id: "nexus",
    name: "Nexus",
    role: "Growth Intelligence",
    icon: TrendingUp,
    color: "#A855F7",
    desc: "Analyzes lead pipelines, sales velocity, and growth opportunities.",
    channel: "Text + Voice",
  },
  {
    id: "nova",
    name: "Nova",
    role: "AI Sales Development",
    icon: TrendingUp,
    color: "#F43F5E",
    desc: "Autonomous outbound lead generation, outreach campaigns, and sales nurturing.",
    channel: "Text + Voice",
  },
];

const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.name.toLowerCase(), a]));

function getAgentMeta(name?: string) {
  if (!name) return AGENTS[0];
  return AGENT_MAP[name.toLowerCase()] || AGENTS[0];
}

function RoleTag({ role }: { role?: string }) {
  if (role === "user")
    return (
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: "rgba(255,255,255,0.07)",
          color: "#94a3b8",
          padding: "0.15rem 0.5rem",
          borderRadius: "999px",
        }}
      >
        <MessageCircle size={9} style={{ display: "inline", marginRight: 3 }} />
        User
      </span>
    );
  if (role === "agent")
    return (
      <span
        style={{
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          background: "rgba(0,212,255,0.1)",
          color: "#00D4FF",
          padding: "0.15rem 0.5rem",
          borderRadius: "999px",
        }}
      >
        <Brain size={9} style={{ display: "inline", marginRight: 3 }} />
        Agent
      </span>
    );
  return (
    <span
      style={{
        fontSize: "0.65rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        background: "rgba(255,255,255,0.04)",
        color: "#64748b",
        padding: "0.15rem 0.5rem",
        borderRadius: "999px",
      }}
    >
      System
    </span>
  );
}

function LogEntry({ log }: { log: AgentLog }) {
  const agent = getAgentMeta(log.agent_name);
  const isVoice = log.content?.startsWith("[Voice session");
  const isSystem = log.content?.startsWith("[");

  return (
    <div
      style={{
        display: "flex",
        gap: "0.875rem",
        padding: "0.875rem 1rem",
        background: "rgba(255,255,255,0.015)",
        borderRadius: "10px",
        border: "1px solid rgba(255,255,255,0.04)",
        animation: "fadeInUp 0.3s ease",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "9px",
          background: `${agent.color}18`,
          border: `1px solid ${agent.color}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isVoice ? (
          <Mic size={15} color={agent.color} />
        ) : (
          <agent.icon size={15} color={agent.color} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.3rem",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
            <span style={{ color: "white", fontWeight: 600, fontSize: "0.8125rem" }}>
              {log.agent_name || "Kira"}
            </span>
            <RoleTag role={log.role} />
            {isVoice && (
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  background: "rgba(168,85,247,0.12)",
                  color: "#a855f7",
                  padding: "0.1rem 0.4rem",
                  borderRadius: "999px",
                }}
              >
                Voice
              </span>
            )}
          </div>
          <span
            style={{
              color: "var(--color-neutral-500, #64748b)",
              fontSize: "0.68rem",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {new Date(log.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
        <p
          style={{
            color: isSystem ? "#64748b" : "var(--color-neutral-400, #94a3b8)",
            fontSize: "0.8rem",
            margin: 0,
            lineHeight: 1.55,
            fontStyle: isSystem ? "italic" : "normal",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
          }}
        >
          {log.content}
        </p>
      </div>
    </div>
  );
}

export default function AIWorkforceDashboard() {
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [agentStats, setAgentStats] = useState<Record<string, number>>({});

  // New States for Sessions & Escalations
  const [sessions, setSessions] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedTranscript, setSelectedTranscript] = useState<any[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);
  const [viewingTranscript, setViewingTranscript] = useState(false);

  const feedRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchSessions = useCallback(async () => {
    try {
      // Get non-closed sessions
      const { data: sessData, error: sessError } = await supabase
        .from("agent_sessions")
        .select("*")
        .neq("status", "closed")
        .order("last_active_at", { ascending: false });

      if (!sessError && sessData) {
        setSessions(sessData);
      }

      // Get pending escalations
      const { data: escData, error: escError } = await supabase
        .from("escalations")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (!escError && escData) {
        setEscalations(escData);
      }
    } catch (err) {
      console.error("Error fetching sessions:", err);
    }
  }, [supabase]);

  const fetchLogs = useCallback(async () => {
    const { data, error } = await supabase
      .from("agent_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setLogs(data);
      setLastRefreshed(new Date());

      // Compute per-agent message counts
      const stats: Record<string, number> = {};
      for (const log of data) {
        if (log.agent_name) {
          stats[log.agent_name] = (stats[log.agent_name] || 0) + 1;
        }
      }
      setAgentStats(stats);
    }

    await fetchSessions();
    setLoading(false);
  }, [supabase, fetchSessions]);

  const fetchTranscript = async (sessionId: string) => {
    setLoadingTranscript(true);
    setSelectedSessionId(sessionId);
    setViewingTranscript(true);

    const { data, error } = await supabase
      .from("agent_logs")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setSelectedTranscript(data);
    } else {
      setSelectedTranscript([]);
    }
    setLoadingTranscript(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // ── Supabase Realtime subscription ─────────────────────────────────────────
  useEffect(() => {
    const channel = supabase
      .channel("agent_logs_live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "agent_logs" },
        (payload) => {
          const newLog = payload.new as AgentLog;
          setLogs((prev) => [newLog, ...prev].slice(0, 50));
          setAgentStats((prev) => ({
            ...prev,
            [newLog.agent_name || "Kira"]: (prev[newLog.agent_name || "Kira"] || 0) + 1,
          }));
          setLastRefreshed(new Date());
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "agent_sessions" },
        () => {
          fetchSessions();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "escalations" },
        () => {
          fetchSessions();
        }
      )
      .subscribe((status) => {
        setRealtimeConnected(status === "SUBSCRIBED");
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchSessions]);

  // Auto-scroll feed on new log (only if near bottom)
  useEffect(() => {
    const el = feedRef.current;
    if (!el) return;
    if (el.scrollTop < 200) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [logs]);

  if (loading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            border: "3px solid rgba(0,212,255,0.15)",
            borderTop: "3px solid #00D4FF",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Initializing AI Workforce Console…</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>

      <div style={{ padding: "2rem", maxWidth: "1440px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginBottom: "2rem",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "white",
                fontFamily: "Syne, sans-serif",
                marginBottom: "0.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              AI Workforce Console
              {escalations.length > 0 && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    background: "#f59e0b",
                    color: "#0f172a",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "999px",
                    boxShadow: "0 0 10px rgba(245, 158, 11, 0.4)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#0f172a",
                      animation: "pulse 1.5s ease-in-out infinite",
                    }}
                  />
                  {escalations.length} {escalations.length === 1 ? "Escalation" : "Escalations"}
                </span>
              )}
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              Monitor your 5 autonomous digital employees in real time.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Realtime indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {realtimeConnected ? (
                <>
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#00E676",
                      animation: "pulse 2s ease-in-out infinite",
                      boxShadow: "0 0 8px #00E676",
                    }}
                  />
                  <span style={{ color: "#00E676", fontSize: "0.75rem", fontWeight: 700 }}>
                    <Wifi size={12} style={{ display: "inline", marginRight: 4 }} />
                    Live
                  </span>
                </>
              ) : (
                <>
                  <div
                    style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444" }}
                  />
                  <span style={{ color: "#ef4444", fontSize: "0.75rem", fontWeight: 700 }}>
                    <WifiOff size={12} style={{ display: "inline", marginRight: 4 }} />
                    Offline
                  </span>
                </>
              )}
            </div>
            {lastRefreshed && (
              <span style={{ color: "#475569", fontSize: "0.7rem" }}>
                Last update: {lastRefreshed.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={fetchLogs}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0.4rem 0.75rem",
                color: "#94a3b8",
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <RefreshCw size={13} />
              Refresh
            </button>
          </div>
        </div>

        {/* Agent Status Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "1.25rem",
            marginBottom: "2.5rem",
          }}
        >
          {AGENTS.map((agent) => {
            const msgCount = agentStats[agent.name] || 0;
            return (
              <div
                key={agent.id}
                className="glass-card"
                style={{
                  padding: "1.25rem",
                  borderTop: `3px solid ${agent.color}`,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* glow */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "60px",
                    background: `linear-gradient(180deg, ${agent.color}08, transparent)`,
                    pointerEvents: "none",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: "11px",
                      background: `${agent.color}15`,
                      border: `1px solid ${agent.color}25`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <agent.icon size={21} color={agent.color} />
                  </div>
                  <span
                    className="badge badge-success"
                    style={{ fontSize: "0.65rem", padding: "0.18rem 0.55rem" }}
                  >
                    Online
                  </span>
                </div>
                <h2
                  style={{
                    color: "white",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    marginBottom: "0.2rem",
                  }}
                >
                  {agent.name}
                </h2>
                <div
                  style={{
                    color: agent.color,
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.625rem",
                  }}
                >
                  {agent.role}
                </div>
                <p
                  style={{
                    color: "#94a3b8",
                    fontSize: "0.78rem",
                    lineHeight: 1.5,
                    marginBottom: "1rem",
                  }}
                >
                  {agent.desc}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    paddingTop: "1rem",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                  }}
                >
                  <div>
                    <div style={{ color: "#475569", fontSize: "0.65rem" }}>Messages logged</div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "1rem" }}>
                      {msgCount}
                    </div>
                  </div>
                  <div>
                    <div style={{ color: "#475569", fontSize: "0.65rem" }}>Channel</div>
                    <div style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.75rem" }}>
                      {agent.channel}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main panel */}
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: "2rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            {/* Live Activity Feed */}
            <div className="glass-card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <Activity size={18} color="#00D4FF" />
                  <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700 }}>
                    Autonomous Activity Stream
                  </h3>
                </div>
                <span
                  style={{
                    color: "#475569",
                    fontSize: "0.7rem",
                    background: "rgba(255,255,255,0.04)",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {logs.length} entries
                </span>
              </div>

              <div
                ref={feedRef}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                  maxHeight: "520px",
                  overflowY: "auto",
                  paddingRight: "0.25rem",
                }}
              >
                {logs.length === 0 ? (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4rem 2rem",
                      gap: "1rem",
                      color: "#475569",
                    }}
                  >
                    <Brain size={40} color="#1e3a5f" />
                    <p style={{ textAlign: "center", fontSize: "0.875rem", lineHeight: 1.6 }}>
                      Waiting for agent telemetry…
                      <br />
                      <span style={{ fontSize: "0.75rem", color: "#334155" }}>
                        Start a chat with any AI agent on the website to see logs appear here in real time.
                      </span>
                    </p>
                  </div>
                ) : (
                  logs.map((log) => <LogEntry key={log.id} log={log} />)
                )}
              </div>
            </div>

            {/* Active Sessions Panel */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "1.25rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
                  <MessageSquare size={18} color="#00D4FF" />
                  <h3 style={{ color: "white", fontSize: "1rem", fontWeight: 700 }}>
                    Active AI Sessions
                  </h3>
                </div>
                <span
                  style={{
                    color: "#475569",
                    fontSize: "0.7rem",
                    background: "rgba(255,255,255,0.04)",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {sessions.length} active
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {sessions.length === 0 ? (
                  <div style={{ padding: "2rem 1rem", textAlign: "center", color: "#64748b", fontSize: "0.8rem" }}>
                    No active sessions at the moment.
                  </div>
                ) : (
                  sessions.map((sess) => {
                    const isEscalated = sess.status === "escalated";
                    const matchingEsc = isEscalated
                      ? escalations.find((e) => e.session_id === sess.session_id)
                      : null;
                    const previewText = matchingEsc
                      ? matchingEsc.reason || matchingEsc.summary
                      : sess.page_context || "Main Website";

                    const agent = getAgentMeta(sess.agent_name);

                    return (
                      <div
                        key={sess.id}
                        style={{
                          padding: "1rem",
                          borderRadius: "10px",
                          background: isEscalated
                            ? "rgba(234,179,8,0.08)"
                            : "rgba(255,255,255,0.015)",
                          border: isEscalated
                            ? "1px solid rgba(234,179,8,0.25)"
                            : "1px solid rgba(255,255,255,0.04)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          transition: "all 0.2s",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <div
                              style={{
                                width: 24,
                                height: 24,
                                borderRadius: "6px",
                                background: `${agent.color}18`,
                                border: `1px solid ${agent.color}30`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <agent.icon size={12} color={agent.color} />
                            </div>
                            <span style={{ color: "white", fontWeight: 600, fontSize: "0.8rem" }}>
                              {sess.agent_name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                                background: "rgba(255,255,255,0.06)",
                                color: "#94a3b8",
                                padding: "0.1rem 0.4rem",
                                borderRadius: "999px",
                              }}
                            >
                              {sess.channel}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span
                              style={{
                                fontSize: "0.6rem",
                                fontWeight: 700,
                                textTransform: "uppercase",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "999px",
                                background: isEscalated
                                  ? "rgba(234,179,8,0.2)"
                                  : "rgba(0,229,118,0.12)",
                                color: isEscalated ? "#eab308" : "#00E676",
                              }}
                            >
                              {sess.status}
                            </span>
                            <button
                              onClick={() => fetchTranscript(sess.session_id)}
                              style={{
                                background: "rgba(0,212,255,0.1)",
                                border: "1px solid rgba(0,212,255,0.2)",
                                borderRadius: "6px",
                                color: "#00D4FF",
                                padding: "0.2rem 0.5rem",
                                fontSize: "0.7rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "all 0.2s",
                              }}
                            >
                              View Transcript
                            </button>
                          </div>
                        </div>

                        {/* Client details / Metadata */}
                        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.75rem", color: "#64748b" }}>
                          {sess.user_name && (
                            <span>
                              <strong>User:</strong> {sess.user_name}
                            </span>
                          )}
                          {sess.user_email && (
                            <span>
                              <strong>Email:</strong> {sess.user_email}
                            </span>
                          )}
                          <span>
                            <strong>Messages:</strong> {sess.message_count || 0}
                          </span>
                          <span>
                            <strong>Active:</strong> {new Date(sess.last_active_at).toLocaleTimeString()}
                          </span>
                        </div>

                        {/* Conversation preview / Escalation reason */}
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: isEscalated ? "#fef08a" : "#94a3b8",
                            fontStyle: "italic",
                            background: "rgba(0,0,0,0.15)",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "6px",
                            borderLeft: isEscalated ? "2px solid #eab308" : "2px solid #00d4ff",
                          }}
                        >
                          {isEscalated ? `Escalation Reason: ${previewText}` : `Page Context: ${previewText}`}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Collective Intelligence */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Brain size={18} color="#00D4FF" />
                Collective Intelligence
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "10px",
                    background: "rgba(0,212,255,0.05)",
                    border: "1px solid rgba(0,212,255,0.1)",
                  }}
                >
                  <div
                    style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}
                  >
                    Gemini 1.5 Flash (Text)
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.73rem" }}>
                    Powering all 5 text-mode agent personas.
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "10px",
                    background: "rgba(168,85,247,0.05)",
                    border: "1px solid rgba(168,85,247,0.1)",
                  }}
                >
                  <div
                    style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}
                  >
                    Gemini 2.0 Flash Exp (Voice)
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.73rem" }}>
                    Multimodal live API via LiveKit WebRTC pipeline.
                  </div>
                </div>
                <div
                  style={{
                    padding: "0.875rem",
                    borderRadius: "10px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div
                    style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600, marginBottom: "0.25rem" }}
                  >
                    Supabase Realtime
                  </div>
                  <div style={{ color: "#64748b", fontSize: "0.73rem" }}>
                    Streaming all conversation telemetry to this console.
                  </div>
                </div>
              </div>
            </div>

            {/* Session Stats */}
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              <h3
                style={{
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "1.25rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <TrendingUp size={18} color="#00D4FF" />
                Session Overview
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {AGENTS.map((agent) => {
                  const count = agentStats[agent.name] || 0;
                  const pct = logs.length > 0 ? Math.round((count / logs.length) * 100) : 0;
                  return (
                    <div key={agent.id}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "0.3rem",
                        }}
                      >
                        <span
                          style={{ color: "#94a3b8", fontSize: "0.76rem", fontWeight: 600 }}
                        >
                          {agent.name}
                        </span>
                        <span style={{ color: agent.color, fontSize: "0.76rem", fontWeight: 700 }}>
                          {count} msgs
                        </span>
                      </div>
                      <div
                        style={{
                          height: "4px",
                          borderRadius: "2px",
                          background: "rgba(255,255,255,0.06)",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${agent.color}, ${agent.color}88)`,
                            borderRadius: "2px",
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Uptime */}
            <div
              className="glass-card"
              style={{
                padding: "1.5rem",
                background:
                  "linear-gradient(135deg, rgba(0,212,255,0.07), rgba(168,85,247,0.07))",
                border: "1px solid rgba(0,212,255,0.12)",
              }}
            >
              <h3
                style={{
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: 700,
                  marginBottom: "0.375rem",
                }}
              >
                AI Workforce Uptime
              </h3>
              <div
                style={{ fontSize: "2.25rem", fontWeight: 800, color: "white", letterSpacing: "-0.03em" }}
              >
                100%
              </div>
              <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: "0.25rem" }}>
                No service interruptions in the last 90 days.
              </p>
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "#00E676",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#00E676",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                All systems operational
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Modal */}
      {viewingTranscript && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setViewingTranscript(false)}
        >
          <div
            style={{
              background: "rgba(10,22,40,0.98)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "680px",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)",
              animation: "fadeInUp 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "1.25rem 1.5rem",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                  Session Transcript
                </h3>
                <p style={{ color: "#64748b", fontSize: "0.75rem", margin: "0.15rem 0 0 0", wordBreak: "break-all" }}>
                  ID: {selectedSessionId}
                </p>
              </div>
              <button
                onClick={() => setViewingTranscript(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {loadingTranscript ? (
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "200px" }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      border: "2px solid rgba(0,212,255,0.15)",
                      borderTop: "2px solid #00D4FF",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }}
                  />
                </div>
              ) : selectedTranscript.length === 0 ? (
                <div style={{ textAlign: "center", color: "#64748b", padding: "4rem 0" }}>
                  No messages found in this session.
                </div>
              ) : (
                selectedTranscript.map((msg, idx) => {
                  const isUser = msg.role === "user";
                  const isAgent = msg.role === "agent";
                  const bubbleBg = isUser
                    ? "rgba(0,212,255,0.06)"
                    : isAgent
                    ? "rgba(255,255,255,0.03)"
                    : "rgba(255,255,255,0.01)";
                  const bubbleBorder = isUser
                    ? "1px solid rgba(0,212,255,0.15)"
                    : isAgent
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(255,255,255,0.02)";

                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "85%",
                        background: bubbleBg,
                        border: bubbleBorder,
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          color: isUser ? "#00D4FF" : "#94a3b8",
                          marginBottom: "0.25rem",
                          gap: "1rem",
                        }}
                      >
                        <span>{isUser ? "User" : msg.agent_name || "Agent"}</span>
                        <span style={{ color: "#475569", fontWeight: 400 }}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p style={{ margin: 0, color: "white", fontSize: "0.85rem", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "1rem 1.5rem",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => setViewingTranscript(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "0.5rem 1.25rem",
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
