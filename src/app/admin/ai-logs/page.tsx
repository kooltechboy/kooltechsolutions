"use client";

import React, { useState } from 'react';
import { Search, Bot, User, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const MOCK_SESSIONS = [
  { id: 'sess_9f8a', date: 'Today, 2:45 PM', status: 'resolved', messageCount: 8, summary: 'Inquired about Gold Managed IT pricing.' },
  { id: 'sess_2b4c', date: 'Today, 11:20 AM', status: 'escalated', messageCount: 4, summary: 'Requested help with a downed firewall.' },
  { id: 'sess_7c11', date: 'Yesterday, 4:15 PM', status: 'resolved', messageCount: 6, summary: 'Asked about cybersecurity compliance for healthcare.' },
  { id: 'sess_1a99', date: 'Yesterday, 9:00 AM', status: 'abandoned', messageCount: 2, summary: 'Dropped off after greeting.' },
];

const MOCK_CONVERSATION = [
  { role: 'agent', content: 'Hi! I\'m Kira, your AI assistant at Kool Tech Solutions. How can I help you today?', time: '2:45 PM' },
  { role: 'user', content: 'We are a small medical clinic looking for IT support. Do you handle compliance?', time: '2:46 PM' },
  { role: 'agent', content: 'Yes, we specialize in healthcare IT and full HIPAA compliance. Our cybersecurity stack includes 24/7 monitoring, secure data backups, and endpoint protection. Would you like to see our pricing tiers?', time: '2:46 PM' },
  { role: 'user', content: 'Yes, what does the Gold plan include?', time: '2:48 PM' },
  { role: 'agent', content: 'Our Gold Plan ($999/mo) is our most comprehensive tier. It includes 24/7 Helpdesk, Advanced Wazuh Threat Monitoring, automated patching, quarterly vCIO strategy meetings, and full compliance auditing. Should I have a specialist call you to discuss your specific clinic\'s needs?', time: '2:48 PM' },
];

export default function AILogsPage() {
  const [activeSession, setActiveSession] = useState(MOCK_SESSIONS[0]);

  return (
    <div style={{ display: "flex", height: "calc(100vh - 64px)", background: "#f8fafc" }}>
      
      {/* Left Sidebar: Sessions List */}
      <div style={{ width: "380px", background: "rgba(10,22,40,0.8)", borderRight: "1px solid var(--color-neutral-200)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "white", fontFamily: "Syne, sans-serif" }}>AI Agent Logs</h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem", marginTop: "0.25rem", marginBottom: "1.25rem" }}>Monitor Kira&apos;s conversations with leads.</p>
          
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "var(--color-neutral-400)" }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              style={{ width: "100%", padding: "0.5rem 1rem 0.5rem 2.5rem", borderRadius: "8px", border: "1px solid var(--color-neutral-300)", outline: "none", fontSize: "0.875rem" }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {MOCK_SESSIONS.map(session => (
            <div 
              key={session.id}
              onClick={() => setActiveSession(session)}
              style={{ 
                padding: "1.25rem", 
                borderBottom: "1px solid rgba(0,212,255,0.05)", 
                cursor: "pointer",
                background: activeSession.id === session.id ? "rgba(0,212,255,0.05)" : "transparent",
                borderLeft: activeSession.id === session.id ? "3px solid var(--color-accent-500)" : "3px solid transparent",
                transition: "background 0.2s"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "white" }}>Session {session.id}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--color-neutral-400)", display: "flex", alignItems: "center", gap: "0.25rem" }}><Clock size={12}/> {session.date}</span>
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--color-neutral-400)", lineHeight: 1.4, marginBottom: "0.75rem" }}>
                {session.summary}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "var(--color-neutral-500)", background: "rgba(0,212,255,0.1)", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                  {session.messageCount} messages
                </span>
                {session.status === 'resolved' && <span style={{ color: "#10b981", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600 }}><CheckCircle2 size={12} /> Resolved</span>}
                {session.status === 'escalated' && <span style={{ color: "#ef4444", display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600 }}><AlertCircle size={12} /> Escalated</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Content: Conversation Viewer */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "1.5rem", borderBottom: "1px solid rgba(0,212,255,0.1)", background: "rgba(10,22,40,0.8)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "white" }}>Transcript: {activeSession.id}</h2>
            <div style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>Recorded {activeSession.date}</div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button style={{ padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--color-neutral-300)", background: "rgba(10,22,40,0.8)", color: "white", fontSize: "0.875rem", fontWeight: 600, cursor: "pointer" }}>Export Log</button>
            <button className="btn-primary" style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}>Takeover Chat</button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "2rem", background: "#f8fafc", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {MOCK_CONVERSATION.map((msg, i) => (
            <div key={i} style={{ display: "flex", gap: "1rem", flexDirection: msg.role === 'user' ? "row-reverse" : "row" }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: msg.role === 'user' ? "var(--color-neutral-200)" : "rgba(0,212,255,0.1)", border: msg.role === 'agent' ? "1px solid rgba(0,212,255,0.3)" : "none", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {msg.role === 'user' ? <User size={18} color="var(--color-neutral-600)" /> : <Bot size={18} color="var(--color-accent-600)" />}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: msg.role === 'user' ? "flex-end" : "flex-start" }}>
                <div style={{ fontSize: "0.75rem", color: "var(--color-neutral-500)", marginBottom: "0.25rem", fontWeight: 600 }}>
                  {msg.role === 'user' ? 'Website Visitor' : 'Kira (AI Agent)'} <span style={{ fontWeight: 400, marginLeft: "0.5rem" }}>{msg.time}</span>
                </div>
                <div style={{ 
                  maxWidth: "600px", 
                  padding: "1rem", 
                  borderRadius: msg.role === 'user' ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                  background: msg.role === 'user' ? "linear-gradient(135deg, #00D4FF, #0099CC)" : "white",
                  color: msg.role === 'user' ? "#0A1628" : "var(--color-primary-900)",
                  border: msg.role === 'user' ? "none" : "1px solid var(--color-neutral-200)",
                  fontSize: "0.9rem",
                  lineHeight: 1.6,
                  boxShadow: msg.role === 'agent' ? "0 2px 8px rgba(0,0,0,0.02)" : "none"
                }}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
