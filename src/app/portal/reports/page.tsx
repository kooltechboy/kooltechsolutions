"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  BarChart3, TrendingUp, Shield, Clock, Download, ShieldCheck, Activity, 
  Zap, AlertCircle, Loader2, CheckCircle2, ArrowUpRight, ChevronRight,
  Target, ZapOff, Globe
} from "lucide-react";

export default function ReportsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/reports") {
      router.replace("/portal?view=reports");
    }
  }, [router]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [metrics, setMetrics] = useState<{
    healthScore: number;
    uptime: string;
    kpis: {
      uptime: string;
      avgResponse: string;
      automation: string;
      threatsBlocked: string;
    };
    charts: {
      months: string[];
      ticketData: number[];
      nodes: string[];
      nodeUptimes: number[];
    };
    milestones: {
      id: string;
      subj: string;
      priority: string;
      response: string;
      resolution: string;
      met: boolean;
    }[];
  }>({
    healthScore: 100,
    uptime: "100%",
    kpis: {
      uptime: "100%",
      avgResponse: "N/A",
      automation: "N/A",
      threatsBlocked: "0"
    },
    charts: {
      months: [],
      ticketData: [],
      nodes: [],
      nodeUptimes: []
    },
    milestones: []
  });

  useEffect(() => {
    async function loadMetrics() {
      try {
        const res = await fetch("/api/portal/metrics");
        const data = await res.json();
        if (res.ok && data) {
          setMetrics(data);
        }
      } catch (err) {
        console.error("Failed to load metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, []);

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      window.print();
    }, 1500);
  };

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", flexDirection: "column", gap: "1rem", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
        <p style={{ color: "var(--color-neutral-500)", fontFamily: "Syne, sans-serif", fontSize: "0.875rem", fontWeight: "bold", letterSpacing: "0.08em" }} className="animate-pulse">
          COMPILING REPORT METRICS...
        </p>
      </div>
    );
  }

  const maxTickets = Math.max(1, ...metrics.charts.ticketData);

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
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 text-center sm:text-left w-full lg:w-auto">
          <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
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
                strokeDashoffset={364.4 * (1 - metrics.healthScore / 100)} 
                strokeLinecap="round" 
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-white font-syne">{metrics.healthScore}</span>
              <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">Health</span>
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white font-syne tracking-tight">Infrastructure Score</h2>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-[#00E676] text-xs font-bold">
              <TrendingUp size={14} /> Stable Performance
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 flex-1 w-full border-t lg:border-t-0 lg:border-l border-white/5 pt-8 lg:pt-0 pl-0 lg:pl-12">
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
          { icon: Activity, label: "Network Uptime", value: metrics.kpis.uptime, color: "text-[#00E676]", bg: "bg-[#00E676]/10", sub: "Enterprise SLA" },
          { icon: Clock, label: "Avg Response", value: metrics.kpis.avgResponse, color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10", sub: "High Priority" },
          { icon: Zap, label: "Automation", value: metrics.kpis.automation, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", sub: "Auto-Remediated" },
          { icon: Shield, label: "Cyber Blocked", value: metrics.kpis.threatsBlocked, color: "text-[#FF4444]", bg: "bg-[#FF4444]/10", sub: "Threats Prevented" },
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
            {metrics.charts.ticketData && metrics.charts.ticketData.length > 0 ? (
              metrics.charts.ticketData.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-4 h-full group">
                  <div className="flex-1 w-full flex items-end relative">
                    <div 
                      className="w-full rounded-2xl bg-gradient-to-t from-[#00D4FF]/10 to-[#00D4FF] border-x border-t border-[#00D4FF]/20 transition-all duration-1000 ease-out group-hover:brightness-125"
                      style={{ height: `${(val / maxTickets) * 100}%` }}
                    >
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-[#0A1628] text-[10px] font-black px-2 py-1 rounded shadow-lg pointer-events-none">
                        {val}
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{metrics.charts.months[i]}</div>
                </div>
              ))
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-500 text-sm h-full">No incident history available.</div>
            )}
          </div>
        </div>

        {/* SLA Matrix */}
        <div className="glass-card p-8 bg-white/[0.01] border border-white/5">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-lg font-bold text-white font-syne tracking-tight uppercase">SLA Performance Matrix</h2>
              <p className="text-neutral-500 text-xs font-bold mt-1 uppercase tracking-widest">Real-time node availability tracking</p>
            </div>
            <Activity className="text-neutral-700" size={24} />
          </div>
          <div className="space-y-6">
            {metrics.charts.nodes && metrics.charts.nodes.length > 0 ? (
              metrics.charts.nodes.map((nodeName, i) => {
                const val = metrics.charts.nodeUptimes[i];
                return (
                  <div key={nodeName} className="flex items-center gap-6">
                    <div className="w-40 md:w-48 text-xs font-bold text-neutral-300 truncate" title={nodeName}>{nodeName}</div>
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
                );
              })
            ) : (
              <div className="text-neutral-500 text-sm py-4">No active infrastructure nodes found.</div>
            )}
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
            {metrics.milestones && metrics.milestones.length > 0 ? (
              <table className="w-full text-left text-sm min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.01] text-[10px] font-bold text-neutral-500 uppercase tracking-[0.2em]">
                    <th className="px-6 py-4 w-[40%]">Incident Record</th>
                    <th className="px-6 py-4 w-[15%]">Severity</th>
                    <th className="px-6 py-4 w-[15%]">Response</th>
                    <th className="px-6 py-4 w-[15%]">Resolution</th>
                    <th className="px-6 py-4 text-right w-[15%]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {metrics.milestones.map(row => (
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
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="w-16 h-16 rounded-full bg-[#00E676]/10 flex items-center justify-center text-[#00E676] border border-[#00E676]/20 mb-4 animate-pulse">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-white font-syne font-bold text-lg mb-1 uppercase tracking-wider">All Systems Operational</h3>
                <p className="text-neutral-500 text-sm max-w-sm">No recent SLA milestones or infrastructure incidents recorded in the last 30 days.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
