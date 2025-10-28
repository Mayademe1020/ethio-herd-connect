# ✅ Farm Name Onboarding - COMPLETE

## What Was Added

Added a farm name collection step that appears after first login, before users can access the app.

---

## 🎯 User Flow

### New User Journey:
```
1. Login with phone + PIN
   ↓
2. Redirected to /onboarding
   ↓
3. Enter farm name (e.g., "የአበበ እርሻ" / "Abebe's Farm")
   ↓
4. Click Continue
   ↓
5. Redirected to home page
   ↓
6. Can now use all features
```

### Returning User Journey:
```
1. Login with phone + PIN
   ↓
2. Profile already complete
   ↓
3. Directly to home page
```

---

## 📁 Files Created

### 1. Database Migration
**File:** `supabase/migrations/20251027000000_add_user_profiles.sql`

**What it does:**
- Creates `profiles` table with columns:
  - `id` (UUID, references auth.users)
  - `phone` (TEXT, Ethiopian phone number)
  - `farm_name` (TEXT, user's farm name)
  - `created_at` (TIMESTAMPTZ)
  - `updated_at` (TIMESTAMPTZ)
- Adds RLS policies (users can only see/edit their own profile)
- Adds indexes for performance
- Adds updated_at trigger

### 2. Onboarding Page
**File:** `src/pages/Onboarding.tsx`

**Features:**
- Bilingual UI (Amharic + English)
- Farm name input field
- Large touch targets (48px+ height)
- Enter key support
- Loading states
- Success/error toasts
- Auto-redirect to home after completion

### 3. Profile Hook
**File:** `src/hooks/useProfile.tsx`

**What it does:**
- Fetches user profile from database
- Checks if profile is complete (has farm_name)
- Returns profile data and loading states
- Used by ProtectedRoute to check onboarding status

---

## 🔧 Files Modified

### 1. AppMVP.tsx
**Changes:**
- Added `/onboarding` route (public, no protection)
- Imported Onboarding component

### 2. ProtectedRoute.tsx
**Changes:**
- Added profile completion check
- Redirects to `/onboarding` if profile incomplete
- Shows loading state while checking profile
- Prevents redirect loop (doesn't redirect if already on onboarding page)

---

## 🧪 How to Test

### 1. Apply Database Migration
```bash
# If using Supabase CLI:
npx supabase db push

# Or manually run the SQL in Supabase Dashboard:
# Go to SQL Editor → New Query → Paste migration content → Run
```

### 2. Test New User Flow
```
1. Logout if currently logged in
2. Login with NEW phone number:
   Phone: 922334455
   PIN: 1234
3. Expected: Redirected to /onboarding
4. Enter farm name: "Test Farm"
5. Click Continue
6. Expected: Redirected to home page
7. Try to access any page (e.g., /my-animals)
8. Expected: Works! No redirect to onboarding
```

### 3. Test Existing User Flow
```
1. Login with EXISTING phone number:
   Phone: 911234567
   PIN: 1234
2. Expected: Directly to home page (no onboarding)
```

### 4. Test Direct URL Access
```
1. While logged in, try to go to /onboarding
2. Expected: Can access it (no redirect)
3. Can update farm name if desired
```

---

## 🎨 Onboarding Page UI

```
┌─────────────────────────────────┐
│          🌾                     │
│   እንኳን ደህና መጡ!                 │
│   Welcome to Ethio Herd Connect │
│                                 │
│   የእርሻ ስም / Farm Name           │
│   ┌───────────────────────┐    │
│   │ ለምሳሌ: የአበበ እርሻ      │    │
│   └───────────────────────┘    │
│   ይህ ስም በገበያ ላይ ይታያል         │
│   This name will be shown in    │
│   marketplace                   │
│                                 │
│   ┌───────────────────────┐    │
│   │   ✓ ቀጥል / Continue    │    │
│   └───────────────────────┘    │
│                                 │
│   💡 ስሙን በኋላ መቀየር ይችላሉ       │
│   You can change this name      │
│   later in settings             │
└─────────────────────────────────┘
```

---

## 📊 Database Schema

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  phone TEXT,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example Data:**
```
id: e8f552a9-1384-44d9-9022-4bc58b69edbf
phone: 911234567
farm_name: የአበበ እርሻ
created_at: 2025-10-27 10:30:00
updated_at: 2025-10-27 10:30:00
```

---

## 🔐 Security (RLS Policies)

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

---

## 🚀 Future Enhancements

### Phase 2 (When building feed personalization):
- Add `species` field (cattle/goat/sheep)
- Add `herd_size` field (1-5, 6-20, 21-50, 51-100, 100+)
- Add `location` field (for radius matching)
- Use this data to personalize marketplace feed

### Phase 3 (Optional):
- Add profile photo
- Add farm description
- Add verification badge
- Add seller rating

---

## ✅ Status

**Database Migration:** ✅ Created (needs to be applied)  
**Onboarding Page:** ✅ Complete  
**Profile Hook:** ✅ Complete  
**Protected Route:** ✅ Updated  
**App Routing:** ✅ Updated  
**Testing:** ⏳ Ready to test after migration

---

## 📝 Next Steps

1. **Apply the database migration** (see testing section above)
2. **Test new user flow** (create account, enter farm name)
3. **Test existing user flow** (login, skip onboarding)
4. **Verify farm name appears in marketplace** (when creating listings)

---

**Created:** October 27, 2025  
**Feature:** Farm name onboarding  
**Status:** ✅ Complete, ready to test  
**Migration Required:** Yes (20251027000000_add_user_profiles.sql)
