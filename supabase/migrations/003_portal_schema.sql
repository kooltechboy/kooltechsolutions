-- ============================================================
-- Migration 003: Core Portal Tenant Schema
-- Defines tickets, ticket_messages, invoices, client_services, and documents
-- ============================================================

-- ── 1. Support Tickets Table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tickets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject      TEXT NOT NULL,
  description  TEXT NOT NULL,
  priority     TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  assigned_to  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for client fetching
CREATE INDEX IF NOT EXISTS tickets_client_id_idx ON public.tickets (client_id);
CREATE INDEX IF NOT EXISTS tickets_status_idx ON public.tickets (status);

-- Enable RLS on tickets
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Tickets Policies
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.tickets;
CREATE POLICY "Users can view their own tickets" ON public.tickets
  FOR SELECT TO authenticated USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.tickets;
CREATE POLICY "Users can create their own tickets" ON public.tickets
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own tickets" ON public.tickets;
CREATE POLICY "Users can update their own tickets" ON public.tickets
  FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all tickets" ON public.tickets;
CREATE POLICY "Admins can manage all tickets" ON public.tickets
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ── 2. Ticket Messages Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id        UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id        UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message          TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ticket_messages_ticket_id_idx ON public.ticket_messages (ticket_id);

-- Enable RLS on ticket_messages
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

-- Ticket Messages Policies
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON public.ticket_messages;
CREATE POLICY "Users can view messages of their tickets" ON public.ticket_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id AND tickets.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert messages to their tickets" ON public.ticket_messages;
CREATE POLICY "Users can insert messages to their tickets" ON public.ticket_messages
  FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id AND tickets.client_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage all ticket messages" ON public.ticket_messages;
CREATE POLICY "Admins can manage all ticket messages" ON public.ticket_messages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ── 3. Invoices Table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invoices (
  id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id                UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number           TEXT UNIQUE NOT NULL,
  amount                   NUMERIC(10, 2) NOT NULL,
  status                   TEXT DEFAULT 'outstanding' CHECK (status IN ('paid', 'outstanding', 'overdue')),
  due_date                 DATE NOT NULL,
  line_items               JSONB DEFAULT '[]'::jsonb,
  notes                    TEXT,
  issued_date              DATE DEFAULT CURRENT_DATE,
  stripe_payment_intent_id TEXT,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_client_id_idx ON public.invoices (client_id);

-- Enable RLS on invoices
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Invoices Policies
DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT TO authenticated USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE TO authenticated USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
CREATE POLICY "Admins can manage all invoices" ON public.invoices
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ── 4. Client Services Table ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.client_services (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name      TEXT NOT NULL,
  service_sku       TEXT NOT NULL,
  status            TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'cancelled')),
  price             NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  next_billing_date DATE DEFAULT (CURRENT_DATE + INTERVAL '1 month')::DATE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_services_client_id_idx ON public.client_services (client_id);

-- Enable RLS on client_services
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;

-- Client Services Policies
DROP POLICY IF EXISTS "Users can view their own services" ON public.client_services;
CREATE POLICY "Users can view their own services" ON public.client_services
  FOR SELECT TO authenticated USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all client services" ON public.client_services;
CREATE POLICY "Admins can manage all client services" ON public.client_services
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );


-- ── 5. Documents Table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.documents (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  size       TEXT NOT NULL,
  type       TEXT DEFAULT 'PDF',
  locked     BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS documents_client_id_idx ON public.documents (client_id);

-- Enable RLS on documents
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Documents Policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.documents;
CREATE POLICY "Users can view their own documents" ON public.documents
  FOR SELECT TO authenticated USING (client_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
CREATE POLICY "Users can insert their own documents" ON public.documents
  FOR INSERT TO authenticated WITH CHECK (client_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage all documents" ON public.documents;
CREATE POLICY "Admins can manage all documents" ON public.documents
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
