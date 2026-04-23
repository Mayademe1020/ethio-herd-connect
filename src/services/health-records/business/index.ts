/**
 * @fileoverview Health Records Business Layer Exports
 */

// Calculations
export {
  calculateVaccinationStatuses,
  calculateHealthStats,
  validateHealthRecordInput,
  groupRecordsByMonth,
  filterRecordsByType,
  sortRecordsByDate,
  type VaccinationStatus,
  type HealthStats
} from './calculations';

// Reminders
export {
  shouldSendReminder,
  getReminderMessage,
  calculateUpcomingReminders,
  getTodaysReminders,
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfig,
  type Reminder
} from './reminders';