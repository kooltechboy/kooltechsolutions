-- ============================================================
-- Migration 001: Knowledge Base (pgvector RAG)
-- Run in Supabase SQL Editor BEFORE starting the agent
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ── Knowledge Chunks Table ────────────────────────────────────────────────────
-- Stores embedded text chunks from service catalog, FAQ, and policy docs.
-- Used by all agents for Retrieval-Augmented Generation (RAG).

CREATE TABLE IF NOT EXISTS public.knowledge_chunks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source       TEXT NOT NULL CHECK (source IN ('service_catalog', 'faq', 'policy', 'blog', 'custom')),
  category     TEXT,
  title        TEXT NOT NULL,
  content      TEXT NOT NULL,
  embedding    vector(768),    -- Google text-embedding-004 produces 768-dim vectors
  metadata     JSONB DEFAULT '{}',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint to support upsert on re-seeding
CREATE UNIQUE INDEX IF NOT EXISTS knowledge_chunks_title_source_idx
  ON public.knowledge_chunks (title, source);

-- IVFFlat index for fast approximate cosine similarity search
-- NOTE: Create AFTER inserting initial data for better index quality
-- You can also use: CREATE INDEX ... USING hnsw (embedding vector_cosine_ops)
CREATE INDEX IF NOT EXISTS knowledge_chunks_embedding_idx
  ON public.knowledge_chunks USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- ── Similarity Search Function ────────────────────────────────────────────────
-- Called by src/lib/knowledge/retrieve.ts via supabase.rpc()

CREATE OR REPLACE FUNCTION match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.65,
  match_count     int   DEFAULT 5,
  source_filter   text  DEFAULT NULL
)
RETURNS TABLE (
  id         UUID,
  source     TEXT,
  category   TEXT,
  title      TEXT,
  content    TEXT,
  metadata   JSONB,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    kc.id,
    kc.source,
    kc.category,
    kc.title,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_chunks kc
  WHERE
    -- Cosine similarity threshold
    1 - (kc.embedding <=> query_embedding) > match_threshold
    -- Optional source filter (e.g. 'service_catalog' only)
    AND (source_filter IS NULL OR kc.source = source_filter)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) bypasses RLS for retrieval
CREATE POLICY "Service role full access to knowledge_chunks"
  ON public.knowledge_chunks FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated admins can manage knowledge chunks
CREATE POLICY "Admin full access to knowledge_chunks"
  ON public.knowledge_chunks FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- ── Agent Sessions Table ───────────────────────────────────────────────────────
-- Tracks active voice/text sessions for the admin live dashboard.

CREATE TABLE IF NOT EXISTS public.agent_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      TEXT UNIQUE NOT NULL,
  agent_name      TEXT NOT NULL DEFAULT 'Kira',
  channel         TEXT NOT NULL DEFAULT 'text' CHECK (channel IN ('text', 'voice')),
  status          TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'escalated', 'closed', 'idle')),
  user_name       TEXT,
  user_email      TEXT,
  user_ip         TEXT,
  page_context    TEXT,
  message_count   INT DEFAULT 0,
  escalation_id   UUID,
  started_at      TIMESTAMPTZ DEFAULT NOW(),
  last_active_at  TIMESTAMPTZ DEFAULT NOW(),
  closed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS agent_sessions_status_idx ON public.agent_sessions (status);
CREATE INDEX IF NOT EXISTS agent_sessions_session_id_idx ON public.agent_sessions (session_id);

ALTER TABLE public.agent_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to agent_sessions"
  ON public.agent_sessions FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to agent_sessions"
  ON public.agent_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ── Escalations Table ─────────────────────────────────────────────────────────
-- Records human escalation events with full conversation context.

CREATE TABLE IF NOT EXISTS public.escalations (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id          TEXT NOT NULL,
  agent_name          TEXT NOT NULL,
  reason              TEXT NOT NULL,
  priority            TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  summary             TEXT,
  conversation_context TEXT,
  user_name           TEXT,
  user_email          TEXT,
  user_phone          TEXT,
  status              TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'claimed', 'resolved')),
  claimed_by          UUID REFERENCES auth.users(id),
  claimed_at          TIMESTAMPTZ,
  resolved_at         TIMESTAMPTZ,
  ticket_id           UUID,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS escalations_status_idx ON public.escalations (status);
CREATE INDEX IF NOT EXISTS escalations_priority_idx ON public.escalations (priority);
CREATE INDEX IF NOT EXISTS escalations_created_at_idx ON public.escalations (created_at DESC);

ALTER TABLE public.escalations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access to escalations"
  ON public.escalations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to escalations"
  ON public.escalations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Enable Realtime for live admin dashboard notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.escalations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_sessions;
