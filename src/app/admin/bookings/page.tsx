"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Mail,
  Phone,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  X,
  Clock,
  User,
  Video,
  AlertTriangle,
  RefreshCw,
  Eye,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

interface Booking {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  service_interest: string;
  notes?: string;
  scheduled_at: string;
  duration_mins: number;
  timezone: string;
  status: string;
  meeting_link?: string;
  reminder_24h_sent: boolean;
  reminder_1h_sent: boolean;
  booked_via: string;
  agent_name?: string;
  session_id?: string;
  created_at: string;
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const supabase = createClient();

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("scheduled_at", { ascending: false });

    if (!error && data) {
      setBookings(data);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Realtime subscription for live updates on bookings
  useEffect(() => {
    const channel = supabase
      .channel("bookings_live_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchBookings]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
      );
      if (selectedBooking?.id === id) {
        setSelectedBooking((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    }
    setUpdatingId(null);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter bookings based on UI settings
  const filteredBookings = bookings.filter((b) => {
    const fullName = `${b.first_name} ${b.last_name}`.toLowerCase();
    const email = b.email.toLowerCase();
    const service = b.service_interest.toLowerCase();
    const matchesSearch =
      fullName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase()) ||
      service.includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesSource = sourceFilter === "all" || b.booked_via === sourceFilter;

    return matchesSearch && matchesStatus && matchesSource;
  });

  // Calculate statistics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;
  const completedCount = bookings.filter((b) => b.status === "completed").length;

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div style={{ padding: "2rem", maxWidth: "1440px", margin: "0 auto", animation: "fadeInUp 0.3s ease-out" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", fontFamily: "Syne, sans-serif", marginBottom: "0.25rem" }}>
              Booking Management
            </h1>
            <p style={{ color: "#64748b", fontSize: "0.875rem" }}>
              View and manage client consultations, live demos, and AI-scheduled sessions.
            </p>
          </div>
          <button
            onClick={fetchBookings}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "8px",
              padding: "0.5rem 1rem",
              color: "#94a3b8",
              fontSize: "0.75rem",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
          <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "3px solid #00D4FF" }}>
            <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>Total Bookings</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginTop: "0.25rem" }}>{totalCount}</div>
          </div>
          <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "3px solid #eab308" }}>
            <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>Pending</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginTop: "0.25rem" }}>{pendingCount}</div>
          </div>
          <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "3px solid #00E676" }}>
            <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>Confirmed</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginTop: "0.25rem" }}>{confirmedCount}</div>
          </div>
          <div className="glass-card" style={{ padding: "1.25rem", borderLeft: "3px solid #a855f7" }}>
            <div style={{ color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700 }}>Completed</div>
            <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "white", marginTop: "0.25rem" }}>{completedCount}</div>
          </div>
        </div>

        {/* Filters Bar */}
        <div className="glass-card" style={{ padding: "1rem", marginBottom: "1.5rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: 1, minWidth: "260px" }}>
            <Search size={16} color="#64748b" style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)" }} />
            <input
              type="text"
              placeholder="Search by name, email, or service..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0.5rem 1rem 0.5rem 2.25rem",
                color: "white",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>

          {/* Status Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} color="#64748b" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem 0.5rem 0.75rem",
                color: "white",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          {/* Source Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Filter size={14} color="#64748b" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              style={{
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "8px",
                padding: "0.5rem 1.5rem 0.5rem 0.75rem",
                color: "white",
                fontSize: "0.85rem",
                outline: "none",
                cursor: "pointer",
              }}
            >
              <option value="all">All Sources</option>
              <option value="ai_agent">AI Agent</option>
              <option value="web_form">Web Form</option>
              <option value="manual">Manual</option>
              <option value="phone">Phone</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="glass-card" style={{ padding: "0", overflowX: "auto" }}>
          {loading && bookings.length === 0 ? (
            <div style={{ padding: "4rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: 40, height: 40, border: "3px solid rgba(0,212,255,0.15)", borderTop: "3px solid #00D4FF", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "#64748b", fontSize: "0.875rem" }}>Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
              <Calendar size={40} style={{ margin: "0 auto 1rem", color: "#1e3a5f" }} />
              <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>No bookings match the current criteria.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "left" }}>Client</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "left" }}>Service</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "left" }}>Scheduled At</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "left" }}>Source</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>Reminders</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "left" }}>Meeting</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "center" }}>Status</th>
                  <th style={{ padding: "1rem", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const isPending = b.status === "pending";
                  const isConfirmed = b.status === "confirmed";
                  const isCompleted = b.status === "completed";
                  const isCancelled = b.status === "cancelled";

                  // Formatting scheduled time
                  const scheduledDate = new Date(b.scheduled_at);
                  const formattedTime = scheduledDate.toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  });

                  return (
                    <tr
                      key={b.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: updatingId === b.id ? "rgba(255,255,255,0.02)" : "transparent",
                        transition: "background 0.2s",
                      }}
                    >
                      {/* Client */}
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <div>
                          <div style={{ color: "white", fontWeight: 600, fontSize: "0.85rem" }}>
                            {b.first_name} {b.last_name}
                          </div>
                          {b.company && (
                            <div style={{ color: "#475569", fontSize: "0.7rem", fontWeight: 500 }}>
                              {b.company}
                            </div>
                          )}
                          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.2rem" }}>
                            <a
                              href={`mailto:${b.email}`}
                              style={{ color: "#64748b", fontSize: "0.7rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}
                            >
                              <Mail size={10} /> {b.email}
                            </a>
                            {b.phone && (
                              <span style={{ color: "#475569", fontSize: "0.7rem", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                                <Phone size={10} /> {b.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Service Interest */}
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.8rem" }}>
                          {b.service_interest}
                        </span>
                      </td>

                      {/* Scheduled Time */}
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <div style={{ color: "white", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <Clock size={12} color="#00D4FF" />
                          {formattedTime}
                        </div>
                        <span style={{ color: "#475569", fontSize: "0.65rem", marginLeft: "1rem" }}>
                          {b.timezone}
                        </span>
                      </td>

                      {/* Booked Via */}
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        <div>
                          <span
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              background: b.booked_via === "ai_agent" ? "rgba(0,212,255,0.08)" : "rgba(255,255,255,0.04)",
                              color: b.booked_via === "ai_agent" ? "#00D4FF" : "#94a3b8",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                            }}
                          >
                            {b.booked_via === "ai_agent" ? "AI Agent" : b.booked_via}
                          </span>
                          {b.agent_name && (
                            <div style={{ fontSize: "0.65rem", color: "#64748b", marginTop: "0.2rem" }}>
                              via {b.agent_name}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Reminders Sent */}
                      <td style={{ padding: "1rem", verticalAlign: "middle", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", gap: "0.5rem" }}>
                          <span
                            title="24-hour Email Reminder"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              background: b.reminder_24h_sent ? "rgba(0,229,118,0.1)" : "rgba(255,255,255,0.02)",
                              color: b.reminder_24h_sent ? "#00E676" : "#475569",
                              border: b.reminder_24h_sent ? "1px solid rgba(0,229,118,0.2)" : "1px solid rgba(255,255,255,0.04)",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                            }}
                          >
                            24h
                          </span>
                          <span
                            title="1-hour Email Reminder"
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              background: b.reminder_1h_sent ? "rgba(0,229,118,0.1)" : "rgba(255,255,255,0.02)",
                              color: b.reminder_1h_sent ? "#00E676" : "#475569",
                              border: b.reminder_1h_sent ? "1px solid rgba(0,229,118,0.2)" : "1px solid rgba(255,255,255,0.04)",
                              padding: "0.15rem 0.4rem",
                              borderRadius: "4px",
                            }}
                          >
                            1h
                          </span>
                        </div>
                      </td>

                      {/* Meeting Link */}
                      <td style={{ padding: "1rem", verticalAlign: "middle" }}>
                        {b.meeting_link ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <a
                              href={b.meeting_link}
                              target="_blank"
                              rel="noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "0.3rem",
                                background: "rgba(0,212,255,0.08)",
                                border: "1px solid rgba(0,212,255,0.15)",
                                color: "#00D4FF",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                textDecoration: "none",
                                transition: "all 0.2s",
                              }}
                            >
                              <Video size={12} />
                              Join Meet
                            </a>
                            <button
                              onClick={() => copyToClipboard(b.meeting_link!, b.id)}
                              style={{
                                background: "none",
                                border: "none",
                                color: copiedId === b.id ? "#00E676" : "#64748b",
                                cursor: "pointer",
                                padding: "4px",
                              }}
                              title="Copy Meeting Link"
                            >
                              {copiedId === b.id ? <Check size={12} /> : <Copy size={12} />}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#475569", fontSize: "0.75rem" }}>None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "1rem", verticalAlign: "middle", textAlign: "center" }}>
                        <span
                          style={{
                            fontSize: "0.65rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "999px",
                            background: isPending
                              ? "rgba(234,179,8,0.15)"
                              : isConfirmed
                              ? "rgba(0,229,118,0.12)"
                              : isCompleted
                              ? "rgba(168,85,247,0.12)"
                              : "rgba(239,68,68,0.12)",
                            color: isPending
                              ? "#eab308"
                              : isConfirmed
                              ? "#00E676"
                              : isCompleted
                              ? "#a855f7"
                              : "#ef4444",
                          }}
                        >
                          {b.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "1rem", verticalAlign: "middle", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                          <button
                            onClick={() => setSelectedBooking(b)}
                            style={{
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "6px",
                              padding: "0.25rem 0.5rem",
                              color: "#94a3b8",
                              fontSize: "0.75rem",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <Eye size={12} />
                            Details
                          </button>
                          {isConfirmed || isPending ? (
                            <>
                              <button
                                onClick={() => handleStatusChange(b.id, "completed")}
                                style={{
                                  background: "rgba(0,229,118,0.1)",
                                  border: "1px solid rgba(0,229,118,0.2)",
                                  borderRadius: "6px",
                                  padding: "0.25rem 0.5rem",
                                  color: "#00E676",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                Complete
                              </button>
                              <button
                                onClick={() => handleStatusChange(b.id, "cancelled")}
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  border: "1px solid rgba(239,68,68,0.2)",
                                  borderRadius: "6px",
                                  padding: "0.25rem 0.5rem",
                                  color: "#ef4444",
                                  fontSize: "0.75rem",
                                  cursor: "pointer",
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            style={{
              background: "rgba(10,22,40,0.98)",
              border: "1px solid rgba(0,212,255,0.15)",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "580px",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)",
              animation: "fadeInUp 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "white", fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>
                Booking Details
              </h3>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {/* Client Profile */}
              <div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.5rem" }}>Client Details</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "rgba(255,255,255,0.02)", padding: "0.75rem 1rem", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,212,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <User size={20} color="#00D4FF" />
                  </div>
                  <div>
                    <div style={{ color: "white", fontWeight: 700, fontSize: "0.95rem" }}>
                      {selectedBooking.first_name} {selectedBooking.last_name}
                    </div>
                    {selectedBooking.company && (
                      <div style={{ color: "#94a3b8", fontSize: "0.75rem", fontWeight: 500 }}>
                        {selectedBooking.company}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact info list */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Email</div>
                  <a href={`mailto:${selectedBooking.email}`} style={{ color: "white", fontSize: "0.85rem", textDecoration: "none" }}>
                    {selectedBooking.email}
                  </a>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Phone</div>
                  <div style={{ color: "white", fontSize: "0.85rem" }}>
                    {selectedBooking.phone || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Scheduled details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Scheduled Time</div>
                  <div style={{ color: "white", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Calendar size={13} color="#00D4FF" />
                    {new Date(selectedBooking.scheduled_at).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Timezone</div>
                  <div style={{ color: "white", fontSize: "0.85rem" }}>
                    {selectedBooking.timezone}
                  </div>
                </div>
              </div>

              {/* Service interest */}
              <div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Service Area</div>
                <div style={{ color: "white", fontSize: "0.85rem", fontWeight: 600 }}>
                  {selectedBooking.service_interest}
                </div>
              </div>

              {/* Notes */}
              <div>
                <div style={{ color: "#64748b", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.25rem" }}>Client Notes / AI Summary</div>
                <div
                  style={{
                    background: "rgba(0,0,0,0.25)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    padding: "0.75rem 1rem",
                    color: "#94a3b8",
                    fontSize: "0.8rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {selectedBooking.notes || "No notes provided."}
                </div>
              </div>

              {/* Metadata */}
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                  <span style={{ color: "#64748b" }}>Booked Via:</span>
                  <span style={{ color: "white", fontWeight: 600 }}>{selectedBooking.booked_via}</span>
                </div>
                {selectedBooking.agent_name && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ color: "#64748b" }}>AI Assistant:</span>
                    <span style={{ color: "#00D4FF", fontWeight: 600 }}>{selectedBooking.agent_name}</span>
                  </div>
                )}
                {selectedBooking.session_id && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem" }}>
                    <span style={{ color: "#64748b" }}>Session ID:</span>
                    <span style={{ color: "#64748b", wordBreak: "break-all" }}>{selectedBooking.session_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {selectedBooking.status === "confirmed" || selectedBooking.status === "pending" ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, "completed")}
                      style={{
                        background: "#00E676",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        color: "#0f172a",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedBooking.id, "cancelled")}
                      style={{
                        background: "#ef4444",
                        border: "none",
                        borderRadius: "8px",
                        padding: "0.5rem 1rem",
                        color: "white",
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      Cancel Booking
                    </button>
                  </>
                ) : null}
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  padding: "0.5rem 1.25rem",
                  color: "#94a3b8",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
