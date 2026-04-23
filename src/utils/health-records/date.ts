/**
 * @fileoverview Date Calculation Utilities
 * Centralized date operations for health records
 */

import { VACCINE_SCHEDULES, type VaccineSchedule } from '@/config/vaccines';

/**
 * Calculates the next due date for a vaccination
 * @param vaccineName - Name of the vaccine
 * @param administeredDate - Date the vaccine was administered (YYYY-MM-DD)
 * @returns {string} Next due date in YYYY-MM-DD format
 * @example
 * const nextDue = calculateNextDueDate('Anthrax', '2025-02-08');
 * // Returns: '2025-08-08'
 */
export const calculateNextDueDate = (vaccineName: string, administeredDate: string): string => {
  const date = new Date(administeredDate);
  
  // Find the vaccine schedule
  const schedule = Object.values(VACCINE_SCHEDULES)
    .flat()
    .find(v => v.name.toLowerCase() === vaccineName.toLowerCase());
  
  if (schedule) {
    date.setMonth(date.getMonth() + schedule.intervalMonths);
  } else {
    // Default: 6 months if vaccine not found
    date.setMonth(date.getMonth() + 6);
  }
  
  return date.toISOString().split('T')[0];
};

/**
 * Calculates days until a target date
 * @param targetDate - The target date (YYYY-MM-DD)
 * @returns {number} Days until target (negative if past)
 * @example
 * const days = getDaysUntil('2025-02-22'); // From 2025-02-08: returns 14
 */
export const getDaysUntil = (targetDate: string): number => {
  const target = new Date(targetDate);
  const today = new Date();
  
  // Reset time to midnight for accurate day calculation
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Checks if a date is overdue
 * @param dueDate - The due date (YYYY-MM-DD)
 * @returns {boolean} True if the date is in the past
 */
export const isOverdue = (dueDate: string): boolean => 
  getDaysUntil(dueDate) < 0;

/**
 * Checks if a vaccination is due soon (within 30 days)
 * @param dueDate - The due date (YYYY-MM-DD)
 * @returns {boolean} True if due within 30 days
 */
export const isDueSoon = (dueDate: string): boolean => {
  const days = getDaysUntil(dueDate);
  return days >= 0 && days <= 30;
};

/**
 * Formats a date for display
 * @param dateString - Date in YYYY-MM-DD format
 * @returns {string} Formatted date (e.g., "Feb 8, 2025")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Gets today's date in YYYY-MM-DD format
 * @returns {string} Today's date
 */
export const getToday = (): string => 
  new Date().toISOString().split('T')[0];

/**
 * Adds months to a date
 * @param dateString - Starting date (YYYY-MM-DD)
 * @param months - Number of months to add
 * @returns {string} New date in YYYY-MM-DD format
 */
export const addMonths = (dateString: string, months: number): string => {
  const date = new Date(dateString);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};