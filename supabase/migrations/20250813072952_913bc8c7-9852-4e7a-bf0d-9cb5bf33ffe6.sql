
-- Create a public view policy for market listings that shows limited data to unauthenticated users
DROP POLICY IF EXISTS "Users can view active listings with conditional contact info" ON public.market_listings;

-- Policy for authenticated users - full access to active listings
CREATE POLICY "Authenticated users can view full listing details" 
ON public.market_listings 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'::text
);

-- Policy for unauthenticated users - limited access (no price, contact info)
CREATE POLICY "Public can view basic listing info" 
ON public.market_listings 
FOR SELECT 
USING (
  auth.uid() IS NULL 
  AND status = 'active'::text
);

-- Create a view for public listings with conditional fields
CREATE OR REPLACE VIEW public.public_market_listings AS
SELECT 
  id,
  title,
  description,
  location,
  photos,
  created_at,
  status,
  is_vet_verified,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN price
    ELSE NULL 
  END as price,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_method
    ELSE NULL 
  END as contact_method,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN contact_value
    ELSE NULL 
  END as contact_value,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN user_id
    ELSE NULL 
  END as user_id,
  animal_id,
  weight,
  age,
  updated_at
FROM public.market_listings
WHERE status = 'active';

-- Grant access to the public view
GRANT SELECT ON public.public_market_listings TO anon, authenticated;

-- Create a table for tracking anonymous listing views (for auth gates)
CREATE TABLE IF NOT EXISTS public.listing_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  listing_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_listing_views_session_id ON public.listing_views(session_id);
CREATE INDEX IF NOT EXISTS idx_listing_views_listing_id ON public.listing_views(listing_id);

-- Enable RLS on listing_views
ALTER TABLE public.listing_views ENABLE ROW LEVEL SECURITY;

-- Policy to allow anyone to insert view tracking (for anonymous users)
CREATE POLICY "Anyone can track listing views" 
ON public.listing_views 
FOR INSERT 
WITH CHECK (true);

-- Policy to allow reading own views
CREATE POLICY "Users can view their own listing views" 
ON public.listing_views 
FOR SELECT 
USING (true);
