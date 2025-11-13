/**
 * Milk Completion Service
 * Tracks milk recording completion and sends achievement notifications
 * Requirements: 6.5
 */

import { supabase } from '@/integrations/supabase/client';
import { createNotification } from './notificationService';

export interface CompletionStats {
  totalAnimals: number;
  recordedAnimals: number;
  totalLiters: number;
  isComplete: boolean;
  weeklyStreak: number;
}

/**
 * Check if all milk-producing animals have been recorded for a session
 */
export async function checkSessionCompletion(
  userId: string,
  session: 'morning' | 'afternoon'
): Promise<{ success: boolean; stats?: CompletionStats; error?: string }> {
  try {
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

    // Get today's milk records for this session
    const { data: records, error: recordsError } = await supabase
      .from('milk_production')
      .select('animal_id, liters')
      .eq('user_id', userId)
      .eq('session', session)
      .gte('recorded_at', todayStr);

    if (recordsError) throw recordsError;

    const recordedAnimals = new Set(records?.map((r) => r.animal_id) || []).size;
    const totalLiters = records?.reduce((sum, r) => sum + Number(r.liters), 0) || 0;
    const isComplete = totalAnimals > 0 && recordedAnimals === totalAnimals;

    // Calculate weekly streak
    const weeklyStreak = await calculateWeeklyStreak(userId, session);

    return {
      success: true,
      stats: {
        totalAnimals,
        recordedAnimals,
        totalLiters,
        isComplete,
        weeklyStreak,
      },
    };
  } catch (error) {
    console.error('Error checking session completion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to check completion',
    };
  }
}

/**
 * Calculate weekly streak (consecutive days with complete recordings)
 */
async function calculateWeeklyStreak(
  userId: string,
  session: 'morning' | 'afternoon'
): Promise<number> {
  try {
    // Get all milk-producing animals count
    const { data: animals, error: animalsError } = await supabase
      .from('animals')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .in('type', ['cattle', 'goat', 'sheep']);

    if (animalsError) throw animalsError;

    const totalAnimals = animals?.length || 0;
    if (totalAnimals === 0) return 0;

    let streak = 0;
    const today = new Date();

    // Check last 7 days
    for (let i = 0; i < 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      checkDate.setHours(0, 0, 0, 0);
      const checkDateStr = checkDate.toISOString();

      const nextDay = new Date(checkDate);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString();

      // Get records for this day and session
      const { data: records, error: recordsError } = await supabase
        .from('milk_production')
        .select('animal_id')
        .eq('user_id', userId)
        .eq('session', session)
        .gte('recorded_at', checkDateStr)
        .lt('recorded_at', nextDayStr);

      if (recordsError) throw recordsError;

      const recordedAnimals = new Set(records?.map((r) => r.animal_id) || []).size;

      if (recordedAnimals === totalAnimals) {
        streak++;
      } else {
        break; // Streak broken
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

/**
 * Send achievement notification when session is complete
 */
export async function sendCompletionNotification(
  userId: string,
  session: 'morning' | 'afternoon',
  stats: CompletionStats
): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionDisplay = session === 'morning' ? 'Morning' : 'Afternoon';
    
    let title = `${sessionDisplay} Recording Complete! 🎉`;
    let message = `You recorded ${stats.totalLiters.toFixed(1)}L from ${stats.recordedAnimals} animal${stats.recordedAnimals > 1 ? 's' : ''}`;

    // Add streak info if applicable
    if (stats.weeklyStreak > 1) {
      message += `. ${stats.weeklyStreak} day streak! 🔥`;
    }

    const notification = await createNotification({
      type: 'milk_reminder',
      title,
      message,
      priority: 'low',
      action_url: '/milk-production',
      metadata: {
        session,
        total_liters: stats.totalLiters,
        recorded_animals: stats.recordedAnimals,
        total_animals: stats.totalAnimals,
        weekly_streak: stats.weeklyStreak,
        completed_at: new Date().toISOString(),
        is_achievement: true,
      },
    });

    return { success: !!notification, error: notification ? undefined : 'Failed to create notification' };
  } catch (error) {
    console.error('Error sending completion notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send notification',
    };
  }
}

/**
 * Check and send completion notification if session is complete
 */
export async function checkAndNotifyCompletion(
  userId: string,
  session: 'morning' | 'afternoon'
): Promise<void> {
  try {
    const result = await checkSessionCompletion(userId, session);

    if (result.success && result.stats?.isComplete) {
      // Check if we already sent a completion notification today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data: existingNotif, error: notifError } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('type', 'milk_reminder')
        .gte('created_at', todayStr)
        .contains('metadata', { session, is_achievement: true });

      if (notifError) throw notifError;

      // Only send if we haven't sent one today for this session
      if (!existingNotif || existingNotif.length === 0) {
        await sendCompletionNotification(userId, session, result.stats);
      }
    }
  } catch (error) {
    console.error('Error checking and notifying completion:', error);
  }
}
