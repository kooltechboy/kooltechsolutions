-- ============================================================
-- KoolTech Solutions: Full Platform Schema Migration
-- Run this entire script in your Supabase SQL Editor
-- This creates ALL tables needed for the admin dashboard to work
-- ============================================================

-- ============================================================
-- 1. Organizations / Company Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL DEFAULT 'Kool Tech Solutions',
  support_email TEXT DEFAULT 'support@kooltech.solutions',
  billing_email TEXT DEFAULT 'billing@kooltech.solutions',
  address TEXT,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.organizations (company_name, support_email, billing_email, address, phone, website)
VALUES ('Kool Tech Solutions', 'support@kooltech.solutions', 'billing@kooltech.solutions', 'Santo Domingo, Dominican Republic', '+1-809-000-0000', 'https://www.kooltechsolutions.com')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 2. Infrastructure Nodes (Monitoring Dashboard)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.infrastructure_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'Server',
  status TEXT DEFAULT 'Online' CHECK (status IN ('Online', 'Warning', 'Offline', 'Maintenance')),
  uptime TEXT DEFAULT '99.99%',
  cpu_usage INT DEFAULT 0,
  ram_usage INT DEFAULT 0,
  ip_address TEXT,
  location TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.infrastructure_nodes (node_id, name, type, status, uptime, cpu_usage, ram_usage, ip_address, location) VALUES
  ('SRV-DC-01', 'Primary Domain Controller', 'Server', 'Online', '99.99%', 24, 42, '192.168.1.1', 'Main Office'),
  ('SRV-EX-01', 'Exchange Hub', 'Server', 'Online', '99.95%', 58, 76, '192.168.1.2', 'Main Office'),
  ('SRV-FS-02', 'Client File Share', 'Server', 'Warning', '99.80%', 89, 92, '192.168.1.3', 'Main Office'),
  ('SRV-BK-01', 'Backup Appliance', 'Server', 'Online', '99.99%', 12, 28, '192.168.1.4', 'Server Room')
ON CONFLICT (node_id) DO NOTHING;

-- ============================================================
-- 3. Security Events (SOC Feed)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  target TEXT NOT NULL,
  status TEXT DEFAULT 'Investigating' CHECK (status IN ('Blocked', 'Quarantined', 'Investigating', 'Resolved')),
  severity TEXT DEFAULT 'Medium' CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  source_ip TEXT,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.security_events (event_id, type, target, status, severity, source_ip, details) VALUES
  ('TH-9921', 'Brute Force Attempt', 'VPN Gateway', 'Blocked', 'High', '185.220.101.42', 'Multiple failed SSH login attempts detected from known Tor exit node'),
  ('TH-9920', 'Malware Signature', 'Endpoint-04', 'Quarantined', 'Critical', '10.0.0.44', 'Trojan.GenericKD.46583421 detected by Windows Defender'),
  ('TH-9919', 'Anomalous Login', 'Office 365', 'Investigating', 'Medium', '91.108.56.11', 'Login from unusual geographic location (Russia) outside business hours'),
  ('TH-9918', 'Port Scan', 'Firewall Ext', 'Blocked', 'Low', '45.33.32.156', 'TCP SYN scan detected on ports 22, 80, 443, 3389')
ON CONFLICT (event_id) DO NOTHING;

-- ============================================================
-- 4. Automation Workflows
-- ============================================================
CREATE TABLE IF NOT EXISTS public.automation_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger TEXT NOT NULL,
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Paused', 'Disabled')),
  run_count INT DEFAULT 0,
  last_run TIMESTAMPTZ,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.automation_workflows (name, trigger, status, run_count, last_run, description) VALUES
  ('High CPU Alert → Create Ticket', 'Wazuh Alert', 'Active', 142, NOW() - INTERVAL '2 hours', 'Automatically creates a support ticket when CPU usage exceeds 90% for 5 minutes'),
  ('SLA Breach Warning → Slack', 'Ticket Age > 3h', 'Active', 28, NOW() - INTERVAL '30 minutes', 'Sends a Slack notification when a high-priority ticket is approaching SLA breach'),
  ('New Lead → Welcome Email Series', 'Form Submit', 'Paused', 0, NULL, 'Triggers a 5-part welcome email sequence when a new lead submits the contact form'),
  ('Failed Backup → PagerDuty', 'Veeam API', 'Active', 3, NOW() - INTERVAL '1 day', 'Pages on-call engineer when a Veeam backup job fails'),
  ('Auto-Close Stale Tickets', 'Schedule (Daily)', 'Active', 812, NOW() - INTERVAL '18 hours', 'Automatically closes tickets that have been in Waiting on Client status for more than 7 days')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 5. Integration Configs (CRITICAL — powers the Integrations page)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Disconnected' CHECK (status IN ('Connected', 'Disconnected', 'Error')),
  endpoint TEXT,
  api_key TEXT,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed all integrations. ITFlow and Tactical RMM are Connected (keys stored in .env.local)
INSERT INTO public.integration_configs (name, category, status, endpoint, last_sync) VALUES
  ('Tactical RMM', 'RMM', 'Connected', 'https://rmm.kooltechsolutions.com', NOW()),
  ('ITFlow', 'PSA', 'Connected', 'https://itflow.kooltechsolutions.com/', NOW()),
  ('Action1', 'Patching', 'Disconnected', NULL, NULL),
  ('Wazuh SIEM', 'Security', 'Connected', NULL, NOW() - INTERVAL '5 minutes'),
  ('Stripe', 'Billing', 'Connected', NULL, NOW() - INTERVAL '1 hour'),
  ('Grafana', 'Monitoring', 'Connected', NULL, NOW() - INTERVAL '10 minutes'),
  ('Discord', 'Notifications', 'Connected', NULL, NOW() - INTERVAL '2 hours')
ON CONFLICT (name) DO UPDATE SET
  status = EXCLUDED.status,
  endpoint = COALESCE(EXCLUDED.endpoint, public.integration_configs.endpoint),
  last_sync = COALESCE(EXCLUDED.last_sync, public.integration_configs.last_sync),
  updated_at = NOW();

-- ============================================================
-- 6. Service Catalog
-- ============================================================
CREATE TABLE IF NOT EXISTS public.service_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  category_icon TEXT DEFAULT 'Shield',
  category_description TEXT,
  name TEXT NOT NULL,
  code TEXT UNIQUE,
  price TEXT,
  price_type TEXT DEFAULT 'per month',
  priority TEXT DEFAULT 'Normal',
  description TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.service_catalog (category, category_icon, category_description, name, code, price, price_type, priority, description) VALUES
  ('Managed IT', 'Monitor', 'Comprehensive endpoint management and proactive maintenance', 'Basic MSP Plan', 'MSP-BASIC', '$49', 'per endpoint/mo', 'Normal', 'Monitoring, patching, and helpdesk access for one endpoint.'),
  ('Managed IT', 'Monitor', 'Comprehensive endpoint management and proactive maintenance', 'Enterprise MSP Plan', 'MSP-ENT', '$89', 'per endpoint/mo', 'High', 'Full RMM management, priority support, and SLA guarantee.'),
  ('Cybersecurity', 'Shield', 'Advanced threat detection and zero-trust security architecture', 'Endpoint Detection & Response', 'SEC-EDR', '$12', 'per endpoint/mo', 'High', 'Real-time malware detection, quarantine and forensics.'),
  ('Cybersecurity', 'Shield', 'Advanced threat detection and zero-trust security architecture', 'SIEM-as-a-Service', 'SEC-SIEM', '$299', 'per month', 'High', 'Centralized log management, threat correlation and alerting via Wazuh.'),
  ('Cloud Services', 'Cloud', 'Scalable cloud infrastructure design and management', 'Cloud Migration', 'CLD-MIG', '$2,500', 'one-time', 'Normal', 'Full assessment, planning, and execution of cloud migration.'),
  ('Cloud Services', 'Cloud', 'Scalable cloud infrastructure design and management', 'Cloud Management', 'CLD-MGMT', '$199', 'per month', 'Normal', 'Ongoing cloud infrastructure optimization and cost management.'),
  ('Network Design', 'Network', 'Enterprise-grade network architecture and VoIP deployment', 'Network Assessment', 'NET-ASSESS', '$750', 'one-time', 'Normal', 'Full audit of existing network topology and security posture.'),
  ('Network Design', 'Network', 'Enterprise-grade network architecture and VoIP deployment', 'VoIP Deployment', 'VOIP-DEP', '$150', 'per seat/mo', 'Normal', 'Business-grade VoIP configuration with softphone and SLA.'),
  ('IT Consulting', 'Briefcase', 'Strategic technology planning and executive advisory', 'vCISO Services', 'CONS-VCISO', '$1,500', 'per month', 'High', 'Fractional CISO providing security strategy, compliance, and reporting.'),
  ('IT Consulting', 'Briefcase', 'Strategic technology planning and executive advisory', 'IT Strategy Roadmap', 'CONS-ROAD', '$500', 'per session', 'Normal', 'Quarterly technology planning sessions with detailed roadmap delivery.')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- 7. CRM Signals (Activity Timeline)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.crm_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Enable Row Level Security on all new tables
-- ============================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_signals ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies — Allow authenticated users full access
-- ============================================================
DROP POLICY IF EXISTS "Admin full access to organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admin full access to infrastructure_nodes" ON public.infrastructure_nodes;
DROP POLICY IF EXISTS "Admin full access to security_events" ON public.security_events;
DROP POLICY IF EXISTS "Admin full access to automation_workflows" ON public.automation_workflows;
DROP POLICY IF EXISTS "Admin full access to integration_configs" ON public.integration_configs;
DROP POLICY IF EXISTS "Admin full access to service_catalog" ON public.service_catalog;
DROP POLICY IF EXISTS "Admin full access to crm_signals" ON public.crm_signals;
DROP POLICY IF EXISTS "Anyone can view active services" ON public.service_catalog;

CREATE POLICY "Admin full access to organizations" ON public.organizations FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to infrastructure_nodes" ON public.infrastructure_nodes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to security_events" ON public.security_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to automation_workflows" ON public.automation_workflows FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to integration_configs" ON public.integration_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to service_catalog" ON public.service_catalog FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin full access to crm_signals" ON public.crm_signals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow service role (API routes) to bypass RLS
CREATE POLICY "Service role bypass organizations" ON public.organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass infrastructure_nodes" ON public.infrastructure_nodes FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass security_events" ON public.security_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass automation_workflows" ON public.automation_workflows FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass integration_configs" ON public.integration_configs FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass service_catalog" ON public.service_catalog FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Service role bypass crm_signals" ON public.crm_signals FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Public read for active services
CREATE POLICY "Anyone can view active services" ON public.service_catalog FOR SELECT USING (active = true);
