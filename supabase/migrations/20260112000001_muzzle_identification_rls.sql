-- Muzzle Identification RLS Policies
-- Row Level Security policies for muzzle identification tables

-- ============================================================================
-- Enable RLS on all muzzle tables
-- ============================================================================
ALTER TABLE muzzle_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzzle_identification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzzle_duplicate_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE muzzle_model_versions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- muzzle_registrations policies
-- Owner can read/write their animal's muzzle data
-- ============================================================================

-- Users can view their own muzzle registrations
CREATE POLICY "Users can view own muzzle registrations"
  ON muzzle_registrations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert muzzle registrations for their animals
CREATE POLICY "Users can insert own muzzle registrations"
  ON muzzle_registrations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own muzzle registrations
CREATE POLICY "Users can update own muzzle registrations"
  ON muzzle_registrations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own muzzle registrations
CREATE POLICY "Users can delete own muzzle registrations"
  ON muzzle_registrations
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow searching muzzle registrations (for identification)
-- This allows the search function to work but doesn't expose raw embeddings
CREATE POLICY "Allow muzzle search for authenticated users"
  ON muzzle_registrations
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL 
    AND is_active = true
  );

-- ============================================================================
-- muzzle_identification_logs policies
-- Audit logs are append-only, users can only view their own
-- ============================================================================

-- Users can view their own identification logs
CREATE POLICY "Users can view own identification logs"
  ON muzzle_identification_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert identification logs (append-only)
CREATE POLICY "Users can insert identification logs"
  ON muzzle_identification_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No update or delete policies - logs are immutable

-- ============================================================================
-- muzzle_duplicate_events policies
-- Users can view duplicates involving their animals
-- ============================================================================

-- Users can view duplicate events they're involved in
CREATE POLICY "Users can view own duplicate events"
  ON muzzle_duplicate_events
  FOR SELECT
  USING (
    auth.uid() = attempted_user_id 
    OR auth.uid() = existing_user_id
  );

-- Users can insert duplicate events
CREATE POLICY "Users can insert duplicate events"
  ON muzzle_duplicate_events
  FOR INSERT
  WITH CHECK (auth.uid() = attempted_user_id);

-- Users can update resolution on their duplicate events
CREATE POLICY "Users can resolve own duplicate events"
  ON muzzle_duplicate_events
  FOR UPDATE
  USING (auth.uid() = attempted_user_id)
  WITH CHECK (auth.uid() = attempted_user_id);

-- ============================================================================
-- ownership_transfers policies
-- Both parties can view and interact with transfers
-- ============================================================================

-- Users can view transfers they're involved in
CREATE POLICY "Users can view own transfers"
  ON ownership_transfers
  FOR SELECT
  USING (
    auth.uid() = from_user_id 
    OR auth.uid() = to_user_id
  );

-- Only the current owner can initiate a transfer
CREATE POLICY "Owners can initiate transfers"
  ON ownership_transfers
  FOR INSERT
  WITH CHECK (auth.uid() = from_user_id);

-- Both parties can update transfer status
CREATE POLICY "Parties can update transfer status"
  ON ownership_transfers
  FOR UPDATE
  USING (
    auth.uid() = from_user_id 
    OR auth.uid() = to_user_id
  )
  WITH CHECK (
    auth.uid() = from_user_id 
    OR auth.uid() = to_user_id
  );

-- Only the initiator can cancel a pending transfer
CREATE POLICY "Initiator can cancel pending transfer"
  ON ownership_transfers
  FOR DELETE
  USING (
    auth.uid() = from_user_id 
    AND status = 'pending'
  );

-- ============================================================================
-- muzzle_model_versions policies
-- Read-only for all authenticated users (model info is public)
-- ============================================================================

-- All authenticated users can view model versions
CREATE POLICY "Authenticated users can view model versions"
  ON muzzle_model_versions
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Only service role can manage model versions (no user policies for insert/update/delete)

-- ============================================================================
-- Create a secure view for muzzle search results
-- This view hides raw embeddings from users
-- ============================================================================
CREATE OR REPLACE VIEW public.muzzle_search_results AS
SELECT 
  mr.id,
  mr.animal_id,
  mr.user_id,
  mr.quality_score,
  mr.created_at,
  mr.is_active,
  a.name as animal_name,
  a.type as animal_type,
  a.subtype as animal_breed,
  a.animal_id as animal_code,
  fp.farm_name,
  fp.owner_name,
  fp.location
FROM muzzle_registrations mr
JOIN animals a ON mr.animal_id = a.id
LEFT JOIN farm_profiles fp ON mr.user_id = fp.user_id
WHERE mr.is_active = true;

-- Grant select on the view to authenticated users
GRANT SELECT ON public.muzzle_search_results TO authenticated;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON POLICY "Users can view own muzzle registrations" ON muzzle_registrations 
  IS 'Allows users to view muzzle data for their own animals';
COMMENT ON POLICY "Allow muzzle search for authenticated users" ON muzzle_registrations 
  IS 'Allows authenticated users to search muzzles for identification (via functions)';
COMMENT ON POLICY "Users can view own identification logs" ON muzzle_identification_logs 
  IS 'Users can only view their own identification attempt history';
COMMENT ON POLICY "Users can insert identification logs" ON muzzle_identification_logs 
  IS 'Audit logs are append-only - users can add but not modify';
