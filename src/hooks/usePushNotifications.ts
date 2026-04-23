// src/hooks/usePushNotifications.ts
// Custom hook for managing push notifications

import { useState, useEffect, useCallback } from 'react';
import { pushNotificationService } from '@/services/pushNotificationService';
import { supabase } from '@/integrations/supabase/client';

export interface UsePushNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  toggleNotifications: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported] = useState(() => pushNotificationService.isSupported());
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (!isSupported) {
        setIsLoading(false);
        return;
      }

      try {
        const perm = await pushNotificationService.getPermissionStatus();
        setPermission(perm);

        if (perm === 'granted') {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: subs } = await (supabase as any)
              .from('push_subscriptions')
              .select('id')
              .eq('user_id', user.id)
              .maybeSingle();
            setIsSubscribed(!!subs);
          }
        }
      } catch (err) {
        console.error('Error checking push status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [isSupported]);

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      setError('Push notifications are not supported in this browser');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const perm = await pushNotificationService.requestPermission();
      setPermission(perm);
      
      if (perm !== 'granted') {
        setError('Permission denied. Please enable notifications in your browser settings.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to request permission');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Push notifications are not supported');
      return false;
    }

    if (permission !== 'granted') {
      const newPerm = await pushNotificationService.requestPermission();
      if (newPerm !== 'granted') {
        setPermission(newPerm);
        return false;
      }
      setPermission('granted');
    }

    setIsLoading(true);
    setError(null);

    try {
      const sub = await pushNotificationService.subscribe();
      if (sub) {
        setIsSubscribed(true);
        return true;
      } else {
        setError('Failed to subscribe to push notifications');
        return false;
      }
    } catch (err: any) {
      setError(err.message || 'Subscription failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await pushNotificationService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } catch (err: any) {
      setError(err.message || 'Unsubscribe failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleNotifications = useCallback(async () => {
    if (isSubscribed) {
      await unsubscribe();
    } else {
      const newPerm = await pushNotificationService.requestPermission();
      if (newPerm !== 'granted') {
        setPermission(newPerm);
        return false;
      }
      setPermission('granted');
    }
  }, [isSubscribed, subscribe, unsubscribe]);

  return {
    isSupported,
    permission,
    isSubscribed,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    toggleNotifications
  };
}

export default usePushNotifications;
