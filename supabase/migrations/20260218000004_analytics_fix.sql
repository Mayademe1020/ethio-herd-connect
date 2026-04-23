-- Fix: Add missing column if it doesn't exist
ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS event_category VARCHAR(50);

-- Now run the rest of the setup
-- Function to track event
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

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_category ON analytics_events(event_category);

-- Enable RLS if not enabled
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies (use OR REPLACE to avoid duplicates)
DROP POLICY IF EXISTS "Users can insert own events" ON analytics_events;
CREATE POLICY "Users can insert own events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Service role can read all events" ON analytics_events;
CREATE POLICY "Service role can read all events" ON analytics_events
  FOR SELECT USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Admins can read analytics" ON analytics_events;
CREATE POLICY "Admins can read analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
  );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION track_event(VARCHAR, VARCHAR, JSONB, VARCHAR, VARCHAR) TO service_role;
GRANT EXECUTE ON FUNCTION track_event(VARCHAR, VARCHAR, JSONB, VARCHAR, VARCHAR) TO authenticated;

-- Add comment
COMMENT ON TABLE analytics_events IS 'Tracks user events for analytics and behavior understanding';

SELECT 'Analytics setup complete!' as status;
