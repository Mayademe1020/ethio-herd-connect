-- Fix security definer function by adding proper search_path
CREATE OR REPLACE FUNCTION public.can_view_contact_info(listing_user_id uuid, listing_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public', 'pg_temp'
AS $function$
BEGIN
  -- Return true if user is the listing owner
  IF auth.uid() = listing_user_id THEN
    RETURN TRUE;
  END IF;
  
  -- Return true if user has approved interest in this listing
  IF EXISTS (
    SELECT 1 FROM buyer_interests 
    WHERE listing_id = can_view_contact_info.listing_id
    AND buyer_user_id = auth.uid() 
    AND status = 'approved'
  ) THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$function$;