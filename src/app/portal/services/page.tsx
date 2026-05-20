"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Server, Shield, Zap, Globe, Cpu, Clock, AlertTriangle, Plus, Loader2,
  ChevronRight, ArrowUpRight, CheckCircle2, ShieldCheck, Activity,
  Database, BarChart3, Settings, ExternalLink, Info
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ClientService {
  id: string;
  client_id: string;
  service_name: string;
  service_sku: string;
  status: string;
  price: number;
  next_billing_date: string;
}

export default function MyServicesPage() {
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('client_services')
      .select('*')
      .eq('client_id', user.id);
    
    if (data) setServices(data as ClientService[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServices();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchServices]);

  if (loading) {
    return (
      <div className="h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-white/5 border-t-[#00D4FF] animate-spin" />
          <Server className="absolute inset-0 m-auto text-[#00D4FF]/40" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Managed <span className="text-[#00D4FF]">Infrastructure</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Active service subscriptions and infrastructure commitments under professional management.
          </p>
        </div>
        <button className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-[#0A1628] font-black text-xs uppercase tracking-widest hover:bg-neutral-200 transition-all shadow-xl shadow-white/5">
          <Plus size={18} /> Provision New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="glass-card lg:col-span-3 py-24 text-center space-y-6 bg-white/[0.02] border border-white/5">
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-800">
              <Database size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-syne uppercase tracking-tight">No Active Subscriptions</h2>
              <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto">
                Discover enterprise-grade managed IT solutions in our global service catalog.
              </p>
            </div>
            <button className="px-8 py-3 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold text-xs uppercase tracking-widest hover:bg-[#00D4FF]/20 transition-all">
              Browse Catalog
            </button>
          </div>
        ) : services.map(s => (
          <div key={s.id} className="glass-card group overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col">
            <div className="p-6 space-y-6 flex-1">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-lg shadow-[#00D4FF]/5">
                  <Cpu size={22} />
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.2em] px-2 py-0.5 bg-green-500/10 rounded-full border border-green-500/20">
                    {s.status}
                  </span>
                  <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-2">SKU: {s.service_sku}</span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white font-syne tracking-tight group-hover:text-[#00D4FF] transition-colors">{s.service_name}</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Enterprise Subscription</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Monthly Yield</div>
                  <div className="text-white font-bold tracking-tight">${s.price}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Renewal Date</div>
                  <div className="text-white font-bold tracking-tight">{new Date(s.next_billing_date).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
              <button className="flex-1 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <BarChart3 size={14} /> Performance
              </button>
              <button className="flex-1 py-3 rounded-xl bg-white/5 text-neutral-400 text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                <Settings size={14} /> Configure
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Infrastructure Section */}
      <div className="glass-card rounded-[2.5rem] p-8 lg:p-12 border border-white/5 bg-gradient-to-br from-[#00D4FF]/5 via-transparent to-transparent">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="shrink-0 space-y-4 text-center lg:text-left">
            <div className="w-16 h-16 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 mx-auto lg:mx-0 shadow-xl shadow-[#00D4FF]/10">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-syne uppercase tracking-tight">SLA Performance</h2>
              <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-1">Live Contractual Compliance</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 w-full border-t lg:border-t-0 lg:border-l border-white/5 pt-12 lg:pt-0 lg:pl-12">
            <div className="space-y-3">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} className="text-[#00D4FF]" /> Target Response
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">&lt; 15 Mins</div>
              <div className="inline-flex items-center gap-1.5 text-[#00E676] text-[10px] font-black uppercase">
                <CheckCircle2 size={12} /> Within SLA Target
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-[#A855F7]" /> System Uptime
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">99.99%</div>
              <div className="inline-flex items-center gap-1.5 text-[#00E676] text-[10px] font-black uppercase">
                <CheckCircle2 size={12} /> Exceeding Target
              </div>
            </div>

            <div className="space-y-3">
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-[#FFB300]" /> Maintenance
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">Clear</div>
              <div className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">Next Window: May 25th</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
