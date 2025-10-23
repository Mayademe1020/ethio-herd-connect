/**
 * Ethiopian Calendar Conversion Utilities
 * Accurate conversion between Gregorian and Ethiopian calendars
 */

export interface EthiopianDate {
  year: number;
  month: number;
  day: number;
}

// Ethiopian month names
export const ETHIOPIAN_MONTHS = {
  en: [
    'Meskerem', 'Tikimt', 'Hidar', 'Tahsas', 'Tir', 'Yekatit',
    'Megabit', 'Miyazya', 'Ginbot', 'Sene', 'Hamle', 'Nehase', 'Pagumen'
  ],
  am: [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጳጉሜን'
  ]
};

/**
 * Convert Gregorian date to Julian Day Number
 */
function gregorianToJDN(date: Date): number {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  
  return day + Math.floor((153 * m + 2) / 5) + 365 * y + 
         Math.floor(y / 4) - Math.floor(y / 100) + 
         Math.floor(y / 400) - 32045;
}

/**
 * Convert Julian Day Number to Ethiopian date
 */
function jdnToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + 
               Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  
  return { year, month, day };
}

/**
 * Convert Ethiopian date to Julian Day Number
 */
function ethiopianToJDN(ethDate: EthiopianDate): number {
  const { year, month, day } = ethDate;
  
  return (365 * (year - 1)) + Math.floor(year / 4) + 
         (30 * (month - 1)) + day + 1723856;
}

/**
 * Convert Gregorian Date to Ethiopian Date
 */
export function gregorianToEthiopian(date: Date): EthiopianDate {
  const jdn = gregorianToJDN(date);
  return jdnToEthiopian(jdn);
}

/**
 * Convert Ethiopian Date to Gregorian Date
 */
export function ethiopianToGregorian(ethDate: EthiopianDate): Date {
  const jdn = ethiopianToJDN(ethDate);
  
  // Convert JDN back to Gregorian
  const a = jdn + 32044;
  const b = Math.floor((4 * a + 3) / 146097);
  const c = a - Math.floor((146097 * b) / 4);
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  
  return new Date(year, month - 1, day);
}

/**
 * Check if Ethiopian year is a leap year
 */
export function isEthiopianLeapYear(year: number): boolean {
  return (year % 4) === 3;
}

/**
 * Format Ethiopian date as string
 */
export function formatEthiopianDate(
  date: Date | EthiopianDate,
  language: 'en' | 'am' = 'en',
  format: 'short' | 'long' = 'long'
): string {
  const ethDate = date instanceof Date ? gregorianToEthiopian(date) : date;
  const months = ETHIOPIAN_MONTHS[language];
  
  if (format === 'short') {
    return `${ethDate.day}/${ethDate.month}/${ethDate.year}`;
  }
  
  return `${ethDate.day} ${months[ethDate.month - 1]} ${ethDate.year}`;
}

/**
 * Parse Ethiopian date string to Date object
 */
export function parseEthiopianDate(dateStr: string): Date | null {
  try {
    // Try to parse format: "day month year" or "day/month/year"
    const parts = dateStr.split(/[\s\/]+/);
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts[0]);
    const month = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    if (month < 1 || month > 13) return null;
    if (day < 1 || day > 30) return null;
    
    return ethiopianToGregorian({ year, month, day });
  } catch (error) {
    return null;
  }
}

/**
 * Validate Ethiopian date
 */
export function validateEthiopianDate(ethDate: EthiopianDate): boolean {
  const { year, month, day } = ethDate;
  
  // Check month range
  if (month < 1 || month > 13) return false;
  
  // Check day range for regular months
  if (month <= 12 && (day < 1 || day > 30)) return false;
  
  // Check day range for Pagumen (13th month)
  if (month === 13) {
    const maxDay = isEthiopianLeapYear(year) ? 6 : 5;
    if (day < 1 || day > maxDay) return false;
  }
  
  return true;
}

/**
 * Get Ethiopian month name
 */
export function getEthiopianMonthName(month: number, language: 'en' | 'am' = 'en'): string {
  if (month < 1 || month > 13) return '';
  return ETHIOPIAN_MONTHS[language][month - 1];
}

/**
 * Get current Ethiopian date
 */
export function getCurrentEthiopianDate(): EthiopianDate {
  return gregorianToEthiopian(new Date());
}
