"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Mic, Send, Bot, ChevronDown, Sparkles, RotateCcw, Shield, Zap, Calendar, Activity, TrendingUp, Phone, PhoneOff, Copy, Check, RefreshCw, AlertTriangle, UserCheck } from "lucide-react";
import { useChat } from '@ai-sdk/react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Auto-summarization threshold: after this many messages the oldest ones are condensed
const MAX_MESSAGES_BEFORE_COMPRESS = 15;

// LiveKit Imports
import { LiveKitRoom, RoomAudioRenderer, VoiceAssistantControlBar, BarVisualizer, useVoiceAssistant } from '@livekit/components-react';
import "@livekit/components-styles";

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
  portal: {
    name: "Cortex",
    role: "Support Engineer (L3)",
    color: "#00D4FF",
    icon: Activity,
    greeting: "Neural link established. I'm Cortex, your dedicated systems lead. I can help you analyze your infrastructure reports, track asset lifecycles, or troubleshoot service tickets. What's on your radar?"
  },
  admin: {
    name: "Nexus",
    role: "Growth Intelligence",
    color: "#a855f7",
    icon: TrendingUp,
    greeting: "Nexus online. I'm analyzing your current sales velocity and lead quality. We have several high-intent leads waiting for qualification. How can I help you scale today?"
  },
  default: { 
    name: "Kira", 
    role: "AI Workforce", 
    color: "#00D4FF", 
    icon: Zap,
    greeting: "Hello! How can the KoolTech AI workforce assist you today?" 
  },
};

const CodeBlock = ({ node, inline, className, children, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const isInline = inline || !match;

  const handleCopy = () => {
    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs text-blue-300" {...props}>{children}</code>;
  }

  return (
    <div className="relative group rounded-xl overflow-hidden my-3 border border-white/10 shadow-lg">
      <div className="flex items-center justify-between px-3 py-1.5 bg-black/60 border-b border-white/5">
        <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{match[1]}</span>
        <button onClick={handleCopy} className="p-1.5 text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-md">
          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
        </button>
      </div>
      <pre className="p-4 bg-black/40 overflow-x-auto text-xs font-mono text-slate-300">
        <code className={className} {...props}>{children}</code>
      </pre>
    </div>
  );
};

// Voice Assistant Internal UI
function VoiceAssistantUI({ agentColor }: { agentColor: string }) {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 bg-slate-900/60 rounded-2xl">
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold text-white tracking-tight">Voice Connection Active</h3>
        <p className="text-sm text-slate-400">Speak naturally. The agent will listen and respond.</p>
      </div>
      
      <div className="h-32 w-full max-w-[200px] flex items-center justify-center bg-black/20 rounded-3xl border border-white/5 shadow-inner">
        <BarVisualizer 
          state={state}
          barCount={7}
          trackRef={audioTrack}
          options={{ minHeight: 10 }}
          style={{ width: '100%', height: '80%' }}
        />
      </div>

      <div className="text-xs uppercase tracking-widest font-black" style={{ color: agentColor }}>
        {state === 'listening' ? 'Listening...' : state === 'speaking' ? 'Agent Speaking...' : 'Connected'}
      </div>
      
      <VoiceAssistantControlBar />
    </div>
  );
}

export default function AIChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasProactivelyOpened, setHasProactivelyOpened] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Voice Mode State
  const [voiceMode, setVoiceMode] = useState(false);
  const [livekitToken, setLivekitToken] = useState("");
  const [isConnectingVoice, setIsConnectingVoice] = useState(false);

  // Escalation State
  const [escalated, setEscalated] = useState(false);
  const [escalationId, setEscalationId] = useState<string | null>(null);
  const [escalationPriority, setEscalationPriority] = useState<string>("normal");
  const [isCompressing, setIsCompressing] = useState(false);
  const compressedRef = useRef(false);

  const [sessionId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("kts_ai_session_id") || crypto.randomUUID();
    }
    return "";
  });

  useEffect(() => {
    if (sessionId) localStorage.setItem("kts_ai_session_id", sessionId);
  }, [sessionId]);

  const getAgent = () => {
    if (pathname.includes('/admin')) return AGENTS.admin;
    if (pathname.includes('/portal')) return AGENTS.portal;
    if (pathname === '/') return AGENTS.home;
    if (pathname.includes('/services')) return AGENTS.services;
    if (pathname.includes('/blog')) return AGENTS.blog;
    if (pathname.includes('/contact')) return AGENTS.contact;
    return AGENTS.default;
  };

  const agent = getAgent();

  const [input, setInput] = useState("");

  const { messages, setMessages, append, isLoading, error, reload } = useChat({
    api: '/api/ai-workforce/v1',
    id: sessionId,
    initialMessages: [{ id: 'initial', role: 'assistant', content: agent.greeting }],
    body: {
      agentName: agent.name,
      agentRole: agent.role,
      context: { pathname },
      sessionId,
    },
    onError: (err) => {
      console.error('Neural Handshake Error:', err);
    },
    onFinish: (message) => {
      localStorage.setItem(`kts_messages_${sessionId}`, JSON.stringify([...messages, message]));
      // Detect escalation tool result in message tool invocations
      if (message.toolInvocations) {
        for (const tool of message.toolInvocations) {
          if (tool.toolName === 'escalateToHuman' && tool.state === 'result') {
            const result = (tool as any).result;
            if (result?.escalationId) {
              setEscalated(true);
              setEscalationId(result.escalationId);
            } else if (result?.success === true) {
              setEscalated(true);
            }
          }
        }
      }
    }
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    
    append({ role: 'user', content: input });
    setInput("");
  };

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

  useEffect(() => {
    if (!hasProactivelyOpened) {
      const timer = setTimeout(() => {
        setOpen(true);
        setHasProactivelyOpened(true);
      }, 20000); 
      return () => clearTimeout(timer);
    }
  }, [hasProactivelyOpened]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Auto-compression: condense old messages when threshold is reached ───────
  useEffect(() => {
    if (
      isLoading ||
      isCompressing ||
      compressedRef.current ||
      messages.length < MAX_MESSAGES_BEFORE_COMPRESS
    ) return;

    const compressMessages = async () => {
      setIsCompressing(true);
      try {
        const res = await fetch('/api/ai-workforce/compress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            agentName: agent.name,
            messages: messages
              .filter((m) => m.role !== 'system')
              .map((m) => ({ role: m.role, content: typeof m.content === 'string' ? m.content : '' })),
          }),
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.compressed && data.summaryMessage && data.recentMessages) {
          // Rebuild message list: initial greeting + summary + recent
          const initialMsg = messages[0];
          const rebuilt = [initialMsg, data.summaryMessage, ...data.recentMessages.map((m: any, i: number) => ({
            id: `recent-${i}`,
            ...m,
          }))];
          setMessages(rebuilt);
          localStorage.setItem(`kts_messages_${sessionId}`, JSON.stringify(rebuilt));
          compressedRef.current = true; // Only compress once per session reload
        }
      } catch (err) {
        console.warn('[AIChatWidget] Compression error:', err);
      } finally {
        setIsCompressing(false);
      }
    };

    compressMessages();
  }, [messages.length, isLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle Voice Connection
  const toggleVoiceMode = async () => {
    if (voiceMode) {
      setVoiceMode(false);
      setLivekitToken("");
    } else {
      setIsConnectingVoice(true);
      try {
        const res = await fetch('/api/livekit/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            roomName: `room-${sessionId}`, 
            participantName: 'Visitor',
            agentName: agent.name
          })
        });
        const data = await res.json();
        if (data.token) {
          setLivekitToken(data.token);
          setVoiceMode(true);
        } else {
          console.error("Failed to get token:", data.error);
        }
      } catch (e) {
        console.error("Voice connect error:", e);
      } finally {
        setIsConnectingVoice(false);
      }
    }
  };

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
                  onClick={toggleVoiceMode}
                  className={`p-2 transition-all rounded-lg ${voiceMode ? 'text-blue-400 bg-blue-400/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  title={voiceMode ? "Switch to Text" : "Switch to Voice"}
                >
                  {isConnectingVoice ? <Activity className="animate-spin" size={16} /> : voiceMode ? <PhoneOff size={16} /> : <Phone size={16} />}
                </button>
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

            {/* Escalation Banner */}
            {escalated && !minimized && (
              <div className="mx-4 mt-3 mb-0 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <UserCheck size={16} />
                  <span>Human Specialist Notified</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Our team has your full conversation and will respond based on priority SLA.
                  You can continue chatting here while you wait.
                </p>
                {escalationId && (
                  <p className="text-[10px] text-slate-500 font-mono">
                    Ref: {escalationId.slice(0, 16)}...
                  </p>
                )}
              </div>
            )}

            {/* Voice or Text Area */}
            {!minimized && voiceMode && livekitToken ? (
              <div className="flex-1 p-5 bg-slate-900/40 relative">
                <LiveKitRoom
                  serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                  token={livekitToken}
                  connect={true}
                  audio={true}
                  video={false}
                  className="h-full w-full"
                >
                  <VoiceAssistantUI agentColor={agent.color} />
                  <RoomAudioRenderer />
                </LiveKitRoom>
              </div>
            ) : !minimized && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-slate-900/40">
                {messages.map((m) => (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user' 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-xl shadow-blue-600/10 rounded-tr-none' 
                        : 'bg-white/5 text-slate-200 backdrop-blur-sm rounded-tl-none border border-white/5 shadow-inner'
                    }`}>
                      {m.content && (
                        <div className="markdown-body">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: CodeBlock
                            }}
                          >
                            {m.content}
                          </ReactMarkdown>
                        </div>
                      )}
                      
                      {m.toolInvocations?.map((tool) => (
                        <div key={tool.toolCallId} className="mt-2 text-[11px] bg-black/20 text-slate-300 p-2 rounded-lg border border-white/5 flex items-center gap-2">
                          <Activity size={12} className={tool.state === 'result' ? 'text-green-400' : 'text-blue-400 animate-pulse'} />
                          <span className="font-mono">
                            {tool.state === 'result' ? `Completed: ${tool.toolName}` : `Running: ${tool.toolName}...`}
                          </span>
                        </div>
                      ))}
                    </div>
                    {/* Timestamp */}
                    {m.createdAt && (
                      <div className="w-full text-[9px] text-slate-500 mt-1 px-1 opacity-70">
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
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
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-[11px] text-red-400 flex flex-col items-center gap-2 text-center max-w-[85%] shadow-lg">
                      <div className="flex items-center gap-2 font-bold">
                        <Shield size={14} />
                        Neural Handshake Failed
                      </div>
                      <span className="text-[10px] text-red-400/80">Connection lost or timeout. Please check your network.</span>
                      <button onClick={() => reload()} className="mt-1 px-4 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg flex items-center gap-1.5 transition-colors">
                        <RefreshCw size={10} />
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Input Area (Text Mode Only) */}
            {!minimized && !voiceMode && (
              <div className="p-5 border-t border-white/10 bg-white/5">
                <form onSubmit={handleSubmit} className="relative flex gap-2">
                  <div className="relative flex-1">
                    <input
                      value={input}
                      onChange={handleInputChange}
                      placeholder="Message our workforce..."
                      className="w-full bg-slate-900/80 border border-white/10 rounded-2xl py-3.5 pl-5 pr-12 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all placeholder:text-slate-500 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={toggleVoiceMode}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all text-slate-400 hover:text-blue-400`}
                      title="Switch to Voice Mode"
                    >
                      <Mic size={18} />
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

