"use client";
import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, Zap } from "lucide-react";

const suggestions = [
  "How do I submit a support ticket?",
  "What's included in the Managed IT Pro plan?",
  "How do I reset my VPN password?",
  "What is your average response time for critical issues?",
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "assistant", content: "Hi! I'm **Kira**, your AI IT assistant from Kool Tech Solutions. I'm here to help with technical questions, service inquiries, and general IT support. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text?: string) {
    const msgText = text || input.trim();
    if (!msgText) return;
    setInput("");
    const newMessages = [...messages, { role: "user", content: msgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content })), agentName: "Kira" }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let reply = "";
      setMessages(prev => [...prev, { role: "assistant", content: "" }]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          // Parse streaming data text chunks
          const lines = chunk.split("\n").filter(l => l.startsWith("0:"));
          for (const line of lines) {
            try {
              const txt = JSON.parse(line.slice(2));
              reply += txt;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: reply };
                return updated;
              });
            } catch {}
          }
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I ran into an issue. Please try again or submit a support ticket." }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)", maxWidth: "860px", margin: "0 auto" }}>
      <div style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ fontFamily: "Syne, sans-serif", fontWeight: 800, fontSize: "1.75rem", color: "white" }}>
          AI <span className="gradient-text">Assistant</span>
        </h1>
        <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
          Powered by Kira — your 24/7 intelligent IT support agent.
        </p>
      </div>

      {/* Messages */}
      <div className="glass-card" style={{ flex: 1, overflowY: "auto", padding: "1.5rem", borderRadius: "16px 16px 0 0", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start", flexDirection: msg.role === "user" ? "row-reverse" : "row" }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
              background: msg.role === "user" ? "rgba(0,212,255,0.15)" : "linear-gradient(135deg, #00D4FF20, #A855F720)",
              border: `1px solid ${msg.role === "user" ? "rgba(0,212,255,0.3)" : "rgba(168,85,247,0.3)"}`,
            }}>
              {msg.role === "user" ? <User size={16} color="var(--color-accent-500)" /> : <Bot size={16} color="#A855F7" />}
            </div>
            <div style={{
              maxWidth: "75%", padding: "0.875rem 1.125rem", borderRadius: msg.role === "user" ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
              background: msg.role === "user" ? "rgba(0,212,255,0.1)" : "rgba(255,255,255,0.04)",
              border: `1px solid ${msg.role === "user" ? "rgba(0,212,255,0.2)" : "rgba(255,255,255,0.06)"}`,
              color: "var(--color-neutral-200, #E2E8F0)", fontSize: "0.875rem", lineHeight: 1.6,
            }}>
              {msg.content || <Loader2 size={16} className="animate-spin" color="var(--color-neutral-400)" />}
            </div>
          </div>
        ))}
        {loading && messages[messages.length - 1]?.content === "" && (
          <div style={{ display: "flex", gap: "0.875rem", alignItems: "flex-start" }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #00D4FF20, #A855F720)", border: "1px solid rgba(168,85,247,0.3)", flexShrink: 0 }}>
              <Bot size={16} color="#A855F7" />
            </div>
            <div style={{ padding: "1rem", borderRadius: "4px 16px 16px 16px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: "0.4rem", alignItems: "center" }}>
              {[0, 1, 2].map(d => <div key={d} style={{ width: 6, height: 6, borderRadius: "50%", background: "#A855F7", opacity: 0.7, animation: `pulse-dot 1.2s ease-in-out ${d * 0.2}s infinite` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div style={{ padding: "0.75rem 1rem", background: "rgba(10,22,40,0.6)", borderLeft: "1px solid rgba(0,212,255,0.08)", borderRight: "1px solid rgba(0,212,255,0.08)", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => handleSend(s)} style={{
              padding: "0.375rem 0.875rem", borderRadius: "100px", border: "1px solid rgba(168,85,247,0.3)",
              background: "rgba(168,85,247,0.06)", color: "var(--color-neutral-400)", fontSize: "0.78rem", cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            }}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div style={{ display: "flex", gap: "0.75rem", padding: "1rem 1.25rem", background: "rgba(10,22,40,0.8)", border: "1px solid rgba(0,212,255,0.08)", borderRadius: "0 0 16px 16px", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--color-neutral-500)", fontSize: "0.75rem" }}>
          <Zap size={13} color="#A855F7" /> Kira
        </div>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask Kira anything about IT, your services, or request support..."
          disabled={loading}
          style={{
            flex: 1, background: "transparent", border: "none", color: "white", fontSize: "0.9375rem", outline: "none",
          }}
        />
        <button onClick={() => handleSend()} disabled={loading || !input.trim()} style={{
          width: 38, height: 38, borderRadius: "10px", background: input.trim() ? "linear-gradient(135deg, #A855F7, #00D4FF)" : "rgba(75,132,200,0.1)",
          border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: input.trim() ? "pointer" : "not-allowed", flexShrink: 0, transition: "background 0.2s",
        }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
