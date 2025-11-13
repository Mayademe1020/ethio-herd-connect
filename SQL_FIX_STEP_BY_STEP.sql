-- ============================================================================
-- FIX 406 ERRORS - RUN THESE SCRIPTS ONE AT A TIME
-- ============================================================================
-- Copy each script below and run it separately in Supabase SQL Editor
-- Go to: Supabase Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================================

-- ============================================================================
-- SCRIPT 1: Add animal_id column to animals table
-- ============================================================================
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Verify it worked
SELECT 'animal_id column added' as status;


-- ============================================================================
-- SCRIPT 2: Add status column to animals table
-- ============================================================================
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

UPDATE animals SET status = 'active' WHERE status IS NULL;

-- Verify it worked
SELECT 'status column added' as status;


-- ============================================================================
-- SCRIPT 3: Add date columns to animals table
-- ============================================================================
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Verify it worked
SELECT 'date columns added' as status;


-- ============================================================================
-- SCRIPT 4: Check if farm_profiles table exists and add columns
-- ============================================================================
-- First check if table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'farm_profiles';

-- If the table exists, run this:
ALTER TABLE farm_profiles
  ADD COLUMN IF NOT EXISTS farm_prefix TEXT,
  ADD COLUMN IF NOT EXISTS farm_name TEXT;

-- Verify it worked
SELECT 'farm_profiles columns added' as status;


-- ============================================================================
-- SCRIPT 5: Verify all columns were added
-- ============================================================================
-- Check animals table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('animal_id', 'status', 'sold_date', 'deceased_date', 'transferred_date')
ORDER BY column_name;

-- Check farm_profiles columns (if table exists)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'farm_profiles' 
  AND column_name IN ('farm_prefix', 'farm_name')
ORDER BY column_name;
