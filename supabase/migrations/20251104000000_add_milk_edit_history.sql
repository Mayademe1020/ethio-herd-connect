-- Migration: Add milk edit history table
-- Purpose: Track all edits made to milk production records
-- Date: 2025-11-04

-- Create milk_edit_history table
CREATE TABLE IF NOT EXISTS milk_edit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milk_record_id UUID NOT NULL REFERENCES milk_production(id) ON DELETE CASCADE,
  previous_liters NUMERIC NOT NULL,
  new_liters NUMERIC NOT NULL,
  previous_session TEXT NOT NULL,
  new_session TEXT NOT NULL,
  edited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  edited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_milk_edit_history_record_id ON milk_edit_history(milk_record_id);
CREATE INDEX idx_milk_edit_history_edited_by ON milk_edit_history(edited_by);
CREATE INDEX idx_milk_edit_history_edited_at ON milk_edit_history(edited_at DESC);

-- Add columns to milk_production table for tracking edits
ALTER TABLE milk_production 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS edited_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_milk_production_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_milk_production_timestamp_trigger ON milk_production;
CREATE TRIGGER update_milk_production_timestamp_trigger
  BEFORE UPDATE ON milk_production
  FOR EACH ROW
  EXECUTE FUNCTION update_milk_production_timestamp();

-- Create trigger to increment edit_count
CREATE OR REPLACE FUNCTION increment_milk_edit_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.liters != NEW.liters OR OLD.session != NEW.session THEN
    NEW.edit_count = COALESCE(OLD.edit_count, 0) + 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_milk_edit_count_trigger ON milk_production;
CREATE TRIGGER increment_milk_edit_count_trigger
  BEFORE UPDATE ON milk_production
  FOR EACH ROW
  EXECUTE FUNCTION increment_milk_edit_count();

-- Enable RLS on milk_edit_history
ALTER TABLE milk_edit_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for milk_edit_history
-- Users can view edit history for their own milk records
CREATE POLICY "Users can view their own milk edit history"
  ON milk_edit_history
  FOR SELECT
  USING (
    edited_by = auth.uid()
    OR
    milk_record_id IN (
      SELECT id FROM milk_production WHERE user_id = auth.uid()
    )
  );

-- Users can insert edit history for their own milk records
CREATE POLICY "Users can create edit history for their own records"
  ON milk_edit_history
  FOR INSERT
  WITH CHECK (
    edited_by = auth.uid()
    AND
    milk_record_id IN (
      SELECT id FROM milk_production WHERE user_id = auth.uid()
    )
  );

-- Add comment for documentation
COMMENT ON TABLE milk_edit_history IS 'Tracks all edits made to milk production records for audit purposes';
COMMENT ON COLUMN milk_edit_history.milk_record_id IS 'Reference to the milk production record that was edited';
COMMENT ON COLUMN milk_edit_history.previous_liters IS 'Amount before the edit';
COMMENT ON COLUMN milk_edit_history.new_liters IS 'Amount after the edit';
COMMENT ON COLUMN milk_edit_history.previous_session IS 'Session before the edit (morning/afternoon)';
COMMENT ON COLUMN milk_edit_history.new_session IS 'Session after the edit (morning/afternoon)';
COMMENT ON COLUMN milk_edit_history.edited_by IS 'User who made the edit';
COMMENT ON COLUMN milk_edit_history.edited_at IS 'Timestamp when the edit was made';
