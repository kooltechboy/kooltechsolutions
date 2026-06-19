import { NextRequest, NextResponse } from "next/server";
import { retrieveRelevantKnowledge, formatKnowledgeContext } from "@/lib/knowledge/retrieve";

export async function POST(request: NextRequest) {
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
      { error: err instanceof Error ? err.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
