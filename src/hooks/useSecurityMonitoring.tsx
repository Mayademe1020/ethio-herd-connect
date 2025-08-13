
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useAuth } from '@/contexts/AuthContext';

interface SecurityAlert {
  id: string;
  type: 'failed_login' | 'account_locked' | 'suspicious_activity' | 'multiple_sessions';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export const useSecurityMonitoring = () => {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showError, showSuccess } = useToastNotifications();

  const checkSecurityStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check for recent security events
      const { data: securityRecord } = await supabase
        .from('account_security')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (securityRecord) {
        const newAlerts: SecurityAlert[] = [];

        // Check for account lock
        if (securityRecord.account_locked_until) {
          const lockUntil = new Date(securityRecord.account_locked_until);
          if (lockUntil > new Date()) {
            newAlerts.push({
              id: 'account_locked',
              type: 'account_locked',
              message: `Account is locked until ${lockUntil.toLocaleString()}`,
              severity: 'critical',
              timestamp: new Date().toISOString()
            });
          }
        }

        // Check for recent failed logins
        if (securityRecord.failed_login_attempts > 0) {
          newAlerts.push({
            id: 'failed_logins',
            type: 'failed_login',
            message: `${securityRecord.failed_login_attempts} failed login attempts detected`,
            severity: securityRecord.failed_login_attempts >= 3 ? 'high' : 'medium',
            timestamp: securityRecord.last_failed_login || new Date().toISOString()
          });
        }

        setAlerts(newAlerts);
      }
    } catch (error) {
      console.error('Error checking security status:', error);
    } finally {
      setLoading(false);
    }
  };

  const logSecurityEvent = async (eventType: string, details: any) => {
    if (!user) return;

    try {
      await supabase
        .from('audit_logs')
        .insert({
          user_id: user.id,
          action: 'SECURITY_EVENT',
          table_name: 'security_monitoring',
          record_id: eventType,
          new_values: {
            event_type: eventType,
            details,
            timestamp: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  };

  const clearSecurityAlerts = () => {
    setAlerts([]);
    showSuccess('Security alerts cleared', 'All security alerts have been acknowledged.');
  };

  useEffect(() => {
    if (user) {
      checkSecurityStatus();
      
      // Set up real-time monitoring for security events
      const interval = setInterval(checkSecurityStatus, 30000); // Check every 30 seconds
      
      return () => clearInterval(interval);
    }
  }, [user]);

  return {
    alerts,
    loading,
    checkSecurityStatus,
    logSecurityEvent,
    clearSecurityAlerts
  };
};
