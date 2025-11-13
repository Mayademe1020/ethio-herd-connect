# 🚨 Critical Bugs - Immediate Fix Plan

## Issues Found During Testing

Based on console errors, we have **1 CRITICAL** and **1 HIGH** priority bug that need immediate attention.

---

## 🔴 BUG-001: Profiles Table Missing (CRITICAL)

### Problem
```
404 Error: /rest/v1/profiles?select=*&id=eq.[user-id]
Onboarding.tsx:51 Onboarding error
```

### Impact
- Users cannot complete onboarding
- Profile data not loading
- Blocks core user flow

### Root Cause
The `profiles` table either:
1. Doesn't exist in Supabase database
2. RLS policies are blocking access
3. Migration hasn't been run

### Fix Steps

#### Option 1: Run Existing Migration
```bash
# Check if migration file exists
ls supabase/migrations/20251027000000_add_user_profiles.sql

# If it exists, apply it to Supabase
# (You'll need to run this via Supabase dashboard or CLI)
```

#### Option 2: Create Profiles Table Manually

1. **Go to Supabase Dashboard**
   - Open your project
   - Go to SQL Editor

2. **Run this SQL:**
```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  farm_name TEXT,
  phone TEXT,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

3. **Verify the fix:**
   - Refresh your app
   - Check console - 404 errors should be gone
   - Try completing onboarding

---

## 🟠 BUG-002: Missing Translation (HIGH)

### Problem
```
Translation missing for key: common.profile
```

### Impact
- Profile section shows untranslated text
- Poor user experience
- Breaks bilingual support

### Fix Steps

#### 1. Update English Translations
Open `src/i18n/en.json` and add:

```json
{
  "common": {
    "profile": "Profile",
    "settings": "Settings",
    "logout": "Logout"
  }
}
```

#### 2. Update Amharic Translations
Open `src/i18n/am.json` and add:

```json
{
  "common": {
    "profile": "መገለጫ",
    "settings": "ቅንብሮች",
    "logout": "ውጣ"
  }
}
```

#### 3. Verify the fix:
- Refresh app
- Check console - translation warning should be gone
- Switch to Amharic - verify profile text shows correctly

---

## 🟡 Medium Priority Fixes (Can Wait)

### BUG-003: Deprecated Meta Tag
**File:** `index.html` or `public/index.html`

**Change:**
```html
<!-- Remove this: -->
<meta name="apple-mobile-web-app-capable" content="yes">

<!-- Add this: -->
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
```

### BUG-004: Missing App Icon
**File:** Create `public/icons/icon-144x144.png`

**Options:**
1. Create a 144x144px PNG icon
2. Or update `manifest.json` to point to existing icon
3. Or use a placeholder icon generator

---

## 🟢 Low Priority (After Exhibition)

### BUG-005 & BUG-006: Preload Issues
**File:** `index.html`

Review and optimize preload links:
```html
<!-- Add crossorigin attribute -->
<link rel="preload" href="/src/main.tsx" as="script" crossorigin>

<!-- Remove unused preloads -->
```

### BUG-007: Browser Extension Errors
**Action:** None - this is a browser extension issue, not our code

---

## ✅ Testing Checklist After Fixes

### After Fixing BUG-001 (Profiles):
- [ ] Refresh app
- [ ] Check console - no 404 errors
- [ ] Complete onboarding flow
- [ ] Verify profile data saves
- [ ] Check profile page loads

### After Fixing BUG-002 (Translation):
- [ ] Refresh app
- [ ] Check console - no translation warnings
- [ ] View profile in English
- [ ] Switch to Amharic
- [ ] Verify profile text in Amharic

### After All Fixes:
- [ ] Run 5-minute smoke test
- [ ] Register an animal
- [ ] Check all core flows work
- [ ] No critical console errors

---

## 🚀 Quick Fix Order

**Do these NOW (15 minutes):**

1. **Fix Profiles Table** (10 min)
   - Go to Supabase Dashboard
   - Run SQL from Option 2 above
   - Verify in console

2. **Fix Translation** (5 min)
   - Edit `src/i18n/en.json`
   - Edit `src/i18n/am.json`
   - Save and refresh

**Do these LATER (30 minutes):**

3. **Fix Meta Tag** (5 min)
4. **Add App Icon** (15 min)
5. **Clean up Preloads** (10 min)

---

## 📊 Expected Results

### Before Fixes:
```
Console Errors:
❌ 404 - profiles table (CRITICAL)
❌ Translation missing (HIGH)
⚠️  Deprecated meta tag (MEDIUM)
⚠️  Missing icon (MEDIUM)
⚠️  Preload warnings (LOW)
```

### After Critical Fixes:
```
Console Errors:
✅ No 404 errors
✅ No translation warnings
⚠️  Deprecated meta tag (can wait)
⚠️  Missing icon (can wait)
⚠️  Preload warnings (can wait)
```

### After All Fixes:
```
Console Errors:
✅ Clean console!
✅ No errors or warnings
✅ Ready for exhibition
```

---

## 🎯 Success Criteria

**App is exhibition-ready when:**
- ✅ No 404 errors in console
- ✅ No translation warnings
- ✅ Onboarding completes successfully
- ✅ Profile data loads
- ✅ All core flows work
- ✅ Both languages work

---

## 📞 Need Help?

### If profiles table fix doesn't work:
1. Check Supabase logs for errors
2. Verify user is authenticated
3. Check RLS policies are correct
4. Try creating profile manually in Supabase dashboard

### If translation fix doesn't work:
1. Check file paths are correct
2. Verify JSON syntax is valid
3. Clear browser cache
4. Check translation hook is working

---

## 🎉 Next Steps After Fixes

1. ✅ Fix critical bugs (above)
2. ✅ Refresh app and verify
3. ✅ Run 5-minute smoke test
4. ✅ Continue with animal registration testing
5. ✅ Document any new bugs found

**You're doing great! These are normal issues found during testing.** 🚀
