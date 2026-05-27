"use client";
import React, { useEffect, useState } from 'react';
import { Server, Users, Ticket, FileText, Loader2, RefreshCw } from 'lucide-react';

export default function ITFlowDashboard() {
  const [activeTab, setActiveTab] = useState('tickets');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchModuleData = async (module: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/itflow?endpoint=${module}`);
      const json = await res.json();
      if (json && json.data) {
        setData(json.data);
      } else {
        setData([]);
      }
    } catch (err) {
      console.error(err);
      setData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModuleData(activeTab);
  }, [activeTab]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await fetch('/api/itflow/sync', { method: 'POST' });
      await fetchModuleData(activeTab);
    } catch (err) {
      console.error(err);
    }
    setSyncing(false);
  };

  const tabs = [
    { id: 'tickets', label: 'Tickets', icon: <Ticket size={18} /> },
    { id: 'clients', label: 'Clients', icon: <Users size={18} /> },
    { id: 'assets', label: 'Assets', icon: <Server size={18} /> },
    { id: 'invoices', label: 'Invoices', icon: <FileText size={18} /> },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>ITFlow Management</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Direct view and bi-directional sync with ITFlow.</p>
        </div>
        <button 
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary" 
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          {syncing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
          {syncing ? "Syncing..." : "Sync with Supabase"}
        </button>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "1rem" }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.75rem 1.25rem",
              background: activeTab === tab.id ? "rgba(0, 212, 255, 0.1)" : "transparent",
              color: activeTab === tab.id ? "var(--color-accent-500)" : "var(--color-neutral-400)",
              border: "1px solid",
              borderColor: activeTab === tab.id ? "rgba(0, 212, 255, 0.2)" : "transparent",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: "1.5rem", minHeight: "400px" }}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
            <Loader2 className="animate-spin" color="var(--color-accent-500)" size={32} />
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "rgba(0, 212, 255, 0.05)" }}>
                <tr>
                  {data.length > 0 && Object.keys(data[0]).slice(0, 5).map(key => (
                    <th key={key} style={{ padding: "1rem", textAlign: "left", fontSize: "0.75rem", color: "var(--color-neutral-500)", textTransform: "uppercase" }}>
                      {key.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: "3rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                      No {activeTab} found in ITFlow.
                    </td>
                  </tr>
                ) : (
                  data.map((item, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      {Object.keys(item).slice(0, 5).map(key => (
                        <td key={key} style={{ padding: "1rem", color: "white", fontSize: "0.875rem" }}>
                          {typeof item[key] === 'object' ? JSON.stringify(item[key]) : String(item[key])}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
