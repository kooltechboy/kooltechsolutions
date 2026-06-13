-- ============================================================
-- Migration 004: Ticket Messages Confidentiality
-- Prevents clients from viewing internal notes on their tickets.
-- ============================================================

-- Drop existing select policy on ticket_messages
DROP POLICY IF EXISTS "Users can view messages of their tickets" ON public.ticket_messages;

-- Re-create select policy to enforce that clients only see public messages
CREATE POLICY "Users can view messages of their tickets" ON public.ticket_messages
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.tickets
      WHERE tickets.id = ticket_messages.ticket_id AND tickets.client_id = auth.uid()
    ) AND (
      is_internal_note = false OR
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
      )
    )
  );
