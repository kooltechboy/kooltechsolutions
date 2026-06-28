-- ============================================================
-- Migration 008: Future Scheduling Policy
-- Updates RLS on the posts table so that future-dated posts
-- are not accessible to public anonymous read queries.
-- ============================================================

-- 1. Drop existing public read policy
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.posts;

-- 2. Re-create public SELECT policy supporting scheduled publishing
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (
    status = 'Published' 
    AND (published_at IS NULL OR published_at <= NOW())
  );
