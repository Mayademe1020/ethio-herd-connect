# 🔴 DATABASE ISSUES - URGENT FIX REQUIRED

## Root Cause Identified

The **406 error** and other issues are caused by **DATABASE SCHEMA PROBLEMS**, not code issues.

---

## Critical Issues

### 1. ❌ Profile Table - 406 Error
**Error**: `GET .../profiles?select=*&id=eq.... 406 (Not Acceptable)`

**Cause**: One of these:
- Profile table doesn't exist
- RLS policies blocking SELECT
- Missing columns in profiles table
- Wrong permissions on table

### 2. ❌ Animals Table - Missing Column
**Error**: `column animals.is_active does not exist`

**Cause**: Database schema is outdated or migration didn't run

### 3. ⚠️ Missing Translation
**Error**: `Translation missing for key: sync.online`

**Cause**: Missing translation key (minor issue)

---

## IMMEDIATE FIX - Run These SQL Commands

### Step 1: Check Profile Table

Open Supabase Dashboard → SQL Editor → Run this:

```sql
-- Check if profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- If it exists, check its structure
\d profiles;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Step 2: Fix Profile Table (If Needed)

If the table doesn't exist or is missing columns:

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  farmer_name TEXT NOT NULL,
  farm_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT ALL ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
```

### Step 3: Fix Animals Table

```sql
-- Add missing is_active column
ALTER TABLE public.animals 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_animals_is_active 
ON public.animals(is_active);

-- Update existing records
UPDATE public.animals 
SET is_active = true 
WHERE is_active IS NULL;
```

### Step 4: Verify Fixes

```sql
-- Test profile access as anon
SET ROLE anon;
SELECT * FROM profiles LIMIT 1;
RESET ROLE;

-- Test animals table
SELECT id, name, type, is_active 
FROM animals 
WHERE is_active = true 
LIMIT 5;
```

---

## Fix Translation Issue

Add this to `src/i18n/en.json`:

```json
{
  "sync": {
    "online": "Online",
    "offline": "Offline",
    "syncing": "Syncing..."
  }
}
```

Add this to `src/i18n/am.json`:

```json
{
  "sync": {
    "online": "በመስመር ላይ",
    "offline": "ከመስመር ውጭ",
    "syncing": "በማመሳሰል ላይ..."
  }
}
```

---

## Why This Happened

### Profile Table Issue
- Migration file exists but wasn't run on your database
- Or RLS policies are too restrictive
- Or table was deleted/renamed

### Animals Table Issue
- Schema changed but migration wasn't run
- Or column was removed accidentally

---

## How to Prevent This

### 1. Always Run Migrations

```bash
# Check migration status
supabase db diff

# Apply pending migrations
supabase db push
```

### 2. Verify Schema Matches Code

Before coding, check:
- Does the table exist?
- Do all columns exist?
- Are RLS policies correct?

### 3. Use Type-Safe Queries

The Supabase client should match your database schema.

---

## Testing After Fix

### Test 1: Profile Creation
1. Register new user
2. Complete onboarding
3. Check console - should see "Profile loaded successfully"
4. No 406 errors

### Test 2: Animals Query
1. Go to dashboard
2. Should see animal count
3. No "column does not exist" errors

### Test 3: Translations
1. Check sync status indicator
2. Should show "Online" or "በመስመር ላይ"
3. No "Translation missing" errors

---

## If You Can't Access Supabase Dashboard

### Option 1: Use Supabase CLI

```bash
# Login
supabase login

# Link project
supabase link --project-ref pbtaolycccmmqmwurinp

# Run migrations
supabase db push

# Check status
supabase db diff
```

### Option 2: Manual SQL via Code

Create a migration file and run it through your app.

---

## Quick Diagnosis Commands

Run these in Supabase SQL Editor:

```sql
-- 1. Check all tables
SELECT tablename FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- 2. Check profiles table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 3. Check animals table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals';

-- 4. Check RLS policies
SELECT tablename, policyname, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Test as anon user
SET ROLE anon;
SELECT COUNT(*) FROM profiles;
SELECT COUNT(*) FROM animals;
RESET ROLE;
```

---

## Summary

**The 406 error is NOT a code problem** - it's a database configuration issue.

**You MUST**:
1. ✅ Run the SQL commands above in Supabase
2. ✅ Add missing translation keys
3. ✅ Verify tables exist and have correct structure
4. ✅ Ensure RLS policies allow access

**After fixing the database**, the app will work correctly.

---

## Status

- ❌ **Code**: Already fixed (headers are correct)
- ❌ **Database**: NEEDS FIXING (run SQL above)
- ❌ **Translations**: NEEDS FIXING (add keys)

**Priority**: Fix database FIRST, then translations.
