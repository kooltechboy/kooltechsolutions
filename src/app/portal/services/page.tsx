"use client";
import React, { useEffect, useState } from "react";
import { Server, Shield, Zap, Globe, Cpu, Clock, AlertTriangle, Plus, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function MyServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('client_services')
      .select('*')
      .eq('client_id', user.id);
    
    if (data) setServices(data);
    setLoading(false);
  }

  if (loading) {
    return (
      <div style={{ height: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 className="animate-spin" color="var(--color-accent-500)" size={48} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>Managed Services</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>View and manage your active IT subscriptions.</p>
        </div>
        <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "1.5rem" }}>
        {services.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: "1 / -1", padding: "4rem", textAlign: "center" }}>
            <Server size={48} color="var(--color-neutral-600)" style={{ margin: "0 auto 1.5rem" }} />
            <h2 style={{ color: "white", marginBottom: "0.5rem" }}>No active services found</h2>
            <p style={{ color: "var(--color-neutral-500)", marginBottom: "2rem" }}>You haven&apos;t subscribed to any managed services yet.</p>
            <button className="btn-primary">Browse Service Catalog</button>
          </div>
        ) : services.map(s => (
          <div key={s.id} className="glass-card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, right: 0, padding: "0.5rem 1rem", background: "rgba(16,185,129,0.1)", color: "#10b981", fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase" }}>
              {s.status}
            </div>
            
            <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Cpu size={22} color="var(--color-accent-500)" />
              </div>
              <div>
                <h3 style={{ color: "white", fontSize: "1.125rem", fontWeight: 700 }}>{s.service_name}</h3>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>SKU: {s.service_sku}</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Monthly Cost</div>
                <div style={{ color: "white", fontWeight: 700 }}>${s.price}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "0.75rem", borderRadius: "8px" }}>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.65rem", textTransform: "uppercase", marginBottom: "0.25rem" }}>Next Billing</div>
                <div style={{ color: "white", fontWeight: 700 }}>{new Date(s.next_billing_date).toLocaleDateString()}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn-ghost" style={{ flex: 1, fontSize: "0.8125rem" }}>Usage Report</button>
              <button className="btn-ghost" style={{ flex: 1, fontSize: "0.8125rem", color: "#ef4444" }}>Manage</button>
            </div>
          </div>
        ))}
      </div>

      {/* SLA Status */}
      <div className="glass-card" style={{ marginTop: "3rem", padding: "2rem", background: "linear-gradient(135deg, rgba(0,212,255,0.05), rgba(0,0,0,0))" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <Shield size={24} color="var(--color-accent-500)" />
          <h2 style={{ color: "white", fontSize: "1.25rem", fontWeight: 700 }}>Service Level Agreement (SLA)</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
          <div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Response Time</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>&lt; 15 mins</div>
            <div style={{ color: "#10b981", fontSize: "0.75rem", marginTop: "0.25rem" }}>Within Target</div>
          </div>
          <div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Uptime Commitment</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>99.99%</div>
            <div style={{ color: "#10b981", fontSize: "0.75rem", marginTop: "0.25rem" }}>Currently 100%</div>
          </div>
          <div>
            <div style={{ color: "var(--color-neutral-400)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Scheduled Maintenance</div>
            <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "white" }}>None</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", marginTop: "0.25rem" }}>Next: May 15th</div>
          </div>
        </div>
      </div>
    </div>
  );
}
