// src/utils/animalStatusUtils.ts - Utility functions for calculating animal reproductive status

/**
 * Calculate age in months from birth date to given date (or today if not provided)
 * @param birthDate ISO string or Date object
 * @param endDate ISO string or Date object (defaults to today)
 * @returns Age in months (floating point)
 */
export const calculateAgeInMonths = (birthDate: string | Date, endDate: string | Date = new Date()): number => {
  const birth = new Date(birthDate);
  const end = new Date(endDate);
  const months = (end.getFullYear() - birth.getFullYear()) * 12 + (end.getMonth() - birth.getMonth());
  // Adjust for days
  const dayAdjustment = (end.getDate() - birth.getDate()) / 30.44; // Average days per month
  return months + dayAdjustment;
};

/**
 * Calculate days between two dates
 * @param startDate ISO string or Date object
 * @param endDate ISO string or Date object (defaults to today)
 * @returns Number of days (floating point)
 */
export const daysBetween = (startDate: string | Date, endDate: string | Date = new Date()): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const time = end.getTime() - start.getTime();
  return time / (1000 * 3600 * 24); // Convert milliseconds to days
};

/**
 * Check if given days since last breeding indicates the animal is in heat
 * Assumes 21-day estrus cycle with heat lasting approximately 24 hours
 * We use a 3-day window (day 19-21 of the cycle, where day 21 is the next expected heat)
 * @param daysSinceBreeding Number of days since last breeding (can be null)
 * @returns True if likely in heat
 */
export const isInHeatWindow = (daysSinceBreeding: number | null): boolean => {
  if (daysSinceBreeding === null) return false;
  const dayInCycle = daysSinceBreeding % 21;
  // Heat window: 3 days around the expected heat (day 21 of cycle, which is 0 in modulo)
  // We consider days 19,20,21,22,23 (which modulo 21 are 19,20,0,1,2)
  return dayInCycle >= 19 || dayInCycle <= 2;
};

/**
 * Calculate the reproductive status of an animal
 * @param animal Animal data object (should have gender, birth_date, lastBreedingDate?, lastLactationEndDate?)
 * @returns Status string: 'male', 'youngFemale', 'lactating', 'pregnant', 'inHeat', 'dry'
 */
export const calculateAnimalStatus = (animal: {
  gender: string;
  birth_date: string;
  lastBreedingDate?: string | null;
  lastLactationEndDate?: string | null;
}): string => {
  // Handle male animals
  if (animal.gender.toLowerCase() === 'male') {
    return 'male';
  }

  // Calculate age in months
  const ageInMonths = calculateAgeInMonths(animal.birth_date);

  // Young female (under 24 months)
  if (animal.gender.toLowerCase() === 'female' && ageInMonths < 24) {
    return 'youngFemale';
  }

  // Calculate days since last breeding and last lactation end
  const daysSinceBreeding = animal.lastBreedingDate ? daysBetween(animal.lastBreedingDate) : null;
  const daysSinceLactationEnd = animal.lastLactationEndDate ? daysBetween(animal.lastLactationEndDate) : null;

  // Check pregnancy (gestation period ~283 days)
  if (daysSinceBreeding !== null && daysSinceBreeding <= 283) {
    return 'pregnant';
  }

  // Check in heat (only if not pregnant)
  if (daysSinceBreeding !== null && isInHeatWindow(daysSinceBreeding)) {
    return 'inHeat';
  }

  // Check lactation (standard lactation period ~305 days)
  if (daysSinceLactationEnd !== null && daysSinceLactationEnd <= 305) {
    return 'lactating';
  }

  // Default to dry/open
  return 'dry';
};

/**
 * Get the display information for a status
 * @param status Status string from calculateAnimalStatus
 * @returns Object with Amharic label, English label, color, and tooltip
 */
export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'male':
      return {
        labelAm: 'ኮርማ',
        labelEn: 'Male',
        color: '#6B7280', // gray-500
        tooltip: 'ኮርማ / Male - Breeding stock',
        icon: '♂'
      };
    case 'youngFemale':
      return {
        labelAm: 'ጊደር',
        labelEn: 'Young Female',
        color: '#8B5CF6', // violet-500
        tooltip: 'ጊደር / Young Female - Not breeding yet',
        icon: '👧'
      };
    case 'lactating':
      return {
        labelAm: 'የምትታለብ / አላቢ',
        labelEn: 'Lactating',
        color: '#10B981', // emerald-500
        tooltip: '🟢 የምትታለብ / አላቢ - Currently being milked, ready for regular milking',
        icon: '🟢'
      };
    case 'pregnant':
      return {
        labelAm: 'ፅንስ የያዘች / ያረገዘች',
        labelEn: 'Pregnant',
        color: '#F59E0B', // amber-500
        tooltip: '🟡 ፅንስ የያዘች / ያረገዘች - Carrying a fetus, needs extra feed & care',
        icon: '🟡'
      };
    case 'inHeat':
      return {
        labelAm: 'የፈለገች',
        labelEn: 'In Heat',
        color: '#3B82F6', // blue-500
        tooltip: '🔵 የፈለገች - In Heat, breed immediately! (12-24 hour window)',
        icon: '🔵'
      };
    case 'dry':
      return {
        labelAm: 'ያልያዘች',
        labelEn: 'Dry/Open',
        color: '#EF4444', // red-500
        tooltip: '🔴 ያልያዘች - Dry/Open, ready for breeding',
        icon: '🔴'
      };
    default:
      return {
        labelAm: 'የምንታለብ',
        labelEn: 'Unknown',
        color: '#9CA3AF', // gray-400
        tooltip: 'Status not set',
        icon: '⚪'
      };
  }
};

export type AnimalStatus = 
  | 'male' 
  | 'youngFemale' 
  | 'lactating' 
  | 'pregnant' 
  | 'inHeat' 
  | 'dry';

export default {
  calculateAgeInMonths,
  daysBetween,
  isInHeatWindow,
  calculateAnimalStatus,
  getStatusInfo
};