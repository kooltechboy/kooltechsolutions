-- ============================================================
-- Migration 009: Admin Post Preview Policy
-- Allows authenticated admin users to read ALL posts regardless
-- of status or published_at date, enabling draft & schedule previews.
-- ============================================================

-- Drop any existing admin preview policy to avoid conflicts
DROP POLICY IF EXISTS "Admins can read all posts" ON public.posts;

-- Create a policy allowing authenticated admins to read every post
CREATE POLICY "Admins can read all posts"
  ON public.posts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role = 'admin'
    )
  );
