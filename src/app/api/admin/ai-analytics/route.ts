import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET() {
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

    // Fetch all logs from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: logs, error: logsError } = await supabase
      .from("agent_logs")
      .select("session_id, role, content, agent_name, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const allLogs = logs || [];

    // ── Compute analytics ─────────────────────────────────────────────────────

    // Unique sessions
    const sessionSet = new Set(allLogs.map((l) => l.session_id));
    const totalSessions = sessionSet.size;

    // Total messages
    const totalMessages = allLogs.length;
    const userMessages = allLogs.filter((l) => l.role === "user").length;
    const agentMessages = allLogs.filter((l) => l.role === "agent").length;

    // Messages per agent
    const agentCounts: Record<string, { user: number; agent: number; sessions: Set<string> }> = {};
    for (const log of allLogs) {
      const name = log.agent_name || "Unknown";
      if (!agentCounts[name]) {
        agentCounts[name] = { user: 0, agent: 0, sessions: new Set() };
      }
      agentCounts[name].sessions.add(log.session_id);
      if (log.role === "user") agentCounts[name].user++;
      else agentCounts[name].agent++;
    }

    const messagesPerAgent = Object.entries(agentCounts).map(([name, data]) => ({
      agent: name,
      userMessages: data.user,
      agentMessages: data.agent,
      totalMessages: data.user + data.agent,
      sessions: data.sessions.size,
    }));

    // Avg messages per session
    const avgMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

    // Today's stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = allLogs.filter((l) => new Date(l.created_at) >= todayStart);
    const todaySessions = new Set(todayLogs.map((l) => l.session_id)).size;
    const todayMessages = todayLogs.length;

    // Busiest hours (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = allLogs.filter((l) => new Date(l.created_at) >= sevenDaysAgo);
    const hourBuckets: number[] = new Array(24).fill(0);
    for (const log of recentLogs) {
      const hour = new Date(log.created_at).getHours();
      hourBuckets[hour]++;
    }
    const busiestHours = hourBuckets.map((count, hour) => ({
      hour: `${hour.toString().padStart(2, "0")}:00`,
      messages: count,
    }));

    // Tool executions (look for tool-related content in agent messages)
    const toolKeywords = ["Demo booked successfully", "Ticket created successfully", "booked slots", "Ticket"];
    const toolExecutions = allLogs
      .filter(
        (l) =>
          l.role === "agent" &&
          toolKeywords.some((kw) => l.content?.toLowerCase().includes(kw.toLowerCase()))
      )
      .slice(0, 10)
      .map((l) => ({
        sessionId: l.session_id,
        agent: l.agent_name,
        content: l.content.substring(0, 120),
        timestamp: l.created_at,
      }));

    // Bookings triggered (approximate)
    const bookingsTriggered = allLogs.filter(
      (l) => l.role === "agent" && l.content?.toLowerCase().includes("demo booked successfully")
    ).length;

    const ticketsCreated = allLogs.filter(
      (l) => l.role === "agent" && l.content?.toLowerCase().includes("ticket created successfully")
    ).length;

    return NextResponse.json({
      totalSessions,
      totalMessages,
      userMessages,
      agentMessages,
      avgMessagesPerSession,
      todaySessions,
      todayMessages,
      bookingsTriggered,
      ticketsCreated,
      messagesPerAgent,
      busiestHours,
      toolExecutions,
    });
  } catch (err) {
    console.error("[AI Analytics] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
