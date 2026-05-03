"use client";
import { Bot, MessageCircle } from "lucide-react";

const agents = [
  { name: "Kira", role: "Customer Service", emoji: "👋", color: "#00D4FF", desc: "Welcomes visitors, answers FAQs, routes inquiries to the right team." },
  { name: "Max", role: "Sales Specialist", emoji: "💼", color: "#00E676", desc: "Qualifies leads, presents service tiers, and schedules demos." },
  { name: "Nova", role: "Technical Support", emoji: "🔧", color: "#4B84C8", desc: "Troubleshoots issues, creates tickets, and provides resolutions." },
  { name: "Dexter", role: "Help Desk", emoji: "🖥️", color: "#A855F7", desc: "Handles password resets, basic IT support, and knowledge base lookups." },
  { name: "Aria", role: "Appointment Setter", emoji: "📅", color: "#FFB300", desc: "Schedules demos, onboarding calls, and manages your calendar." },
  { name: "Cipher", role: "Cybersecurity", emoji: "🔐", color: "#FF4444", desc: "Security assessments, awareness education, and incident response." },
];

export default function AIWorkforceSection() {
  return (
    <section className="section" id="ai">
      <div className="container">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div className="badge badge-cyan" style={{ marginBottom: "1rem" }}>
            <Bot size={12} /> AI Workforce
          </div>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "white", marginBottom: "1rem" }}>
            Meet Your <span className="gradient-text">AI Team</span>
          </h2>
          <p style={{ color: "var(--color-neutral-400)", maxWidth: "580px", margin: "0 auto", lineHeight: 1.7 }}>
            Six specialized AI agents available 24/7 via voice or text — each with a unique persona, deep expertise, and seamless handoff capabilities.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.25rem" }}>
          {agents.map(agent => (
            <div key={agent.name} className="glass-card" style={{ borderRadius: "16px", padding: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: `radial-gradient(circle, ${agent.color}20, ${agent.color}08)`,
                  border: `2px solid ${agent.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.5rem",
                }}>
                  {agent.emoji}
                </div>
                <div>
                  <div style={{ color: "white", fontWeight: 700, fontFamily: "Syne, sans-serif" }}>{agent.name}</div>
                  <div className="badge" style={{
                    background: `${agent.color}15`, color: agent.color,
                    border: `1px solid ${agent.color}30`, fontSize: "0.65rem", padding: "0.15rem 0.5rem",
                  }}>
                    {agent.role}
                  </div>
                </div>
              </div>
              <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.6 }}>{agent.desc}</p>
              <div style={{
                display: "flex", alignItems: "center", gap: "0.35rem", marginTop: "1rem",
                color: "var(--color-neutral-500)", fontSize: "0.75rem",
              }}>
                <span className="status-dot status-online" style={{ width: 6, height: 6 }} />
                Online · Voice & Text
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: "center", marginTop: "3rem" }}>
          <button className="btn-primary" onClick={() => {
            const w = document.querySelector("[aria-label='Open AI Chat']") as HTMLButtonElement;
            w?.click();
          }}>
            <MessageCircle size={18} /> Chat with Kira Now
          </button>
        </div>
      </div>
    </section>
  );
}
