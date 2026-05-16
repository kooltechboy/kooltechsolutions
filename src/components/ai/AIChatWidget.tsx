"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Mic, MicOff, Send, Bot, ChevronDown, Sparkles, RotateCcw, User, Shield, Zap, Calendar, Headphones } from "lucide-react";
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
    onError: (err) => {
      console.error('Neural Handshake Error:', err);
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
      console.log('Neural Gateway: Initializing 20s proactive countdown...');
      const timer = setTimeout(() => {
        console.log('Neural Gateway: Proactive engagement triggered.');
        setOpen(true);
        setHasProactivelyOpened(true);
      }, 20000); 
      return () => clearTimeout(timer);
    }
  }, [hasProactivelyOpened]);

  // Voice Recognition
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleInputChange({ target: { value: transcript } } as any);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [handleInputChange]);

  const toggleVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setIsListening(true);
      recognitionRef.current?.start();
    }
  };

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-[99999] flex flex-col items-end pointer-events-none">
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
              background: "rgba(10, 22, 45, 0.98)",
              backdropFilter: "blur(25px)",
              boxShadow: `0 30px 100px rgba(0,0,0,0.6), 0 0 50px ${agent.color}15`
            }}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-white/10 bg-white/5 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${agent.color}, #1E4D8C)` }}>
                    <agent.icon size={22} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#0a162d] rounded-full shadow-sm" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-tight leading-none mb-1">{agent.name}</h3>
                  <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.15em]">{agent.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => {
                    localStorage.removeItem(`kts_messages_${sessionId}`);
                    setMessages([{ id: 'initial', role: 'assistant', content: agent.greeting }]);
                  }}
                  className="p-2 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-lg"
                  title="Reset Conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button onClick={() => setMinimized(!minimized)} className="p-2 text-slate-400 hover:text-white transition-all hover:bg-white/5 rounded-lg">
                  <ChevronDown size={18} style={{ transform: minimized ? "rotate(180deg)" : "rotate(0)" }} />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-red-400 transition-all hover:bg-red-400/5 rounded-lg">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!minimized && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-900/40">
                {messages.map((m, idx) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/10 rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 backdrop-blur-sm rounded-tl-none border border-white/5 shadow-inner'
                    }`}>
                      {m.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 rounded-tl-none flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{agent.name} is thinking...</span>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="flex justify-center p-2">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[11px] text-red-400 flex items-center gap-2">
                      <Shield size={12} />
                      Neural Handshake Failed. Please try again.
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area */}
            {!minimized && (
              <div className="p-5 border-t border-white/10 bg-white/5">
                <form onSubmit={handleSubmit} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder={isListening ? "Listening..." : "Message our workforce..."}
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={toggleVoice}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all ${
                        isListening ? 'text-red-400 bg-red-400/10' : 'text-slate-400 hover:text-blue-400'
                      }`}
                    >
                      {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-3.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Send size={20} />
                  </button>
                </form>
                <div className="mt-4 flex items-center justify-between text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] px-1 opacity-60">
                  <span className="flex items-center gap-1.5"><Bot size={12} className="text-blue-500" /> Neural Pipeline V1</span>
                  <span>KoolTech Solutions</span>
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
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="pointer-events-auto mt-4 w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center text-white shadow-[0_20px_50px_rgba(0,212,255,0.4)] border border-white/20 relative group"
        >
          <div className="absolute inset-0 rounded-3xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageCircle size={32} className="group-hover:scale-110 transition-transform" />
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </div>
          <span className="absolute -left-32 top-1/2 -translate-y-1/2 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-xl">
            Live Support
          </span>
        </motion.button>
      )}
    </div>
  );
}
