-- Migration: Add video support to marketplace listings
-- Date: 2025-11-05
-- Description: Adds video_url and video_thumbnail columns to market_listings table

-- Add video columns to market_listings table
ALTER TABLE market_listings 
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS video_thumbnail TEXT,
ADD COLUMN IF NOT EXISTS video_duration INTEGER; -- Duration in seconds

-- Add comment to columns
COMMENT ON COLUMN market_listings.video_url IS 'URL of the uploaded video (max 10 seconds, max 20MB)';
COMMENT ON COLUMN market_listings.video_thumbnail IS 'URL of the video thumbnail image';
COMMENT ON COLUMN market_listings.video_duration IS 'Duration of the video in seconds';

-- Note: Storage buckets and RLS policies are managed through Supabase Dashboard
-- The following buckets should be created manually or via Supabase CLI:
-- 1. Bucket: animal-photos (already exists, will be used for videos too)
--    - Folders: listings/videos/ and listings/thumbnails/
--    - Public: true
--    - File size limit: 20MB for videos, 100KB for thumbnails
--    - Allowed MIME types: video/mp4, video/quicktime, video/x-msvideo, image/jpeg

-- RLS Policies for video uploads (using existing animal-photos bucket):
-- 1. Users can upload videos to their own listings
-- 2. Anyone can view videos (public bucket)
-- 3. Users can delete videos from their own listings

-- Create index for video queries
CREATE INDEX IF NOT EXISTS idx_market_listings_video_url ON market_listings(video_url) WHERE video_url IS NOT NULL;
