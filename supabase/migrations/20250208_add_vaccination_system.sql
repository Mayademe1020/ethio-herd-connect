-- Add vaccination reminder tracking to health_records
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS reminder_sent_14 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_7 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_3 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS reminder_sent_0 BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS next_due_date DATE;

-- Create vaccine presets table
CREATE TABLE IF NOT EXISTS vaccine_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  interval_months INTEGER NOT NULL,
  animal_type VARCHAR(20) NOT NULL CHECK (animal_type IN ('cattle', 'goat', 'sheep')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Ethiopian/East African vaccines
INSERT INTO vaccine_presets (name, interval_months, animal_type) VALUES
  -- Cattle
  ('Anthrax', 6, 'cattle'),
  ('Blackleg', 6, 'cattle'),
  ('Foot-and-Mouth Disease', 6, 'cattle'),
  ('Lumpy Skin Disease', 12, 'cattle'),
  ('Brucellosis', 12, 'cattle'),
  ('CBPP', 12, 'cattle'),
  ('Trypanosomiasis', 6, 'cattle'),
  -- Goat
  ('PPR', 6, 'goat'),
  ('Sheep Pox', 12, 'goat'),
  ('Anthrax', 6, 'goat'),
  ('Blackleg', 6, 'goat'),
  -- Sheep
  ('PPR', 6, 'sheep'),
  ('Sheep Pox', 12, 'sheep'),
  ('Anthrax', 6, 'sheep'),
  ('Blackleg', 6, 'sheep'),
  ('Foot Rot', 6, 'sheep')
ON CONFLICT DO NOTHING;

-- Create index for reminder queries
CREATE INDEX IF NOT EXISTS idx_health_records_vaccination 
ON health_records(record_type, administered_date) 
WHERE record_type = 'vaccination';

COMMENT ON TABLE vaccine_presets IS 'Standard vaccination schedules for Ethiopian livestock';
