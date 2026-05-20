"use client";
import React, { useState, useEffect } from 'react';
import { 
  Ticket, Send, AlertCircle, CheckCircle2, Clock, Search, Plus, Loader2, 
  ChevronRight, Filter, MessageSquare, Shield, Zap, X,
  User, Activity, LifeBuoy, Bell
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface TicketData {
  id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
}

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', priority: 'normal' });
  const [success, setSuccess] = useState(false);
  const [tempTicketNum, setTempTicketNum] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const supabase = createClient();

  useEffect(() => {
    async function fetchMyTickets() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTickets(data);
      }
      setLoading(false);
    }
    fetchMyTickets();
  }, [supabase, refreshKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, client_id: user.id })
      });

      if (res.ok) {
        setTempTicketNum(Math.floor(1000 + Math.random() * 9000).toString());
        setSuccess(true);
        setForm({ subject: '', description: '', priority: 'normal' });
        setTimeout(() => {
          setSuccess(false);
          setShowNewForm(false);
          setRefreshKey(prev => prev + 1);
        }, 2500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-[#00D4FF] animate-spin" />
          <LifeBuoy className="absolute inset-0 m-auto text-[#00D4FF]/40" size={24} />
        </div>
      </div>
    );
  }

  const activeCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Service <span className="text-[#00D4FF]">Desk</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Direct access to our Level 3 engineering team. Track resolutions and manage service requests.
          </p>
        </div>
        {!showNewForm && (
          <button 
            onClick={() => setShowNewForm(true)} 
            className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#0A1628] font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl shadow-white/5"
          >
            <Plus size={18} /> New Support Request
          </button>
        )}
      </div>

      {/* Ticket Stats */}
      {!showNewForm && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-lg shadow-[#00D4FF]/5">
              <Activity size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-syne tracking-tight">{activeCount}</div>
              <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Active Tickets</div>
            </div>
          </div>
          <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#00E676]/10 flex items-center justify-center text-[#00E676] border border-[#00E676]/20 shadow-lg shadow-[#00E676]/5">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-syne tracking-tight">{tickets.filter(t => t.status === 'closed').length}</div>
              <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Resolved All-Time</div>
            </div>
          </div>
          <div className="glass-card p-6 border border-white/5 bg-white/[0.02] flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-[#A855F7]/10 flex items-center justify-center text-[#A855F7] border border-[#A855F7]/20 shadow-lg shadow-[#A855F7]/5">
              <Zap size={24} />
            </div>
            <div>
              <div className="text-2xl font-black text-white font-syne tracking-tight">14m</div>
              <div className="text-neutral-500 text-[10px] font-black uppercase tracking-widest">Avg Response Time</div>
            </div>
          </div>
        </div>
      )}

      {showNewForm ? (
        <div className="glass-card rounded-[2.5rem] border border-white/10 bg-white/[0.02] overflow-hidden max-w-2xl mx-auto shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="p-8 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h2 className="text-xl font-bold text-white font-syne tracking-tight uppercase">Open New Ticket</h2>
            <button 
              onClick={() => setShowNewForm(false)}
              className="p-2 text-neutral-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-8">
            {success ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto text-[#00E676] shadow-xl shadow-green-500/10">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white font-syne uppercase tracking-tight">Submission Received</h3>
                  <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto font-medium">
                    Ticket #{tempTicketNum} has been queued for assignment.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Incident Summary</label>
                  <input 
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all placeholder:text-neutral-700 font-medium"
                    placeholder="Brief description of the issue..."
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Priority Level</label>
                  <select 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all appearance-none cursor-pointer font-medium"
                    value={form.priority}
                    onChange={e => setForm({...form, priority: e.target.value})}
                  >
                    <option value="low" className="bg-[#0A1628]">Low - General Inquiry</option>
                    <option value="normal" className="bg-[#0A1628]">Normal - Standard Issue</option>
                    <option value="high" className="bg-[#0A1628]">High - Impacting Work</option>
                    <option value="critical" className="bg-[#0A1628]">Critical - Business Halted</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest px-1">Full Context</label>
                  <textarea 
                    required
                    rows={6}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all placeholder:text-neutral-700 font-medium resize-none"
                    placeholder="Provide as much detail as possible. Steps to reproduce, error codes, etc."
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#00D4FF] to-[#00D4FF]/80 text-[#0A1628] font-black text-xs uppercase tracking-[0.2em] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-[#00D4FF]/10 flex items-center justify-center gap-3"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Transmitting...
                    </>
                  ) : (
                    <>
                      <Send size={18} /> Deploy Ticket
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-white/[0.02]">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Filter className="text-neutral-600" size={18} />
              <h2 className="text-white font-bold font-syne tracking-tight uppercase">Recent Requests</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" />
                <input 
                  type="text" 
                  placeholder="Filter tickets..." 
                  className="bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-[10px] text-white focus:outline-none w-48"
                />
              </div>
              <button className="text-neutral-500 hover:text-white transition-colors">
                <Bell size={18} />
              </button>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {tickets.length === 0 ? (
              <div className="py-24 text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-800">
                  <Ticket size={40} />
                </div>
                <div>
                  <h3 className="text-neutral-500 font-black uppercase text-xs tracking-widest">No active requests</h3>
                  <p className="text-neutral-700 text-[10px] mt-1 font-bold">Your support history is currently empty</p>
                </div>
              </div>
            ) : (
              tickets.map(ticket => (
                <div key={ticket.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 hover:bg-white/[0.03] transition-all cursor-pointer">
                  <div className="flex items-start gap-6 flex-1 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                      ticket.priority === 'critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      ticket.priority === 'high' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      'bg-white/5 text-neutral-500 border-white/10'
                    }`}>
                      <AlertCircle size={20} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-black text-neutral-600 font-mono tracking-tighter uppercase px-2 py-0.5 bg-white/5 rounded border border-white/5">
                          #{ticket.id.slice(0, 8)}
                        </span>
                        <h3 className="text-white font-bold text-sm tracking-tight truncate group-hover:text-[#00D4FF] transition-colors">{ticket.subject}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          <Clock size={12} /> {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          <User size={12} /> Assigned: <span className="text-neutral-300">Engineering L3</span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                          <MessageSquare size={12} /> 2 Updates
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 sm:mt-0 flex items-center gap-6 w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-4 sm:pt-0">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      ticket.status === 'open' ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20' : 
                      'bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </div>
                    <ChevronRight size={20} className="text-neutral-800 group-hover:text-white group-hover:translate-x-1 transition-all hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Trust Banner */}
      {!showNewForm && (
        <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-3xl p-6 flex items-center gap-4">
          <Shield size={24} className="text-[#00D4FF]" />
          <p className="text-neutral-400 text-xs font-medium leading-relaxed">
            All tickets are monitored by our 24/7 Security Operations Center. High and Critical priority requests trigger immediate engineer dispatch.
          </p>
        </div>
      )}
    </div>
  );
}
