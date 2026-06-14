"use client";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { 
  Cpu, Clock, AlertTriangle, Plus, Loader2,
  CheckCircle2, ShieldCheck, Activity,
  Database, BarChart3, Settings, Trash2, X, Shield, Server,
  ShoppingCart, Check, HelpCircle, Zap
} from "lucide-react";
import * as Icons from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { serviceCatalog, Service } from "@/data/services";

interface ClientService {
  id: string;
  client_id: string;
  service_name: string;
  service_sku: string;
  status: string;
  price: number;
  next_billing_date: string;
}

const getCategoryIcon = (iconName: string) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[iconName] || HelpCircle;
  return <IconComponent size={20} />;
};

const getMockPerformance = (id: string) => {
  const sum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cpu = 15 + (sum % 45); // 15% - 60%
  const ram = 30 + ((sum * 2) % 55); // 30% - 85%
  const network = 5 + (sum % 90); // 5 - 95 MB/s
  return { cpu, ram, network };
};

const parsePrice = (priceStr: string) => {
  if (!priceStr || priceStr.toLowerCase() === "custom") return 0;
  const num = parseFloat(priceStr.replace(/[^0-9.]/g, ""));
  return isNaN(num) ? 0 : num;
};

export default function MyServicesPage() {
  const [services, setServices] = useState<ClientService[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Cart state
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [provisioning, setProvisioning] = useState(false);
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

  // Handle Cart selection
  const toggleCartService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.some(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      }
      return [...prev, service];
    });
  };

  // Cart totals
  const cartTotals = useMemo(() => {
    let monthlyTotal = 0;
    let hasCustom = false;
    selectedServices.forEach(s => {
      if (s.price.toLowerCase() === "custom") {
        hasCustom = true;
      } else {
        const val = parsePrice(s.price);
        if (s.priceType === "Monthly") {
          monthlyTotal += val;
        }
      }
    });
    return { monthlyTotal, hasCustom };
  }, [selectedServices]);

  // Handle Provisioning of Selected Stack
  const handleProvisionStack = async () => {
    if (selectedServices.length === 0) return;
    setProvisioning(true);
    setActionError(null);

    const payload = selectedServices.map(s => ({
      service_name: s.name,
      service_sku: s.code,
      price: parsePrice(s.price)
    }));

    try {
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ services: payload })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to provision stack");
      }

      await fetchServices();
      setSelectedServices([]);
      setShowCatalogModal(false);
    } catch (err: any) {
      setActionError(err.message || "An unexpected error occurred.");
    } finally {
      setProvisioning(false);
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
          margin-bottom: 2.5rem;
        }
        .services-provision-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          background: linear-gradient(135deg, #00D4FF 0%, #0082b4 100%);
          color: #060B18;
          font-family: inherit;
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid rgba(0, 212, 255, 0.4);
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.15);
          white-space: nowrap;
        }
        .services-provision-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 30px rgba(0, 212, 255, 0.35);
          filter: brightness(1.15);
        }
        .services-provision-btn:active {
          transform: translateY(0);
        }

        /* Empty State */
        .empty-state-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 6rem 2rem;
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(255, 255, 255, 0.015) 0%, rgba(255, 255, 255, 0) 100%);
          border: 1px solid rgba(255, 255, 255, 0.04);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.03);
          position: relative;
          overflow: hidden;
        }
        .empty-state-icon-box {
          width: 5.5rem;
          height: 5.5rem;
          border-radius: 22px;
          background: rgba(0, 212, 255, 0.05);
          border: 1px solid rgba(0, 212, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D4FF;
          margin-bottom: 1.5rem;
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.1);
          position: relative;
        }
        .empty-state-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.5rem;
          text-transform: uppercase;
          letter-spacing: -0.01em;
          color: white;
          margin-bottom: 0.5rem;
        }
        .empty-state-desc {
          color: var(--color-neutral-400);
          font-size: 0.8125rem;
          max-width: 320px;
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        .empty-state-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          border-radius: 12px;
          background: rgba(0, 212, 255, 0.06);
          color: #00D4FF;
          border: 1px solid rgba(0, 212, 255, 0.2);
          font-weight: 700;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .empty-state-btn:hover {
          background: rgba(0, 212, 255, 0.12);
          border-color: rgba(0, 212, 255, 0.4);
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.15);
          transform: translateY(-1px);
        }

        /* Active Cards */
        .active-card-container {
          background: rgba(10, 22, 40, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .active-card-container:hover {
          border-color: rgba(0, 212, 255, 0.3);
          box-shadow: 0 10px 30px rgba(0, 212, 255, 0.08);
          transform: translateY(-2px);
        }
        .active-card-icon-box {
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          background: rgba(0, 212, 255, 0.06);
          border: 1px solid rgba(0, 212, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D4FF;
          box-shadow: 0 0 15px rgba(0, 212, 255, 0.05);
        }
        .active-card-status {
          font-family: 'DM Sans', sans-serif !important;
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          padding: 0.25rem 0.625rem;
          border-radius: 20px;
          background: rgba(0, 230, 118, 0.06);
          border: 1px solid rgba(0, 230, 118, 0.15);
          color: #00E676;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .pulse-online {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #00E676;
          box-shadow: 0 0 10px #00E676;
          animation: pulse 1.8s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 5px rgba(0, 230, 118, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(0, 230, 118, 0); }
        }
        .metric-container {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.02);
          padding: 0.875rem;
          border-radius: 12px;
        }
        .metric-bar-track {
          height: 5px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: 3px;
          overflow: hidden;
          margin-top: 0.4rem;
        }
        .metric-bar-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .billing-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
        }
        .billing-pill {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          padding: 0.75rem;
          border-radius: 12px;
        }
        .billing-pill-label {
          font-size: 0.5625rem;
          font-weight: 800;
          color: var(--color-neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin-bottom: 0.25rem;
        }
        .billing-pill-value {
          font-size: 0.8125rem;
          font-weight: 700;
          color: white;
        }
        .active-card-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 255, 255, 0.01);
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }
        .active-card-btn-monitor {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.625rem;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .active-card-btn-monitor:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }
        .active-card-btn-cancel {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          padding: 0.625rem;
          border-radius: 10px;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.15);
          color: #ef4444;
          font-size: 0.6875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          transition: all 0.2s;
        }
        .active-card-btn-cancel:hover {
          background: rgba(239, 68, 68, 0.12);
          border-color: rgba(239, 68, 68, 0.3);
        }

        /* SLA Console */
        .sla-card-container {
          background: linear-gradient(135deg, rgba(0, 212, 255, 0.02) 0%, rgba(10, 22, 40, 0.5) 100%);
          border: 1px solid rgba(0, 212, 255, 0.08);
          border-radius: 24px;
          padding: 2rem;
          margin-top: 3.5rem;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          position: relative;
          overflow: hidden;
        }
        .sla-card-header {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          margin-bottom: 2rem;
        }
        .sla-card-icon-box {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 16px;
          background: rgba(0, 212, 255, 0.08);
          border: 1px solid rgba(0, 212, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #00D4FF;
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.1);
        }
        .sla-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 2rem;
        }
        .sla-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .sla-item-label {
          font-size: 0.625rem;
          font-weight: 800;
          color: var(--color-neutral-500);
          text-transform: uppercase;
          letter-spacing: 0.15em;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .sla-item-value {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.75rem;
          color: white;
          letter-spacing: -0.01em;
        }
        .sla-item-status {
          font-size: 0.625rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        /* Catalog Modal */
        .catalog-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(5, 8, 16, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .catalog-modal-content {
          background: rgba(10, 18, 34, 0.96);
          border: 1px solid rgba(255, 255, 255, 0.08);
          width: 100%;
          max-width: 1150px;
          border-radius: 24px;
          padding: 2.25rem;
          position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.04);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
        }
        .catalog-modal-body {
          display: grid;
          grid-template-columns: 240px 1fr 280px;
          gap: 2rem;
          margin-top: 2rem;
          overflow-y: auto;
          flex: 1;
        }
        .catalog-categories-list {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          padding-right: 1.25rem;
        }
        .catalog-category-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.6875rem 1rem;
          border-radius: 12px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--color-neutral-400);
          font-family: inherit;
          font-weight: 600;
          font-size: 0.8125rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .catalog-category-btn:hover {
          background: rgba(255, 255, 255, 0.02);
          color: white;
        }
        .catalog-category-btn.active {
          background: rgba(0, 212, 255, 0.06);
          border-color: rgba(0, 212, 255, 0.15);
          color: #00D4FF;
        }
        .catalog-services-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1rem;
          padding-bottom: 1rem;
        }
        .catalog-service-card {
          background: rgba(255, 255, 255, 0.015);
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 16px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .catalog-service-card:hover {
          border-color: rgba(0, 212, 255, 0.25);
          background: rgba(255, 255, 255, 0.03);
        }
        .catalog-service-card.selected {
          border-color: #00D4FF;
          background: rgba(0, 212, 255, 0.04);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.05);
        }
        .catalog-stack-sidebar {
          border-left: 1px solid rgba(255, 255, 255, 0.05);
          padding-left: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .catalog-modal-footer {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        /* Responsive Overrides */
        @media (max-width: 900px) {
          .catalog-modal-body {
            grid-template-columns: 1fr;
          }
          .catalog-stack-sidebar {
            border-left: none;
            padding-left: 0;
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 1.5rem;
            margin-top: 1rem;
          }
          .catalog-categories-list {
            flex-direction: row;
            border-right: none;
            padding-right: 0;
            border-bottom: 1px solid rgba(255,255,255,0.05);
            padding-bottom: 1rem;
            overflow-x: auto;
            scrollbar-width: none;
          }
          .catalog-categories-list::-webkit-scrollbar {
            display: none;
          }
          .catalog-category-btn {
            white-space: nowrap;
          }
          .sla-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
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
          <div className="empty-state-container lg:col-span-3">
            <div className="empty-state-icon-box">
              <Database size={36} />
            </div>
            <h2 className="empty-state-title">No Active Subscriptions</h2>
            <p className="empty-state-desc">
              Discover enterprise-grade managed IT solutions in our global service catalog.
            </p>
            <button 
              onClick={() => setShowCatalogModal(true)}
              className="empty-state-btn"
            >
              Browse Catalog
            </button>
          </div>
        ) : services.map(s => {
          const perf = getMockPerformance(s.id);
          const isCancelling = s.id === cancellingServiceId;
          
          // Try to locate category for item styling/icon
          let matchedService: Service | undefined = undefined;
          let matchedCategoryIconName = "Cpu";
          for (const cat of serviceCatalog) {
            const found = cat.services.find(item => item.code === s.service_sku);
            if (found) {
              matchedService = found;
              matchedCategoryIconName = cat.icon;
              break;
            }
          }
          
          const icon = getCategoryIcon(matchedCategoryIconName);

          return (
            <div key={s.id} className="active-card-container">
              <div className="p-6 space-y-5 flex-1">
                <div className="flex justify-between items-start">
                  <div className="active-card-icon-box">
                    {icon}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="active-card-status">
                      <span className="pulse-online" /> {s.status}
                    </span>
                    <span className="text-[9px] font-bold text-neutral-500 uppercase tracking-wider mt-2">SKU: {s.service_sku}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white font-syne tracking-tight group-hover:text-[#00D4FF] transition-colors">{s.service_name}</h3>
                  <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-widest mt-1">Enterprise Subscription</p>
                </div>

                {/* Infrastructure Metrics */}
                <div className="metric-container space-y-3">
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6875rem" }}>
                      <span style={{ color: "var(--color-neutral-500)", fontWeight: 700, textTransform: "uppercase" }}>CPU Core Load</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{perf.cpu}%</span>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill" style={{ width: `${perf.cpu}%`, background: perf.cpu > 80 ? "linear-gradient(90deg, #ef4444, #ff6b6b)" : perf.cpu > 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #00D4FF, #00A3FF)" }} />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.6875rem" }}>
                      <span style={{ color: "var(--color-neutral-500)", fontWeight: 700, textTransform: "uppercase" }}>RAM Utilization</span>
                      <span style={{ color: "white", fontWeight: "bold" }}>{perf.ram}%</span>
                    </div>
                    <div className="metric-bar-track">
                      <div className="metric-bar-fill" style={{ width: `${perf.ram}%`, background: perf.ram > 80 ? "linear-gradient(90deg, #ef4444, #ff6b6b)" : perf.ram > 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" : "linear-gradient(90deg, #00E676, #34d399)" }} />
                    </div>
                  </div>
                </div>

                <div className="billing-grid">
                  <div className="billing-pill">
                    <div className="billing-pill-label">Monthly Cost</div>
                    <div className="billing-pill-value">
                      {s.price === 0 ? "Custom Quote" : `$${s.price.toLocaleString()}`}
                    </div>
                  </div>
                  <div className="billing-pill">
                    <div className="billing-pill-label">Renewal Date</div>
                    <div className="billing-pill-value">{new Date(s.next_billing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                  </div>
                </div>
              </div>

              <div className="active-card-footer">
                <button className="active-card-btn-monitor">
                  <BarChart3 size={12} /> Monitor
                </button>
                <button 
                  onClick={() => handleCancelService(s.id)}
                  disabled={isCancelling}
                  className="active-card-btn-cancel"
                >
                  {isCancelling ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Cancel
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SLA Infrastructure Section */}
      <div className="sla-card-container">
        <div className="flex flex-col lg:flex-row items-stretch gap-10">
          <div className="shrink-0 flex lg:flex-col items-center lg:items-start gap-4">
            <div className="sla-card-icon-box">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-syne uppercase tracking-tight">SLA Performance</h2>
              <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-wider mt-1">Live Contractual Compliance</p>
            </div>
          </div>

          <div className="sla-grid flex-1 w-full">
            <div className="sla-item">
              <div className="sla-item-label">
                <Clock size={12} style={{ color: "#00D4FF" }} /> Target Response
              </div>
              <div className="sla-item-value">&lt; 15 Mins</div>
              <div className="sla-item-status" style={{ color: "#00E676" }}>
                <span className="pulse-online" /> Within SLA Target
              </div>
            </div>

            <div className="sla-item">
              <div className="sla-item-label">
                <Activity size={12} style={{ color: "#A855F7" }} /> System Uptime
              </div>
              <div className="sla-item-value">99.99%</div>
              <div className="sla-item-status" style={{ color: "#00E676" }}>
                <span className="pulse-online" /> Exceeding Target
              </div>
            </div>

            <div className="sla-item">
              <div className="sla-item-label">
                <Zap size={12} style={{ color: "#FFB300" }} /> Maintenance
              </div>
              <div className="sla-item-value">Clear</div>
              <div className="text-neutral-500 text-[9px] font-bold uppercase tracking-wider">Next Window: May 25th</div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog & Custom Stack Builder Modal */}
      {showCatalogModal && (
        <div className="catalog-modal-overlay">
          <div className="catalog-modal-content">
            <button
              onClick={() => setShowCatalogModal(false)}
              style={{ position: "absolute", right: "1.5rem", top: "1.5rem", background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", zIndex: 10 }}
            >
              <X size={20} />
            </button>
            
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "1.5rem", fontWeight: 900, color: "white", marginBottom: "0.25rem" }} className="uppercase">
                Build Your Custom Stack
              </h2>
              <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
                Browse our comprehensive catalog and check the services you want to provision into your custom stack.
              </p>
            </div>

            {actionError && (
              <div style={{ margin: "1rem 0 0", padding: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#EF4444", borderRadius: "8px", fontSize: "0.875rem" }}>
                {actionError}
              </div>
            )}

            <div className="catalog-modal-body">
              {/* Category Tab Selector */}
              <div className="catalog-categories-list">
                {serviceCatalog.map((cat, index) => {
                  const isSelected = activeCategoryIndex === index;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setActiveCategoryIndex(index)}
                      className={`catalog-category-btn ${isSelected ? "active" : ""}`}
                    >
                      {getCategoryIcon(cat.icon)}
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{cat.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Service Cards under Selected Category */}
              <div style={{ overflowY: "auto", maxHeight: "50vh" }}>
                <h3 style={{ color: "white", fontSize: "1.125rem", fontWeight: 700, fontFamily: "Syne, sans-serif", marginBottom: "0.5rem" }}>
                  {serviceCatalog[activeCategoryIndex].name}
                </h3>
                <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
                  {serviceCatalog[activeCategoryIndex].description}
                </p>

                <div className="catalog-services-grid">
                  {serviceCatalog[activeCategoryIndex].services.map((service) => {
                    const isServiceSelected = selectedServices.some(s => s.id === service.id);
                    return (
                      <div
                        key={service.id}
                        onClick={() => toggleCartService(service)}
                        className={`catalog-service-card ${isServiceSelected ? "selected" : ""}`}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem", marginBottom: "0.75rem" }}>
                          <div>
                            <h4 style={{ color: "white", fontSize: "0.875rem", fontWeight: "bold", margin: 0 }}>
                              {service.name}
                            </h4>
                            <span style={{ fontSize: "0.625rem", color: "var(--color-neutral-500)", fontFamily: "monospace", display: "block", marginTop: "2px" }}>
                              {service.code}
                            </span>
                          </div>

                          <div style={{ 
                            width: 20, height: 20, borderRadius: "6px", 
                            background: isServiceSelected ? "var(--color-accent-500)" : "rgba(255,255,255,0.06)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: isServiceSelected ? "#060B18" : "transparent",
                            flexShrink: 0,
                            border: isServiceSelected ? "1px solid var(--color-accent-500)" : "1px solid rgba(255,255,255,0.1)",
                            transition: "all 0.15s ease"
                          }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        </div>

                        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", lineHeight: 1.5, margin: "0 0 1.25rem 0", flex: 1 }}>
                          {service.description}
                        </p>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                          <span style={{ color: "var(--color-accent-500)", fontSize: "0.9375rem", fontWeight: 700 }}>
                            {service.price}
                          </span>
                          <span style={{ color: "var(--color-neutral-500)", fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 600 }}>
                            {service.priceType}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Stack Sidebar (Desktop) */}
              <div className="catalog-stack-sidebar">
                <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, fontFamily: "Syne, sans-serif", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem", marginBottom: "1rem" }} className="uppercase">
                  Your Pending Stack ({selectedServices.length})
                </h3>
                
                {selectedServices.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "150px", textAlign: "center", padding: "1rem", color: "var(--color-neutral-500)", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: "12px", background: "rgba(255,255,255,0.01)" }}>
                    <ShoppingCart size={20} style={{ marginBottom: "0.5rem", opacity: 0.3, color: "var(--color-accent-500)" }} />
                    <p style={{ fontSize: "0.75rem", margin: 0, lineHeight: 1.4 }}>No services selected. Add items from the catalog.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", overflowY: "auto", maxHeight: "40vh", paddingRight: "4px" }}>
                    {selectedServices.map(s => (
                      <div key={s.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                        padding: "0.5rem 0.75rem", borderRadius: "10px"
                      }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: "0.5rem" }}>
                          <div style={{ color: "white", fontWeight: 600, fontSize: "0.75rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                          <div style={{ color: "var(--color-neutral-500)", fontSize: "0.625rem", fontFamily: "monospace" }}>{s.code}</div>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ color: "var(--color-accent-500)", fontWeight: 700, fontSize: "0.75rem" }}>{s.price}</span>
                          <button 
                            onClick={() => toggleCartService(s)}
                            style={{ background: "none", border: "none", color: "#FF4444", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px", borderRadius: "4px" }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sticky Stack Builder Summary Footer */}
            <div className="catalog-modal-footer">
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-accent-500)", border: "1px solid rgba(0,212,255,0.2)" }}>
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>
                      {selectedServices.length} Services Selected
                    </div>
                    <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Custom Package Stack</div>
                  </div>
                </div>
                
                <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: "1.5rem" }}>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>Est. Monthly Total</div>
                  <div style={{ color: "var(--color-accent-500)", fontWeight: 800, fontSize: "1.125rem", display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                    ${cartTotals.monthlyTotal.toFixed(2)}
                    {cartTotals.hasCustom && <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", fontWeight: 500 }}> + Custom Quote</span>}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <button 
                  onClick={() => setSelectedServices([])}
                  style={{ background: "none", border: "none", color: "var(--color-neutral-500)", fontSize: "0.8125rem", cursor: "pointer", fontWeight: 600 }}
                >
                  Clear Selection
                </button>
                <button
                  onClick={handleProvisionStack}
                  disabled={selectedServices.length === 0 || provisioning}
                  className="btn-primary"
                  style={{ padding: "0.625rem 1.5rem", fontSize: "0.8125rem", borderRadius: "12px", border: "none" }}
                >
                  {provisioning ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  Confirm & Provision Stack
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
