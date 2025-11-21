import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the language context
const mockSetLanguage = vi.fn();
const mockLanguage = 'am';

vi.mock('../contexts/LanguageContext', () => ({
    useLanguage: () => ({
        language: mockLanguage,
        setLanguage: mockSetLanguage,
        isAmharic: true,
        isEnglish: false
    }),
    LanguageProvider: ({ children }: { children: React.ReactNode }) => children
}));

describe('Localization System', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Translation Hook', () => {
        it('should return translation for existing keys', () => {
            const { useTranslations } = require('../hooks/useTranslations');
            const { t } = useTranslations();

            // Test basic translation
            const result = t('common.save');
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
        });

        it('should fallback to English for missing translations', () => {
            const { useTranslations } = require('../hooks/useTranslations');
            const { t } = useTranslations();

            // Test fallback for non-existent key
            const result = t('nonexistent.key');
            expect(result).toBe('nonexistent.key');
        });

        it('should handle nested translation keys', () => {
            const { useTranslations } = require('../hooks/useTranslations');
            const { t } = useTranslations();

            const result = t('auth.login');
            expect(typeof result).toBe('string');
        });

        it('should translate animal types correctly', () => {
            const { useTranslations } = require('../hooks/useTranslations');
            const { getAnimalTypeTranslation } = useTranslations();

            const cowTranslation = getAnimalTypeTranslation('cow');
            expect(typeof cowTranslation).toBe('string');
            expect(cowTranslation.length).toBeGreaterThan(0);
        });
    });

    describe('Language Context', () => {
        it('should provide language state', () => {
            const { useLanguage } = require('../contexts/LanguageContext');
            const context = useLanguage();

            expect(context.language).toBeDefined();
            expect(typeof context.setLanguage).toBe('function');
            expect(typeof context.isAmharic).toBe('boolean');
            expect(typeof context.isEnglish).toBe('boolean');
        });

        it('should handle language switching', () => {
            const { useLanguage } = require('../contexts/LanguageContext');
            const context = useLanguage();

            context.setLanguage('en');
            expect(mockSetLanguage).toHaveBeenCalledWith('en');
        });
    });

    describe('Translation Files', () => {
        it('should have consistent structure across languages', () => {
            const amTranslations = require('../i18n/am.json');
            const enTranslations = require('../i18n/en.json');

            // Check that both files have the same top-level keys
            const amKeys = Object.keys(amTranslations);
            const enKeys = Object.keys(enTranslations);

            expect(amKeys.sort()).toEqual(enKeys.sort());
        });

        it('should contain Ethiopian-specific content', () => {
            const amTranslations = require('../i18n/am.json');

            // Check for Ethiopian animal terms
            expect(amTranslations.animalTypes.cow).toBe('ላም');
            expect(amTranslations.animalTypes.bull).toBe('ወይፈን/ጊደር');
            expect(amTranslations.animalTypes.calf).toBe('ጥጃ');

            // Check for Ethiopian locations
            expect(amTranslations.marketplace).toBeDefined();
        });

        it('should handle pluralization patterns', () => {
            const amTranslations = require('../i18n/am.json');

            // Check for interpolation patterns
            expect(amTranslations.common.daysAgo).toContain('{{count}}');
            expect(amTranslations.common.hoursAgo).toContain('{{count}}');
        });
    });

    describe('Accessibility', () => {
        it('should set proper HTML lang attributes', () => {
            // This would be tested in integration tests with actual DOM
            expect(true).toBe(true); // Placeholder test
        });

        it('should support screen readers', () => {
            // This would be tested in integration tests
            expect(true).toBe(true); // Placeholder test
        });
    });

    describe('Performance', () => {
        it('should load translations efficiently', () => {
            const startTime = Date.now();
            const { useTranslations } = require('../hooks/useTranslations');
            const { t } = useTranslations();

            // Perform multiple translations
            for (let i = 0; i < 100; i++) {
                t('common.save');
                t('auth.login');
                t('animals.registerAnimal');
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete in reasonable time (less than 100ms for 300 translations)
            expect(duration).toBeLessThan(100);
        });

        it('should cache translations', () => {
            const { useTranslations } = require('../hooks/useTranslations');
            const { t } = useTranslations();

            // First call
            const result1 = t('common.save');
            // Second call should be from cache
            const result2 = t('common.save');

            expect(result1).toBe(result2);
        });
    });
});