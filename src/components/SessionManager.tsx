import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import { useNetworkStatus } from '@/contexts/NetworkStatusContext';
import { toast } from 'sonner';
import { secureLocalStorage } from '@/utils/securityUtils';
import { AlertCircle, WifiOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useTranslations } from '@/hooks/useTranslations';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // Check every minute
const INACTIVITY_WARNING_TIME = 25 * 60 * 1000; // Warn after 25 minutes of inactivity

export const SessionManager: React.FC = () => {
  const { user, signOut } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const { t } = useTranslations();

  // Track user activity
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
      setShowInactivityWarning(false);
      
      // Update the activity timestamp in storage
      if (user) {
        secureLocalStorage.setItem('bet-gitosa-last-activity', Date.now());
      }
    };

    // Set initial activity time
    updateActivity();

    // Listen for user interactions
    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [user]);

  // Session timeout monitoring
  useEffect(() => {
    if (!user) return;

    // Initialize session expiry time
    const initialExpiry = Date.now() + SESSION_TIMEOUT_MS;
    setSessionExpiresAt(initialExpiry);
    
    const checkActivity = () => {
      const now = Date.now();
      const timeElapsed = now - lastActivity;
      
      // Show warning when approaching timeout
      if (timeElapsed >= INACTIVITY_WARNING_TIME && !showInactivityWarning) {
        setShowInactivityWarning(true);
        toast.warning(
          t('session.inactivityWarningMessage', 'Your session will expire soon due to inactivity. Please continue using the app to stay logged in.')
        );
      }

      // Auto logout on timeout
      if (timeElapsed >= SESSION_TIMEOUT_MS) {
        signOut();
        toast.warning(
          t('session.timeoutMessage', 'You have been logged out due to inactivity.')
        );
      } else {
        // Update the expiry time
        setSessionExpiresAt(now + SESSION_TIMEOUT_MS - timeElapsed);
      }
    };

    const interval = setInterval(checkActivity, ACTIVITY_CHECK_INTERVAL);
    return () => clearInterval(interval);
  }, [user, lastActivity, showInactivityWarning]);

  // Verify connection periodically when online
  useEffect(() => {
    if (!user || !isOnline) return;
    
    const checkInterval = setInterval(() => {
      // Connection is tracked by NetworkStatusContext automatically
    }, 15 * 60 * 1000);
    
    return () => clearInterval(checkInterval);
  }, [user, isOnline]);

  // Format time remaining in minutes
  const getTimeRemaining = (): string => {
    if (!sessionExpiresAt) return '';
    const remainingMs = Math.max(0, sessionExpiresAt - Date.now());
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!user) return null;

  return (
    <>
      {/* Offline mode indicator */}
      {!isOnline && (
        <Alert variant="warning" className="fixed bottom-4 right-4 w-auto max-w-md z-50 bg-amber-50 border-amber-300">
          <WifiOff className="h-4 w-4 text-amber-600" />
          <AlertTitle>{t('session.offlineTitle', 'Offline Mode')}</AlertTitle>
          <AlertDescription>
            {t('session.offlineDescription', 'You are currently working offline. Some features may be limited.')}
          </AlertDescription>
        </Alert>
      )}

      {/* Session timeout warning */}
      {showInactivityWarning && (
        <Alert variant="destructive" className="fixed bottom-4 left-4 w-auto max-w-md z-50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('session.expiringTitle', 'Session Expiring')}</AlertTitle>
          <AlertDescription>
            {t('session.expiringDescription', 'Your session will expire in {time}. Click anywhere to continue.', { time: getTimeRemaining() })}
          </AlertDescription>
        </Alert>
      )}

      {/* Sync status indicator */}
      {isOnline && (
        <div className="fixed top-4 right-4 z-50">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {t('session.online', 'Online')}
          </span>
        </div>
      )}
    </>
  );
};

export default SessionManager;