"use client";
import { useState, useEffect } from "react";
import { Bell, X, Shield, DollarSign, Activity, Clock, ArrowRight, Zap, Info } from "lucide-react";

type Notification = {
  id: string;
  type: 'security' | 'billing' | 'system' | 'operational';
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high';
};

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: "1",
    type: "security",
    title: "Unusual Login Detected",
    description: "A new login from San Francisco, CA was detected on your account.",
    time: "2m ago",
    isRead: false,
    priority: "high"
  },
  {
    id: "2",
    type: "billing",
    title: "Invoice #INV-2024-001 Paid",
    description: "Thank you for your payment. Your balance has been updated.",
    time: "4h ago",
    isRead: false,
    priority: "low"
  },
  {
    id: "3",
    type: "operational",
    title: "Backup Success: Server 01",
    description: "Full nightly backup of 'Primary-DB-01' completed successfully.",
    time: "8h ago",
    isRead: true,
    priority: "medium"
  },
  {
    id: "4",
    type: "system",
    title: "Maintenance Scheduled",
    description: "Cloud infrastructure maintenance scheduled for Sunday, 02:00 UTC.",
    time: "1d ago",
    isRead: true,
    priority: "medium"
  }
];

export default function NotificationHub() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield size={16} color="#ef4444" />;
      case 'billing': return <DollarSign size={16} color="#10b981" />;
      case 'operational': return <Activity size={16} color="#00d4ff" />;
      default: return <Info size={16} color="#94a3b8" />;
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: "none", 
          border: "none", 
          color: "var(--color-neutral-400)", 
          cursor: "pointer", 
          position: "relative",
          padding: "0.5rem",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.2s"
        }}
        className="hover:bg-white/5"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <div style={{ 
            position: "absolute", 
            top: 4, 
            right: 4, 
            minWidth: 16, 
            height: 16, 
            borderRadius: "99px", 
            background: "var(--color-danger)", 
            color: "white",
            fontSize: "0.6rem",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 4px",
            border: "2px solid #0a1628"
          }}>
            {unreadCount}
          </div>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{ position: "fixed", inset: 0, zIndex: 998 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div style={{
            position: "absolute",
            top: "calc(100% + 1rem)",
            right: 0,
            width: "360px",
            maxHeight: "500px",
            background: "rgba(10, 22, 45, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "16px",
            boxShadow: "0 20px 50px -12px rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "slideIn 0.2s ease-out"
          }}>
            <div style={{ padding: "1.25rem", borderBottom: "1px solid rgba(255, 255, 255, 0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <Zap size={16} color="var(--color-accent-500)" />
                <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.05em" }}>Intelligence Feed</span>
              </div>
              <button 
                onClick={markAllRead}
                style={{ background: "none", border: "none", color: "var(--color-accent-500)", fontSize: "0.7rem", fontWeight: 700, cursor: "pointer" }}
              >
                Mark all read
              </button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: "0.5rem" }} className="custom-scrollbar">
              {notifications.length === 0 ? (
                <div style={{ padding: "3rem 1rem", textAlign: "center", color: "var(--color-neutral-500)" }}>
                  <Bell size={32} style={{ marginBottom: "1rem", opacity: 0.2 }} />
                  <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>All caught up!</div>
                  <div style={{ fontSize: "0.75rem" }}>No new notifications at this time.</div>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                  {notifications.map(n => (
                    <div 
                      key={n.id} 
                      style={{ 
                        padding: "1rem", 
                        borderRadius: "10px", 
                        background: n.isRead ? "transparent" : "rgba(255,255,255,0.02)", 
                        border: "1px solid transparent",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      className="hover:bg-white/[0.04] group"
                    >
                      <div style={{ display: "flex", gap: "0.875rem" }}>
                        <div style={{ 
                          width: 32, height: 32, borderRadius: "8px", 
                          background: "rgba(255,255,255,0.03)", 
                          display: "flex", alignItems: "center", justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {getTypeIcon(n.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                            <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "white" }}>{n.title}</span>
                            {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-500)" }} />}
                          </div>
                          <p style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", lineHeight: 1.4, marginBottom: "0.5rem" }}>
                            {n.description}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-600)", fontSize: "0.65rem", fontWeight: 600 }}>
                            <Clock size={10} />
                            {n.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: "1rem", borderTop: "1px solid rgba(255, 255, 255, 0.05)", background: "rgba(255,255,255,0.01)" }}>
              <button style={{ 
                width: "100%", padding: "0.75rem", borderRadius: "8px", 
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", 
                color: "white", fontSize: "0.75rem", fontWeight: 700, 
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                cursor: "pointer"
              }}>
                View Full Alert Console <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
