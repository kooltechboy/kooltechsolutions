"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, Send, Bot, ChevronDown, Volume2 } from "lucide-react";

const AGENTS = {
  home: { name: "Kira", role: "Customer Service", color: "#00D4FF", emoji: "👋" },
  services: { name: "Max", role: "Sales Specialist", color: "#00E676", emoji: "💼" },
  contact: { name: "Aria", role: "Appointment Setter", color: "#FFB300", emoji: "📅" },
  default: { name: "Kira", role: "AI Assistant", color: "#00D4FF", emoji: "🤖" },
};

import { useChat } from 'ai/react';

export default function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionId] = useState(() => typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(7));
  const agent = AGENTS.home;
  
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { sessionId, agentName: agent.name },
    initialMessages: [
      { id: 'initial', role: 'assistant', content: "Hi! I'm Kira, your AI assistant at Kool Tech Solutions. How can I help you today? I can tell you about our IT services, pricing, or connect you with a specialist. 😊" }
    ]
  });

  const [isListening, setIsListening] = useState(false);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported in this browser.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({ target: { value: input ? input + " " + transcript : transcript } } as any);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    
    recognition.start();
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
          width: 60, height: 60, borderRadius: "50%",
          background: "linear-gradient(135deg, #00D4FF, #1E4D8C)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 0 30px rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.3)",
          animation: "pulse-ring 2s ease infinite",
        }}
        aria-label="Open AI Chat"
      >
        <MessageCircle size={26} color="white" />
        <style>{`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4), 0 4px 20px rgba(0,0,0,0.3); }
            70% { box-shadow: 0 0 0 16px rgba(0,212,255,0), 0 4px 20px rgba(0,0,0,0.3); }
            100% { box-shadow: 0 0 0 0 rgba(0,212,255,0), 0 4px 20px rgba(0,0,0,0.3); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      width: 380, borderRadius: "20px", overflow: "hidden",
      boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(0,212,255,0.1)",
      border: "1px solid rgba(0,212,255,0.2)",
      display: "flex", flexDirection: "column",
      maxHeight: minimized ? "72px" : "520px",
      transition: "max-height 0.3s ease",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, var(--color-primary-800), var(--color-primary-900))",
        padding: "1rem 1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(0,212,255,0.15)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: `radial-gradient(circle, ${agent.color}30, ${agent.color}10)`,
            border: `2px solid ${agent.color}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem",
          }}>
            {agent.emoji}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "0.9rem" }}>{agent.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              <span className="status-dot status-online" style={{ width: 6, height: 6 }} />
              <span style={{ color: "var(--color-neutral-400)", fontSize: "0.7rem" }}>{agent.role} · Online</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setMinimized(!minimized)} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", padding: "0.25rem" }}>
            <ChevronDown size={18} style={{ transform: minimized ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }} />
          </button>
          <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "var(--color-neutral-400)", cursor: "pointer", padding: "0.25rem" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div style={{
            flex: 1, overflowY: "auto", padding: "1rem",
            background: "var(--color-primary-950)",
            display: "flex", flexDirection: "column", gap: "0.75rem",
          }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end", gap: "0.5rem",
              }}>
                {msg.role !== "user" && (
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={14} color="var(--color-accent-500)" />
                  </div>
                )}
                <div style={{
                  maxWidth: "80%", padding: "0.625rem 0.875rem", borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #00D4FF, #0099CC)" : "rgba(15,32,68,0.8)",
                  border: msg.role !== "user" ? "1px solid rgba(0,212,255,0.15)" : "none",
                  color: msg.role === "user" ? "#0A1628" : "var(--color-neutral-50)",
                  fontSize: "0.8125rem", lineHeight: 1.5, fontWeight: msg.role === "user" ? 500 : 400,
                  whiteSpace: "pre-wrap"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,212,255,0.15)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={14} color="var(--color-accent-500)" />
                </div>
                <div style={{ padding: "0.625rem 1rem", borderRadius: "16px 16px 16px 4px", background: "rgba(15,32,68,0.8)", border: "1px solid rgba(0,212,255,0.15)", display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-accent-500)", animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                  ))}
                  <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)}40%{transform:translateY(-6px)} }`}</style>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} style={{
            padding: "0.875rem", background: "var(--color-primary-900)",
            borderTop: "1px solid rgba(0,212,255,0.1)",
            display: "flex", gap: "0.5rem", alignItems: "center",
          }}>
            <button type="button" onClick={startVoice} style={{ background: isListening ? "rgba(255,0,0,0.1)" : "none", border: "none", color: isListening ? "#ff4444" : "var(--color-neutral-400)", cursor: "pointer", padding: "0.25rem", borderRadius: "50%" }} title="Voice mode">
              <Mic size={18} />
            </button>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask anything..."
              style={{
                flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(0,212,255,0.15)",
                borderRadius: "20px", padding: "0.5rem 1rem", color: "white", fontSize: "0.8125rem",
                outline: "none", fontFamily: "DM Sans, sans-serif",
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, #00D4FF, #0099CC)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                opacity: (!input.trim() || isLoading) ? 0.5 : 1
              }}
            >
              <Send size={15} color="#0A1628" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
