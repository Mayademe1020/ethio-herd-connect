-- Create farm_profiles table for Ethiopian livestock management
-- Date: 2025-11-13

-- ============================================================================
-- Create farm_profiles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS farm_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_name TEXT NOT NULL,
  farm_prefix TEXT NOT NULL,
  is_verified_seller BOOLEAN DEFAULT false,
  location TEXT,
  owner_name TEXT,
  phone TEXT,
  profile_photo_url TEXT,
  seller_bio TEXT,
  seller_rating DECIMAL(2,1) CHECK (seller_rating >= 0 AND seller_rating <= 5),
  total_ratings INTEGER DEFAULT 0,
  verification_date TIMESTAMPTZ,
  calendar_preference TEXT DEFAULT 'gregorian' CHECK (calendar_preference IN ('gregorian', 'ethiopian')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE farm_profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own farm profile
CREATE POLICY "Users can view own farm profile"
  ON farm_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own farm profile
CREATE POLICY "Users can insert own farm profile"
  ON farm_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own farm profile
CREATE POLICY "Users can update own farm profile"
  ON farm_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_farm_profiles_user_id ON farm_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_farm_prefix ON farm_profiles(farm_prefix);
CREATE INDEX IF NOT EXISTS idx_farm_profiles_seller_rating ON farm_profiles(seller_rating) WHERE seller_rating IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_farm_profiles_calendar_preference ON farm_profiles(calendar_preference);

-- ============================================================================
-- Updated at triggers
-- ============================================================================

DROP TRIGGER IF EXISTS update_farm_profiles_updated_at ON farm_profiles;
CREATE TRIGGER update_farm_profiles_updated_at
  BEFORE UPDATE ON farm_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration complete
-- ============================================================================