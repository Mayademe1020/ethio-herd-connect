-- ========================================
-- COMPLETE FIX FOR MILK_PRODUCTION TABLE
-- Run this in Supabase SQL Editor
-- ========================================

-- Step 1: Add missing columns
ALTER TABLE milk_production 
  ADD COLUMN IF NOT EXISTS liters NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS session TEXT CHECK (session IN ('morning', 'evening')),
  ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ;

-- Step 2: Migrate existing data from total_yield to liters
UPDATE milk_production 
SET liters = total_yield 
WHERE liters IS NULL AND total_yield IS NOT NULL;

-- Step 3: Calculate liters from morning/evening yields if needed
UPDATE milk_production 
SET liters = COALESCE(morning_yield, 0) + COALESCE(evening_yield, 0)
WHERE liters IS NULL AND (morning_yield IS NOT NULL OR evening_yield IS NOT NULL);

-- Step 4: Set default session based on existing data
UPDATE milk_production 
SET session = CASE 
  WHEN morning_yield > 0 AND (evening_yield IS NULL OR evening_yield = 0) THEN 'morning'
  WHEN evening_yield > 0 AND (morning_yield IS NULL OR morning_yield = 0) THEN 'evening'
  ELSE 'morning'
END
WHERE session IS NULL;

-- Step 5: Copy created_at to recorded_at for existing records
UPDATE milk_production 
SET recorded_at = created_at 
WHERE recorded_at IS NULL AND created_at IS NOT NULL;

-- Step 6: If production_date exists, use it for recorded_at
UPDATE milk_production 
SET recorded_at = production_date::timestamptz 
WHERE recorded_at IS NULL AND production_date IS NOT NULL;

-- Step 7: Set defaults for any remaining NULL values
UPDATE milk_production 
SET liters = 0 
WHERE liters IS NULL;

UPDATE milk_production 
SET session = 'morning' 
WHERE session IS NULL;

UPDATE milk_production 
SET recorded_at = NOW() 
WHERE recorded_at IS NULL;

-- Step 8: Make columns NOT NULL with defaults
ALTER TABLE milk_production 
  ALTER COLUMN liters SET NOT NULL,
  ALTER COLUMN liters SET DEFAULT 0,
  ALTER COLUMN recorded_at SET NOT NULL,
  ALTER COLUMN recorded_at SET DEFAULT NOW();

-- Step 9: Add helpful comments
COMMENT ON COLUMN milk_production.liters IS 'Amount of milk in liters for this recording session';
COMMENT ON COLUMN milk_production.session IS 'Morning or evening milking session';
COMMENT ON COLUMN milk_production.recorded_at IS 'When the milk was recorded';

-- Step 10: Create index for performance
CREATE INDEX IF NOT EXISTS idx_milk_production_session ON milk_production(session);
CREATE INDEX IF NOT EXISTS idx_milk_production_recorded_at ON milk_production(recorded_at DESC);

-- Done! Check the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'milk_production'
ORDER BY ordinal_position;
