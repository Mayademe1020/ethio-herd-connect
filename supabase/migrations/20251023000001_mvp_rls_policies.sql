-- MVP RLS Policies Migration
-- This migration sets up Row Level Security policies for the simplified MVP schema
-- Date: 2025-10-23

-- ============================================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================================

ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_queue ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop existing policies to start fresh
-- ============================================================================

-- Animals policies
DROP POLICY IF EXISTS "Users can view own animals" ON animals;
DROP POLICY IF EXISTS "Users can insert own animals" ON animals;
DROP POLICY IF EXISTS "Users can update own animals" ON animals;
DROP POLICY IF EXISTS "Users can delete own animals" ON animals;

-- Milk production policies
DROP POLICY IF EXISTS "Users can view own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can insert own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can update own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can delete own milk records" ON milk_production;

-- Market listings policies
DROP POLICY IF EXISTS "Anyone can view active listings" ON market_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON market_listings;

-- Buyer interests policies
DROP POLICY IF EXISTS "Buyers can create interests" ON buyer_interests;
DROP POLICY IF EXISTS "Users can view own interests" ON buyer_interests;
DROP POLICY IF EXISTS "Sellers can view interests on their listings" ON buyer_interests;
DROP POLICY IF EXISTS "Users can update own interests" ON buyer_interests;

-- Offline queue policies
DROP POLICY IF EXISTS "Users can view own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can insert own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can update own queue items" ON offline_queue;
DROP POLICY IF EXISTS "Users can delete own queue items" ON offline_queue;

-- ============================================================================
-- STEP 3: Animals table policies
-- ============================================================================

-- Users can view their own animals
CREATE POLICY "Users can view own animals"
  ON animals FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own animals
CREATE POLICY "Users can insert own animals"
  ON animals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own animals
CREATE POLICY "Users can update own animals"
  ON animals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete (soft delete) their own animals
CREATE POLICY "Users can delete own animals"
  ON animals FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Milk production table policies
-- ============================================================================

-- Users can view their own milk records
CREATE POLICY "Users can view own milk records"
  ON milk_production FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own milk records
CREATE POLICY "Users can insert own milk records"
  ON milk_production FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own milk records
CREATE POLICY "Users can update own milk records"
  ON milk_production FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own milk records
CREATE POLICY "Users can delete own milk records"
  ON milk_production FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 5: Market listings table policies
-- ============================================================================

-- Anyone (authenticated) can view active marketplace listings
CREATE POLICY "Anyone can view active listings"
  ON market_listings FOR SELECT
  USING (
    status = 'active' OR 
    auth.uid() = user_id
  );

-- Users can insert their own listings
CREATE POLICY "Users can insert own listings"
  ON market_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own listings
CREATE POLICY "Users can update own listings"
  ON market_listings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own listings
CREATE POLICY "Users can delete own listings"
  ON market_listings FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 6: Buyer interests table policies
-- ============================================================================

-- Buyers can create interests on any active listing
CREATE POLICY "Buyers can create interests"
  ON buyer_interests FOR INSERT
  WITH CHECK (
    auth.uid() = buyer_id AND
    EXISTS (
      SELECT 1 FROM market_listings 
      WHERE id = listing_id AND status = 'active'
    )
  );

-- Users can view interests they created (as buyers)
CREATE POLICY "Users can view own interests"
  ON buyer_interests FOR SELECT
  USING (auth.uid() = buyer_id);

-- Sellers can view interests on their listings
CREATE POLICY "Sellers can view interests on their listings"
  ON buyer_interests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM market_listings 
      WHERE market_listings.id = buyer_interests.listing_id 
      AND market_listings.user_id = auth.uid()
    )
  );

-- Users can update their own interests
CREATE POLICY "Users can update own interests"
  ON buyer_interests FOR UPDATE
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

-- Sellers can update interests on their listings (to mark as contacted)
CREATE POLICY "Sellers can update interests on their listings"
  ON buyer_interests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM market_listings 
      WHERE market_listings.id = buyer_interests.listing_id 
      AND market_listings.user_id = auth.uid()
    )
  );

-- ============================================================================
-- STEP 7: Offline queue table policies
-- ============================================================================

-- Users can view their own queue items
CREATE POLICY "Users can view own queue items"
  ON offline_queue FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own queue items
CREATE POLICY "Users can insert own queue items"
  ON offline_queue FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own queue items
CREATE POLICY "Users can update own queue items"
  ON offline_queue FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own queue items
CREATE POLICY "Users can delete own queue items"
  ON offline_queue FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Migration complete
-- ============================================================================
