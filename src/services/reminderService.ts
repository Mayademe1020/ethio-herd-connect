/**
 * Reminder Service
 * Handles scheduling and triggering of milk recording reminders
 * Requirements: 6.1, 6.4
 */

import { supabase } from '@/integrations/supabase/client';
import { createNotification } from './notificationService';

export interface ReminderSchedule {
  id?: string;
  user_id: string;
  type: 'milk_morning' | 'milk_afternoon';
  schedule_time: string; // HH:MM format
  enabled: boolean;
  last_triggered_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ReminderTriggerResult {
  success: boolean;
  notificationId?: string;
  error?: string;
}

/**
 * Schedule a new reminder for the user
 */
export async function scheduleReminder(
  userId: string,
  type: 'milk_morning' | 'milk_afternoon',
  scheduleTime: string,
  enabled: boolean = true
): Promise<{ success: boolean; reminder?: ReminderSchedule; error?: string }> {
  try {
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(scheduleTime)) {
      return {
        success: false,
        error: 'Invalid time format. Use HH:MM format (e.g., 07:00)',
      };
    }

    // Check if reminder already exists for this type
    const { data: existing, error: checkError } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is expected
      throw checkError;
    }

    if (existing) {
      // Update existing reminder
      const { data, error } = await (supabase as any)
        .from('reminders')
        .update({
          schedule_time: scheduleTime,
          enabled,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;

      return { success: true, reminder: data as ReminderSchedule };
    } else {
      // Create new reminder
      const { data, error } = await (supabase as any)
        .from('reminders')
        .insert({
          user_id: userId,
          type,
          schedule_time: scheduleTime,
          enabled,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, reminder: data as ReminderSchedule };
    }
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to schedule reminder',
    };
  }
}

/**
 * Update an existing reminder schedule
 */
export async function updateReminderSchedule(
  reminderId: string,
  updates: Partial<Pick<ReminderSchedule, 'schedule_time' | 'enabled'>>
): Promise<{ success: boolean; reminder?: ReminderSchedule; error?: string }> {
  try {
    // Validate time format if provided
    if (updates.schedule_time) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.schedule_time)) {
        return {
          success: false,
          error: 'Invalid time format. Use HH:MM format (e.g., 07:00)',
        };
      }
    }

    const { data, error } = await (supabase as any)
      .from('reminders')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reminderId)
      .select()
      .single();

    if (error) throw error;

    return { success: true, reminder: data as ReminderSchedule };
  } catch (error) {
    console.error('Error updating reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update reminder',
    };
  }
}

/**
 * Get all reminders for a user
 */
export async function getUserReminders(
  userId: string
): Promise<{ success: boolean; reminders?: ReminderSchedule[]; error?: string }> {
  try {
    const { data, error } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .order('type', { ascending: true });

    if (error) {
      // Silently handle missing table error
      if (error.code === '42P01') {
        console.warn('reminders table not found - feature not yet enabled');
        return { success: true, reminders: [] };
      }
      throw error;
    }

    return { success: true, reminders: (data || []) as ReminderSchedule[] };
  } catch (error) {
    console.error('Error fetching reminders:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch reminders',
    };
  }
}

/**
 * Check if current time matches reminder schedule and trigger if needed
 * This function should be called periodically (e.g., every minute)
 */
export async function checkAndTriggerReminders(
  userId: string
): Promise<ReminderTriggerResult[]> {
  try {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Get all enabled reminders for user
    const { data: reminders, error } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('enabled', true);

    if (error) throw error;

    const results: ReminderTriggerResult[] = [];

    for (const reminder of (reminders || []) as ReminderSchedule[]) {
      // Check if current time matches schedule time
      if (reminder.schedule_time === currentTime) {
        // Check if already triggered in the last hour to avoid duplicates
        const lastTriggered = reminder.last_triggered_at
          ? new Date(reminder.last_triggered_at)
          : null;
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

        if (!lastTriggered || lastTriggered < oneHourAgo) {
          const result = await triggerReminder(userId, reminder);
          results.push(result);
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error checking reminders:', error);
    return [
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to check reminders',
      },
    ];
  }
}

/**
 * Trigger a specific reminder and create notification
 */
export async function triggerReminder(
  userId: string,
  reminder: ReminderSchedule
): Promise<ReminderTriggerResult> {
  try {
    // Get count of milk-producing animals that need recording
    const { data: animals, error: animalsError } = await supabase
      .from('animals')
      .select('id, name, type')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('type', ['cattle', 'goat', 'sheep']);

    if (animalsError) throw animalsError;

    const animalCount = animals?.length || 0;

    // Determine session based on reminder type
    const session = reminder.type === 'milk_morning' ? 'morning' : 'afternoon';
    const sessionDisplay = session === 'morning' ? 'Morning' : 'Afternoon';

    // Create notification
    const title = `${sessionDisplay} Milk Recording Reminder`;
    const message =
      animalCount > 0
        ? `Time to record ${sessionDisplay.toLowerCase()} milk for ${animalCount} animal${animalCount > 1 ? 's' : ''}`
        : `Time to record ${sessionDisplay.toLowerCase()} milk production`;

    const notification = await createNotification({
      type: 'milk_reminder',
      title,
      message,
      priority: 'medium',
      action_url: '/record-milk',
      metadata: {
        session,
        animal_count: animalCount,
        reminder_id: reminder.id,
        reminder_type: reminder.type,
      },
    });

    if (!notification) {
      throw new Error('Failed to create notification');
    }

    // Update last_triggered_at
    await (supabase as any)
      .from('reminders')
      .update({ last_triggered_at: new Date().toISOString() })
      .eq('id', reminder.id!);

    return {
      success: true,
      notificationId: notification.id,
    };
  } catch (error) {
    console.error('Error triggering reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to trigger reminder',
    };
  }
}

/**
 * Delete a reminder
 */
export async function deleteReminder(
  reminderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await (supabase as any).from('reminders').delete().eq('id', reminderId);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete reminder',
    };
  }
}

/**
 * Snooze a reminder notification (reschedule for 15 minutes later)
 * Requirements: 6.3
 */
export async function snoozeReminder(
  userId: string,
  notificationId: string,
  reminderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Calculate snooze time (15 minutes from now)
    const snoozeTime = new Date(Date.now() + 15 * 60 * 1000);
    const snoozeTimeStr = `${snoozeTime.getHours().toString().padStart(2, '0')}:${snoozeTime.getMinutes().toString().padStart(2, '0')}`;

    // Get the reminder to determine session
    const { data: reminder, error: reminderError } = await (supabase as any)
      .from('reminders')
      .select('*')
      .eq('id', reminderId)
      .single();

    if (reminderError) throw reminderError;

    // Get snooze count from notification metadata
    const { data: notification, error: notifError } = await (supabase as any)
      .from('notifications')
      .select('metadata')
      .eq('id', notificationId)
      .single();

    if (notifError) throw notifError;

    const snoozeCount = (notification.metadata?.snooze_count || 0) + 1;

    // Create a new snoozed notification
    const session = reminder.type === 'milk_morning' ? 'morning' : 'afternoon';
    const sessionDisplay = session === 'morning' ? 'Morning' : 'Afternoon';

    const title = `${sessionDisplay} Milk Recording Reminder (Snoozed)`;
    const message = `Reminder: Time to record ${sessionDisplay.toLowerCase()} milk production`;

    const snoozedNotification = await createNotification({
      type: 'milk_reminder',
      title,
      message,
      priority: 'medium',
      action_url: '/record-milk',
      metadata: {
        session,
        reminder_id: reminderId,
        reminder_type: reminder.type,
        snooze_count: snoozeCount,
        snoozed_at: new Date().toISOString(),
        original_notification_id: notificationId,
      },
    });

    if (!snoozedNotification) {
      throw new Error('Failed to create snoozed notification');
    }

    // Mark original notification as read
    await (supabase as any)
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    return { success: true };
  } catch (error) {
    console.error('Error snoozing reminder:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to snooze reminder',
    };
  }
}

/**
 * Get default reminder times based on type
 */
export function getDefaultReminderTime(type: 'milk_morning' | 'milk_afternoon'): string {
  return type === 'milk_morning' ? '07:00' : '17:00';
}

/**
 * Check if current time is within reminder window
 * Morning: 6:00-8:00 AM, Afternoon: 4:00-6:00 PM
 */
export function isWithinReminderWindow(
  type: 'milk_morning' | 'milk_afternoon'
): boolean {
  const now = new Date();
  const hour = now.getHours();

  if (type === 'milk_morning') {
    return hour >= 6 && hour < 8;
  } else {
    return hour >= 16 && hour < 18;
  }
}

/**
 * Check for missed sessions and send follow-up reminders
 * Requirements: 6.6
 */
export async function checkMissedSessions(userId: string): Promise<void> {
  try {
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // Get all milk-producing animals
    const { data: animals, error: animalsError } = await supabase
      .from('animals')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('type', ['cattle', 'goat', 'sheep']);

    if (animalsError) throw animalsError;

    const totalAnimals = animals?.length || 0;
    if (totalAnimals === 0) return; // No animals to track

    // Check morning session (if it's past 10 AM)
    if (now.getHours() >= 10) {
      const { data: morningRecords, error: morningError } = await supabase
        .from('milk_production')
        .select('animal_id')
        .eq('user_id', userId)
        .eq('session', 'morning')
        .gte('recorded_at', todayStr);

      if (morningError) throw morningError;

      const morningRecorded = new Set(morningRecords?.map((r) => r.animal_id) || []).size;
      const morningMissed = totalAnimals - morningRecorded;

      if (morningMissed > 0) {
        // Check if we already sent a follow-up today
        const { data: existingFollowUp, error: followUpError } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'milk_reminder')
          .gte('created_at', todayStr)
          .contains('metadata', { session: 'morning', is_followup: true });

        if (followUpError) throw followUpError;

        if (!existingFollowUp || existingFollowUp.length === 0) {
          // Send follow-up reminder
          await createNotification({
            type: 'milk_reminder',
            title: 'Missed Morning Milk Recording',
            message: `You have ${morningMissed} animal${morningMissed > 1 ? 's' : ''} without morning milk records. Record now or mark as late entry.`,
            priority: 'medium',
            action_url: '/record-milk',
            metadata: {
              session: 'morning',
              missed_count: morningMissed,
              is_followup: true,
              followup_time: now.toISOString(),
            },
          });
        }
      }
    }

    // Check afternoon session (if it's past 6 PM)
    if (now.getHours() >= 18) {
      const { data: afternoonRecords, error: afternoonError } = await supabase
        .from('milk_production')
        .select('animal_id')
        .eq('user_id', userId)
        .eq('session', 'afternoon')
        .gte('recorded_at', todayStr);

      if (afternoonError) throw afternoonError;

      const afternoonRecorded = new Set(afternoonRecords?.map((r) => r.animal_id) || []).size;
      const afternoonMissed = totalAnimals - afternoonRecorded;

      if (afternoonMissed > 0) {
        // Check if we already sent a follow-up today
        const { data: existingFollowUp, error: followUpError } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', userId)
          .eq('type', 'milk_reminder')
          .gte('created_at', todayStr)
          .contains('metadata', { session: 'afternoon', is_followup: true });

        if (followUpError) throw followUpError;

        if (!existingFollowUp || existingFollowUp.length === 0) {
          // Send follow-up reminder
          await createNotification({
            type: 'milk_reminder',
            title: 'Missed Afternoon Milk Recording',
            message: `You have ${afternoonMissed} animal${afternoonMissed > 1 ? 's' : ''} without afternoon milk records. Record now or mark as late entry.`,
            priority: 'medium',
            action_url: '/record-milk',
            metadata: {
              session: 'afternoon',
              missed_count: afternoonMissed,
              is_followup: true,
              followup_time: now.toISOString(),
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error checking missed sessions:', error);
  }
}
