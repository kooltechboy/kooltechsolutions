import { NextResponse } from "next/server";
import { SipClient } from "livekit-server-sdk";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError, serverError, unauthorizedError } from "@/lib/errors";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });


const sipCallSchema = z.object({
  phoneNumber: z.string().regex(/^\+[1-9]\d{7,14}$/, "Must be E.164 format (e.g. +18095551234)"),
  agentName: z.enum(["Kira", "Aria", "Max", "Cortex"]).default("Kira"),
  sipTrunkId: z.string().optional(),
});

export async function POST(request: Request) {
  // ── Admin-only — verify authentication ────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return unauthorizedError();

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim());
  if (!adminEmails.includes(user.email ?? "")) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(request);
  const rl = rateLimit(`sip-call:${user.id}`, { limit: 10, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const body = await request.json();
    const parsed = sipCallSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { phoneNumber, agentName, sipTrunkId } = parsed.data;

    const apiKey    = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL ?? process.env.NEXT_PUBLIC_LIVEKIT_URL ?? "";
    const trunkId   = sipTrunkId ?? process.env.LIVEKIT_SIP_TRUNK_ID;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    if (!trunkId) {
      return NextResponse.json(
        { error: "No SIP trunk configured. Set LIVEKIT_SIP_TRUNK_ID in your environment or pass sipTrunkId in the request." },
        { status: 400 }
      );
    }

    // Generate unique room name for this outbound call
    const roomName = `outbound-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const participantIdentity = `sip-${phoneNumber.replace(/\D/g, "")}-${Math.random().toString(36).slice(2, 6)}`;

    const sipClient = new SipClient(livekitUrl, apiKey, apiSecret);

    const participant = await sipClient.createSipParticipant(trunkId, phoneNumber, roomName, {
      participantIdentity,
      participantName: phoneNumber,
      participantMetadata: JSON.stringify({ agentName }),
      playDialtone: true,
    });

    // Log the outbound call attempt
    console.log(`[SIP] Outbound call initiated: ${phoneNumber} → room:${roomName} | agent:${agentName}`);

    return NextResponse.json({
      success: true,
      roomName,
      participantIdentity: participant.participantIdentity,
      phoneNumber,
      agentName,
      message: `Outbound call to ${phoneNumber} initiated. The AI agent will join automatically.`,
    });
  } catch (err) {
    return serverError(err, "sip-outbound-call");
  }
}
