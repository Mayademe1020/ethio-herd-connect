// src/constants/ethiopia.ts - Ethiopia-specific constants for Ethiopian Livestock Management System

export const ETHIOPIA_CONSTANTS = {
  // Country information
  COUNTRY_CODE: 'ET',
  COUNTRY_NAME: 'Ethiopia',
  COUNTRY_NAME_AMHARIC: 'ኢትዮጵያ',

  // Phone authentication
  PHONE_COUNTRY_CODE: '+251',
  PHONE_PREFIX: '251',
  PHONE_VALIDATION: {
    MIN_LENGTH: 9,
    MAX_LENGTH: 9,
    STARTS_WITH: '9',
    PATTERN: /^9\d{8}$/,
  },

  // Currency
  CURRENCY_CODE: 'ETB',
  CURRENCY_NAME: 'Ethiopian Birr',
  CURRENCY_SYMBOL: 'ብር',

  // Language codes
  LANGUAGES: {
    ENGLISH: 'en',
    AMHARIC: 'am',
    OROMO: 'or',
    TIGRINYA: 'ti',
  },

  // Default language
  DEFAULT_LANGUAGE: 'am',

  // Time zone
  TIMEZONE: 'Africa/Addis_Ababa',

  // Ethiopian calendar constants
  ETHIOPIAN_CALENDAR: {
    ERA_OFFSET: 8, // Years to add to Gregorian year for Ethiopian calendar
    MONTHS_IN_YEAR: 13,
    MONTH_NAMES_AMHARIC: [
      'መስከረም', 'ጥቅምት', 'ህዳር', 'ታህሳስ', 'ጥር', 'የካቲት',
      'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
    ],
    MONTH_NAMES_ENGLISH: [
      'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
      'Megabit', 'Miazia', 'Genbot', 'Sene', 'Hamle', 'Nehasse', 'Pagumen'
    ],
  },

  // Animal types (Ethiopian focus)
  ANIMAL_TYPES: {
    CATTLE: 'cattle',
    GOAT: 'goat',
    SHEEP: 'sheep',
    POULTRY: 'poultry',
  },

  // Ethiopian regions (for future regional features)
  REGIONS: {
    TIGRAY: 'tigray',
    AFAR: 'afar',
    AMHARA: 'amhara',
    OROMIA: 'oromia',
    SOMALI: 'somali',
    BENISHANGUL_GUMUZ: 'benishangul_gumuz',
    SNNPR: 'snnpr',
    GAMBELLA: 'gambella',
    HARARI: 'harari',
    ADDIS_ABABA: 'addis_ababa',
    DIRE_DAWA: 'dire_dawa',
  },

  // API endpoints (Ethiopian specific)
  API_ENDPOINTS: {
    WEATHER: 'https://api.openweathermap.org/data/2.5/weather',
    MARKET_DATA: '/api/ethiopian-market-data',
    BREED_REGISTRY: '/api/breed-registry',
  },

  // Validation rules
  VALIDATION: {
    FARM_NAME_MIN_LENGTH: 2,
    FARM_NAME_MAX_LENGTH: 100,
    ANIMAL_ID_PATTERN: /^[A-Z0-9]{6,12}$/,
    PHONE_PATTERN: /^9\d{8}$/,
  },

  // UI Constants
  UI: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_UPLOAD_SIZE_MB: 10,
    SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  },

  // Feature flags (Ethiopian specific features)
  FEATURES: {
    ETHIOPIAN_CALENDAR: true,
    AMHARIC_TRANSLATIONS: true,
    ETHIOPIAN_BREEDS: true,
    ETB_CURRENCY: true,
    OFFLINE_MODE: true,
  },
} as const;

// Type exports for TypeScript
export type EthiopianRegion = keyof typeof ETHIOPIA_CONSTANTS.REGIONS;
export type EthiopianLanguage = keyof typeof ETHIOPIA_CONSTANTS.LANGUAGES;
export type AnimalType = keyof typeof ETHIOPIA_CONSTANTS.ANIMAL_TYPES;

// Helper functions
export const isValidEthiopianPhone = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, '');
  return ETHIOPIA_CONSTANTS.PHONE_VALIDATION.PATTERN.test(cleaned);
};

export const formatEthiopianPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  return `${ETHIOPIA_CONSTANTS.PHONE_COUNTRY_CODE}${cleaned}`;
};

export const getEthiopianMonthName = (month: number, language: EthiopianLanguage = 'AMHARIC'): string => {
  const months = language === 'AMHARIC'
    ? ETHIOPIA_CONSTANTS.ETHIOPIAN_CALENDAR.MONTH_NAMES_AMHARIC
    : ETHIOPIA_CONSTANTS.ETHIOPIAN_CALENDAR.MONTH_NAMES_ENGLISH;

  return months[month - 1] || '';
};
