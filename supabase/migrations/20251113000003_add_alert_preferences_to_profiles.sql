-- Add alert_preferences column to profiles table
-- Date: 2025-11-13

-- ============================================================================
-- Add alert_preferences column to profiles table
-- ============================================================================

-- Add alert_preferences column if it doesn't exist
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS alert_preferences JSONB DEFAULT '{
  "new_listings": true,
  "price_changes": true,
  "opportunities": true,
  "distance_threshold_km": 50,
  "price_change_threshold": 15
}'::jsonb;

-- Add location_coordinates column if it doesn't exist (for location-based alerts)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS location_coordinates JSONB;

-- ============================================================================
-- Add index for alert_preferences queries
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_profiles_alert_preferences ON profiles USING GIN (alert_preferences);

-- ============================================================================
-- Migration complete
-- ============================================================================