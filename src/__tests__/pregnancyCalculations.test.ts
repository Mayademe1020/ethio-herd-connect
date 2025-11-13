import { describe, it, expect, beforeEach, vi } from 'vitest';
import { addDays, subDays } from 'date-fns';
import {
  calculateDeliveryDate,
  calculateDaysRemaining,
  isDeliverySoon,
  getPregnancyStatusMessage,
  isValidBreedingDate,
  getAnimalTypeForPregnancy,
  canBePregnant,
  GESTATION_DAYS,
} from '../utils/pregnancyCalculations';

describe('Pregnancy Calculations', () => {
  beforeEach(() => {
    // Reset date mocks
    vi.useRealTimers();
  });

  describe('calculateDeliveryDate', () => {
    it('should calculate delivery date for cattle (283 days)', () => {
      const breedingDate = new Date('2024-01-01');
      const deliveryDate = calculateDeliveryDate(breedingDate, 'cattle');
      const expectedDate = addDays(breedingDate, 283);
      
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should calculate delivery date for goats (150 days)', () => {
      const breedingDate = new Date('2024-01-01');
      const deliveryDate = calculateDeliveryDate(breedingDate, 'goat');
      const expectedDate = addDays(breedingDate, 150);
      
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should calculate delivery date for sheep (147 days)', () => {
      const breedingDate = new Date('2024-01-01');
      const deliveryDate = calculateDeliveryDate(breedingDate, 'sheep');
      const expectedDate = addDays(breedingDate, 147);
      
      expect(deliveryDate.toDateString()).toBe(expectedDate.toDateString());
    });

    it('should handle string dates', () => {
      const breedingDate = '2024-01-01';
      const deliveryDate = calculateDeliveryDate(breedingDate, 'cattle');
      
      expect(deliveryDate).toBeInstanceOf(Date);
    });
  });

  describe('calculateDaysRemaining', () => {
    it('should calculate positive days remaining', () => {
      const futureDate = addDays(new Date(), 30);
      const daysRemaining = calculateDaysRemaining(futureDate);
      
      expect(daysRemaining).toBe(30);
    });

    it('should calculate negative days for overdue', () => {
      const pastDate = subDays(new Date(), 5);
      const daysRemaining = calculateDaysRemaining(pastDate);
      
      expect(daysRemaining).toBe(-5);
    });

    it('should return 0 for today', () => {
      const today = new Date();
      const daysRemaining = calculateDaysRemaining(today);
      
      expect(daysRemaining).toBe(0);
    });

    it('should handle string dates', () => {
      const futureDate = addDays(new Date(), 10).toISOString();
      const daysRemaining = calculateDaysRemaining(futureDate);
      
      expect(daysRemaining).toBe(10);
    });
  });

  describe('isDeliverySoon', () => {
    it('should return true for delivery within 7 days', () => {
      const soonDate = addDays(new Date(), 5);
      expect(isDeliverySoon(soonDate)).toBe(true);
    });

    it('should return true for delivery today', () => {
      const today = new Date();
      expect(isDeliverySoon(today)).toBe(true);
    });

    it('should return true for delivery in exactly 7 days', () => {
      const sevenDays = addDays(new Date(), 7);
      expect(isDeliverySoon(sevenDays)).toBe(true);
    });

    it('should return false for delivery more than 7 days away', () => {
      const farDate = addDays(new Date(), 10);
      expect(isDeliverySoon(farDate)).toBe(false);
    });

    it('should return false for overdue delivery', () => {
      const pastDate = subDays(new Date(), 1);
      expect(isDeliverySoon(pastDate)).toBe(false);
    });
  });

  describe('getPregnancyStatusMessage', () => {
    it('should return overdue message for negative days', () => {
      expect(getPregnancyStatusMessage(-5)).toBe('pregnancy.overdue');
    });

    it('should return due today message for 0 days', () => {
      expect(getPregnancyStatusMessage(0)).toBe('pregnancy.dueToday');
    });

    it('should return delivery soon message for 1-7 days', () => {
      expect(getPregnancyStatusMessage(3)).toBe('pregnancy.deliverySoon');
      expect(getPregnancyStatusMessage(7)).toBe('pregnancy.deliverySoon');
    });

    it('should return due this month message for 8-30 days', () => {
      expect(getPregnancyStatusMessage(15)).toBe('pregnancy.dueThisMonth');
      expect(getPregnancyStatusMessage(30)).toBe('pregnancy.dueThisMonth');
    });

    it('should return days remaining message for >30 days', () => {
      expect(getPregnancyStatusMessage(60)).toBe('pregnancy.daysRemaining');
    });
  });

  describe('isValidBreedingDate', () => {
    it('should return true for past dates', () => {
      const pastDate = subDays(new Date(), 30);
      expect(isValidBreedingDate(pastDate)).toBe(true);
    });

    it('should return true for today', () => {
      const today = new Date();
      expect(isValidBreedingDate(today)).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = addDays(new Date(), 1);
      expect(isValidBreedingDate(futureDate)).toBe(false);
    });

    it('should handle string dates', () => {
      const pastDate = subDays(new Date(), 10).toISOString();
      expect(isValidBreedingDate(pastDate)).toBe(true);
    });
  });

  describe('getAnimalTypeForPregnancy', () => {
    it('should return cattle for cow subtypes', () => {
      expect(getAnimalTypeForPregnancy('cow')).toBe('cattle');
      expect(getAnimalTypeForPregnancy('Cow')).toBe('cattle');
      expect(getAnimalTypeForPregnancy('heifer')).toBe('cattle');
    });

    it('should return goat for goat subtypes', () => {
      expect(getAnimalTypeForPregnancy('female_goat')).toBe('goat');
      expect(getAnimalTypeForPregnancy('Female Goat')).toBe('goat');
    });

    it('should return sheep for sheep subtypes', () => {
      expect(getAnimalTypeForPregnancy('ewe')).toBe('sheep');
      expect(getAnimalTypeForPregnancy('Ewe')).toBe('sheep');
    });

    it('should return null for non-applicable types', () => {
      expect(getAnimalTypeForPregnancy('bull')).toBe(null);
      expect(getAnimalTypeForPregnancy('ram')).toBe(null);
    });
  });

  describe('canBePregnant', () => {
    it('should return true for female cattle', () => {
      expect(canBePregnant('cow')).toBe(true);
      expect(canBePregnant('heifer')).toBe(true);
    });

    it('should return true for female goats', () => {
      expect(canBePregnant('female_goat')).toBe(true);
    });

    it('should return true for female sheep', () => {
      expect(canBePregnant('ewe')).toBe(true);
    });

    it('should return false for male animals', () => {
      expect(canBePregnant('bull')).toBe(false);
      expect(canBePregnant('ram')).toBe(false);
      expect(canBePregnant('male_goat')).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(canBePregnant('COW')).toBe(true);
      expect(canBePregnant('Female_Goat')).toBe(true);
    });
  });

  describe('GESTATION_DAYS constants', () => {
    it('should have correct gestation periods', () => {
      expect(GESTATION_DAYS.cattle).toBe(283);
      expect(GESTATION_DAYS.goat).toBe(150);
      expect(GESTATION_DAYS.sheep).toBe(147);
    });
  });
});
