# Design Document

## Overview

This design addresses critical bugs in the onboarding and profile flow. The issues stem from:
1. Missing translation keys in the i18n JSON files
2. Supabase returning 406 errors due to missing Accept headers or RLS policy issues
3. Browser auto-correct interfering with Ethiopian name input
4. Lack of validation for Ethiopian naming conventions (first name + father's name)

The solution involves updating translation files, fixing the profile fetch logic, adding HTML attributes to disable auto-correct, and implementing client-side name validation.

## Architecture

### Component Flow
```
LoginMVP → AuthContextMVP → Onboarding → useProfile → ProtectedRoute → Home
                                ↓
                          Profile Creation
                                ↓
                          Validation Layer
```

### Data Flow
1. User completes phone/PIN authentication
2. AuthContextMVP sets user session
3. ProtectedRoute checks useProfile hook
4. If profile incomplete → redirect to Onboarding
5. Onboarding validates and creates profile
6. Profile fetch succeeds → redirect to Home

## Components and Interfaces

### 1. Translation Files Update

**Files:** `src/i18n/en.json`, `src/i18n/am.json`

Add missing translation keys:

```json
// en.json
{
  "common": {
    "profile": "Profile",
    // ... existing keys
  },
  "onboarding": {
    "fullNameRequired": "Please enter your full name (first name and father's name)",
    "fullNameRequiredShort": "Full name required",
    "nameExample": "e.g., Abebe Tesema",
    "nameHelp": "Enter your first name and father's name"
  }
}

// am.json
{
  "common": {
    "profile": "መገለጫ",
    // ... existing keys
  },
  "onboarding": {
    "fullNameRequired": "እባክዎ ሙሉ ስምዎን ያስገቡ (ስም እና የአባት ስም)",
    "fullNameRequiredShort": "ሙሉ ስም ያስፈልጋል",
    "nameExample": "ለምሳሌ: አበበ ተሰማ",
    "nameHelp": "ስምዎን እና የአባት ስምዎን ያስገቡ"
  }
}
```

### 2. Name Validation Utility

**File:** `src/utils/nameValidation.ts`

```typescript
interface NameValidationResult {
  isValid: boolean;
  error?: string;
  errorAm?: string;
}

export const validateFullName = (name: string): NameValidationResult => {
  const trimmed = name.trim();
  
  // Check if empty
  if (!trimmed) {
    return {
      isValid: false,
      error: "Name is required",
      errorAm: "ስም ያስፈልጋል"
    };
  }
  
  // Split by whitespace (handles both Latin and Amharic)
  const parts = trimmed.split(/\s+/);
  
  // Must have at least 2 parts (first name + father's name)
  if (parts.length < 2) {
    return {
      isValid: false,
      error: "Please enter your full name (first name and father's name)",
      errorAm: "እባክዎ ሙሉ ስምዎን ያስገቡ (ስም እና የአባት ስም)"
    };
  }
  
  // Each part must have at least 2 characters
  const hasShortPart = parts.some(part => part.length < 2);
  if (hasShortPart) {
    return {
      isValid: false,
      error: "Each name part must be at least 2 characters",
      errorAm: "እያንዳንዱ የስም ክፍል ቢያንስ 2 ፊደላት ሊኖረው ይገባል"
    };
  }
  
  return { isValid: true };
};
```

### 3. Onboarding Component Updates

**File:** `src/pages/Onboarding.tsx`

**Changes:**
- Add HTML attributes to disable auto-correct: `autoComplete="off"`, `autoCorrect="off"`, `spellCheck="false"`
- Add real-time validation with error display
- Add validation state management
- Update submit handler to validate before submission

**Key Attributes:**
```tsx
<input
  type="text"
  autoComplete="off"
  autoCorrect="off"
  spellCheck="false"
  data-form-type="other"
  // ... other props
/>
```

**Validation State:**
```typescript
const [nameError, setNameError] = useState<string>('');
const [touched, setTouched] = useState(false);

const handleNameChange = (value: string) => {
  setFarmerName(value);
  if (touched) {
    const validation = validateFullName(value);
    setNameError(validation.isValid ? '' : validation.error || '');
  }
};

const handleNameBlur = () => {
  setTouched(true);
  const validation = validateFullName(farmerName);
  setNameError(validation.isValid ? '' : validation.error || '');
};
```

### 4. Profile Fetch Fix

**File:** `src/hooks/useProfile.tsx`

**Issue:** The 406 error typically occurs when:
- Supabase expects specific Accept headers
- RLS policies are blocking the query
- The table doesn't exist or has wrong permissions

**Solution:**
1. Add explicit error handling for 406 errors
2. Add retry logic with exponential backoff
3. Ensure proper headers are sent (handled by Supabase client)
4. Add better error messages

```typescript
const { data: profile, isLoading, error, refetch } = useQuery({
  queryKey: ['profile', user?.id],
  queryFn: async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        // Profile doesn't exist yet
        if (error.code === 'PGRST116') {
          return null;
        }
        
        // 406 Not Acceptable - likely RLS or header issue
        if (error.message.includes('406')) {
          console.error('Profile fetch 406 error:', error);
          throw new Error('Unable to load profile. Please try again.');
        }
        
        throw error;
      }

      return data as UserProfile;
    } catch (err) {
      console.error('Profile fetch error:', err);
      throw err;
    }
  },
  enabled: !!user,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});
```

### 5. Database Schema Verification

**Migration Check:** Ensure the `profiles` table exists with proper structure

```sql
-- Verify table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Verify RLS policies allow authenticated users to read their own profile
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

**Expected RLS Policy:**
```sql
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);
```

## Error Handling

### 1. Translation Missing Fallback

The existing `useTranslation` hook already handles missing keys by:
- Logging a warning
- Returning the key itself as fallback
- Falling back to English if Amharic is missing

No changes needed here.

### 2. Profile Fetch Error Handling

**In ProtectedRoute:**
```typescript
if (error) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">
          መገለጫ መጫን አልተቻለም / Unable to Load Profile
        </h2>
        <p className="text-gray-600 mb-4">
          {error.message}
        </p>
        <button
          onClick={() => refetch()}
          className="bg-green-600 text-white px-6 py-3 rounded-lg"
        >
          እንደገና ይሞክሩ / Try Again
        </button>
      </div>
    </div>
  );
}
```

### 3. Onboarding Validation Errors

Display inline validation errors with bilingual messages:

```tsx
{nameError && (
  <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
    <p className="text-sm text-red-800">
      {nameError}
    </p>
  </div>
)}
```

### 4. Network Error Handling

Add network error detection and retry UI:

```typescript
const handleSubmit = async () => {
  // Validate first
  const validation = validateFullName(farmerName);
  if (!validation.isValid) {
    setNameError(validation.error || '');
    toast.error(validation.errorAm || validation.error || 'Validation failed');
    return;
  }

  setLoading(true);
  try {
    // ... existing code
  } catch (error: any) {
    console.error('Onboarding error:', error);
    
    // Network error
    if (error.message?.includes('fetch') || error.message?.includes('network')) {
      toast.error('የኢንተርኔት ግንኙነት ችግር / Network Error', {
        description: 'እባክዎ ግንኙነትዎን ያረጋግጡ / Please check your connection',
        action: {
          label: 'እንደገና ይሞክሩ / Retry',
          onClick: () => handleSubmit()
        }
      });
    } else {
      toast.error('መረጃ ማስቀመጥ አልተቻለም / Failed to save', {
        description: error.message || 'Please try again'
      });
    }
  } finally {
    setLoading(false);
  }
};
```

## Testing Strategy

### 1. Unit Tests

**Test File:** `src/__tests__/nameValidation.test.ts`

Test cases:
- Empty name → invalid
- Single word → invalid
- Two words (Latin) → valid
- Two words (Amharic) → valid
- Three+ words → valid
- Names with short parts (< 2 chars) → invalid
- Names with special characters → valid (if >= 2 parts)

### 2. Integration Tests

**Test File:** `src/__tests__/onboarding.test.tsx`

Test cases:
- Auto-correct attributes are present
- Validation error displays on blur
- Validation error displays on submit
- Valid name allows submission
- Profile creation succeeds
- Profile creation failure shows error
- Retry button works after error

### 3. E2E Tests

**Test File:** `e2e/onboarding.spec.ts`

Test cases:
- Complete onboarding flow with valid full name
- Attempt submission with single name → see error
- Complete onboarding → redirect to home
- Profile loads successfully after onboarding
- No 406 errors in console
- No translation missing errors in console

### 4. Manual Testing Checklist

- [ ] Test with Amharic keyboard input
- [ ] Test with Latin keyboard input
- [ ] Verify auto-correct is disabled (type misspelled word, no suggestions)
- [ ] Test on mobile devices (iOS Safari, Android Chrome)
- [ ] Test with slow network (throttle to 3G)
- [ ] Test profile fetch after onboarding
- [ ] Verify no console errors
- [ ] Test name validation with various inputs

## Data Models

### Profile Table Schema

```typescript
interface Profile {
  id: string;              // UUID, matches auth.users.id
  phone: string;           // Phone number (without country code)
  farmer_name: string;     // Full name (first + father's name)
  farm_name: string | null; // Optional farm name
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

### Validation Result Model

```typescript
interface NameValidationResult {
  isValid: boolean;
  error?: string;      // English error message
  errorAm?: string;    // Amharic error message
}
```

## Implementation Notes

1. **Auto-correct Disable:** Multiple attributes are needed for cross-browser compatibility:
   - `autoComplete="off"` - Prevents browser autofill
   - `autoCorrect="off"` - iOS Safari specific
   - `spellCheck="false"` - Disables spell checking
   - `data-form-type="other"` - Hints to browsers this isn't a standard form

2. **Name Validation:** Uses `split(/\s+/)` to handle both Latin spaces and Amharic word separators

3. **Profile 406 Error:** Most likely caused by missing RLS policies or incorrect table permissions. The fix includes both code-level error handling and database verification steps.

4. **Translation Keys:** Adding to both en.json and am.json ensures consistency and prevents fallback issues.

5. **Error Messages:** All user-facing errors are bilingual (Amharic/English) to match the app's localization strategy.
