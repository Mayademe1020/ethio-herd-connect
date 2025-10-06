-- Create favorites table for marketplace listings
CREATE TABLE IF NOT EXISTS public.listing_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.market_listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_listing_favorites_user_id ON public.listing_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_listing_favorites_listing_id ON public.listing_favorites(listing_id);

-- Enable RLS
ALTER TABLE public.listing_favorites ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can manage their own favorites
CREATE POLICY "Users can view their own favorites"
  ON public.listing_favorites
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON public.listing_favorites
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON public.listing_favorites
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Add comment
COMMENT ON TABLE public.listing_favorites IS 'Stores user favorites for marketplace listings. Each user can favorite multiple listings.';
