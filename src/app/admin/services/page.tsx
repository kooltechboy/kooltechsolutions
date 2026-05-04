"use client";
import { useState } from "react";
import { serviceCatalog, ServiceCategory, Service } from "@/data/services";
import * as Icons from "lucide-react";
import { Search, ChevronRight, Plus, Info } from "lucide-react";

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filteredCatalog = serviceCatalog.map(cat => ({
    ...cat,
    services: cat.services.filter(s => 
      s.name.toLowerCase().includes(search.toLowerCase()) || 
      cat.name.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.services.length > 0);

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "2rem", color: "white", marginBottom: "0.5rem" }}>
          Service & Solutions <span className="gradient-text">Catalog</span>
        </h1>
        <p style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem" }}>
          Browse, manage and deploy enterprise-grade IT solutions from our unified portfolio.
        </p>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "500px" }}>
          <Search size={18} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)" }} />
          <input 
            type="text" 
            placeholder="Search for services, categories, or keywords..."
            className="input-field"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "3rem", borderRadius: "12px" }}
          />
        </div>
        <button className="btn-primary" style={{ padding: "0 1.5rem", borderRadius: "12px" }}>
          <Plus size={18} /> New Service
        </button>
      </div>

      {/* Categories Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "2rem" }}>
        {filteredCatalog.map((category) => {
          const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;
          
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
                {category.services.slice(0, 6).map((service) => (
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
                {category.services.length > 4 && (
                  <button style={{ 
                    background: "none", border: "none", color: "var(--color-accent-600)", 
                    fontSize: "0.75rem", fontWeight: 600, cursor: "pointer", 
                    display: "flex", alignItems: "center", gap: "0.25rem",
                    padding: "0.5rem 0"
                  }}>
                    View all {category.services.length} services <ChevronRight size={14} />
                  </button>
                )}
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "1rem", display: "flex", gap: "0.75rem" }}>
                <button className="btn-secondary" style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", fontSize: "0.75rem" }}>
                  Manage Category
                </button>
                <button className="btn-primary" style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", fontSize: "0.75rem" }}>
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
