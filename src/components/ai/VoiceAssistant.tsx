"use client";
import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Loader2, X, Volume2, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  AgentState,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";

const AGENT_MAP: Record<string, { name: string; label: string }> = {
  admin: { name: "Nexus", label: "Nexus AI" },
  portal: { name: "Cortex", label: "Cortex AI" },
  services: { name: "Max", label: "Max AI" },
  contact: { name: "Aria", label: "Aria AI" },
  home: { name: "Kira", label: "Kira AI" },
  nova: { name: "Nova", label: "Nova AI" },
  default: { name: "Kira", label: "Kira AI" },
};

export default function VoiceAssistant() {
  const pathname = usePathname() || "/";
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string>("");
  const [roomName, setRoomName] = useState<string>("");
  const [connecting, setConnecting] = useState(false);

  const getAgent = () => {
    if (pathname.includes("/admin")) return AGENT_MAP.admin;
    if (pathname.includes("/portal")) return AGENT_MAP.portal;
    if (pathname.includes("nova") || pathname.includes("/pricing")) return AGENT_MAP.nova;
    if (pathname === "/" || pathname.includes("/about")) return AGENT_MAP.home;
    if (pathname.includes("/services")) return AGENT_MAP.services;
    if (pathname.includes("/contact")) return AGENT_MAP.contact;
    return AGENT_MAP.default;
  };

  const currentAgent = getAgent();

  const connectToVoice = async () => {
    setConnecting(true);
    setIsOpen(true);
    try {
      const room = `float-call-${currentAgent.name.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
      setRoomName(room);
      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room,
          participantName: "Visitor",
          agentName: currentAgent.name,
        }),
      });
      const data = await res.json();
      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error(data.error ?? "Failed to acquire token");
      }
    } catch (e) {
      console.error("[VoiceAssistant] Connection failed:", e);
      setIsOpen(false);
    }
    setConnecting(false);
  };

  const handleDisconnect = () => {
    setToken("");
    setRoomName("");
    setIsOpen(false);
  };

  if (pathname.startsWith("/admin") || pathname.startsWith("/portal")) {
    return null;
  }

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={connectToVoice}
          className="fixed bottom-6 right-28 z-50 w-16 h-16 bg-[#00D4FF] text-black rounded-full shadow-[0_0_20px_rgba(0,212,255,0.4)] hover:scale-105 transition-all flex items-center justify-center group"
          title={`Talk to ${currentAgent.name} (AI Assistant)`}
        >
          <Mic size={24} className="group-hover:animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A1628] animate-pulse" />
        </button>
      )}

      {/* Voice Assistant Widget */}
      {isOpen && (
        <div className="fixed bottom-6 right-28 z-[100] w-80 bg-[#0A1628]/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF]">
                <Volume2 size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">{currentAgent.label}</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                  {connecting ? "Connecting..." : token ? "Active Session" : "Disconnected"}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              className="p-1.5 text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
            {connecting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Negotiating WebRTC...</span>
              </div>
            ) : token ? (
              <LiveKitRoom
                token={token}
                serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
                connect={true}
                audio={true}
                video={false}
                onDisconnected={handleDisconnect}
                className="w-full h-full flex flex-col items-center"
              >
                <ActiveSessionUI />
                <RoomAudioRenderer />
              </LiveKitRoom>
            ) : (
              <div className="text-center">
                <p className="text-red-400 text-xs mb-3">Connection failed.</p>
                <button
                  onClick={connectToVoice}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ActiveSessionUI() {
  const { state, audioTrack } = useVoiceAssistant();
  
  return (
    <div className="w-full flex flex-col items-center gap-6">
      <div className="w-full max-w-[200px] h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 p-4 shadow-inner">
        {audioTrack ? (
          <BarVisualizer
            state={state}
            barCount={5}
            trackRef={audioTrack}
            className="w-full h-full text-[#00D4FF]"
            options={{ minHeight: 4 }}
          />
        ) : (
          <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" /> Awaiting Agent...
          </div>
        )}
      </div>

      <div className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border bg-white/5 border-white/10 text-neutral-400">
        Status: <span className={state === "speaking" ? "text-[#00D4FF]" : state === "listening" ? "text-[#00E676]" : "text-yellow-500"}>{state}</span>
      </div>

      <VoiceAssistantControlBar controls={{ leave: false, microphone: true }} className="bg-transparent border-none p-0 mt-2 gap-4" />
      
      <div className="absolute bottom-4 right-4 z-50">
         <DisconnectButton className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors border-none shadow-lg">
           <Phone size={18} className="rotate-[135deg]" />
         </DisconnectButton>
      </div>
    </div>
  );
}
