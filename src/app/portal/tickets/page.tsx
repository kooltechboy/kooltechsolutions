"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, AlertCircle, CheckCircle2, Clock, Search, Plus, Loader2, 
  MessageSquare, Shield, Zap, X, User, Activity, LifeBuoy, Send, 
  ShieldCheck, Bot, Info, PhoneCall, ShieldAlert, ChevronRight,
  ArrowLeft, ChevronLeft
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
  
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/tickets") {
      router.replace("/portal?view=tickets");
    }
  }, [router]);

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
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)] flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Live Link Active
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight font-syne uppercase">
            Support <span className="text-[#00D4FF]">Desk</span>
          </h1>
          <p className="text-neutral-400 text-xs mt-0.5">Direct, SLA-backed link to senior infrastructure engineering.</p>
        </div>
        <button 
          onClick={() => { setShowNewForm(true); }}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-black font-extrabold text-xs uppercase tracking-widest hover:from-[#00D4FF] hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/20 hover:scale-[1.02] transition-all duration-300 shadow-xl shadow-cyan-500/10 shrink-0 self-start md:self-auto cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} /> New Request
        </button>
      </div>

      {/* KPI stats summary block */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
        {/* Card 1: Active */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 hover:border-[#00D4FF]/35 rounded-2xl p-4 flex items-center gap-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-[#00D4FF] filter blur-xl opacity-10 transition-opacity duration-300 group-hover:opacity-25" />
          <div className="w-11 h-11 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 flex items-center justify-center group-hover:bg-[#00D4FF]/20 transition-colors">
            <Activity size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Active Requests</div>
            <div className="text-2xl font-black text-white mt-0.5 tracking-tight font-syne">{activeTickets}</div>
          </div>
        </div>

        {/* Card 2: Resolved */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 hover:border-emerald-500/35 rounded-2xl p-4 flex items-center gap-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-emerald-500 filter blur-xl opacity-10 transition-opacity duration-300 group-hover:opacity-25" />
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/25 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Resolved Requests</div>
            <div className="text-2xl font-black text-white mt-0.5 tracking-tight font-syne">{resolvedTickets}</div>
          </div>
        </div>

        {/* Card 3: SLA */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 hover:border-violet-500/35 rounded-2xl p-4 flex items-center gap-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-violet-500 filter blur-xl opacity-10 transition-opacity duration-300 group-hover:opacity-25" />
          <div className="w-11 h-11 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/25 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
            <ShieldCheck size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">SLA Standard</div>
            <div className="text-2xl font-black text-white mt-0.5 tracking-tight font-syne">100%</div>
          </div>
        </div>

        {/* Card 4: Avg Response */}
        <div className="relative group overflow-hidden bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 hover:border-amber-500/35 rounded-2xl p-4 flex items-center gap-4 shadow-xl transition-all duration-300 hover:-translate-y-0.5">
          <div className="absolute -right-4 -bottom-4 w-12 h-12 rounded-full bg-amber-500 filter blur-xl opacity-10 transition-opacity duration-300 group-hover:opacity-25" />
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/25 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
            <Clock size={18} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-wider text-neutral-400">Avg First Response</div>
            <div className="text-2xl font-black text-white mt-0.5 tracking-tight font-syne">&lt; 15m</div>
          </div>
        </div>
      </div>

      {/* Split Pane Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LEFT PANE: Ticket List */}
        <div className={`w-full md:w-[380px] lg:w-[420px] flex-col shrink-0 glass-card rounded-2xl border border-white/10 bg-[#0A1628]/45 overflow-hidden shadow-2xl ${selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          {/* Search Box */}
          <div className="p-5 border-b border-white/10 bg-white/[0.02] flex flex-col gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search requests by ID or subject..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#00D4FF]/50 rounded-xl py-3 pl-10 pr-10 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10 transition-all placeholder:text-neutral-500 shadow-inner"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            {/* Quick Status Filter Tabs */}
            <div className="flex gap-1.5 p-1 bg-black/50 border border-white/5 rounded-xl">
              {(['all', 'open', 'resolved', 'closed'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                    selectedTab === tab
                      ? 'bg-[#00D4FF] text-black shadow-md shadow-cyan-500/25 font-extrabold scale-[1.01]'
                      : 'text-neutral-500 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tickets list body */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar bg-black/10">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-20 px-4">
                <Ticket size={40} className="mx-auto text-neutral-700 mb-4 animate-pulse" />
                <p className="text-neutral-500 text-xs font-black uppercase tracking-wider">No tickets found</p>
                <p className="text-neutral-600 text-[10px] mt-1.5">Try modifying your tab filters or search query.</p>
              </div>
            ) : filteredTickets.map(t => {
              const isActive = selectedTicketId === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => { setSelectedTicketId(t.id); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-300 relative border overflow-hidden ${
                    isActive 
                      ? 'bg-gradient-to-br from-[#00D4FF]/12 to-blue-600/5 border-[#00D4FF]/50 shadow-xl shadow-cyan-500/5 translate-x-1' 
                      : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03] hover:border-white/15 hover:translate-x-1 hover:shadow-lg hover:shadow-black/30'
                  }`}
                >
                  {/* Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#00D4FF] shadow-[0_0_12px_#00D4FF]" />
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
                      <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${
                        t.priority === 'critical' ? 'bg-rose-500/10 text-rose-450 border-rose-500/30 shadow-[0_0_8px_rgba(244,63,94,0.1)]' :
                        t.priority === 'high' ? 'bg-amber-400/10 text-amber-300 border-amber-400/30' :
                        t.priority === 'normal' ? 'bg-blue-400/10 text-blue-300 border-blue-400/30' :
                        'bg-neutral-500/10 text-neutral-400 border-neutral-500/30'
                      }`} title={`Priority: ${t.priority}`}>
                        {t.priority}
                      </span>
                      {t.messageCount > 0 && (
                        <span className="flex items-center gap-1 text-[#00D4FF] text-[9px] bg-[#00D4FF]/10 px-1.5 py-0.5 rounded border border-[#00D4FF]/20"><MessageSquare size={10}/> {t.messageCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Detail / Chat / Help Dashboard */}
        <div className={`flex-1 flex-col min-w-0 glass-card rounded-2xl border border-white/10 bg-[#0A1628]/80 overflow-hidden shadow-2xl relative ${!selectedTicketId ? 'hidden md:flex' : 'flex'}`}>
          
          {selectedTicket ? (
            /* Ticket Detail View */
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
              {/* Detail Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
                <button 
                  onClick={() => setSelectedTicketId(null)}
                  className="md:hidden flex items-center gap-1 text-neutral-400 hover:text-white mb-4 text-[10px] font-black uppercase tracking-widest transition-colors cursor-pointer"
                >
                  <ArrowLeft size={14} className="mr-0.5" /> Back to Requests
                </button>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h2 className="text-lg md:text-xl font-bold text-white leading-tight">{selectedTicket.subject}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        selectedTicket.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border-[#00D4FF]/25 shadow-[0_0_8px_rgba(0,212,255,0.08)]' :
                        selectedTicket.status === 'in_progress' ? 'bg-amber-400/10 text-amber-400 border-amber-400/25' :
                        selectedTicket.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25' :
                        'bg-white/5 text-neutral-400 border-white/10'
                      }`}>
                        {selectedTicket.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                      <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-[#00D4FF]"/> ID: {selectedTicket.id.slice(0, 8).toUpperCase()}</span>
                      <span className="flex items-center gap-1.5"><Clock size={13}/> {new Date(selectedTicket.created_at).toLocaleString()}</span>
                      {selectedTicket.priority === 'critical' && (
                        <span className="flex items-center gap-1.5 text-rose-450"><AlertCircle size={13} className="animate-pulse"/> CRITICAL</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="shrink-0">
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
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00D4FF]/20 to-blue-600/20 text-[#00D4FF] border border-[#00D4FF]/30 hover:from-[#00D4FF] hover:to-blue-600 hover:text-black hover:border-transparent transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-lg shadow-cyan-500/5 hover:scale-[1.02]"
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
                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white hover:border-transparent transition-all font-black text-[10px] uppercase tracking-wider cursor-pointer shadow-lg shadow-rose-500/5 hover:scale-[1.02]"
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
                  <div className="w-10 h-10 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 shadow-lg">
                    <User size={18} className="text-neutral-400" />
                  </div>
                  <div className="bg-gradient-to-br from-white/[0.02] to-transparent border border-white/10 rounded-2xl rounded-tl-none p-5 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed shadow-lg flex-1">
                    <div className="text-[9px] font-black text-[#00D4FF] mb-3 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] shadow-[0_0_6px_#00D4FF]" /> Original Request Description
                    </div>
                    <div className="text-[13px] text-neutral-300 leading-relaxed font-sans">{selectedTicket.description}</div>
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
                          ? 'bg-gradient-to-br from-indigo-950/30 to-[#0A1628]/90 border-indigo-500/25 text-neutral-200 rounded-tl-none shadow-indigo-500/5' 
                          : 'bg-gradient-to-br from-cyan-950/20 to-[#0A1628]/90 border-cyan-500/20 text-neutral-200 rounded-tr-none'
                      }`}>
                        <div className="flex items-center gap-2.5 mb-2.5">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            isAdmin ? 'text-[#00D4FF]' : 'text-neutral-400'
                          }`}>
                            {isAdmin ? `${senderObj?.first_name || 'Support'} (Engineer)` : 'You'}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-bold tracking-tight">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className="whitespace-pre-wrap text-neutral-300 text-[13px] leading-relaxed">{msg.message}</div>
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
                      className="w-full bg-black/40 border border-white/10 hover:border-white/20 focus:border-[#00D4FF]/45 rounded-xl py-3.5 pl-4 pr-14 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10 transition-all resize-none placeholder:text-neutral-600 shadow-inner"
                      rows={2}
                    />
                    <button 
                      type="submit" 
                      disabled={sendingMsg || !newMessage.trim()}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-[#00D4FF] to-blue-600 text-black hover:shadow-lg hover:shadow-cyan-500/20 rounded-lg flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer hover:scale-105"
                    >
                      {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* DEFAULT: Support Command Center Welcome Panel */
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-black/10 animate-in fade-in duration-300">
              <div className="max-w-6xl mx-auto space-y-6 w-full">
                
                {/* Header */}
                <div className="flex items-center gap-4 pb-5 border-b border-white/10">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00D4FF]/20 to-blue-600/20 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/30 shadow-lg shadow-cyan-500/10">
                    <LifeBuoy size={24} className="animate-spin-slow" style={{ animationDuration: '8s' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-syne tracking-tight uppercase">Support Operations Center</h2>
                    <p className="text-neutral-400 text-xs">Direct access to L3 security and cloud infrastructure support.</p>
                  </div>
                </div>

                {/* Main Grid: Left side for status & severity, Right side for AI spotlight & contacts */}
                <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 items-stretch">
                  
                  {/* Left Column: Operations Status & Severity SLA Matrix */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    
                    {/* Operations Pulse Bar */}
                    <div className="bg-gradient-to-r from-emerald-500/[0.04] to-emerald-500/[0.01] p-4 rounded-2xl border border-emerald-500/25 flex items-center justify-between shadow-lg relative overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full filter blur-xl opacity-50 group-hover:opacity-80 transition-opacity" />
                      <div className="flex items-center gap-3">
                        <span className="relative flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 shadow-[0_0_8px_#10B981]"></span>
                        </span>
                        <div>
                          <div className="text-xs font-black uppercase tracking-wider text-emerald-400">All Engineers Active</div>
                          <div className="text-[10px] text-neutral-400 mt-0.5">Average live chat response time is currently 4.8 minutes.</div>
                        </div>
                      </div>
                      <span className="text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 shadow-md">Operational</span>
                    </div>

                    {/* Redesigned Severity cards - Horizontal Stack */}
                    <div className="space-y-4">
                      {/* Sev 1 */}
                      <div className="group relative bg-gradient-to-r from-rose-500/[0.03] to-transparent hover:from-rose-500/[0.06] p-5 rounded-2xl border border-white/10 hover:border-rose-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/5 flex items-start gap-4">
                        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-rose-500 rounded-l-2xl shadow-[0_0_10px_#f43f5e]" />
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-450 shrink-0 border border-rose-500/25 group-hover:bg-rose-500/20 transition-colors">
                          <ShieldAlert size={20} className="text-rose-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black uppercase text-white tracking-wider">Sev 1 - Critical Impact</h4>
                            <span className="text-[8px] font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded border border-rose-500/30 tracking-widest">&lt; 1 HR SLA</span>
                          </div>
                          <p className="text-[10px] font-bold mt-1 uppercase tracking-wider text-rose-400">Production Down / Security Incident</p>
                          <p className="text-neutral-400 text-xs leading-relaxed mt-2.5">
                            Complete interruption of core business functions. Trigger immediate 24/7 pager escalation to senior engineering.
                          </p>
                        </div>
                      </div>

                      {/* Sev 2 */}
                      <div className="group relative bg-gradient-to-r from-amber-500/[0.02] to-transparent hover:from-amber-500/[0.05] p-5 rounded-2xl border border-white/10 hover:border-amber-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/5 flex items-start gap-4">
                        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-amber-500 rounded-l-2xl shadow-[0_0_10px_#fbbf24]" />
                        <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-400/25 group-hover:bg-amber-400/20 transition-colors">
                          <AlertCircle size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black uppercase text-white tracking-wider">Sev 2 - High Impact</h4>
                            <span className="text-[8px] font-black bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/30 tracking-widest">&lt; 4 HR SLA</span>
                          </div>
                          <p className="text-[10px] font-bold mt-1 uppercase tracking-wider text-amber-300">Operational Degradation / Major Bugs</p>
                          <p className="text-neutral-400 text-xs leading-relaxed mt-2.5">
                            Impacting operations, major features, or multiple users. High-priority queue scheduling during working hours.
                          </p>
                        </div>
                      </div>

                      {/* Sev 3 */}
                      <div className="group relative bg-gradient-to-r from-blue-500/[0.02] to-transparent hover:from-blue-500/[0.05] p-5 rounded-2xl border border-white/10 hover:border-blue-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-400/5 flex items-start gap-4">
                        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-blue-500 rounded-l-2xl shadow-[0_0_10px_#3b82f6]" />
                        <div className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center text-blue-400 shrink-0 border border-blue-400/25 group-hover:bg-blue-400/20 transition-colors">
                          <Clock size={20} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-black uppercase text-white tracking-wider">Sev 3 - Normal Impact</h4>
                            <span className="text-[8px] font-black bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-500/30 tracking-widest">&lt; 12 HR SLA</span>
                          </div>
                          <p className="text-[10px] font-bold mt-1 uppercase tracking-wider text-blue-300">General Requests / Maintenance</p>
                          <p className="text-neutral-400 text-xs leading-relaxed mt-2.5">
                            Non-critical requests, configuration changes, billing queries, or system updates. Addressed in standard ticketing order.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: AI Assistant Spotlight & Support Hours/Hotline */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                    
                    {/* Kira AI Assistant Spotlight */}
                    <div className="relative overflow-hidden p-6 rounded-2xl border border-violet-500/20 bg-gradient-to-b from-violet-600/[0.06] to-[#0A1628]/45 hover:border-violet-500/35 transition-all duration-300 shadow-2xl flex flex-col justify-between group h-full">
                      <div className="absolute -right-12 -top-12 w-48 h-48 bg-violet-600/10 rounded-full filter blur-3xl opacity-50 group-hover:opacity-85 transition-opacity" />
                      
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/20 flex items-center justify-center text-violet-400 border border-violet-500/30 shadow-lg shadow-violet-500/10 shrink-0 group-hover:scale-105 transition-transform duration-300 animate-float">
                            <Bot size={24} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase text-white tracking-wider flex items-center gap-2">
                              Kira AI Assistant
                              <span className="text-[8px] font-black tracking-widest bg-[#00E676]/10 text-[#00E676] px-2 py-0.5 rounded border border-[#00E676]/20 animate-pulse">Online</span>
                            </h4>
                            <p className="text-neutral-400 text-[10px] uppercase tracking-wider font-bold">Autonomous L3 Agent</p>
                          </div>
                        </div>
                        
                        <p className="text-neutral-300 text-xs leading-relaxed mb-5">
                          Need instant resolution? Kira can run diagnostics, verify system telemetry, check firewall routing, and reset service tunnels in seconds.
                        </p>

                        {/* Visual Mock Chat Preview Box */}
                        <div className="bg-black/50 border border-white/5 rounded-xl p-4 space-y-3 font-mono text-[10px] leading-relaxed mb-6 select-none shadow-inner">
                          <div className="flex gap-2">
                            <span className="text-neutral-500">SYSTEM:</span>
                            <span className="text-neutral-300">Initializing VPN diagnostic check...</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[#00D4FF]">KIRA:</span>
                            <span className="text-emerald-400">✔ Checking node gw-03 response [12ms]</span>
                          </div>
                          <div className="flex gap-2">
                            <span className="text-[#00D4FF]">KIRA:</span>
                            <span className="text-neutral-300">Routing is operational. Latency 14ms. All tunnels sync'd.</span>
                          </div>
                          <div className="flex gap-2 items-center text-violet-450 animate-pulse">
                            <span>▋</span>
                            <span className="text-neutral-500 text-[8px] font-sans italic">Kira is listening...</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <button 
                          onClick={() => router.push('/portal/ai-assistant')} 
                          className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 transition-all duration-300 text-xs font-black uppercase tracking-wider cursor-pointer hover:scale-[1.01]"
                        >
                          Launch Kira Assistant <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Support Hours & Hotline stacked below AI card */}
                    <div className="space-y-4">
                      {/* Business Hours */}
                      <div className="bg-gradient-to-br from-white/[0.01] to-transparent p-5 rounded-2xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-450 shrink-0 border border-white/10 shadow-md">
                          <Info size={18} className="text-neutral-400" />
                        </div>
                        <div>
                          <h5 className="text-xs font-black uppercase text-white tracking-wider">Business Support Hours</h5>
                          <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                            Mon - Fri: 8:00 AM - 6:00 PM AST
                            <span className="block mt-1 text-[10px] text-neutral-500 font-medium">Standard ticketing and non-critical requests are processed during business hours.</span>
                          </p>
                        </div>
                      </div>

                      {/* Emergency Hotline */}
                      <div className="bg-gradient-to-br from-white/[0.01] to-transparent p-5 rounded-2xl border border-white/5 flex gap-4 hover:border-white/10 transition-colors shadow-md">
                        <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-400 shrink-0 border border-white/10 shadow-md">
                          <PhoneCall size={18} />
                        </div>
                        <div>
                          <h5 className="text-xs font-black uppercase text-white tracking-wider">Emergency Hotline</h5>
                          <p className="text-neutral-400 text-xs mt-1.5 leading-relaxed">
                            Caribbean: +1 (868) 555-KOOL
                            <span className="block mt-1.5 text-[10px] text-rose-450 font-bold bg-rose-500/5 px-2 py-1 rounded border border-rose-500/10">
                              Pager escalation for Severity 1 production down scenarios.
                            </span>
                          </p>
                        </div>
                      </div>
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/75 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="w-full max-w-lg glass-card rounded-2xl border border-white/15 bg-[#0A1628]/95 p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button 
              onClick={() => setShowNewForm(false)} 
              className="absolute right-5 top-5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
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
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Request Subject / Summary</label>
                <input 
                  required
                  placeholder="e.g. VPN gateway authentication error on router-02"
                  className="w-full bg-black/45 border border-white/10 hover:border-white/20 focus:border-[#00D4FF]/40 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10 transition-all duration-300 text-sm placeholder:text-neutral-600 shadow-inner"
                  value={form.subject}
                  onChange={e => setForm({...form, subject: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Priority Impact</label>
                <select 
                  className="w-full bg-black/45 border border-white/10 hover:border-white/20 focus:border-[#00D4FF]/40 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10 transition-all duration-300 text-sm shadow-inner cursor-pointer"
                  value={form.priority}
                  onChange={e => setForm({...form, priority: e.target.value})}
                >
                  <option value="normal" className="bg-[#0A1628]">Normal - Standard General Support</option>
                  <option value="high" className="bg-[#0A1628]">High - Impacting Operations / Features</option>
                  <option value="critical" className="bg-[#0A1628]">Critical - Complete Business Interruption</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-neutral-400 uppercase tracking-widest block">Detailed Description</label>
                <textarea 
                  required
                  rows={6}
                  placeholder="Please provide steps to reproduce, server hostnames, error logs, and any background information."
                  className="w-full bg-black/45 border border-white/10 hover:border-white/20 focus:border-[#00D4FF]/40 rounded-xl p-3.5 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/10 transition-all duration-300 text-sm resize-none placeholder:text-neutral-600 shadow-inner"
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider hover:bg-white/10 hover:border-white/20 transition-all duration-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="flex-grow py-3.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-white font-black text-xs uppercase tracking-wider hover:from-[#00D4FF] hover:to-blue-500 hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2 hover:scale-[1.01] cursor-pointer"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={13} />} 
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
