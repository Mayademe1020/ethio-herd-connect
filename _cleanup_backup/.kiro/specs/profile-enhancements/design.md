# Profile Page Enhancements - Design Document

## Overview

This design implements essential profile page improvements following the simplicity-first principle. We're replacing placeholder data with real user information, adding farmer-focused statistics, and streamlining the UI by removing unnecessary features.

**Design Principles:**
- Simple and clean UI
- Farmer-focused features only
- Mobile-first design
- Offline-capable
- Bilingual (Amharic/English)

## Architecture

### Component Structure

```
Profile Page
├── Header (Name + Edit Button)
├── Farm Statistics Card (NEW)
├── Quick Actions Section (NEW)
├── Settings Section (SIMPLIFIED)
├── Analytics Dashboard (EXISTING)
├── Help & Support (EXISTING)
└── Logout Button (ENHANCED with confirmation)
```

### Data Flow

```
Profile Page
    ↓
useProfile Hook → Fetch from profiles table
    ↓
useFarmStats Hook → Aggregate animals, milk, listings
    ↓
Display real data + statistics
```

## Components and Interfaces

### 1. Enhanced Profile Header

**Current:** Shows placeholder avatar and hardcoded name  
**New:** Shows real farmer name and farm name from database

```typescript
// Profile Header Component
interface ProfileHeaderProps {
  farmerName: string;
  farmName?: string | null;
  onEdit: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  farmerName, 
  farmName, 
  onEdit 
}) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          {farmerName}
        </h1>
        {farmName && (
          <p className="text-gray-600 mt-1">{farmName}</p>
        )}
      </div>
      <Button onClick={onEdit} variant="outline" size="sm">
        <Edit3 className="w-4 h-4 mr-2" />
        {t.editProfile}
      </Button>
    </div>
  );
};
```

### 2. Farm Statistics Card (NEW)

**Purpose:** Show farmer's activity at a glance

```typescript
interface FarmStats {
  totalAnimals: number;
  milkLast30Days: number; // in liters
  activeListings: number;
}

interface FarmStatsCardProps {
  stats: FarmStats;
  isLoading: boolean;
}

const FarmStatsCard: React.FC<FarmStatsCardProps> = ({ stats, isLoading }) => {
  const { t } = useTranslation();
  
  if (isLoading) {
    return <StatsCardSkeleton />;
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t.farmStatistics}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <StatItem
            icon={<Cow className="w-6 h-6" />}
            value={stats.totalAnimals}
            label={t.animals}
            color="green"
          />
          <StatItem
            icon={<Droplet className="w-6 h-6" />}
            value={`${stats.milkLast30Days} L`}
            label={t.milkLast30Days}
            color="blue"
          />
          <StatItem
            icon={<ShoppingBag className="w-6 h-6" />}
            value={stats.activeListings}
            label={t.listings}
            color="purple"
          />
        </div>
      </CardContent>
    </Card>
  );
};
```

### 3. Quick Actions Section (NEW)

**Purpose:** Fast access to common tasks

```typescript
interface QuickAction {
  icon: React.ReactNode;
  label: string;
  labelAm: string;
  path: string;
  requiresAnimals?: boolean;
}

const QuickActionsSection: React.FC<{ hasAnimals: boolean }> = ({ hasAnimals }) => {
  const { t, language } = useTranslation();
  const navigate = useNavigate();
  
  const actions: QuickAction[] = [
    {
      icon: <PlusCircle className="w-5 h-5" />,
      label: "Register Animal",
      labelAm: "እንስሳ ይመዝግቡ",
      path: "/register-animal",
      requiresAnimals: false
    },
    {
      icon: <Droplet className="w-5 h-5" />,
      label: "Record Milk",
      labelAm: "ወተት ይመዝግቡ",
      path: "/record-milk",
      requiresAnimals: true
    },
    {
      icon: <ShoppingBag className="w-5 h-5" />,
      label: "Create Listing",
      labelAm: "ማስታወቂያ ይፍጠሩ",
      path: "/create-listing",
      requiresAnimals: true
    }
  ];
  
  const handleAction = (action: QuickAction) => {
    if (action.requiresAnimals && !hasAnimals) {
      toast.error(
        language === 'am' 
          ? 'መጀመሪያ እንስሳ ይመዝግቡ' 
          : 'Please register animals first'
      );
      return;
    }
    navigate(action.path);
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>{t.quickActions}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action)}
              className="flex flex-col items-center p-4 rounded-lg border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-colors"
            >
              <div className="text-green-600 mb-2">{action.icon}</div>
              <span className="text-sm text-center font-medium">
                {language === 'am' ? action.labelAm : action.label}
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
```

### 4. Edit Profile Modal (NEW)

**Purpose:** Allow farmers to update their name and farm name

```typescript
interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFarmerName: string;
  currentFarmName: string | null;
  onSave: (farmerName: string, farmName: string) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  currentFarmerName,
  currentFarmName,
  onSave
}) => {
  const [farmerName, setFarmerName] = useState(currentFarmerName);
  const [farmName, setFarmName] = useState(currentFarmName || '');
  const [nameError, setNameError] = useState('');
  const [saving, setSaving] = useState(false);
  const { t } = useTranslation();
  
  const handleSave = async () => {
    // Validate farmer name (must have 2+ words)
    const validation = validateFullName(farmerName);
    if (!validation.isValid) {
      setNameError(validation.error || '');
      return;
    }
    
    setSaving(true);
    try {
      await onSave(farmerName.trim(), farmName.trim());
      toast.success(t.profileUpdated);
      onClose();
    } catch (error) {
      toast.error(t.profileUpdateFailed);
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.editProfile}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.farmerName} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
            {nameError && (
              <p className="text-sm text-red-600 mt-1">{nameError}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              {t.farmName} <span className="text-gray-400">({t.optional})</span>
            </label>
            <input
              type="text"
              value={farmName}
              onChange={(e) => setFarmName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              autoComplete="off"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            {t.cancel}
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? t.saving : t.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

### 5. Simplified Settings Section

**Changes:** Remove dark mode, sound, and other non-essential settings

```typescript
// Keep only these settings:
const essentialSettings = [
  {
    icon: <Globe className="w-4 h-4" />,
    label: t.language,
    component: <LanguageSelector />
  },
  {
    icon: <Calendar className="w-4 h-4" />,
    label: t.calendarSystem,
    component: <CalendarSelector />
  },
  {
    icon: <Bell className="w-4 h-4" />,
    label: t.notifications,
    component: <NotificationToggle />
  }
];

// Remove these settings:
// - Dark mode
// - Sound
// - Font size
// - Accessibility
// - Developer options
// - Experimental features
```

### 6. Logout Confirmation Dialog (NEW)

```typescript
const LogoutConfirmDialog: React.FC<{
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, onConfirm, onCancel }) => {
  const { t } = useTranslation();
  
  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t.logoutConfirmation}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.logoutDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>
            {t.cancel}
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className="bg-red-600">
            {t.logout}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

## Data Models

### Profile Data (Existing)

```typescript
interface UserProfile {
  id: string;
  phone: string;
  farmer_name: string;
  farm_name: string | null;
  calendar_preference: 'gregorian' | 'ethiopian';
  created_at: string;
  updated_at: string;
}
```

### Farm Statistics (NEW)

```typescript
interface FarmStats {
  totalAnimals: number;
  milkLast30Days: number;
  activeListings: number;
}

// Fetched via custom hook
const useFarmStats = (userId: string) => {
  return useQuery({
    queryKey: ['farmStats', userId],
    queryFn: async () => {
      // Count animals
      const { count: animalCount } = await supabase
        .from('animals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_active', true);
      
      // Sum milk last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: milkData } = await supabase
        .from('milk_production')
        .select('liters')
        .eq('user_id', userId)
        .gte('recorded_at', thirtyDaysAgo.toISOString());
      
      const totalMilk = milkData?.reduce((sum, record) => 
        sum + (Number(record.liters) || 0), 0
      ) || 0;
      
      // Count active listings
      const { count: listingCount } = await supabase
        .from('market_listings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('status', 'active');
      
      return {
        totalAnimals: animalCount || 0,
        milkLast30Days: Math.round(totalMilk * 10) / 10, // Round to 1 decimal
        activeListings: listingCount || 0
      };
    },
    enabled: !!userId
  });
};
```

## Error Handling

### Profile Load Errors

```typescript
if (profileError) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">
            {t.profileLoadError}
          </h2>
          <p className="text-gray-600 mb-4">
            {t.profileLoadErrorDescription}
          </p>
          <Button onClick={() => refetch()}>
            {t.retry}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Edit Profile Errors

```typescript
try {
  await updateProfile(farmerName, farmName);
  toast.success(
    language === 'am' 
      ? 'መገለጫ ተዘምኗል' 
      : 'Profile updated successfully'
  );
} catch (error) {
  if (error.message?.includes('network')) {
    toast.error(
      language === 'am'
        ? 'የኢንተርኔት ግንኙነት ችግር'
        : 'Network error. Please check your connection.'
    );
  } else {
    toast.error(
      language === 'am'
        ? 'መገለጫ ማዘመን አልተቻለም'
        : 'Failed to update profile'
    );
  }
}
```

## Testing Strategy

### Unit Tests

1. **useFarmStats Hook**
   - Test with user who has animals
   - Test with user who has no animals
   - Test milk calculation for last 30 days
   - Test active listings count

2. **validateFullName Function**
   - Test with valid full name (2+ words)
   - Test with single word (should fail)
   - Test with Amharic names
   - Test with empty string

3. **EditProfileModal Component**
   - Test validation on save
   - Test successful save
   - Test failed save
   - Test cancel action

### Integration Tests

1. **Profile Page Load**
   - Test profile loads with real data
   - Test statistics display correctly
   - Test quick actions navigate correctly
   - Test edit modal opens and saves

2. **Offline Behavior**
   - Test profile loads from cache when offline
   - Test edit disabled when offline
   - Test data refreshes when back online

### E2E Tests

1. **Complete Profile Flow**
   - Login → View profile → See real data
   - Edit profile → Save → See updated data
   - Tap quick action → Navigate to correct page
   - Logout → Confirm → Return to login

## Translation Keys

### New Keys to Add

```json
// en.json
{
  "profile": {
    "farmStatistics": "Farm Statistics",
    "animals": "Animals",
    "milkLast30Days": "Milk (30 days)",
    "listings": "Listings",
    "quickActions": "Quick Actions",
    "registerAnimal": "Register Animal",
    "recordMilk": "Record Milk",
    "createListing": "Create Listing",
    "pleaseRegisterAnimalsFirst": "Please register animals first",
    "editProfile": "Edit Profile",
    "farmerName": "Farmer Name",
    "farmName": "Farm Name",
    "optional": "optional",
    "save": "Save",
    "saving": "Saving...",
    "cancel": "Cancel",
    "profileUpdated": "Profile updated successfully",
    "profileUpdateFailed": "Failed to update profile",
    "profileLoadError": "Unable to load profile",
    "profileLoadErrorDescription": "Please check your connection and try again",
    "retry": "Retry",
    "logoutConfirmation": "Are you sure you want to logout?",
    "logoutDescription": "You will need to login again to access your account"
  }
}

// am.json
{
  "profile": {
    "farmStatistics": "የእርሻ ስታቲስቲክስ",
    "animals": "እንስሳት",
    "milkLast30Days": "ወተት (30 ቀናት)",
    "listings": "ማስታወቂያዎች",
    "quickActions": "ፈጣን እርምጃዎች",
    "registerAnimal": "እንስሳ ይመዝግቡ",
    "recordMilk": "ወተት ይመዝግቡ",
    "createListing": "ማስታወቂያ ይፍጠሩ",
    "pleaseRegisterAnimalsFirst": "መጀመሪያ እንስሳ ይመዝግቡ",
    "editProfile": "መገለጫን ያርትዑ",
    "farmerName": "የገበሬ ስም",
    "farmName": "የእርሻ ስም",
    "optional": "አማራጭ",
    "save": "አስቀምጥ",
    "saving": "በማስቀመጥ ላይ...",
    "cancel": "ይቅር",
    "profileUpdated": "መገለጫ ተዘምኗል",
    "profileUpdateFailed": "መገለጫ ማዘመን አልተቻለም",
    "profileLoadError": "መገለጫ መጫን አልተቻለም",
    "profileLoadErrorDescription": "እባክዎ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ",
    "retry": "እንደገና ይሞክሩ",
    "logoutConfirmation": "መውጣት ይፈልጋሉ?",
    "logoutDescription": "መለያዎን ለመድረስ እንደገና መግባት ያስፈልግዎታል"
  }
}
```

## Implementation Notes

1. **Keep It Simple:** No profile photos, no complex permissions, no social features
2. **Farmer-Focused:** Statistics and actions that matter to livestock farmers
3. **Mobile-First:** Large touch targets (44px+), easy navigation
4. **Offline-Ready:** Cache profile data, show offline indicators
5. **Bilingual:** All new text in both Amharic and English
6. **Performance:** Lazy load statistics, use skeleton loaders
7. **Validation:** Reuse existing name validation from onboarding

## Performance Considerations

1. **Statistics Caching:** Cache farm stats for 5 minutes to reduce database queries
2. **Lazy Loading:** Load statistics after profile loads (not blocking)
3. **Optimistic Updates:** Update UI immediately when editing, rollback on error
4. **Skeleton Loaders:** Show loading states instead of spinners

## Accessibility

1. **Touch Targets:** All buttons minimum 44x44px
2. **Color Contrast:** Ensure text meets WCAG AA standards
3. **Screen Readers:** Add aria-labels to icon-only buttons
4. **Keyboard Navigation:** Ensure modal can be navigated with keyboard

