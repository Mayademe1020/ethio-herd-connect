-- Rate Limiting and Account Security Tables
-- Run this in Supabase SQL Editor

-- Create audit_logs table for tracking all actions
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(100),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create account_security table for tracking login attempts
CREATE TABLE IF NOT EXISTS account_security (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  failed_login_attempts INTEGER DEFAULT 0,
  last_failed_login TIMESTAMPTZ,
  account_locked_until TIMESTAMPTZ,
  last_successful_login TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_account_security_user_id ON account_security(user_id);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_security ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Service role can manage audit_logs') THEN
    CREATE POLICY "Service role can manage audit_logs" ON audit_logs FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'audit_logs' AND policyname = 'Admins can read audit_logs') THEN
    CREATE POLICY "Admins can read audit_logs" ON audit_logs FOR SELECT USING (
      EXISTS (SELECT 1 FROM admin_users WHERE user_id = auth.uid() AND is_active = true)
    );
  END IF;
END $$;

-- RLS Policies for account_security
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'account_security' AND policyname = 'Users can update own security') THEN
    CREATE POLICY "Users can update own security" ON account_security FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'account_security' AND policyname = 'Service role can manage account_security') THEN
    CREATE POLICY "Service role can manage account_security" ON account_security FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;

-- Create function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_user_id UUID,
  p_success BOOLEAN,
  p_ip_address INET DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_success THEN
    -- Reset failed attempts and update last login
    INSERT INTO account_security (user_id, failed_login_attempts, last_successful_login, updated_at)
    VALUES (p_user_id, 0, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      failed_login_attempts = 0,
      last_successful_login = NOW(),
      updated_at = NOW(),
      account_locked_until = NULL;
    
    -- Log successful login
    INSERT INTO audit_logs (user_id, action, details, ip_address)
    VALUES (p_user_id, 'login_success', '{}'::jsonb, p_ip_address);
  ELSE
    -- Increment failed attempts
    INSERT INTO account_security (user_id, failed_login_attempts, last_failed_login, updated_at)
    VALUES (p_user_id, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      failed_login_attempts = account_security.failed_login_attempts + 1,
      last_failed_login = NOW(),
      updated_at = NOW(),
      account_locked_until = CASE 
        WHEN account_security.failed_login_attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE NULL
      END;
    
    -- Log failed login
    INSERT INTO audit_logs (user_id, action, details, ip_address)
    VALUES (p_user_id, 'login_failed', 
      jsonb_build_object('attempts', (SELECT failed_login_attempts FROM account_security WHERE user_id = p_user_id)),
      p_ip_address);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if account is locked
CREATE OR REPLACE FUNCTION is_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  locked_until TIMESTAMPTZ;
BEGIN
  SELECT account_locked_until INTO locked_until
  FROM account_security
  WHERE user_id = p_user_id;
  
  RETURN locked_until IS NOT NULL AND locked_until > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get remaining lockout time
CREATE OR REPLACE FUNCTION get_lockout_remaining_seconds(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  locked_until TIMESTAMPTZ;
  remaining_seconds INTEGER;
BEGIN
  SELECT account_locked_until INTO locked_until
  FROM account_security
  WHERE user_id = p_user_id;
  
  IF locked_until IS NULL OR locked_until <= NOW() THEN
    RETURN 0;
  END IF;
  
  remaining_seconds := EXTRACT(EPOCH FROM (locked_until - NOW()))::INTEGER;
  RETURN GREATEST(0, remaining_seconds);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log any action
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action VARCHAR,
  p_entity_type VARCHAR DEFAULT NULL,
  p_entity_id VARCHAR DEFAULT NULL,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get current user if authenticated
  current_user_id := auth.uid();
  
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
  VALUES (current_user_id, p_action, p_entity_type, p_entity_id, p_details);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger function to auto-log auth events
CREATE OR REPLACE FUNCTION handle_auth_event()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.email IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (NEW.id, 'user_created', jsonb_build_object('email', NEW.email));
  END IF;
  
  IF TG_OP = 'DELETE' AND OLD.email IS NOT NULL THEN
    INSERT INTO audit_logs (user_id, action, details)
    VALUES (OLD.id, 'user_deleted', jsonb_build_object('email', OLD.email));
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auth.users
CREATE TRIGGER on_auth_user_event
  AFTER INSERT OR DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_auth_event();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION record_login_attempt(UUID, BOOLEAN, INET) TO service_role;
GRANT EXECUTE ON FUNCTION is_account_locked(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION get_lockout_remaining_seconds(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION log_audit_event(VARCHAR, VARCHAR, VARCHAR, JSONB) TO service_role;
GRANT EXECUTE ON FUNCTION handle_auth_event() TO service_role;

-- Add comments
COMMENT ON TABLE audit_logs IS 'Stores all audit trail events for security and compliance';
COMMENT ON TABLE account_security IS 'Tracks account security status including failed login attempts and lockouts';
COMMENT ON FUNCTION record_login_attempt IS 'Records a login attempt and handles rate limiting';
COMMENT ON FUNCTION is_account_locked IS 'Checks if an account is currently locked due to failed attempts';
