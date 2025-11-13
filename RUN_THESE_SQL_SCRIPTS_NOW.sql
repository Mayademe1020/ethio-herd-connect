-- ============================================================================
-- FIX 406 ERRORS & ENABLE ANIMAL ID SYSTEM
-- Run these scripts ONE AT A TIME in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- SCRIPT 1: Add animal_id column to animals table
-- ============================================================================

ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Verify it worked:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' AND column_name = 'animal_id';

-- Expected: Should show "animal_id | text"


-- ============================================================================
-- SCRIPT 2: Add status column to animals table
-- ============================================================================

ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

UPDATE animals SET status = 'active' WHERE status IS NULL;

-- Verify it worked:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' AND column_name = 'status';

-- Expected: Should show "status | text"


-- ============================================================================
-- SCRIPT 3: Add date columns to animals table
-- ============================================================================

ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Verify it worked:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('sold_date', 'deceased_date', 'transferred_date');

-- Expected: Should show 3 rows with "timestamp with time zone"


-- ============================================================================
-- SCRIPT 4: Verify farm_profiles columns (IMPORTANT!)
-- ============================================================================

-- Check if farm_profiles has required columns:
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'farm_profiles' 
  AND column_name IN ('farm_prefix', 'farm_name');

-- Expected: Should show 2 rows

-- IF YOU DON'T SEE 2 ROWS, RUN THIS:
ALTER TABLE farm_profiles
  ADD COLUMN IF NOT EXISTS farm_prefix TEXT,
  ADD COLUMN IF NOT EXISTS farm_name TEXT;


-- ============================================================================
-- SCRIPT 5: Final verification - Check all columns exist
-- ============================================================================

-- Check animals table:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('animal_id', 'status', 'sold_date', 'deceased_date', 'transferred_date')
ORDER BY column_name;

-- Expected: 5 rows

-- Check farm_profiles table:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'farm_profiles' 
  AND column_name IN ('farm_prefix', 'farm_name')
ORDER BY column_name;

-- Expected: 2 rows


-- ============================================================================
-- DONE! Now refresh your browser and test:
-- 1. Register an animal - should see ID like "FEDBF-SHP-001"
-- 2. No 406 errors in console
-- 3. Photo preview works
-- 4. Duplicate milk recording blocked
-- ============================================================================
