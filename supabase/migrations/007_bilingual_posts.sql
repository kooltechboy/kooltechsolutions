-- ============================================================
-- Migration 007: Bilingual Blog Support
-- Adds language tracking and translation linking to the posts table.
-- All existing posts automatically default to lang='en' with no
-- translated_from link. This is a non-destructive migration.
--
-- INSTRUCTIONS: Run this entire script in Supabase SQL Editor.
-- ============================================================

-- 1. Add language column (defaults existing posts to English)
--    Split into ADD COLUMN + ADD CONSTRAINT to avoid compatibility issues.
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS lang TEXT NOT NULL DEFAULT 'en';

-- Add check constraint separately (drop first if re-running)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_lang_check'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_lang_check CHECK (lang IN ('en', 'es'));
  END IF;
END $$;

-- 2. Add foreign key linking a translation to its original post
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS translated_from UUID DEFAULT NULL;

-- Add FK constraint separately (drop first if re-running)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_translated_from_fkey'
  ) THEN
    ALTER TABLE public.posts
      ADD CONSTRAINT posts_translated_from_fkey
        FOREIGN KEY (translated_from) REFERENCES public.posts(id)
        ON DELETE SET NULL;
  END IF;
END $$;

-- 3. Create indexes for fast language-filtered queries
CREATE INDEX IF NOT EXISTS idx_posts_lang ON public.posts(lang);
CREATE INDEX IF NOT EXISTS idx_posts_translated_from ON public.posts(translated_from);

-- 4. Replace the global slug uniqueness constraint with a per-language one.
--    This allows "my-article" to exist in both EN and ES as separate rows.
--    We need to drop ANY existing unique constraint/index on slug alone.
DO $$
DECLARE
  obj_name TEXT;
BEGIN
  -- FIRST: Drop any unique CONSTRAINT on slug (this also removes its backing index)
  FOR obj_name IN
    SELECT conname FROM pg_constraint
    WHERE conrelid = 'public.posts'::regclass
      AND contype = 'u'
      AND conname LIKE '%slug%'
      AND conname != 'posts_slug_lang_key'
  LOOP
    EXECUTE format('ALTER TABLE public.posts DROP CONSTRAINT IF EXISTS %I', obj_name);
    RAISE NOTICE 'Dropped unique constraint: %', obj_name;
  END LOOP;

  -- THEN: Drop any remaining standalone unique INDEX on just the slug column
  FOR obj_name IN
    SELECT i.relname
    FROM pg_index ix
    JOIN pg_class i ON i.oid = ix.indexrelid
    JOIN pg_class t ON t.oid = ix.indrelid
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
    WHERE t.relname = 'posts'
      AND ix.indisunique = true
      AND array_length(ix.indkey, 1) = 1
      AND a.attname = 'slug'
      AND i.relname != 'posts_slug_lang_key'
  LOOP
    EXECUTE format('DROP INDEX IF EXISTS public.%I', obj_name);
    RAISE NOTICE 'Dropped standalone unique index: %', obj_name;
  END LOOP;
END $$;

-- Create the new composite unique index (slug + lang)
CREATE UNIQUE INDEX IF NOT EXISTS posts_slug_lang_key ON public.posts(slug, lang);

-- 5. Verify the migration worked
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'posts'
    AND column_name IN ('lang', 'translated_from');

  IF col_count = 2 THEN
    RAISE NOTICE '✅ Migration 007 SUCCESS: lang and translated_from columns are present.';
  ELSE
    RAISE EXCEPTION '❌ Migration 007 FAILED: Expected 2 new columns, found %', col_count;
  END IF;
END $$;
