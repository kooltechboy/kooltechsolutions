"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, Send, Bot, ChevronDown, Sparkles, RotateCcw, User, Shield, Zap, Calendar, Headphones } from "lucide-react";
import { useChat } from 'ai/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const AGENTS = {
  home: { 
    name: "Kira", 
    role: "Executive Concierge", 
    color: "#00D4FF", 
    icon: Sparkles,
    greeting: "Hi! I'm Kira. Welcome to KoolTech Solutions. Are you looking to scale your infrastructure or secure your network? I'm here to ensure you find exactly what you need. 😊" 
  },
  services: { 
    name: "Max", 
    role: "Senior Solutions Architect", 
    color: "#00E676", 
    icon: Shield,
    greeting: "Hello, I'm Max. I specialize in enterprise-grade security and cloud orchestration. Which area of your technology stack should we optimize today?" 
  },
  blog: { 
    name: "Kira", 
    role: "Intelligence Lead", 
    color: "#00D4FF", 
    icon: Bot,
    greeting: "Hi! I'm Kira. Diving into our latest research? If you have questions about these insights—or how to implement them—I'm your primary contact." 
  },
  contact: { 
    name: "Aria", 
    role: "Strategic Coordinator", 
    color: "#FFB300", 
    icon: Calendar,
    greeting: "Hi! I'm Aria. Ready to move forward? I can help you secure a direct consultation with our engineering team. Shall we set an appointment?" 
  },
  default: { 
    name: "Kira", 
    role: "AI Workforce", 
    color: "#00D4FF", 
    icon: Zap,
    greeting: "Hello! How can the KoolTech AI workforce assist you today?" 
  },
};

export default function AIChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasProactivelyOpened, setHasProactivelyOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("kts_ai_session_id") || crypto.randomUUID();
    }
    return "";
  });

  useEffect(() => {
    if (sessionId) localStorage.setItem("kts_ai_session_id", sessionId);
  }, [sessionId]);

  // Determine current agent based on route
  const getAgent = () => {
    if (pathname === '/') return AGENTS.home;
    if (pathname.includes('/services')) return AGENTS.services;
    if (pathname.includes('/blog')) return AGENTS.blog;
    if (pathname.includes('/contact')) return AGENTS.contact;
    return AGENTS.default;
  };

  const agent = getAgent();

  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, error } = useChat({
    api: '/api/ai-workforce/v1',
    id: sessionId,
    initialMessages: [{ id: 'initial', role: 'assistant', content: agent.greeting }],
    body: {
      agentName: agent.name,
      agentRole: agent.role,
      context: { pathname }
    },
    onFinish: (message) => {
      // Save to persistence
      localStorage.setItem(`kts_messages_${sessionId}`, JSON.stringify([...messages, message]));
    }
  });

  // Load persistence
  useEffect(() => {
    const saved = localStorage.getItem(`kts_messages_${sessionId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 1) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Failed to load AI history", e);
      }
    }
  }, [sessionId, setMessages]);

  // Proactive Engagement
  useEffect(() => {
    if (!hasProactivelyOpened) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasProactivelyOpened(true);
      }, 15000); // Proactive open after 15s
      return () => clearTimeout(timer);
    }
  }, [hasProactivelyOpened]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`pointer-events-auto w-[380px] sm:w-[420px] rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col transition-all duration-500 ${
              minimized ? 'h-[72px]' : 'h-[600px] max-h-[80vh]'
            }`}
            style={{ 
              background: "rgba(10, 22, 45, 0.95)",
              backdropFilter: "blur(20px)",
              boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${agent.color}15`
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${agent.color}, #1E4D8C)` }}>
                    <agent.icon size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-[#0a162d] rounded-full" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight">{agent.name}</h3>
                  <p className="text-[10px] text-blue-400 font-medium uppercase tracking-wider">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    localStorage.removeItem(`kts_messages_${sessionId}`);
                    setMessages([{ id: 'initial', role: 'assistant', content: agent.greeting }]);
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Reset Conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setMinimized(!minimized)} className="p-2 text-slate-400 hover:text-white transition-colors">
                  <ChevronDown size={18} style={{ transform: minimized ? "rotate(180deg)" : "rotate(0)" }} />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!minimized && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {messages.map((m, idx) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      m.role === 'user' 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 rounded-tr-none' 
                        : 'bg-white/10 text-slate-200 backdrop-blur-sm rounded-tl-none border border-white/5'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-3 rounded-2xl border border-white/5 rounded-tl-none">
                      <div className="flex gap-1">
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            {!minimized && (
              <div className="p-4 border-t border-white/10 bg-white/5">
                <form onSubmit={handleSubmit} className="relative">
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder="Ask anything about our solutions..."
                    className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 font-medium tracking-wide px-1">
                  <span className="flex items-center gap-1"><Sparkles size={10} className="text-blue-400" /> Powered by Gemini 1.5</span>
                  <span className="uppercase tracking-widest">KoolTech Solutions</span>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      {!open && (
        <motion.button
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setOpen(true)}
          className="pointer-events-auto mt-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 border border-white/20 relative"
        >
          <MessageCircle size={28} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
        </motion.button>
      )}
    </div>
  );
}
