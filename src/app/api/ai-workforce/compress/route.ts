/**
 * POST /api/ai-workforce/compress
 *
 * Called by the client-side chat widget when the message list exceeds the
 * MAX_MESSAGES_BEFORE_COMPRESS threshold (15 user+assistant turns).
 *
 * It condenses the oldest N messages into a single "Summary" assistant message,
 * which is then returned to the client. The client replaces its local state
 * with [systemSummaryMsg, ...recentMessages] so the context window stays small.
 *
 * Authentication is NOT required — the session is identified by sessionId.
 * Rate-limited to 10 compressions per IP per hour.
 */

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { rateLimitAsync, getClientIp } from "@/lib/rateLimit";
import { rateLimitError, serverError } from "@/lib/errors";
import { z } from "zod";

export const runtime = "nodejs";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().max(8000),
});

const compressSchema = z.object({
  sessionId: z.string().max(200),
  agentName: z.string().max(50),
  messages: z.array(messageSchema).min(6).max(200),
});

export async function POST(req: Request) {
  // ── Rate limiting ─────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rl = await rateLimitAsync(`ai-compress:${ip}`, {
    limit: 10,
    windowSecs: 60 * 60,
  });
  if (!rl.success) return rateLimitError(rl.resetAt);

  try {
    const body = await req.json();
    const parsed = compressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { agentName, messages } = parsed.data;

    // Keep the last 6 messages as-is; summarize everything before them.
    const KEEP_RECENT = 6;
    const toSummarize = messages.slice(0, messages.length - KEEP_RECENT);
    const recent = messages.slice(messages.length - KEEP_RECENT);

    if (toSummarize.length === 0) {
      // Nothing old enough to summarize
      return NextResponse.json({ compressed: false });
    }

    const transcript = toSummarize
      .filter((m) => m.role !== "system")
      .map((m) => `${m.role === "user" ? "User" : agentName}: ${m.content}`)
      .join("\n");

    const { text: summary } = await generateText({
      model: google("gemini-2.0-flash") as any,
      system: `You are a concise note-taker. Summarize the following conversation segment between a user and ${agentName} (a KoolTech Solutions AI agent) into 3-5 bullet points. Preserve: key facts (name, email, service interest, any booking details), unresolved questions, and the user's sentiment. Use plain text only. Start each bullet with "• ".`,
      prompt: transcript,
    });

    // Build the replacement message that stands in for the summarized history
    const summaryMessage = {
      id: `summary-${Date.now()}`,
      role: "assistant" as const,
      content: `[Conversation context so far — ${toSummarize.length} earlier messages compressed]\n${summary}`,
      createdAt: new Date(),
    };

    return NextResponse.json({
      compressed: true,
      summaryMessage,
      recentMessages: recent,
    });
  } catch (err) {
    return serverError(err, "ai-compress");
  }
}
