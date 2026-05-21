-- ===================================================
-- KoolTech Solutions: Phase 1 Schema Update
-- Run this in the Supabase SQL Editor
-- ===================================================

-- 1. Organizations / Company Settings
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

-- Seed default org
INSERT INTO public.organizations (company_name, support_email, billing_email, address, phone, website)
VALUES ('Kool Tech Solutions', 'support@kooltech.solutions', 'billing@kooltech.solutions', 'Santo Domingo, Dominican Republic', '+1-809-000-0000', 'https://www.kooltechsolutions.com')
ON CONFLICT DO NOTHING;

-- 2. Infrastructure Nodes (Monitoring)
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

-- Seed initial infrastructure data
INSERT INTO public.infrastructure_nodes (node_id, name, type, status, uptime, cpu_usage, ram_usage) VALUES
  ('SRV-DC-01', 'Primary Domain Controller', 'Server', 'Online', '99.99%', 24, 42),
  ('SRV-EX-01', 'Exchange Hub', 'Server', 'Online', '99.95%', 58, 76),
  ('SRV-FS-02', 'Client File Share', 'Server', 'Warning', '99.80%', 89, 92),
  ('SRV-BK-01', 'Backup Appliance', 'Server', 'Online', '99.99%', 12, 28)
ON CONFLICT (node_id) DO NOTHING;

-- 3. Security Events (SOC Feed)
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

-- Seed initial security events
INSERT INTO public.security_events (event_id, type, target, status, severity) VALUES
  ('TH-9921', 'Brute Force Attempt', 'VPN Gateway', 'Blocked', 'High'),
  ('TH-9920', 'Malware Signature', 'Endpoint-04', 'Quarantined', 'Critical'),
  ('TH-9919', 'Anomalous Login', 'Office 365', 'Investigating', 'Medium'),
  ('TH-9918', 'Port Scan', 'Firewall Ext', 'Blocked', 'Low')
ON CONFLICT (event_id) DO NOTHING;

-- 4. Automation Workflows
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

-- Seed initial workflows
INSERT INTO public.automation_workflows (name, trigger, status, run_count) VALUES
  ('High CPU Alert → Create Ticket', 'Wazuh Alert', 'Active', 142),
  ('SLA Breach Warning → Slack', 'Ticket Age > 3h', 'Active', 28),
  ('New Lead → Welcome Email Series', 'Form Submit', 'Paused', 0),
  ('Failed Backup → PagerDuty', 'Veeam API', 'Active', 3),
  ('Auto-Close Stale Tickets', 'Schedule (Daily)', 'Active', 812)
ON CONFLICT DO NOTHING;

-- 5. Integration Configs
CREATE TABLE IF NOT EXISTS public.integration_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  status TEXT DEFAULT 'Disconnected' CHECK (status IN ('Connected', 'Disconnected', 'Error')),
  endpoint TEXT,
  api_key TEXT,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial integrations
INSERT INTO public.integration_configs (name, category, status) VALUES
  ('Tactical RMM', 'RMM', 'Disconnected'),
  ('ITFlow', 'PSA', 'Disconnected'),
  ('Wazuh SIEM', 'Security', 'Connected'),
  ('Stripe', 'Billing', 'Connected'),
  ('Grafana', 'Monitoring', 'Connected'),
  ('Discord', 'Notifications', 'Connected')
ON CONFLICT DO NOTHING;

-- 6. Service Catalog
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

-- Seed service catalog
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

-- 7. CRM Signals (Activity Timeline)
CREATE TABLE IF NOT EXISTS public.crm_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for all new tables (admin-only access for now)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.infrastructure_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crm_signals ENABLE ROW LEVEL SECURITY;

-- Allow authenticated admins to access all tables
CREATE POLICY "Admin full access to organizations" ON public.organizations FOR ALL USING (true);
CREATE POLICY "Admin full access to infrastructure_nodes" ON public.infrastructure_nodes FOR ALL USING (true);
CREATE POLICY "Admin full access to security_events" ON public.security_events FOR ALL USING (true);
CREATE POLICY "Admin full access to automation_workflows" ON public.automation_workflows FOR ALL USING (true);
CREATE POLICY "Admin full access to integration_configs" ON public.integration_configs FOR ALL USING (true);
CREATE POLICY "Admin full access to service_catalog" ON public.service_catalog FOR ALL USING (true);
CREATE POLICY "Admin full access to crm_signals" ON public.crm_signals FOR ALL USING (true);
CREATE POLICY "Anyone can view active services" ON public.service_catalog FOR SELECT USING (active = true);
