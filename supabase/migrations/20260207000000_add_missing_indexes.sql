-- Add missing indexes on foreign keys for query optimization
-- Created: 2026-02-07
-- Purpose: Optimize database queries by adding indexes on foreign key columns

-- Animals table foreign keys
CREATE INDEX IF NOT EXISTS idx_animals_parent_id ON animals(parent_id) WHERE parent_id IS NOT NULL;

-- Health records table foreign keys
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);

-- Milk production table foreign keys
CREATE INDEX IF NOT EXISTS idx_milk_production_animal_id_recorded_at ON milk_production(animal_id, recorded_at DESC);

-- Market listings table foreign keys
CREATE INDEX IF NOT EXISTS idx_market_listings_animal_id_status ON market_listings(animal_id, status) WHERE status = 'active';

-- Buyer interests table foreign keys
CREATE INDEX IF NOT EXISTS idx_buyer_interests_listing_buyer ON buyer_interests(listing_id, buyer_id);

-- Reminders table foreign keys
CREATE INDEX IF NOT EXISTS idx_reminders_user_id_type ON reminders(user_id, type) WHERE is_active = true;

-- Feed rationing system indexes
CREATE INDEX IF NOT EXISTS idx_farmer_feed_plans_animal_season ON farmer_feed_plans(animal_id, season) WHERE is_active = true;

-- Muzzle identification indexes
CREATE INDEX IF NOT EXISTS idx_muzzle_registrations_animal_id ON muzzle_registrations(animal_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_muzzle_identification_logs_user_created ON muzzle_identification_logs(user_id, created_at DESC);

-- Analytics events optimization
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_date ON analytics_events(user_id, created_at DESC) WHERE event_name = 'user_action';

-- Farm profiles indexes
CREATE INDEX IF NOT EXISTS idx_farm_profiles_user_created ON farm_profiles(user_id, created_at DESC);

-- Animal status history optimization
CREATE INDEX IF NOT EXISTS idx_status_history_animal_date ON animal_status_history(animal_id, changed_at DESC);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_animals_user_type_status ON animals(user_id, type, status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_milk_production_user_animal_date ON milk_production(user_id, animal_id, recorded_at DESC);

-- Add comments for documentation
COMMENT ON INDEX idx_animals_parent_id IS 'Index for parent-child animal relationships';
COMMENT ON INDEX idx_health_records_animal_id IS 'Index for quick health record lookups by animal';
COMMENT ON INDEX idx_milk_production_animal_id_recorded_at IS 'Composite index for milk production queries by animal and date';
