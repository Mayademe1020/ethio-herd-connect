# Ethiopian Market Focus Guide
**Transform Multi-Country App to Ethiopia-Focused Solution**

---

## Overview

This guide provides step-by-step instructions to transform the application from a multi-country platform to an Ethiopia-focused livestock management system.

---

## Why Ethiopia-Only?

### Benefits
✅ **Simpler User Experience** - No confusing country selection  
✅ **Faster Development** - Less code to maintain  
✅ **Better Performance** - Fewer conditional checks  
✅ **Clearer Brand Identity** - Known as "Ethiopian solution"  
✅ **Easier Marketing** - Focused messaging  
✅ **Better Localization** - Deep Ethiopian context  

### What We're Removing
❌ Kenya (KE) support  
❌ Uganda (UG) support  
❌ Tanzania (TZ) support  
❌ Rwanda (RW) support  
❌ Country selection UI  
❌ Country-based logic  

### What We're Keeping
✅ Ethiopia (ET) as default and only option  
✅ Ethiopian breeds (already implemented)  
✅ Ethiopian calendar (already implemented)  
✅ Amharic language (already implemented)  
✅ Ethiopian Birr currency (already implemented)  

---

## Implementation Plan

### Phase 1: Create Ethiopia Constants (30 minutes)

#### Step 1: Create Constants File

**New File:** `src/constants/ethiopia.ts`

```typescript
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
 */
export function isValidEthiopianPhone(phone: string): boolean {
  return ETHIOPIA.phonePattern.test(phone);
}

/**
 * Format Ethiopian currency
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
 */
export function getRegionName(code: string, language: 'en' | 'am' = 'en'): string {
  const region = ETHIOPIA.regions.find(r => r.code === code);
  if (!region) return code;
  return language === 'am' ? region.nameAmharic : region.name;
}
```

---

### Phase 2: Simplify CountryContext (1 hour)

#### Option A: Simplify Existing Context

**File:** `src/contexts/CountryContext.tsx`

```typescript
import React, { createContext, useContext } from 'react';
import { ETHIOPIA } from '@/constants/ethiopia';

export type CountryCode = 'ET';

interface CountryContextValue {
  country: CountryCode;
  setCountry: (code: CountryCode) => void; // No-op for compatibility
  getCountryName: (code: CountryCode) => string;
  getCountryFlag: (code: CountryCode) => string;
}

const CountryContext = createContext<CountryContextValue | undefined>(undefined);

export const CountryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always Ethiopia - no state needed
  const value: CountryContextValue = {
    country: 'ET',
    setCountry: () => {
      // No-op: Always Ethiopia
      console.warn('Country is fixed to Ethiopia');
    },
    getCountryName: () => ETHIOPIA.name,
    getCountryFlag: () => ETHIOPIA.flag,
  };

  return (
    <CountryContext.Provider value={value}>
      {children}
    </CountryContext.Provider>
  );
};

export const useCountry = (): CountryContextValue => {
  const ctx = useContext(CountryContext);
  if (!ctx) throw new Error('useCountry must be used within CountryProvider');
  return ctx;
};
```

#### Option B: Create New Ethiopia Context

**New File:** `src/contexts/EthiopiaContext.tsx`

```typescript
import React, { createContext, useContext, useState } from 'react';
import { ETHIOPIA } from '@/constants/ethiopia';

interface EthiopiaContextValue {
  region: string | null;
  setRegion: (region: string | null) => void;
  getRegionName: (language?: 'en' | 'am') => string;
}

const EthiopiaContext = createContext<EthiopiaContextValue | undefined>(undefined);

export const EthiopiaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [region, setRegion] = useState<string | null>(null);

  const getRegionName = (language: 'en' | 'am' = 'en'): string => {
    if (!region) return language === 'am' ? 'ክልል አልተመረጠም' : 'No region selected';
    
    const regionData = ETHIOPIA.regions.find(r => r.code === region);
    if (!regionData) return region;
    
    return language === 'am' ? regionData.nameAmharic : regionData.name;
  };

  return (
    <EthiopiaContext.Provider value={{ region, setRegion, getRegionName }}>
      {children}
    </EthiopiaContext.Provider>
  );
};

export const useEthiopia = (): EthiopiaContextValue => {
  const ctx = useContext(EthiopiaContext);
  if (!ctx) throw new Error('useEthiopia must be used within EthiopiaProvider');
  return ctx;
};
```

**Recommendation:** Use Option A for backward compatibility, then gradually migrate to Option B

---

### Phase 3: Update Components (2 hours)

#### Component 1: CountrySelector

**File:** `src/components/CountrySelector.tsx`

**Option A: Display-Only (Recommended)**
```typescript
import React from 'react';
import { ETHIOPIA } from '@/constants/ethiopia';

export const CountrySelector: React.FC = () => {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50 cursor-default">
      <span className="text-xl">{ETHIOPIA.flag}</span>
      <span className="font-medium text-sm">{ETHIOPIA.name}</span>
    </div>
  );
};
```

**Option B: Delete Component**
- Remove file entirely
- Update imports in other files

---

#### Component 2: EnhancedHeader

**File:** `src/components/EnhancedHeader.tsx`

**Find and Remove (Lines ~80-83):**
```tsx
{/* Country Selector */}
<div className="hidden md:flex">
  <CountrySelector />
</div>
```

**Optional: Add Ethiopia Badge**
```tsx
{/* Ethiopia Badge */}
<div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
  <span className="text-lg">{ETHIOPIA.flag}</span>
  <span className="text-sm font-medium text-green-800">{ETHIOPIA.name}</span>
</div>
```

---

#### Component 3: OtpAuthForm

**File:** `src/components/OtpAuthForm.tsx`

**Find (Lines ~162-165):**
```tsx
<div className="flex items-center gap-2">
  <CountrySelector />
</div>
<Input type="tel" value={phoneLocal} onChange={(e) => setPhoneLocal(e.target.value)} placeholder={t.phoneLabel} />
```

**Replace With:**
```tsx
<div className="space-y-2">
  <Label htmlFor="phone">{t.phoneLabel}</Label>
  <div className="flex items-center gap-2">
    {/* Ethiopia Phone Prefix */}
    <div className="flex items-center gap-2 px-3 py-2 border rounded-md bg-gray-50 flex-shrink-0">
      <span className="text-xl">{ETHIOPIA.flag}</span>
      <span className="font-medium">{ETHIOPIA.phonePrefix}</span>
    </div>
    
    {/* Phone Number Input */}
    <Input
      id="phone"
      type="tel"
      value={phoneLocal}
      onChange={(e) => setPhoneLocal(e.target.value)}
      placeholder="912345678"
      className="flex-1"
      maxLength={9}
    />
  </div>
  <p className="text-xs text-gray-500">
    {language === 'am' 
      ? 'የስልክ ቁጥርዎን ያስገቡ (9 አሃዞች)'
      : 'Enter your phone number (9 digits)'}
  </p>
</div>
```

**Add Validation:**
```typescript
import { isValidEthiopianPhone, formatEthiopianPhone } from '@/constants/ethiopia';

// In component
const handlePhoneChange = (value: string) => {
  // Only allow digits
  const cleaned = value.replace(/\D/g, '');
  
  // Limit to 9 digits
  if (cleaned.length <= 9) {
    setPhoneLocal(cleaned);
  }
};

const handleSubmit = () => {
  const fullPhone = `+251${phoneLocal}`;
  
  if (!isValidEthiopianPhone(fullPhone)) {
    toast.error('Invalid phone number');
    return;
  }
  
  // Continue with submission
  sendVerificationCode(fullPhone);
};
```

---

### Phase 4: Update Translations (30 minutes)

**File:** `src/i18n/translations.json`

**Remove or Update:**
```json
{
  "en": {
    "country": "Country",  // Remove or change to "region": "Region"
    "selectCountry": "Select Country"  // Remove or change to "selectRegion": "Select Region"
  },
  "am": {
    "country": "አገር",  // Remove or change to "region": "ክልል"
    "selectCountry": "አገር ይምረጡ"  // Remove or change to "selectRegion": "ክልል ይምረጡ"
  }
}
```

**Add Ethiopia-Specific:**
```json
{
  "en": {
    "ethiopia": "Ethiopia",
    "region": "Region",
    "selectRegion": "Select Region",
    "phoneNumber": "Phone Number",
    "enterPhoneNumber": "Enter your phone number",
    "phoneFormat": "Format: 9XX XXX XXX"
  },
  "am": {
    "ethiopia": "ኢትዮጵያ",
    "region": "ክልል",
    "selectRegion": "ክልል ይምረጡ",
    "phoneNumber": "ስልክ ቁጥር",
    "enterPhoneNumber": "የስልክ ቁጥርዎን ያስገቡ",
    "phoneFormat": "ቅርጸት: 9XX XXX XXX"
  }
}
```

---

### Phase 5: Clean Up Tests (30 minutes)

**File:** `src/__tests__/CountryContext.test.tsx`

**Option A: Update Tests**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CountryProvider, useCountry } from '@/contexts/CountryContext';

function ShowCountry() {
  const { country, getCountryName, getCountryFlag } = useCountry();
  
  return (
    <div>
      <span data-testid="country">{country}</span>
      <span data-testid="name">{getCountryName(country)}</span>
      <span data-testid="flag">{getCountryFlag(country)}</span>
    </div>
  );
}

describe('CountryContext - Ethiopia Only', () => {
  it('always returns Ethiopia', () => {
    render(
      <CountryProvider>
        <ShowCountry />
      </CountryProvider>
    );
    
    expect(screen.getByTestId('country').textContent).toBe('ET');
    expect(screen.getByTestId('name').textContent).toBe('Ethiopia');
    expect(screen.getByTestId('flag').textContent).toBe('🇪🇹');
  });
  
  it('setCountry is a no-op', () => {
    const { container } = render(
      <CountryProvider>
        <ShowCountry />
      </CountryProvider>
    );
    
    // Country should remain ET even if we try to change it
    expect(screen.getByTestId('country').textContent).toBe('ET');
  });
});
```

**Option B: Delete Tests**
- Remove test file if context is removed
- Add new tests for Ethiopia constants

---

### Phase 6: Add Regional Support (Optional - 2 hours)

Instead of countries, support Ethiopian regions for better localization.

#### Step 1: Create Region Selector Component

**New File:** `src/components/RegionSelector.tsx`

```typescript
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ETHIOPIA } from '@/constants/ethiopia';
import { useEthiopia } from '@/contexts/EthiopiaContext';
import { Language } from '@/types';

interface RegionSelectorProps {
  language: Language;
}

export const RegionSelector: React.FC<RegionSelectorProps> = ({ language }) => {
  const { region, setRegion } = useEthiopia();
  
  return (
    <Select value={region || ''} onValueChange={setRegion}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={language === 'am' ? 'ክልል ይምረጡ' : 'Select Region'} />
      </SelectTrigger>
      <SelectContent>
        {ETHIOPIA.regions.map((r) => (
          <SelectItem key={r.code} value={r.code}>
            {language === 'am' ? r.nameAmharic : r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
```

#### Step 2: Add to User Profile

**File:** `src/pages/Profile.tsx`

```tsx
import { RegionSelector } from '@/components/RegionSelector';

// In profile form
<div className="space-y-2">
  <Label>{t('profile.region')}</Label>
  <RegionSelector language={language} />
  <p className="text-xs text-gray-500">
    {language === 'am' 
      ? 'የእርስዎን ክልል ይምረጡ ለተሻለ አገልግሎት'
      : 'Select your region for better service'}
  </p>
</div>
```

#### Step 3: Use for Breed Recommendations

```typescript
// Future enhancement: Recommend breeds based on region
export function getRecommendedBreeds(animalType: AnimalType, region: string): BreedInfo[] {
  // Example: Fogera cattle are common in Amhara region
  // Boran cattle are common in Oromia and Southern regions
  // This can be expanded based on agricultural data
  
  const allBreeds = getBreedsByType(animalType);
  
  // For now, return all breeds
  // TODO: Add region-specific recommendations
  return allBreeds;
}
```

---

## Testing Checklist

### Functionality Tests
- [ ] Application loads without errors
- [ ] No country selector visible in header
- [ ] Phone authentication shows Ethiopia prefix
- [ ] Phone input accepts 9 digits
- [ ] Phone validation works correctly
- [ ] Existing users can still log in
- [ ] New users can register
- [ ] All pages load correctly
- [ ] No console errors related to country

### Visual Tests
- [ ] Header looks clean without country selector
- [ ] Phone input looks professional
- [ ] Ethiopia flag displays correctly
- [ ] No layout issues from removed elements
- [ ] Mobile view works correctly
- [ ] Tablet view works correctly
- [ ] Desktop view works correctly

### Data Tests
- [ ] User profiles don't break
- [ ] Phone numbers save correctly
- [ ] Existing phone numbers still work
- [ ] Authentication flow completes
- [ ] No data loss from changes

---

## Rollback Plan

If issues arise, you can quickly rollback:

### Step 1: Restore CountryContext
```bash
git checkout HEAD -- src/contexts/CountryContext.tsx
```

### Step 2: Restore Components
```bash
git checkout HEAD -- src/components/CountrySelector.tsx
git checkout HEAD -- src/components/EnhancedHeader.tsx
git checkout HEAD -- src/components/OtpAuthForm.tsx
```

### Step 3: Restore Translations
```bash
git checkout HEAD -- src/i18n/translations.json
```

### Step 4: Rebuild
```bash
npm run build
```

---

## Future Enhancements

### Phase 2: Regional Features
- Regional breed recommendations
- Regional market prices
- Regional weather data
- Regional agricultural tips
- Regional veterinary services

### Phase 3: Deep Localization
- Regional dialects support
- Regional measurement units
- Regional farming practices
- Regional holidays and events
- Regional success stories

---

## Success Metrics

✅ **No country selection UI visible**  
✅ **Phone authentication Ethiopia-only**  
✅ **All tests passing**  
✅ **No console errors**  
✅ **Faster page load (less code)**  
✅ **Cleaner user experience**  
✅ **Ready for regional support**

---

**Document Created:** October 21, 2025  
**Last Updated:** October 21, 2025  
**Estimated Time:** 6-8 hours total
