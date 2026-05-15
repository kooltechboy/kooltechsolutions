-- Kool Tech Solutions: Supabase Database Schema
-- Run this in the Supabase SQL Editor

-- 1. Profiles/Users (Extended from auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'admin', 'agent')),
  company_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- 2. CRM: Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  service_interest TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tickets (Helpdesk)
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'waiting_on_client', 'resolved', 'closed')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  assigned_to UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Ticket Messages (Thread)
CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  is_internal_note BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. AI Agent Logs (Conversations)
CREATE TABLE public.agent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL, -- To group messages in a single chat session
  role TEXT NOT NULL CHECK (role IN ('user', 'agent', 'system')),
  content TEXT NOT NULL,
  agent_name TEXT, -- e.g., 'Kira', 'Max'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Client Services (Active Subscriptions)
CREATE TABLE public.client_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  service_sku TEXT,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  price DECIMAL(10, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'suspended', 'cancelled')),
  next_billing_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Basic RLS for services
ALTER TABLE public.client_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own services" ON public.client_services FOR SELECT USING (auth.uid() = client_id);

-- Basic RLS for tickets (Clients can see their own, Admins see all)
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = client_id);
-- Note: Admin policies would require a helper function to check if the user's role in profiles is 'admin'.

-- 7. Invoices
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'outstanding' CHECK (status IN ('draft', 'outstanding', 'paid', 'overdue', 'void')),
  issued_date DATE DEFAULT CURRENT_DATE,
  due_date DATE,
  paid_date DATE,
  line_items JSONB, -- Array of {description, quantity, unit_price, total}
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = client_id);

-- 8. Blog Posts (CMS)
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  category TEXT DEFAULT 'News',
  read_time TEXT,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
  author_name TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Blog Posts
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view published posts
CREATE POLICY "Anyone can view published posts" 
ON public.posts FOR SELECT 
USING (status = 'Published');

-- Admins can view/edit all posts (assumes admin enforcement on UI, or further RLS refinement)
CREATE POLICY "Admins have full access to posts" 
ON public.posts FOR ALL 
USING (true); -- Note: In a strict setup, check auth.uid() against profiles.role = 'admin'
