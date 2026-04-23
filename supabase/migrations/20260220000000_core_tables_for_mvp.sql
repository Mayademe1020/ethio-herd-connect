-- ============================================================================
-- ETHIO HERD CONNECT - CORE TABLES MIGRATION
-- Run this in Supabase SQL Editor to set up the database
-- ============================================================================

-- STEP 1: Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 2: Create profiles table (for onboarding)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  farmer_name TEXT,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 3: Create animals table
CREATE TABLE IF NOT EXISTS animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL DEFAULT 'Unnamed',
  type TEXT NOT NULL DEFAULT 'cattle',
  subtype TEXT,
  photo_url TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 4: Create milk_production table
CREATE TABLE IF NOT EXISTS milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  liters NUMERIC(5,1) NOT NULL DEFAULT 0,
  session TEXT DEFAULT 'morning',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 5: Create market_listings table
CREATE TABLE IF NOT EXISTS market_listings (
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

-- STEP 6: Create buyer_interests table
CREATE TABLE IF NOT EXISTS buyer_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'closed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- STEP 7: Create offline_queue table
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

-- STEP 8: Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- STEP 9: Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- STEP 10: Create RLS policies for animals
DROP POLICY IF EXISTS "Users can view own animals" ON animals;
DROP POLICY IF EXISTS "Users can insert own animals" ON animals;
DROP POLICY IF EXISTS "Users can update own animals" ON animals;
DROP POLICY IF EXISTS "Users can delete own animals" ON animals;

CREATE POLICY "Users can view own animals" ON animals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own animals" ON animals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own animals" ON animals FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own animals" ON animals FOR DELETE USING (auth.uid() = user_id);

-- STEP 11: Create RLS policies for milk_production
DROP POLICY IF EXISTS "Users can view own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can insert own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can update own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can delete own milk records" ON milk_production;

CREATE POLICY "Users can view own milk records" ON milk_production FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milk records" ON milk_production FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own milk records" ON milk_production FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own milk records" ON milk_production FOR DELETE USING (auth.uid() = user_id);

-- STEP 12: Create RLS policies for market_listings
DROP POLICY IF EXISTS "Anyone can view active listings" ON market_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON market_listings;

CREATE POLICY "Anyone can view active listings" ON market_listings FOR SELECT USING (status = 'active' OR auth.uid() = user_id);
CREATE POLICY "Users can insert own listings" ON market_listings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own listings" ON market_listings FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own listings" ON market_listings FOR DELETE USING (auth.uid() = user_id);

-- STEP 13: Create RLS policies for buyer_interests
DROP POLICY IF EXISTS "Buyers can create interests" ON buyer_interests;
DROP POLICY IF EXISTS "Users can view own interests" ON buyer_interests;
DROP POLICY IF EXISTS "Users can view listing interests" ON buyer_interests;

CREATE POLICY "Buyers can create interests" ON buyer_interests FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Users can view own interests" ON buyer_interests FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Users can view listing interests" ON buyer_interests FOR SELECT USING (auth.uid() IN (SELECT user_id FROM market_listings WHERE id = listing_id));

-- STEP 14: Create RLS policies for offline_queue
DROP POLICY IF EXISTS "Users can view own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can insert own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can update own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can delete own queue items" ON offline_queue;

CREATE POLICY "Users can view own queue items" ON offline_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own queue items" ON offline_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own queue items" ON offline_queue FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own queue items" ON offline_queue FOR DELETE USING (auth.uid() = user_id);

-- STEP 15: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_is_active ON animals(is_active);
CREATE INDEX IF NOT EXISTS idx_animals_user_active ON animals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_milk_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_animal_id ON milk_production(animal_id);
CREATE INDEX IF NOT EXISTS idx_milk_recorded_at ON milk_production(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_milk_user_date ON milk_production(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_interests_listing_id ON buyer_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_interests_buyer_id ON buyer_interests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_queue_status ON offline_queue(status);

-- STEP 16: Create updated_at trigger function
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
-- MIGRATION COMPLETE
-- ============================================================================
