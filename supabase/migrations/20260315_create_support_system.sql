-- Migration: Create Support Ticket System
-- Date: 2026-03-15
-- Description: Support ticket system for admin to manage user issues

-- Main support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ticket_number TEXT UNIQUE NOT NULL,
  
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  
  category TEXT NOT NULL CHECK (category IN (
    'technical_issue', 
    'account_login', 
    'animal_management',
    'marketplace', 
    'milk_recording',
    'offline_sync',
    'data_export',
    'other'
  )),
  
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN (
    'critical', 'high', 'medium', 'low'
  )),
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN (
    'open', 'in_progress', 'pending_user', 'resolved', 'closed', 'escalated'
  )),
  
  assigned_admin_id UUID,
  
  related_animal_id UUID,
  related_listing_id UUID,
  
  user_device_info JSONB DEFAULT '{}',
  user_region TEXT,
  app_version TEXT,
  
  first_response_at TIMESTAMPTZ,
  sla_deadline TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- Ticket messages/comments
CREATE TABLE IF NOT EXISTS support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin', 'system')),
  
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket attachments
CREATE TABLE IF NOT EXISTS support_ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_message_id UUID REFERENCES support_ticket_messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User bans table
CREATE TABLE IF NOT EXISTS user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  banned_by UUID,
  
  ban_type TEXT NOT NULL CHECK (ban_type IN ('warning', 'temporary', 'permanent')),
  
  reason TEXT NOT NULL,
  evidence JSONB DEFAULT '{}',
  
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support categories lookup
CREATE TABLE IF NOT EXISTS support_categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_am TEXT NOT NULL,
  description_en TEXT,
  description_am TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Seed support categories
INSERT INTO support_categories (id, name_en, name_am, description_en, description_am, icon, sort_order) VALUES
('technical_issue', 'Technical Issue', 'የስርዓት ችግር', 'App crashes, bugs, errors', 'አፕ እንደሚቆም፣ ችግሮች፣ ስህተቶች', 'bug', 1),
('account_login', 'Account & Login', 'መለያ እና መግቢያ', 'Login problems, verification, OTP', 'የመግቢያ ችግሮች፣ ማረጋገጫ፣ OTP', 'user-x', 2),
('animal_management', 'Animal Management', 'እንስሳት አስተዳደር', 'Registration, health, breeding issues', 'ምዝገባ፣ ጤና፣ መውጋት ችግሮች', 'paw-print', 3),
('marketplace', 'Marketplace', 'ገበያ', 'Listings, buying, selling, disputes', 'ዝርዝሮች፣ መግዛት፣ መሸጥ፣ ክርክሮች', 'shopping-bag', 4),
('milk_recording', 'Milk Recording', 'የሚልክ መመዝገብ', 'Recording issues, sync problems', 'መመዝገብ ችግሮች፣ ስንክሮክ ችግሮች', 'droplet', 5),
('offline_sync', 'Offline & Sync', 'ኦፍላይን እና ስንክሮክ', 'Data sync, offline mode issues', 'ውሂብ ስንክሮክ፣ ኦፍላይን ሁኔታ ችግሮች', 'wifi-off', 6),
('data_export', 'Data & Export', 'ውሂብ እና ማውጣት', 'Data export, backup issues', 'ውሂብ ማውጣት፣ ባክአፕ ችግሮች', 'download', 7),
('other', 'Other', 'ሌላ', 'General inquiries', 'አጠቃላይ ጥያቄዎች', 'help-circle', 8)
ON CONFLICT (id) DO NOTHING;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned ON support_tickets(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_user_id ON user_bans(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bans_active ON user_bans(is_active) WHERE is_active = TRUE;

-- Enable RLS
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for support_tickets
DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert tickets" ON support_tickets;
CREATE POLICY "Admins can insert tickets" ON support_tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can update tickets" ON support_tickets;
CREATE POLICY "Admins can update tickets" ON support_tickets
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for support_ticket_messages
DROP POLICY IF EXISTS "Admins can view messages" ON support_ticket_messages;
CREATE POLICY "Admins can view messages" ON support_ticket_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can insert messages" ON support_ticket_messages;
CREATE POLICY "Admins can insert messages" ON support_ticket_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for user_bans
DROP POLICY IF EXISTS "Admins can view bans" ON user_bans;
CREATE POLICY "Admins can view bans" ON user_bans
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage bans" ON user_bans;
CREATE POLICY "Admins can manage bans" ON user_bans
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- RLS Policies for support_categories (public read)
DROP POLICY IF EXISTS "Anyone can view categories" ON support_categories;
CREATE POLICY "Anyone can view categories" ON support_categories
  FOR SELECT TO authenticated
  USING (true);

-- Function to generate ticket number
DROP FUNCTION IF EXISTS generate_ticket_number();
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  count_val INTEGER;
  ticket_text TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO count_val FROM support_tickets;
  ticket_text := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(count_val::TEXT, 4, '0');
  RETURN ticket_text;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate SLA deadline based on priority
DROP FUNCTION IF EXISTS calculate_sla_deadline(TEXT);
CREATE OR REPLACE FUNCTION calculate_sla_deadline(p_priority TEXT)
RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE p_priority
    WHEN 'critical' THEN RETURN NOW() + INTERVAL '1 hour';
    WHEN 'high' THEN RETURN NOW() + INTERVAL '4 hours';
    WHEN 'medium' THEN RETURN NOW() + INTERVAL '24 hours';
    WHEN 'low' THEN RETURN NOW() + INTERVAL '72 hours';
    ELSE RETURN NOW() + INTERVAL '24 hours';
  END CASE;
END;
$$ LANGUAGE plpgsql;
