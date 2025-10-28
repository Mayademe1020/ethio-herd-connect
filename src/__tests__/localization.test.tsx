import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import enTranslations from '../i18n/en.json';
import amTranslations from '../i18n/am.json';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Test component to verify translations
function TestComponent() {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="welcome-message">{t('home.welcome')}</div>
      <div data-testid="animals-label">{t('animals.myAnimals')}</div>
      <div data-testid="milk-label">{t('milk.recordMilk')}</div>
      <div data-testid="marketplace-label">{t('marketplace.browseListing')}</div>
      <button onClick={() => setLanguage('am')}>Switch to Amharic</button>
      <button onClick={() => setLanguage('en')}>Switch to English</button>
    </div>
  );
}

describe('Localization System', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Translation Files', () => {
    it('should have complete English translations', () => {
      expect(enTranslations).toBeDefined();
      expect(enTranslations.common).toBeDefined();
      expect(enTranslations.auth).toBeDefined();
      expect(enTranslations.animals).toBeDefined();
      expect(enTranslations.milk).toBeDefined();
      expect(enTranslations.marketplace).toBeDefined();
      expect(enTranslations.errors).toBeDefined();
    });

    it('should have complete Amharic translations', () => {
      expect(amTranslations).toBeDefined();
      expect(amTranslations.common).toBeDefined();
      expect(amTranslations.auth).toBeDefined();
      expect(amTranslations.animals).toBeDefined();
      expect(amTranslations.milk).toBeDefined();
      expect(amTranslations.marketplace).toBeDefined();
      expect(amTranslations.errors).toBeDefined();
    });

    it('should have matching keys between English and Amharic', () => {
      const enKeys = getAllKeys(enTranslations);
      const amKeys = getAllKeys(amTranslations);
      
      expect(enKeys.sort()).toEqual(amKeys.sort());
    });
  });

  describe('Language Context', () => {
    it('should default to Amharic', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('current-language')).toHaveTextContent('am');
    });

    it('should switch to English', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      fireEvent.click(screen.getByText('Switch to English'));
      
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });

    it('should persist language preference', async () => {
      const { unmount } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      fireEvent.click(screen.getByText('Switch to English'));
      
      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('en');
      });
      
      unmount();
      
      // Re-render and check if language persists
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
    });
  });

  describe('Translation Hook', () => {
    it('should translate common phrases in Amharic', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('welcome-message')).toHaveTextContent(amTranslations.home.welcome);
    });

    it('should translate common phrases in English', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      fireEvent.click(screen.getByText('Switch to English'));
      
      await waitFor(() => {
        expect(screen.getByTestId('welcome-message')).toHaveTextContent(enTranslations.home.welcome);
      });
    });

    it('should handle nested translation keys', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      expect(screen.getByTestId('animals-label')).toHaveTextContent(amTranslations.animals.myAnimals);
      expect(screen.getByTestId('milk-label')).toHaveTextContent(amTranslations.milk.recordMilk);
      expect(screen.getByTestId('marketplace-label')).toHaveTextContent(amTranslations.marketplace.browseListing);
    });
  });

  describe('Error Messages', () => {
    it('should have all error messages in both languages', () => {
      const errorKeys = [
        'networkError',
        'authError',
        'photoTooLarge',
        'videoTooLarge',
        'videoTooLong',
        'unknownError'
      ];
      
      errorKeys.forEach(key => {
        expect(enTranslations.errors[key as keyof typeof enTranslations.errors]).toBeDefined();
        expect(amTranslations.errors[key as keyof typeof amTranslations.errors]).toBeDefined();
      });
    });
    
    it('should have validation error messages in both languages', () => {
      const validationKeys = [
        'required',
        'invalidPhone',
        'invalidPrice'
      ];
      
      validationKeys.forEach(key => {
        expect(enTranslations.validation[key as keyof typeof enTranslations.validation]).toBeDefined();
        expect(amTranslations.validation[key as keyof typeof amTranslations.validation]).toBeDefined();
      });
    });
  });

  describe('Amharic Text Rendering', () => {
    it('should render Amharic characters correctly', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );
      
      const welcomeText = screen.getByTestId('welcome-message').textContent;
      
      // Check if Amharic characters are present
      expect(welcomeText).toMatch(/[\u1200-\u137F]/);
    });

    it('should not break layout with long Amharic text', () => {
      render(
        <LanguageProvider>
          <div style={{ width: '200px', overflow: 'hidden' }}>
            <TestComponent />
          </div>
        </LanguageProvider>
      );
      
      const element = screen.getByTestId('welcome-message');
      const rect = element.getBoundingClientRect();
      
      // Verify element doesn't overflow
      expect(rect.width).toBeLessThanOrEqual(200);
    });
  });
});

// Helper function to get all nested keys from translation object
function getAllKeys(obj: any, prefix = ''): string[] {
  let keys: string[] = [];
  
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  
  return keys;
}
