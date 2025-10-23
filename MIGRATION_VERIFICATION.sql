-- ============================================
-- CALENDAR PREFERENCE MIGRATION VERIFICATION
-- ============================================
-- Run these queries in Supabase SQL Editor to verify the migration

-- 1. Check if column exists
SELECT 
  column_name,
  data_type,
  column_default,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'farm_profiles' 
  AND column_name = 'calendar_preference';

-- Expected Result:
-- column_name: calendar_preference
-- data_type: text
-- column_default: 'gregorian'::text
-- is_nullable: YES

-- ============================================

-- 2. Check constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.farm_profiles'::regclass
  AND conname LIKE '%calendar%';

-- Expected Result:
-- Should show CHECK constraint with: (calendar_preference IN ('gregorian', 'ethiopian'))

-- ============================================

-- 3. Check existing records (should all have 'gregorian' as default)
SELECT 
  calendar_preference,
  COUNT(*) as count
FROM public.farm_profiles
GROUP BY calendar_preference;

-- Expected Result:
-- calendar_preference: gregorian
-- count: [number of existing profiles]

-- ============================================

-- 4. Test inserting a new record with Ethiopian calendar
-- (This is just a test - don't run if you don't want test data)
/*
INSERT INTO public.farm_profiles (user_id, calendar_preference)
VALUES ('test-user-id', 'ethiopian')
RETURNING id, calendar_preference;
*/

-- ============================================

-- 5. Test updating an existing record
-- (Replace 'your-user-id' with an actual user_id)
/*
UPDATE public.farm_profiles
SET calendar_preference = 'ethiopian'
WHERE user_id = 'your-user-id'
RETURNING id, user_id, calendar_preference;
*/

-- ============================================

-- 6. Verify index was created
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'farm_profiles'
  AND indexname LIKE '%calendar%';

-- Expected Result:
-- indexname: idx_farm_profiles_calendar_preference
-- indexdef: CREATE INDEX ... ON public.farm_profiles USING btree (calendar_preference)

-- ============================================
-- ALL CHECKS COMPLETE
-- ============================================
