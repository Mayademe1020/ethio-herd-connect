/**
 * Pregnancy calculation utilities for livestock management
 * Handles gestation period calculations for different animal types
 */

import { addDays, differenceInDays, parseISO } from 'date-fns';

/**
 * Gestation periods in days for different animal types
 */
export const GESTATION_DAYS = {
  cattle: 283,  // ~9 months
  goat: 150,    // ~5 months
  sheep: 147,   // ~5 months
} as const;

export type AnimalTypeForPregnancy = keyof typeof GESTATION_DAYS;

/**
 * Calculate expected delivery date based on breeding date and animal type
 * @param breedingDate - The date the animal was bred
 * @param animalType - Type of animal (cattle, goat, sheep)
 * @returns Expected delivery date
 */
export function calculateDeliveryDate(
  breedingDate: Date | string,
  animalType: AnimalTypeForPregnancy
): Date {
  const date = typeof breedingDate === 'string' ? parseISO(breedingDate) : breedingDate;
  const gestationDays = GESTATION_DAYS[animalType];
  return addDays(date, gestationDays);
}

/**
 * Calculate days remaining until delivery
 * @param expectedDeliveryDate - The expected delivery date
 * @returns Number of days remaining (negative if overdue)
 */
export function calculateDaysRemaining(expectedDeliveryDate: Date | string): number {
  const deliveryDate = typeof expectedDeliveryDate === 'string' 
    ? parseISO(expectedDeliveryDate) 
    : new Date(expectedDeliveryDate);
  
  // Normalize both dates to start of day for accurate comparison
  const normalizedDelivery = new Date(deliveryDate);
  normalizedDelivery.setHours(0, 0, 0, 0);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return differenceInDays(normalizedDelivery, today);
}

/**
 * Check if delivery is soon (within 7 days and not overdue)
 * @param expectedDeliveryDate - The expected delivery date
 * @returns True if delivery is within 7 days (0-7 days remaining)
 */
export function isDeliverySoon(expectedDeliveryDate: Date | string): boolean {
  const daysRemaining = calculateDaysRemaining(expectedDeliveryDate);
  return daysRemaining >= 0 && daysRemaining <= 7;
}

/**
 * Get pregnancy status message based on days remaining
 * @param daysRemaining - Number of days until delivery
 * @returns Status message key for translation
 */
export function getPregnancyStatusMessage(daysRemaining: number): string {
  if (daysRemaining < 0) {
    return 'pregnancy.overdue';
  } else if (daysRemaining === 0) {
    return 'pregnancy.dueToday';
  } else if (daysRemaining <= 7) {
    return 'pregnancy.deliverySoon';
  } else if (daysRemaining <= 30) {
    return 'pregnancy.dueThisMonth';
  } else {
    return 'pregnancy.daysRemaining';
  }
}

/**
 * Validate breeding date (cannot be in the future)
 * @param breedingDate - The breeding date to validate
 * @returns True if valid, false otherwise
 */
export function isValidBreedingDate(breedingDate: Date | string): boolean {
  const date = typeof breedingDate === 'string' ? parseISO(breedingDate) : breedingDate;
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  return date <= today;
}

/**
 * Get animal type from subtype for pregnancy calculations
 * @param subtype - Animal subtype (e.g., 'cow', 'bull', 'female_goat')
 * @returns Animal type for pregnancy calculations or null if not applicable
 */
export function getAnimalTypeForPregnancy(subtype: string): AnimalTypeForPregnancy | null {
  const subtypeLower = subtype.toLowerCase();
  
  if (subtypeLower.includes('cow') || subtypeLower.includes('heifer')) {
    return 'cattle';
  } else if (subtypeLower.includes('goat')) {
    return 'goat';
  } else if (subtypeLower.includes('ewe') || subtypeLower.includes('sheep')) {
    return 'sheep';
  }
  
  return null;
}

/**
 * Check if animal can be pregnant based on subtype
 * @param subtype - Animal subtype
 * @returns True if animal can be pregnant
 */
export function canBePregnant(subtype: string): boolean {
  const subtypeLower = subtype.toLowerCase();
  
  // Female animals that can be pregnant
  const femaleTypes = ['cow', 'heifer', 'female_goat', 'ewe'];
  
  return femaleTypes.some(type => subtypeLower.includes(type));
}
