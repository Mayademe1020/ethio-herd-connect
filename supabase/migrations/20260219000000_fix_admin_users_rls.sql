-- Migration: Fix admin_users RLS policy
-- Date: 2026-02-19
-- Issue: Circular reference - users can't query admin_users unless they exist in it

-- Drop ALL existing policies first
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'admin_users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', pol.policyname);
  END LOOP;
END $$;

-- Allow users to check their own admin status
CREATE POLICY "Users can view their own admin record"
  ON admin_users FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to update their own admin record
CREATE POLICY "Users can update their own admin record"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Allow super admins to insert new admins
CREATE POLICY "Super admins can insert admins"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );

-- Allow super admins to delete admins
CREATE POLICY "Super admins can delete admins"
  ON admin_users FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE user_id = auth.uid() AND role = 'super_admin'
    )
  );
