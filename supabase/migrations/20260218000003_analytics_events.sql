-- Analytics Events Table
-- Track user behavior for analytics

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_name VARCHAR(100) NOT NULL,
  event_category VARCHAR(50),
  properties JSONB DEFAULT '{}',
  session_id VARCHAR(100),
  device_type VARCHAR(20),
  app_version VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);

-- Enable RLS
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Users can insert own events') THEN
    CREATE POLICY "Users can insert own events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Service role can read all events') THEN
    CREATE POLICY "Service role can read all events" ON analytics_events FOR SELECT USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'analytics_events' AND policyname = 'Admins can read analytics') THEN
    CREATE POLICY "Admins can read analytics" ON analytics_events FOR SELECT USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
    );
  END IF;
END $$;

-- Function to track event
-- Note: device_type and app_version should be passed from client
CREATE OR REPLACE FUNCTION track_event(
  p_event_name VARCHAR,
  p_event_category VARCHAR DEFAULT NULL,
  p_properties JSONB DEFAULT '{}'::jsonb,
  p_device_type VARCHAR DEFAULT 'web',
  p_app_version VARCHAR DEFAULT '1.0.0'
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  INSERT INTO analytics_events (user_id, event_name, event_category, properties, device_type, app_version)
  VALUES (
    current_user_id,
    p_event_name,
    p_event_category,
    p_properties,
    COALESCE(p_device_type, 'web'),
    COALESCE(p_app_version, '1.0.0')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION track_event(VARCHAR, VARCHAR, JSONB, VARCHAR, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION track_event(VARCHAR, VARCHAR, JSONB, VARCHAR, VARCHAR) TO authenticated;

COMMENT ON TABLE analytics_events IS 'Tracks user events for analytics and behavior understanding';
