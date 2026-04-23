-- Add Telegram integration columns to farm_profiles
-- Migration: 20260226000000_add_telegram_to_farm_profiles.sql

-- Add telegram_chat_id column for Telegram notifications
ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Add telegram_username for display
ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Add notification preferences
ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS push_notifications_enabled BOOLEAN DEFAULT true;

ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS telegram_notifications_enabled BOOLEAN DEFAULT false;

ALTER TABLE farm_profiles 
ADD COLUMN IF NOT EXISTS email_notifications_enabled BOOLEAN DEFAULT false;

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at if not exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'farm_profiles' AND column_name = 'updated_at'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_farm_profiles_updated_at'
  ) THEN
    CREATE TRIGGER update_farm_profiles_updated_at
      BEFORE UPDATE ON farm_profiles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Create indexes for notification queries
CREATE INDEX IF NOT EXISTS idx_farm_profiles_telegram 
ON farm_profiles(telegram_chat_id) 
WHERE telegram_chat_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_farm_profiles_notifications 
ON farm_profiles(user_id) 
WHERE push_notifications_enabled = true OR telegram_notifications_enabled = true;

SELECT 'Telegram integration columns added to farm_profiles' AS status;
