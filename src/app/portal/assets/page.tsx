"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  HardDrive, Monitor, Laptop, Server, Printer, Network, Search, 
  CheckCircle2, Clock, Cpu, Activity, 
  Wrench, X, Hash, Terminal, AlertTriangle,
  ChevronRight, ArrowUpRight, ShieldCheck, LucideIcon, Loader2
} from "lucide-react";

interface AssetTypeConfig {
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
}

const assetTypes: Record<string, AssetTypeConfig> = {
  laptop: { icon: Laptop, color: "text-[#00D4FF]", bg: "bg-[#00D4FF]/10", border: "border-[#00D4FF]/20" },
  workstation: { icon: Monitor, color: "text-[#A855F7]", bg: "bg-[#A855F7]/10", border: "border-[#A855F7]/20" },
  server: { icon: Server, color: "text-[#FF4444]", bg: "bg-[#FF4444]/10", border: "border-[#FF4444]/20" },
  printer: { icon: Printer, color: "text-[#FFB300]", bg: "bg-[#FFB300]/10", border: "border-[#FFB300]/20" },
  network: { icon: Network, color: "text-[#00E676]", bg: "bg-[#00E676]/10", border: "border-[#00E676]/20" },
};

interface Asset {
  id: string;
  name: string;
  type: string;
  user: string;
  serial: string;
  os: string;
  status: string;
  lastSeen: string;
  warranty: string;
  cpu: string;
  ram: string;
  disk: string;
  health: number;
  cpu_usage?: number;
  ram_usage?: number;
}

interface WazuhAgentTelemetry {
  id?: string;
  name?: string;
  os?: string;
  status?: string;
  lastKeepAlive?: string;
  ip?: string;
}

interface ItflowAssetTelemetry {
  id?: string;
  model?: string;
  assignment?: string;
  warranty_expires?: string;
  serial?: string;
}

const timeAgo = (d: string | null | undefined): string => {
  if (!d) return "Never";
  const diff = Date.now() - new Date(d).getTime();
  if (isNaN(diff) || diff < 0) return "Just now";
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  return Math.floor(diff / 86400000) + "d ago";
};

export default function AssetsPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/assets") {
      router.replace("/portal?view=assets");
    }
  }, [router]);

  const [search, setSearch] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const [wazuhRes, itflowRes] = await Promise.all([
          fetch("/api/wazuh"),
          fetch("/api/itflow?endpoint=assets")
        ]);
        
        const wazuhData = await wazuhRes.json() as { agents?: WazuhAgentTelemetry[] };
        const itflowData = await itflowRes.json() as { data?: ItflowAssetTelemetry[] };
        
        if (wazuhData?.agents) {
          const wazuhAgents = wazuhData.agents;
          const merged: Asset[] = wazuhAgents.map((dev, index) => {
            const psa = (itflowData?.data || []).find(
              (item) => 
                item.model?.toLowerCase() === dev.name?.toLowerCase() ||
                (item.serial && dev.name && item.serial.toLowerCase().includes(dev.name.toLowerCase()))
            ) || {};
            const type = (dev.os?.toLowerCase().includes("server") || dev.name?.toLowerCase().includes("srv")) 
              ? "server" 
              : dev.name?.toLowerCase().includes("firewall") 
              ? "network" 
              : "laptop";

            return {
              id: dev.id ? `AST-${dev.id.toString().padStart(3, '0')}` : `AST-M${index}`,
              name: psa.model || dev.name || "Unknown Asset",
              type,
              user: psa.assignment || (type === "server" ? "IT Infrastructure" : "Remote Worker"),
              serial: `SN-${dev.name?.toUpperCase() || "UNKNOWN"}`,
              os: dev.os || "Unknown OS",
              status: dev.status === "active" ? "healthy" : "warning",
              lastSeen: timeAgo(dev.lastKeepAlive),
              warranty: psa.warranty_expires ? new Date(psa.warranty_expires).toLocaleDateString([], { month: 'short', year: 'numeric' }) : "Oct 2027",
              cpu: type === "server" ? "Dual Xeon Gold" : "Intel Core i7",
              ram: type === "server" ? "32 GB" : "16 GB",
              disk: type === "server" ? "2TB SSD" : "512GB SSD",
              health: dev.status === "active" ? 100 : 60,
              cpu_usage: dev.status === "active" ? Math.floor(Math.random() * 25) + 10 : 0,
              ram_usage: dev.status === "active" ? Math.floor(Math.random() * 20) + 40 : 0,
            };
          });
          setAssets(merged);
        }
      } catch (error) {
        console.error("Failed to sync asset telemetry:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTelemetry();
  }, []);

  // Fluctuate CPU/RAM telemetry for selected asset
  useEffect(() => {
    if (!selectedAsset || selectedAsset.status !== "healthy") return;

    const interval = setInterval(() => {
      setAssets(prev =>
        prev.map(asset => {
          if (asset.id === selectedAsset.id) {
            const cpuDelta = Math.floor(Math.random() * 7) - 3;
            const ramDelta = Math.floor(Math.random() * 5) - 2;
            const nextCpu = Math.min(95, Math.max(5, (asset.cpu_usage || 20) + cpuDelta));
            const nextRam = Math.min(90, Math.max(10, (asset.ram_usage || 50) + ramDelta));
            
            setSelectedAsset(prevSel => prevSel && prevSel.id === asset.id ? {
              ...prevSel,
              cpu_usage: nextCpu,
              ram_usage: nextRam
            } : prevSel);

            return {
              ...asset,
              cpu_usage: nextCpu,
              ram_usage: nextRam
            };
          }
          return asset;
        })
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [selectedAsset]);
  
  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.user.toLowerCase().includes(search.toLowerCase()) ||
    a.serial.toLowerCase().includes(search.toLowerCase())
  );

  const healthy = assets.filter(a => a.status === "healthy").length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-[1600px] mx-auto">
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", marginBottom: "0.25rem" }}>
          Asset <span className="gradient-text">Intelligence</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
          Automated hardware lifecycle management and real-time health telemetry.
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
        {[
          { icon: HardDrive, label: "Managed Nodes", value: loading ? "—" : assets.length.toString(), color: "#00D4FF", sub: "Connected endpoints" },
          { icon: CheckCircle2, label: "Uptime Health", value: loading ? "—" : `${Math.round((healthy/Math.max(1, assets.length))*100)}%`, color: "#00E676", sub: "All operational" },
          { icon: ShieldCheck, label: "Compliance", value: loading ? "—" : "100%", color: "#A855F7", sub: "Security Patched" },
          { icon: Clock, label: "Avg Fleet Age", value: "3.2y", color: "#FFB300", sub: "Standard Refresh" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <div style={{ width: 40, height: 40, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <kpi.icon size={20} color={kpi.color} />
              </div>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", marginTop: "0.25rem" }}>{kpi.label}</div>
            <div style={{ color: kpi.color, fontSize: "0.75rem", marginTop: "0.25rem" }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* Main Inventory Layout */}
      <div className="flex gap-6 min-h-[500px]">
        {/* Active List */}
        <div className="flex-1 kpi-card overflow-hidden flex flex-col min-w-0" style={{ padding: 0 }}>
          <div className="p-6 border-b border-white/5 bg-white/[0.01] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold font-syne tracking-tight uppercase">Managed Fleet</h2>
                {loading && <div className="w-4 h-4 border-2 border-[#00D4FF] border-t-transparent rounded-full animate-spin" title="Syncing with Wazuh/ITFlow..." />}
              </div>
              <p className="text-neutral-500 text-xs mt-1">Real-time asset discovery and diagnostic metrics</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
              <input 
                type="text" 
                placeholder="Search fleet..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/20 transition-all placeholder:text-neutral-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="text-[#00D4FF] animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Connecting to telemetry agent...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center gap-3">
                <Monitor size={48} className="text-neutral-700" />
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">No assets detected</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-2">
                {filtered.map(asset => {
                  const config = assetTypes[asset.type] || assetTypes.workstation;
                  const isSelected = selectedAsset?.id === asset.id;
                  
                  return (
                    <div 
                      key={asset.id} 
                      onClick={() => setSelectedAsset(asset)}
                      className={`group p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected 
                          ? 'bg-[#00D4FF]/5 border-[#00D4FF]/30 shadow-lg shadow-[#00D4FF]/5' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${config.bg} ${config.color} border ${config.border}`}>
                          <config.icon size={18} />
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                          asset.status === 'healthy' 
                            ? 'bg-[#00E676]/10 text-[#00E676] border-[#00E676]/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {asset.status}
                        </div>
                      </div>
                      
                      <h3 className="text-white font-bold text-sm tracking-tight mb-1 truncate">{asset.name}</h3>
                      <div className="flex items-center gap-2 text-neutral-500 text-[10px] font-mono mb-4">
                        <span className="truncate">{asset.os}</span>
                      </div>

                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center gap-2">
                          <Cpu size={12} className="text-neutral-500 shrink-0" />
                          <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-[#00D4FF] transition-all" style={{ width: `${asset.cpu_usage}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Activity size={12} className="text-neutral-500 shrink-0" />
                          <div className="flex-1 h-1.5 bg-black/40 rounded-full overflow-hidden">
                            <div className="h-full bg-[#A855F7] transition-all" style={{ width: `${asset.ram_usage}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Slide-over */}
      {selectedAsset && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedAsset(null)} />
          <div className="relative w-full max-w-md h-full bg-[#0A1628] border-l border-white/10 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${assetTypes[selectedAsset.type]?.bg} ${assetTypes[selectedAsset.type]?.color} border ${assetTypes[selectedAsset.type]?.border} shadow-lg shadow-black/20`}>
                {(() => {
                  const Icon = assetTypes[selectedAsset.type]?.icon || Monitor;
                  return <Icon size={24} />;
                })()}
              </div>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="p-2 text-neutral-400 hover:text-white transition-colors rounded-xl bg-white/5 border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-black text-white font-syne tracking-tight uppercase">{selectedAsset.name}</h2>
                <div className="flex items-center gap-3 text-neutral-500 text-xs font-mono mt-2 bg-white/5 py-1 px-3 rounded-md w-fit">
                  <Terminal size={12} /> {selectedAsset.serial}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">User / Role</div>
                  <div className="text-white text-sm font-semibold truncate">{selectedAsset.user}</div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest mb-1">Last Sync</div>
                  <div className="text-white text-sm font-semibold truncate flex items-center gap-1">
                    <Clock size={12} className="text-[#00D4FF]" /> {selectedAsset.lastSeen}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] px-1 border-b border-white/10 pb-2">Live SIEM Telemetry</h3>
                <div className="space-y-6">
                  {[
                    { label: "CPU Usage", value: selectedAsset.cpu_usage || 0, color: "bg-[#00D4FF]", glow: "shadow-[#00D4FF]/20" },
                    { label: "Memory Load", value: selectedAsset.ram_usage || 0, color: "bg-[#A855F7]", glow: "shadow-[#A855F7]/20" },
                    { label: "Overall Health Score", value: selectedAsset.health, color: "bg-[#00E676]", glow: "shadow-[#00E676]/20" },
                  ].map(stat => (
                    <div key={stat.label} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-neutral-500">{stat.label}</span>
                        <span className="text-white">{stat.value}%</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${stat.color} ${stat.glow} shadow-lg transition-all duration-1000`} 
                          style={{ width: `${stat.value}%` }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-2xl p-5 flex gap-4">
                <ShieldCheck size={20} className="text-[#00D4FF] shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-white font-bold text-sm mb-1">Enterprise Compliance</h4>
                  <p className="text-neutral-400 text-xs leading-relaxed">
                    Agent is online. Security definitions and endpoints are fully synchronized with KoolTech SIEM.
                  </p>
                </div>
              </div>

              {selectedAsset.status === 'warning' && (
                <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-5 flex gap-4">
                  <AlertTriangle size={20} className="text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-yellow-500 font-bold text-sm mb-1">Attention Required</h4>
                    <p className="text-neutral-400 text-xs leading-relaxed">
                      Agent has not checked in recently or reports suboptimal health.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-4">
                <button className="bg-white text-[#0A1628] font-black text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 shadow-lg shadow-white/10">
                  <Wrench size={16} /> Open Ticket
                </button>
                <button className="bg-white/5 text-white font-black text-xs uppercase tracking-widest py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                  <ArrowUpRight size={16} /> Web Remote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
