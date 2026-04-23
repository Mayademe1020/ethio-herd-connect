-- Add Reproductive Status Column for Visual Status Indicator System
-- Date: 2026-03-14

-- ============================================================================
-- Add reproductive_status column to animals table
-- This column tracks reproductive/lactation status for visual indicators
-- ============================================================================

ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS reproductive_status TEXT 
  CHECK (reproductive_status IN (
    'lactating',    -- 🟢 Currently producing milk
    'pregnant',     -- 🟡 Expecting calf/lamb/kid
    'dry',          -- 🔴 Not lactating / Open
    'inHeat',       -- 🔵 In estrus / Ready to breed
    'youngFemale',  -- ⚪ Not yet mature (under 12 months)
    'male'          -- ⚫ Male animal
  ));

-- Create index for reproductive status filtering
CREATE INDEX IF NOT EXISTS idx_animals_reproductive_status ON animals(reproductive_status);

-- ============================================================================
-- Migration complete
-- ============================================================================
