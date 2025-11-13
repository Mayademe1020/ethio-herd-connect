-- Add Animal Status System for Professional Livestock Management
-- Date: 2025-11-03

-- ============================================================================
-- Add status column to animals table
-- ============================================================================

ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'deceased', 'culled', 'lost', 'transferred', 'quarantine'));

-- Add status-specific date columns
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

-- ============================================================================
-- Create animal status history table for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS animal_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id TEXT REFERENCES animals(animal_id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  details JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS idx_status_history_animal_id ON animal_status_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON animal_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON animal_status_history(changed_by);

-- ============================================================================
-- Update existing animals to have 'active' status
-- ============================================================================

UPDATE animals
SET status = 'active'
WHERE status IS NULL AND animal_id IS NOT NULL;

-- ============================================================================
-- Add RLS policies for status history
-- ============================================================================

ALTER TABLE animal_status_history ENABLE ROW LEVEL SECURITY;

-- Skip RLS policies for now - will add them manually if needed
-- CREATE POLICY "Users can view status history for own animals"
--   ON animal_status_history FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM animals
--       WHERE animals.animal_id::text = animal_status_history.animal_id
--       AND animals.user_id = auth.uid()
--     )
--   );

-- Skip RLS policies for now - will add them manually if needed
-- CREATE POLICY "Users can insert status history for own animals"
--   ON animal_status_history FOR INSERT
--   WITH CHECK (
--     EXISTS (
--       SELECT 1 FROM animals
--       WHERE animals.animal_id::text = animal_status_history.animal_id
--       AND animals.user_id = auth.uid()
--     )
--   );

-- ============================================================================
-- Migration complete
-- ============================================================================