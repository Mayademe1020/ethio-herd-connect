/**
 * @fileoverview ID Generation Utilities
 * Centralized ID generation to prevent duplication and ensure consistency
 */

/**
 * Generates a temporary ID for optimistic updates
 * Format: temp_{timestamp}_{random}
 * @returns {string} Temporary unique identifier
 * @example
 * const tempId = generateTempId(); // "temp_1707421234567_a1b2c3d4"
 */
export const generateTempId = (): string => 
  `temp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

/**
 * Generates a health record ID
 * @returns {string} Unique health record identifier
 */
export const generateHealthRecordId = (): string => 
  `hr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

/**
 * Validates if an ID is a temporary ID
 * @param {string} id - The ID to check
 * @returns {boolean} True if the ID is temporary
 */
export const isTempId = (id: string): boolean => 
  id.startsWith('temp_');

/**
 * Extracts timestamp from a temporary ID
 * @param {string} tempId - The temporary ID
 * @returns {Date | null} The creation date or null if invalid
 */
export const getTempIdDate = (tempId: string): Date | null => {
  if (!isTempId(tempId)) return null;
  const timestamp = parseInt(tempId.split('_')[1], 10);
  return isNaN(timestamp) ? null : new Date(timestamp);
};