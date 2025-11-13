-- Add animal_id column to animals table
-- This column stores a human-readable unique identifier for each animal
-- Format: {FarmName}-{AnimalCode}-{Number}-{Year}
-- Example: AbebeFarm-COW-001-2025

-- Add the column
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

-- Create unique index on animal_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN animals.animal_id IS 'Human-readable unique identifier for the animal (e.g., AbebeFarm-COW-001-2025)';
