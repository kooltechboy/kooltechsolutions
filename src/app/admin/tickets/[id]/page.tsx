"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Send, CheckCircle2, Clock, AlertCircle,
  MessageSquare, User, Loader2, ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface TicketNote {
  id: string;
  ticket_id: string;
  body: string;
  author_name: string;
  is_internal: boolean;
  created_at: string;
}

interface TicketDetails {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at?: string;
  client?: { first_name?: string; last_name?: string; company_name?: string; email?: string } | null;
  assignee?: { first_name?: string; last_name?: string } | null;
}

interface TicketMessageRow {
  id: string;
  ticket_id: string;
  message: string;
  is_internal_note?: boolean;
  created_at: string;
  sender?: { first_name?: string; last_name?: string; role?: string } | Array<{ first_name?: string; last_name?: string; role?: string }> | null;
}

const STATUS_OPTIONS = ["open", "in_progress", "resolved", "closed", "critical"];

function statusStyle(status: string) {
  switch (status) {
    case "critical": return { bg: "rgba(239,68,68,0.1)", color: "#ef4444", icon: <AlertCircle size={14} /> };
    case "open":     return { bg: "rgba(59,130,246,0.1)", color: "#3b82f6", icon: <MessageSquare size={14} /> };
    case "in_progress": return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b", icon: <Clock size={14} /> };
    case "resolved": return { bg: "rgba(16,185,129,0.1)", color: "#10b981", icon: <CheckCircle2 size={14} /> };
    case "closed":   return { bg: "rgba(107,114,128,0.1)", color: "#6b7280", icon: <CheckCircle2 size={14} /> };
    default:         return { bg: "rgba(107,114,128,0.1)", color: "#6b7280", icon: <MessageSquare size={14} /> };
  }
}

function priorityColor(p: string) {
  if (p === "critical") return "#ef4444";
  if (p === "high") return "#f59e0b";
  if (p === "medium") return "#3b82f6";
  return "#6b7280";
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function mapMessageToNote(msg: TicketMessageRow): TicketNote {
  const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
  const author_name = senderObj 
    ? `${senderObj.first_name || ''} ${senderObj.last_name || ''}`.trim() || senderObj.role || 'Support'
    : 'System';
  return {
    id: msg.id,
    ticket_id: msg.ticket_id,
    body: msg.message,
    author_name,
    is_internal: msg.is_internal_note || false,
    created_at: msg.created_at
  };
}

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const supabase = createClient();

  const [ticket, setTicket] = useState<TicketDetails | null>(null);
  const [notes, setNotes] = useState<TicketNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [generatingSuggestion, setGeneratingSuggestion] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      const [ticketRes, notesRes] = await Promise.all([
        supabase
          .from("tickets")
          .select("*, client:client_id(first_name, last_name, company_name, email), assignee:assigned_to(first_name, last_name)")
          .eq("id", id)
          .single(),
        supabase
          .from("ticket_messages")
          .select("*, sender:sender_id(first_name, last_name, role)")
          .eq("ticket_id", id)
          .order("created_at", { ascending: true }),
      ]);

      if (ticketRes.data) {
        const t = ticketRes.data;
        const clientRaw = Array.isArray(t.client) ? t.client[0] : t.client;
        const assigneeRaw = Array.isArray(t.assignee) ? t.assignee[0] : t.assignee;
        setTicket({ ...t, client: clientRaw, assignee: assigneeRaw });
      }
      if (notesRes.data) setNotes(notesRes.data.map(mapMessageToNote));
      setLoading(false);
    }
    load();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [notes]);

  const handleSendNote = async () => {
    if (!newNote.trim()) return;
    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSending(false);
      return;
    }
    const { data, error } = await supabase
      .from("ticket_messages")
      .insert([{
        ticket_id: id,
        sender_id: user.id,
        message: newNote.trim(),
        is_internal_note: isInternal,
      }])
      .select("*, sender:sender_id(first_name, last_name, role)")
      .single();

    if (!error && data) {
      setNotes((prev) => [...prev, mapMessageToNote(data)]);
      setNewNote("");
    }
    setSending(false);
  };

  async function handleGenerateSuggestion() {
    setGeneratingSuggestion(true);
    setAiSuggestion("");
    try {
      const res = await fetch("/api/admin/tickets/suggest-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId: id })
      });
      const data = await res.json();
      if (data.suggestion) {
        setAiSuggestion(data.suggestion);
      } else {
        setAiSuggestion("Could not generate a suggestion.");
      }
    } catch {
      setAiSuggestion("Error contacting AI copilot.");
    } finally {
      setGeneratingSuggestion(false);
    }
  }

  function handleApplySuggestion() {
    if (aiSuggestion) {
      setNewNote(aiSuggestion);
      setIsInternal(false);
      setAiSuggestion("");
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setUpdatingStatus(true);
    setStatusOpen(false);
    const { error } = await supabase.from("tickets").update({ status: newStatus }).eq("id", id);
    if (!error && ticket) setTicket({ ...ticket, status: newStatus });
    setUpdatingStatus(false);
  };

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div style={{ padding: "2rem", color: "var(--color-neutral-400)" }}>
        Ticket not found.{" "}
        <Link href="/admin/tickets" style={{ color: "var(--color-accent-500)" }}>Go back</Link>
      </div>
    );
  }

  const ss = statusStyle(ticket.status);
  const clientName = ticket.client
    ? ticket.client.company_name || `${ticket.client.first_name ?? ""} ${ticket.client.last_name ?? ""}`.trim()
    : "Unknown Client";

  return (
    <div style={{ padding: "2rem", maxWidth: "1100px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/admin/tickets" style={{ color: "var(--color-neutral-400)", textDecoration: "none", display: "flex", alignItems: "center" }}>
          <ArrowLeft size={20} />
        </Link>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.5rem", color: "white", margin: 0 }}>
              {ticket.subject}
            </h1>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              padding: "0.3rem 0.75rem", borderRadius: "999px",
              background: ss.bg, color: ss.color, fontSize: "0.75rem", fontWeight: 700, textTransform: "capitalize",
            }}>
              {ss.icon} {ticket.status.replace("_", " ")}
            </span>
            <span style={{
              padding: "0.3rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase",
              color: priorityColor(ticket.priority), background: `${priorityColor(ticket.priority)}1a`,
            }}>
              {ticket.priority}
            </span>
          </div>
          <div style={{ display: "flex", gap: "1.5rem", marginTop: "0.5rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
            <span>#{ticket.id.slice(0, 8)}</span>
            <span>Client: <strong style={{ color: "var(--color-neutral-300)" }}>{clientName}</strong></span>
            {ticket.client?.email && <span>{ticket.client.email}</span>}
            <span>Opened {timeAgo(ticket.created_at)}</span>
          </div>
        </div>

        {/* Status Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setStatusOpen((o) => !o)}
            disabled={updatingStatus}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1rem", borderRadius: "8px",
              background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
              color: "var(--color-accent-400)", fontSize: "0.875rem", fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {updatingStatus ? <Loader2 size={14} className="animate-spin" /> : null}
            Change Status <ChevronDown size={16} />
          </button>
          {statusOpen && (
            <div style={{
              position: "absolute", right: 0, top: "110%", zIndex: 100,
              background: "#0D1526", border: "1px solid rgba(0,212,255,0.2)", borderRadius: "8px",
              overflow: "hidden", minWidth: "160px", boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(s)}
                  style={{
                    display: "block", width: "100%", textAlign: "left",
                    padding: "0.625rem 1rem", background: s === ticket.status ? "rgba(0,212,255,0.05)" : "none",
                    border: "none", color: statusStyle(s).color, fontSize: "0.875rem", fontWeight: 600,
                    cursor: "pointer", textTransform: "capitalize",
                  }}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>
        {/* Thread */}
        <div>
          {/* Original description */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", marginBottom: "1rem", borderLeft: "3px solid var(--color-accent-500)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <User size={18} color="var(--color-accent-400)" />
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 600, fontSize: "0.9rem" }}>{clientName}</div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{timeAgo(ticket.created_at)}</div>
              </div>
            </div>
            <p style={{ color: "var(--color-neutral-300)", fontSize: "0.9rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
              {ticket.description || "No description provided."}
            </p>
          </div>

          {/* Notes thread */}
          {notes.map((note) => (
            <div
              key={note.id}
              className="glass-card"
              style={{
                padding: "1.25rem 1.5rem", borderRadius: "12px", marginBottom: "0.75rem",
                borderLeft: note.is_internal
                  ? "3px solid rgba(168,85,247,0.6)"
                  : "3px solid rgba(0,230,118,0.4)",
                opacity: 1,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%",
                  background: note.is_internal ? "rgba(168,85,247,0.15)" : "rgba(0,230,118,0.1)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <User size={16} color={note.is_internal ? "#a855f7" : "var(--color-success)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{note.author_name}</span>
                    {note.is_internal && (
                      <span style={{ padding: "0.15rem 0.5rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 700, background: "rgba(168,85,247,0.15)", color: "#a855f7" }}>
                        INTERNAL
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{timeAgo(note.created_at)}</div>
                </div>
              </div>
              <p style={{ color: "var(--color-neutral-300)", fontSize: "0.875rem", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>
                {note.body}
              </p>
            </div>
          ))}
          <div ref={bottomRef} />

          {/* Reply box */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", marginTop: "1rem" }}>
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <button
                onClick={() => setIsInternal(false)}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                  background: !isInternal ? "rgba(0,230,118,0.1)" : "transparent",
                  border: !isInternal ? "1px solid rgba(0,230,118,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: !isInternal ? "var(--color-success)" : "var(--color-neutral-500)",
                }}
              >
                Reply to Client
              </button>
              <button
                onClick={() => setIsInternal(true)}
                style={{
                  padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.8125rem", fontWeight: 600, cursor: "pointer",
                  background: isInternal ? "rgba(168,85,247,0.1)" : "transparent",
                  border: isInternal ? "1px solid rgba(168,85,247,0.3)" : "1px solid rgba(255,255,255,0.08)",
                  color: isInternal ? "#a855f7" : "var(--color-neutral-500)",
                }}
              >
                Internal Note
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSendNote();
              }}
              placeholder={isInternal ? "Add an internal note (not visible to client)..." : "Type your reply to the client..."}
              style={{
                width: "100%", minHeight: "120px", padding: "1rem",
                background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px", color: "white", fontSize: "0.9rem",
                resize: "vertical", outline: "none", boxSizing: "border-box",
                lineHeight: 1.6,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.75rem" }}>
              <span style={{ color: "var(--color-neutral-600)", fontSize: "0.75rem" }}>Ctrl+Enter to send</span>
              <button
                onClick={handleSendNote}
                disabled={sending || !newNote.trim()}
                className="btn-primary"
                style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem 1.25rem", borderRadius: "8px", fontSize: "0.875rem" }}
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {isInternal ? "Add Note" : "Send Reply"}
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Details */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Ticket Details
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                { label: "Status", value: <span style={{ color: ss.color, textTransform: "capitalize" }}>{ticket.status.replace("_", " ")}</span> },
                { label: "Priority", value: <span style={{ color: priorityColor(ticket.priority), textTransform: "uppercase", fontSize: "0.75rem", fontWeight: 700 }}>{ticket.priority}</span> },
                { label: "Client", value: clientName },
                { label: "Email", value: ticket.client?.email || "—" },
                {
                  label: "Assignee",
                  value: ticket.assignee
                    ? `${ticket.assignee.first_name ?? ""} ${ticket.assignee.last_name ?? ""}`.trim()
                    : "Unassigned",
                },
                { label: "Opened", value: new Date(ticket.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                  <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>{label}</span>
                  <span style={{ color: "var(--color-neutral-300)", fontSize: "0.8125rem", fontWeight: 500, textAlign: "right" }}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Thread Summary */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Activity
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Total replies</span>
                <span style={{ color: "white", fontWeight: 700 }}>{notes.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Internal notes</span>
                <span style={{ color: "#a855f7", fontWeight: 700 }}>{notes.filter((n) => n.is_internal).length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>Client replies</span>
                <span style={{ color: "var(--color-success)", fontWeight: 700 }}>{notes.filter((n) => !n.is_internal).length}</span>
              </div>
            </div>
          </div>

          {/* AI Copilot */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.02)" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "var(--color-accent-400)", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🤖 AI Copilot
            </h3>
            {aiSuggestion ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{
                  padding: "0.75rem", background: "rgba(0,0,0,0.3)", borderRadius: "8px",
                  fontSize: "0.75rem", color: "var(--color-neutral-300)", lineHeight: 1.5,
                  maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-wrap", border: "1px solid rgba(255,255,255,0.05)"
                }}>
                  {aiSuggestion}
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    onClick={handleApplySuggestion}
                    style={{ flex: 1, padding: "0.5rem", borderRadius: "6px", background: "var(--color-accent-500)", border: "none", color: "black", fontWeight: 700, fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Use Draft
                  </button>
                  <button
                    onClick={() => setAiSuggestion("")}
                    style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "white", fontSize: "0.75rem", cursor: "pointer" }}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleGenerateSuggestion}
                disabled={generatingSuggestion}
                style={{
                  width: "100%", padding: "0.625rem", borderRadius: "8px",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
                  color: "var(--color-accent-400)", fontWeight: 600, fontSize: "0.8125rem",
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem"
                }}
              >
                {generatingSuggestion ? (
                  <><Loader2 size={14} className="animate-spin" /> Drafting...</>
                ) : (
                  "💡 Draft AI Reply"
                )}
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "12px" }}>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: "0.875rem", fontWeight: 700, color: "white", marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Quick Actions
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <button
                onClick={() => handleStatusChange("resolved")}
                style={{ padding: "0.625rem", borderRadius: "8px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}
              >
                ✓ Mark as Resolved
              </button>
              <button
                onClick={() => handleStatusChange("closed")}
                style={{ padding: "0.625rem", borderRadius: "8px", background: "rgba(107,114,128,0.1)", border: "1px solid rgba(107,114,128,0.2)", color: "#6b7280", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}
              >
                × Close Ticket
              </button>
              <button
                onClick={() => router.push("/admin/tickets")}
                style={{ padding: "0.625rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(255,255,255,0.08)", color: "var(--color-neutral-400)", fontWeight: 600, fontSize: "0.8125rem", cursor: "pointer" }}
              >
                ← Back to Queue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
