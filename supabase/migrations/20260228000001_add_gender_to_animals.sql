-- Migration: Add gender column to animals table
-- This is critical for pregnancy tracking and milk production features

-- Add gender column to animals table
ALTER TABLE animals ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female'));

-- Add comment explaining the column
COMMENT ON COLUMN animals.gender IS 'Animal gender: male or female. Required for pregnancy and milk tracking.';

-- Create index for gender queries
CREATE INDEX IF NOT EXISTS idx_animals_gender ON animals(gender);

-- Update RLS policies to allow gender field
-- (Policies already exist, no changes needed)
