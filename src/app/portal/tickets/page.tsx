"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, AlertCircle, CheckCircle2, Clock, Search, Plus, Loader2, 
  ChevronRight, Filter, MessageSquare, Shield, Zap, X,
  User, Activity, LifeBuoy, Bell, Send, ShieldCheck, Bot
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
        .order('created_at', { ascending: true });
      if (msgs) setMessages(msgs as TicketMessage[]);
    }
    fetchMessages();

    // Supabase Realtime for Messages
    const channel = supabase
      .channel(`ticket-${selectedTicketId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_messages', filter: `ticket_id=eq.${selectedTicketId}` }, (payload) => {
        setMessages(prev => [...prev, payload.new as TicketMessage]);
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

  const filteredTickets = tickets.filter(t =>
    !searchQuery.trim() ||
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] overflow-hidden pt-4 pb-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1 font-syne">
            Support <span className="text-[#00D4FF]">Desk</span>
          </h1>
          <p className="text-neutral-400 text-sm">Priority access to Level 3 infrastructure support.</p>
        </div>
        <button 
          onClick={() => { setShowNewForm(true); setSelectedTicketId(null); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#0A1628] font-bold text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl shadow-white/10"
        >
          <Plus size={16} /> New Request
        </button>
      </div>

      {/* Split Pane Layout */}
      <div className="flex gap-6 flex-1 min-h-0">
        
        {/* LEFT PANE: Ticket List */}
        <div className="w-[420px] flex flex-col shrink-0 glass-card rounded-2xl border border-white/10 bg-white/[0.02] overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/5 bg-white/[0.01]">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input 
                type="text" 
                placeholder="Search tickets by ID or subject..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-2 custom-scrollbar">
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Ticket size={32} className="mx-auto text-neutral-600 mb-3" />
                <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">No tickets found</p>
              </div>
            ) : filteredTickets.map(t => {
              const isActive = selectedTicketId === t.id;
              return (
                <div 
                  key={t.id}
                  onClick={() => { setSelectedTicketId(t.id); setShowNewForm(false); }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    isActive 
                      ? 'bg-[#00D4FF]/5 border-[#00D4FF]/30' 
                      : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black text-neutral-500 font-mono tracking-tighter uppercase">#{t.id.slice(0, 8)}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      t.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF]' :
                      t.status === 'resolved' ? 'bg-[#00E676]/10 text-[#00E676]' :
                      'bg-white/5 text-neutral-400'
                    }`}>
                      {t.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <h3 className={`font-bold text-sm mb-2 line-clamp-1 ${isActive ? 'text-white' : 'text-neutral-300'}`}>{t.subject}</h3>
                  <div className="flex items-center justify-between text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Clock size={12}/> {new Date(t.created_at).toLocaleDateString()}</span>
                    {t.messageCount > 0 && (
                      <span className="flex items-center gap-1.5"><MessageSquare size={12}/> {t.messageCount}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT PANE: Detail / Chat / New Form */}
        <div className="flex-1 flex flex-col min-w-0 glass-card rounded-2xl border border-white/10 bg-[#0A1628]/80 overflow-hidden shadow-2xl relative">
          
          {showNewForm ? (
            /* New Ticket Form */
            <div className="flex-1 overflow-y-auto p-8 animate-in slide-in-from-right-4 duration-300">
              <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20">
                    <Plus size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white font-syne tracking-tight">Create Support Ticket</h2>
                    <p className="text-neutral-400 text-sm">Please provide detailed information for our engineers.</p>
                  </div>
                </div>
                
                <form onSubmit={handleCreateTicket} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Incident Summary</label>
                    <input 
                      required
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                      value={form.subject}
                      onChange={e => setForm({...form, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Priority</label>
                    <select 
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors"
                      value={form.priority}
                      onChange={e => setForm({...form, priority: e.target.value})}
                    >
                      <option value="normal" className="bg-[#0A1628]">Normal - Standard Issue</option>
                      <option value="high" className="bg-[#0A1628]">High - Impacting Work</option>
                      <option value="critical" className="bg-[#0A1628]">Critical - Business Halted</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Full Description</label>
                    <textarea 
                      required
                      rows={8}
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#00D4FF]/50 transition-colors resize-none"
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00D4FF] to-blue-600 text-white font-black text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-[#00D4FF]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />} 
                    Submit Ticket
                  </button>
                </form>
              </div>
            </div>
          ) : selectedTicket ? (
            /* Ticket Detail View */
            <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
              {/* Detail Header */}
              <div className="p-6 border-b border-white/10 bg-white/[0.02] shrink-0">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-white mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-neutral-400">
                      <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#00D4FF]"/> ID: {selectedTicket.id.slice(0, 8)}</span>
                      <span className="flex items-center gap-1.5"><Clock size={14}/> {new Date(selectedTicket.created_at).toLocaleString()}</span>
                      {selectedTicket.priority === 'critical' && (
                        <span className="flex items-center gap-1.5 text-[#ef4444]"><AlertCircle size={14}/> CRITICAL</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Feed */}
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-black/20">
                {/* Original Description */}
                <div className="flex gap-4 max-w-3xl">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                    <User size={18} className="text-neutral-400" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-4 text-sm text-neutral-300 whitespace-pre-wrap leading-relaxed">
                    <div className="text-xs font-bold text-white mb-2 uppercase tracking-widest">Original Request</div>
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Messages */}
                {messages.map((msg, idx) => {
                  const senderObj = Array.isArray(msg.sender) ? msg.sender[0] : msg.sender;
                  const isAdmin = senderObj?.role === 'admin' || senderObj?.role === 'agent';
                  
                  return (
                    <div key={idx} className={`flex gap-4 max-w-3xl ${isAdmin ? '' : 'flex-row-reverse self-end ml-auto'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isAdmin ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'bg-white/10 text-neutral-400'
                      }`}>
                        {isAdmin ? <ShieldCheck size={18} /> : <User size={18} />}
                      </div>
                      <div className={`border rounded-2xl p-4 text-sm leading-relaxed ${
                        isAdmin 
                          ? 'bg-[#00D4FF]/5 border-[#00D4FF]/20 text-neutral-200 rounded-tl-none' 
                          : 'bg-white/5 border-white/10 text-neutral-200 rounded-tr-none'
                      }`}>
                        <div className="text-xs font-bold text-white mb-1 uppercase tracking-widest opacity-60">
                          {isAdmin ? `${senderObj?.first_name || 'Support'} (Engineer)` : 'You'}
                        </div>
                        {msg.message}
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-14 text-white text-sm focus:outline-none focus:border-[#00D4FF]/50 resize-none"
                      rows={2}
                    />
                    <button 
                      type="submit" 
                      disabled={sendingMsg || !newMessage.trim()}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#00D4FF] hover:bg-blue-400 text-black rounded-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingMsg ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-neutral-500 animate-in fade-in">
              <Bot size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg font-bold text-white mb-2">Select a ticket to view details</h3>
              <p className="text-sm max-w-sm">Choose an active support request from the list on the left to view correspondence with our engineering team.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
