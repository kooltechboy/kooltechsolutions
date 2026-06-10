import { AccessToken, AgentDispatchClient } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError } from "@/lib/errors";
import { createClient } from "@/utils/supabase/server";

// ── Allowed agent names (security allowlist) ──────────────────────────────────
// Prevents clients from injecting arbitrary agentName values.
// Cortex and Nexus additionally require an authenticated session.
const PUBLIC_AGENTS = ["Kira", "Aria", "Max"] as const;
const AUTH_REQUIRED_AGENTS = ["Cortex", "Nexus"] as const;
const ALL_ALLOWED_AGENTS = [...PUBLIC_AGENTS, ...AUTH_REQUIRED_AGENTS] as const;
type AllowedAgent = (typeof ALL_ALLOWED_AGENTS)[number];

function isAllowedAgent(name: unknown): name is AllowedAgent {
  return typeof name === "string" && (ALL_ALLOWED_AGENTS as readonly string[]).includes(name);
}

function isAuthRequiredAgent(name: string): boolean {
  return (AUTH_REQUIRED_AGENTS as readonly string[]).includes(name);
}

export async function POST(req: Request) {
  // ── Rate limiting: 20 token requests per IP per minute ────────────────────
  const ip = getClientIp(req);
  const rl = rateLimit(`livekit-token:${ip}`, { limit: 20, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const body = await req.json();
    const { roomName, participantName, agentName: rawAgentName } = body;

    // ── Input validation ──────────────────────────────────────────────────────
    if (!roomName || typeof roomName !== "string" || roomName.length > 200) {
      return NextResponse.json({ error: "Invalid roomName" }, { status: 400 });
    }
    if (!participantName || typeof participantName !== "string") {
      return NextResponse.json({ error: "Missing participantName" }, { status: 400 });
    }

    // ── Agent name allowlist check (Security: GAP-10 fix) ────────────────────
    const agentName: AllowedAgent = isAllowedAgent(rawAgentName)
      ? rawAgentName
      : "Kira"; // Default to Kira if invalid/missing

    // ── Auth-gated agents: Cortex and Nexus require a valid session ──────────
    if (isAuthRequiredAgent(agentName)) {
      const supabase = await createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        return NextResponse.json(
          { error: "Authentication required for this agent" },
          { status: 401 }
        );
      }
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "LiveKit credentials are not configured" },
        { status: 500 }
      );
    }

    // ── Generate JWT token for the visitor participant ─────────────────────────
    const at = new AccessToken(apiKey, apiSecret, {
      identity: `${participantName}-${Date.now()}`,
      name: participantName,
      // Pass agentName as participant metadata so the agent worker knows which persona to use
      metadata: JSON.stringify({ agentName }),
    });

    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();

    // ── Agent auto-dispatch (GAP-02 fix) ──────────────────────────────────────
    // After generating the visitor token, dispatch the agent worker to the room.
    // This is fire-and-forget — we do not fail the token request if dispatch fails.
    // The LiveKit worker must be running (npm run agent / PM2) for this to work.
    try {
      const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
      await dispatchClient.createDispatch(roomName, "kooltech-workforce", {
        metadata: JSON.stringify({ agentName }),
      });
    } catch (dispatchErr) {
      // Log but do not fail — visitor can still join, agent may already be in the room
      console.warn(
        `[LiveKit Dispatch] Failed to dispatch agent to room ${roomName}:`,
        dispatchErr instanceof Error ? dispatchErr.message : dispatchErr
      );
    }

    return NextResponse.json({ token, agentName });
  } catch (err) {
    console.error("[LiveKit Token] Error:", err);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}
