-- Performance Optimization: Add indexes for frequently queried fields
-- Migration: 20251025000000_performance_indexes.sql

-- Animals table indexes
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_is_active ON animals(is_active);
CREATE INDEX IF NOT EXISTS idx_animals_user_active ON animals(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_animals_created_at ON animals(created_at DESC);

-- Milk production indexes
CREATE INDEX IF NOT EXISTS idx_milk_production_user_id ON milk_production(user_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_animal_id ON milk_production(animal_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_recorded_at ON milk_production(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_milk_production_user_date ON milk_production(user_id, recorded_at DESC);

-- Market listings indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_user_id ON market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON market_listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_active ON market_listings(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_market_listings_price ON market_listings(price);

-- Buyer interests indexes
CREATE INDEX IF NOT EXISTS idx_buyer_interests_listing_id ON buyer_interests(listing_id);
CREATE INDEX IF NOT EXISTS idx_buyer_interests_buyer_id ON buyer_interests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_buyer_interests_status ON buyer_interests(status);
CREATE INDEX IF NOT EXISTS idx_buyer_interests_created_at ON buyer_interests(created_at DESC);

-- Offline queue indexes
CREATE INDEX IF NOT EXISTS idx_offline_queue_user_id ON offline_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_queue_status ON offline_queue(status);
CREATE INDEX IF NOT EXISTS idx_offline_queue_created_at ON offline_queue(created_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_animals_user_type_active ON animals(user_id, type, is_active);
CREATE INDEX IF NOT EXISTS idx_milk_production_animal_date ON milk_production(animal_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_listings_status_created ON market_listings(status, created_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_animals_user_id IS 'Optimize queries filtering by user_id';
COMMENT ON INDEX idx_animals_user_active IS 'Optimize queries for active animals by user';
COMMENT ON INDEX idx_milk_production_user_date IS 'Optimize queries for milk production by user and date';
COMMENT ON INDEX idx_market_listings_active IS 'Partial index for active listings only';
COMMENT ON INDEX idx_market_listings_status_created IS 'Optimize marketplace browse queries';
