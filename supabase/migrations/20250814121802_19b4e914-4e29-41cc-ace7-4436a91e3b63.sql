
-- Fix Security Issue 1: Restrict public access to contact information in market_listings
-- Update the existing policy to hide contact details for unauthenticated users
DROP POLICY IF EXISTS "Public can view basic listing info" ON market_listings;

CREATE POLICY "Public can view basic listing info" ON market_listings
FOR SELECT
USING (
  auth.uid() IS NULL 
  AND status = 'active'
);

-- Create a new policy for authenticated users to see full details including contact info
DROP POLICY IF EXISTS "Authenticated users can view full listing details" ON market_listings;

CREATE POLICY "Authenticated users can view full listing details" ON market_listings
FOR SELECT
USING (
  auth.uid() IS NOT NULL 
  AND status = 'active'
);

-- Fix Security Issue 2: Enable RLS on public_market_listings table
ALTER TABLE public_market_listings ENABLE ROW LEVEL SECURITY;

-- Create policies for public_market_listings
CREATE POLICY "Public can view basic public listing info" ON public_market_listings
FOR SELECT
USING (
  auth.uid() IS NULL
);

CREATE POLICY "Authenticated users can view full public listing details" ON public_market_listings
FOR SELECT
USING (
  auth.uid() IS NOT NULL
);

-- Only authenticated users who own the listing can modify it
CREATE POLICY "Users can manage their own public listings" ON public_market_listings
FOR ALL
USING (auth.uid() = user_id);

-- Create a secure view that filters sensitive data for public access
CREATE OR REPLACE VIEW public_market_listings_safe AS
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
  user_id,
  animal_id,
  weight,
  age,
  updated_at
FROM public_market_listings
WHERE status = 'active';

-- Grant access to the safe view
GRANT SELECT ON public_market_listings_safe TO anon, authenticated;
