"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, User, Bot, Clock, ShieldCheck, Loader2, CheckCircle, AlertCircle, MessageSquare } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ClientInfo {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

interface TicketInfo {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  client?: ClientInfo | ClientInfo[] | null;
}

interface MessageSender {
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface TicketMessageInfo {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  sender?: MessageSender | MessageSender[] | null;
}

interface PostgresChangesPayload {
  new: TicketMessageInfo;
}

export default function AdminTicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketInfo | null>(null);
  const [messages, setMessages] = useState<TicketMessageInfo[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchAiSummary = useCallback(async (ticketData: TicketInfo, msgs: TicketMessageInfo[]) => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai-workforce/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketData, messages: msgs }),
      });
      const data = await res.json();
      if (data.summary) setAiSummary(data.summary);
    } catch (e) {
      console.error('AI summary fetch failed', e);
    } finally {
      setAiLoading(false);
    }
  }, []);

  const fetchTicketData = useCallback(async () => {
    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, client:client_id(first_name, last_name, company_name)')
      .eq('id', id)
      .single();
    
    if (ticketData) {
      setTicket(ticketData as TicketInfo);
      
      const { data: msgs } = await supabase
        .from('ticket_messages')
        .select('*, sender:sender_id(first_name, last_name, role)')
        .eq('ticket_id', id)
        .order('created_at', { ascending: true });
      
      if (msgs) setMessages(msgs as TicketMessageInfo[]);
 
      // Fetch AI summary after data loads
      if (ticketData) fetchAiSummary(ticketData as TicketInfo, (msgs || []) as TicketMessageInfo[]);
    }
    setLoading(false);
  }, [id, supabase, fetchAiSummary]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTicketData();
    }, 0);
    
    const channel = supabase
      .channel(`admin-ticket-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, (payload: PostgresChangesPayload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, [id, supabase, fetchTicketData]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: id,
      sender_id: user?.id,
      message: newMessage,
      is_internal_note: isInternal
    });

    if (!error) {
      setNewMessage("");
      // Update ticket updated_at
      await supabase.from('tickets').update({ updated_at: new Date().toISOString() }).eq('id', id);
    }
    setSending(false);
  }

  async function updateStatus(status: string) {
    const { error } = await supabase.from('tickets').update({ status }).eq('id', id);
    if (!error) setTicket(prev => prev ? { ...prev, status } : null);
  }

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  if (!ticket) return <div>Ticket not found.</div>;

  const clientObj = Array.isArray(ticket.client) ? ticket.client[0] : ticket.client;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>{ticket.subject}</h1>
              <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)" }}>#{ticket.id.slice(0, 8)}</span>
            </div>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
              Client: <span style={{ color: "var(--color-accent-500)", fontWeight: 600 }}>{clientObj?.company_name || `${clientObj?.first_name || ''} ${clientObj?.last_name || ''}`.trim() || 'Unknown'}</span>
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <select 
            value={ticket.status}
            onChange={(e) => updateStatus(e.target.value)}
            style={{ 
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
              color: "white", padding: "0.5rem 1rem", borderRadius: "8px", outline: "none", fontWeight: 600
            }}
          >
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button onClick={() => updateStatus('resolved')} className="btn-primary" style={{ background: "var(--color-success)" }}>
            Resolve Ticket
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* Chat Area */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div ref={scrollRef} style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Original Issue */}
            <div style={{ background: "rgba(0,212,255,0.03)", padding: "1.25rem", borderRadius: "12px", border: "1px solid rgba(0,212,255,0.1)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <MessageSquare size={16} color="var(--color-accent-500)" />
                <span style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>Original Request</span>
              </div>
              <div style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{ticket.description}</div>
            </div>

            {messages.map((msg, idx) => {
              const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
              const isAdmin = senderObj?.role === 'admin' || senderObj?.role === 'agent';
              return (
                <div key={idx} style={{ 
                  display: "flex", gap: "1rem", 
                  background: msg.is_internal_note ? "rgba(255,179,0,0.05)" : "transparent",
                  padding: msg.is_internal_note ? "1rem" : 0,
                  borderRadius: msg.is_internal_note ? "8px" : 0,
                  border: msg.is_internal_note ? "1px dashed rgba(255,179,0,0.2)" : "none"
                }}>
                  <div style={{ 
                    width: 40, height: 40, borderRadius: "50%", 
                    background: isAdmin ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.05)", 
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 
                  }}>
                    {isAdmin ? <ShieldCheck size={20} color="var(--color-accent-500)" /> : <User size={20} color="var(--color-neutral-400)" />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: isAdmin ? "var(--color-accent-500)" : "white", fontWeight: 600, fontSize: "0.875rem" }}>
                        {isAdmin ? `${senderObj?.first_name || ''} (Team)` : `${clientObj?.first_name || ''} (Client)`}
                        {msg.is_internal_note && <span style={{ marginLeft: "0.5rem", color: "#FFB300", fontSize: "0.7rem", textTransform: "uppercase" }}>Internal Note</span>}
                      </span>
                      <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6 }}>{msg.message}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Admin Input */}
          <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
              <button 
                onClick={() => setIsInternal(false)}
                style={{ 
                  background: !isInternal ? "var(--color-accent-500)" : "rgba(255,255,255,0.05)", 
                  border: "none", color: "white", padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" 
                }}
              >
                Reply to Client
              </button>
              <button 
                onClick={() => setIsInternal(true)}
                style={{ 
                  background: isInternal ? "#FFB300" : "rgba(255,255,255,0.05)", 
                  border: "none", color: isInternal ? "black" : "white", padding: "0.4rem 1rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" 
                }}
              >
                Internal Note
              </button>
            </div>
            <form onSubmit={handleSendMessage} style={{ position: "relative" }}>
              <textarea 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder={isInternal ? "Write a private note for the team..." : "Send a response to the client..."}
                style={{ 
                  width: "100%", padding: "1rem 3.5rem 1rem 1.25rem", borderRadius: "12px", 
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${isInternal ? '#FFB30040' : 'rgba(255,255,255,0.1)'}`, 
                  color: "white", outline: "none", resize: "none", fontSize: "0.9375rem" 
                }}
                rows={2}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
              />
              <button 
                type="submit" 
                disabled={sending || !newMessage.trim()}
                style={{ 
                  position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
                  background: isInternal ? "#FFB300" : "var(--color-accent-500)", border: "none", width: 36, height: 36, 
                  borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", opacity: (sending || !newMessage.trim()) ? 0.5 : 1
                }}
              >
                {sending ? <Loader2 className="animate-spin" size={18} color={isInternal ? 'black' : 'white'} /> : <Send size={18} color={isInternal ? 'black' : 'white'} />}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase" }}>Ticket Info</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Priority</div>
                <div style={{ color: ticket.priority === 'critical' ? '#ef4444' : 'white', fontWeight: 700, fontSize: "1rem", textTransform: "capitalize" }}>{ticket.priority}</div>
              </div>
              <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }} />
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "0.5rem" }}>Client Contact</div>
                <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{clientObj?.first_name || ''} {clientObj?.last_name || ''}</div>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{clientObj?.company_name}</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <Bot size={20} color="var(--color-accent-500)" />
              <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700 }}>AI Intelligence</h3>
            </div>
            {aiLoading ? (
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>
                <Loader2 size={16} className="animate-spin" color="var(--color-accent-500)" />
                Max is analyzing this ticket...
              </div>
            ) : aiSummary ? (
              <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {aiSummary.split('\n').map((line, i) => {
                  if (line.startsWith('Suggested Fix:')) {
                    return <div key={i}><span style={{ color: "white", fontWeight: 700 }}>Suggested Fix:</span>{line.replace('Suggested Fix:', '')}</div>;
                  }
                  if (line.startsWith('Recommended Action:')) {
                    return <div key={i} style={{ marginTop: "0.75rem" }}><span style={{ color: "var(--color-accent-500)", fontWeight: 700 }}>Recommended Action:</span>{line.replace('Recommended Action:', '')}</div>;
                  }
                  return line ? <div key={i}>{line}</div> : null;
                })}
              </div>
            ) : (
              <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>No AI analysis available.</div>
            )}
            {!aiLoading && ticket && (
              <button
                onClick={() => fetchAiSummary(ticket, messages)}
                style={{ marginTop: "1rem", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", fontSize: "0.75rem", fontWeight: 600, padding: "0.4rem 0.875rem", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem" }}
              >
                ↻ Re-analyze
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
