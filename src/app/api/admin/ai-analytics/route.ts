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

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Fetch all logs from the last 30 days
    const { data: logs, error: logsError } = await supabase
      .from("agent_logs")
      .select("session_id, role, content, agent_name, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (logsError) {
      return NextResponse.json({ error: logsError.message }, { status: 500 });
    }

    const allLogs = logs || [];

    // Fetch sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from("agent_sessions")
      .select("*")
      .gte("started_at", thirtyDaysAgo.toISOString());

    if (sessionsError) {
      return NextResponse.json({ error: sessionsError.message }, { status: 500 });
    }

    const allSessions = sessions || [];

    // Fetch bookings from AI
    const { data: aiBookings } = await supabase
      .from("bookings")
      .select("id")
      .eq("booked_via", "ai_agent");

    // ── Per-Agent Metrics ───────────────────────────────────────────────────
    const agentMetrics: Record<string, {
      totalSessions: number;
      totalMessages: number;
      totalDurationSecs: number;
      escalations: number;
      compressionEvents: number;
    }> = {};

    const agents = ["kira", "aria", "cortex", "max", "nexus"];
    agents.forEach((agent) => {
      agentMetrics[agent] = {
        totalSessions: 0,
        totalMessages: 0,
        totalDurationSecs: 0,
        escalations: 0,
        compressionEvents: 0,
      };
    });

    // Populate from agent_sessions
    allSessions.forEach((sess) => {
      const agentKey = sess.agent_name.toLowerCase();
      if (!agentMetrics[agentKey]) {
        agentMetrics[agentKey] = {
          totalSessions: 0,
          totalMessages: 0,
          totalDurationSecs: 0,
          escalations: 0,
          compressionEvents: 0,
        };
      }
      const metrics = agentMetrics[agentKey];
      metrics.totalSessions++;
      metrics.totalMessages += sess.message_count || 0;
      
      const start = new Date(sess.started_at).getTime();
      const end = new Date(sess.last_active_at).getTime();
      metrics.totalDurationSecs += Math.max(0, (end - start) / 1000);

      if (sess.status === "escalated" || sess.escalation_id) {
        metrics.escalations++;
      }
    });

    // Count compression events from logs
    allLogs.forEach((log) => {
      const agentKey = (log.agent_name || "kira").toLowerCase();
      if (agentMetrics[agentKey]) {
        if (log.content?.includes("earlier messages compressed") || log.content?.includes("Conversation context so far")) {
          agentMetrics[agentKey].compressionEvents++;
        }
      }
    });

    const perAgentStats = Object.entries(agentMetrics).map(([name, data]) => {
      const avgLengthSecs = data.totalSessions > 0 ? Math.round(data.totalDurationSecs / data.totalSessions) : 0;
      const escalationRate = data.totalSessions > 0 ? Math.round((data.escalations / data.totalSessions) * 100) : 0;
      return {
        agent: name.charAt(0).toUpperCase() + name.slice(1),
        totalSessions: data.totalSessions,
        avgSessionLength: `${Math.floor(avgLengthSecs / 60)}m ${avgLengthSecs % 60}s`,
        escalationRate: `${escalationRate}%`,
        compressionEvents: data.compressionEvents,
      };
    });

    // ── 7-Day Trend Chart ────────────────────────────────────────────────────
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]);
    }

    const trendData = dates.map((date) => {
      const daySessions = allSessions.filter((s) => s.started_at.split("T")[0] === date);
      const row: Record<string, any> = { date };
      agents.forEach((agent) => {
        const nameCapitalized = agent.charAt(0).toUpperCase() + agent.slice(1);
        row[nameCapitalized] = daySessions.filter((s) => s.agent_name.toLowerCase() === agent).length;
      });
      return row;
    });

    // ── Top Questions/Intents ───────────────────────────────────────────────
    const intentCounts: Record<string, number> = {
      "Pricing Inquiries": 0,
      "Booking & Demos": 0,
      "Technical Support": 0,
      "Services Catalog": 0,
      "General Info / Greeting": 0,
      "ITFlow Sync & Integrations": 0,
    };

    allLogs.forEach((log) => {
      if (log.role === "user" && log.content) {
        const text = log.content.toLowerCase();
        if (text.includes("price") || text.includes("cost") || text.includes("billing") || text.includes("pricing")) {
          intentCounts["Pricing Inquiries"]++;
        } else if (text.includes("book") || text.includes("demo") || text.includes("schedule") || text.includes("calendar")) {
          intentCounts["Booking & Demos"]++;
        } else if (text.includes("support") || text.includes("error") || text.includes("ticket") || text.includes("issue") || text.includes("fix") || text.includes("help")) {
          intentCounts["Technical Support"]++;
        } else if (text.includes("service") || text.includes("offer") || text.includes("what do you do") || text.includes("capabilities")) {
          intentCounts["Services Catalog"]++;
        } else if (text.includes("itflow") || text.includes("sync") || text.includes("integrate") || text.includes("api")) {
          intentCounts["ITFlow Sync & Integrations"]++;
        } else {
          intentCounts["General Info / Greeting"]++;
        }
      }
    });

    const topIntents = Object.entries(intentCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // ── Basic Stats ─────────────────────────────────────────────────────────
    const totalSessions = new Set(allLogs.map((l) => l.session_id)).size;
    const totalMessages = allLogs.length;
    const avgMessagesPerSession = totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayLogs = allLogs.filter((l) => new Date(l.created_at) >= todayStart);
    const todaySessions = new Set(todayLogs.map((l) => l.session_id)).size;
    const todayMessages = todayLogs.length;

    return NextResponse.json({
      totalSessions,
      totalMessages,
      avgMessagesPerSession,
      todaySessions,
      todayMessages,
      bookingsTriggered: aiBookings?.length || 0,
      ticketsCreated: allLogs.filter(
        (l) => l.role === "agent" && l.content?.toLowerCase().includes("ticket created successfully")
      ).length,
      perAgentStats,
      trendData,
      topIntents,
    });
  } catch (err) {
    console.error("[AI Analytics] Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
