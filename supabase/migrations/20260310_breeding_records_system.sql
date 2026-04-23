-- Breeding Records System for EthioHerd Connect
-- Supports heat cycle tracking, mating records, pregnancy, and breeding history

-- Create breeding_records table
CREATE TABLE IF NOT EXISTS breeding_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  
  -- Record type: heat, mating, pregnancy_confirmed, birth
  record_type TEXT NOT NULL CHECK (record_type IN ('heat', 'mating', 'pregnancy_confirmed', 'birth', 'failed_mating')),
  
  -- Date of the breeding event
  event_date DATE NOT NULL,
  
  -- For heat cycles: heat cycle number, days since last heat
  heat_cycle_day INTEGER,
  heat_duration_days INTEGER,
  
  -- For mating: mating type (natural, AI), stud animal info
  mating_type TEXT CHECK (mating_type IN ('natural', 'artificial')),
  stud_animal_id UUID REFERENCES animals(id),
  stud_name TEXT,
  stud_breed TEXT,
  breeding_method TEXT,
  
  -- For pregnancy: expected due date
  expected_due_date DATE,
  pregnancy_confirmed_date DATE,
  
  -- For birth: actual birth date, offspring count
  actual_birth_date DATE,
  offspring_count INTEGER DEFAULT 1,
  offspring_ids UUID[],
  birth_notes TEXT,
  
  -- Outcome tracking
  outcome TEXT CHECK (outcome IN ('successful', 'failed', 'pending', 'unknown')),
  notes TEXT,
  
  -- Reminder settings
  reminder_enabled BOOLEAN DEFAULT true,
  reminder_days_before INTEGER[] DEFAULT ARRAY[21, 7, 3],
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE breeding_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breeding_records
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'breeding_records' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON breeding_records', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own breeding records"
  ON breeding_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breeding records"
  ON breeding_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own breeding records"
  ON breeding_records FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own breeding records"
  ON breeding_records FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_breeding_records_animal_id ON breeding_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_breeding_records_event_date ON breeding_records(event_date);
CREATE INDEX IF NOT EXISTS idx_breeding_records_record_type ON breeding_records(record_type);
CREATE INDEX IF NOT EXISTS idx_breeding_records_expected_due ON breeding_records(expected_due_date) WHERE expected_due_date IS NOT NULL;

-- Heat cycle presets table (Ethiopian-specific)
CREATE TABLE IF NOT EXISTS heat_cycle_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type TEXT NOT NULL CHECK (animal_type IN ('cattle', 'goat', 'sheep')),
  cycle_length_days INTEGER NOT NULL,
  heat_duration_hours INTEGER NOT NULL,
  gestation_days INTEGER NOT NULL,
  postpartum_heat_days INTEGER NOT NULL,
  min_age_months INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert Ethiopian/East African heat cycle data
INSERT INTO heat_cycle_presets (animal_type, cycle_length_days, heat_duration_hours, gestation_days, postpartum_heat_days, min_age_months) VALUES
  ('cattle', 21, 18, 283, 45, 15),  -- Zebu & crossbred
  ('goat', 18, 36, 150, 30, 7),       -- Ethiopian goats
  ('sheep', 17, 30, 147, 30, 7)       -- Ethiopian sheep
ON CONFLICT DO NOTHING;

-- Create breeding reminders table
CREATE TABLE IF NOT EXISTS breeding_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  breeding_record_id UUID REFERENCES breeding_records(id) ON DELETE CASCADE,
  
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('heat', 'mating', 'pregnancy_check', 'due_date', 'post_birth')),
  reminder_date DATE NOT NULL,
  message_am TEXT,
  message_en TEXT,
  sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE breeding_reminders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for breeding_reminders
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'breeding_reminders' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON breeding_reminders', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can view own breeding reminders"
  ON breeding_reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own breeding reminders"
  ON breeding_reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add breeding-related columns to animals table if not exists
ALTER TABLE animals ADD COLUMN IF NOT EXISTS breeding_status TEXT CHECK (breeding_status IN ('active', 'resting', 'inactive'));
ALTER TABLE animals ADD COLUMN IF NOT EXISTS last_heat_date DATE;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS last_mating_date DATE;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS breeding_count INTEGER DEFAULT 0;
ALTER TABLE animals ADD COLUMN IF NOT EXISTS successful_breeds INTEGER DEFAULT 0;

COMMENT ON TABLE breeding_records IS 'Complete breeding history including heat cycles, mating, pregnancy, and birth records';
COMMENT ON TABLE heat_cycle_presets IS 'Ethiopian-specific heat cycle and gestation data for cattle, goats, and sheep';
