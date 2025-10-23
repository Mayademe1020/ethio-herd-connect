# Ethiopian Calendar Integration - Implementation Tasks

## Overview
This task list provides step-by-step instructions for integrating the Ethiopian calendar system throughout the Livestock Management System.

**Total Estimated Time:** 10 working days (2 weeks)  
**Priority:** HIGH (Critical for Ethiopian market adoption)

---

## Phase 1: Core Date Conversion & Utilities (Days 1-3)

### - [ ] 1. Create Ethiopian Calendar Utility Module
Create comprehensive date conversion utilities with accurate algorithms.

**Steps:**
1. Create `src/utils/ethiopianCalendar.ts`
2. Implement Julian Day Number conversion
3. Add Gregorian ↔ Ethiopian conversion functions
4. Add leap year calculation
5. Add date validation

**Code Structure:**
```typescript
// Core conversion functions
export function gregorianToEthiopian(date: Date): EthiopianDate
export function ethiopianToGregorian(ethDate: EthiopianDate): Date
export function isEthiopianLeapYear(year: number): boolean
export function validateEthiopianDate(ethDate: EthiopianDate): ValidationResult

// Formatting functions
export function formatEthiopianDate(ethDate: EthiopianDate, format: string, language: string): string
export function getEthiopianMonthName(month: number, language: string): string
export function getEthiopianDayName(dayOfWeek: number, language: string): string
```

**Verification:**
- Test with known date pairs
- Verify leap year handling
- Test Pagumen month (13th month)
- Test edge cases (year boundaries)

**Requirements:** _1.3, 1.5, 1.11_

---

### - [ ] 1.1 Implement Julian Day Number Conversion
Implement the mathematical foundation for date conversion.

**Algorithm:**
```typescript
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

**Test Cases:**
- September 11, 2023 (Gregorian) = Meskerem 1, 2016 (Ethiopian)
- December 25, 2023 (Gregorian) = Tahsas 16, 2016 (Ethiopian)
- February 29, 2024 (Leap year) = Yekatit 22, 2016 (Ethiopian)

**Requirements:** _1.3_

---

### - [ ] 1.2 Create Ethiopian Month Names Data
Define month names in all supported languages.

**File:** `src/data/ethiopianMonths.ts`

**Data Structure:**
```typescript
export const ETHIOPIAN_MONTHS = [
  {
    number: 1,
    name: {
      am: 'መስከረም',
      en: 'Meskerem',
      or: 'Fulbaana',
      sw: 'Meskerem'
    },
    days: 30
  },
  {
    number: 2,
    name: {
      am: 'ጥቅምት',
      en: 'Tikimt',
      or: 'Onkololeessa',
      sw: 'Tikimt'
    },
    days: 30
  },
  // ... continue for all 13 months
  {
    number: 13,
    name: {
      am: 'ጳጉሜን',
      en: 'Pagumen',
      or: 'Pagume',
      sw: 'Pagumen'
    },
    days: 5 // 6 in leap years
  }
];
```

**Requirements:** _1.7_

---

### - [ ] 1.3 Implement Date Validation
Add comprehensive validation for Ethiopian dates.

**Validation Rules:**
- Year: 1900-2100
- Month: 1-13
- Day: 1-30 (1-5/6 for Pagumen)
- Pagumen: 5 days (6 in leap years)

**Code:**
```typescript
export function validateEthiopianDate(ethDate: EthiopianDate): ValidationResult {
  const errors: string[] = [];
  
  if (ethDate.year < 1900 || ethDate.year > 2100) {
    errors.push('Year must be between 1900 and 2100');
  }
  
  if (ethDate.month < 1 || ethDate.month > 13) {
    errors.push('Month must be between 1 and 13');
  }
  
  const maxDays = ethDate.month === 13 ? 
    (isEthiopianLeapYear(ethDate.year) ? 6 : 5) : 30;
  
  if (ethDate.day < 1 || ethDate.day > maxDays) {
    errors.push(`Day must be between 1 and ${maxDays}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

**Requirements:** _1.11_

---

### - [ ] 1.4 Create Unit Tests for Date Conversion
Write comprehensive tests for all conversion functions.

**File:** `src/utils/__tests__/ethiopianCalendar.test.ts`

**Test Cases:**
```typescript
describe('Ethiopian Calendar Conversion', () => {
  test('converts Gregorian to Ethiopian correctly', () => {
    const greg = new Date(2023, 8, 11); // Sept 11, 2023
    const eth = gregorianToEthiopian(greg);
    expect(eth).toEqual({ year: 2016, month: 1, day: 1 });
  });
  
  test('converts Ethiopian to Gregorian correctly', () => {
    const eth = { year: 2016, month: 1, day: 1 };
    const greg = ethiopianToGregorian(eth);
    expect(greg.getFullYear()).toBe(2023);
    expect(greg.getMonth()).toBe(8); // September
    expect(greg.getDate()).toBe(11);
  });
  
  test('handles leap years correctly', () => {
    expect(isEthiopianLeapYear(2015)).toBe(true);
    expect(isEthiopianLeapYear(2016)).toBe(false);
  });
  
  test('validates Pagumen month correctly', () => {
    const validPagumen = { year: 2016, month: 13, day: 5 };
    expect(validateEthiopianDate(validPagumen).isValid).toBe(true);
    
    const invalidPagumen = { year: 2016, month: 13, day: 7 };
    expect(validateEthiopianDate(invalidPagumen).isValid).toBe(false);
  });
});
```

**Requirements:** _1.3, 1.11_

---

## Phase 2: Component Enhancement & Integration (Days 4-6)

### - [ ] 2. Create Calendar Context Provider
Create global state management for calendar preferences.

**File:** `src/contexts/CalendarContext.tsx`

**State:**
```typescript
interface CalendarState {
  calendarSystem: 'ethiopian' | 'gregorian';
  showHolidays: boolean;
  showSeasons: boolean;
  showFastingPeriods: boolean;
  dateFormat: 'short' | 'long';
}

interface CalendarContextType {
  state: CalendarState;
  setCalendarSystem: (system: 'ethiopian' | 'gregorian') => void;
  toggleHolidays: () => void;
  toggleSeasons: () => void;
  toggleFastingPeriods: () => void;
  formatDate: (date: Date) => string;
}
```

**Persistence:**
- Save preferences to localStorage
- Load on app initialization
- Sync across tabs

**Requirements:** _1.2, 1.9_

---

### - [ ] 2.1 Enhance Ethiopian Date Picker Component
Upgrade the existing EthiopianDatePicker with full features.

**File:** `src/components/EnhancedEthiopianDatePicker.tsx`

**New Features:**
- Calendar system toggle
- Holiday highlighting
- Season indicators
- Fasting period warnings
- Dual calendar display
- Mobile-optimized interface

**Props:**
```typescript
interface EnhancedEthiopianDatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  showToggle?: boolean;
  highlightHolidays?: boolean;
  showSeasons?: boolean;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
}
```

**Requirements:** _1.1, 1.2, 1.10_

---

### - [ ] 2.2 Create Calendar System Toggle Component
Create a reusable toggle for switching between calendars.

**File:** `src/components/CalendarSystemToggle.tsx`

**Features:**
- Visual toggle switch
- Keyboard accessible
- Shows current system
- Smooth transition
- Persists preference

**UI:**
```
[Ethiopian] ⟷ [Gregorian]
```

**Requirements:** _1.2_

---

### - [ ] 2.3 Create Date Display Component
Create a component for consistent date display.

**File:** `src/components/DateDisplay.tsx`

**Features:**
- Respects calendar preference
- Formats dates consistently
- Shows both calendars on hover
- Supports multiple formats

**Usage:**
```typescript
<DateDisplay 
  date={animalBirthDate} 
  format="long"
  showBothCalendars={true}
/>
```

**Requirements:** _1.9_

---

### - [ ] 2.4 Replace All Date Inputs with Enhanced Picker
Systematically replace date inputs across the application.

**Files to Modify:**
1. `src/components/AnimalRegistrationForm.tsx` - Birth date
2. `src/components/CalfRegistrationForm.tsx` - Birth date
3. `src/components/VaccinationForm.tsx` - Vaccination date
4. `src/components/WeightEntryForm.tsx` - Weight date
5. `src/components/IllnessReportForm.tsx` - Illness date
6. `src/components/MilkRecordingForm.tsx` - Production date
7. `src/components/MarketListingForm.tsx` - Listing date
8. `src/pages/Growth.tsx` - Date filters
9. `src/pages/Health.tsx` - Date filters
10. `src/pages/Analytics.tsx` - Date range selectors

**Pattern:**
```typescript
// BEFORE
<DatePicker 
  date={birthDate}
  onDateChange={setBirthDate}
/>

// AFTER
<EnhancedEthiopianDatePicker
  date={birthDate}
  onDateChange={setBirthDate}
  showToggle={true}
  highlightHolidays={true}
/>
```

**Requirements:** _1.1, 1.9_

---

## Phase 3: Cultural Elements (Days 7-8)

### - [ ] 3. Create Ethiopian Holidays Service
Implement holiday data and calculation.

**File:** `src/services/ethiopianHolidays.ts`

**Fixed Holidays:**
```typescript
export const FIXED_HOLIDAYS: EthiopianHoliday[] = [
  {
    id: 'enkutatash',
    name: {
      am: 'እንቁጣጣሽ',
      en: 'Enkutatash (New Year)',
      or: 'Bara Haaraa',
      sw: 'Mwaka Mpya'
    },
    date: { month: 1, day: 1 },
    type: 'national',
    farmingImpact: {
      affectsMarket: true,
      affectsWork: true,
      notes: 'Major celebration, markets closed'
    }
  },
  {
    id: 'meskel',
    name: {
      am: 'መስቀል',
      en: 'Meskel (Finding of True Cross)',
      or: 'Masqala',
      sw: 'Meskel'
    },
    date: { month: 1, day: 17 },
    type: 'religious',
    farmingImpact: {
      affectsMarket: true,
      affectsWork: true,
      notes: 'Religious holiday, reduced market activity'
    }
  },
  // Add all major holidays
];
```

**Movable Holidays:**
```typescript
export function calculateEaster(year: number): EthiopianDate {
  // Easter calculation algorithm
  // Returns Ethiopian date of Easter
}

export function calculateFasika(year: number): EthiopianDate {
  return calculateEaster(year);
}
```

**Requirements:** _1.4_

---

### - [ ] 3.1 Create Agricultural Seasons Service
Implement season data and indicators.

**File:** `src/services/agriculturalSeasons.ts`

**Seasons:**
```typescript
export const AGRICULTURAL_SEASONS: AgriculturalSeason[] = [
  {
    id: 'belg',
    name: {
      am: 'በልግ',
      en: 'Belg (Small Rainy Season)',
      or: 'Ganna'
    },
    startMonth: 7, // Yekatit
    endMonth: 9,   // Ginbot
    characteristics: [
      'Light to moderate rainfall',
      'Good for planting short-season crops',
      'Moderate temperatures'
    ],
    farmingActivities: [
      'Plant maize, sorghum, teff',
      'Prepare land for main season',
      'Vaccinate animals before rains'
    ],
    animalCareNotes: [
      'Monitor for parasites',
      'Ensure adequate shelter',
      'Supplement feed if needed'
    ]
  },
  {
    id: 'kiremt',
    name: {
      am: 'ክረምት',
      en: 'Kiremt (Main Rainy Season)',
      or: 'Ganna Guddaa'
    },
    startMonth: 10, // Sene
    endMonth: 1,    // Meskerem
    characteristics: [
      'Heavy rainfall',
      'Main growing season',
      'Cooler temperatures'
    ],
    farmingActivities: [
      'Main planting season',
      'Weed control',
      'Monitor crop health'
    ],
    animalCareNotes: [
      'Protect from heavy rains',
      'Watch for foot rot',
      'Ensure dry bedding'
    ]
  },
  {
    id: 'bega',
    name: {
      am: 'በጋ',
      en: 'Bega (Dry Season)',
      or: 'Bona'
    },
    startMonth: 2,  // Tikimt
    endMonth: 6,    // Tir
    characteristics: [
      'Little to no rainfall',
      'Harvest season',
      'Warm to hot temperatures'
    ],
    farmingActivities: [
      'Harvest crops',
      'Thresh and store grain',
      'Prepare for next season'
    ],
    animalCareNotes: [
      'Ensure water availability',
      'Supplement feed',
      'Protect from heat stress'
    ]
  }
];
```

**Requirements:** _1.5_

---

### - [ ] 3.2 Create Fasting Periods Service
Implement fasting period data and calculations.

**File:** `src/services/fastingPeriods.ts`

**Fasting Periods:**
```typescript
export const FASTING_PERIODS: FastingPeriod[] = [
  {
    id: 'hudade',
    name: {
      am: 'ሁዳዴ/አብይ ጾም',
      en: 'Hudade/Abiye Tsom (Lent)'
    },
    type: 'major',
    duration: 55,
    calculateStart: (year) => {
      const easter = calculateEaster(year);
      return subtractDays(easter, 55);
    },
    marketImpact: 'high',
    notes: 'No animal products consumed, affects livestock market significantly'
  },
  {
    id: 'filseta',
    name: {
      am: 'ፍልሰታ',
      en: 'Filseta (Assumption Fast)'
    },
    type: 'major',
    duration: 15,
    startDate: { month: 12, day: 1 }, // Nehase 1
    marketImpact: 'medium',
    notes: 'Affects dairy and meat sales'
  },
  {
    id: 'weekly',
    name: {
      am: 'ረቡዕ እና ዓርብ ጾም',
      en: 'Wednesday and Friday Fasts'
    },
    type: 'weekly',
    duration: 1,
    marketImpact: 'low',
    notes: 'Weekly fasting days, minor market impact'
  }
];
```

**Requirements:** _1.6_

---

### - [ ] 3.3 Create Holiday Indicator Component
Create visual indicators for holidays on calendar.

**File:** `src/components/HolidayIndicator.tsx`

**Features:**
- Color-coded by holiday type
- Tooltip with holiday info
- Icon for holiday type
- Farming impact warning

**UI:**
```
🎉 Enkutatash
   Ethiopian New Year
   ⚠️ Markets closed
```

**Requirements:** _1.4_

---

### - [ ] 3.4 Create Season Badge Component
Create visual indicators for agricultural seasons.

**File:** `src/components/SeasonBadge.tsx`

**Features:**
- Color-coded by season
- Season name and icon
- Farming tips on hover
- Animal care notes

**UI:**
```
🌧️ Kiremt (Main Rainy Season)
   Protect animals from heavy rains
   Watch for foot rot
```

**Requirements:** _1.5_

---

## Phase 4: Testing, Optimization & Documentation (Days 9-10)

### - [ ] 4. Comprehensive Testing
Test all calendar functionality thoroughly.

**Test Categories:**

1. **Unit Tests**
   - Date conversion accuracy
   - Validation logic
   - Holiday calculations
   - Season detection

2. **Integration Tests**
   - Calendar context with components
   - Date picker with forms
   - Preference persistence
   - Offline functionality

3. **E2E Tests**
   - Register animal with Ethiopian date
   - Toggle between calendars
   - View dates in different languages
   - Export data with both calendars

**Requirements:** _All_

---

### - [ ] 4.1 Performance Optimization
Optimize calendar performance for mobile devices.

**Optimizations:**
1. Memoize date conversions
2. Cache holiday calculations
3. Lazy load season data
4. Optimize calendar rendering
5. Reduce bundle size

**Performance Targets:**
- Date conversion: < 10ms
- Calendar render: < 200ms
- Component mount: < 100ms

**Requirements:** _Performance NFRs_

---

### - [ ] 4.2 Accessibility Testing
Ensure calendar is fully accessible.

**Tests:**
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Touch target sizes
- Focus management

**Tools:**
- axe DevTools
- NVDA/JAWS screen readers
- Keyboard-only navigation
- Mobile accessibility testing

**Requirements:** _Accessibility NFRs_

---

### - [ ] 4.3 Mobile Device Testing
Test on various mobile devices and screen sizes.

**Devices:**
- Android phones (various sizes)
- iOS phones (various sizes)
- Tablets
- Low-end devices

**Test Scenarios:**
- Date selection
- Calendar toggle
- Holiday viewing
- Offline functionality
- Performance

**Requirements:** _1.10, Compatibility NFRs_

---

### - [ ] 4.4 Create User Documentation
Document calendar features for users.

**Documentation:**
1. User guide (Amharic & English)
2. Video tutorials
3. FAQ section
4. Troubleshooting guide

**Topics:**
- How to switch calendars
- Understanding Ethiopian dates
- Holiday information
- Season planning
- Fasting period awareness

**Requirements:** _All_

---

### - [ ] 4.5 Create Developer Documentation
Document calendar system for developers.

**Documentation:**
1. API reference
2. Component usage guide
3. Integration examples
4. Testing guide
5. Troubleshooting

**Files:**
- `docs/ethiopian-calendar-api.md`
- `docs/calendar-integration-guide.md`
- `docs/calendar-testing.md`

**Requirements:** _All_

---

## Verification Checklist

### Functional Requirements
- [ ] Ethiopian calendar displays correctly
- [ ] Gregorian calendar displays correctly
- [ ] Calendar toggle works smoothly
- [ ] Date conversion is accurate
- [ ] Holidays are highlighted
- [ ] Seasons are indicated
- [ ] Fasting periods are shown
- [ ] Amharic translations are correct
- [ ] Offline functionality works
- [ ] Mobile interface is responsive
- [ ] Date validation works
- [ ] Historical dates are supported

### Non-Functional Requirements
- [ ] Performance meets targets
- [ ] Accessibility standards met
- [ ] Works on all target devices
- [ ] Offline mode functional
- [ ] Data persists correctly
- [ ] Error handling is robust

### Cultural Requirements
- [ ] Ethiopian holidays accurate
- [ ] Agricultural seasons correct
- [ ] Fasting periods accurate
- [ ] Amharic names proper
- [ ] Cultural respect maintained

---

## Success Metrics

### Adoption Metrics
- 80%+ Ethiopian users use Ethiopian calendar
- 90%+ date entries use Ethiopian calendar
- User satisfaction 4.5/5

### Technical Metrics
- 0 date conversion errors
- 100% offline functionality
- < 1% validation errors

### Performance Metrics
- Date conversion < 10ms
- Calendar render < 200ms
- Component mount < 100ms

---

## Rollout Plan

### Phase 1: Beta Testing (Week 1)
- Deploy to 10 beta users
- Collect feedback
- Fix critical issues

### Phase 2: Soft Launch (Week 2)
- Deploy to 100 users
- Monitor usage
- Gather feedback

### Phase 3: Full Launch (Week 3)
- Deploy to all users
- Make Ethiopian default for Ethiopian users
- Announce feature

---

## Support Plan

### User Support
- FAQ documentation
- Video tutorials
- In-app help
- Support hotline

### Technical Support
- Error monitoring
- Performance tracking
- Bug fix process
- Feature requests

---

**Ready to start? Begin with Task 1.0: Create Ethiopian Calendar Utility Module**
