import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

async function generateToken(
  roomName: string,
  participantName: string,
  agentName: string
) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("LiveKit credentials not configured");
  }

  // Authenticate user
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  let finalUsername = participantName || "Visitor";
  let finalRoom = roomName || "kooltech-ai-lobby";

  if (user && !authError) {
    // User is authenticated
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name, role")
      .eq("id", user.id)
      .single();

    if (profile) {
      finalUsername = `${profile.first_name} ${profile.last_name}`;
    } else {
      finalUsername = user.email?.split("@")[0] || "User";
    }

    // Automatically isolate authenticated users into their own secure room
    finalRoom = `secure-room-${user.id}`;
  }

  const identity = `${finalUsername.replace(/\s+/g, "_")}-${Math.floor(Math.random() * 10000)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: finalUsername,
  });

  const metadata = JSON.stringify({
    agentName: agentName || "Kira",
  });

  at.addGrant({
    roomJoin: true,
    room: finalRoom,
    canPublish: true,
    canSubscribe: true,
  });

  at.metadata = metadata;

  return {
    token: await at.toJwt(),
    room: finalRoom,
    identity,
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomName, participantName, agentName } = body;
    const data = await generateToken(roomName, participantName, agentName);
    return NextResponse.json(data);
  } catch (error) {
    console.error("LiveKit Token generation POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const roomName = searchParams.get("room") || searchParams.get("roomName") || "kooltech-ai-lobby";
    const participantName = searchParams.get("username") || searchParams.get("participantName") || "Visitor";
    const agentName = searchParams.get("agent") || searchParams.get("agentName") || "Kira";

    const data = await generateToken(roomName, participantName, agentName);
    return NextResponse.json(data);
  } catch (error) {
    console.error("LiveKit Token generation GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to generate token" },
      { status: 500 }
    );
  }
}
