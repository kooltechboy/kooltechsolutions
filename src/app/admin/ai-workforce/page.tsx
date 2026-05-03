import type { Metadata } from "next";
import { Bot, MessageCircle, TrendingUp, Users, CheckCircle, BarChart3 } from "lucide-react";

export const metadata: Metadata = { title: "Admin — AI Workforce" };

const agents = [
  { name: "Kira", role: "Customer Service", emoji: "👋", color: "#00D4FF", chats: 847, resolved: 791, leads: 23, satisfaction: 4.8 },
  { name: "Max", role: "Sales & Qualification", emoji: "💼", color: "#00E676", chats: 312, resolved: 285, leads: 67, satisfaction: 4.9 },
  { name: "Nova", role: "Technical Support", emoji: "🔧", color: "#4B84C8", chats: 524, resolved: 498, leads: 5, satisfaction: 4.7 },
  { name: "Dexter", role: "Help Desk", emoji: "🖥️", color: "#A855F7", chats: 933, resolved: 901, leads: 2, satisfaction: 4.6 },
  { name: "Aria", role: "Appointment Setter", emoji: "📅", color: "#FFB300", chats: 187, resolved: 175, leads: 41, satisfaction: 4.9 },
  { name: "Cipher", role: "Cybersecurity", emoji: "🔐", color: "#FF4444", chats: 142, resolved: 138, leads: 8, satisfaction: 4.8 },
];

const recentConversations = [
  { agent: "Kira", visitor: "Anonymous Visitor", summary: "Inquired about cybersecurity services, expressed interest in Gold plan", sentiment: "positive", time: "3 min ago", captured: true },
  { agent: "Max", visitor: "Carlos R. — TechStart", summary: "Qualified lead — 40 employees, budget $3K/mo, timeline 30 days", sentiment: "positive", time: "12 min ago", captured: true },
  { agent: "Nova", visitor: "John S. — Acme Corp", summary: "VPN troubleshooting — ticket created TKT-1041", sentiment: "neutral", time: "28 min ago", captured: false },
  { agent: "Dexter", visitor: "Maria G. — FinGroup", summary: "Password reset request completed successfully", sentiment: "positive", time: "45 min ago", captured: false },
];

const sentimentColor = { positive: "#00E676", neutral: "#FFB300", negative: "#FF4444" };

export default function AIWorkforcePage() {
  const totalChats = agents.reduce((s, a) => s + a.chats, 0);
  const totalLeads = agents.reduce((s, a) => s + a.leads, 0);
  const avgSatisfaction = (agents.reduce((s, a) => s + a.satisfaction, 0) / agents.length).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          AI <span className="gradient-text">Workforce</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Monitor and configure your 6 AI agents.</p>
      </div>

      {/* Summary KPIs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[
          { icon: MessageCircle, label: "Total Conversations", value: totalChats.toLocaleString(), color: "#00D4FF" },
          { icon: Users, label: "Leads Captured", value: totalLeads.toString(), color: "#00E676" },
          { icon: CheckCircle, label: "Avg Satisfaction", value: `${avgSatisfaction}/5`, color: "#FFB300" },
          { icon: TrendingUp, label: "Conversion Rate", value: "18.4%", color: "#A855F7" },
        ].map(kpi => (
          <div key={kpi.label} className="kpi-card">
            <div style={{ width: 38, height: 38, borderRadius: "10px", background: `${kpi.color}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "0.75rem" }}>
              <kpi.icon size={18} color={kpi.color} />
            </div>
            <div style={{ fontFamily: "Syne, sans-serif", fontSize: "1.625rem", fontWeight: 800, color: "white" }}>{kpi.value}</div>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem" }}>{kpi.label}</div>
          </div>
        ))}
      </div>

      {/* Agent Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {agents.map(agent => (
          <div key={agent.name} className="glass-card" style={{ borderRadius: "14px", padding: "1.25rem", borderLeft: `3px solid ${agent.color}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.875rem", marginBottom: "1rem" }}>
              <div style={{ width: 44, height: 44, borderRadius: "50%", background: `${agent.color}15`, border: `2px solid ${agent.color}35`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem" }}>
                {agent.emoji}
              </div>
              <div>
                <div style={{ color: "white", fontWeight: 700 }}>{agent.name}</div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>{agent.role}</div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <span className="status-dot status-online" style={{ width: 7, height: 7 }} />
                <span style={{ color: "var(--color-success)", fontSize: "0.7rem" }}>Online</span>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.625rem" }}>
              {[
                { label: "Chats", val: agent.chats.toLocaleString() },
                { label: "Leads", val: agent.leads },
                { label: "Rating", val: `${agent.satisfaction}★` },
              ].map(stat => (
                <div key={stat.label} style={{ textAlign: "center", padding: "0.5rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                  <div style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: agent.color, fontSize: "1rem" }}>{stat.val}</div>
                  <div style={{ color: "var(--color-neutral-500)", fontSize: "0.68rem" }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Resolution bar */}
            <div style={{ marginTop: "0.875rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.3rem" }}>
                <span style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>Resolution Rate</span>
                <span style={{ color: agent.color, fontSize: "0.72rem", fontWeight: 600 }}>
                  {Math.round((agent.resolved / agent.chats) * 100)}%
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(agent.resolved / agent.chats) * 100}%`, background: agent.color, borderRadius: "3px" }} />
              </div>
            </div>

            <button style={{
              width: "100%", marginTop: "1rem", padding: "0.5rem",
              background: `${agent.color}12`, border: `1px solid ${agent.color}25`,
              borderRadius: "8px", color: agent.color, fontSize: "0.8rem",
              cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 600,
            }}>
              Configure Agent
            </button>
          </div>
        ))}
      </div>

      {/* Recent Conversations */}
      <div className="kpi-card">
        <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 700, color: "white", fontSize: "1rem", marginBottom: "1.25rem" }}>Recent Conversations</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {recentConversations.map((conv, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "1rem", padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid rgba(75,132,200,0.08)" }}>
              <div style={{ flexShrink: 0 }}>
                <Bot size={18} color="var(--color-accent-500)" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.3rem" }}>
                  <span style={{ color: "white", fontWeight: 600, fontSize: "0.875rem" }}>{conv.agent}</span>
                  <span style={{ color: "var(--color-neutral-500)", fontSize: "0.78rem" }}>→ {conv.visitor}</span>
                  {conv.captured && <span className="badge badge-success" style={{ fontSize: "0.62rem", padding: "0.1rem 0.4rem" }}>Lead Captured</span>}
                </div>
                <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.5 }}>{conv.summary}</p>
              </div>
              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: sentimentColor[conv.sentiment as keyof typeof sentimentColor], margin: "0 auto 0.35rem" }} />
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.72rem" }}>{conv.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
