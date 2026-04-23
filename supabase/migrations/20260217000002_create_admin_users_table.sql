-- Migration: Create admin_users table
-- Date: 2026-02-17

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique constraint
CREATE UNIQUE INDEX idx_admin_users_user_id ON admin_users(user_id);
CREATE UNIQUE INDEX idx_admin_users_email ON admin_users(email);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Only admins can view admin list"
  ON admin_users FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ));

CREATE POLICY "Only super admins can modify admin list"
  ON admin_users FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND role = 'super_admin'
  ));

-- Insert initial admin (replace with actual admin email)
-- INSERT INTO admin_users (user_id, email, role) 
-- VALUES ('admin-user-id', 'admin@example.com', 'super_admin');
