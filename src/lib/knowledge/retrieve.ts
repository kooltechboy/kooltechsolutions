/**
 * Knowledge Retrieval — pgvector Similarity Search
 *
 * Queries the `knowledge_chunks` table in Supabase using cosine similarity
 * against a query embedding. This is the RAG retrieval layer that grounds
 * all agent responses in verified documentation.
 *
 * Requires: Supabase pgvector extension + knowledge_chunks table
 * (run supabase/migrations/001_knowledge_base.sql first)
 */

import { createClient } from "@supabase/supabase-js";
import { embed } from "ai";
import { google } from "@ai-sdk/google";

// Use service role key for server-side retrieval (bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export interface KnowledgeChunk {
  id: string;
  source: string;       // 'service_catalog' | 'faq' | 'policy' | 'blog'
  category: string;
  title: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

export interface RetrievalOptions {
  matchCount?: number;    // Number of chunks to retrieve (default: 5)
  threshold?: number;     // Cosine similarity threshold 0–1 (default: 0.65)
  sourceFilter?: string;  // Restrict to a specific source type
}

/**
 * Retrieve the most relevant knowledge chunks for a given query.
 * Returns an empty array (not an error) when no relevant chunks are found —
 * agents must handle this by using the mandatory fallback phrase.
 */
export async function retrieveRelevantKnowledge(
  query: string,
  options: RetrievalOptions = {}
): Promise<KnowledgeChunk[]> {
  const {
    matchCount = 5,
    threshold = 0.65,
    sourceFilter,
  } = options;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn("[Knowledge Retrieval] Supabase credentials not configured");
    return [];
  }

  if (!query?.trim()) return [];

  try {
    // Generate embedding for the user's query using Google gemini-embedding-2
    const { embedding } = await embed({
      model: google.textEmbeddingModel("gemini-embedding-2"),
      value: query.slice(0, 2000), // Trim extremely long queries
      providerOptions: {
        google: {
          outputDimensionality: 768,
        },
      },
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call the match_knowledge_chunks stored procedure
    const { data, error } = await supabase.rpc("match_knowledge_chunks", {
      query_embedding: embedding,
      match_threshold: threshold,
      match_count: matchCount,
      source_filter: sourceFilter ?? null,
    });

    if (error) {
      console.error("[Knowledge Retrieval] RPC error:", error.message);
      return [];
    }

    return (data as KnowledgeChunk[]) ?? [];
  } catch (err) {
    // Fail open — log error but don't crash the agent response
    console.error("[Knowledge Retrieval] Unexpected error:", err);
    return [];
  }
}

/**
 * Format retrieved chunks into a clean context block for injection
 * into the LLM system prompt.
 *
 * Returns empty string if no chunks, which signals the agent to use
 * the mandatory fallback phrase.
 */
export function formatKnowledgeContext(chunks: KnowledgeChunk[]): string {
  if (!chunks || chunks.length === 0) return "";

  const chunkBlocks = chunks.map(
    (c) =>
      `[SOURCE: ${c.source.toUpperCase()} | ${c.title}]\n${c.content}`
  );

  return [
    "",
    "## RETRIEVED KNOWLEDGE BASE — VERIFIED CONTEXT",
    "The following information has been retrieved from KoolTech's official",
    "documentation. Answer ONLY using this context. Do not add, infer, or",
    "extrapolate beyond what is stated here.",
    "",
    chunkBlocks.join("\n\n---\n\n"),
    "",
    "## END OF RETRIEVED CONTEXT",
    "",
  ].join("\n");
}

/**
 * Mandatory fallback phrase to use when no relevant context is retrieved.
 * Agents MUST use this exact phrasing to maintain brand consistency.
 */
export const KNOWLEDGE_FALLBACK_TEXT =
  "I want to make sure you have accurate information on that. " +
  "I don't have the specific details readily available right now. " +
  "Let me connect you with one of our specialists who can give you the " +
  "exact answer — would you prefer a quick call or an email follow-up?";

export const KNOWLEDGE_FALLBACK_VOICE =
  "That's a great question and I want to be precise with you. " +
  "Rather than guessing, let me get one of our specialists on that. " +
  "Can I take your contact info and have them reach out directly?";
