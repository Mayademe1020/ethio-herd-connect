-- Migration: Fix admin_users table structure and RLS policies
-- Date: 2026-02-19
-- Issues: Missing is_active and full_name columns, problematic RLS policies

-- Add missing columns if they don't exist
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Fix problematic RLS policies - drop ALL existing ones first
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'admin_users' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON admin_users', pol.policyname);
  END LOOP;
END $$;

-- Allow users to view their own admin record (if they are admins)
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