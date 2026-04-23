-- Migration: User Activities, Announcements, and RLS Policies
-- Date: 2026-03-15
-- Description: Add user activity tracking, announcements, and fix RLS policies

-- User Activities Table (Audit Log)
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB DEFAULT '{}',
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_am TEXT,
  content TEXT NOT NULL,
  content_am TEXT,
  
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'alert', 'maintenance', 'new_feature')),
  
  target_audience TEXT NOT NULL DEFAULT 'all' CHECK (target_audience IN ('all', 'farmers', 'buyers', 'new_users')),
  
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  
  created_by UUID,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Announcement Recipients (for tracking who received)
CREATE TABLE IF NOT EXISTS announcement_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(announcement_id, user_id)
);

-- Reported Content Table (for content moderation)
CREATE TABLE IF NOT EXISTS reported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  content_type TEXT NOT NULL CHECK (content_type IN ('listing', 'user', 'animal', 'message', 'review')),
  content_id TEXT NOT NULL,
  content_owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  reason TEXT NOT NULL CHECK (reason IN (
    'spam', 
    'inappropriate', 
    'fraud', 
    'scam',
    'duplicate',
    'misleading',
    'other'
  )),
  description TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'action_taken', 'dismissed')),
  
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_activities_user_id ON user_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activities_action ON user_activities(action);
CREATE INDEX IF NOT EXISTS idx_user_activities_created_at ON user_activities(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_announcements_type ON announcements(type);
CREATE INDEX IF NOT EXISTS idx_announcements_starts ON announcements(starts_at);

CREATE INDEX IF NOT EXISTS idx_recipients_announcement ON announcement_recipients(announcement_id);
CREATE INDEX IF NOT EXISTS idx_recipients_user ON announcement_recipients(user_id);

CREATE INDEX IF NOT EXISTS idx_reported_content_status ON reported_content(status);
CREATE INDEX IF NOT EXISTS idx_reported_content_type ON reported_content(content_type);
CREATE INDEX IF NOT EXISTS idx_reported_content_created_at ON reported_content(created_at DESC);

-- Enable RLS
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reported_content ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activities
DROP POLICY IF EXISTS "Admins can view user activities" ON user_activities;
CREATE POLICY "Admins can view user activities" ON user_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view own activities" ON user_activities;
CREATE POLICY "Users can view own activities" ON user_activities
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "System can insert activities" ON user_activities;
CREATE POLICY "System can insert activities" ON user_activities
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

-- RLS Policies for announcements
DROP POLICY IF EXISTS "Anyone can view active announcements" ON announcements;
CREATE POLICY "Anyone can view active announcements" ON announcements
  FOR SELECT TO authenticated
  USING (
    is_active = TRUE 
    AND (starts_at IS NULL OR starts_at <= NOW())
    AND (expires_at IS NULL OR expires_at >= NOW())
  );

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for announcement_recipients
DROP POLICY IF EXISTS "Users can view their announcements" ON announcement_recipients;
CREATE POLICY "Users can view their announcements" ON announcement_recipients
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage recipients" ON announcement_recipients;
CREATE POLICY "Admins can manage recipients" ON announcement_recipients
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- RLS Policies for reported_content
DROP POLICY IF EXISTS "Anyone can report content" ON reported_content;
CREATE POLICY "Anyone can report content" ON reported_content
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage reported content" ON reported_content;
CREATE POLICY "Admins can manage reported content" ON reported_content
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid()
    )
  );

-- Function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id TEXT DEFAULT NULL,
  p_details JSONB DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO user_activities (user_id, action, resource_type, resource_id, details)
  VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
