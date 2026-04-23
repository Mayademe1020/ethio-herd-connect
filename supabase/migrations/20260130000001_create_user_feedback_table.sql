-- Migration: Create user_feedback table for in-app feedback collection
-- Date: 2026-01-30
-- Purpose: Store beta user feedback (bugs, features, general comments)

-- Create feedback table
CREATE TABLE IF NOT EXISTS user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'praise')),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  message TEXT NOT NULL,
  screenshot_url TEXT,
  page_url TEXT,
  user_agent TEXT,
  app_version TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE user_feedback IS 'Stores user feedback submissions from the in-app feedback widget';
COMMENT ON COLUMN user_feedback.type IS 'Type of feedback: bug report, feature request, general comment, or praise';
COMMENT ON COLUMN user_feedback.rating IS 'User satisfaction rating 1-5 stars';
COMMENT ON COLUMN user_feedback.status IS 'Current status of the feedback item';

-- Create indexes for common queries
CREATE INDEX idx_user_feedback_user_id ON user_feedback(user_id);
CREATE INDEX idx_user_feedback_status ON user_feedback(status);
CREATE INDEX idx_user_feedback_type ON user_feedback(type);
CREATE INDEX idx_user_feedback_created_at ON user_feedback(created_at DESC);

-- Enable RLS
ALTER TABLE user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own feedback
CREATE POLICY "Users can view own feedback"
  ON user_feedback FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policy: Users can create their own feedback
CREATE POLICY "Users can create own feedback"
  ON user_feedback FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policy: Users can update their own feedback (within 24 hours)
CREATE POLICY "Users can update own feedback within 24h"
  ON user_feedback FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND created_at > NOW() - INTERVAL '24 hours');

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
CREATE TRIGGER trigger_update_feedback_updated_at
  BEFORE UPDATE ON user_feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();
