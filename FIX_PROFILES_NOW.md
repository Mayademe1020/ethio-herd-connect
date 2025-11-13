# 🚨 FIX PROFILES TABLE NOW

## The Problem

Your app is showing this error:
```
404 Error: /rest/v1/profiles
Onboarding error
```

**This means the `profiles` table doesn't exist in your Supabase database yet.**

---

## ✅ The Solution (5 Minutes)

The migration file already exists at:
```
supabase/migrations/20251027000000_add_user_profiles.sql
```

You just need to apply it to your Supabase database.

---

## 🚀 Quick Fix Steps

### Option 1: Apply via Supabase Dashboard (EASIEST)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in left sidebar
   - Click "New Query"

3. **Copy and Paste This SQL:**

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  farmer_name TEXT,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Add index
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON profiles(phone);
```

4. **Click "Run"** (bottom right)

5. **Verify Success**
   - You should see "Success. No rows returned"
   - Go to "Table Editor" in left sidebar
   - You should now see "profiles" table

---

### Option 2: Apply via Supabase CLI (If you have it installed)

```bash
# Make sure you're logged in
supabase login

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
supabase db push
```

---

## ✅ Verify the Fix

### 1. Check Supabase Dashboard
- Go to Table Editor
- Look for "profiles" table
- It should have columns: id, phone, farmer_name, farm_name, created_at, updated_at

### 2. Refresh Your App
- Go back to your app: `http://127.0.0.1:8080`
- Press `Ctrl+Shift+R` (hard refresh)
- Open DevTools (`F12`)
- Check Console

### 3. Expected Results
**Before Fix:**
```
❌ 404 Error: /rest/v1/profiles
❌ Onboarding error
```

**After Fix:**
```
✅ No 404 errors
✅ Onboarding works
✅ Profile data loads
```

---

## 🧪 Test the Fix

1. **Refresh the app**
2. **Check console** - should be no 404 errors
3. **Try onboarding flow:**
   - Enter farm name
   - Submit
   - Should complete successfully
4. **Check profile page** - should load without errors

---

## 🚨 If It Still Doesn't Work

### Check 1: Table Exists?
- Go to Supabase Dashboard → Table Editor
- Look for "profiles" table
- If not there, run the SQL again

### Check 2: RLS Policies?
- Go to Supabase Dashboard → Authentication → Policies
- Look for "profiles" table policies
- Should see 3 policies (SELECT, INSERT, UPDATE)

### Check 3: User Authenticated?
- Check console for auth errors
- Verify user is logged in
- Try logging out and back in

### Check 4: Correct Project?
- Verify you're looking at the right Supabase project
- Check `.env` file has correct `VITE_SUPABASE_URL`

---

## 📊 What This Migration Does

```
Creates:
✅ profiles table with user data
✅ RLS policies for security
✅ Index on phone for performance
✅ Foreign key to auth.users

Allows:
✅ Users to create their profile
✅ Users to read their own profile
✅ Users to update their own profile

Prevents:
❌ Users from seeing other profiles
❌ Unauthorized access
❌ Data leaks
```

---

## 🎯 After Fixing

Once the profiles table is created:

1. ✅ Refresh app
2. ✅ Check console (no 404 errors)
3. ✅ Test onboarding
4. ✅ Continue with animal registration testing
5. ✅ Move on to fixing translation bug (BUG-002)

---

## 📞 Quick Reference

**Supabase Dashboard:** https://supabase.com/dashboard
**SQL to Run:** See "Option 1" above
**Expected Result:** profiles table created, no 404 errors
**Next Step:** Fix translation bug in `CRITICAL_BUGS_FIX_PLAN.md`

---

## ✨ You're Almost There!

This is a common issue - the migration just needs to be applied to your database. Once you run the SQL, the error will disappear and onboarding will work perfectly!

**Estimated Time:** 5 minutes
**Difficulty:** Easy
**Impact:** Fixes critical bug blocking onboarding

🚀 **Go fix it now!**
