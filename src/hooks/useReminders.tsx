/**
 * useReminders Hook
 * Manages milk recording reminders and periodic checking
 * Requirements: 6.1, 6.2, 6.4
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextMVP';
import {
  getUserReminders,
  checkAndTriggerReminders,
  checkMissedSessions,
  type ReminderSchedule,
} from '@/services/reminderService';

interface UseRemindersReturn {
  reminders: ReminderSchedule[];
  loading: boolean;
  error: string | null;
  refreshReminders: () => Promise<void>;
}

/**
 * Hook to manage user reminders and periodic checking
 */
export function useReminders(): UseRemindersReturn {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<ReminderSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load reminders
  const loadReminders = useCallback(async () => {
    if (!user?.id) {
      setReminders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getUserReminders(user.id);

      if (result.success && result.reminders) {
        setReminders(result.reminders);
      } else {
        setError(result.error || 'Failed to load reminders');
      }
    } catch (err) {
      console.error('Error loading reminders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reminders');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Check and trigger reminders periodically
  const checkReminders = useCallback(async () => {
    if (!user?.id) return;

    try {
      await checkAndTriggerReminders(user.id);
      // Also check for missed sessions
      await checkMissedSessions(user.id);
    } catch (err) {
      console.error('Error checking reminders:', err);
    }
  }, [user?.id]);

  // Load reminders on mount and when user changes
  useEffect(() => {
    loadReminders();
  }, [loadReminders]);

  // Set up periodic reminder checking (every minute)
  useEffect(() => {
    if (!user?.id) return;

    // Check immediately
    checkReminders();

    // Then check every minute
    const interval = setInterval(checkReminders, 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id, checkReminders]);

  return {
    reminders,
    loading,
    error,
    refreshReminders: loadReminders,
  };
}
