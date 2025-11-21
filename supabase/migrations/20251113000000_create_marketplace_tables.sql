-- Create marketplace tables for Ethiopian livestock trading platform
-- Date: 2025-11-13

-- ============================================================================
-- Create market_listings table
-- ============================================================================

CREATE TABLE IF NOT EXISTS market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES animals(id) ON DELETE CASCADE NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  is_negotiable BOOLEAN DEFAULT true,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'sold', 'cancelled')),
  views_count INTEGER DEFAULT 0,
  contact_phone TEXT,
  description TEXT,
  health_status TEXT CHECK (health_status IN ('excellent', 'good', 'fair', 'poor')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create buyer_interests table
-- ============================================================================

CREATE TABLE IF NOT EXISTS buyer_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  contact_method TEXT DEFAULT 'phone' CHECK (contact_method IN ('phone', 'whatsapp', 'telegram')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'sold')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(listing_id, buyer_id)
);

-- ============================================================================
-- Create marketplace_media table
-- ============================================================================

CREATE TABLE IF NOT EXISTS marketplace_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size INTEGER,
  duration_seconds INTEGER, -- for videos
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create video_verifications table
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) ON DELETE CASCADE NOT NULL,
  verifier_id UUID REFERENCES auth.users(id),
  verification_fee DECIMAL(8,2) DEFAULT 200.00,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  video_url TEXT,
  verification_notes TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create payment_transactions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('listing_fee', 'verification_fee', 'advertising', 'subscription')),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'ETB',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT CHECK (payment_method IN ('telebirr', 'cbe_bank', 'cash', 'other')),
  reference_id TEXT, -- external payment reference
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- ============================================================================
-- Create advertising_campaigns table
-- ============================================================================

CREATE TABLE IF NOT EXISTS advertising_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  campaign_name TEXT NOT NULL,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('banner', 'featured_listing', 'sponsored_search')),
  target_audience TEXT, -- e.g., 'veterinarians', 'feed_suppliers', 'dairy_farmers'
  budget_amount DECIMAL(10,2),
  daily_budget DECIMAL(8,2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  start_date DATE,
  end_date DATE,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE market_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE buyer_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertising_campaigns ENABLE ROW LEVEL SECURITY;

-- Market listings policies
CREATE POLICY "Users can view active listings"
  ON market_listings FOR SELECT
  USING (status = 'active' OR user_id = auth.uid());

CREATE POLICY "Users can create their own listings"
  ON market_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listings"
  ON market_listings FOR UPDATE
  USING (auth.uid() = user_id);

-- Buyer interests policies
CREATE POLICY "Users can view interests on their listings"
  ON buyer_interests FOR SELECT
  USING (
    buyer_id = auth.uid() OR
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Users can express interest in listings"
  ON buyer_interests FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own interests"
  ON buyer_interests FOR UPDATE
  USING (auth.uid() = buyer_id);

-- Media policies
CREATE POLICY "Users can view media for active listings"
  ON marketplace_media FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND (status = 'active' OR user_id = auth.uid()))
  );

CREATE POLICY "Users can manage media for their listings"
  ON marketplace_media FOR ALL
  USING (
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND user_id = auth.uid())
  );

-- Video verification policies
CREATE POLICY "Users can view verifications for their listings"
  ON video_verifications FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM market_listings WHERE id = listing_id AND user_id = auth.uid())
  );

CREATE POLICY "Verifiers can manage verifications"
  ON video_verifications FOR ALL
  USING (auth.uid() = verifier_id);

-- Payment policies
CREATE POLICY "Users can view their own transactions"
  ON payment_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create transactions"
  ON payment_transactions FOR INSERT
  WITH CHECK (true);

-- Advertising policies
CREATE POLICY "Users can view active campaigns"
  ON advertising_campaigns FOR SELECT
  USING (status = 'active' OR advertiser_id = auth.uid());

CREATE POLICY "Users can manage their campaigns"
  ON advertising_campaigns FOR ALL
  USING (auth.uid() = advertiser_id);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_market_listings_user_id ON market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_animal_id ON market_listings(animal_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON market_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_market_listings_price ON market_listings(price);

CREATE INDEX IF NOT EXISTS idx_buyer_interests_listing_id ON buyer_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_buyer_interests_buyer_id ON buyer_interests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_interests_status ON buyer_interests(status);

CREATE INDEX IF NOT EXISTS idx_marketplace_media_listing_id ON marketplace_media(listing_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_media_type ON marketplace_media(media_type);

CREATE INDEX IF NOT EXISTS idx_video_verifications_listing_id ON video_verifications(listing_id);
CREATE INDEX IF NOT EXISTS idx_video_verifications_status ON video_verifications(status);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_type ON payment_transactions(transaction_type);

CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_advertiser_id ON advertising_campaigns(advertiser_id);
CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_status ON advertising_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_advertising_campaigns_type ON advertising_campaigns(campaign_type);

-- ============================================================================
-- Updated at triggers
-- ============================================================================

CREATE TRIGGER update_market_listings_updated_at
  BEFORE UPDATE ON market_listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_buyer_interests_updated_at
  BEFORE UPDATE ON buyer_interests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertising_campaigns_updated_at
  BEFORE UPDATE ON advertising_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Migration complete
-- ============================================================================