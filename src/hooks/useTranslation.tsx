import { useLanguage } from '../contexts/LanguageContext';
import enTranslations from '../i18n/en.json';
import amTranslations from '../i18n/am.json';

type TranslationKey = string;
type Translations = typeof enTranslations;

const translations: Record<'en' | 'am', Translations> = {
  en: enTranslations,
  am: amTranslations,
};

/**
 * Get nested value from object using dot notation
 * e.g., "auth.login" => translations.auth.login
 */
const getNestedValue = (obj: any, path: string): string | undefined => {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return undefined;
    }
  }
  
  return typeof current === 'string' ? current : undefined;
};

/**
 * Replace placeholders in string with values
 * e.g., "Hello {{name}}" with {name: "John"} => "Hello John"
 */
const interpolate = (str: string, values?: Record<string, string | number>): string => {
  if (!values) return str;
  
  return str.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
};

export const useTranslation = () => {
  const { language } = useLanguage();

  /**
   * Translate a key with optional interpolation values
   * Falls back to English if Amharic translation is missing
   * Falls back to the key itself if no translation is found
   */
  const t = (key: TranslationKey, values?: Record<string, string | number>): string => {
    // Try to get translation in current language
    let translation = getNestedValue(translations[language], key);
    
    // Fallback to English if Amharic translation is missing
    if (!translation && language === 'am') {
      translation = getNestedValue(translations.en, key);
    }
    
    // Fallback to key itself if no translation found
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    
    // Apply interpolation if values provided
    return interpolate(translation, values);
  };

  return { t };
};
