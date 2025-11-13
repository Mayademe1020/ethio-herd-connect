import { useLanguage } from '@/contexts/LanguageContext';
import amTranslations from '@/i18n/am.json';
import enTranslations from '@/i18n/en.json';
import extendedTranslations from '@/i18n/translations.json';

type Language = 'am' | 'en' | 'or' | 'sw';

const getTranslations = (language: Language) => {
  // Primary translations (am.json, en.json)
  if (language === 'am') return amTranslations;
  if (language === 'en') return enTranslations;

  // Extended translations (or.json, sw.json from translations.json)
  return extendedTranslations[language] || extendedTranslations.en;
};

export const useTranslations = () => {
  const { language } = useLanguage();

  const t = (key: string): string => {
    const keys = key.split('.');
    const translations = getTranslations(language as Language);

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