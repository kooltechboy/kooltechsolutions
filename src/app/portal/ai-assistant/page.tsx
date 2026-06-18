"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Send, Bot, User, ArrowLeft, Loader2, Sparkles, Ticket, HardDrive } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface TicketData {
  id: string;
  subject: string;
  status: string;
}

export default function AIAssistantPage() {
  const router = useRouter();
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.pathname === "/portal/ai-assistant") {
      router.replace("/portal?view=ai-assistant");
    }
  }, [router]);

  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    async function loadChatAndMessages() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load tickets for support context sidebar
      const { data: ticketData } = await supabase
        .from("tickets")
        .select("id, subject, status")
        .eq("client_id", user.id)
        .limit(3);
      if (ticketData) setTickets(ticketData);

      // Check if there is an existing 'general' AI chat for this user
      const { data: existingChats } = await supabase
        .from("ai_chats")
        .select("id")
        .eq("user_id", user.id)
        .eq("context_type", "general")
        .order("created_at", { ascending: false })
        .limit(1);

      let activeChatId = null;

      if (existingChats && existingChats.length > 0) {
        activeChatId = existingChats[0].id;
        setChatId(activeChatId);

        // Fetch messages for this chat session
        const { data: dbMessages } = await supabase
          .from("ai_messages")
          .select("role, content")
          .eq("chat_id", activeChatId)
          .order("created_at", { ascending: true });

        if (dbMessages && dbMessages.length > 0) {
          setMessages(dbMessages as Message[]);
        } else {
          // Fallback if session exists but messages are empty
          const welcomeMessage = "Hello! I'm Kira, your virtual IT engineer. How can I help you with your services, tickets, or network settings today?";
          setMessages([{ role: "assistant", content: welcomeMessage }]);
        }
      } else {
        // Create a new general chat session
        const { data: newChat } = await supabase
          .from("ai_chats")
          .insert({
            user_id: user.id,
            title: "General IT Support Chat",
            context_type: "general",
          })
          .select("id")
          .single();

        if (newChat) {
          activeChatId = newChat.id;
          setChatId(activeChatId);

          const welcomeMessage = "Hello! I'm Kira, your virtual IT engineer. How can I help you with your services, tickets, or network settings today?";
          
          // Insert welcome message to db
          await supabase
            .from("ai_messages")
            .insert({
              chat_id: activeChatId,
              role: "assistant",
              content: welcomeMessage,
            });

          setMessages([{ role: "assistant", content: welcomeMessage }]);
        }
      }
    }
    loadChatAndMessages();
  }, [supabase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !chatId) return;

    const userMessage = input.trim();
    setInput("");
    
    // Append to UI immediately
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setSending(true);

    try {
      // 1. Insert user message in Database
      await supabase
        .from("ai_messages")
        .insert({
          chat_id: chatId,
          role: "user",
          content: userMessage
        });

      // 2. Fetch AI reply from Next.js route
      const chatHistory = [...messages, { role: "user", content: userMessage }];
      const res = await fetch("/api/portal/ai-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });

      const data = await res.json();
      if (res.ok && data.text) {
        // 3. Insert assistant reply in Database
        await supabase
          .from("ai_messages")
          .insert({
            chat_id: chatId,
            role: "assistant",
            content: data.text
          });

        setMessages(prev => [...prev, { role: "assistant", content: data.text }]);
      } else {
        const errMsg = "I'm sorry, I encountered a connection error. Please try again.";
        setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
      }
    } catch {
      const errMsg = "Failed to communicate with AI server.";
      setMessages(prev => [...prev, { role: "assistant", content: errMsg }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
        <Link href="/portal" style={{ color: "var(--color-neutral-400)", display: "flex", alignItems: "center", gap: "0.5rem", textDecoration: "none" }}>
          <ArrowLeft size={18} /> Back
        </Link>
        <div>
          <h1 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, fontFamily: "Syne, sans-serif", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Sparkles size={20} color="var(--color-accent-500)" /> AI Support Assistant
          </h1>
          <p style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem" }}>Chat with Kira, your virtual support assistant, connected to your environment.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", flex: 1, minHeight: 0 }} className="portal-assistant-grid">
        {/* Chat area */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: "16px" }}>
          {/* Thread messages */}
          <div ref={scrollRef} style={{ flex: 1, padding: "1.5rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div key={idx} style={{ display: "flex", gap: "1rem", alignSelf: isAssistant ? "flex-start" : "flex-end", maxWidth: "80%" }}>
                  {isAssistant && (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={18} color="var(--color-accent-500)" />
                    </div>
                  )}
                  <div style={{
                    padding: "1rem",
                    borderRadius: "12px",
                    background: isAssistant ? "rgba(255,255,255,0.02)" : "var(--color-accent-650, #00D4FF15)",
                    border: isAssistant ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,212,255,0.2)",
                    color: "white",
                    fontSize: "0.9375rem",
                    lineHeight: 1.5,
                    whiteSpace: "pre-line",
                  }}>
                    {msg.content}
                  </div>
                  {!isAssistant && (
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={18} color="var(--color-neutral-400)" />
                    </div>
                  )}
                </div>
              );
            })}
            {sending && (
              <div style={{ display: "flex", gap: "1rem" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(0,212,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Loader2 className="animate-spin" size={18} color="var(--color-accent-500)" />
                </div>
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.875rem", alignSelf: "center" }}>Kira is typing...</div>
              </div>
            )}
          </div>

          {/* Form input */}
          <div style={{ padding: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
            <form onSubmit={handleSend} style={{ display: "flex", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Ask about your tickets, billing, or network config..."
                value={input}
                onChange={e => setInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.875rem 1.25rem",
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  outline: "none",
                  fontSize: "0.9375rem"
                }}
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                style={{
                  background: "var(--color-accent-500)",
                  border: "none",
                  width: 48,
                  height: 48,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  opacity: (sending || !input.trim()) ? 0.5 : 1
                }}
              >
                <Send size={18} color="black" />
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar Info */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "16px" }}>
            <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Ticket size={16} color="var(--color-accent-400)" /> Support Context
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {tickets.length === 0 ? (
                <div style={{ color: "var(--color-neutral-500)", fontSize: "0.8125rem" }}>No tickets active.</div>
              ) : tickets.map(t => (
                <div key={t.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "0.5rem" }}>
                  <div style={{ color: "white", fontSize: "0.8125rem", fontWeight: 600 }} className="truncate">{t.subject}</div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--color-neutral-500)", marginTop: "0.25rem" }}>
                    <span>#{t.id.slice(0, 8)}</span>
                    <span style={{ color: "var(--color-accent-400)", textTransform: "capitalize" }}>{t.status.replace("_", " ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card" style={{ padding: "1.5rem", borderRadius: "16px" }}>
            <h3 style={{ color: "white", fontSize: "0.875rem", fontWeight: 700, marginBottom: "1.25rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <HardDrive size={16} color="var(--color-success)" /> Telemetry Sync
            </h3>
            <p style={{ color: "var(--color-neutral-400)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
              Kira automatically reviews database snapshots and endpoint health telemetry to troubleshoot performance anomalies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
