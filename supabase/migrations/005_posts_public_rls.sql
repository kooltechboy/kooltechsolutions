-- ============================================================
-- Migration 005: Posts Public Row-Level Security
-- Enables RLS on the posts table and allows anonymous/public
-- read access to published articles. Also establishes recursion-free
-- admin access policy via a helper function.
-- ============================================================

-- 1. Enable Row Level Security on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.posts;
DROP POLICY IF EXISTS "Admin full access to posts" ON public.posts;
DROP POLICY IF EXISTS "Service role full access to posts" ON public.posts;
DROP POLICY IF EXISTS "Allow public read access to published posts" ON public.posts;

-- 3. Create public SELECT policy for published articles
CREATE POLICY "Anyone can view published posts" ON public.posts
  FOR SELECT USING (status = 'Published');

-- 4. Create admin helper function to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Create admin full access policy
CREATE POLICY "Admin full access to posts" ON public.posts
  FOR ALL TO authenticated USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- 6. Create service role full access policy
CREATE POLICY "Service role full access to posts" ON public.posts
  FOR ALL TO service_role USING (true) WITH CHECK (true);
