"use client";
import { useState } from "react";
import { 
  BarChart3, TrendingUp, Shield, Clock, Download, ShieldCheck, Activity, 
  Zap, AlertCircle, Loader2, CheckCircle2, ArrowUpRight, ChevronRight,
  Target, ZapOff, Globe
} from "lucide-react";

const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];
const ticketData = [3, 7, 4, 6, 2, 5, 1];
const uptimeData = [99.8, 99.9, 100, 99.7, 99.9, 100, 99.99];
const maxTickets = Math.max(...ticketData);

export default function ReportsPage() {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      window.print();
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Operational <span className="text-[#00D4FF]">Intelligence</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Real-time infrastructure health analytics and service performance metrics across your global footprint.
          </p>
        </div>
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold text-sm hover:bg-[#00D4FF]/20 transition-all disabled:opacity-50"
        >
          {exporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
          {exporting ? "Generating Insight..." : "Export Performance Report"}
        </button>
      </div>

      {/* Global Health Score */}
      <div className="glass-card p-8 rounded-[2.5rem] border border-[#00E676]/20 bg-gradient-to-br from-[#00E676]/5 to-transparent flex flex-col lg:flex-row items-center gap-12">
        <div className="flex items-center gap-8">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_15px_rgba(0,230,118,0.3)]">
              <circle cx="64" cy="64" r="58" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
              <circle 
                cx="64" 
                cy="64" 
                r="58" 
                fill="transparent" 
                stroke="#00E676" 
                strokeWidth="10" 
                strokeDasharray="364.4" 
                strokeDashoffset="36.4" 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white font-syne">92</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Health</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-syne tracking-tight">Infrastructure Score</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[#00E676] text-xs font-bold">
              <TrendingUp size={14} /> +2.4% Optimal Performance
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full border-l border-white/5 pl-0 lg:pl-12">
          <div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2"><ShieldCheck size={14} className="text-[#00D4FF]" /> Security</div>
            <div className="text-white font-bold text-lg font-syne tracking-tight uppercase">Hardened</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2"><CheckCircle2 size={14} className="text-[#00E676]" /> Compliance</div>
            <div className="text-white font-bold text-lg font-syne tracking-tight uppercase">Policy Met</div>
          </div>
          <div className="hidden sm:block">
            <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Globe size={14} className="text-[#A855F7]" /> Region</div>
            <div className="text-white font-bold text-lg font-syne tracking-tight uppercase">Global</div>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Activity, label: "Network Uptime", value: "99.99%", color: "text-[#00E676]", bg: "bg-[#00E676]/10", sub: "Enterprise SLA" },
          { icon: Clock, label: "Avg Response", value: "12m", color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10", sub: "High Priority" },
          { icon: Zap, label: "Automation", value: "84%", color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", sub: "Auto-Remediated" },
          { icon: Shield, label: "Cyber Blocked", value: "1.4k", color: "text-[#FF4444]", bg: "bg-[#FF4444]/10", sub: "Threats Prevented" },
        ].map(kpi => (
          <div key={kpi.label} className="glass-card p-6 border border-white/5 bg-white/[0.02] flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color} border border-white/5`}>
              <kpi.icon size={22} />
            </div>
            <div>
              <div className="text-3xl font-black text-white font-syne tracking-tight">{kpi.value}</div>
              <div className="text-neutral-400 text-xs font-bold uppercase tracking-wider mt-1">{kpi.label}</div>
              <div className="text-neutral-600 text-[10px] uppercase font-bold tracking-widest mt-2">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Support Velocity Chart */}
        <div className="glass-card p-8 bg-white/[0.01] border border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">Support Velocity</h2>
              <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-widest">Monthly Incident Trends</p>
            </div>
            <Target className="text-neutral-700" size={24} />
          </div>
          <div className="flex items-end gap-3 h-[240px]">
            {ticketData.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full group">
                <div className="flex-1 w-full flex items-flex-end relative">
                  <div 
                    className="w-full rounded-2xl bg-gradient-to-t from-[#00D4FF]/10 to-[#00D4FF] border-x border-t border-[#00D4FF]/20 transition-all duration-1000 ease-out group-hover:brightness-125"
                    style={{ height: `${(val / maxTickets) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#0A1628] text-[10px] font-black px-2 py-1 rounded shadow-lg pointer-events-none">
                      {val}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{months[i]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Matrix */}
        <div className="glass-card p-8 bg-white/[0.01] border border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">SLA Performance Matrix</h2>
              <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-widest">Real-time availability tracking</p>
            </div>
            <Activity className="text-neutral-700" size={24} />
          </div>
          <div className="space-y-6">
            {uptimeData.map((val, i) => (
              <div key={i} className="flex items-center gap-6">
                <div className="w-10 text-[10px] font-black text-neutral-500 uppercase tracking-widest">{months[i]}</div>
                <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                  <div 
                    className={`h-full transition-all duration-1000 ${
                      val >= 99.9 ? 'bg-gradient-to-r from-[#00E676] to-[#00D4FF]' : 'bg-gradient-to-r from-[#FFB300] to-[#FF4444]'
                    }`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <div className={`w-16 text-right text-xs font-black tracking-tighter ${
                  val >= 99.9 ? 'text-[#00E676]' : 'text-[#FFB300]'
                }`}>{val}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident History Table */}
        <div className="glass-card rounded-3xl overflow-hidden border border-white/10 xl:col-span-2">
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
            <h2 className="text-white font-bold font-syne tracking-tight uppercase">Recent SLA Milestones</h2>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-neutral-500 text-[10px] font-black uppercase tracking-widest">
              <Clock size={12} /> Last 30 Days
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                  <th className="px-6 py-4">Incident Record</th>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Response</th>
                  <th className="px-6 py-4">Resolution</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { id: "INC-291", subj: "Primary ISP Failover Triggered", priority: "Critical", response: "2m", resolution: "Auto", met: true },
                  { id: "INC-284", subj: "Cloud Storage Capacity Alert", priority: "High", response: "12m", resolution: "45m", met: true },
                  { id: "INC-280", subj: "User VPN Authentication Loop", priority: "Normal", response: "15m", resolution: "1h 12m", met: true },
                  { id: "INC-277", subj: "Workstation Firmware Update", priority: "Low", response: "1h 05m", resolution: "4h 20m", met: true },
                ].map(row => (
                  <tr key={row.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-white font-bold">{row.subj}</div>
                      <div className="text-neutral-600 text-[10px] font-mono mt-0.5">{row.id}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                        row.priority === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      }`}>
                        {row.priority}
                      </div>
                    </td>
                    <td className="px-6 py-5 font-semibold text-neutral-300">{row.response}</td>
                    <td className="px-6 py-5 text-neutral-500 font-medium">{row.resolution}</td>
                    <td className="px-6 py-5 text-right">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[#00E676] text-[10px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={12} /> Compliant
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
