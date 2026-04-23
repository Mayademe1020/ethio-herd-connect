/**
 * @fileoverview Push Notification Service
 * Browser push notification handling
 */

import type { Reminder } from '../business/reminders';
import { getReminderMessage } from '../business/reminders';

export interface NotificationPermission {
  granted: boolean;
  error?: string;
}

/**
 * Requests permission for browser notifications
 * @returns {Promise<NotificationPermission>} Permission status
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return { granted: false, error: 'Notifications not supported in this browser' };
  }
  
  try {
    const permission = await Notification.requestPermission();
    return { granted: permission === 'granted' };
  } catch (error) {
    return { 
      granted: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

/**
 * Checks if notification permission is granted
 * @returns {boolean} True if granted
 */
export const hasNotificationPermission = (): boolean => {
  if (!('Notification' in window)) return false;
  return Notification.permission === 'granted';
};

/**
 * Sends a browser push notification
 * @param title - Notification title
 * @param body - Notification body
 * @param options - Additional options
 * @returns {boolean} True if sent successfully
 */
export const sendPushNotification = (
  title: string,
  body: string,
  options?: {
    icon?: string;
    tag?: string;
    requireInteraction?: boolean;
    onClick?: () => void;
  }
): boolean => {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }
  
  try {
    const notification = new Notification(title, {
      body,
      icon: options?.icon || '/icon.png',
      tag: options?.tag,
      requireInteraction: options?.requireInteraction || false
    });
    
    if (options?.onClick) {
      notification.onclick = options.onClick;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Sends a vaccination reminder notification
 * @param reminder - Reminder data
 * @param vetContact - Optional vet contact info
 * @returns {boolean} True if sent successfully
 */
export const sendVaccinationReminderNotification = (
  reminder: Reminder,
  vetContact?: { name: string; phone: string }
): boolean => {
  const { title, body } = getReminderMessage(
    reminder.animalName,
    reminder.vaccineName,
    reminder.daysUntil,
    reminder.nextDueDate
  );
  
  let fullBody = body;
  if (vetContact) {
    fullBody += `\nContact: ${vetContact.name} (${vetContact.phone})`;
  }
  
  return sendPushNotification(title, fullBody, {
    tag: `vacc-${reminder.animalId}-${reminder.vaccineName}`,
    requireInteraction: reminder.daysUntil === 0 || reminder.daysUntil < 0
  });
};

/**
 * Sends test notification (for permission check)
 * @returns {boolean} True if sent
 */
export const sendTestNotification = (): boolean => {
  return sendPushNotification(
    '✅ Notifications Enabled',
    'You will receive vaccination reminders.',
    { tag: 'test-notification' }
  );
};