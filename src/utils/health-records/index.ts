/**
 * @fileoverview Health Records Utilities
 * Centralized exports for all health record utilities
 */

// ID generation
export {
  generateTempId,
  generateHealthRecordId,
  isTempId,
  getTempIdDate
} from './id';

// Date calculations
export {
  calculateNextDueDate,
  getDaysUntil,
  isOverdue,
  isDueSoon,
  formatDate,
  getToday,
  addMonths
} from './date';

// Formatting
export {
  RECORD_TYPE_LABELS,
  SEVERITY_LABELS,
  getRecordTypeLabel,
  getSeverityLabel,
  formatRecordSummary,
  truncateText,
  formatPhone,
  capitalizeWords
} from './format';