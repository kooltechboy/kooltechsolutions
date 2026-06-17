"use client";

import { useState } from "react";
import { Phone, PhoneOff, Loader2, Mic } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  BarVisualizer,
  useVoiceAssistant,
} from "@livekit/components-react";
import "@livekit/components-styles";

// ── Agent config ──────────────────────────────────────────────────────────────
interface AgentConfig {
  name: string;
  role: string;
  color: string;
}

const DEFAULT_AGENT: AgentConfig = {
  name: "Kira",
  role: "Executive Concierge",
  color: "#00D4FF",
};

// ── Voice panel that renders inside the LiveKitRoom context ──────────────────
function VoicePanelUI({
  agent,
  onEnd,
}: {
  agent: AgentConfig;
  onEnd: () => void;
}) {
  const { state, audioTrack } = useVoiceAssistant();

  const statusLabel =
    state === "listening"
      ? "Listening…"
      : state === "speaking"
      ? `${agent.name} is speaking…`
      : state === "connecting"
      ? "Connecting…"
      : "Connected — speak anytime";

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Visualizer ring */}
      <div
        className="relative w-28 h-28 rounded-full flex items-center justify-center border-2"
        style={{
          borderColor: `${agent.color}40`,
          boxShadow: `0 0 40px ${agent.color}25`,
        }}
      >
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: agent.color }}
        />
        <BarVisualizer
          state={state}
          barCount={5}
          trackRef={audioTrack}
          options={{ minHeight: 8 }}
          style={{ width: "60%", height: "50%" }}
        />
      </div>

      {/* Status */}
      <div className="text-center space-y-1">
        <p
          className="text-xs font-black uppercase tracking-[0.2em]"
          style={{ color: agent.color }}
        >
          {statusLabel}
        </p>
        <p className="text-[10px] text-slate-500">
          {agent.name} · {agent.role}
        </p>
      </div>

      {/* Controls */}
      <VoiceAssistantControlBar />

      {/* End call */}
      <button
        onClick={onEnd}
        className="mt-2 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/20 transition-all"
      >
        <PhoneOff size={14} />
        End Call
      </button>
    </div>
  );
}

// ── Main exported component ───────────────────────────────────────────────────

interface CallNowButtonProps {
  /** LiveKit agent persona to connect */
  agent?: AgentConfig;
  /** Button display variant */
  variant?: "pill" | "icon" | "banner";
  /** Extra className forwarded to the trigger button */
  className?: string;
  /** Optional custom label */
  label?: string;
}

export default function CallNowButton({
  agent = DEFAULT_AGENT,
  variant = "pill",
  className = "",
  label,
}: CallNowButtonProps) {
  const [phase, setPhase] = useState<"idle" | "loading" | "live">("idle");
  const [token, setToken] = useState("");
  const [roomName, setRoomName] = useState("");

  const handleCall = async () => {
    if (phase === "live") {
      setPhase("idle");
      setToken("");
      return;
    }
    setPhase("loading");
    try {
      const room = `call-${agent.name.toLowerCase()}-${crypto.randomUUID().slice(0, 8)}`;
      setRoomName(room);

      const res = await fetch("/api/livekit/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room,
          participantName: "Visitor",
          agentName: agent.name,
        }),
      });

      const data = await res.json();
      if (!data.token) throw new Error(data.error ?? "Token unavailable");
      setToken(data.token);
      setPhase("live");
    } catch (err) {
      console.error("[CallNow] Error:", err);
      setPhase("idle");
    }
  };

  const handleEnd = () => {
    setPhase("idle");
    setToken("");
    setRoomName("");
  };

  // ── Trigger button styles ────────────────────────────────────────────────
  const triggerBase =
    "relative flex items-center gap-2.5 font-bold transition-all duration-200 active:scale-95 cursor-pointer select-none";

  const variants = {
    pill: `${triggerBase} px-6 py-3 rounded-full text-sm shadow-xl border`,
    icon: `${triggerBase} w-14 h-14 rounded-2xl justify-center shadow-lg border`,
    banner: `${triggerBase} px-8 py-4 rounded-2xl text-base shadow-2xl border w-full justify-center`,
  };

  const idleStyle = {
    background: `linear-gradient(135deg, ${agent.color}22, ${agent.color}10)`,
    borderColor: `${agent.color}40`,
    color: agent.color,
    boxShadow: `0 8px 32px ${agent.color}20`,
  };

  const liveStyle = {
    background: "rgba(239,68,68,0.12)",
    borderColor: "rgba(239,68,68,0.3)",
    color: "#f87171",
    boxShadow: "0 8px 32px rgba(239,68,68,0.15)",
  };

  const loadingStyle = {
    background: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.1)",
    color: "#94a3b8",
  };

  const currentStyle =
    phase === "loading" ? loadingStyle : phase === "live" ? liveStyle : idleStyle;

  const displayLabel =
    label ??
    (phase === "loading"
      ? "Connecting…"
      : phase === "live"
      ? "End Call"
      : "Call Now");

  return (
    <>
      {/* Trigger */}
      <button
        id={`call-now-${agent.name.toLowerCase()}`}
        onClick={handleCall}
        disabled={phase === "loading"}
        className={`${variants[variant]} ${className}`}
        style={currentStyle}
        aria-label={`${displayLabel} with ${agent.name}`}
      >
        {phase === "loading" ? (
          <Loader2 size={18} className="animate-spin" />
        ) : phase === "live" ? (
          <PhoneOff size={18} />
        ) : (
          <Phone size={18} />
        )}
        {variant !== "icon" && (
          <span>{displayLabel}</span>
        )}
        {variant === "icon" && phase === "idle" && (
          <span className="sr-only">Call {agent.name}</span>
        )}
        {/* Pulse ring when live */}
        {phase === "live" && (
          <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-red-400 border-2 border-slate-900">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
          </span>
        )}
      </button>

      {/* Voice panel modal */}
      <AnimatePresence>
        {phase === "live" && token && (
          <motion.div
            key="voice-modal"
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-28 right-28 z-[99998] w-[300px] rounded-3xl border border-white/10 p-6 shadow-2xl overflow-hidden"
            style={{
              background: "rgba(10,22,45,0.97)",
              backdropFilter: "blur(24px)",
              boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 40px ${agent.color}15`,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${agent.color}20`, color: agent.color }}
                >
                  <Mic size={16} />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-none mb-0.5">
                    {agent.name}
                  </p>
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest font-bold">
                    Live Voice
                  </p>
                </div>
              </div>
              <div
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: agent.color }}
              />
            </div>

            {/* LiveKit Room */}
            <LiveKitRoom
              serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
              token={token}
              connect={true}
              audio={true}
              video={false}
            >
              <VoicePanelUI agent={agent} onEnd={handleEnd} />
              <RoomAudioRenderer />
            </LiveKitRoom>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
