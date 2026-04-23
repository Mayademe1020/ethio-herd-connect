# Ethiopian Calendar Integration - Technical Design Document

## Overview

This design document outlines the technical approach for integrating the Ethiopian calendar system throughout the Livestock Management System. The implementation will enhance the existing `EthiopianDatePicker` component and create a comprehensive calendar system that respects Ethiopian cultural practices.

**Design Goals:**
1. Seamless integration with existing date inputs
2. Accurate date conversion between Ethiopian and Gregorian calendars
3. Cultural appropriateness (holidays, seasons, fasting periods)
4. Offline-first functionality
5. Mobile-responsive design
6. Performance optimization

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  EthiopianDatePicker  │  CalendarToggle  │  DateDisplay     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                   Calendar Service Layer                     │
├─────────────────────────────────────────────────────────────┤
│  DateConverter  │  HolidayService  │  SeasonService         │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
├─────────────────────────────────────────────────────────────┤
│  LocalStorage (Preferences)  │  Static Data (Holidays)      │
└─────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
App
├── CalendarProvider (Context)
│   ├── Calendar Preference State
│   ├── Date Conversion Functions
│   └── Holiday/Season Data
│
├── Pages (All date inputs)
│   ├── Animals Registration
│   ├── Health Records
│   ├── Growth Tracking
│   ├── Market Listings
│   └── Milk Production
│
└── Components
    ├── EnhancedEthiopianDatePicker
    ├── CalendarSystemToggle
    ├── DateDisplay
    ├── HolidayIndicator
    └── SeasonBadge
```

---

## Components and Interfaces

### 1. Enhanced Ethiopian Date Picker

**File:** `src/components/EnhancedEthiopianDatePicker.tsx`

**Purpose:** Improved date picker with full Ethiopian calendar support

**Features:**
- Dual calendar display (Ethiopian/Gregorian)
- Holiday highlighting
- Season indicators
- Fasting period warnings
- Mobile-optimized interface


### 2. Calendar Context Provider

**File:** `src/contexts/CalendarContext.tsx`

**Purpose:** Global state management for calendar preferences

**State:**
```typescript
interface CalendarState {
  calendarSystem: 'ethiopian' | 'gregorian';
  showHolidays: boolean;
  showSeasons: boolean;
  showFastingPeriods: boolean;
  dateFormat: 'short' | 'long';
}
```

### 3. Date Conversion Utility

**File:** `src/utils/ethiopianCalendar.ts`

**Purpose:** Accurate date conversion between calendar systems

**Key Functions:**
- `gregorianToEthiopian(date: Date): EthiopianDate`
- `ethiopianToGregorian(ethDate: EthiopianDate): Date`
- `isEthiopianLeapYear(year: number): boolean`
- `getEthiopianMonthName(month: number, language: string): string`
- `formatEthiopianDate(date: EthiopianDate, format: string): string`

### 4. Holiday Service

**File:** `src/services/ethiopianHolidays.ts`

**Purpose:** Manage Ethiopian holidays and religious events

**Data Structure:**
```typescript
interface Holiday {
  id: string;
  name: { am: string; en: string; or: string };
  date: { month: number; day: number }; // Ethiopian calendar
  type: 'religious' | 'national' | 'cultural';
  significance: string;
  affectsFarming: boolean;
}
```

### 5. Agricultural Season Service

**File:** `src/services/agriculturalSeasons.ts`

**Purpose:** Track Ethiopian agricultural seasons

**Seasons:**
- Belg (Small rainy season)
- Kiremt (Main rainy season)
- Bega (Dry season)

---

## Data Models

### Ethiopian Date Model

```typescript
interface EthiopianDate {
  year: number;
  month: number; // 1-13
  day: number;   // 1-30 (or 1-5/6 for Pagumen)
}

interface EthiopianMonth {
  number: number;
  name: {
    am: string;
    en: string;
    or: string;
  };
  days: number;
}
```

### Holiday Model

```typescript
interface EthiopianHoliday {
  id: string;
  name: {
    am: string;
    en: string;
    or: string;
    sw: string;
  };
  date: {
    month: number;
    day: number;
  };
  type: 'religious' | 'national' | 'cultural';
  description: {
    am: string;
    en: string;
  };
  farmingImpact: {
    affectsMarket: boolean;
    affectsWork: boolean;
    notes: string;
  };
}
```

### Season Model

```typescript
interface AgriculturalSeason {
  id: string;
  name: {
    am: string;
    en: string;
    or: string;
  };
  startMonth: number; // Ethiopian month
  endMonth: number;
  characteristics: string[];
  farmingActivities: string[];
  animalCareNotes: string[];
}
```

### Fasting Period Model

```typescript
interface FastingPeriod {
  id: string;
  name: {
    am: string;
    en: string;
  };
  type: 'major' | 'weekly';
  duration: number; // days
  startDate?: { month: number; day: number }; // for fixed fasts
  calculateStart?: (year: number) => EthiopianDate; // for movable fasts
  marketImpact: 'high' | 'medium' | 'low';
  notes: string;
}
```

---

## Date Conversion Algorithm

### Gregorian to Ethiopian Conversion

```typescript
function gregorianToEthiopian(gregorianDate: Date): EthiopianDate {
  const JDN = gregorianToJulianDayNumber(gregorianDate);
  return julianDayNumberToEthiopian(JDN);
}

function gregorianToJulianDayNumber(date: Date): number {
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

function julianDayNumberToEthiopian(jdn: number): EthiopianDate {
  const r = (jdn - 1723856) % 1461;
  const n = (r % 365) + 365 * Math.floor(r / 1460);
  
  const year = 4 * Math.floor((jdn - 1723856) / 1461) + 
               Math.floor(r / 365) - Math.floor(r / 1460);
  const month = Math.floor(n / 30) + 1;
  const day = (n % 30) + 1;
  
  return { year, month, day };
}
```

### Ethiopian to Gregorian Conversion

```typescript
function ethiopianToGregorian(ethDate: EthiopianDate): Date {
  const JDN = ethiopianToJulianDayNumber(ethDate);
  return julianDayNumberToGregorian(JDN);
}

function ethiopianToJulianDayNumber(ethDate: EthiopianDate): number {
  const { year, month, day } = ethDate;
  
  return (365 * year) + Math.floor(year / 4) + 
         (30 * month) + day + 1723856;
}

function julianDayNumberToGregorian(jdn: number): Date {
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
```

---

## Error Handling

### Date Validation

```typescript
function validateEthiopianDate(ethDate: EthiopianDate): ValidationResult {
  const errors: string[] = [];
  
  // Validate year
  if (ethDate.year < 1900 || ethDate.year > 2100) {
    errors.push('Year must be between 1900 and 2100');
  }
  
  // Validate month
  if (ethDate.month < 1 || ethDate.month > 13) {
    errors.push('Month must be between 1 and 13');
  }
  
  // Validate day
  const maxDays = ethDate.month === 13 ? 
    (isEthiopianLeapYear(ethDate.year) ? 6 : 5) : 30;
  
  if (ethDate.day < 1 || ethDate.day > maxDays) {
    errors.push(`Day must be between 1 and ${maxDays} for this month`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

### Conversion Error Handling

```typescript
function safeConvertToEthiopian(date: Date): Result<EthiopianDate> {
  try {
    const ethDate = gregorianToEthiopian(date);
    const validation = validateEthiopianDate(ethDate);
    
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }
    
    return {
      success: true,
      data: ethDate
    };
  } catch (error) {
    logger.error('Date conversion failed', error);
    return {
      success: false,
      error: 'Failed to convert date'
    };
  }
}
```

---

## Testing Strategy

### Unit Tests

1. **Date Conversion Tests**
   - Test known date pairs (Ethiopian ↔ Gregorian)
   - Test leap year handling
   - Test month boundary cases
   - Test Pagumen month (13th month)

2. **Validation Tests**
   - Test invalid dates
   - Test edge cases
   - Test year boundaries

3. **Holiday Calculation Tests**
   - Test fixed holidays
   - Test movable holidays (Easter-based)
   - Test holiday detection

### Integration Tests

1. **Component Integration**
   - Test date picker with calendar context
   - Test calendar toggle functionality
   - Test date display across components

2. **Data Persistence**
   - Test preference saving
   - Test date storage in database
   - Test offline functionality

### End-to-End Tests

1. **User Workflows**
   - Register animal with Ethiopian date
   - Record vaccination with calendar toggle
   - View historical records in both calendars
   - Export data with both date formats

---

## Implementation Plan

See `tasks.md` for detailed implementation tasks.

**Estimated Timeline:** 2 weeks (10 working days)

**Phase 1 (Days 1-3):** Core date conversion and utilities
**Phase 2 (Days 4-6):** Component enhancement and integration
**Phase 3 (Days 7-8):** Cultural elements (holidays, seasons, fasting)
**Phase 4 (Days 9-10):** Testing, optimization, and documentation

---

## Performance Considerations

### Optimization Strategies

1. **Memoization**
   - Cache date conversions
   - Memoize holiday calculations
   - Cache formatted date strings

2. **Lazy Loading**
   - Load holiday data on demand
   - Defer season calculations
   - Progressive calendar rendering

3. **Offline Storage**
   - Store holiday data locally
   - Cache conversion results
   - Minimize recalculations

### Performance Targets

- Date conversion: < 10ms
- Calendar rendering: < 200ms
- Holiday lookup: < 5ms
- Component mount: < 100ms

---

## Security Considerations

### Data Validation

- Validate all date inputs
- Sanitize user-provided dates
- Prevent injection attacks through date strings

### Privacy

- Store calendar preferences locally
- Don't track date selection patterns
- Respect user privacy in analytics

---

## Accessibility

### Keyboard Navigation

- Tab through calendar dates
- Arrow keys for date navigation
- Enter/Space to select dates
- Escape to close calendar

### Screen Reader Support

- Announce selected dates
- Describe calendar system
- Read holiday information
- Indicate fasting periods

### Visual Accessibility

- High contrast mode support
- Large touch targets (44x44px minimum)
- Clear visual indicators
- Color-blind friendly design

---

## Internationalization

### Language Support

- Amharic (am): Full support with proper month names
- English (en): Transliterated Ethiopian names
- Oromo (or): Translated month names
- Swahili (sw): Basic support

### Date Formatting

- Short format: "15 መስከረም 2016"
- Long format: "15 መስከረም 2016 ዓ.ም"
- Numeric format: "15/01/2016" (Ethiopian)

---

## Migration Strategy

### Backward Compatibility

1. **Existing Data**
   - All dates stored in Gregorian (ISO 8601)
   - Display layer handles conversion
   - No database migration needed

2. **User Preferences**
   - Default to Ethiopian for Ethiopian users
   - Detect locale and set default
   - Allow manual override

3. **Gradual Rollout**
   - Phase 1: Add calendar toggle
   - Phase 2: Make Ethiopian default
   - Phase 3: Add cultural elements

---

## Monitoring and Analytics

### Metrics to Track

- Calendar system usage (Ethiopian vs Gregorian)
- Date conversion errors
- Component performance
- User preference changes
- Holiday interaction rates

### Error Tracking

- Log conversion failures
- Track validation errors
- Monitor performance issues
- Alert on critical failures

---

## Future Enhancements

### Phase 2 Features

- Custom holiday creation
- Personal event reminders
- Integration with external calendars
- Advanced astronomical calculations
- Regional calendar variations

### Phase 3 Features

- Multi-calendar support (Islamic, Hebrew)
- Calendar synchronization
- Shared calendar events
- Calendar export/import

---

## Conclusion

This design provides a comprehensive approach to Ethiopian calendar integration that respects cultural practices while maintaining technical excellence. The implementation will significantly improve user adoption in Ethiopia by providing a familiar and culturally appropriate date system.

**Next Steps:**
1. Review and approve this design
2. Create detailed implementation tasks
3. Begin Phase 1 development
4. Conduct user testing with Ethiopian farmers

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2025  
**Status:** Ready for Task Creation
