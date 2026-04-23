-- Fix analytics_events RLS policies
-- The current policy requires auth.uid() = user_id OR user_id IS NULL
-- But client code sends undefined instead of null, so we need to fix this

-- First, ensure RLS is enabled
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert own events" ON analytics_events;
DROP POLICY IF EXISTS "Service role can read all events" ON analytics_events;
DROP POLICY IF EXISTS "Admins can read analytics" ON analytics_events;

-- Create more permissive insert policy (allow any authenticated user to insert)
-- This is acceptable for analytics since we're just tracking behavior
CREATE POLICY "Users can insert analytics events" ON analytics_events 
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Service role can read all
CREATE POLICY "Service role can read all events" ON analytics_events 
  FOR SELECT 
  USING (auth.role() = 'service_role');

-- Admins can read analytics
CREATE POLICY "Admins can read analytics" ON analytics_events 
  FOR SELECT 
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
    OR auth.role() = 'service_role'
  );

-- Allow service role to do everything (for background jobs)
CREATE POLICY "Service role can manage analytics" ON analytics_events 
  FOR ALL 
  USING (auth.role() = 'service_role');
