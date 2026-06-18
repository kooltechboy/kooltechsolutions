-- ============================================================
-- Migration 006: AI Chat Schema (Persistent AI Sessions)
-- ============================================================

-- ── AI Chats Table ─────────────────────────────────────────────────────────────
-- Represents persistent chat sessions associated with authenticated users.
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  context_type TEXT CHECK (context_type IN ('ticket', 'invoice', 'service', 'general')),
  context_id   TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast user-specific chat retrievals
CREATE INDEX IF NOT EXISTS ai_chats_user_id_idx ON public.ai_chats(user_id);

-- ── AI Messages Table ──────────────────────────────────────────────────────────
-- Represents individual messages within a persistent chat session.
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id      UUID NOT NULL REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  role         TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content      TEXT NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index for fast message retrieval in a chat
CREATE INDEX IF NOT EXISTS ai_messages_chat_id_idx ON public.ai_messages(chat_id);

-- ── RLS (Row Level Security) ───────────────────────────────────────────────────
ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

-- ── Policies for public.ai_chats ───────────────────────────────────────────────
CREATE POLICY "Users can view their own chats"
  ON public.ai_chats FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
  ON public.ai_chats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
  ON public.ai_chats FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
  ON public.ai_chats FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- ── Policies for public.ai_messages ────────────────────────────────────────────
CREATE POLICY "Users can view messages in their own chats"
  ON public.ai_messages FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.ai_chats
      WHERE public.ai_chats.id = public.ai_messages.chat_id
      AND public.ai_chats.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert messages in their own chats"
  ON public.ai_messages FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.ai_chats
      WHERE public.ai_chats.id = public.ai_messages.chat_id
      AND public.ai_chats.user_id = auth.uid()
    )
  );

-- Admin & Service Role access (override RLS)
CREATE POLICY "Admins full access to chats"
  ON public.ai_chats FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Admins full access to messages"
  ON public.ai_messages FOR ALL TO service_role
  USING (true) WITH CHECK (true);
