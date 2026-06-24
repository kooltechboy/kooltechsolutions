-- ============================================================
-- Migration 007: Bilingual Blog Support
-- Adds language tracking and translation linking to the posts table.
-- All existing posts automatically default to lang='en' with no
-- translated_from link. This is a non-destructive migration.
-- ============================================================

-- 1. Add language column (defaults existing posts to English)
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'en'
    CHECK (lang IN ('en', 'es'));

-- 2. Add foreign key linking a translation to its original post
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS translated_from UUID REFERENCES public.posts(id)
    ON DELETE SET NULL;

-- 3. Create indexes for fast language-filtered queries
CREATE INDEX IF NOT EXISTS idx_posts_lang ON public.posts(lang);
CREATE INDEX IF NOT EXISTS idx_posts_translated_from ON public.posts(translated_from);

-- 4. Replace the global slug uniqueness constraint with a per-language one.
--    This allows the same concept to have different slugs in EN vs ES.
--    We use a unique index instead of a constraint for IF NOT EXISTS support.
--    First, drop the old constraint if it exists (safe: no-op if already gone).
DO $$
BEGIN
  -- Try dropping the old unique constraint on slug alone
  IF EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'posts' AND indexname = 'posts_slug_key'
  ) THEN
    DROP INDEX public.posts_slug_key;
  END IF;
END $$;

-- Create the new composite unique index (slug + lang)
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_lang_key ON public.posts(slug, lang);
