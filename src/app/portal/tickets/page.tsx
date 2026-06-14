"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, AlertCircle, CheckCircle2, Clock, Search, Plus, Loader2, 
  MessageSquare, Shield, Zap, X, User, Activity, LifeBuoy, Send, 
  ShieldCheck, Bot, Info, PhoneCall, ShieldAlert, ChevronRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface Assignee {
  first_name?: string;
  last_name?: string;
}

interface TicketData {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  assigned_to?: Assignee | Assignee[] | null;
}

interface TicketWithCount extends TicketData {
  messageCount: number;
}

interface MessageSender {
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  is_internal_note: boolean;
  created_at: string;
  sender?: MessageSender | MessageSender[] | null;
}

export default function ClientTicketsPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<TicketWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'normal' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState<'all' | 'open' | 'resolved' | 'closed'>('all');
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Fetch Tickets List
  useEffect(() => {
    async function fetchMyTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tickets')
        .select('*, assigned_to(first_name, last_name)')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const ticketIds = data.map(t => t.id);
        const countMap: Record<string, number> = {};
        if (ticketIds.length > 0) {
          const { data: msgCounts } = await supabase
            .from('ticket_messages')
            .select('ticket_id')
            .in('ticket_id', ticketIds)
            .eq('is_internal_note', false);
          if (msgCounts) {
            msgCounts.forEach(row => {
              countMap[row.ticket_id] = (countMap[row.ticket_id] || 0) + 1;
            });
          }
        }
        setTickets(data.map(t => ({ ...t, messageCount: countMap[t.id] || 0 })));
      }
      setLoading(false);
    }
    fetchMyTickets();
  }, [supabase, refreshKey]);

  // Subscribe to ticket list changes for real-time status and update notifications
  useEffect(() => {
    let channel: any;
    async function subscribeTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      channel = supabase
        .channel('client-tickets-list-realtime')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `client_id=eq.${user.id}` }, () => {
          setRefreshKey(k => k + 1);
        })
        .subscribe();
    }
    subscribeTickets();
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [supabase]);

  // Fetch Messages for Selected Ticket
  useEffect(() => {
    if (!selectedTicketId) {
      setMessages([]);
      return;
    }
    async function fetchMessages() {
      const { data: msgs } = await supabase
        .from('ticket_messages')
        .select('*, sender:sender_id(first_name, last_name, role)')
        .eq('ticket_id', selectedTicketId)
        .eq('is_internal_note', false)
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs as TicketMessage[]);
    }
    fetchMessages();

    // Supabase Realtime for Messages
    const channel = supabase
      .channel(`ticket-${selectedTicketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicketId}` }, async (payload) => {
        const newMessage = payload.new as TicketMessage;
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

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicketId, supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const res = await fetch('/api/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, client_id: user.id })
    });
    
    if (res.ok) {
      const data = await res.json();
      setForm({ subject: '', description: '', priority: 'normal' });
      setShowNewForm(false);
      setRefreshKey(k => k + 1);
      if (data.ticketId) setSelectedTicketId(data.ticketId);
    }
    setSubmitting(false);
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || sendingMsg || !selectedTicketId) return;
    setSendingMsg(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from('ticket_messages').insert({
      ticket_id: selectedTicketId,
      sender_id: user?.id,
      message: newMessage,
      is_internal_note: false
    });
    if (!error) setNewMessage('');
    setSendingMsg(false);
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col gap-4 items-center justify-center">
        <Loader2 className="animate-spin" color="#00D4FF" size={40} />
        <p className="text-neutral-500 font-syne uppercase tracking-widest text-xs font-bold animate-pulse">Loading Support Desk...</p>
      </div>
    );
  }

  // Count active vs total for KPIs
  const activeTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved').length;

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = !searchQuery.trim() ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = 
      selectedTab === 'all' || 
      t.status === selectedTab;

    return matchesSearch && matchesTab;
  });

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden max-w-[1600px] mx-auto animate-in fade-in duration-500 gap-6">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 font-syne uppercase">
            Support <span className="text-[#00D4FF]">Desk</span>
          </h1>
          <p className="text-neutral-400 text-sm">Direct, SLA-backed link to senior infrastructure engineering.</p>
        </div>
        <button 
          onClick={() => { setShowNewForm(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-white font-bold text-xs uppercase tracking-wider hover:from-[#00D4FF] hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-cyan-500/10 shrink-0 self-start md:self-auto"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* KPI stats summary block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4 relative overflow-hidden shadow-xl shadow-black/10">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#00D4FF]" />
          <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Active Requests</div>
            <div className="text-2xl font-black text-white mt-0.5">{activeTickets}</div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4 relative overflow-hidden shadow-xl shadow-black/10">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-[#10B981]" />
          <div className="w-10 h-10 rounded-xl bg-[#10B981]/10 flex items-center justify-center text-[#10B981] border border-[#10B981]/20">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Resolved Requests</div>
            <div className="text-2xl font-black text-white mt-0.5">{resolvedTickets}</div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4 relative overflow-hidden shadow-xl shadow-black/10">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-violet-500" />
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">SLA Standard</div>
            <div className="text-2xl font-black text-white mt-0.5">100%</div>
          </div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/5 bg-white/[0.01] flex items-center gap-4 relative overflow-hidden shadow-xl shadow-black/10">
          <div className="absolute top-0 left-0 bottom-0 w-[3px] bg-amber-500" />
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 border border-amber-500/20">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-500">Avg First Response</div>
            <div className="text-2xl font-black text-white mt-0.5">&lt; 15m</div>
          </div>
        </div>
      </div>

      {/* Split Pane Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LEFT PANE: Ticket List */}
        <div className="w-[380px] lg:w-[420px] flex flex-col shrink-0 glass-card rounded-2xl border border-white/10 bg-[#0A1628]/45 overflow-hidden shadow-2xl">
          {/* Search Box */}
          <div className="p-4 border-b border-white/5 bg-white/[0.01] space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search requests by ID or subject..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/45 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all placeholder:text-neutral-600"
              />
            </div>
            {/* Quick Status Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-black/30 rounded-lg">
              {(['all', 'open', 'resolved', 'closed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all duration-200 ${
                    selectedTab === tab
                      ? 'bg-[#00D4FF] text-black shadow-md'
                      : 'text-neutral-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tickets list body */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2.5 custom-scrollbar bg-black/10">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Ticket size={36} className="mx-auto text-neutral-700 mb-3" />
                <p className="text-neutral-500 text-xs font-black uppercase tracking-wider">No tickets found</p>
                <p className="text-neutral-600 text-[10px] mt-1">Try modifying your tab filters or search query.</p>
              </div>
            ) : filteredTickets.map(t => {
              const isActive = selectedTicketId === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => { setSelectedTicketId(t.id); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative border ${
                    isActive 
                      ? 'bg-[#00D4FF]/10 border-[#00D4FF]/40 shadow-lg shadow-cyan-500/5' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.04] hover:border-white/15 hover:shadow-lg hover:shadow-black/25'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3.5 bottom-3.5 w-[3px] bg-[#00D4FF] rounded-r-full shadow-[0_0_10px_#00D4FF]" />
                  )}
                  <div className="flex justify-between items-center mb-2.5">
                    <span className="text-[10px] font-black text-neutral-500 font-mono tracking-wider">#{t.id.slice(0, 8).toUpperCase()}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${
                      t.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25 shadow-[0_0_8px_rgba(0,212,255,0.08)]' :
                      t.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400 border-amber-400/25' :
                      t.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25' :
                      'bg-white/5 text-neutral-400 border-white/10'
                    }`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-2.5 line-clamp-1 transition-colors ${isActive ? 'text-white' : 'text-neutral-300'}`}>{t.subject}</h3>
                  <div className="flex items-center justify-between text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(t.created_at).toLocaleDateString()}</span>
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${
                        t.priority === 'critical' ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e] animate-pulse' :
                        t.priority === 'high' ? 'bg-amber-400' :
                        t.priority === 'normal' ? 'bg-blue-400' :
                        'bg-neutral-500'
                      }`} title={`Priority: ${t.priority}`} />
                      {t.messageCount > 0 && (
                        <span className="flex items-center gap-1"><MessageSquare size={12}/> {t.messageCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Detail / Chat / Help Dashboard */}
        <div className="flex-1 flex flex-col min-w-0 glass-card rounded-2xl border border-white/10 bg-[#0A1628]/80 overflow-hidden shadow-2xl relative">
          
          {selectedTicket ? (
            /* Ticket Detail View */
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
              {/* Detail Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
                <div className="flex justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white leading-tight">{selectedTicket.subject}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        selectedTicket.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25' :
                        selectedTicket.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400 border-amber-400/25' :
                        selectedTicket.status === 'resolved' ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/25' :
                        'bg-white/5 text-neutral-400 border-white/10'
                      }`}>
                        {selectedTicket.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#00D4FF]"/> ID: {selectedTicket.id.slice(0, 8).toUpperCase()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(selectedTicket.created_at).toLocaleString()}</span>
                      {selectedTicket.priority === 'critical' && (
                        <span className="flex items-center gap-1.5 text-[#ef4444]"><AlertCircle size={14}/> CRITICAL</span>
                      )}
                    </div>
                  </div>
                  <div>
                    {selectedTicket.status === 'closed' || selectedTicket.status === 'resolved' ? (
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from('tickets')
                            .update({ status: 'open', updated_at: new Date().toISOString() })
                            .eq('id', selectedTicket.id);
                          if (!error) {
                            setRefreshKey(k => k + 1);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 hover:bg-[#00D4FF]/20 transition-all font-bold text-[10px] uppercase tracking-wider"
                      >
                        Reopen Ticket
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          const { error } = await supabase
                            .from('tickets')
                            .update({ status: 'closed', updated_at: new Date().toISOString() })
                            .eq('id', selectedTicket.id);
                          if (!error) {
                            setRefreshKey(k => k + 1);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold text-[10px] uppercase tracking-wider"
                      >
                        Close Ticket
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Chat Feed */}
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
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Messages */}
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
                            {isAdmin ? `${senderObj?.first_name || 'Support'} (Engineer)` : 'You'}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-medium">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-neutral-300 text-[0.875rem]">{msg.message}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Message Input */}
              {selectedTicket.status !== 'closed' && (
                <div className="p-4 border-t border-white/10 bg-black/40 shrink-0">
                  <form onSubmit={handleSendMessage} className="relative">
                    <textarea 
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e); }}}
                      placeholder="Type your reply..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3.5 pl-4 pr-14 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all resize-none"
                      rows={2}
                    />
                    <button 
                      type="submit" 
                      disabled={sendingMsg || !newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00D4FF] hover:bg-cyan-400 text-black rounded-lg flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                    >
                      {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT: Support Command Center Welcome Panel */
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-black/10 animate-in fade-in duration-300">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Header */}
                <div className="flex items-center gap-4 pb-6 border-b border-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-lg shadow-cyan-500/5">
                    <LifeBuoy size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-syne tracking-tight uppercase">Support Operations Center</h2>
                    <p className="text-neutral-400 text-xs">Direct access to L3 security and cloud infrastructure support.</p>
                  </div>
                </div>

                {/* Operations Pulse Bar */}
                <div className="glass-card p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.02] flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <div>
                      <div className="text-xs font-black uppercase tracking-wider text-emerald-400">All Engineers Active</div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Average live chat response time is currently 4.8 minutes.</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Operational</span>
                </div>

                {/* Support SLA matrix */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-[#00D4FF]/25 transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-[#ef4444]/10 flex items-center justify-center text-[#ef4444] border border-[#ef4444]/20 mb-3">
                      <ShieldAlert size={16} />
                    </div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">Sev 1 - Critical</h4>
                    <p className="text-neutral-500 text-[10px] uppercase mt-0.5 font-bold tracking-wider">&lt; 1 Hour Target</p>
                    <p className="text-neutral-400 text-xs leading-relaxed mt-2">Production down or security event. 24/7/365 pager response.</p>
                  </div>
                  
                  <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-amber-400/25 transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/10 flex items-center justify-center text-amber-400 border border-amber-400/20 mb-3">
                      <AlertCircle size={16} />
                    </div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">Sev 2 - High</h4>
                    <p className="text-neutral-500 text-[10px] uppercase mt-0.5 font-bold tracking-wider">&lt; 4 Hours Target</p>
                    <p className="text-neutral-400 text-xs leading-relaxed mt-2">Operational issues affecting major features or users.</p>
                  </div>

                  <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] hover:border-blue-400/25 transition-all duration-300">
                    <div className="w-8 h-8 rounded-lg bg-blue-400/10 flex items-center justify-center text-blue-400 border border-blue-400/20 mb-3">
                      <Clock size={16} />
                    </div>
                    <h4 className="text-xs font-black uppercase text-white tracking-wide">Sev 3 - Normal</h4>
                    <p className="text-neutral-500 text-[10px] uppercase mt-0.5 font-bold tracking-wider">&lt; 12 Hours Target</p>
                    <p className="text-neutral-400 text-xs leading-relaxed mt-2">General inquiries, password resets, or system changes.</p>
                  </div>
                </div>

                {/* Kira AI shortcuts */}
                <div className="glass-card p-6 rounded-2xl border border-white/5 bg-gradient-to-r from-violet-500/[0.02] to-[#0A1628]/40 hover:border-violet-500/25 transition-all duration-300 flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20 shadow-lg shrink-0">
                    <Bot size={28} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black uppercase text-white tracking-wider">Need Instant Resolution?</h4>
                    <p className="text-neutral-400 text-xs leading-relaxed mt-1">Our autonomous agent Kira can verify cloud servers, sync asset telemetries, and diagnose network routing issues in seconds without waiting for a ticket queue.</p>
                    <button 
                      onClick={() => router.push('/portal/ai-assistant')} 
                      className="text-[#00D4FF] text-[10px] font-black uppercase tracking-wider hover:text-cyan-400 mt-2.5 transition-colors flex items-center gap-1"
                    >
                      Launch Kira Assistant <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Help Contacts & Hours */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0 border border-white/5">
                      <Info size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-white tracking-wider">Business Support Hours</h5>
                      <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Mon - Fri: 8:00 AM - 6:00 PM AST<br />General ticketing response is during business hours.</p>
                    </div>
                  </div>
                  <div className="glass-card p-5 rounded-2xl border border-white/5 bg-white/[0.01] flex gap-4">
                    <div className="w-9 h-9 rounded-xl bg-neutral-800 flex items-center justify-center text-neutral-400 shrink-0 border border-white/5">
                      <PhoneCall size={16} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black uppercase text-white tracking-wider">Emergency Hotline</h5>
                      <p className="text-neutral-400 text-xs mt-1 leading-relaxed">Caribbean: +1 (868) 555-KOOL<br />Pager escalation role for Severity 1 production down scenarios.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </div>

      {/* NEW TICKET MODAL: Replaces form in right pane for cleaner layout */}
      {showNewForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-white/10 bg-[#0A1628]/95 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setShowNewForm(false)} 
              className="absolute right-4 top-4 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-lg">
                <Plus size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-white font-syne tracking-tight uppercase">Create Support Ticket</h2>
                <p className="text-neutral-400 text-xs">Direct paging to L3 engineering engineers.</p>
              </div>
            </div>
            
            <form onSubmit={handleCreateTicket} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Request Subject / Summary</label>
                <input 
                  required
                  placeholder="e.g. VPN gateway authentication error on router-02"
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all duration-300 text-sm placeholder:text-neutral-600"
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Priority Impact</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all duration-300 text-sm"
                  value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}
                >
                  <option value="normal" className="bg-[#0A1628]">Normal - Standard General Support</option>
                  <option value="high" className="bg-[#0A1628]">High - Impacting Operations / Features</option>
                  <option value="critical" className="bg-[#0A1628]">Critical - Complete Business Interruption</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest block">Detailed Description</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Please provide steps to reproduce, server hostnames, error logs, and any background information."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/25 focus:border-[#00D4FF]/50 transition-all duration-300 text-sm resize-none placeholder:text-neutral-600"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-grow py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-white font-black text-xs uppercase tracking-wider hover:from-[#00D4FF] hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={14} />} 
                  Submit Pager Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
