"use client";
import React, { useEffect, useState, useCallback } from "react";
import { 
  Cpu, Clock, AlertTriangle, Plus, Loader2,
  CheckCircle2, ShieldCheck, Activity,
  Database, BarChart3, Settings, Trash2, X, Shield, Server, Zap
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

const CATALOG_ITEMS = [
  {
    name: "Pro Compute Node",
    sku: "INF-COMP-PRO",
    price: 49.00,
    description: "High performance cloud compute instances to host applications, running API endpoints, or standard web services.",
    specs: ["4 vCPU", "16GB RAM", "100GB NVMe Disk", "10Gbps Uplink"],
    icon: <Cpu size={20} />
  },
  {
    name: "Vault Database",
    sku: "INF-DB-VAULT",
    price: 99.00,
    description: "Fully-managed, highly available relational database service with continuous backups and security patching.",
    specs: ["PostgreSQL 16 Engine", "8GB Dedicated RAM", "200GB Storage", "Daily Snapshots"],
    icon: <Database size={20} />
  },
  {
    name: "Guard Sentinel",
    sku: "INF-SEC-GUARD",
    price: 149.00,
    description: "Enterprise security perimeter featuring Intrusion Detection/Prevention (IDS/IPS) and managed WAF policies.",
    specs: ["Real-time Inspection", "DDoS Mitigation", "Custom WAF Rules", "Weekly Threat Audit"],
    icon: <Shield size={20} />
  }
];

const getMockPerformance = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cpu = 15 + (sum % 45); // 15% - 60%
  const ram = 30 + ((sum * 2) % 55); // 30% - 85%
  const network = 5 + (sum % 90); // 5 - 95 MB/s
  return { cpu, ram, network };
};

export default function MyServicesPage() {
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [provisioningItemSku, setProvisioningItemSku] = useState<string | null>(null);
  const [cancellingServiceId, setCancellingServiceId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchServices = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('client_services')
      .select('*')
      .eq('client_id', user.id);
    
    if (!error && data) {
      setServices(data as ClientService[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('client-services-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'client_services' }, () => {
        fetchServices();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchServices]);

  // Handle Provisioning
  const handleProvisionService = async (item: typeof CATALOG_ITEMS[0]) => {
    setProvisioningItemSku(item.sku);
    setActionError(null);

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service_name: item.name,
          service_sku: item.sku,
          price: item.price
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to provision service");
      }

      await fetchServices();
      setShowCatalogModal(false);
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setProvisioningItemSku(null);
    }
  };

  // Handle Cancellation (Deprovisioning)
  const handleCancelService = async (id: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this infrastructure service? This will immediately delete the service and all associated data.");
    if (!confirmCancel) return;

    setCancellingServiceId(id);

    try {
      const res = await fetch(`/api/services?id=${id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to cancel service");
      }

      await fetchServices();
    } catch (err: any) {
      alert(err.message || "Failed to cancel service");
    } finally {
      setCancellingServiceId(null);
    }
  };

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
    <div className="space-y-8 animate-in fade-in duration-500" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Styles */}
      <style>{`
        .services-header-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .services-provision-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1.75rem;
          border-radius: 16px;
          background: white;
          color: #0A1628;
          font-family: 'DM Sans', sans-serif;
          font-weight: 800;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 20px rgba(255, 255, 255, 0.05);
          white-space: nowrap;
        }
        .services-provision-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(255, 255, 255, 0.15);
        }
        .sla-layout {
          display: flex;
          align-items: center;
          gap: 3rem;
          padding: 2.5rem;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.05);
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(10, 22, 40, 0.4) 100%);
          margin-top: 3rem;
        }
        .sla-pulse-circle {
          width: 4rem;
          height: 4rem;
          border-radius: 16px;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D4FF;
        }
        .catalog-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .catalog-modal-content {
          background: #0A1222;
          border: 1px solid rgba(255, 255, 255, 0.1);
          width: 100%;
          max-width: 900px;
          border-radius: 24px;
          padding: 2rem;
          position: relative;
          box-shadow: 0 10px 40px rgba(0,0,0,0.6);
          max-height: 90vh;
          overflow-y: auto;
        }
        .catalog-items-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        .catalog-item-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.2s;
        }
        .catalog-item-card:hover {
          border-color: rgba(0, 212, 255, 0.3);
          background: rgba(255, 255, 255, 0.04);
        }
        .catalog-item-card button {
          margin-top: auto;
        }
        @media (max-width: 900px) {
          .catalog-items-grid {
            grid-template-columns: 1fr;
          }
          .catalog-modal-content {
            padding: 1.5rem;
          }
        }
        @media (max-width: 768px) {
          .services-header-container {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .services-provision-btn {
            width: 100%;
            justify-content: center;
          }
          .sla-layout {
            flex-direction: column;
            align-items: stretch;
            padding: 1.5rem;
            gap: 1.5rem;
          }
          .sla-layout-right {
            border-top: 1px solid rgba(255,255,255,0.05);
            border-left: none !important;
            padding-top: 1.5rem;
            padding-left: 0 !important;
          }
        }
      `}</style>

      {/* Header */}
      <div className="services-header-container">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 font-syne uppercase">
            Managed <span className="text-[#00D4FF]">Infrastructure</span>
          </h1>
          <p className="text-neutral-400 text-sm max-w-md">
            Active service subscriptions and infrastructure commitments under professional management.
          </p>
        </div>
        <button 
          onClick={() => setShowCatalogModal(true)}
          className="services-provision-btn"
        >
          <Plus size={16} /> Provision New Service
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.length === 0 ? (
          <div className="glass-card lg:col-span-3 py-24 text-center space-y-6 bg-white/[0.02] border border-white/5" style={{ borderRadius: "24px" }}>
            <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-neutral-800">
              <Database size={40} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-syne uppercase tracking-tight">No Active Subscriptions</h2>
              <p className="text-neutral-500 text-sm mt-2 max-w-xs mx-auto">
                Discover enterprise-grade managed IT solutions in our global service catalog.
              </p>
            </div>
            <button 
              onClick={() => setShowCatalogModal(true)}
              className="px-8 py-3 rounded-xl bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/20 font-bold text-xs uppercase tracking-widest hover:bg-[#00D4FF]/20 transition-all"
              style={{ cursor: "pointer" }}
            >
              Browse Catalog
            </button>
          </div>
        ) : services.map(s => {
          const perf = getMockPerformance(s.id);
          const isCancelling = s.id === cancellingServiceId;
          const catalogItem = CATALOG_ITEMS.find(item => item.sku === s.service_sku);
          const icon = catalogItem?.icon || <Cpu size={20} />;

          return (
            <div key={s.id} className="glass-card group overflow-hidden border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col" style={{ borderRadius: "20px" }}>
              <div className="p-6 space-y-5 flex-1">
                <div className="flex justify-between items-start">
                  <div className="w-12 h-12 rounded-2xl bg-[#00D4FF]/10 flex items-center justify-center text-[#00D4FF] border border-[#00D4FF]/20 shadow-lg shadow-[#00D4FF]/5">
                    {icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-[#00E676] uppercase tracking-[0.2em] px-2.5 py-1 bg-green-500/10 rounded-full border border-green-500/20 flex items-center gap-1">
                      <CheckCircle2 size={10} /> {s.status}
                    </span>
                    <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest mt-2">SKU: {s.service_sku}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white font-syne tracking-tight group-hover:text-[#00D4FF] transition-colors">{s.service_name}</h3>
                  <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest mt-1">Enterprise Subscription</p>
                </div>

                {/* Infrastructure Metrics */}
                <div style={{ background: "rgba(0,0,0,0.15)", padding: "1rem", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.03)" }} className="space-y-3">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--color-neutral-500)", fontWeight: 700, textTransform: "uppercase" }}>CPU Core Load</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{perf.cpu}%</span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${perf.cpu}%`, background: perf.cpu > 80 ? "#FF4444" : perf.cpu > 50 ? "#FFB300" : "#00D4FF", transition: "width 0.5s ease" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6875rem", marginBottom: "0.25rem" }}>
                      <span style={{ color: "var(--color-neutral-500)", fontWeight: 700, textTransform: "uppercase" }}>RAM Utilization</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{perf.ram}%</span>
                    </div>
                    <div style={{ height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${perf.ram}%`, background: perf.ram > 80 ? "#FF4444" : perf.ram > 50 ? "#FFB300" : "#00E676", transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Monthly Cost</div>
                    <div className="text-white font-bold tracking-tight">${s.price.toLocaleString()}</div>
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <div className="text-[9px] font-black text-neutral-600 uppercase tracking-widest mb-1">Renewal Date</div>
                    <div className="text-white font-bold tracking-tight">{new Date(s.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white/[0.02] border-t border-white/5 flex gap-2">
                <button className="flex-1 py-3 rounded-xl bg-white/5 text-white text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-2" style={{ cursor: "pointer" }}>
                  <BarChart3 size={14} /> Monitor
                </button>
                <button 
                  onClick={() => handleCancelService(s.id)}
                  disabled={isCancelling}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                  style={{ cursor: "pointer" }}
                >
                  {isCancelling ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />} Cancel
                </button>
              </div>
            </div>
          );
        })}
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

          <div 
            className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 w-full border-t lg:border-t-0 lg:border-l border-white/5 pt-12 lg:pt-0 lg:pl-12"
            style={{ borderLeft: "1px solid rgba(255,255,255,0.05)", paddingLeft: "3rem" }}
          >
            <div className="space-y-3" style={{ textAlign: "left" }}>
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Clock size={14} className="text-[#00D4FF]" /> Target Response
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">&lt; 15 Mins</div>
              <div className="inline-flex items-center gap-1.5 text-[#00E676] text-[10px] font-black uppercase">
                <CheckCircle2 size={12} /> Within SLA Target
              </div>
            </div>

            <div className="space-y-3" style={{ textAlign: "left" }}>
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Activity size={14} className="text-[#A855F7]" /> System Uptime
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">99.99%</div>
              <div className="inline-flex items-center gap-1.5 text-[#00E676] text-[10px] font-black uppercase">
                <CheckCircle2 size={12} /> Exceeding Target
              </div>
            </div>

            <div className="space-y-3" style={{ textAlign: "left" }}>
              <div className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Zap size={14} className="text-[#FFB300]" /> Maintenance
              </div>
              <div className="text-3xl font-black text-white font-syne tracking-tighter">Clear</div>
              <div className="text-neutral-600 text-[10px] font-black uppercase tracking-widest">Next Window: May 25th</div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog Modal */}
      {showCatalogModal && (
        <div className="catalog-modal-overlay">
          <div className="catalog-modal-content">
            <button
              onClick={() => setShowCatalogModal(false)}
              style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
            
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "white", marginBottom: "0.25rem" }} className="uppercase">
              Infrastructure Catalog
            </h2>
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
              Select a managed subscription item to provision instantly into your infrastructure fleet.
            </p>

            {actionError && (
              <div style={{ margin: "1rem 0 0", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", fontSize: "0.875rem" }}>
                {actionError}
              </div>
            )}

            <div className="catalog-items-grid">
              {CATALOG_ITEMS.map((item) => {
                const isProvisioning = provisioningItemSku === item.sku;
                return (
                  <div key={item.sku} className="catalog-item-card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "10px", background: "rgba(0, 212, 255, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#00D4FF" }}>
                        {item.icon}
                      </div>
                      <span style={{ fontSize: "1.125rem", fontWeight: 900, color: "white" }}>
                        ${item.price.toFixed(2)}<span style={{ fontSize: "0.6875rem", color: "var(--color-neutral-500)", fontWeight: 500 }}>/mo</span>
                      </span>
                    </div>

                    <h3 style={{ color: "white", fontWeight: "bold", fontSize: "1rem", margin: "0 0 0.5rem", fontFamily: "Syne, sans-serif" }}>
                      {item.name}
                    </h3>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", lineHeight: 1.6, margin: "0 0 1.25rem", flex: 1 }}>
                      {item.description}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", marginBottom: "1.5rem" }}>
                      {item.specs.map(spec => (
                        <div key={spec} style={{ display: "flex", alignItems: "center", gap: "0.35rem", color: "white", fontSize: "0.6875rem", fontWeight: 600 }}>
                          <CheckCircle2 size={10} className="text-[#00D4FF]" />
                          {spec}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => handleProvisionService(item)}
                      disabled={provisioningItemSku !== null}
                      className="btn-primary"
                      style={{ width: "100%", justifyContent: "center", padding: "0.625rem", fontSize: "0.75rem", borderRadius: "10px" }}
                    >
                      {isProvisioning ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                      {isProvisioning ? "Provisioning..." : "Provision Now"}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
