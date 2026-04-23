/**
 * @fileoverview Health Records Service Facade
 * Main public API for health records functionality
 * Orchestrates API, business logic, and notification layers
 */

import { supabase } from '@/integrations/supabase/client';
import { offlineQueue } from '@/lib/offlineQueue';
import type { 
  HealthRecord, 
  CreateHealthRecordInput, 
  UpdateHealthRecordInput 
} from '@/types/healthRecord';

// API layer
import {
  apiCreateHealthRecord,
  apiGetHealthRecordsByAnimal,
  apiUpdateHealthRecord,
  apiDeleteHealthRecord,
  apiGetRecentVaccinations,
  type HealthRecordError
} from './api';

// Business logic layer
import {
  calculateVaccinationStatuses,
  calculateHealthStats,
  validateHealthRecordInput,
  groupRecordsByMonth,
  filterRecordsByType,
  sortRecordsByDate,
  calculateUpcomingReminders,
  getTodaysReminders as getTodaysRemindersFromList,
  shouldSendReminder,
  getReminderMessage,
  type VaccinationStatus,
  type HealthStats,
  type Reminder,
  type ReminderConfig
} from './business';

// Notifications layer
import {
  requestNotificationPermission,
  hasNotificationPermission,
  sendPushNotification,
  sendVaccinationReminderNotification,
  isTelegramConfigured,
  sendTelegramMessage
} from './notifications';

// Utilities
import { generateTempId } from '@/utils/health-records/id';

// Re-export types
export type {
  HealthRecord,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
  HealthRecordError,
  VaccinationStatus,
  HealthStats,
  Reminder,
  ReminderConfig
};

// ============================================
// CREATE OPERATIONS
// ============================================

/**
 * Creates a new health record
 * Handles both online and offline scenarios
 * @param input - Health record data
 * @returns {Promise<HealthRecord>} Created record
 * @throws {HealthRecordError} If creation fails
 * @example
 * const record = await createHealthRecord({
 *   animal_id: 'COW001',
 *   record_type: 'vaccination',
 *   medicine_name: 'Anthrax',
 *   administered_date: '2025-02-08'
 * });
 */
export const createHealthRecord = async (
  input: CreateHealthRecordInput
): Promise<HealthRecord> => {
  // Validate input
  const validationError = validateHealthRecordInput(input);
  if (validationError) {
    throw new Error(validationError);
  }
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  // Handle offline scenario
  if (!navigator.onLine) {
    const tempRecord = {
      id: generateTempId(),
      user_id: user.id,
      animal_id: input.animal_id,
      record_type: input.record_type,
      medicine_name: input.medicine_name ?? null,
      symptoms: input.symptoms ?? null,
      severity: input.severity ?? null,
      notes: input.notes ?? null,
      photo_url: input.photo_url ?? null,
      administered_date: input.administered_date,
      created_at: new Date().toISOString()
    };
    
    await offlineQueue.addToQueue('health_record', tempRecord);
    return tempRecord as HealthRecord;
  }
  
  // Online - use API layer
  return apiCreateHealthRecord(user.id, input);
};

// ============================================
// READ OPERATIONS
// ============================================

/**
 * Fetches health records for an animal
 * @param animalId - Animal ID
 * @param filters - Optional filters (type, severity, date range)
 * @returns {Promise<HealthRecord[]>} Health records
 * @example
 * const records = await getHealthRecords('COW001', { recordType: 'vaccination' });
 */
export const getHealthRecords = async (
  animalId: string,
  filters?: { recordType?: string; severity?: string; startDate?: string; endDate?: string }
): Promise<HealthRecord[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return apiGetHealthRecordsByAnimal(user.id, animalId, filters);
};

/**
 * Gets recent vaccinations for an animal
 * @param animalId - Animal ID
 * @param limit - Maximum number of records (default: 5)
 * @returns {Promise<HealthRecord[]>} Vaccination records
 */
export const getRecentVaccinations = async (
  animalId: string,
  limit: number = 5
): Promise<HealthRecord[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return apiGetRecentVaccinations(user.id, animalId, limit);
};

// ============================================
// UPDATE OPERATIONS
// ============================================

/**
 * Updates an existing health record
 * @param recordId - Record ID to update
 * @param updates - Fields to update
 * @returns {Promise<HealthRecord>} Updated record
 * @example
 * const updated = await updateHealthRecord('record-123', {
 *   medicine_name: 'New Vaccine Name'
 * });
 */
export const updateHealthRecord = async (
  recordId: string,
  updates: Partial<UpdateHealthRecordInput>
): Promise<HealthRecord> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return apiUpdateHealthRecord(user.id, recordId, updates);
};

// ============================================
// DELETE OPERATIONS
// ============================================

/**
 * Deletes a health record
 * @param recordId - Record ID to delete
 * @returns {Promise<void>}
 * @example
 * await deleteHealthRecord('record-123');
 */
export const deleteHealthRecord = async (recordId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated');
  }
  
  return apiDeleteHealthRecord(user.id, recordId);
};

// ============================================
// BUSINESS LOGIC OPERATIONS
// ============================================

/**
 * Calculates vaccination statuses for an animal
 * @param animalId - Animal ID
 * @returns {Promise<VaccinationStatus[]>} Vaccination statuses with due dates
 * @example
 * const statuses = await getVaccinationStatuses('COW001');
 * // Returns: [{ vaccineName: 'Anthrax', nextDueDate: '2025-08-08', status: 'valid' }]
 */
export const getVaccinationStatuses = async (
  animalId: string
): Promise<VaccinationStatus[]> => {
  const records = await getHealthRecords(animalId);
  return calculateVaccinationStatuses(records);
};

/**
 * Gets health statistics for an animal
 * @param animalId - Animal ID
 * @returns {Promise<HealthStats>} Statistics summary
 * @example
 * const stats = await getHealthStats('COW001');
 * // Returns: { totalRecords: 10, vaccinationCount: 5, ... }
 */
export const getHealthStats = async (animalId: string): Promise<HealthStats> => {
  const records = await getHealthRecords(animalId);
  return calculateHealthStats(records);
};

/**
 * Groups records by month for display
 * @param animalId - Animal ID
 * @returns {Promise<Map<string, HealthRecord[]>>} Records grouped by month
 */
export const getRecordsGroupedByMonth = async (
  animalId: string
): Promise<Map<string, HealthRecord[]>> => {
  const records = await getHealthRecords(animalId);
  return groupRecordsByMonth(records);
};

// ============================================
// REMINDER OPERATIONS
// ============================================

/**
 * Calculates reminders that should be sent today
 * @param animalId - Animal ID
 * @returns {Promise<Reminder[]>} Reminders for today
 */
export const getRemindersForToday = async (animalId: string): Promise<Reminder[]> => {
  const records = await getHealthRecords(animalId);
  const reminders = calculateUpcomingReminders(records);
  return reminders.filter(r => r.shouldSend);
};

/**
 * Sends vaccination reminder notification
 * Combines push notification and Telegram
 * @param reminder - Reminder data
 * @param options - Notification options
 * @returns {Promise<{ push: boolean; telegram: boolean }>} Send results
 */
export const sendReminder = async (
  reminder: Reminder,
  options?: {
    telegramChatId?: string;
    vetContact?: { name: string; phone: string };
  }
): Promise<{ push: boolean; telegram: boolean }> => {
  // Send push notification
  const pushSent = sendVaccinationReminderNotification(
    reminder,
    options?.vetContact
  );
  
  // Send Telegram if configured
  let telegramSent = false;
  if (options?.telegramChatId && isTelegramConfigured()) {
    const result = await sendTelegramMessage({
      chatId: options.telegramChatId,
      text: getReminderMessage(
        reminder.animalName,
        reminder.vaccineName,
        reminder.daysUntil,
        reminder.nextDueDate
      ).body,
      parseMode: 'Markdown'
    });
    telegramSent = result.success;
  }
  
  return { push: pushSent, telegram: telegramSent };
};

// Re-export utility functions
export {
  // Validation
  validateHealthRecordInput,
  // Filtering & Sorting
  filterRecordsByType,
  sortRecordsByDate,
  // Reminder logic
  shouldSendReminder,
  getReminderMessage,
  calculateUpcomingReminders,
  // Notifications
  requestNotificationPermission,
  hasNotificationPermission,
  isTelegramConfigured
};