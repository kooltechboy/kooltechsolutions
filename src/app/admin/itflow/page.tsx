"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  Ticket, Users, Server, FileText, RefreshCw, Loader2, Plus,
  Clock, CheckCircle2, AlertCircle, XCircle, DollarSign,
  Building2, Laptop, Wrench, ChevronRight, Zap, Activity,
  ArrowUpRight, Search, Filter, MoreHorizontal, ExternalLink,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────────── */
interface ITTicket {
  id: string | number;
  ticket_number?: string;
  subject?: string;
  name?: string;
  status?: string;
  priority?: string;
  client_name?: string;
  contact_name?: string;
  assigned_to?: string;
  created_at?: string;
  updated_at?: string;
  due_date?: string;
}
interface ITClient {
  id: string | number;
  name?: string;
  client_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  type?: string;
  status?: string;
  created_at?: string;
}
interface ITAsset {
  id: string | number;
  name?: string;
  asset_tag?: string;
  type?: string;
  model?: string;
  serial?: string;
  client_name?: string;
  status?: string;
  purchase_date?: string;
  warranty_expires?: string;
  note?: string;
  assignment?: string;
}
interface ITInvoice {
  id: string | number;
  invoice_number?: string;
  client_name?: string;
  amount?: number | string;
  status?: string;
  due_date?: string;
  created_at?: string;
  paid_at?: string;
}
type ITFlowRecord = ITTicket | ITClient | ITAsset | ITInvoice | Record<string, unknown>;
type ITFlowApiResponse = { success?: string; message?: string; data?: ITFlowRecord[] };

function getWarrantyState(expires?: string) {
  const warrantyDate = expires ? new Date(expires) : null;
  const warningCutoff = new Date();
  warningCutoff.setDate(warningCutoff.getDate() + 90);

  const warrantyExpired = warrantyDate ? warrantyDate < new Date() : false;
  const warrantyColor = warrantyExpired
    ? "#ef4444"
    : warrantyDate && warrantyDate < warningCutoff
      ? "#f59e0b"
      : "#10b981";

  return { warrantyExpired, warrantyColor };
}

/* ─── Mock fallbacks ─────────────────────────────────────── */
const MOCK_TICKETS: ITTicket[] = [
  { id: "TK-1001", ticket_number: "TK-1001", subject: "Server disk usage at 92% – urgent cleanup needed", status: "Open", priority: "High", client_name: "Nexus Corp", assigned_to: "Daniel W.", created_at: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: "TK-1002", ticket_number: "TK-1002", subject: "VPN client not connecting after Windows update", status: "In Progress", priority: "Medium", client_name: "Vertex LLC", assigned_to: "Sarah M.", created_at: new Date(Date.now() - 3600000 * 5).toISOString() },
  { id: "TK-1003", ticket_number: "TK-1003", subject: "New user onboarding – Office 365 license setup", status: "Waiting", priority: "Low", client_name: "Apex Industries", assigned_to: "Daniel W.", created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: "TK-1004", ticket_number: "TK-1004", subject: "Ransomware alert triggered on endpoint PC-07", status: "Open", priority: "Critical", client_name: "Nexus Corp", assigned_to: "Unassigned", created_at: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: "TK-1005", ticket_number: "TK-1005", subject: "Email spoofing reports from staff", status: "In Progress", priority: "High", client_name: "Vertex LLC", assigned_to: "Sarah M.", created_at: new Date(Date.now() - 3600000 * 8).toISOString() },
  { id: "TK-1006", ticket_number: "TK-1006", subject: "MFA enrollment for all remote users", status: "Resolved", priority: "Medium", client_name: "Kool Solutions", assigned_to: "Daniel W.", created_at: new Date(Date.now() - 86400000 * 3).toISOString() },
];
const MOCK_CLIENTS: ITClient[] = [
  { id: "CL-001", name: "Nexus Corp", email: "it@nexuscorp.com", phone: "(305) 555-0101", type: "Enterprise", status: "Active", created_at: "2023-03-12" },
  { id: "CL-002", name: "Vertex LLC", email: "admin@vertexllc.net", phone: "(786) 555-0204", type: "SMB", status: "Active", created_at: "2023-06-01" },
  { id: "CL-003", name: "Apex Industries", email: "support@apexind.com", phone: "(954) 555-0318", type: "SMB", status: "Active", created_at: "2024-01-15" },
  { id: "CL-004", name: "Kool Solutions", email: "admin@kooltechsolutions.com", phone: "(305) 555-0500", type: "Internal", status: "Active", created_at: "2022-11-01" },
];
const MOCK_ASSETS: ITAsset[] = [
  { id: "A-001", name: "Dell PowerEdge R740", asset_tag: "SRV-001", type: "Server", model: "PowerEdge R740", client_name: "Nexus Corp", status: "In Use", purchase_date: "2022-01-10", warranty_expires: "2025-01-10" },
  { id: "A-002", name: "Fortinet FortiGate 60F", asset_tag: "FW-001", type: "Firewall", model: "FortiGate 60F", client_name: "Vertex LLC", status: "In Use", purchase_date: "2023-05-20", warranty_expires: "2026-05-20" },
  { id: "A-003", name: "Dell Latitude 5530", asset_tag: "LT-014", type: "Laptop", model: "Latitude 5530", client_name: "Apex Industries", status: "In Use", purchase_date: "2023-09-15", warranty_expires: "2026-09-15", assignment: "Jane Cooper" },
  { id: "A-004", name: "Synology DS923+", asset_tag: "NAS-002", type: "NAS", model: "DS923+", client_name: "Nexus Corp", status: "In Use", purchase_date: "2023-02-28", warranty_expires: "2026-02-28" },
  { id: "A-005", name: "HP ProBook 450 G9", asset_tag: "LT-023", type: "Laptop", model: "ProBook 450 G9", client_name: "Vertex LLC", status: "In Repair", purchase_date: "2022-08-01", warranty_expires: "2025-08-01", assignment: "Mike Torres" },
];
const MOCK_INVOICES: ITInvoice[] = [
  { id: "INV-2024-001", invoice_number: "INV-2024-001", client_name: "Nexus Corp", amount: 4800, status: "Paid", due_date: "2024-02-01", created_at: "2024-01-15" },
  { id: "INV-2024-002", invoice_number: "INV-2024-002", client_name: "Vertex LLC", amount: 1250, status: "Unpaid", due_date: "2024-06-15", created_at: "2024-05-30" },
  { id: "INV-2024-003", invoice_number: "INV-2024-003", client_name: "Apex Industries", amount: 2100, status: "Overdue", due_date: "2024-05-01", created_at: "2024-04-10" },
  { id: "INV-2024-004", invoice_number: "INV-2024-004", client_name: "Nexus Corp", amount: 5400, status: "Paid", due_date: "2024-05-01", created_at: "2024-04-15" },
  { id: "INV-2024-005", invoice_number: "INV-2024-005", client_name: "Vertex LLC", amount: 900, status: "Draft", due_date: "2024-07-01", created_at: "2024-06-01" },
];

/* ─── Helpers ────────────────────────────────────────────── */
const timeAgo = (d?: string) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  if (diff < 86400000 * 30) return Math.floor(diff / 86400000) + "d ago";
  return new Date(d).toLocaleDateString();
};

const priorityStyle = (p?: string): React.CSSProperties => {
  const map: Record<string, { bg: string; color: string }> = {
    Critical: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
    High:     { bg: "rgba(245,158,11,0.15)", color: "#f59e0b" },
    Medium:   { bg: "rgba(59,130,246,0.15)", color: "#60a5fa" },
    Low:      { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
  };
  const t = map[p ?? ""] ?? { bg: "rgba(148,163,184,0.12)", color: "#94a3b8" };
  return { padding: "0.2rem 0.55rem", borderRadius: "5px", fontSize: "0.7rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", background: t.bg, color: t.color };
};

const statusDot = (s?: string) => {
  const map: Record<string, string> = {
    Open: "#f59e0b", "In Progress": "#00D4FF", Waiting: "#a855f7",
    Resolved: "#10b981", Closed: "#4b5563", Paid: "#10b981",
    Unpaid: "#f59e0b", Overdue: "#ef4444", Draft: "#94a3b8",
    Active: "#10b981", "In Use": "#10b981", "In Repair": "#f59e0b",
    Retired: "#4b5563",
  };
  return map[s ?? ""] ?? "#94a3b8";
};

const statusLabel = (s?: string): React.CSSProperties => {
  const c = statusDot(s);
  return {
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    padding: "0.2rem 0.65rem", borderRadius: "999px",
    fontSize: "0.75rem", fontWeight: 700,
    background: `${c}18`, color: c,
  };
};

const fmt = (n?: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : (n ?? 0);
  return isNaN(num) ? "—" : "$" + num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

/* ─── Tab config ─────────────────────────────────────────── */
const TABS = [
  { id: "tickets",  label: "Tickets",  icon: Ticket,   endpoint: "tickets"  },
  { id: "clients",  label: "Clients",  icon: Building2, endpoint: "clients"  },
  { id: "assets",   label: "Assets",   icon: Laptop,   endpoint: "assets"   },
  { id: "invoices", label: "Invoices", icon: DollarSign, endpoint: "invoices" },
] as const;
type TabId = typeof TABS[number]["id"];

/* ─── Main Component ─────────────────────────────────────── */
export default function ITFlowDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("tickets");
  const [dataMap, setDataMap] = useState<Record<TabId, ITFlowRecord[]>>({
    tickets: [], clients: [], assets: [], invoices: [],
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [source, setSource] = useState<"live" | "mock">("mock");
  const [search, setSearch] = useState("");
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchTab = useCallback(async (tab: TabId) => {
    try {
      const res = await fetch(`/api/itflow?endpoint=${tab}`, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json() as ITFlowApiResponse | ITFlowRecord[];
      
      // ITFlow returns { success: "False", message: "No resource..." } when the table is empty
      if (!Array.isArray(json) && json.success === "False" && json.message?.includes("No resource")) {
        setDataMap(prev => ({ ...prev, [tab]: [] }));
        setSource("live");
      } else if (Array.isArray(json) || Array.isArray(json.data)) {
        const items = Array.isArray(json) ? json : json.data;
        setDataMap(prev => ({ ...prev, [tab]: items }));
        setSource("live");
      } else {
        throw new Error("Unexpected ITFlow payload format");
      }
    } catch {
      const mocks: Record<TabId, ITFlowRecord[]> = {
        tickets: MOCK_TICKETS, clients: MOCK_CLIENTS,
        assets: MOCK_ASSETS, invoices: MOCK_INVOICES,
      };
      setDataMap(prev => ({ ...prev, [tab]: mocks[tab] }));
      setSource("mock");
    }
    setLastSync(new Date());
    setLoading(false);
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all(TABS.map(t => fetchTab(t.id)));
    setLoading(false);
  }, [fetchTab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSync = async () => {
    setSyncing(true);
    try { await fetch("/api/itflow/sync", { method: "POST" }); } catch {}
    await fetchAll();
    setSyncing(false);
  };

  const currentData = dataMap[activeTab];
  const filteredData = search.trim()
    ? currentData.filter(item => JSON.stringify(item).toLowerCase().includes(search.toLowerCase()))
    : currentData;

  // KPIs
  const tickets = dataMap.tickets as ITTicket[];
  const invoices = dataMap.invoices as ITInvoice[];
  const openTickets = tickets.filter(t => t.status === "Open" || t.status === "In Progress").length;
  const criticalTickets = tickets.filter(t => t.priority === "Critical").length;
  const totalRevenue = invoices.filter(i => i.status === "Paid").reduce((s, i) => s + (parseFloat(String(i.amount)) || 0), 0);
  const outstanding = invoices.filter(i => i.status === "Unpaid" || i.status === "Overdue").reduce((s, i) => s + (parseFloat(String(i.amount)) || 0), 0);

  const kpis = [
    { label: "Open Tickets", value: openTickets, icon: Ticket, color: "#f59e0b", sub: `${criticalTickets} critical` },
    { label: "Active Clients", value: dataMap.clients.length, icon: Building2, color: "#00D4FF", sub: "managed accounts" },
    { label: "Managed Assets", value: dataMap.assets.length, icon: Laptop, color: "#a855f7", sub: "tracked devices" },
    { label: "Revenue (MTD)", value: fmt(totalRevenue), icon: DollarSign, color: "#10b981", sub: `${fmt(outstanding)} outstanding` },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1500, margin: "0 auto" }}>

      {/* ── Header ─────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.25rem" }}>
            <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white", margin: 0 }}>
              ITFlow PSA
            </h1>
            <span style={{
              padding: "0.2rem 0.65rem", borderRadius: "6px", fontSize: "0.6rem",
              fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em",
              background: source === "live" ? "rgba(16,185,129,0.15)" : "rgba(245,158,11,0.15)",
              color: source === "live" ? "#10b981" : "#f59e0b",
              border: `1px solid ${source === "live" ? "rgba(16,185,129,0.3)" : "rgba(245,158,11,0.3)"}`,
            }}>
              {source === "live" ? "● LIVE" : "○ DEMO DATA"}
            </span>
          </div>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>
            Professional Services Automation · Tickets, Clients, Assets & Billing
            {lastSync && <> · Synced {timeAgo(lastSync.toISOString())}</>}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => fetchAll()}
            style={{ padding: "0.625rem 1rem", borderRadius: "8px", background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "var(--color-accent-500)", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 600 }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            style={{ padding: "0.625rem 1.25rem", borderRadius: "8px", background: "linear-gradient(135deg, #00D4FF, #7c3aed)", border: "none", color: "white", cursor: syncing ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.8125rem", fontWeight: 700, opacity: syncing ? 0.7 : 1 }}
          >
            {syncing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {syncing ? "Syncing…" : "Sync to Supabase"}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {kpis.map((k, i) => (
          <div key={i} className="glass-card" style={{ padding: "1.5rem", borderRadius: "14px", border: `1px solid ${k.color}18`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${k.color}08` }} />
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ width: 38, height: 38, borderRadius: "10px", background: `${k.color}15`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <k.icon size={18} color={k.color} />
              </div>
              <span style={{ color: "var(--color-neutral-500)", fontSize: "0.8rem", fontWeight: 600 }}>{k.label}</span>
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "2rem", fontWeight: 800, color: "white", lineHeight: 1 }}>{k.value}</div>
            <div style={{ color: "var(--color-neutral-600)", fontSize: "0.75rem", marginTop: "0.5rem" }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tabs ────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "0" }}>
        {TABS.map(tab => {
          const count = dataMap[tab.id].length;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setSearch(""); }}
              style={{
                display: "flex", alignItems: "center", gap: "0.5rem",
                padding: "0.75rem 1.25rem",
                background: "transparent",
                color: isActive ? "var(--color-accent-500)" : "var(--color-neutral-500)",
                border: "none",
                borderBottom: isActive ? "2px solid var(--color-accent-500)" : "2px solid transparent",
                cursor: "pointer", fontWeight: 700, fontSize: "0.875rem",
                transition: "all 0.15s", marginBottom: -1,
              }}
            >
              <tab.icon size={16} />
              {tab.label}
              <span style={{
                minWidth: 20, height: 20, borderRadius: "999px",
                background: isActive ? "rgba(0,212,255,0.15)" : "rgba(255,255,255,0.06)",
                color: isActive ? "var(--color-accent-500)" : "var(--color-neutral-600)",
                fontSize: "0.6875rem", fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                padding: "0 5px",
              }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Search bar ───────────────────────────────── */}
      <div style={{ marginBottom: "1rem", position: "relative" }}>
        <Search size={14} style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-500)" }} />
        <input
          type="text"
          placeholder={`Search ${activeTab}…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: 380,
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "8px", padding: "0.6rem 1rem 0.6rem 2.5rem",
            color: "white", outline: "none", fontSize: "0.875rem",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* ── Content Table ────────────────────────────── */}
      <div className="glass-card" style={{ borderRadius: "14px", overflow: "hidden" }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, gap: "1rem", flexDirection: "column" }}>
            <Loader2 size={36} className="animate-spin" color="var(--color-accent-500)" />
            <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Connecting to ITFlow…</p>
          </div>
        ) : activeTab === "tickets" ? (
          <TicketsTable data={filteredData as ITTicket[]} />
        ) : activeTab === "clients" ? (
          <ClientsTable data={filteredData as ITClient[]} />
        ) : activeTab === "assets" ? (
          <AssetsTable data={filteredData as ITAsset[]} />
        ) : (
          <InvoicesTable data={filteredData as ITInvoice[]} />
        )}
      </div>

      {/* ── Source note ─────────────────────────────── */}
      {source === "mock" && (
        <div style={{
          marginTop: "1.25rem", padding: "0.875rem 1.25rem",
          borderRadius: "10px", background: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.2)",
          display: "flex", alignItems: "center", gap: "0.75rem",
        }}>
          <AlertCircle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
          <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", margin: 0 }}>
            <strong style={{ color: "#f59e0b" }}>Demo data displayed.</strong>{" "}
            ITFlow API key requires global scope. Go to <strong>ITFlow → Settings → API Keys</strong>, ensure the key has &quot;All Clients&quot; access, then hit Refresh.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Tickets Table ──────────────────────────────────────── */
function TicketsTable({ data }: { data: ITTicket[] }) {
  const th: React.CSSProperties = {
    padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)",
    fontSize: "0.6875rem", textAlign: "left", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
            {["#", "Subject", "Client", "Priority", "Status", "Assigned", "Opened"].map(h => <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>No tickets found.</td></tr>
          ) : data.map((t, i) => (
            <tr key={t.id ?? i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.15s", cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.025)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", fontFamily: "monospace", whiteSpace: "nowrap" }}>
                {t.ticket_number ?? String(t.id)}
              </td>
              <td style={{ padding: "1rem 1.25rem", maxWidth: 320 }}>
                <div style={{ color: "white", fontWeight: 600, fontSize: "0.875rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.subject ?? t.name ?? "—"}
                </div>
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                {t.client_name ?? "—"}
              </td>
              <td style={{ padding: "1rem 1.25rem" }}>
                <span style={priorityStyle(t.priority)}>{t.priority ?? "—"}</span>
              </td>
              <td style={{ padding: "1rem 1.25rem" }}>
                <span style={statusLabel(t.status)}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot(t.status), flexShrink: 0 }} />
                  {t.status ?? "—"}
                </span>
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>
                {t.assigned_to ?? "—"}
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-600)", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
                {timeAgo(t.created_at)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Clients Table ──────────────────────────────────────── */
function ClientsTable({ data }: { data: ITClient[] }) {
  const th: React.CSSProperties = {
    padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)",
    fontSize: "0.6875rem", textAlign: "left", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
            {["Company", "Email", "Phone", "Type", "Status", "Since"].map(h => <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>No clients found.</td></tr>
          ) : data.map((c, i) => (
            <tr key={c.id ?? i}
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,212,255,0.025)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <td style={{ padding: "1rem 1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "8px",
                    background: "rgba(0,212,255,0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "0.875rem", fontWeight: 800, color: "var(--color-accent-500)",
                    flexShrink: 0,
                  }}>
                    {(c.name ?? c.client_name ?? "?")[0].toUpperCase()}
                  </div>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{c.name ?? c.client_name ?? "—"}</span>
                </div>
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{c.email ?? "—"}</td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem", whiteSpace: "nowrap" }}>{c.phone ?? "—"}</td>
              <td style={{ padding: "1rem 1.25rem" }}>
                <span style={{ padding: "0.2rem 0.6rem", borderRadius: "5px", fontSize: "0.7rem", fontWeight: 700, background: "rgba(168,85,247,0.12)", color: "#a855f7" }}>
                  {c.type ?? "Client"}
                </span>
              </td>
              <td style={{ padding: "1rem 1.25rem" }}>
                <span style={statusLabel(c.status ?? "Active")}>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot(c.status ?? "Active"), flexShrink: 0 }} />
                  {c.status ?? "Active"}
                </span>
              </td>
              <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-600)", fontSize: "0.75rem" }}>
                {c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Assets Table ───────────────────────────────────────── */
function AssetsTable({ data }: { data: ITAsset[] }) {
  const assetIcon = (type?: string) => {
    if (!type) return <Server size={14} />;
    const t = type.toLowerCase();
    if (t.includes("laptop") || t.includes("desktop")) return <Laptop size={14} />;
    if (t.includes("server")) return <Server size={14} />;
    return <Wrench size={14} />;
  };
  const th: React.CSSProperties = {
    padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)",
    fontSize: "0.6875rem", textAlign: "left", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
  };
  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
            {["Asset", "Tag", "Type", "Client", "Assignment", "Status", "Warranty"].map(h => <th key={h} style={th}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr><td colSpan={7} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>No assets found.</td></tr>
          ) : data.map((a, i) => {
            const { warrantyExpired, warrantyColor } = getWarrantyState(a.warranty_expires);
            return (
              <tr key={a.id ?? i}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(168,85,247,0.025)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "8px", background: "rgba(168,85,247,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7", flexShrink: 0 }}>
                      {assetIcon(a.type)}
                    </div>
                    <div>
                      <div style={{ color: "white", fontWeight: 700, fontSize: "0.875rem" }}>{a.name ?? a.model ?? "—"}</div>
                      {a.model && a.name !== a.model && <div style={{ color: "var(--color-neutral-600)", fontSize: "0.7rem" }}>{a.model}</div>}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-500)", fontSize: "0.75rem", fontFamily: "monospace" }}>{a.asset_tag ?? "—"}</td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{a.type ?? "—"}</td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{a.client_name ?? "—"}</td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-400)", fontSize: "0.8125rem" }}>{a.assignment ?? "—"}</td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={statusLabel(a.status ?? "In Use")}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot(a.status ?? "In Use"), flexShrink: 0 }} />
                    {a.status ?? "In Use"}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem", color: warrantyColor, fontSize: "0.8125rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                  {a.warranty_expires ? (warrantyExpired ? "⚠ Expired" : new Date(a.warranty_expires).toLocaleDateString()) : "—"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Invoices Table ─────────────────────────────────────── */
function InvoicesTable({ data }: { data: ITInvoice[] }) {
  const th: React.CSSProperties = {
    padding: "0.75rem 1.25rem", color: "var(--color-neutral-500)",
    fontSize: "0.6875rem", textAlign: "left", fontWeight: 700,
    textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap",
  };
  const totalPaid = data.filter(i => i.status === "Paid").reduce((s, i) => s + (parseFloat(String(i.amount)) || 0), 0);
  const totalUnpaid = data.filter(i => i.status !== "Paid" && i.status !== "Draft").reduce((s, i) => s + (parseFloat(String(i.amount)) || 0), 0);

  return (
    <>
      {/* Mini summary */}
      <div style={{ display: "flex", gap: "1rem", padding: "1rem 1.25rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        {[
          { label: "Collected", value: fmt(totalPaid), color: "#10b981" },
          { label: "Outstanding", value: fmt(totalUnpaid), color: "#f59e0b" },
          { label: "Invoices", value: data.length, color: "#00D4FF" },
        ].map((s, i) => (
          <div key={i} style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span style={{ color: "var(--color-neutral-600)", fontSize: "0.8rem" }}>{s.label}:</span>
            <span style={{ color: s.color, fontWeight: 800, fontSize: "0.9rem" }}>{s.value}</span>
          </div>
        ))}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(0,212,255,0.03)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}>
              {["Invoice #", "Client", "Amount", "Status", "Due Date", "Created"].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} style={{ padding: "4rem", textAlign: "center", color: "var(--color-neutral-500)" }}>No invoices found.</td></tr>
            ) : data.map((inv, i) => (
              <tr key={inv.id ?? i}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.background = "rgba(16,185,129,0.02)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <td style={{ padding: "1rem 1.25rem", color: "white", fontWeight: 700, fontSize: "0.875rem", fontFamily: "monospace" }}>
                  {inv.invoice_number ?? String(inv.id)}
                </td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-300)", fontSize: "0.875rem" }}>{inv.client_name ?? "—"}</td>
                <td style={{ padding: "1rem 1.25rem", color: "white", fontWeight: 700, fontSize: "0.9rem" }}>{fmt(inv.amount)}</td>
                <td style={{ padding: "1rem 1.25rem" }}>
                  <span style={statusLabel(inv.status)}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusDot(inv.status), flexShrink: 0 }} />
                    {inv.status ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "1rem 1.25rem", color: inv.status === "Overdue" ? "#ef4444" : "var(--color-neutral-400)", fontSize: "0.8125rem", fontWeight: inv.status === "Overdue" ? 700 : 400, whiteSpace: "nowrap" }}>
                  {inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "—"}
                </td>
                <td style={{ padding: "1rem 1.25rem", color: "var(--color-neutral-600)", fontSize: "0.75rem" }}>
                  {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
