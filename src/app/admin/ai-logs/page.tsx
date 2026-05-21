"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Bot,
  User,
  Clock,
  MessageSquare,
  BarChart3,
  CalendarCheck,
  Ticket,
  Activity,
  RefreshCcw,
  ChevronRight,
  Sparkles,
  Phone,
} from "lucide-react";

interface SessionInfo {
  id: string;
  agent: string;
  messageCount: number;
  firstMessage: string;
  lastMessage: string;
  lastContent: string;
  firstUserMessage: string;
}

interface TranscriptEntry {
  role: "user" | "agent";
  content: string;
  agent_name: string;
  created_at: string;
}

interface Analytics {
  totalSessions: number;
  totalMessages: number;
  todaySessions: number;
  todayMessages: number;
  bookingsTriggered: number;
  ticketsCreated: number;
  avgMessagesPerSession: number;
  messagesPerAgent: Array<{
    agent: string;
    totalMessages: number;
    sessions: number;
  }>;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatFullTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

const AGENT_COLORS: Record<string, string> = {
  Kira: "#00D4FF",
  Aria: "#FFB300",
  Max: "#00E676",
  Cortex: "#00D4FF",
  Nexus: "#a855f7",
};

function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div
      style={{
        background: "rgba(10,22,40,0.6)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flex: 1,
        minWidth: "160px",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "12px",
          background: `${accent}15`,
          border: `1px solid ${accent}30`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={accent} />
      </div>
      <div>
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "white",
            lineHeight: 1,
            fontFamily: "Syne, sans-serif",
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "rgba(148,163,184,0.8)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            marginTop: "0.25rem",
          }}
        >
          {label}
        </div>
      </div>
    </div>
  );
}

export default function AILogsPage() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/admin/ai-sessions?limit=100${searchParam}`);
      const data = await res.json();
      if (data.sessions) setSessions(data.sessions);
    } catch (e) {
      console.error("Failed to fetch sessions:", e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/ai-analytics");
      const data = await res.json();
      if (!data.error) setAnalytics(data);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    }
  }, []);

  const fetchTranscript = useCallback(async (sessionId: string) => {
    setLoadingTranscript(true);
    setActiveSession(sessionId);
    try {
      const res = await fetch(
        `/api/admin/ai-sessions?sessionId=${encodeURIComponent(sessionId)}`
      );
      const data = await res.json();
      if (data.transcript) setTranscript(data.transcript);
    } catch (e) {
      console.error("Failed to fetch transcript:", e);
    } finally {
      setLoadingTranscript(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
    fetchAnalytics();
  }, [fetchSessions, fetchAnalytics]);

  // Auto-select first session
  useEffect(() => {
    if (sessions.length > 0 && !activeSession) {
      fetchTranscript(sessions[0].id);
    }
  }, [sessions, activeSession, fetchTranscript]);

  const activeSessionData = sessions.find((s) => s.id === activeSession);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 64px)",
        background: "#070f1e",
      }}
    >
      {/* Stats Row */}
      <div
        style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          gap: "0.75rem",
          overflowX: "auto",
        }}
      >
        <StatCard
          icon={MessageSquare}
          label="Sessions Today"
          value={analytics?.todaySessions ?? "—"}
          accent="#00D4FF"
        />
        <StatCard
          icon={Activity}
          label="Messages Today"
          value={analytics?.todayMessages ?? "—"}
          accent="#00E676"
        />
        <StatCard
          icon={BarChart3}
          label="Total Sessions"
          value={analytics?.totalSessions ?? "—"}
          accent="#a855f7"
        />
        <StatCard
          icon={CalendarCheck}
          label="Demos Booked"
          value={analytics?.bookingsTriggered ?? "—"}
          accent="#FFB300"
        />
        <StatCard
          icon={Ticket}
          label="Tickets Created"
          value={analytics?.ticketsCreated ?? "—"}
          accent="#ef4444"
        />
        <StatCard
          icon={Sparkles}
          label="Avg Msgs/Session"
          value={analytics?.avgMessagesPerSession ?? "—"}
          accent="#06b6d4"
        />
      </div>

      {/* Main Content */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left Sidebar: Sessions List */}
        <div
          style={{
            width: "380px",
            background: "rgba(10,22,40,0.5)",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "1.25rem",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={15}
                style={{
                  position: "absolute",
                  left: "0.85rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(148,163,184,0.5)",
                }}
              />
              <input
                type="text"
                placeholder="Search sessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchSessions()}
                style={{
                  width: "100%",
                  padding: "0.6rem 1rem 0.6rem 2.4rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(0,0,0,0.3)",
                  outline: "none",
                  fontSize: "0.8125rem",
                  color: "white",
                }}
              />
            </div>
            <button
              onClick={() => {
                fetchSessions();
                fetchAnalytics();
              }}
              style={{
                width: 38,
                height: 38,
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(0,0,0,0.3)",
                color: "rgba(148,163,184,0.7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                flexShrink: 0,
              }}
              title="Refresh"
            >
              <RefreshCcw size={15} />
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto" }}>
            {loading ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "rgba(148,163,184,0.5)",
                  fontSize: "0.875rem",
                }}
              >
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div
                style={{
                  padding: "3rem",
                  textAlign: "center",
                  color: "rgba(148,163,184,0.5)",
                  fontSize: "0.875rem",
                }}
              >
                No sessions found.
                <br />
                <span style={{ fontSize: "0.75rem" }}>
                  AI conversations will appear here once visitors start chatting.
                </span>
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => fetchTranscript(session.id)}
                  style={{
                    padding: "1rem 1.25rem",
                    borderBottom: "1px solid rgba(255,255,255,0.03)",
                    cursor: "pointer",
                    background:
                      activeSession === session.id
                        ? "rgba(0,212,255,0.06)"
                        : "transparent",
                    borderLeft:
                      activeSession === session.id
                        ? `3px solid ${AGENT_COLORS[session.agent] || "#00D4FF"}`
                        : "3px solid transparent",
                    transition: "background 0.15s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.4rem",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          color: AGENT_COLORS[session.agent] || "#00D4FF",
                          background: `${AGENT_COLORS[session.agent] || "#00D4FF"}15`,
                          padding: "0.15rem 0.5rem",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {session.agent}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: "rgba(255,255,255,0.7)",
                          fontFamily: "monospace",
                        }}
                      >
                        {session.id.substring(0, 8)}…
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: "rgba(148,163,184,0.5)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Clock size={10} />
                      {formatTime(session.lastMessage)}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "rgba(148,163,184,0.7)",
                      lineHeight: 1.4,
                      marginBottom: "0.4rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {session.firstUserMessage || session.lastContent || "No messages"}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.65rem",
                        color: "rgba(148,163,184,0.4)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      <MessageSquare size={10} />
                      {session.messageCount} messages
                    </span>
                    <ChevronRight size={12} color="rgba(148,163,184,0.3)" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Content: Transcript Viewer */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            background: "#0a1628",
          }}
        >
          {activeSession && activeSessionData ? (
            <>
              {/* Transcript Header */}
              <div
                style={{
                  padding: "1rem 1.5rem",
                  borderBottom: "1px solid rgba(255,255,255,0.06)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "rgba(10,22,40,0.4)",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "Syne, sans-serif",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <Bot
                      size={18}
                      color={AGENT_COLORS[activeSessionData.agent] || "#00D4FF"}
                    />
                    {activeSessionData.agent} — Session Transcript
                  </h2>
                  <div
                    style={{
                      color: "rgba(148,163,184,0.5)",
                      fontSize: "0.75rem",
                      marginTop: "0.2rem",
                      fontFamily: "monospace",
                    }}
                  >
                    {activeSessionData.id} · {activeSessionData.messageCount}{" "}
                    messages · Started{" "}
                    {new Date(activeSessionData.firstMessage).toLocaleDateString()}{" "}
                    {formatFullTime(activeSessionData.firstMessage)}
                  </div>
                </div>
                {activeSessionData.agent === "Aria" && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      color: "#FFB300",
                      background: "rgba(255,179,0,0.1)",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "8px",
                      border: "1px solid rgba(255,179,0,0.2)",
                    }}
                  >
                    <Phone size={12} />
                    APPOINTMENT SETTER
                  </div>
                )}
              </div>

              {/* Transcript Body */}
              <div
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1.5rem 2rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {loadingTranscript ? (
                  <div
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      color: "rgba(148,163,184,0.5)",
                    }}
                  >
                    Loading transcript...
                  </div>
                ) : transcript.length === 0 ? (
                  <div
                    style={{
                      padding: "3rem",
                      textAlign: "center",
                      color: "rgba(148,163,184,0.5)",
                    }}
                  >
                    No messages in this session.
                  </div>
                ) : (
                  transcript.map((msg, i) => {
                    // Skip internal system logs
                    if (msg.content.startsWith("[Voice session")) return null;

                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          flexDirection:
                            msg.role === "user" ? "row-reverse" : "row",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "10px",
                            background:
                              msg.role === "user"
                                ? "rgba(59,130,246,0.15)"
                                : `${AGENT_COLORS[msg.agent_name] || "#00D4FF"}15`,
                            border:
                              msg.role === "agent"
                                ? `1px solid ${AGENT_COLORS[msg.agent_name] || "#00D4FF"}30`
                                : "1px solid rgba(59,130,246,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {msg.role === "user" ? (
                            <User size={14} color="#60a5fa" />
                          ) : (
                            <Bot
                              size={14}
                              color={
                                AGENT_COLORS[msg.agent_name] || "#00D4FF"
                              }
                            />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems:
                              msg.role === "user" ? "flex-end" : "flex-start",
                            maxWidth: "70%",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "0.65rem",
                              color: "rgba(148,163,184,0.4)",
                              marginBottom: "0.2rem",
                              fontWeight: 600,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                            }}
                          >
                            {msg.role === "user"
                              ? "Visitor"
                              : msg.agent_name}{" "}
                            <span style={{ fontWeight: 400, marginLeft: "0.35rem" }}>
                              {formatFullTime(msg.created_at)}
                            </span>
                          </div>
                          <div
                            style={{
                              padding: "0.75rem 1rem",
                              borderRadius:
                                msg.role === "user"
                                  ? "14px 4px 14px 14px"
                                  : "4px 14px 14px 14px",
                              background:
                                msg.role === "user"
                                  ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                                  : "rgba(255,255,255,0.04)",
                              color:
                                msg.role === "user"
                                  ? "white"
                                  : "rgba(226,232,240,0.9)",
                              border:
                                msg.role === "user"
                                  ? "none"
                                  : "1px solid rgba(255,255,255,0.06)",
                              fontSize: "0.8125rem",
                              lineHeight: 1.6,
                            }}
                          >
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </>
          ) : (
            <div
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                gap: "1rem",
                color: "rgba(148,163,184,0.3)",
              }}
            >
              <Bot size={48} />
              <div style={{ fontSize: "1rem", fontWeight: 600 }}>
                Select a session to view
              </div>
              <div style={{ fontSize: "0.8rem" }}>
                Choose a conversation from the sidebar
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
