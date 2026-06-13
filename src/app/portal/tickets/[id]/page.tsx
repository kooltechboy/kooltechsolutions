"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, User, Bot, Clock, ShieldCheck, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Assignee {
  first_name?: string;
  last_name?: string;
}

interface PortalTicket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  assigned_to?: Assignee | Assignee[] | null;
}

interface MessageSender {
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface PortalTicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  sender?: MessageSender | MessageSender[] | null;
}

interface PostgresChangesPayload {
  new: PortalTicketMessage;
}

export default function TicketDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [ticket, setTicket] = useState<PortalTicket | null>(null);
  const [messages, setMessages] = useState<PortalTicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchTicketData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: ticketData } = await supabase
      .from('tickets')
      .select('*, assigned_to(first_name, last_name)')
      .eq('id', id)
      .eq('client_id', user.id)
      .single();
    
    if (ticketData) {
      setTicket(ticketData as PortalTicket);
      
      const { data: msgs } = await supabase
        .from('ticket_messages')
        .select('*, sender:sender_id(first_name, last_name, role)')
        .eq('ticket_id', id)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });
      
      if (msgs) setMessages(msgs as PortalTicketMessage[]);
    }
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTicketData();
    }, 0);
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`ticket-${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${id}` }, async (payload: PostgresChangesPayload) => {
        const newMessage = payload.new;
        if (newMessage.is_internal_note) return;

        // Fetch sender metadata dynamically to avoid showing "You" for admin messages in real-time
        const { data: senderProfile } = await supabase
          .from('profiles')
          .select('first_name, last_name, role')
          .eq('id', newMessage.sender_id)
          .single();

        const messageWithSender = {
          ...newMessage,
          sender: senderProfile || null
        };

        setMessages(prev => {
          if (prev.some(m => m.id === messageWithSender.id)) return prev;
          return [...prev, messageWithSender];
        });
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
      is_internal_note: false
    });

    if (!error) {
      setNewMessage("");
    }
    setSending(false);
  }

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  async function handleMarkResolved() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('tickets').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', id).eq('client_id', user.id);
    setTicket(prev => prev ? { ...prev, status: 'resolved' } : prev);
  }

  async function handleReopen() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('tickets').update({ status: 'open', updated_at: new Date().toISOString() }).eq('id', id).eq('client_id', user.id);
    setTicket(prev => prev ? { ...prev, status: 'open' } : prev);
  }

  if (!ticket) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-neutral-500)' }}>
        <p>Ticket not found.</p>
        <Link href="/portal/tickets" style={{ color: 'var(--color-accent-500)', fontWeight: 600, fontSize: '0.875rem' }}>← Back to tickets</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <ArrowLeft size={18} /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif" }}>{ticket.subject}</h1>
            <span style={{ 
              padding: "0.25rem 0.75rem", borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700, 
              background: "rgba(0,212,255,0.1)", color: "var(--color-accent-500)", textTransform: "uppercase" 
            }}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Ticket #{ticket.id.slice(0, 8)} · Opened on {new Date(ticket.created_at).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="portal-ticket-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "1.5rem", flex: 1, minHeight: 0 }}>
        {/* Chat Area */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
          <div ref={scrollRef} style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Original Description */}
            <div style={{ display: "flex", gap: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <User size={20} color="var(--color-neutral-400)" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
                  <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>You (Opening Request)</span>
                  <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{new Date(ticket.created_at).toLocaleTimeString()}</span>
                </div>
                <div style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                  {ticket.description}
                </div>
              </div>
            </div>

            <hr style={{ border: 0, borderTop: "1px solid rgba(255,255,255,0.05)" }} />

            {/* Message Thread */}
            {messages.map((msg, idx) => {
              const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
              const isAdmin = senderObj?.role === 'admin' || senderObj?.role === 'agent';
              return (
                <div key={idx} style={{ display: "flex", gap: "1rem" }}>
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
                        {isAdmin ? `${senderObj?.first_name || ''} (KoolTech Support)` : 'You'}
                      </span>
                      <span style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{new Date(msg.created_at).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ color: "var(--color-neutral-300)", fontSize: "0.9375rem", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Input Area */}
          <div style={{ padding: "1.5rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
            <form onSubmit={handleSendMessage} style={{ position: "relative" }}>
              <textarea 
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Type your response here..."
                style={{ 
                  width: "100%", padding: "1rem 3.5rem 1rem 1.25rem", borderRadius: "12px", 
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", 
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
                  background: "var(--color-accent-500)", border: "none", width: 36, height: 36, 
                  borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", opacity: (sending || !newMessage.trim()) ? 0.5 : 1
                }}
              >
                {sending ? <Loader2 className="animate-spin" size={18} color="white" /> : <Send size={18} color="white" />}
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Ticket Details</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Priority</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: ticket.priority === 'critical' ? '#ef4444' : 'white', fontWeight: 600, fontSize: "0.875rem" }}>
                  <AlertCircle size={14} /> {ticket.priority.toUpperCase()}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Assigned Engineer</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "white", fontWeight: 500, fontSize: "0.875rem" }}>
                  {(() => {
                    const assigneeObj = Array.isArray(ticket.assigned_to) ? ticket.assigned_to[0] : ticket.assigned_to;
                    return assigneeObj ? (
                      <><ShieldCheck size={14} color="var(--color-accent-500)" /> {assigneeObj.first_name || ''} {assigneeObj.last_name || ''}</>
                    ) : 'Unassigned';
                  })()}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "0.25rem" }}>Last Activity</div>
                <div style={{ color: "white", fontSize: "0.875rem" }}>{new Date(ticket.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <Bot size={20} color="var(--color-accent-500)" />
              <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700 }}>Kira AI Summary</h3>
            </div>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
              {ticket.description.slice(0, 180)}{ticket.description.length > 180 ? '...' : ''}
            </p>
          </div>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <button
              onClick={handleMarkResolved}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: '10px',
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.08)')}
            >
              ✓ Mark as Resolved
            </button>
          ) : (
            <button
              onClick={handleReopen}
              style={{
                width: '100%', padding: '0.875rem', borderRadius: '10px',
                background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.3)',
                color: 'var(--color-accent-500)', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.08)')}
            >
              ⟲ Reopen Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
