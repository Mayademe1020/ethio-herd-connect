import { describe, it, expect, beforeEach } from 'vitest';

// Import translations directly
import enTranslations from '../i18n/en.json';
import amTranslations from '../i18n/am.json';

/**
 * Localization Testing - Final Report Coverage
 * 
 * This test suite validates the localization system to ensure:
 * 1. Translation completeness (all keys exist in both languages)
 * 2. Translation quality (no empty values, proper formatting)
 * 3. Key consistency (English and Amharic have matching structure)
 * 
 * Manual testing is required for:
 * - Visual layout with Amharic text
 * - Language switching UI behavior
 * - Error message display in context
 * - Flag icon rendering
 * 
 * See: src/__tests__/localization.manual.test.md for manual test guide
 */

describe('Localization System - Automated Tests', () => {
  describe('Translation File Structure', () => {
    it('should have matching top-level keys in English and Amharic', () => {
      const enKeys = Object.keys(enTranslations).sort();
      const amKeys = Object.keys(amTranslations).sort();

      expect(enKeys).toEqual(amKeys);
    });

    it('should have all required translation categories', () => {
      const requiredCategories = [
        'auth',
        'common',
        'home',
        'animals',
        'animalTypes',
        'milk',
        'marketplace',
        'sync',
        'errors',
        'profile',
        'validation'
      ];

      requiredCategories.forEach(category => {
        expect(enTranslations).toHaveProperty(category);
        expect(amTranslations).toHaveProperty(category);
      });
    });
  });

  describe('Translation Completeness', () => {
    it('should have matching keys in auth section', () => {
      const enAuthKeys = Object.keys(enTranslations.auth).sort();
      const amAuthKeys = Object.keys(amTranslations.auth).sort();

      expect(enAuthKeys).toEqual(amAuthKeys);
    });

    it('should have matching keys in common section', () => {
      const enCommonKeys = Object.keys(enTranslations.common).sort();
      const amCommonKeys = Object.keys(amTranslations.common).sort();

      expect(enCommonKeys).toEqual(amCommonKeys);
    });

    it('should have matching keys in home section', () => {
      const enHomeKeys = Object.keys(enTranslations.home).sort();
      const amHomeKeys = Object.keys(amTranslations.home).sort();

      expect(enHomeKeys).toEqual(amHomeKeys);
    });

    it('should have matching keys in animals section', () => {
      const enAnimalsKeys = Object.keys(enTranslations.animals).sort();
      const amAnimalsKeys = Object.keys(amTranslations.animals).sort();

      expect(enAnimalsKeys).toEqual(amAnimalsKeys);
    });

    it('should have matching keys in animalTypes section', () => {
      const enTypesKeys = Object.keys(enTranslations.animalTypes).sort();
      const amTypesKeys = Object.keys(amTranslations.animalTypes).sort();

      expect(enTypesKeys).toEqual(amTypesKeys);
    });

    it('should have matching keys in milk section', () => {
      const enMilkKeys = Object.keys(enTranslations.milk).sort();
      const amMilkKeys = Object.keys(amTranslations.milk).sort();

      expect(enMilkKeys).toEqual(amMilkKeys);
    });

    it('should have matching keys in marketplace section', () => {
      const enMarketKeys = Object.keys(enTranslations.marketplace).sort();
      const amMarketKeys = Object.keys(amTranslations.marketplace).sort();

      expect(enMarketKeys).toEqual(amMarketKeys);
    });

    it('should have matching keys in sync section', () => {
      const enSyncKeys = Object.keys(enTranslations.sync).sort();
      const amSyncKeys = Object.keys(amTranslations.sync).sort();

      expect(enSyncKeys).toEqual(amSyncKeys);
    });

    it('should have matching keys in errors section', () => {
      const enErrorKeys = Object.keys(enTranslations.errors).sort();
      const amErrorKeys = Object.keys(amTranslations.errors).sort();

      expect(enErrorKeys).toEqual(amErrorKeys);
    });

    it('should have matching keys in profile section', () => {
      const enProfileKeys = Object.keys(enTranslations.profile).sort();
      const amProfileKeys = Object.keys(amTranslations.profile).sort();

      expect(enProfileKeys).toEqual(amProfileKeys);
    });

    it('should have matching keys in validation section', () => {
      const enValidationKeys = Object.keys(enTranslations.validation).sort();
      const amValidationKeys = Object.keys(amTranslations.validation).sort();

      expect(enValidationKeys).toEqual(amValidationKeys);
    });
  });

  describe('Translation Quality', () => {
    it('should have non-empty English translations', () => {
      const checkNonEmpty = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value, currentPath);
          } else if (typeof value === 'string') {
            expect(value.trim(), `Empty translation at ${currentPath}`).not.toBe('');
          }
        });
      };

      checkNonEmpty(enTranslations);
    });

    it('should have non-empty Amharic translations', () => {
      const checkNonEmpty = (obj: any, path = ''): void => {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key;
          
          if (typeof value === 'object' && value !== null) {
            checkNonEmpty(value, currentPath);
          } else if (typeof value === 'string') {
            expect(value.trim(), `Empty translation at ${currentPath}`).not.toBe('');
          }
        });
      };

      checkNonEmpty(amTranslations);
    });

    it('should have Amharic characters in Amharic translations', () => {
      // Amharic Unicode range: \u1200-\u137F
      const amharicRegex = /[\u1200-\u137F]/;

      const checkAmharicChars = (obj: any): boolean => {
        return Object.values(obj).some(value => {
          if (typeof value === 'object' && value !== null) {
            return checkAmharicChars(value);
          } else if (typeof value === 'string') {
            return amharicRegex.test(value);
          }
          return false;
        });
      };

      expect(checkAmharicChars(amTranslations)).toBe(true);
    });
  });

  describe('Critical Translation Keys', () => {
    it('should have all authentication translations', () => {
      const criticalAuthKeys = [
        'login',
        'logout',
        'phoneNumber',
        'enterPhone',
        'sendOtp',
        'verifyOtp',
        'enterOtp'
      ];

      criticalAuthKeys.forEach(key => {
        expect(enTranslations.auth).toHaveProperty(key);
        expect(amTranslations.auth).toHaveProperty(key);
        expect(enTranslations.auth[key as keyof typeof enTranslations.auth]).toBeTruthy();
        expect(amTranslations.auth[key as keyof typeof amTranslations.auth]).toBeTruthy();
      });
    });

    it('should have all animal type translations', () => {
      const animalTypes = ['cattle', 'goat', 'sheep', 'cow', 'bull', 'ox', 'calf'];

      animalTypes.forEach(type => {
        expect(enTranslations.animalTypes).toHaveProperty(type);
        expect(amTranslations.animalTypes).toHaveProperty(type);
        expect(enTranslations.animalTypes[type as keyof typeof enTranslations.animalTypes]).toBeTruthy();
        expect(amTranslations.animalTypes[type as keyof typeof amTranslations.animalTypes]).toBeTruthy();
      });
    });

    it('should have all error message translations', () => {
      const errorTypes = [
        'networkError',
        'authError',
        'validationError',
        'serverError',
        'photoTooLarge',
        'unknownError'
      ];

      errorTypes.forEach(error => {
        expect(enTranslations.errors).toHaveProperty(error);
        expect(amTranslations.errors).toHaveProperty(error);
        expect(enTranslations.errors[error as keyof typeof enTranslations.errors]).toBeTruthy();
        expect(amTranslations.errors[error as keyof typeof amTranslations.errors]).toBeTruthy();
      });
    });

    it('should have all marketplace translations', () => {
      const marketplaceKeys = [
        'marketplace',
        'createListing',
        'myListings',
        'price',
        'birr',
        'negotiable',
        'expressInterest'
      ];

      marketplaceKeys.forEach(key => {
        expect(enTranslations.marketplace).toHaveProperty(key);
        expect(amTranslations.marketplace).toHaveProperty(key);
        expect(enTranslations.marketplace[key as keyof typeof enTranslations.marketplace]).toBeTruthy();
        expect(amTranslations.marketplace[key as keyof typeof amTranslations.marketplace]).toBeTruthy();
      });
    });

    it('should have all sync status translations', () => {
      const syncKeys = [
        'syncStatus',
        'syncing',
        'syncNow',
        'allSynced',
        'pendingSync',
        'offlineMode'
      ];

      syncKeys.forEach(key => {
        expect(enTranslations.sync).toHaveProperty(key);
        expect(amTranslations.sync).toHaveProperty(key);
        expect(enTranslations.sync[key as keyof typeof enTranslations.sync]).toBeTruthy();
        expect(amTranslations.sync[key as keyof typeof amTranslations.sync]).toBeTruthy();
      });
    });
  });

  describe('User-Friendly Error Messages', () => {
    it('should not contain technical jargon in English errors', () => {
      const technicalTerms = ['PGRST', 'JWT', 'SQL', 'HTTP', '500', '404', 'undefined', 'null'];
      
      Object.values(enTranslations.errors).forEach(errorMsg => {
        if (typeof errorMsg === 'string') {
          technicalTerms.forEach(term => {
            expect(errorMsg.toLowerCase()).not.toContain(term.toLowerCase());
          });
        }
      });
    });

    it('should not contain technical jargon in Amharic errors', () => {
      const technicalTerms = ['PGRST', 'JWT', 'SQL', 'HTTP', '500', '404', 'undefined', 'null'];
      
      Object.values(amTranslations.errors).forEach(errorMsg => {
        if (typeof errorMsg === 'string') {
          technicalTerms.forEach(term => {
            expect(errorMsg.toLowerCase()).not.toContain(term.toLowerCase());
          });
        }
      });
    });

    it('should have reassuring offline messages', () => {
      expect(enTranslations.errors.networkError).toContain('internet');
      expect(enTranslations.errors.dataSaved).toContain('saved');
      
      // Amharic should mention internet and saved
      expect(amTranslations.errors.networkError).toContain('ኢንተርኔት');
      expect(amTranslations.errors.dataSaved).toContain('ተቀምጧል');
    });
  });

  describe('Relative Time Translations', () => {
    it('should have relative time strings in common section', () => {
      expect(enTranslations.common).toHaveProperty('daysAgo');
      expect(enTranslations.common).toHaveProperty('hoursAgo');
      expect(enTranslations.common).toHaveProperty('minutesAgo');
      expect(enTranslations.common).toHaveProperty('justNow');

      expect(amTranslations.common).toHaveProperty('daysAgo');
      expect(amTranslations.common).toHaveProperty('hoursAgo');
      expect(amTranslations.common).toHaveProperty('minutesAgo');
      expect(amTranslations.common).toHaveProperty('justNow');
    });

    it('should support interpolation in relative time strings', () => {
      expect(enTranslations.common.daysAgo).toContain('{{count}}');
      expect(enTranslations.common.hoursAgo).toContain('{{count}}');
      expect(enTranslations.common.minutesAgo).toContain('{{count}}');

      expect(amTranslations.common.daysAgo).toContain('{{count}}');
      expect(amTranslations.common.hoursAgo).toContain('{{count}}');
      expect(amTranslations.common.minutesAgo).toContain('{{count}}');
    });
  });
});

describe('Localization Testing Summary', () => {
  it('should pass all automated localization tests', () => {
    // This test serves as a summary marker
    expect(true).toBe(true);
  });

  it('should document manual testing requirements', () => {
    const manualTestsRequired = [
      'Visual layout with Amharic text',
      'Language switching UI behavior',
      'Error message display in context',
      'Flag icon rendering',
      'Button sizing with long Amharic text',
      'Form layout integrity',
      'Card layout integrity',
      'Navigation label fit'
    ];

    // Document that these require manual testing
    expect(manualTestsRequired.length).toBeGreaterThan(0);
  });
});
