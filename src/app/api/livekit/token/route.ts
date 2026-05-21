import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const { roomName, participantName, agentName } = await req.json();

    if (!roomName || !participantName) {
      return NextResponse.json({ error: 'Missing roomName or participantName' }, { status: 400 });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json({ error: 'LiveKit credentials are not configured' }, { status: 500 });
    }

    // You might do auth checks here if it's Cortex or Nexus.
    // We pass agentName as metadata so the agent process knows who to be.

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
      metadata: JSON.stringify({ agentName: agentName ?? 'Kira' }),
    });

    at.addGrant({ roomJoin: true, room: roomName, canPublish: true, canSubscribe: true });

    return NextResponse.json({ token: await at.toJwt() });
  } catch (err) {
    console.error("LiveKit token error:", err);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
