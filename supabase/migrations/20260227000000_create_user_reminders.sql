-- Create user_reminders table for milk recording reminders
-- Migration: 20260227000000_create_user_reminders.sql

-- Create user_reminders table
CREATE TABLE IF NOT EXISTS user_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Reminder type
  type TEXT NOT NULL CHECK (type IN (
    'milk_morning',
    'milk_afternoon',
    'vaccination',
    'health_check',
    'breeding',
    'custom'
  )),
  
  -- Time configuration (HH:MM format)
  time TEXT NOT NULL DEFAULT '08:00',
  
  -- Days of week (1-7, Monday-Sunday)
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5,6,7}',
  
  -- Enable/disable
  enabled BOOLEAN DEFAULT true,
  
  -- Custom message
  message TEXT,
  
  -- Related entity (animal_id, etc.)
  entity_id UUID,
  entity_type TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_sent_at TIMESTAMPTZ,
  sent_count INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE user_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies - drop existing first
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'user_reminders' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON user_reminders', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own reminders"
  ON user_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reminders"
  ON user_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reminders"
  ON user_reminders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reminders"
  ON user_reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_reminders_user ON user_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reminders_type ON user_reminders(type);
CREATE INDEX IF NOT EXISTS idx_user_reminders_enabled ON user_reminders(enabled) WHERE enabled = true;

-- Add trigger for updated_at (only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_reminders_updated_at') THEN
    CREATE TRIGGER update_user_reminders_updated_at
      BEFORE UPDATE ON user_reminders
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create function to get active reminders
CREATE OR REPLACE FUNCTION get_active_reminders(user_uuid UUID)
RETURNS SETOF user_reminders AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM user_reminders
  WHERE user_id = user_uuid
    AND enabled = true
  ORDER BY time ASC;
END;
$$ LANGUAGE plpgsql;

SELECT 'user_reminders table created successfully' AS status;
