"use client";

import React, { useState, useCallback } from "react";
import { Mic, Loader2, X, Volume2, Phone, PhoneOff } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  DisconnectButton,
} from "@livekit/components-react";
import "@livekit/components-styles";

// ── Persona map: path prefix → agent name ────────────────────────────────────
const AGENT_MAP: Record<string, { name: string; label: string; tagline: string }> = {
  admin:    { name: "Nexus",  label: "Nexus AI",  tagline: "Admin Intelligence"      },
  portal:   { name: "Cortex", label: "Cortex AI", tagline: "Support Engineer"        },
  services: { name: "Max",    label: "Max AI",    tagline: "Solutions Architect"     },
  contact:  { name: "Aria",   label: "Aria AI",   tagline: "Strategic Coordinator"  },
  pricing:  { name: "Aria",   label: "Aria AI",   tagline: "Strategic Coordinator"  },
  home:     { name: "Kira",   label: "Kira AI",   tagline: "Executive Concierge"    },
  default:  { name: "Kira",   label: "Kira AI",   tagline: "Executive Concierge"    },
};

// ── Paths where the widget is allowed to appear ───────────────────────────────
const ALLOWED_PREFIXES = ["/", "/about", "/services", "/pricing", "/contact"];

function isAllowedPath(pathname: string): boolean {
  if (pathname === "/" || pathname === "") return true;
  return ALLOWED_PREFIXES.some(
    (p) => p !== "/" && pathname.startsWith(p)
  );
}

function getAgent(pathname: string) {
  if (pathname.startsWith("/admin"))    return AGENT_MAP.admin;
  if (pathname.startsWith("/portal"))  return AGENT_MAP.portal;
  if (pathname.startsWith("/services")) return AGENT_MAP.services;
  if (pathname.startsWith("/pricing")) return AGENT_MAP.pricing;
  if (pathname.startsWith("/contact")) return AGENT_MAP.contact;
  if (pathname === "/" || pathname.startsWith("/about")) return AGENT_MAP.home;
  return AGENT_MAP.default;
}

// ── Active session inner UI ───────────────────────────────────────────────────
function ActiveSessionUI({ agentLabel }: { agentLabel: string }) {
  const { state, audioTrack } = useVoiceAssistant();

  const stateColor =
    state === "speaking"  ? "text-[#00D4FF]" :
    state === "listening" ? "text-[#00E676]" :
    "text-yellow-400";

  return (
    <div className="w-full flex flex-col items-center gap-5">
      {/* Waveform visualizer */}
      <div className="w-full max-w-[220px] h-16 flex items-center justify-center rounded-2xl bg-black/40 border border-white/5 p-4 shadow-inner">
        {audioTrack ? (
          <BarVisualizer
            state={state}
            barCount={7}
            trackRef={audioTrack}
            className="w-full h-full text-[#00D4FF]"
            options={{ minHeight: 3 }}
          />
        ) : (
          <div className="text-neutral-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Loader2 size={12} className="animate-spin" />
            Awaiting Agent…
          </div>
        )}
      </div>

      {/* Status pill */}
      <div className="text-[10px] font-black uppercase tracking-[0.18em] px-3 py-1 rounded-full border bg-white/5 border-white/10 text-neutral-400">
        {agentLabel} ·{" "}
        <span className={stateColor}>{state}</span>
      </div>

      {/* Controls */}
      <VoiceAssistantControlBar
        controls={{ leave: false, microphone: true }}
        className="bg-transparent border-none p-0 mt-1 gap-4"
      />

      {/* Hang-up */}
      <DisconnectButton className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center text-white transition-colors border-none shadow-lg">
        <PhoneOff size={16} />
      </DisconnectButton>
    </div>
  );
}

// ── Main floating widget ──────────────────────────────────────────────────────
export default function VoiceAssistant() {
  const pathname = usePathname() ?? "/";
  const [isOpen, setIsOpen]           = useState(false);
  const [token, setToken]             = useState<string>("");
  const [roomName, setRoomName]       = useState<string>("");
  const [connecting, setConnecting]   = useState(false);
  const [hasConnected, setHasConnected] = useState(false);

  const currentAgent = getAgent(pathname);

  const connectToVoice = useCallback(async () => {
    setConnecting(true);
    setIsOpen(true);
    setHasConnected(false);

    try {
      const room = `float-call-${currentAgent.name.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
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
        setRoomName(data.room ?? room);
      } else {
        throw new Error(data.error ?? "Failed to acquire token");
      }
    } catch (e) {
      console.error("[VoiceAssistant] Connection failed:", e);
      setToken("");
    } finally {
      setConnecting(false);
    }
  }, [currentAgent]);

  const handleDisconnect = useCallback(() => {
    setToken("");
    setRoomName("");
    setIsOpen(false);
    setHasConnected(false);
  }, []);

  const handleRoomDisconnected = useCallback(() => {
    setToken("");
    if (hasConnected) {
      setIsOpen(false);
      setHasConnected(false);
    }
  }, [hasConnected]);

  if (!isAllowedPath(pathname)) return null;

  const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  return (
    <>
      {/* ── Floating mic button ── */}
      {!isOpen && (
        <button
          id="voice-assistant-trigger"
          onClick={connectToVoice}
          aria-label={`Talk to ${currentAgent.name} — AI Voice Assistant`}
          className="
            fixed bottom-6 right-28 z-50 w-16 h-16
            bg-[#00D4FF] text-black rounded-full
            shadow-[0_0_24px_rgba(0,212,255,0.45)]
            hover:scale-110 hover:shadow-[0_0_32px_rgba(0,212,255,0.65)]
            active:scale-95 transition-all duration-200
            flex items-center justify-center group
          "
        >
          <Mic size={24} className="group-hover:animate-pulse" />
          {/* Live indicator dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0A1628] animate-pulse" />
        </button>
      )}

      {/* ── Widget panel ── */}
      {isOpen && (
        <div
          id="voice-assistant-panel"
          className="
            fixed bottom-6 right-28 z-[100]
            w-80 bg-[#0A1628]/95 backdrop-blur-xl
            border border-white/10 rounded-3xl shadow-2xl overflow-hidden
            animate-in slide-in-from-bottom-5 duration-300
          "
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-[#00D4FF] ring-1 ring-[#00D4FF]/30">
                <Volume2 size={16} />
              </div>
              <div>
                <h3 className="text-white font-bold text-sm tracking-tight">{currentAgent.label}</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">
                  {connecting
                    ? "Connecting…"
                    : token
                    ? "Live Session"
                    : "Disconnected"}
                </p>
              </div>
            </div>
            <button
              onClick={handleDisconnect}
              aria-label="Close voice assistant"
              className="p-1.5 text-neutral-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex flex-col items-center justify-center min-h-[180px]">
            {connecting ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 size={32} className="animate-spin text-[#00D4FF]" />
                <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Connecting…
                </span>
              </div>
            ) : token ? (
              <LiveKitRoom
                token={token}
                serverUrl={livekitUrl}
                connect={true}
                audio={true}
                video={false}
                onConnected={() => setHasConnected(true)}
                onDisconnected={handleRoomDisconnected}
                className="w-full h-full flex flex-col items-center"
              >
                <ActiveSessionUI agentLabel={currentAgent.label} />
                <RoomAudioRenderer />
              </LiveKitRoom>
            ) : (
              <div className="text-center">
                <p className="text-red-400 text-xs mb-3 font-semibold">Connection failed.</p>
                <button
                  onClick={connectToVoice}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-colors"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          {/* Footer tagline */}
          <div className="px-4 pb-4 text-center">
            <p className="text-[10px] text-neutral-600 font-medium">
              {currentAgent.tagline} · Powered by LiveKit + Gemini
            </p>
          </div>
        </div>
      )}
    </>
  );
}
