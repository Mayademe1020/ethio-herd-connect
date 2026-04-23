-- Create notification_preferences table for user notification settings
-- Migration: 20260315000000_create_notification_preferences.sql

-- Enable uuid extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  
  -- Global settings
  global_enabled BOOLEAN DEFAULT true,
  do_not_disturb BOOLEAN DEFAULT false,
  dnd_start_time TEXT DEFAULT '22:00',
  dnd_end_time TEXT DEFAULT '06:00',
  
  -- Milk reminders settings (JSONB for nested structure)
  milk_reminders JSONB DEFAULT '{
    "enabled": true,
    "morning_time": "06:00",
    "afternoon_time": "18:00",
    "frequency": "realtime",
    "batch_enabled": false
  }'::jsonb,
  
  -- Market alerts settings
  market_alerts JSONB DEFAULT '{
    "enabled": true,
    "new_listings": true,
    "price_changes": false,
    "interests": true,
    "frequency": "daily"
  }'::jsonb,
  
  -- Health alerts settings
  health_alerts JSONB DEFAULT '{
    "enabled": true,
    "vaccinations": true,
    "breeding": true,
    "health_issues": true,
    "frequency": "realtime"
  }'::jsonb,
  
  -- Account updates settings
  account_updates JSONB DEFAULT '{
    "enabled": true,
    "login_activity": false,
    "security_alerts": true,
    "feature_updates": true
  }'::jsonb,
  
  -- Do Not Disturb schedule
  dnd_schedule JSONB DEFAULT '{
    "enabled": false,
    "start_time": "22:00",
    "end_time": "06:00",
    "days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
  }'::jsonb,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'notification_preferences' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON notification_preferences', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own notification preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notification preferences"
  ON notification_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_global ON notification_preferences(global_enabled);

-- Add trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notification_preferences_updated_at') THEN
    CREATE TRIGGER update_notification_preferences_updated_at
      BEFORE UPDATE ON notification_preferences
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to get or create default preferences
CREATE OR REPLACE FUNCTION get_or_create_notification_preferences(user_uuid UUID)
RETURNS SETOF notification_preferences AS $$
DECLARE
  prefs notification_preferences%ROWTYPE;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO prefs
  FROM notification_preferences
  WHERE user_id = user_uuid;
  
  -- If not found, create default preferences
  IF NOT FOUND THEN
    INSERT INTO notification_preferences (user_id)
    VALUES (user_uuid)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN NEXT prefs;
END;
$$ LANGUAGE plpgsql;

SELECT 'notification_preferences table created successfully' AS status;
