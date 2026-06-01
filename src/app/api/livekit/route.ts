import { AccessToken } from "livekit-server-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get("room") || "kooltech-ai-lobby";
    const username = searchParams.get("username") || "Guest";

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "LiveKit credentials not configured" },
        { status: 500 }
      );
    }

    // Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    let finalUsername = username;
    let finalRoom = room;

    if (user && !authError) {
      // User is authenticated
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        finalUsername = `${profile.first_name} ${profile.last_name}`;
      } else {
        finalUsername = user.email?.split('@')[0] || "User";
      }

      // Automatically isolate authenticated users into their own secure room
      finalRoom = `secure-room-${user.id}`;
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: `${finalUsername}-${Math.floor(Math.random() * 10000)}`,
      name: finalUsername,
    });

    at.addGrant({
      roomJoin: true,
      room: finalRoom,
      canPublish: true,
      canSubscribe: true,
    });

    return NextResponse.json({ 
      token: await at.toJwt(),
      room: finalRoom 
    });
  } catch (error) {
    console.error("LiveKit Token generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}
