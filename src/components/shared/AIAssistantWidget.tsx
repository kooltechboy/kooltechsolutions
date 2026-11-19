"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Loader2,
  Calendar, ArrowRight, ShieldCheck, Terminal, Minimize2, RefreshCw
} from "lucide-react";
import BookingModal from "@/components/shared/BookingModal";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const QUICK_ACTIONS = [
  { label: "⚡ Dynamic Scope & ROI", prompt: "Can you estimate the ROI and engineering scope for automating our customer operations with AI agents?" },
  { label: "🛡️ Zero-Trust Security Audit", prompt: "What does your Zero-Trust Cybersecurity assessment include and what is the typical delivery timeframe?" },
  { label: "☁️ Cloud Modernization", prompt: "We are migrating to a multi-cloud Kubernetes infrastructure. How does KoolTech handle migration SLAs?" },
  { label: "📅 Book Technical Consultation", prompt: "I would like to schedule a technical architecture session with a principal engineer." }
];

export default function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome message
    if (messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content: "Hello. I'm **Kira**, Senior AI Solutions Architect at KoolTech Solutions.\n\nHow can I assist your engineering leadership with **Autonomous AI Systems**, **Zero-Trust Cybersecurity**, or **Enterprise Cloud Infrastructure** today?"
        }
      ]);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || loading) return;

    if (!messageText) setInput("");

    const newMessages: ChatMessage[] = [...messages, { role: "user", content: textToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai-agents/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        setMessages([...newMessages, { role: "assistant", content: data.text }]);
      } else {
        setMessages([
          ...newMessages,
          {
            role: "assistant",
            content: "I apologize, but our neural gateway encountered an interruption. Please try again or schedule a direct consultation."
          }
        ]);
      }
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Connection error. Please verify your network connection or reach our engineering desk directly at support@kooltech.solutions."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: "assistant",
        content: "Chat history cleared. How can I assist with your infrastructure or AI initiatives?"
      }
    ]);
  };

  return (
    <>
      {/* Floating Trigger Pill */}
      {!isOpen && (
        <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 999 }}>
          <button
            onClick={() => setIsOpen(true)}
            style={{
              display: "flex", alignItems: "center", gap: "0.75rem",
              padding: "0.75rem 1.25rem",
              borderRadius: "9999px",
              background: "#050811",
              border: "1px solid rgba(0, 212, 255, 0.35)",
              color: "white",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.2)",
              cursor: "pointer",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.borderColor = "var(--color-accent-400)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.35)";
            }}
          >
            <div style={{ position: "relative", width: "24px", height: "24px" }}>
              <div style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                background: "rgba(0, 212, 255, 0.2)",
                animation: "pulse 2s infinite"
              }} />
              <Bot size={20} color="var(--color-accent-400)" style={{ position: "relative", zIndex: 2 }} />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "0.8125rem", fontWeight: 700, fontFamily: "Syne, sans-serif", letterSpacing: "0.02em" }}>
                Kira · AI Concierge
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem", fontSize: "0.6875rem", color: "var(--color-neutral-400)" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                Online & Ready
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window Drawer */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            width: "clamp(320px, 92vw, 420px)",
            height: "clamp(480px, 80vh, 620px)",
            zIndex: 1000,
            borderRadius: "18px",
            background: "#050811",
            border: "1px solid rgba(0, 212, 255, 0.3)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.7), 0 0 32px rgba(0, 212, 255, 0.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "1rem 1.25rem",
              background: "rgba(9, 13, 22, 0.8)",
              borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div
                style={{
                  width: "36px", height: "36px", borderRadius: "10px",
                  background: "rgba(0, 212, 255, 0.12)",
                  border: "1px solid rgba(0, 212, 255, 0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <Bot size={20} color="var(--color-accent-400)" />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: "white", fontWeight: 700, fontSize: "0.9375rem", fontFamily: "Syne" }}>
                    Kira AI
                  </span>
                  <span style={{
                    fontSize: "0.625rem", fontFamily: "JetBrains Mono",
                    background: "rgba(16, 185, 129, 0.15)", color: "#10b981",
                    padding: "0.1rem 0.4rem", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.3)"
                  }}>
                    TIER-1 OPS
                  </span>
                </div>
                <div style={{ color: "var(--color-neutral-400)", fontSize: "0.75rem" }}>
                  Executive Solutions Architect
                </div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <button
                onClick={handleReset}
                title="Reset conversation"
                style={{
                  background: "none", border: "none", color: "var(--color-neutral-400)",
                  cursor: "pointer", padding: "0.25rem", borderRadius: "4px",
                  display: "flex", alignItems: "center"
                }}
              >
                <RefreshCw size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close chat"
                style={{
                  background: "rgba(255,255,255,0.06)", border: "none", color: "white",
                  cursor: "pointer", width: "28px", height: "28px", borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick Consultation Banner */}
          <div
            style={{
              padding: "0.5rem 1rem",
              background: "rgba(0, 212, 255, 0.06)",
              borderBottom: "1px solid rgba(0, 212, 255, 0.12)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
              fontSize: "0.75rem"
            }}
          >
            <span style={{ color: "var(--color-neutral-300)" }}>Need an architecture review?</span>
            <button
              onClick={() => setBookingOpen(true)}
              style={{
                background: "none", border: "none",
                color: "var(--color-accent-400)", fontWeight: 700,
                display: "inline-flex", alignItems: "center", gap: "0.25rem",
                cursor: "pointer", padding: 0
              }}
            >
              Book Session <ArrowRight size={12} />
            </button>
          </div>

          {/* Messages Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            {messages.map((msg, i) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignSelf: isAssistant ? "flex-start" : "flex-end",
                    maxWidth: "88%",
                  }}
                >
                  {isAssistant && (
                    <div
                      style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: "rgba(0, 212, 255, 0.1)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "2px"
                      }}
                    >
                      <Bot size={14} color="var(--color-accent-400)" />
                    </div>
                  )}

                  <div
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: isAssistant ? "4px 14px 14px 14px" : "14px 4px 14px 14px",
                      background: isAssistant ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 212, 255, 0.15)",
                      border: isAssistant ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 212, 255, 0.3)",
                      color: "white",
                      fontSize: "0.875rem",
                      lineHeight: 1.55,
                      whiteSpace: "pre-line",
                    }}
                  >
                    {msg.content}
                  </div>

                  {!isAssistant && (
                    <div
                      style={{
                        width: "28px", height: "28px", borderRadius: "8px",
                        background: "rgba(255, 255, 255, 0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0, marginTop: "2px"
                      }}
                    >
                      <User size={14} color="var(--color-neutral-300)" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "0.75rem", alignSelf: "flex-start" }}>
                <div
                  style={{
                    width: "28px", height: "28px", borderRadius: "8px",
                    background: "rgba(0, 212, 255, 0.1)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  <Loader2 className="animate-spin" size={14} color="var(--color-accent-400)" />
                </div>
                <div
                  style={{
                    padding: "0.75rem 1rem", borderRadius: "4px 14px 14px 14px",
                    background: "rgba(255, 255, 255, 0.03)", border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "var(--color-neutral-400)", fontSize: "0.8125rem", fontStyle: "italic"
                  }}
                >
                  Kira is synthesizing architecture proposal...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts (shown if fewer than 3 messages) */}
          {messages.length <= 2 && (
            <div style={{ padding: "0 1rem 0.5rem", display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {QUICK_ACTIONS.map(action => (
                <button
                  key={action.label}
                  onClick={() => handleSend(action.prompt)}
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    borderRadius: "9999px",
                    padding: "0.25rem 0.65rem",
                    fontSize: "0.6875rem",
                    color: "var(--color-neutral-300)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--color-accent-400)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.color = "var(--color-neutral-300)";
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div
            style={{
              padding: "0.875rem 1rem",
              background: "rgba(9, 13, 22, 0.9)",
              borderTop: "1px solid rgba(255, 255, 255, 0.08)",
            }}
          >
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSend();
              }}
              style={{ display: "flex", gap: "0.5rem" }}
            >
              <input
                type="text"
                placeholder="Ask Kira about AI architecture, cloud, or SLAs..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: "0.625rem 0.875rem",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "white",
                  fontSize: "0.875rem",
                  outline: "none",
                }}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  width: "38px", height: "38px", borderRadius: "10px",
                  background: "var(--color-accent-500)",
                  border: "none", color: "#020408",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: (loading || !input.trim()) ? "not-allowed" : "pointer",
                  opacity: (loading || !input.trim()) ? 0.5 : 1,
                  flexShrink: 0
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Booking Modal Integration */}
      <BookingModal isOpen={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
