import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    // Verify admin auth
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const url = new URL(req.url);
    const sessionId = url.searchParams.get("sessionId");
    const search = url.searchParams.get("search") || "";
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);

    // ── If a specific session is requested, return full transcript ──────────
    if (sessionId) {
      const { data: transcript, error } = await supabase
        .from("agent_logs")
        .select("role, content, agent_name, created_at")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ sessionId, transcript: transcript || [] });
    }

    // ── Otherwise, list all unique sessions with metadata ───────────────────
    const { data: logs, error: logsError } = await supabase
      .from("agent_logs")
      .select("session_id, role, content, agent_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const allLogs = logs || [];

    // Group by session
    const sessionMap = new Map<
      string,
      {
        id: string;
        agent: string;
        messageCount: number;
        firstMessage: string;
        lastMessage: string;
        lastContent: string;
        firstUserMessage: string;
      }
    >();

    for (const log of allLogs) {
      const sid = log.session_id;
      if (!sessionMap.has(sid)) {
        sessionMap.set(sid, {
          id: sid,
          agent: log.agent_name || "Kira",
          messageCount: 0,
          firstMessage: log.created_at,
          lastMessage: log.created_at,
          lastContent: "",
          firstUserMessage: "",
        });
      }
      const session = sessionMap.get(sid)!;
      session.messageCount++;

      if (new Date(log.created_at) < new Date(session.firstMessage)) {
        session.firstMessage = log.created_at;
      }
      if (new Date(log.created_at) > new Date(session.lastMessage)) {
        session.lastMessage = log.created_at;
        session.lastContent = log.content?.substring(0, 100) || "";
      }
      if (log.role === "user" && !session.firstUserMessage) {
        session.firstUserMessage = log.content?.substring(0, 100) || "";
      }
    }

    let sessions = Array.from(sessionMap.values())
      .sort((a, b) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime());

    // Apply search filter
    if (search) {
      const q = search.toLowerCase();
      sessions = sessions.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.agent.toLowerCase().includes(q) ||
          s.firstUserMessage.toLowerCase().includes(q) ||
          s.lastContent.toLowerCase().includes(q)
      );
    }

    // Apply limit
    sessions = sessions.slice(0, limit);

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("[AI Sessions] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
