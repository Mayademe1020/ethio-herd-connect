
-- Fix Security Definer Views
-- Drop existing SECURITY DEFINER views and recreate as SECURITY INVOKER (default)

-- Drop existing views
DROP VIEW IF EXISTS public.public_market_listings;
DROP VIEW IF EXISTS public.public_market_view;

-- Recreate public_market_listings as regular view (SECURITY INVOKER by default)
-- This view masks sensitive data for unauthenticated users
CREATE VIEW public.public_market_listings 
WITH (security_invoker = true)
AS
SELECT 
  market_listings.id,
  market_listings.title,
  market_listings.description,
  market_listings.location,
  market_listings.photos,
  market_listings.created_at,
  market_listings.status,
  market_listings.is_vet_verified,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.price 
    ELSE NULL::numeric 
  END AS price,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.contact_method 
    ELSE NULL::text 
  END AS contact_method,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.contact_value 
    ELSE NULL::text 
  END AS contact_value,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.user_id 
    ELSE NULL::uuid 
  END AS user_id,
  market_listings.animal_id,
  market_listings.weight,
  market_listings.age,
  market_listings.updated_at
FROM market_listings
WHERE market_listings.status = 'active';

-- Recreate public_market_view as regular view (SECURITY INVOKER by default)
-- This view completely hides contact information
CREATE VIEW public.public_market_view
WITH (security_invoker = true)
AS
SELECT 
  market_listings.id,
  market_listings.title,
  market_listings.description,
  market_listings.location,
  market_listings.photos,
  market_listings.created_at,
  market_listings.updated_at,
  market_listings.status,
  market_listings.is_vet_verified,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.price 
    ELSE NULL::numeric 
  END AS price,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN market_listings.user_id 
    ELSE NULL::uuid 
  END AS user_id,
  market_listings.animal_id,
  market_listings.weight,
  market_listings.age,
  NULL::text AS contact_method,
  NULL::text AS contact_value
FROM market_listings
WHERE market_listings.status = 'active';

-- Fix listing_views RLS to prevent unauthorized tracking
-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can track listing views" ON public.listing_views;
DROP POLICY IF EXISTS "Users can view their own listing views" ON public.listing_views;

-- Add secure policies for listing_views
-- Only allow inserting views (for tracking), restrict reading to listing owners
CREATE POLICY "Allow anonymous view tracking"
ON public.listing_views
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Listing owners can view their listing analytics"
ON public.listing_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM market_listings ml
    WHERE ml.id = listing_views.listing_id
      AND ml.user_id = auth.uid()
  )
);

-- Add comment explaining the security improvement
COMMENT ON VIEW public.public_market_listings IS 'Public marketplace view with SECURITY INVOKER - respects RLS policies of querying user. Sensitive data (price, contact info) only visible to authenticated users.';

COMMENT ON VIEW public.public_market_view IS 'Public marketplace view with SECURITY INVOKER - respects RLS policies of querying user. Contact information completely hidden, price only visible to authenticated users.';
