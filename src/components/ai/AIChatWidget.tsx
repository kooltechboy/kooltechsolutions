"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, Send, Bot, ChevronDown, Sparkles } from "lucide-react";
import { useChat } from 'ai/react';
import { usePathname } from 'next/navigation';

const AGENTS = {
  home: { name: "Kira", role: "Executive Assistant", color: "#00D4FF", emoji: "👋", greeting: "Hi! I'm Kira. Welcome to Kool Tech Solutions. Are you looking to optimize your IT infrastructure or perhaps explore a specific solution for your business? I'm here to guide you! 😊" },
  services: { name: "Max", role: "Senior Solutions Engineer", color: "#00E676", emoji: "🛡️", greeting: "Hello, I'm Max. I specialize in enterprise-grade security, cloud orchestration, and network resilience. Which area of your technology stack are we focusing on today?" },
  blog: { name: "Kira", role: "Knowledge Lead", color: "#00D4FF", emoji: "📚", greeting: "Hi there! I'm Kira. Diving into our latest technical insights? If you have questions about our research—or want to see how these innovations can scale your business—just let me know!" },
  contact: { name: "Aria", role: "Strategic Coordinator", color: "#FFB300", emoji: "📅", greeting: "Hi! I'm Aria. Ready to elevate your IT strategy? I can help you secure a consultation with our engineering team for any of our solutions. What's the best email for follow-up?" },
  default: { name: "Kira", role: "AI Workforce", color: "#00D4FF", emoji: "🤖", greeting: "Hello! How can the Kool Tech AI team assist your business today?" },
};

export default function AIChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasProactivelyOpened, setHasProactivelyOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Persistence Logic: Load or Create Session ID
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const savedSessionId = localStorage.getItem("kts_ai_session_id");
    if (savedSessionId) {
      setSessionId(savedSessionId);
    } else {
      const newId = crypto.randomUUID();
      localStorage.setItem("kts_ai_session_id", newId);
      setSessionId(newId);
    }
  }, []);

  // Determine agent based on path
  const getAgent = () => {
    if (pathname === "/") return AGENTS.home;
    if (pathname.startsWith("/services")) return AGENTS.services;
    if (pathname.startsWith("/blog")) return AGENTS.blog;
    if (pathname.startsWith("/contact")) return AGENTS.contact;
    return AGENTS.default;
  };

  const agent = getAgent();

  // Telemetry Capture
  const getTelemetry = () => {
    if (typeof window === 'undefined') return {};
    return {
      ua: navigator.userAgent,
      screen: `${window.screen.width}x${window.screen.height}`,
      lang: navigator.language,
      referrer: document.referrer,
    };
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, setMessages } = useChat({
    api: '/api/chat',
    body: { 
      sessionId, 
      agentName: agent.name, 
      pageContext: pathname,
      telemetry: getTelemetry()
    },
    initialMessages: [
      { id: 'initial', role: 'assistant', content: agent.greeting }
    ],
    maxSteps: 5,
  });

  // Persist messages to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(`kts_messages_${sessionId}`, JSON.stringify(messages));
    }
  }, [messages, sessionId]);

  // Load messages from localStorage
  useEffect(() => {
    if (sessionId) {
      const saved = localStorage.getItem(`kts_messages_${sessionId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length > 0) {
            setMessages(parsed);
          }
        } catch (e) {
          console.error("Failed to load messages", e);
        }
      }
    }
  }, [sessionId, setMessages]);

  const [isListening, setIsListening] = useState(false);

  // Proactive Engagement Logic
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!open && !hasProactivelyOpened && messages.length <= 1) {
        setOpen(true);
        setHasProactivelyOpened(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [open, hasProactivelyOpened, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Voice recognition is not supported.");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      handleInputChange({ target: { value: input ? input + " " + transcript : transcript } } as any);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

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
          boxShadow: "0 0 30px rgba(0,212,255,0.4)",
          animation: "pulse-ring 2s ease infinite",
        }}
      >
        <div style={{ position: "absolute", top: -10, right: -5, background: "var(--color-accent-500)", color: "var(--color-primary-950)", fontSize: "0.65rem", fontWeight: 800, padding: "2px 6px", borderRadius: "10px", boxShadow: "0 4px 10px rgba(0,0,0,0.3)" }}>AI LIVE</div>
        <MessageCircle size={26} color="white" />
        <style>{`
          @keyframes pulse-ring {
            0% { box-shadow: 0 0 0 0 rgba(0,212,255,0.4); }
            70% { box-shadow: 0 0 0 15px rgba(0,212,255,0); }
            100% { box-shadow: 0 0 0 0 rgba(0,212,255,0); }
          }
        `}</style>
      </button>
    );
  }

  return (
    <div style={{
      position: "fixed", bottom: "2rem", right: "2rem", zIndex: 9999,
      width: 400, borderRadius: "24px", overflow: "hidden",
      boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
      border: "1px solid rgba(255,255,255,0.1)",
      display: "flex", flexDirection: "column",
      maxHeight: minimized ? "72px" : "580px",
      transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      background: "rgba(6, 11, 24, 0.95)",
      backdropFilter: "blur(20px)",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(10,22,40,0.8), rgba(6,11,24,0.9))",
        padding: "1.25rem",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            width: 44, height: 44, borderRadius: "14px",
            background: `${agent.color}20`,
            border: `1px solid ${agent.color}40`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.4rem",
          }}>
            {agent.emoji}
          </div>
          <div>
            <div style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", letterSpacing: "-0.01em" }}>{agent.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 8px #00E676" }} />
              <span style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem", fontWeight: 500 }}>{agent.role}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button onClick={() => setMinimized(!minimized)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer", padding: "0.5rem", borderRadius: "8px" }}>
            <ChevronDown size={18} style={{ transform: minimized ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.3s" }} />
          </button>
          <button onClick={() => setOpen(false)} style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", cursor: "pointer", padding: "0.5rem", borderRadius: "8px" }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: "0.75rem" }}>
                {msg.role !== "user" && (
                  <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Bot size={16} color="var(--color-accent-500)" />
                  </div>
                )}
                <div style={{
                  maxWidth: "85%", padding: "0.875rem 1.125rem", borderRadius: msg.role === "user" ? "20px 20px 4px 20px" : "4px 20px 20px 20px",
                  background: msg.role === "user" ? "linear-gradient(135deg, #00D4FF, #1E4D8C)" : "rgba(255,255,255,0.03)",
                  border: msg.role !== "user" ? "1px solid rgba(255,255,255,0.05)" : "none",
                  color: msg.role === "user" ? "white" : "var(--color-neutral-200)",
                  fontSize: "0.875rem", lineHeight: 1.6,
                  boxShadow: msg.role === "user" ? "0 4px 15px rgba(0,212,255,0.2)" : "none"
                }}>
                  {msg.content}
                  {/* Tool Call Feedback */}
                  {msg.toolInvocations?.map((tool) => (
                    <div key={tool.toolCallId} style={{ marginTop: "0.5rem", padding: "0.4rem", borderRadius: "8px", background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", fontSize: "0.7rem", color: "var(--color-accent-500)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Sparkles size={12} className="animate-spin" />
                      {tool.state === 'result' ? "Intelligence Synced with CRM" : "Synchronizing with CRM..."}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div style={{ width: 32, height: 32, borderRadius: "10px", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={16} color="var(--color-accent-500)" />
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.75rem", fontStyle: "italic", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {agent.name} is thinking... <Sparkles size={12} className="animate-pulse" />
                </div>
              </div>
            )}
            {error && (
              <div style={{ padding: "1rem", borderRadius: "12px", background: "rgba(255,68,68,0.1)", border: "1px solid rgba(255,68,68,0.2)", color: "#ff6b6b", fontSize: "0.8rem", textAlign: "center" }}>
                Neural connection interrupted. Please check your network or try again.
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "0.75rem" }}>
            <button type="button" onClick={startVoice} style={{ background: isListening ? "rgba(255,68,68,0.1)" : "rgba(255,255,255,0.05)", border: "none", color: isListening ? "#ff4444" : "white", cursor: "pointer", width: 44, height: 44, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={20} />
            </button>
            <input
              value={input}
              onChange={handleInputChange}
              placeholder={`Ask ${agent.name} about IT solutions...`}
              style={{
                flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px", padding: "0.75rem 1rem", color: "white", fontSize: "0.875rem",
                outline: "none", transition: "border 0.2s"
              }}
              onFocus={e => e.currentTarget.style.border = "1px solid var(--color-accent-500)"}
              onBlur={e => e.currentTarget.style.border = "1px solid rgba(255,255,255,0.1)"}
            />
            <button type="submit" disabled={!input.trim() || isLoading} style={{ width: 44, height: 44, borderRadius: "12px", background: "linear-gradient(135deg, #00D4FF, #1E4D8C)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: !input.trim() || isLoading ? 0.5 : 1 }}>
              <Send size={20} color="white" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
