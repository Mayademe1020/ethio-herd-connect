-- ============================================================================
-- FARM TEAM MANAGEMENT MIGRATION
-- Allows farm owners to invite employees/workers to share farm data
-- Date: 2026-03-28
-- ============================================================================

-- STEP 1: Create UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- STEP 2: Create new tables
-- ============================================================================

-- Farms table (the organization/unit that owns data)
CREATE TABLE IF NOT EXISTS farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Farm members (who has access to this farm's data)
CREATE TABLE IF NOT EXISTS farm_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'worker')),
  can_view_financials BOOLEAN DEFAULT FALSE,
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(farm_id, user_id)
);

-- Pending invitations (workers who haven't signed up yet)
CREATE TABLE IF NOT EXISTS farm_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('worker')) DEFAULT 'worker',
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (who recorded what)
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID REFERENCES farms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Add farm_id and recorded_by to existing tables
-- ============================================================================

-- Animals: add farm_id
ALTER TABLE animals ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES farms(id);

-- Milk production: add recorded_by
ALTER TABLE milk_production ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Health records: add recorded_by
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Growth records: add recorded_by
ALTER TABLE growth_records ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Financial records: add recorded_by
ALTER TABLE financial_records ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- Feed inventory: add recorded_by
ALTER TABLE feed_inventory ADD COLUMN IF NOT EXISTS recorded_by UUID REFERENCES auth.users(id);

-- ============================================================================
-- STEP 4: Enable RLS on new tables
-- ============================================================================

ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: Create helper functions for RLS
-- ============================================================================

-- Check if current user is a member of a farm
CREATE OR REPLACE FUNCTION public.is_farm_member(p_farm_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.farm_members
    WHERE farm_id = p_farm_id
      AND user_id = auth.uid()::uuid
      AND is_active = TRUE
  );
$$;

-- Check if current user has a specific role on a farm
CREATE OR REPLACE FUNCTION public.has_farm_role(p_farm_id UUID, p_role TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.farm_members
    WHERE farm_id = p_farm_id
      AND user_id = auth.uid()::uuid
      AND role = p_role
      AND is_active = TRUE
  );
$$;

-- Check if current user can view financials for a farm
CREATE OR REPLACE FUNCTION public.can_view_farm_financials(p_farm_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.farm_members
    WHERE farm_id = p_farm_id
      AND user_id = auth.uid()::uuid
      AND is_active = TRUE
      AND (role = 'owner' OR can_view_financials = TRUE)
  );
$$;

-- Get the farm_id for the current user (returns their first active farm)
CREATE OR REPLACE FUNCTION public.get_user_farm_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT farm_id FROM public.farm_members
  WHERE user_id = auth.uid()::uuid
    AND is_active = TRUE
  ORDER BY role = 'owner' DESC, joined_at ASC
  LIMIT 1;
$$;

-- ============================================================================
-- STEP 6: RLS policies for farms table
-- ============================================================================

DROP POLICY IF EXISTS "Members can view their farms" ON farms;
DROP POLICY IF EXISTS "Owners can update their farms" ON farms;
DROP POLICY IF EXISTS "Authenticated users can create farms" ON farms;
DROP POLICY IF EXISTS "Owners can delete their farms" ON farms;

-- Members can view farms they belong to
CREATE POLICY "Members can view their farms"
  ON farms FOR SELECT
  USING (public.is_farm_member(id));

-- Any authenticated user can create a farm
CREATE POLICY "Authenticated users can create farms"
  ON farms FOR INSERT
  WITH CHECK (auth.uid()::uuid = owner_id);

-- Only owners can update their farm
CREATE POLICY "Owners can update their farms"
  ON farms FOR UPDATE
  USING (public.has_farm_role(id, 'owner'))
  WITH CHECK (public.has_farm_role(id, 'owner'));

-- Only owners can delete their farm
CREATE POLICY "Owners can delete their farms"
  ON farms FOR DELETE
  USING (public.has_farm_role(id, 'owner'));

-- ============================================================================
-- STEP 7: RLS policies for farm_members table
-- ============================================================================

DROP POLICY IF EXISTS "Members can view farm members" ON farm_members;
DROP POLICY IF EXISTS "Owners can insert members" ON farm_members;
DROP POLICY IF EXISTS "Owners can update members" ON farm_members;
DROP POLICY IF EXISTS "Owners can remove members" ON farm_members;
DROP POLICY IF EXISTS "Users can view own membership" ON farm_members;

-- Members can see other members of their farm
CREATE POLICY "Members can view farm members"
  ON farm_members FOR SELECT
  USING (public.is_farm_member(farm_id));

-- Users can always see their own membership
CREATE POLICY "Users can view own membership"
  ON farm_members FOR SELECT
  USING (user_id = auth.uid()::uuid);

-- Owners can add members
CREATE POLICY "Owners can insert members"
  ON farm_members FOR INSERT
  WITH CHECK (public.has_farm_role(farm_id, 'owner'));

-- Owners can update members (change role, toggle financials)
CREATE POLICY "Owners can update members"
  ON farm_members FOR UPDATE
  USING (public.has_farm_role(farm_id, 'owner'))
  WITH CHECK (public.has_farm_role(farm_id, 'owner'));

-- Owners can remove members
CREATE POLICY "Owners can remove members"
  ON farm_members FOR DELETE
  USING (public.has_farm_role(farm_id, 'owner'));

-- ============================================================================
-- STEP 8: RLS policies for farm_invitations table
-- ============================================================================

DROP POLICY IF EXISTS "Owners can view invitations" ON farm_invitations;
DROP POLICY IF EXISTS "Owners can create invitations" ON farm_invitations;
DROP POLICY IF EXISTS "Owners can delete invitations" ON farm_invitations;

-- Owners can view invitations for their farm
CREATE POLICY "Owners can view invitations"
  ON farm_invitations FOR SELECT
  USING (public.has_farm_role(farm_id, 'owner'));

-- Owners can create invitations
CREATE POLICY "Owners can create invitations"
  ON farm_invitations FOR INSERT
  WITH CHECK (
    invited_by = auth.uid()::uuid
    AND public.has_farm_role(farm_id, 'owner')
  );

-- Owners can delete invitations
CREATE POLICY "Owners can delete invitations"
  ON farm_invitations FOR DELETE
  USING (public.has_farm_role(farm_id, 'owner'));

-- ============================================================================
-- STEP 9: RLS policies for activity_log table
-- ============================================================================

DROP POLICY IF EXISTS "Members can view activity" ON activity_log;
DROP POLICY IF EXISTS "Members can insert activity" ON activity_log;

-- Members can view activity for their farm
CREATE POLICY "Members can view activity"
  ON activity_log FOR SELECT
  USING (public.is_farm_member(farm_id));

-- Members can insert their own activity
CREATE POLICY "Members can insert activity"
  ON activity_log FOR INSERT
  WITH CHECK (
    user_id = auth.uid()::uuid
    AND public.is_farm_member(farm_id)
  );

-- ============================================================================
-- STEP 10: Update RLS on existing tables for farm-based access
-- ============================================================================

-- Drop old policies on animals
DROP POLICY IF EXISTS "Users can view own animals" ON animals;
DROP POLICY IF EXISTS "Users can insert own animals" ON animals;
DROP POLICY IF EXISTS "Users can update own animals" ON animals;
DROP POLICY IF EXISTS "Users can delete own animals" ON animals;
DROP POLICY IF EXISTS "Users can manage their own animals" ON animals;

-- Animals: farm members can view, owner can delete
CREATE POLICY "Farm members can view animals"
  ON animals FOR SELECT
  USING (
    -- Legacy: user owns the animal (no farm_id set yet)
    (farm_id IS NULL AND auth.uid()::uuid = user_id)
    OR
    -- Farm-based: user is a member of this farm
    (farm_id IS NOT NULL AND public.is_farm_member(farm_id))
  );

CREATE POLICY "Farm members can insert animals"
  ON animals FOR INSERT
  WITH CHECK (
    -- Legacy: no farm, user owns it
    (farm_id IS NULL AND auth.uid()::uuid = user_id)
    OR
    -- Farm-based: member can add animals
    (farm_id IS NOT NULL AND public.is_farm_member(farm_id))
  );

CREATE POLICY "Farm members can update animals"
  ON animals FOR UPDATE
  USING (
    (farm_id IS NULL AND auth.uid()::uuid = user_id)
    OR
    (farm_id IS NOT NULL AND public.is_farm_member(farm_id))
  )
  WITH CHECK (
    (farm_id IS NULL AND auth.uid()::uuid = user_id)
    OR
    (farm_id IS NOT NULL AND public.is_farm_member(farm_id))
  );

CREATE POLICY "Farm owners can delete animals"
  ON animals FOR DELETE
  USING (
    (farm_id IS NULL AND auth.uid()::uuid = user_id)
    OR
    (farm_id IS NOT NULL AND public.has_farm_role(farm_id, 'owner'))
  );

-- Milk production: farm members can view/create
DROP POLICY IF EXISTS "Users can view own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can insert own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can update own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can delete own milk records" ON milk_production;
DROP POLICY IF EXISTS "Users can manage their own milk production" ON milk_production;

CREATE POLICY "Farm members can view milk records"
  ON milk_production FOR SELECT
  USING (
    auth.uid()::uuid = user_id
    OR
    EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = milk_production.animal_id
        AND a.farm_id IS NOT NULL
        AND public.is_farm_member(a.farm_id)
    )
  );

CREATE POLICY "Farm members can insert milk records"
  ON milk_production FOR INSERT
  WITH CHECK (
    auth.uid()::uuid = user_id
    AND (
      -- Either own animals (legacy)
      EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NULL AND a.user_id = auth.uid()::uuid)
      -- Or farm animals
      OR EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NOT NULL AND public.is_farm_member(a.farm_id))
    )
  );

CREATE POLICY "Farm members can update milk records"
  ON milk_production FOR UPDATE
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = milk_production.animal_id
        AND a.farm_id IS NOT NULL
        AND public.has_farm_role(a.farm_id, 'owner')
    )
  )
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Farm owners can delete milk records"
  ON milk_production FOR DELETE
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = milk_production.animal_id
        AND a.farm_id IS NOT NULL
        AND public.has_farm_role(a.farm_id, 'owner')
    )
  );

-- Health records: farm members can view/create
DROP POLICY IF EXISTS "Users can manage their own health records" ON health_records;

CREATE POLICY "Farm members can view health records"
  ON health_records FOR SELECT
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = health_records.animal_id
        AND a.farm_id IS NOT NULL
        AND public.is_farm_member(a.farm_id)
    )
  );

CREATE POLICY "Farm members can insert health records"
  ON health_records FOR INSERT
  WITH CHECK (
    auth.uid()::uuid = user_id
    AND (
      EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NULL AND a.user_id = auth.uid()::uuid)
      OR EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NOT NULL AND public.is_farm_member(a.farm_id))
    )
  );

CREATE POLICY "Farm owners can delete health records"
  ON health_records FOR DELETE
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = health_records.animal_id
        AND a.farm_id IS NOT NULL
        AND public.has_farm_role(a.farm_id, 'owner')
    )
  );

-- Growth records: farm members can view/create
DROP POLICY IF EXISTS "Users can manage their own growth records" ON growth_records;

CREATE POLICY "Farm members can view growth records"
  ON growth_records FOR SELECT
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = growth_records.animal_id
        AND a.farm_id IS NOT NULL
        AND public.is_farm_member(a.farm_id)
    )
  );

CREATE POLICY "Farm members can insert growth records"
  ON growth_records FOR INSERT
  WITH CHECK (
    auth.uid()::uuid = user_id
    AND (
      EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NULL AND a.user_id = auth.uid()::uuid)
      OR EXISTS (SELECT 1 FROM animals a WHERE a.id = animal_id AND a.farm_id IS NOT NULL AND public.is_farm_member(a.farm_id))
    )
  );

CREATE POLICY "Farm owners can delete growth records"
  ON growth_records FOR DELETE
  USING (
    auth.uid()::uuid = user_id
    OR EXISTS (
      SELECT 1 FROM animals a
      WHERE a.id = growth_records.animal_id
        AND a.farm_id IS NOT NULL
        AND public.has_farm_role(a.farm_id, 'owner')
    )
  );

-- Financial records: only if can_view_financials
DROP POLICY IF EXISTS "Users can manage their own financial records" ON financial_records;

CREATE POLICY "Farm members with financial access can view financial records"
  ON financial_records FOR SELECT
  USING (
    auth.uid()::uuid = user_id
    OR (
      animal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM animals a
        WHERE a.id = financial_records.animal_id
          AND a.farm_id IS NOT NULL
          AND public.can_view_farm_financials(a.farm_id)
      )
    )
    OR (
      animal_id IS NULL AND auth.uid()::uuid = user_id
    )
  );

CREATE POLICY "Farm members can insert financial records"
  ON financial_records FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Farm owners can delete financial records"
  ON financial_records FOR DELETE
  USING (
    auth.uid()::uuid = user_id
    OR (
      animal_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM animals a
        WHERE a.id = financial_records.animal_id
          AND a.farm_id IS NOT NULL
          AND public.has_farm_role(a.farm_id, 'owner')
      )
    )
  );

-- Market listings: owners only
DROP POLICY IF EXISTS "Anyone can view active listings" ON market_listings;
DROP POLICY IF EXISTS "Users can view own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can insert own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can update own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can delete own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can manage their own listings" ON market_listings;
DROP POLICY IF EXISTS "Users can view all active listings" ON market_listings;

CREATE POLICY "Anyone can view active listings"
  ON market_listings FOR SELECT
  USING (status = 'active' OR auth.uid()::uuid = user_id);

CREATE POLICY "Users can insert own listings"
  ON market_listings FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can update own listings"
  ON market_listings FOR UPDATE
  USING (auth.uid()::uuid = user_id)
  WITH CHECK (auth.uid()::uuid = user_id);

CREATE POLICY "Users can delete own listings"
  ON market_listings FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- Feed inventory: farm members can view
DROP POLICY IF EXISTS "Users can manage their own feed inventory" ON feed_inventory;

CREATE POLICY "Farm members can view feed inventory"
  ON feed_inventory FOR SELECT
  USING (
    auth.uid()::uuid = user_id
    OR public.is_farm_member(public.get_user_farm_id())
  );

CREATE POLICY "Farm members can insert feed records"
  ON feed_inventory FOR INSERT
  WITH CHECK (auth.uid()::uuid = user_id);

-- ============================================================================
-- STEP 11: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_farms_owner ON farms(owner_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_farm_user ON farm_members(farm_id, user_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_user ON farm_members(user_id);
CREATE INDEX IF NOT EXISTS idx_farm_members_active ON farm_members(farm_id, is_active);
CREATE INDEX IF NOT EXISTS idx_farm_invitations_farm ON farm_invitations(farm_id);
CREATE INDEX IF NOT EXISTS idx_farm_invitations_phone ON farm_invitations(phone);
CREATE INDEX IF NOT EXISTS idx_activity_log_farm ON activity_log(farm_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_animals_farm_id ON animals(farm_id);

-- ============================================================================
-- STEP 12: Updated_at trigger for farms
-- ============================================================================

DROP TRIGGER IF EXISTS update_farms_updated_at ON farms;
CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON farms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 13: Function to auto-create farm for new users
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_default_farm_for_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_farm_id UUID;
  v_farm_name TEXT;
BEGIN
  -- Get farm name from profile, or use default
  SELECT COALESCE(farm_name, 'My Farm') INTO v_farm_name
  FROM public.profiles
  WHERE id = NEW.id;

  -- Create the farm
  INSERT INTO public.farms (name, owner_id)
  VALUES (v_farm_name, NEW.id)
  RETURNING id INTO v_farm_id;

  -- Add user as owner member
  INSERT INTO public.farm_members (farm_id, user_id, role, invited_by, can_view_financials)
  VALUES (v_farm_id, NEW.id, 'owner', NEW.id, TRUE);

  RETURN NEW;
END;
$$;

-- NOTE: We do NOT auto-create farms on user creation.
-- Instead, farms are created when the user completes onboarding.
-- This keeps backward compatibility with existing users.

-- ============================================================================
-- STEP 14: Function to accept pending invitation on login
-- ============================================================================

CREATE OR REPLACE FUNCTION public.accept_pending_invitation(p_phone TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_invitation RECORD;
  v_result JSONB;
BEGIN
  -- Find pending invitation for this phone
  SELECT * INTO v_invitation
  FROM public.farm_invitations
  WHERE phone = p_phone
    AND accepted_at IS NULL
    AND expires_at > NOW()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_invitation IS NULL THEN
    RETURN jsonb_build_object('has_invitation', FALSE);
  END IF;

  -- Check if already a member
  IF EXISTS (
    SELECT 1 FROM public.farm_members
    WHERE farm_id = v_invitation.farm_id
      AND user_id = auth.uid()::uuid
  ) THEN
    -- Mark invitation as accepted anyway
    UPDATE public.farm_invitations
    SET accepted_at = NOW()
    WHERE id = v_invitation.id;

    RETURN jsonb_build_object('has_invitation', TRUE, 'already_member', TRUE);
  END IF;

  -- Add user as farm member
  INSERT INTO public.farm_members (farm_id, user_id, role, invited_by)
  VALUES (v_invitation.farm_id, auth.uid()::uuid, v_invitation.role, v_invitation.invited_by);

  -- Mark invitation as accepted
  UPDATE public.farm_invitations
  SET accepted_at = NOW()
  WHERE id = v_invitation.id;

  -- Get farm name for response
  SELECT jsonb_build_object(
    'has_invitation', TRUE,
    'already_member', FALSE,
    'farm_id', v_invitation.farm_id,
    'farm_name', (SELECT name FROM public.farms WHERE id = v_invitation.farm_id),
    'role', v_invitation.role
  ) INTO v_result;

  RETURN v_result;
END;
$$;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
