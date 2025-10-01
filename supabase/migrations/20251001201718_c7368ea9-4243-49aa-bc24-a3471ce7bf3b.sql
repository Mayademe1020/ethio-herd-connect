-- Fix public_market_listings RLS protection
-- This view needs proper security to prevent scraping of contact information

-- Drop the existing view (it's a regular view, not materialized)
DROP VIEW IF EXISTS public.public_market_listings CASCADE;

-- Recreate as a SECURITY INVOKER view that respects the underlying table's RLS policies
-- This view masks contact information for users who don't have access
CREATE OR REPLACE VIEW public.public_market_listings
WITH (security_invoker = true)
AS
SELECT 
  ml.id,
  ml.created_at,
  ml.updated_at,
  ml.is_vet_verified,
  ml.price,
  ml.user_id,
  ml.animal_id,
  ml.weight,
  ml.age,
  ml.title,
  ml.description,
  ml.location,
  ml.photos,
  ml.status,
  -- Conditionally show contact information only if user has access
  CASE 
    WHEN public.can_access_listing_contact(ml.id) THEN ml.contact_method
    ELSE NULL
  END as contact_method,
  CASE 
    WHEN public.can_access_listing_contact(ml.id) THEN ml.contact_value
    ELSE '***HIDDEN***'::text
  END as contact_value
FROM public.market_listings ml
WHERE ml.status = 'active';

-- Add helpful comment
COMMENT ON VIEW public.public_market_listings IS 'Secure view of active market listings. Contact information is masked for users without proper access. Uses SECURITY INVOKER to respect RLS policies from market_listings table. Prevents mass scraping of seller contact details.';

-- Grant access to the view
GRANT SELECT ON public.public_market_listings TO anon, authenticated;