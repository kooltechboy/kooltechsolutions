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
  const [summary, setSummary] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(true);
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

      // Fetch dynamic AI summary
      try {
        const res = await fetch("/api/portal/tickets/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ticketId: id })
        });
        const data = await res.json();
        if (data.summary) {
          setSummary(data.summary);
        } else {
          setSummary("No summary available.");
        }
      } catch {
        setSummary("Failed to generate ticket summary.");
      } finally {
        setLoadingSummary(false);
      }
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
      <div className="text-center py-16 px-4 text-neutral-500">
        <p className="mb-4 text-sm font-bold uppercase tracking-widest">Ticket not found</p>
        <Link href="/portal/tickets" className="text-[#00D4FF] hover:text-cyan-400 font-bold text-xs uppercase tracking-wider transition-colors">
          ← Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-6 mb-6 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all font-bold text-xs uppercase tracking-wider shadow-lg"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3 mb-1">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-syne truncate">{ticket.subject}</h1>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
              ticket.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25 shadow-[0_0_8px_rgba(0,212,255,0.08)]' :
              ticket.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400 border-amber-400/25' :
              ticket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
              'bg-white/5 text-neutral-400 border-white/10'
            }`}>
              {ticket.status.replace('_', ' ')}
            </span>
          </div>
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">
            Ticket #{ticket.id.toUpperCase()} · Opened on {new Date(ticket.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 flex-1 min-h-0">
        {/* Chat Area */}
        <div className="glass-card rounded-2xl border border-white/10 bg-[#0A1628]/80 flex flex-col overflow-hidden shadow-2xl relative">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
            {/* Original Description */}
            <div className="flex gap-4 max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                <User size={18} className="text-neutral-400" />
              </div>
              <div className="bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-2xl rounded-tl-none p-5 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed shadow-lg flex-1">
                <div className="text-[10px] font-black text-neutral-400 mb-2.5 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-500" /> Original Request
                </div>
                {ticket.description}
              </div>
            </div>

            <hr className="border-t border-white/5" />

            {/* Message Thread */}
            {messages.map((msg, idx) => {
              const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
              const isAdmin = senderObj?.role === 'admin' || senderObj?.role === 'agent';
              return (
                <div key={idx} className={`flex gap-4 max-w-3xl ${isAdmin ? 'animate-in slide-in-from-left-2' : 'flex-row-reverse self-end ml-auto animate-in slide-in-from-right-2'} duration-300`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border transition-all ${
                    isAdmin 
                      ? 'bg-gradient-to-br from-indigo-500/20 to-purple-600/20 text-[#00D4FF] border-[#00D4FF]/30 shadow-[#00D4FF]/5' 
                      : 'bg-gradient-to-br from-white/10 to-white/5 text-neutral-300 border-white/10'
                  }`}>
                    {isAdmin ? <ShieldCheck size={18} className="animate-pulse" /> : <User size={18} />}
                  </div>
                  <div className={`border rounded-2xl p-5 text-sm leading-relaxed shadow-xl max-w-xl transition-all hover:scale-[1.005] duration-200 ${
                    isAdmin 
                      ? 'bg-gradient-to-br from-indigo-950/40 to-[#0A1628]/80 border-[#00D4FF]/25 text-neutral-200 rounded-tl-none shadow-indigo-500/5' 
                      : 'bg-gradient-to-br from-cyan-950/30 to-[#0A1628]/80 border-white/10 text-neutral-200 rounded-tr-none'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        isAdmin ? 'text-[#00D4FF]' : 'text-neutral-400'
                      }`}>
                        {isAdmin ? `${senderObj?.first_name || ''} (KoolTech Support)` : 'You'}
                      </span>
                      <span className="text-[9px] text-neutral-500 font-medium">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="whitespace-pre-wrap text-neutral-300 text-[0.875rem]">{msg.message}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Input Area */}
          {ticket.status !== 'closed' && (
            <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
              <form onSubmit={handleSendMessage} className="relative">
                <textarea 
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type your reply..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-14 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all resize-none"
                  rows={2}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); } }}
                />
                <button 
                  type="submit" 
                  disabled={sending || !newMessage.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00D4FF] hover:bg-cyan-400 text-black rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                  {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="flex flex-col gap-6">
          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.01] shadow-2xl">
            <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 pb-2 border-b border-white/5">Ticket Details</h3>
            <div className="space-y-4">
              <div>
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">Priority</div>
                <div className={`flex items-center gap-2 font-bold text-sm uppercase ${
                  ticket.priority === 'critical' ? 'text-rose-400' :
                  ticket.priority === 'high' ? 'text-amber-400' :
                  ticket.priority === 'normal' ? 'text-blue-400' :
                  'text-neutral-400'
                }`}>
                  <AlertCircle size={14} /> {ticket.priority}
                </div>
              </div>
              <div>
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">Assigned Engineer</div>
                <div className="flex items-center gap-2 text-white font-bold text-sm">
                  {(() => {
                    const assigneeObj = Array.isArray(ticket.assigned_to) ? ticket.assigned_to[0] : ticket.assigned_to;
                    return assigneeObj ? (
                      <><ShieldCheck size={14} className="text-[#00D4FF]" /> {assigneeObj.first_name || ''} {assigneeObj.last_name || ''}</>
                    ) : 'Unassigned';
                  })()}
                </div>
              </div>
              <div>
                <div className="text-neutral-500 text-[10px] font-black uppercase tracking-wider mb-1">Last Activity</div>
                <div className="text-white font-bold text-sm">{new Date(ticket.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-white/10 bg-white/[0.01] shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={18} className="text-[#00D4FF]" />
              <h3 className="text-white text-xs font-black uppercase tracking-wider">Kira AI Summary</h3>
            </div>
            {loadingSummary ? (
              <div className="flex items-center gap-2 text-neutral-500 text-xs">
                <Loader2 className="animate-spin" size={12} /> Analyzing ticket...
              </div>
            ) : (
              <p className="text-neutral-400 text-xs leading-relaxed">
                {summary}
              </p>
            )}
          </div>

          {ticket.status !== 'resolved' && ticket.status !== 'closed' ? (
            <button
              onClick={handleMarkResolved}
              className="w-full py-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              ✓ Mark as Resolved
            </button>
          ) : (
            <button
              onClick={handleReopen}
              className="w-full py-3.5 rounded-xl bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] hover:bg-[#00D4FF]/20 hover:border-[#00D4FF]/50 transition-all font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              ⟲ Reopen Ticket
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
