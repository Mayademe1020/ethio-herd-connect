-- Push Subscriptions Table for Web Push Notifications
-- Date: 2026-02-16
-- Purpose: Store push notification subscriptions for browser notifications

-- ============================================================================
-- Create push_subscriptions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Add RLS policies for push_subscriptions
-- ============================================================================

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own subscriptions
CREATE POLICY "Users can only see their own push subscriptions"
ON push_subscriptions
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- Add indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id 
ON push_subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint 
ON push_subscriptions(endpoint);

-- ============================================================================
-- Add push_enabled column to profiles for notification preference
-- ============================================================================

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_enabled BOOLEAN DEFAULT FALSE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS push_disabled_at TIMESTAMPTZ;

-- ============================================================================
-- Migration complete
-- ============================================================================
