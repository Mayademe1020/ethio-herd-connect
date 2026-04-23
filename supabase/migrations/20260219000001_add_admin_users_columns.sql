-- Migration: Add missing columns to admin_users table
-- Date: 2026-02-19
-- Issue: Table exists but missing role column

-- Add role column if it doesn't exist
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin'));

-- Add is_active column if it doesn't exist
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add full_name column if it doesn't exist  
ALTER TABLE admin_users ADD COLUMN IF NOT EXISTS full_name TEXT;
