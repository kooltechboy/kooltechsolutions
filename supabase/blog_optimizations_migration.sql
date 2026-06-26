-- ============================================================
-- KoolTech Solutions: Blog Optimizations Migration
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Add advanced SEO, scheduling, and taxonomy columns to posts
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- 2. Backfill published_at with created_at for existing published posts
UPDATE public.posts
  SET published_at = created_at
  WHERE status = 'Published' AND published_at IS NULL;

-- 3. (Optional) If you want to drop the 'category' constraint later to favor tags entirely,
--    you can do it here, but for now we keep 'category' as the primary bucket and 'tags' as secondary.
