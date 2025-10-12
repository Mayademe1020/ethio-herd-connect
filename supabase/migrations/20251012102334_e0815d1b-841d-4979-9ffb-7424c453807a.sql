-- Phase 3: Backend Enhancements for Marketplace

-- ============================================
-- 1. CREATE STORAGE BUCKET FOR LISTING PHOTOS
-- ============================================

-- Create listing-photos bucket (public for easy display)
INSERT INTO storage.buckets (id, name, public)
VALUES ('listing-photos', 'listing-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for listing photos
CREATE POLICY "Anyone can view listing photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'listing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own listing photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'listing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own listing photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'listing-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- 2. ENHANCE USER PROFILES WITH RATINGS & VERIFICATION
-- ============================================

-- Add seller rating and verification columns to farm_profiles
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS seller_rating DECIMAL(2,1) DEFAULT NULL CHECK (seller_rating >= 0 AND seller_rating <= 5),
ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_verified_seller BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS seller_bio TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT DEFAULT NULL;

-- Create seller ratings table for detailed rating tracking
CREATE TABLE IF NOT EXISTS public.seller_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_user_id UUID NOT NULL,
  buyer_user_id UUID NOT NULL,
  listing_id UUID REFERENCES public.market_listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(seller_user_id, buyer_user_id, listing_id)
);

-- Enable RLS on seller_ratings
ALTER TABLE public.seller_ratings ENABLE ROW LEVEL SECURITY;

-- RLS policies for seller_ratings
CREATE POLICY "Anyone can view seller ratings"
ON public.seller_ratings FOR SELECT
USING (true);

CREATE POLICY "Buyers can create ratings for completed transactions"
ON public.seller_ratings FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = buyer_user_id
  AND EXISTS (
    SELECT 1 FROM public.buyer_interests bi
    WHERE bi.listing_id = seller_ratings.listing_id
    AND bi.buyer_user_id = auth.uid()
    AND bi.status = 'approved'
  )
);

CREATE POLICY "Buyers can update their own ratings"
ON public.seller_ratings FOR UPDATE
TO authenticated
USING (auth.uid() = buyer_user_id);

-- ============================================
-- 3. CREATE FUNCTION TO UPDATE SELLER RATING
-- ============================================

CREATE OR REPLACE FUNCTION public.update_seller_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  rating_count INTEGER;
BEGIN
  -- Calculate average rating and count for the seller
  SELECT 
    ROUND(AVG(rating)::numeric, 1),
    COUNT(*)::integer
  INTO avg_rating, rating_count
  FROM public.seller_ratings
  WHERE seller_user_id = NEW.seller_user_id;

  -- Update farm_profiles with new rating
  UPDATE public.farm_profiles
  SET 
    seller_rating = avg_rating,
    total_ratings = rating_count,
    updated_at = now()
  WHERE user_id = NEW.seller_user_id;

  RETURN NEW;
END;
$$;

-- Create trigger to update seller rating automatically
DROP TRIGGER IF EXISTS trigger_update_seller_rating ON public.seller_ratings;
CREATE TRIGGER trigger_update_seller_rating
AFTER INSERT OR UPDATE OR DELETE ON public.seller_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_seller_rating();

-- ============================================
-- 4. ADD INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_seller_ratings_seller 
ON public.seller_ratings(seller_user_id);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_buyer 
ON public.seller_ratings(buyer_user_id);

CREATE INDEX IF NOT EXISTS idx_seller_ratings_listing 
ON public.seller_ratings(listing_id);

CREATE INDEX IF NOT EXISTS idx_farm_profiles_rating 
ON public.farm_profiles(seller_rating) WHERE seller_rating IS NOT NULL;