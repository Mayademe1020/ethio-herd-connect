-- Migration: Add Custom Breed Support
-- Description: Adds columns to support custom breed descriptions and indexing for breed queries
-- Date: 2025-10-21

-- Add columns for custom breed support
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS breed_custom TEXT,
ADD COLUMN IF NOT EXISTS is_custom_breed BOOLEAN DEFAULT FALSE;

-- Add comment to explain the columns
COMMENT ON COLUMN animals.breed_custom IS 'User-provided breed description when exact breed is unknown';
COMMENT ON COLUMN animals.is_custom_breed IS 'Flag indicating if breed is a custom description rather than a standard breed';

-- Create index on breed column for faster breed queries
CREATE INDEX IF NOT EXISTS idx_animals_breed ON animals(breed);

-- Create composite index on type and breed for filtered queries
CREATE INDEX IF NOT EXISTS idx_animals_type_breed ON animals(type, breed);

-- Create index on is_custom_breed for filtering custom vs standard breeds
CREATE INDEX IF NOT EXISTS idx_animals_is_custom_breed ON animals(is_custom_breed) WHERE is_custom_breed = TRUE;

-- Update existing animals to set is_custom_breed = FALSE if NULL
UPDATE animals 
SET is_custom_breed = FALSE 
WHERE is_custom_breed IS NULL;
