// src/services/notificationSettingsService.ts

import { supabase } from '@/integrations/supabase/client';
import {
  NotificationPreferences,
  NotificationPreferencesUpdate,
  defaultPreferences,
} from '@/types/notificationPreferences';

export interface ServiceResult {
  success: boolean;
  data?: NotificationPreferences;
  error?: string;
}

/**
 * Get notification preferences for a user
 */
export async function getUserNotificationPreferences(userId: string): Promise<ServiceResult> {
  try {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code === 'PGRST116') {
      // No preferences exist yet, create default
      return await createDefaultPreferences(userId);
    }

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error: any) {
    console.error('Error getting notification preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Create default notification preferences for a new user
 */
export async function createDefaultPreferences(userId: string): Promise<ServiceResult> {
  try {
    const preferences: Omit<NotificationPreferences, 'id' | 'created_at'> = {
      ...defaultPreferences,
      user_id: userId,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .insert([preferences])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error creating default preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: NotificationPreferencesUpdate
): Promise<ServiceResult> {
  try {
    // Get current preferences first
    const { data: current, error: getCurrentError } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (getCurrentError && getCurrentError.code !== 'PGRST116') {
      throw getCurrentError;
    }

    // If no preferences exist, create default first
    let preferencesId: string;
    if (!current) {
      const createResult = await createDefaultPreferences(userId);
      if (!createResult.success || !createResult.data) {
        return createResult;
      }
      preferencesId = createResult.data.id;
    } else {
      preferencesId = current.id;
    }

    // Merge updates with existing preferences
    const mergedUpdates: Partial<NotificationPreferences> = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Flatten nested objects for Supabase
    const flattenedUpdates: any = {
      ...mergedUpdates,
    };

    const { data, error } = await supabase
      .from('notification_preferences')
      .update(flattenedUpdates)
      .eq('id', preferencesId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Toggle a specific notification category
 */
export async function toggleNotificationCategory(
  userId: string,
  category: string,
  enabled: boolean
): Promise<ServiceResult> {
  try {
    const updates: any = {};
    
    // Map category to nested property
    if (category === 'milk_reminders') {
      updates.milk_reminders = { enabled };
    } else if (category === 'market_alerts') {
      updates.market_alerts = { enabled };
    } else if (category === 'health_alerts') {
      updates.health_alerts = { enabled };
    } else if (category === 'account_updates') {
      updates.account_updates = { enabled };
    } else if (category === 'global_enabled') {
      updates.global_enabled = enabled;
    }

    return await updateNotificationPreferences(userId, updates);
  } catch (error: any) {
    console.error('Error toggling notification category:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Check if notifications should be suppressed due to DND hours
 */
export function isDoNotDisturbActive(
  preferences: NotificationPreferences,
  currentTime: Date = new Date()
): boolean {
  if (!preferences.do_not_disturb && !preferences.dnd_schedule.enabled) {
    return false;
  }

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  const startMinutes = parseTimeToMinutes(preferences.dnd_start_time);
  const endMinutes = parseTimeToMinutes(preferences.dnd_end_time);

  // Check if current time is within DND period
  if (startMinutes < endMinutes) {
    // Same day (e.g., 22:00 to 06:00 next day handled by wrapping)
    return totalMinutes >= startMinutes || totalMinutes < endMinutes;
  } else {
    // Crosses midnight (e.g., 22:00 to 06:00)
    return totalMinutes >= startMinutes || totalMinutes < endMinutes;
  }
}

/**
 * Parse time string "HH:MM" to total minutes
 */
function parseTimeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Get notification summary for user
 */
export async function getNotificationSummary(userId: string): Promise<{
  unreadCount: number;
  categories: {
    milk: number;
    market: number;
    health: number;
    account: number;
  };
}> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, is_read, type')
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;

    const unreadCount = data?.length || 0;
    
    const categories = {
      milk: data?.filter((n) => n.type === 'milk_reminder').length || 0,
      market: data?.filter((n) => ['new_listing', 'buyer_interest'].includes(n.type)).length || 0,
      health: data?.filter((n) => ['vaccination', 'health_alert'].includes(n.type)).length || 0,
      account: data?.filter((n) => ['login', 'security'].includes(n.type)).length || 0,
    };

    return { unreadCount, categories };
  } catch (error: any) {
    console.error('Error getting notification summary:', error);
    return { unreadCount: 0, categories: { milk: 0, market: 0, health: 0, account: 0 } };
  }
}

/**
 * Batch notifications for milk reminders
 */
export async function batchMilkReminders(userId: string): Promise<ServiceResult> {
  try {
    // Get pending milk reminders that need batching
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: pendingReminders, error } = await supabase
      .from('milk_production')
      .select('animal_id, animals(name)')
      .eq('user_id', userId)
      .gte('recorded_at', today.toISOString());

    if (error) throw error;

    // Group by animals needing milk recording
    const animalsNeedingMilk = new Set(
      pendingReminders?.map((r: any) => r.animal_id) || []
    );

    return { success: true, data: { count: animalsNeedingMilk.size } };
  } catch (error: any) {
    console.error('Error batching milk reminders:', error);
    return { success: false, error: error.message };
  }
}
