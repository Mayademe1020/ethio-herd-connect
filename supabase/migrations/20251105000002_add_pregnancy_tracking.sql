-- Add pregnancy tracking columns to animals table
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS pregnancy_status TEXT DEFAULT 'not_pregnant' CHECK (pregnancy_status IN ('not_pregnant', 'pregnant', 'delivered')),
ADD COLUMN IF NOT EXISTS pregnancy_data JSONB DEFAULT '[]'::jsonb;

-- Add comment for documentation
COMMENT ON COLUMN animals.pregnancy_status IS 'Current pregnancy status: not_pregnant, pregnant, or delivered';
COMMENT ON COLUMN animals.pregnancy_data IS 'Array of pregnancy records with breeding_date, expected_delivery, actual_delivery, status, offspring_id, notes';

-- Create index for querying pregnant animals
CREATE INDEX IF NOT EXISTS idx_animals_pregnancy_status ON animals(pregnancy_status) WHERE pregnancy_status = 'pregnant';

-- Create index for user's pregnant animals
CREATE INDEX IF NOT EXISTS idx_animals_user_pregnancy ON animals(user_id, pregnancy_status) WHERE pregnancy_status IN ('pregnant', 'delivered');

-- Update RLS policies to include pregnancy data
-- The existing RLS policies should already cover these columns since they apply to the entire animals table
-- But let's verify the policy exists

DO $$
BEGIN
  -- Check if the policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'animals' 
    AND policyname = 'Users can view their own animals'
  ) THEN
    CREATE POLICY "Users can view their own animals"
      ON animals FOR SELECT
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'animals' 
    AND policyname = 'Users can update their own animals'
  ) THEN
    CREATE POLICY "Users can update their own animals"
      ON animals FOR UPDATE
      USING (auth.uid() = user_id);
  END IF;
END $$;
