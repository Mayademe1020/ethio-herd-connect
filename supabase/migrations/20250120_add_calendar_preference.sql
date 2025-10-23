-- Migration: Add calendar preference to farm_profiles
-- Date: 2025-01-20
-- Description: Adds calendar_preference column to allow users to choose between Gregorian and Ethiopian calendars

-- Add calendar_preference column
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS calendar_preference TEXT 
DEFAULT 'gregorian' 
CHECK (calendar_preference IN ('gregorian', 'ethiopian'));

-- Add comment for documentation
COMMENT ON COLUMN public.farm_profiles.calendar_preference IS 
'User preference for calendar display: gregorian or ethiopian. Defaults to gregorian for backward compatibility.';

-- Create index for faster queries (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_farm_profiles_calendar_preference 
ON public.farm_profiles(calendar_preference);

-- Verify the migration
DO $$
BEGIN
  -- Check if column exists
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'farm_profiles' 
    AND column_name = 'calendar_preference'
  ) THEN
    RAISE NOTICE 'SUCCESS: calendar_preference column added successfully';
  ELSE
    RAISE EXCEPTION 'FAILED: calendar_preference column was not added';
  END IF;
END $$;
