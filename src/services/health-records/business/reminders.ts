/**
 * @fileoverview Reminder Business Logic
 * Determines when reminders should be sent
 * No side effects - pure functions
 */

import type { HealthRecord } from '@/types/healthRecord';
import { calculateNextDueDate, getDaysUntil } from '@/utils/health-records/date';

export interface ReminderConfig {
  daysBefore: number[];
  enabled: boolean;
}

export interface Reminder {
  animalId: string;
  animalName: string;
  vaccineName: string;
  daysUntil: number;
  nextDueDate: string;
  shouldSend: boolean;
}

/**
 * Default reminder configuration
 * Reminders at: 14 days, 7 days, 3 days, and on due date (0)
 */
export const DEFAULT_REMINDER_CONFIG: ReminderConfig = {
  daysBefore: [14, 7, 3, 0],
  enabled: true
};

/**
 * Determines if a reminder should be sent today
 * @param daysUntil - Days until vaccination is due
 * @param config - Reminder configuration
 * @returns {boolean} True if reminder should be sent
 */
export const shouldSendReminder = (
  daysUntil: number,
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG
): boolean => {
  if (!config.enabled) return false;
  return config.daysBefore.includes(daysUntil);
};

/**
 * Gets reminder message based on urgency
 * @param animalName - Animal name
 * @param vaccineName - Vaccine name
 * @param daysUntil - Days until due
 * @param nextDueDate - Next due date
 * @returns {string} Formatted reminder message
 */
export const getReminderMessage = (
  animalName: string,
  vaccineName: string,
  daysUntil: number,
  nextDueDate: string
): { title: string; body: string } => {
  if (daysUntil === 0) {
    return {
      title: '🔔 Vaccination Due Today!',
      body: `${animalName} needs ${vaccineName} vaccination today.`
    };
  } else if (daysUntil < 0) {
    return {
      title: `⚠️ Vaccination Overdue!`,
      body: `${animalName} ${vaccineName} vaccination is ${Math.abs(daysUntil)} days overdue.`
    };
  } else {
    return {
      title: `🔔 Vaccination Due in ${daysUntil} Days`,
      body: `${animalName} needs ${vaccineName} on ${nextDueDate}.`
    };
  }
};

/**
 * Calculates all upcoming reminders for a set of records
 * @param records - Health records
 * @param config - Reminder configuration
 * @returns {Reminder[]} Reminders that should be sent today
 */
export const calculateUpcomingReminders = (
  records: HealthRecord[],
  config: ReminderConfig = DEFAULT_REMINDER_CONFIG
): Reminder[] => {
  // Get only vaccinations
  const vaccinations = records.filter(r => r.record_type === 'vaccination');
  
  // Group by animal-vaccine to get latest
  const latestVaccinations = new Map<string, HealthRecord>();
  
  vaccinations.forEach(record => {
    const vaccineName = record.medicine_name;
    if (!vaccineName) return;
    
    const key = `${record.animal_id}-${vaccineName}`;
    const existing = latestVaccinations.get(key);
    
    if (!existing || new Date(record.administered_date) > new Date(existing.administered_date)) {
      latestVaccinations.set(key, record);
    }
  });
  
  // Calculate reminders
  const reminders: Reminder[] = [];
  
  latestVaccinations.forEach((record, key) => {
    const vaccineName = record.medicine_name!;
    const nextDueDate = calculateNextDueDate(vaccineName, record.administered_date);
    const daysUntil = getDaysUntil(nextDueDate);
    
    const shouldSend = shouldSendReminder(daysUntil, config);
    
    reminders.push({
      animalId: record.animal_id,
      animalName: record.animal_id, // Will be enriched with actual name
      vaccineName,
      daysUntil,
      nextDueDate,
      shouldSend
    });
  });
  
  return reminders;
};

/**
 * Gets reminders that should be sent today
 * @param reminders - All reminders
 * @returns {Reminder[]} Reminders to send today
 */
export const getTodaysReminders = (reminders: Reminder[]): Reminder[] =>
  reminders.filter(r => r.shouldSend);