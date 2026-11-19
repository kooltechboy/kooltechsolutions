-- ============================================================
-- Migration 010: Native PSA Asset Management
-- Eliminates ITFlow external dependency by providing an in-house asset inventory
-- ============================================================

CREATE TABLE IF NOT EXISTS public.client_assets (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name      TEXT NOT NULL,
  name             TEXT NOT NULL,
  asset_tag        TEXT UNIQUE NOT NULL,
  type             TEXT NOT NULL CHECK (type IN ('Server', 'Firewall', 'Laptop', 'Desktop', 'Switch', 'NAS', 'Access Point', 'Cloud Instance')),
  model            TEXT,
  serial           TEXT,
  ip_address       TEXT,
  location         TEXT,
  status           TEXT DEFAULT 'In Use' CHECK (status IN ('In Use', 'Maintenance', 'In Repair', 'Decommissioned', 'Spare')),
  assigned_to      TEXT,
  purchase_date    DATE,
  warranty_expires DATE,
  health_status    TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'warning', 'critical', 'offline')),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS client_assets_client_id_idx ON public.client_assets (client_id);
CREATE INDEX IF NOT EXISTS client_assets_asset_tag_idx ON public.client_assets (asset_tag);
CREATE INDEX IF NOT EXISTS client_assets_status_idx ON public.client_assets (status);

ALTER TABLE public.client_assets ENABLE ROW LEVEL SECURITY;

-- Clients can view their own assets
DROP POLICY IF EXISTS "Clients view their own assets" ON public.client_assets;
CREATE POLICY "Clients view their own assets" ON public.client_assets
  FOR SELECT TO authenticated USING (client_id = auth.uid());

-- Admins full access
DROP POLICY IF EXISTS "Admins full access to client assets" ON public.client_assets;
CREATE POLICY "Admins full access to client assets" ON public.client_assets
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role bypass
DROP POLICY IF EXISTS "Service role bypass assets" ON public.client_assets;
CREATE POLICY "Service role bypass assets" ON public.client_assets
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Seed initial enterprise managed assets
INSERT INTO public.client_assets (client_name, name, asset_tag, type, model, serial, ip_address, location, status, assigned_to, purchase_date, warranty_expires, health_status)
VALUES
  ('Nexus Corp', 'Primary Domain Controller', 'SRV-001', 'Server', 'Dell PowerEdge R740', 'DL-99214-X', '192.168.10.10', 'Main Datacenter', 'In Use', 'Infrastructure Team', '2023-01-15', '2027-01-15', 'healthy'),
  ('Vertex LLC', 'Perimeter Security Appliance', 'FW-001', 'Firewall', 'Fortinet FortiGate 60F', 'FG-88312-C', '10.0.0.1', 'HQ Server Room', 'In Use', 'SecOps', '2023-05-20', '2026-05-20', 'healthy'),
  ('Apex Industries', 'Engineering Workstation LT-14', 'LT-014', 'Laptop', 'Dell Latitude 5540', 'DL-55401-A', '192.168.20.105', 'Remote - Santo Domingo', 'In Use', 'Jane Cooper', '2024-02-10', '2027-02-10', 'healthy'),
  ('Nexus Corp', 'Core Backup Storage Node', 'NAS-002', 'NAS', 'Synology RS2423+', 'SY-24230-B', '192.168.10.25', 'Main Datacenter', 'In Use', 'Backup Ops', '2023-03-01', '2026-03-01', 'healthy'),
  ('Vertex LLC', 'Core Layer-3 Switch', 'SW-001', 'Switch', 'Cisco Catalyst 9200', 'CS-92004-D', '10.0.0.2', 'HQ Server Room', 'In Use', 'NetOps', '2023-06-15', '2028-06-15', 'healthy'),
  ('Kool Tech Internal', 'AI Inference & Orchestration Node', 'SRV-AI-01', 'Cloud Instance', 'AWS g5.2xlarge (A10G GPU)', 'AWS-INST-882', '172.31.42.18', 'us-east-1', 'In Use', 'AI Engineering', '2024-01-01', '2028-01-01', 'healthy')
ON CONFLICT (asset_tag) DO NOTHING;
