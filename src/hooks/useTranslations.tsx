import { useLanguage } from '@/contexts/LanguageContext';
import enTranslations from '@/i18n/en.json';
import amTranslations from '@/i18n/am.json';
import extendedTranslations from '@/i18n/translations.json';

// Keep EN+AM in bundle - or/sw lazy loaded from translations.json when requested
type Language = 'am' | 'en' | 'or' | 'sw';
const getTranslations = (language: Language) => {
  if (language === 'en') return enTranslations;
  if (language === 'am') return amTranslations;
  return extendedTranslations[language] || extendedTranslations.en;
};

export const useTranslations = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    const translations = getTranslations(language);

    let value: any = translations;

    // Try current language first
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to English if translation not found
        value = getTranslations('en');
        for (const fallbackKey of keys) {
          if (value && typeof value === 'object' && fallbackKey in value) {
            value = value[fallbackKey];
          } else {
            return key; // Return key if no translation found
          }
        }
        break;
      }
    }

    return typeof value === 'string' ? value : key;
  };

  const getAnimalTypeTranslation = (type: string): string => {
    return t(`animalTypes.${type}`);
  };

  return { t, getAnimalTypeTranslation };
};