-- Add Animal ID column to animals table
-- Date: 2025-10-27

-- ============================================================================
-- Add animal_id column
-- ============================================================================

ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT UNIQUE;

-- Create index for animal_id lookups
CREATE INDEX IF NOT EXISTS idx_animals_animal_id ON animals(animal_id);

-- Add comment
COMMENT ON COLUMN animals.animal_id IS 'Unique animal identifier in format: FarmName-AnimalCode-###-Year';

-- ============================================================================
-- Migration complete
-- ============================================================================
