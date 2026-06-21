-- ============================================================
-- Security Fix: Restrict RLS Policies
-- Previously: ALL authenticated users had full access to admin tables
-- Now: Only admin-role users can access admin tables;
--       clients can only see their own data
-- ============================================================

-- ── Helper function to check admin role ──────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── Drop overly permissive policies ──────────────────────────────────────────
DROP POLICY IF EXISTS "Admin full access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admin full access to infrastructure_nodes" ON public.infrastructure_nodes;
DROP POLICY IF EXISTS "Admin full access to security_events" ON public.security_events;
DROP POLICY IF EXISTS "Admin full access to automation_workflows" ON public.automation_workflows;
DROP POLICY IF EXISTS "Admin full access to integration_configs" ON public.integration_configs;
DROP POLICY IF EXISTS "Admin full access to service_catalog" ON public.service_catalog;
DROP POLICY IF EXISTS "Admin full access to crm_signals" ON public.crm_signals;

-- ── Admin-only tables ────────────────────────────────────────────────────────
-- These tables should ONLY be accessible by admin users via RLS

CREATE POLICY "Admin-only access to organizations"
  ON public.organizations FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin-only access to infrastructure_nodes"
  ON public.infrastructure_nodes FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin-only access to security_events"
  ON public.security_events FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin-only access to automation_workflows"
  ON public.automation_workflows FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin-only access to integration_configs"
  ON public.integration_configs FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "Admin-only access to crm_signals"
  ON public.crm_signals FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Service catalog: admin full access, clients read-only for active services
CREATE POLICY "Admin full access to service_catalog"
  ON public.service_catalog FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Keep the existing public read policy for active services
-- (already exists: "Anyone can view active services")

-- ── Service role bypass policies remain unchanged ────────────────────────────
-- These allow API routes using the service_role key to bypass RLS as intended.
