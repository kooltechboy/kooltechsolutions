import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantKnowledge, formatKnowledgeContext } from "@/lib/knowledge/retrieve";
import { createClient } from "@/utils/supabase/server";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { rateLimitError, unauthorizedError } from "@/lib/errors";


export async function POST(request: NextRequest) {
  // ── Rate limiting: 10 requests per IP per minute ──────────────────────────
  const ip = getClientIp(request);
  const rl = await rateLimit(`knowledge:${ip}`, { limit: 10, windowSecs: 60 });
  if (!rl.success) return rateLimitError(rl.resetAt);

  // ── Authentication ──────────────────────────────────────────────────────
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return unauthorizedError();

  try {
    const body = await request.json();
    const { query } = body;
    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query parameter is required" }, { status: 400 });
    }

    const chunks = await retrieveRelevantKnowledge(query, {
      matchCount: 3,
      threshold: 0.6,
    });

    const formatted = formatKnowledgeContext(chunks);

    return NextResponse.json({
      chunks,
      formatted,
    });
  } catch (err) {
    console.error("Knowledge retrieval endpoint error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
