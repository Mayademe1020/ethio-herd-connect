-- Create reminders tables for Ethiopian livestock management
-- Date: 2025-11-13

-- ============================================================================
-- Create reminders table
-- ============================================================================

CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('milk_morning', 'milk_evening', 'pregnancy_check', 'vaccination', 'breeding', 'health_check')),
  title TEXT NOT NULL,
  message TEXT,
  scheduled_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  snooze_count INTEGER DEFAULT 0,
  last_snoozed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Create reminder_logs table (for tracking sent reminders)
-- ============================================================================

CREATE TABLE IF NOT EXISTS reminder_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'snoozed', 'dismissed')),
  user_response TEXT CHECK (user_response IN ('completed', 'snoozed', 'dismissed', 'remind_later')),
  snooze_duration_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Row Level Security Policies
-- ============================================================================

-- Enable RLS
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_logs ENABLE ROW LEVEL SECURITY;

-- Reminders policies
CREATE POLICY "Users can view their own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Reminder logs policies
CREATE POLICY "Users can view their own reminder logs"
  ON reminder_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create reminder logs"
  ON reminder_logs FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_type ON reminders(type);
CREATE INDEX IF NOT EXISTS idx_reminders_active ON reminders(is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_scheduled_time ON reminders(scheduled_time);

CREATE INDEX IF NOT EXISTS idx_reminder_logs_reminder_id ON reminder_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_sent_at ON reminder_logs(sent_at);
CREATE INDEX IF NOT EXISTS idx_reminder_logs_status ON reminder_logs(status);

-- ============================================================================
-- Updated at triggers
-- ============================================================================

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Insert default reminders for Ethiopian farmers
-- ============================================================================

-- Insert default morning milk reminder
INSERT INTO reminders (user_id, type, title, message, scheduled_time, is_active)
SELECT
  auth.uid(),
  'milk_morning',
  'Morning Milk Collection',
  'Time to collect morning milk from your cows',
  '06:00:00',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM reminders
  WHERE user_id = auth.uid() AND type = 'milk_morning'
);

-- Insert default evening milk reminder
INSERT INTO reminders (user_id, type, title, message, scheduled_time, is_active)
SELECT
  auth.uid(),
  'milk_evening',
  'Evening Milk Collection',
  'Time to collect evening milk from your cows',
  '16:00:00',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM reminders
  WHERE user_id = auth.uid() AND type = 'milk_evening'
);

-- ============================================================================
-- Migration complete
-- ============================================================================