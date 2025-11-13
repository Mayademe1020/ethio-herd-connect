-- Migration: Add edit tracking columns to animals and market_listings tables
-- Date: 2025-11-05
-- Purpose: Support edit functionality for animals and listings (Task 3.1)

-- Add edit tracking columns to animals table
ALTER TABLE animals 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Add edit tracking columns to market_listings table
ALTER TABLE market_listings 
ADD COLUMN IF NOT EXISTS last_edited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS edit_count INTEGER DEFAULT 0;

-- Create index for efficient queries on edited animals
CREATE INDEX IF NOT EXISTS idx_animals_last_edited 
ON animals(last_edited_at DESC) 
WHERE last_edited_at IS NOT NULL;

-- Create index for efficient queries on edited listings
CREATE INDEX IF NOT EXISTS idx_market_listings_last_edited 
ON market_listings(last_edited_at DESC) 
WHERE last_edited_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN animals.last_edited_at IS 'Timestamp of the last edit to this animal record';
COMMENT ON COLUMN animals.edit_count IS 'Number of times this animal record has been edited';
COMMENT ON COLUMN market_listings.last_edited_at IS 'Timestamp of the last edit to this listing';
COMMENT ON COLUMN market_listings.edit_count IS 'Number of times this listing has been edited';
