-- MVP Schema Cleanup Migration
-- This migration simplifies the database schema for the 5-day MVP sprint
-- Date: 2025-10-23

-- ============================================================================
-- STEP 1: Drop non-essential tables
-- ============================================================================

-- Drop growth tracking tables
DROP TABLE IF EXISTS growth_records CASCADE;

-- Drop health tracking tables
DROP TABLE IF EXISTS health_records CASCADE;
DROP TABLE IF EXISTS health_submissions CASCADE;
DROP TABLE IF EXISTS vaccination_schedules CASCADE;

-- Drop farm management tables
DROP TABLE IF EXISTS farm_assistants CASCADE;
DROP TABLE IF EXISTS farm_profiles CASCADE;

-- Drop poultry management tables
DROP TABLE IF EXISTS poultry_groups CASCADE;

-- ============================================================================
-- STEP 2: Simplify animals table
-- ============================================================================

-- Remove non-essential columns from animals table
ALTER TABLE animals 
  DROP COLUMN IF EXISTS breed CASCADE,
  DROP COLUMN IF EXISTS birth_date CASCADE,
  DROP COLUMN IF EXISTS weight CASCADE,
  DROP COLUMN IF EXISTS height CASCADE,
  DROP COLUMN IF EXISTS health_status CASCADE,
  DROP COLUMN IF EXISTS parent_id CASCADE,
  DROP COLUMN IF EXISTS color CASCADE,
  DROP COLUMN IF EXISTS notes CASCADE,
  DROP COLUMN IF EXISTS estimated_value CASCADE,
  DROP COLUMN IF EXISTS acquisition_date CASCADE,
  DROP COLUMN IF EXISTS gender CASCADE;

-- Ensure essential columns exist
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Unnamed',
  ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'cattle',
  ADD COLUMN IF NOT EXISTS subtype TEXT,
  ADD COLUMN IF NOT EXISTS photo_url TEXT,
  ADD COLUMN IF NOT EXISTS registration_date TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- STEP 3: Simplify milk_production table
-- ============================================================================

-- Check if milk_production table exists, if not create it
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  amount NUMERIC(5,1),
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Remove non-essential columns
ALTER TABLE milk_production
  DROP COLUMN IF EXISTS quality CASCADE,
  DROP COLUMN IF EXISTS fat_content CASCADE,
  DROP COLUMN IF EXISTS morning_amount CASCADE,
  DROP COLUMN IF EXISTS evening_amount CASCADE;

-- Rename amount to liters if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'milk_production' AND column_name = 'amount'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'milk_production' AND column_name = 'liters'
  ) THEN
    ALTER TABLE milk_production RENAME COLUMN amount TO liters;
  END IF;
END $$;

-- Ensure liters column exists
ALTER TABLE milk_production
  ADD COLUMN IF NOT EXISTS liters NUMERIC(5,1) NOT NULL DEFAULT 0;

-- Add session column for morning/evening tracking
ALTER TABLE milk_production
  ADD COLUMN IF NOT EXISTS session TEXT DEFAULT 'morning';

-- ============================================================================
-- STEP 4: Create simplified market_listings table
-- ============================================================================

-- Drop existing market_listings if it exists to recreate with clean schema
DROP TABLE IF EXISTS market_listings CASCADE;

CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  is_negotiable BOOLEAN DEFAULT true,
  location TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 5: Create buyer_interests table
-- ============================================================================

-- Drop existing buyer_interests if it exists
DROP TABLE IF EXISTS buyer_interests CASCADE;

CREATE TABLE buyer_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 6: Create offline_queue table for offline sync
-- ============================================================================

CREATE TABLE IF NOT EXISTS offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);

-- ============================================================================
-- STEP 7: Add performance indexes
-- ============================================================================

-- Animals table indexes
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_is_active ON animals(is_active);
CREATE INDEX IF NOT EXISTS idx_animals_user_active ON animals(user_id, is_active);

-- Milk production indexes
CREATE INDEX IF NOT EXISTS idx_milk_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_animal_id ON milk_production(animal_id);
CREATE INDEX IF NOT EXISTS idx_milk_recorded_at ON milk_production(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_milk_user_date ON milk_production(user_id, recorded_at DESC);

-- Market listings indexes
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_active ON market_listings(status) WHERE status = 'active';

-- Buyer interests indexes
CREATE INDEX IF NOT EXISTS idx_interests_listing_id ON buyer_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_interests_buyer_id ON buyer_interests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_interests_status ON buyer_interests(status);

-- Offline queue indexes
CREATE INDEX IF NOT EXISTS idx_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_queue_created_at ON offline_queue(created_at);

-- ============================================================================
-- STEP 8: Add updated_at trigger for market_listings
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_market_listings_updated_at ON market_listings;
CREATE TRIGGER update_market_listings_updated_at
  BEFORE UPDATE ON market_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration complete
-- ============================================================================
