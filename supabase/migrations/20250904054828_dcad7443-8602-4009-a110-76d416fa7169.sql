-- Fix security vulnerability in public_market_view
-- This view currently exposes price and user_id to unauthenticated users
-- Update it to match the security model of public_market_listings

DROP VIEW IF EXISTS public.public_market_view;

CREATE VIEW public.public_market_view AS
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
    -- Only show price to authenticated users
    CASE
        WHEN auth.uid() IS NOT NULL THEN price
        ELSE NULL::numeric
    END AS price,
    -- Only show user_id to authenticated users  
    CASE
        WHEN auth.uid() IS NOT NULL THEN user_id
        ELSE NULL::uuid
    END AS user_id,
    animal_id,
    weight,
    age,
    -- Always hide contact information in this public view
    NULL::text AS contact_method,
    NULL::text AS contact_value
FROM market_listings
WHERE status = 'active';

-- Grant appropriate permissions
GRANT SELECT ON public.public_market_view TO public;
GRANT SELECT ON public.public_market_view TO authenticated;
GRANT SELECT ON public.public_market_view TO anon;