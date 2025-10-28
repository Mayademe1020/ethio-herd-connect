# Remaining Implementation Guide

## ✅ What's Done
- Database migrations created
- Onboarding updated (farmer name + farm name)
- Translations updated (Bull → Heifer/Bull)
- Components created (BackButton, BottomNav, LanguageToggle)

## 🚧 What's Left (Critical)

### 1. Animal ID Generation (HIGHEST PRIORITY)

**Add to `src/hooks/useAnimalRegistration.tsx`:**

```typescript
// Add this helper function at the top of the file
const generateAnimalId = async (
  type: string,
  subtype: string,
  userId: string
): Promise<string> => {
  // Get user profile for farm/farmer name
  const { data: profile } = await supabase
    .from('profiles' as any)
    .select('farm_name, farmer_name, phone')
    .eq('id', userId)
    .single();

  // Determine prefix
  let prefix = '';
  if (profile?.farm_name) {
    prefix = profile.farm_name.substring(0, 10).replace(/\s+/g, '');
  } else if (profile?.farmer_name) {
    prefix = profile.farmer_name.split(' ')[0].substring(0, 10);
  } else if (profile?.phone) {
    prefix = profile.phone.slice(-6);
  } else {
    prefix = userId.slice(0, 6);
  }

  // Animal short codes
  const animalCodes: Record<string, string> = {
    'Cow': 'COW',
    'Bull': 'BUL',
    'Ox': 'OXX',
    'Calf': 'CAL',
    'Male': type === 'goat' ? 'MGT' : 'RAM',
    'Female': type === 'goat' ? 'FGT' : 'EWE',
    'Ram': 'RAM',
    'Ewe': 'EWE'
  };

  const animalCode = animalCodes[subtype] || 'ANM';
  const year = new Date().getFullYear();

  // Get count of user's animals of this type
  const { count } = await supabase
    .from('animals' as any)
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('type', type);

  const number = String((count || 0) + 1).padStart(3, '0');

  return `${prefix}-${animalCode}-${number}-${year}`;
};

// Then in the mutation function, add animal_id generation:
const animalId = await generateAnimalId(data.type, data.subtype, user.id);

const animalData = {
  id: tempId,
  user_id: user.id,
  animal_id: animalId, // ADD THIS LINE
  name: data.name || `${data.subtype}`,
  type: data.type,
  subtype: data.subtype,
  photo_url: data.photo_url,
  registration_date: new Date().toISOString(),
  is_active: true
} as any;
```

### 2. Integrate Components into App

**Update `src/AppMVP.tsx`:**

```typescript
// Add imports
import { BottomNavigation } from '@/components/BottomNavigation';
import { LanguageToggle } from '@/components/LanguageToggle';

// Create a Layout wrapper component
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  
  // Don't show bottom nav on login/onboarding
  const hideBottomNav = ['/login', '/onboarding'].includes(location.pathname);
  
  return (
    <div className="min-h-screen pb-16"> {/* Add padding for bottom nav */}
      {/* Top bar with language toggle */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-2 flex justify-end z-40">
        <LanguageToggle />
      </div>
      
      {/* Main content with top padding */}
      <div className="pt-16">
        {children}
      </div>
      
      {/* Bottom navigation */}
      {!hideBottomNav && <BottomNavigation />}
    </div>
  );
};

// Then wrap your routes with AppLayout
```

### 3. Add BackButton to Pages

**Example for `src/pages/RegisterAnimal.tsx`:**

```typescript
import { BackButton } from '@/components/BackButton';

// At the top of the page content:
<div className="p-4">
  <BackButton label="ተመለስ / Back" />
  {/* Rest of page content */}
</div>
```

### 4. Auto-Advance Logic

**Update `src/pages/RegisterAnimal.tsx`:**

```typescript
// Remove all "Continue" buttons
// Add useEffect to auto-advance:

useEffect(() => {
  if (step === 1 && selectedType) {
    // Auto-advance to step 2 after type selection
    setTimeout(() => setStep(2), 300); // Small delay for UX
  }
}, [selectedType, step]);

useEffect(() => {
  if (step === 2 && selectedSubtype) {
    // Auto-advance to step 3 after subtype selection
    setTimeout(() => setStep(3), 300);
  }
}, [selectedSubtype, step]);
```

---

## 🧪 Quick Test Plan

1. **Apply Migrations:**
   ```bash
   npx supabase db push
   ```

2. **Test Onboarding:**
   - New user → Enter farmer name + farm name
   - Verify saves to database

3. **Test Animal Registration:**
   - Register animal
   - Check Animal ID format
   - Verify uniqueness

4. **Test Navigation:**
   - Bottom nav works
   - Back button works
   - Language toggle works

---

## ⏱️ Time Estimate

- Animal ID Generation: 30 min
- Component Integration: 30 min
- Auto-Advance Logic: 20 min
- Testing: 20 min

**Total: ~2 hours**

---

**Would you like me to implement these remaining pieces now, or would you prefer to review what's done first?**

