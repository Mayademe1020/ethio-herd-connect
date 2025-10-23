/**
 * Ethiopian Market Constants
 * Central location for all Ethiopia-specific values
 */

export const ETHIOPIA = {
  // Country Information
  code: 'ET' as const,
  name: 'Ethiopia',
  nameAmharic: 'ኢትዮጵያ',
  flag: '🇪🇹',
  
  // Phone
  phonePrefix: '+251',
  phonePrefixNumeric: '251',
  phoneLength: 9, // After country code
  phonePattern: /^(\+?251|0)?[79]\d{8}$/,
  
  // Currency
  currency: 'ETB',
  currencyName: 'Ethiopian Birr',
  currencyNameAmharic: 'ብር',
  currencySymbol: 'ብር',
  
  // Regions (for future use)
  regions: [
    { code: 'AA', name: 'Addis Ababa', nameAmharic: 'አዲስ አበባ' },
    { code: 'AF', name: 'Afar', nameAmharic: 'አፋር' },
    { code: 'AM', name: 'Amhara', nameAmharic: 'አማራ' },
    { code: 'BE', name: 'Benishangul-Gumuz', nameAmharic: 'ቤንሻንጉል ጉሙዝ' },
    { code: 'DD', name: 'Dire Dawa', nameAmharic: 'ድሬዳዋ' },
    { code: 'GA', name: 'Gambela', nameAmharic: 'ጋምቤላ' },
    { code: 'HA', name: 'Harari', nameAmharic: 'ሐረሪ' },
    { code: 'OR', name: 'Oromia', nameAmharic: 'ኦሮሚያ' },
    { code: 'SI', name: 'Sidama', nameAmharic: 'ሲዳማ' },
    { code: 'SO', name: 'Somali', nameAmharic: 'ሶማሌ' },
    { code: 'SW', name: 'South West Ethiopia Peoples', nameAmharic: 'ደቡብ ምዕራብ ኢትዮጵያ ህዝቦች' },
    { code: 'SN', name: 'Southern Nations, Nationalities, and Peoples', nameAmharic: 'ደቡብ ብሔር ብሔረሰቦችና ህዝቦች' },
    { code: 'TI', name: 'Tigray', nameAmharic: 'ትግራይ' },
  ],
  
  // Time Zone
  timezone: 'Africa/Addis_Ababa',
  utcOffset: '+03:00',
  
  // Locale
  locale: 'am-ET', // Amharic - Ethiopia
  localeEnglish: 'en-ET',
} as const;

/**
 * Format Ethiopian phone number
 * @param phone - Phone number in any format
 * @returns Formatted phone number: +251 9XX XXX XXX
 */
export function formatEthiopianPhone(phone: string): string {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');
  
  // Remove leading 251 or 0 if present
  let cleaned = digits;
  if (cleaned.startsWith('251')) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // Format as +251 9XX XXX XXX
  if (cleaned.length === 9) {
    return `+251 ${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6)}`;
  }
  
  return phone; // Return original if can't format
}

/**
 * Validate Ethiopian phone number
 * @param phone - Phone number to validate
 * @returns true if valid Ethiopian phone number
 */
export function isValidEthiopianPhone(phone: string): boolean {
  return ETHIOPIA.phonePattern.test(phone);
}

/**
 * Format Ethiopian currency
 * @param amount - Amount to format
 * @param language - Language for formatting ('en' or 'am')
 * @returns Formatted currency string
 */
export function formatEthiopianCurrency(amount: number, language: 'en' | 'am' = 'en'): string {
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  return language === 'am' 
    ? `${ETHIOPIA.currencySymbol} ${formatted}`
    : `${formatted} ${ETHIOPIA.currency}`;
}

/**
 * Get region name by code
 * @param code - Region code
 * @param language - Language for name ('en' or 'am')
 * @returns Region name
 */
export function getRegionName(code: string, language: 'en' | 'am' = 'en'): string {
  const region = ETHIOPIA.regions.find(r => r.code === code);
  if (!region) return code;
  return language === 'am' ? region.nameAmharic : region.name;
}

/**
 * Extract phone number without country code
 * @param phone - Full phone number with country code
 * @returns Phone number without country code (9 digits)
 */
export function extractPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('251')) {
    return digits.substring(3);
  } else if (digits.startsWith('0')) {
    return digits.substring(1);
  }
  
  return digits.length === 9 ? digits : phone;
}

/**
 * Add Ethiopian country code to phone number
 * @param phone - Phone number without country code
 * @returns Full phone number with +251
 */
export function addCountryCode(phone: string): string {
  const cleaned = extractPhoneNumber(phone);
  return `+251${cleaned}`;
}
