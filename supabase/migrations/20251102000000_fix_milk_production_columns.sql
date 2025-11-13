-- Fix milk_production table to match code expectations
-- Migration: 20251102000000_fix_milk_production_columns.sql

-- Add missing columns that code expects
ALTER TABLE milk_production 
  ADD COLUMN IF NOT EXISTS liters NUMERIC(5,1),
  ADD COLUMN IF NOT EXISTS session TEXT CHECK (session IN ('morning', 'evening')),
  ADD COLUMN IF NOT EXISTS recorded_at TIMESTAMPTZ;

-- If total_yield exists, copy it to liters for existing records
UPDATE milk_production 
SET liters = total_yield 
WHERE liters IS NULL AND total_yield IS NOT NULL;

-- If morning_yield or evening_yield exist, calculate liters
UPDATE milk_production 
SET liters = COALESCE(morning_yield, 0) + COALESCE(evening_yield, 0)
WHERE liters IS NULL AND (morning_yield IS NOT NULL OR evening_yield IS NOT NULL);

-- Set default session based on existing data
UPDATE milk_production 
SET session = CASE 
  WHEN morning_yield > 0 AND (evening_yield IS NULL OR evening_yield = 0) THEN 'morning'
  WHEN evening_yield > 0 AND (morning_yield IS NULL OR morning_yield = 0) THEN 'evening'
  ELSE 'morning'
END
WHERE session IS NULL;

-- Copy created_at to recorded_at for existing records
UPDATE milk_production 
SET recorded_at = created_at 
WHERE recorded_at IS NULL AND created_at IS NOT NULL;

-- If production_date exists, use it for recorded_at
UPDATE milk_production 
SET recorded_at = production_date::timestamptz 
WHERE recorded_at IS NULL AND production_date IS NOT NULL;

-- Make liters and recorded_at NOT NULL after data migration
ALTER TABLE milk_production 
  ALTER COLUMN liters SET NOT NULL,
  ALTER COLUMN liters SET DEFAULT 0,
  ALTER COLUMN recorded_at SET NOT NULL,
  ALTER COLUMN recorded_at SET DEFAULT NOW();

-- Add comments
COMMENT ON COLUMN milk_production.liters IS 'Amount of milk in liters for this recording session';
COMMENT ON COLUMN milk_production.session IS 'Morning or evening milking session';
COMMENT ON COLUMN milk_production.recorded_at IS 'When the milk was recorded';

-- Create index for common queries
CREATE INDEX IF NOT EXISTS idx_milk_production_session ON milk_production(session);
