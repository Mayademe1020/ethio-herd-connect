-- Add calendar preference to farm_profiles table

-- Add calendar_preference column
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS calendar_preference TEXT DEFAULT 'gregorian' CHECK (calendar_preference IN ('gregorian', 'ethiopian'));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_farm_profiles_calendar_preference 
ON public.farm_profiles(calendar_preference);

-- Add comment
COMMENT ON COLUMN public.farm_profiles.calendar_preference IS 'User preference for calendar system: gregorian or ethiopian';
