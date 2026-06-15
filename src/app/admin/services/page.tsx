"use client";
import { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { Search, ChevronRight, Plus, Loader2, RefreshCw } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface ServiceItem {
  id: string;
  name: string;
  code: string;
  price: string;
  priceType: string;
  priority: string;
  description: string;
}

interface ServiceCategory {
  name: string;
  description: string;
  icon: string;
  services: ServiceItem[];
}

export default function ServicesPage() {
  const [search, setSearch] = useState("");
  const [catalog, setCatalog] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const supabase = createClient();

  const fetchCatalog = useCallback(async () => {
    const { data } = await supabase.from("service_catalog").select("*").order("category");
    if (data) {
      const grouped = data.reduce((acc: Record<string, ServiceCategory>, item) => {
        const catName = item.category || "Other Services";
        if (!acc[catName]) {
          acc[catName] = {
            name: catName,
            description: item.category_description || "",
            icon: item.category_icon || "HelpCircle",
            services: []
          };
        }
        acc[catName].services.push({
          id: item.id,
          name: item.name,
          code: item.code || "",
          price: item.price || "",
          priceType: item.price_type || "per month",
          priority: item.priority || "Normal",
          description: item.description || ""
        });
        return acc;
      }, {});
      setCatalog(Object.values(grouped));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  const handleITFlowSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/itflow/sync", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        alert(`ITFlow Sync Completed!\nSynced ${data.details?.syncedProducts || 0} products/services.`);
        await fetchCatalog();
      } else {
        alert("Sync error: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Network error running sync: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setSyncing(false);
    }
  };

  const filteredCatalog = catalog.map(cat => ({
    ...cat,
    services: cat.services.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      cat.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.services.length > 0);

  if (loading) {
    return (
      <div style={{ height: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white", marginBottom: "0.5rem" }}>
          Service & Solutions <span className="gradient-text">Catalog</span>
        </h1>
        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
          Browse, manage and deploy enterprise-grade IT solutions from our unified portfolio, synced directly with ITFlow.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "280px", maxWidth: "500px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)" }} />
          <input 
            type="text" 
            placeholder="Search by name, category, or code..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "3rem", borderRadius: "12px", width: "100%", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "white", outline: "none", padding: "0.75rem 1rem 0.75rem 3rem" }}
          />
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button 
            onClick={handleITFlowSync}
            disabled={syncing}
            className="btn-ghost" 
            style={{ padding: "0 1.25rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 600, border: "1px solid rgba(0,212,255,0.2)", cursor: "pointer" }}
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            {syncing ? "Syncing ITFlow..." : "Sync ITFlow Products"}
          </button>
          <button className="btn-primary" style={{ padding: "0 1.5rem", borderRadius: "12px", display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
            <Plus size={18} /> New Service
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2rem" }}>
        {filteredCatalog.map((category) => {
          const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[category.icon] || Icons.HelpCircle;
          
          return (
            <div key={category.name} className="glass-card" style={{ 
              borderRadius: "20px", 
              padding: "1.5rem",
              border: "1px solid rgba(0,212,255,0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem"
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                <div style={{ 
                  width: 48, height: 48, borderRadius: "12px", 
                  background: "rgba(0,212,255,0.1)", 
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--color-accent-500)",
                  flexShrink: 0
                }}>
                  <IconComponent size={24} />
                </div>
                <div>
                  <h3 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1.125rem", marginBottom: "0.25rem" }}>
                    {category.name}
                  </h3>
                  <p style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", lineHeight: 1.5 }}>
                    {category.description}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {category.services.map((service) => (
                  <div key={service.id} style={{ 
                    padding: "0.875rem", 
                    borderRadius: "12px", 
                    background: "rgba(255,255,255,0.03)", 
                    border: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <div style={{ color: "white", fontSize: "0.875rem", fontWeight: 600 }}>{service.name}</div>
                          {service.priority === "High" && (
                            <span style={{ fontSize: "0.6rem", background: "rgba(255,68,68,0.1)", color: "#ff4444", padding: "0.15rem 0.4rem", borderRadius: "4px", fontWeight: 700, textTransform: "uppercase" }}>Critical</span>
                          )}
                        </div>
                        <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem", marginTop: "0.1rem" }}>{service.code}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ color: "var(--color-accent-500)", fontSize: "0.875rem", fontWeight: 700 }}>{service.price}</div>
                        <div style={{ color: "var(--color-neutral-600)", fontSize: "0.6rem", textTransform: "uppercase" }}>{service.priceType}</div>
                      </div>
                    </div>
                    <p style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", lineHeight: 1.4 }}>
                      {service.description}
                    </p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button className="btn-secondary" style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", fontSize: "0.75rem", background: "transparent", color: "white", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer" }}>
                  Manage Category
                </button>
                <button className="btn-primary" style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", fontSize: "0.75rem", border: "none", color: "white", cursor: "pointer" }}>
                  Add Service
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
