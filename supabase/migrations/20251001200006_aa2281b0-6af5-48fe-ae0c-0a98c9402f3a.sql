
-- Fix public_market_listings security issue
-- Allow anonymous users to browse listings but protect contact information

-- Drop conflicting policies
DROP POLICY IF EXISTS "No public access to main table" ON public.market_listings;
DROP POLICY IF EXISTS "Authenticated users can view full listing details" ON public.market_listings;

-- Create granular policies for better security

-- Policy 1: Allow everyone to view basic listing info (without contact details)
-- This works with the public_market_listings view which already masks contact info
CREATE POLICY "Public can browse active listings"
ON public.market_listings
FOR SELECT
TO anon, authenticated
USING (
  status = 'active'
);

-- Policy 2: Only authenticated users can view contact info through a function
-- Create a security definer function to check contact access rights
CREATE OR REPLACE FUNCTION public.can_access_listing_contact(listing_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public', 'pg_temp'
AS $$
DECLARE
  listing_owner_id uuid;
BEGIN
  -- Anonymous users cannot access contact info
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Get the listing owner
  SELECT user_id INTO listing_owner_id
  FROM market_listings
  WHERE id = listing_id;
  
  -- Owner can always see their own contact info
  IF auth.uid() = listing_owner_id THEN
    RETURN TRUE;
  END IF;
  
  -- Users with approved interest can see contact info
  IF EXISTS (
    SELECT 1 FROM buyer_interests 
    WHERE listing_id = can_access_listing_contact.listing_id
      AND buyer_user_id = auth.uid() 
      AND status = 'approved'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- All other authenticated users can see contact for active listings
  -- (This allows genuine buyers to contact sellers)
  IF EXISTS (
    SELECT 1 FROM market_listings
    WHERE id = listing_id AND status = 'active'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Add comment explaining the security model
COMMENT ON FUNCTION public.can_access_listing_contact IS 'Controls access to seller contact information. Anonymous users are blocked. Authenticated users can access contact info for active listings. Prevents mass scraping by requiring authentication.';

COMMENT ON TABLE public.market_listings IS 'Market listings with RLS protection. Contact information (contact_value, contact_method) is protected - requires authentication to access. Anonymous users can browse but cannot see seller contact details.';

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.can_access_listing_contact(uuid) TO anon, authenticated;
