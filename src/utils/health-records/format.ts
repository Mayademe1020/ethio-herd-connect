/**
 * @fileoverview Formatting Utilities
 * Text and data formatting for health records
 */

import type { HealthRecord } from '@/types/healthRecord';

/**
 * Record type display names
 */
export const RECORD_TYPE_LABELS: Record<string, string> = {
  vaccination: 'Vaccination',
  illness: 'Illness',
  checkup: 'Checkup',
  treatment: 'Treatment'
};

/**
 * Severity level display names
 */
export const SEVERITY_LABELS: Record<string, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  severe: 'Severe'
};

/**
 * Gets display name for record type
 * @param type - Record type
 * @returns {string} Display name
 */
export const getRecordTypeLabel = (type: string): string =>
  RECORD_TYPE_LABELS[type] || type;

/**
 * Gets display name for severity
 * @param severity - Severity level
 * @returns {string} Display name
 */
export const getSeverityLabel = (severity: string | null): string =>
  severity ? SEVERITY_LABELS[severity] || severity : 'Not specified';

/**
 * Formats a record summary for display
 * @param record - Health record
 * @returns {string} Formatted summary
 */
export const formatRecordSummary = (record: HealthRecord): string => {
  const parts: string[] = [];
  
  parts.push(getRecordTypeLabel(record.record_type));
  
  if (record.medicine_name) {
    parts.push(`- ${record.medicine_name}`);
  }
  
  if (record.severity) {
    parts.push(`(${getSeverityLabel(record.severity)})`);
  }
  
  return parts.join(' ');
};

/**
 * Truncates text to a maximum length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Formats a phone number for display
 * @param phone - Phone number
 * @returns {string} Formatted phone
 */
export const formatPhone = (phone: string): string => {
  // Ethiopian format: 09XX XXX XXX
  if (phone.startsWith('09') && phone.length === 10) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7)}`;
  }
  return phone;
};

/**
 * Capitalizes first letter of each word
 * @param str - String to capitalize
 * @returns {string} Capitalized string
 */
export const capitalizeWords = (str: string): string =>
  str.replace(/\b\w/g, char => char.toUpperCase());