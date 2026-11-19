-- ==============================================================================
-- KOOLTECH SOLUTIONS: MASTER DATABASE MIGRATION SCRIPT
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- All commands are fully idempotent (IF NOT EXISTS, ON CONFLICT DO NOTHING)
-- ==============================================================================

-- 1. Profiles Table (Core Users & Roles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin', 'technician')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles read" ON public.profiles;
CREATE POLICY "Public profiles read" ON public.profiles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "Service role profile bypass" ON public.profiles;
CREATE POLICY "Service role profile bypass" ON public.profiles FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 2. Native PSA Client Assets Table
CREATE TABLE IF NOT EXISTS public.client_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  name TEXT NOT NULL,
  asset_tag TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Server', 'Firewall', 'Laptop', 'Desktop', 'Switch', 'NAS', 'Access Point', 'Cloud Instance')),
  model TEXT,
  serial TEXT,
  ip_address TEXT,
  location TEXT,
  status TEXT DEFAULT 'In Use' CHECK (status IN ('In Use', 'Maintenance', 'In Repair', 'Decommissioned', 'Spare')),
  assigned_to TEXT,
  purchase_date DATE,
  warranty_expires DATE,
  health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical', 'offline')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_assets_client_id_idx ON public.client_assets (client_id);
CREATE INDEX IF NOT EXISTS client_assets_asset_tag_idx ON public.client_assets (asset_tag);
CREATE INDEX IF NOT EXISTS client_assets_status_idx ON public.client_assets (status);

ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients view own assets" ON public.client_assets;
CREATE POLICY "Clients view own assets" ON public.client_assets FOR SELECT TO authenticated USING (client_id = auth.uid());
DROP POLICY IF EXISTS "Admin manage all assets" ON public.client_assets;
CREATE POLICY "Admin manage all assets" ON public.client_assets FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
DROP POLICY IF EXISTS "Service role assets bypass" ON public.client_assets;
CREATE POLICY "Service role assets bypass" ON public.client_assets FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial assets if empty
INSERT INTO public.client_assets (client_name, name, asset_tag, type, model, serial, ip_address, location, status, assigned_to, purchase_date, warranty_expires, health_status)
VALUES
  ('Nexus Corp', 'Primary Domain Controller', 'SRV-001', 'Server', 'Dell PowerEdge R740', 'DL-99214-X', '192.168.10.10', 'Main Datacenter', 'In Use', 'Infrastructure Team', '2023-01-15', '2027-01-15', 'healthy'),
  ('Vertex LLC', 'Perimeter Security Appliance', 'FW-001', 'Firewall', 'Fortinet FortiGate 60F', 'FG-88312-C', '10.0.0.1', 'HQ Server Room', 'In Use', 'SecOps', '2023-05-20', '2026-05-20', 'healthy'),
  ('Apex Industries', 'Engineering Workstation LT-14', 'LT-014', 'Laptop', 'Dell Latitude 5540', 'DL-55401-A', '192.168.20.105', 'Remote - Santo Domingo', 'In Use', 'Jane Cooper', '2024-02-10', '2027-02-10', 'healthy'),
  ('Nexus Corp', 'Core Backup Storage Node', 'NAS-002', 'NAS', 'Synology RS2423+', 'SY-24230-B', '192.168.10.25', 'Main Datacenter', 'In Use', 'Backup Ops', '2023-03-01', '2026-03-01', 'healthy'),
  ('Vertex LLC', 'Core Layer-3 Switch', 'SW-001', 'Switch', 'Cisco Catalyst 9200', 'CS-92004-D', '10.0.0.2', 'HQ Server Room', 'In Use', 'NetOps', '2023-06-15', '2028-06-15', 'healthy')
ON CONFLICT (asset_tag) DO NOTHING;

-- 3. Tenant Documents & Reports Table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Report' CHECK (type IN ('Contract', 'SLA', 'Audit', 'Report', 'Invoice', 'Architecture')),
  file_url TEXT NOT NULL,
  size_bytes BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Clients view own documents" ON public.documents;
CREATE POLICY "Clients view own documents" ON public.documents FOR SELECT TO authenticated USING (client_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage all documents" ON public.documents;
CREATE POLICY "Admins manage all documents" ON public.documents FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
DROP POLICY IF EXISTS "Service role documents bypass" ON public.documents;
CREATE POLICY "Service role documents bypass" ON public.documents FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 4. Persistent AI Chats & Messages
CREATE TABLE IF NOT EXISTS public.ai_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Support Conversation',
  context_type TEXT DEFAULT 'general' CHECK (context_type IN ('ticket', 'invoice', 'service', 'general')),
  context_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.ai_chats(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ai_chats_user_id_idx ON public.ai_chats(user_id);
CREATE INDEX IF NOT EXISTS ai_messages_chat_id_idx ON public.ai_messages(chat_id);

ALTER TABLE public.ai_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own chats" ON public.ai_chats;
CREATE POLICY "Users manage own chats" ON public.ai_chats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users manage own messages" ON public.ai_messages;
CREATE POLICY "Users manage own messages" ON public.ai_messages FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.ai_chats WHERE ai_chats.id = ai_messages.chat_id AND ai_chats.user_id = auth.uid())
) WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_chats WHERE ai_chats.id = ai_messages.chat_id AND ai_chats.user_id = auth.uid())
);
DROP POLICY IF EXISTS "Service role ai_chats bypass" ON public.ai_chats;
CREATE POLICY "Service role ai_chats bypass" ON public.ai_chats FOR ALL TO service_role USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Service role ai_messages bypass" ON public.ai_messages;
CREATE POLICY "Service role ai_messages bypass" ON public.ai_messages FOR ALL TO service_role USING (true) WITH CHECK (true);

-- 5. CRM Signals & Activity Timeline
CREATE TABLE IF NOT EXISTS public.crm_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.crm_signals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin manage crm_signals" ON public.crm_signals;
CREATE POLICY "Admin manage crm_signals" ON public.crm_signals FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
DROP POLICY IF EXISTS "Service role crm_signals bypass" ON public.crm_signals;
CREATE POLICY "Service role crm_signals bypass" ON public.crm_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Notify schema cache reload
NOTIFY pgrst, 'reload schema';
