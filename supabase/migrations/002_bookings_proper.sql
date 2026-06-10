-- ============================================================
-- Migration 002: Proper Bookings System
-- Replaces the fragile text-note hack with a real calendar table
-- ============================================================

-- ── Bookings Table ────────────────────────────────────────────────────────────
-- Proper bookings with timestamps, conflict prevention, and status tracking.

CREATE TABLE IF NOT EXISTS public.bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Client info
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  phone           TEXT,
  company         TEXT,
  -- Booking details
  service_interest TEXT NOT NULL DEFAULT 'Live Demo',
  notes           TEXT,
  -- Scheduling (proper timestamps)
  scheduled_at    TIMESTAMPTZ NOT NULL,   -- Exact date+time in UTC
  duration_mins   INT NOT NULL DEFAULT 30,
  timezone        TEXT NOT NULL DEFAULT 'America/Santo_Domingo',
  -- Status lifecycle
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  -- CRM linkage
  lead_id         UUID REFERENCES public.leads(id) ON DELETE SET NULL,
  -- Calendar integration
  google_event_id TEXT,          -- Google Calendar event ID (for sync)
  meeting_link    TEXT,          -- Zoom/Meet/Teams link
  -- Notifications
  reminder_24h_sent BOOLEAN DEFAULT false,
  reminder_1h_sent  BOOLEAN DEFAULT false,
  -- Source tracking
  booked_via      TEXT DEFAULT 'ai_agent' CHECK (booked_via IN ('ai_agent', 'web_form', 'manual', 'phone')),
  agent_name      TEXT,          -- Which AI agent booked this
  session_id      TEXT,          -- Chat session that produced this booking
  -- Timestamps
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Uniqueness & Conflict Prevention ─────────────────────────────────────────
-- Prevent double-booking: two bookings cannot share the exact same slot
-- This creates a hard database-level guard (not just application logic)
CREATE UNIQUE INDEX IF NOT EXISTS bookings_scheduled_at_unique_idx
  ON public.bookings (scheduled_at)
  WHERE status NOT IN ('cancelled', 'no_show');

-- Index for fast availability queries
CREATE INDEX IF NOT EXISTS bookings_scheduled_at_idx ON public.bookings (scheduled_at);
CREATE INDEX IF NOT EXISTS bookings_email_idx ON public.bookings (email);
CREATE INDEX IF NOT EXISTS bookings_status_idx ON public.bookings (status);

-- ── Available Slots Helper Function ──────────────────────────────────────────
-- Returns booked time slots for a given date range (used by the slots API)

CREATE OR REPLACE FUNCTION get_booked_slots(
  start_date TIMESTAMPTZ,
  end_date   TIMESTAMPTZ
)
RETURNS TABLE (
  scheduled_at   TIMESTAMPTZ,
  duration_mins  INT
)
LANGUAGE sql STABLE
AS $$
  SELECT scheduled_at, duration_mins
  FROM public.bookings
  WHERE
    scheduled_at >= start_date
    AND scheduled_at < end_date
    AND status NOT IN ('cancelled', 'no_show')
  ORDER BY scheduled_at;
$$;

-- ── Auto-update updated_at trigger ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_updated_at_trigger
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_bookings_updated_at();

-- ── RLS ───────────────────────────────────────────────────────────────────────
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Service role (API routes) can read/write all bookings
CREATE POLICY "Service role full access to bookings"
  ON public.bookings FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Authenticated admins can manage all bookings
CREATE POLICY "Admin full access to bookings"
  ON public.bookings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Clients can view their own bookings by email (for portal)
CREATE POLICY "Client can view own bookings"
  ON public.bookings FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Enable Realtime for booking notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- ── Migration: Backfill from leads table ─────────────────────────────────────
-- NOTE: Run this only if you want to migrate old text-based bookings.
-- Old bookings stored as "LIVE DEMO SCHEDULED: [date] at [time]" in leads.notes
-- This is approximate — proper timestamps cannot be recovered from free text.
-- INSERT INTO public.bookings (first_name, last_name, email, service_interest,
--   scheduled_at, status, booked_via, notes)
-- SELECT
--   first_name, last_name, email, service_interest,
--   NOW(), -- Cannot recover exact time from text
--   'confirmed',
--   'web_form',
--   notes
-- FROM public.leads
-- WHERE notes ILIKE '%LIVE DEMO SCHEDULED%'
--   AND status = 'qualified';
