-- Fix security issue: Remove public access to contact information in market_listings

-- First, drop the existing public access policy
DROP POLICY IF EXISTS "Public can view basic listing info" ON public.market_listings;

-- Create a new policy that allows public users to view only non-sensitive fields
CREATE POLICY "Public can view basic listing info (no contact)" 
ON public.market_listings 
FOR SELECT 
USING (
  auth.uid() IS NULL 
  AND status = 'active'
);

-- However, we need to restrict what columns public users can access
-- Since RLS policies can't restrict columns, we'll create a view for public access
CREATE OR REPLACE VIEW public.public_market_view AS
SELECT 
  id,
  title,
  description,
  location,
  photos,
  created_at,
  updated_at,
  status,
  is_vet_verified,
  price,
  user_id,
  animal_id,
  weight,
  age,
  NULL as contact_method,  -- Hide from public
  NULL as contact_value    -- Hide from public
FROM public.market_listings
WHERE status = 'active';

-- Enable RLS on the view
ALTER VIEW public.public_market_view SET (security_barrier = true);

-- Grant SELECT access to public on the view
GRANT SELECT ON public.public_market_view TO public;
GRANT SELECT ON public.public_market_view TO anon;

-- Update the public policy to deny access to the main table for anonymous users
DROP POLICY IF EXISTS "Public can view basic listing info (no contact)" ON public.market_listings;

-- Ensure anonymous users cannot access the main table directly
CREATE POLICY "No public access to main table" 
ON public.market_listings 
FOR SELECT 
USING (auth.uid() IS NOT NULL);