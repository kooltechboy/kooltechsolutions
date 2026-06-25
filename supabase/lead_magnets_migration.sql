-- ============================================================
-- KoolTech Solutions: Lead Magnets Migration
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- ── 1. Lead Magnets ──────────────────────────────────────────
-- Each lead magnet is optionally linked to a blog post.
-- The PDF is stored in the private 'lead-magnets' Supabase Storage bucket.
CREATE TABLE IF NOT EXISTS public.lead_magnets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  pdf_url TEXT NOT NULL,              -- storage path, e.g. "guides/seo-checklist.pdf"
  pdf_filename TEXT,                   -- display filename shown to user
  cta_button_text TEXT DEFAULT 'Download Free Guide',
  active BOOLEAN DEFAULT true,
  download_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. Lead Magnet Downloads (one row per captured lead) ─────
CREATE TABLE IF NOT EXISTS public.lead_magnet_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_magnet_id UUID NOT NULL REFERENCES public.lead_magnets(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  consent BOOLEAN DEFAULT false,      -- GDPR marketing consent
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookup / deduplication
CREATE INDEX IF NOT EXISTS idx_lm_downloads_email_magnet
  ON public.lead_magnet_downloads(lead_magnet_id, email);

-- ── 3. Atomic counter increment function ─────────────────────
-- Used by the download API route to safely increment the counter
CREATE OR REPLACE FUNCTION increment_lead_magnet_downloads(magnet_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.lead_magnets
    SET download_count = download_count + 1,
        updated_at = NOW()
    WHERE id = magnet_id;
END;
$$;

-- ── 3. Row Level Security ────────────────────────────────────
ALTER TABLE public.lead_magnets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_magnet_downloads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first (idempotent re-run safety)
DROP POLICY IF EXISTS "Admin full access to lead_magnets" ON public.lead_magnets;
DROP POLICY IF EXISTS "Service role bypass lead_magnets" ON public.lead_magnets;
DROP POLICY IF EXISTS "Admin full access to lm_downloads" ON public.lead_magnet_downloads;
DROP POLICY IF EXISTS "Service role bypass lm_downloads" ON public.lead_magnet_downloads;
DROP POLICY IF EXISTS "Anyone can insert lm_downloads" ON public.lead_magnet_downloads;

-- Admin (authenticated) full access
CREATE POLICY "Admin full access to lead_magnets"
  ON public.lead_magnets FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access to lm_downloads"
  ON public.lead_magnet_downloads FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Service role (API routes) bypass RLS
CREATE POLICY "Service role bypass lead_magnets"
  ON public.lead_magnets FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role bypass lm_downloads"
  ON public.lead_magnet_downloads FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Public visitors can insert their own download record
CREATE POLICY "Anyone can insert lm_downloads"
  ON public.lead_magnet_downloads FOR INSERT
  WITH CHECK (true);

-- ── 4. Storage Bucket Policies (run AFTER creating buckets) ──
-- Run these AFTER you create the two buckets in the Supabase Dashboard:
--   • blog-images  (Public bucket)
--   • lead-magnets (Private bucket)

-- blog-images: public read, authenticated write
CREATE POLICY "Anyone can read blog images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-images');

CREATE POLICY "Admin can upload blog images"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Admin can delete blog images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'blog-images');

-- lead-magnets: service role only (signed URL access)
CREATE POLICY "Service role full access to lead-magnets storage"
  ON storage.objects FOR ALL TO service_role
  USING (bucket_id = 'lead-magnets')
  WITH CHECK (bucket_id = 'lead-magnets');
