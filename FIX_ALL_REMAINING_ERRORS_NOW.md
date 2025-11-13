# Fix All Remaining Errors - Complete Guide

## Current Status

✅ **farm_profiles** - Columns exist (farm_name, farm_prefix)
🔴 **animals table** - Missing columns (causing 406 errors)
🔴 **marketplace** - 400 errors (bad request)
🔴 **Translation** - Missing sync.online key

---

## Error Analysis

### 1. 406 Errors (Animals Table)

```
GET .../farm_profiles?select=farm_prefix%2Cfarm_name 406 (Not Acceptable)
GET .../animals?select=id&animal_id=eq.FEDBF-GOA-003 406 (Not Acceptable)
```

**Problem:** `animals` table missing `animal_id` column

**Why farm_profiles also shows 406:** RLS policies might be blocking access

### 2. 400 Errors (Marketplace)

```
GET .../market_listings?select=...&animal:animals(...) 400 (Bad Request)
```

**Problem:** Query syntax error or missing columns in animals table

### 3. Translation Missing

```
Translation missing for key: sync.online
```

**Problem:** Component trying to use key that exists but not loading properly

---

## SOLUTION: Run These SQL Scripts

### Script 1: Add animal_id to animals table

```sql
-- Add animal_id column
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Verify
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals' AND column_name = 'animal_id';
```

**Expected Result:** `animal_id | text | YES`

### Script 2: Add status column

```sql
-- Add status column
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Create index
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

-- Update existing records
UPDATE animals SET status = 'active' WHERE status IS NULL;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' AND column_name = 'status';
```

**Expected Result:** `status | text`

### Script 3: Add date columns

```sql
-- Add date tracking columns
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('sold_date', 'deceased_date', 'transferred_date');
```

**Expected Result:** 3 rows with timestamp columns

### Script 4: Check RLS policies on farm_profiles

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'farm_profiles';

-- If rowsecurity is true, check policies
SELECT * FROM pg_policies WHERE tablename = 'farm_profiles';
```

If you see policies that might be blocking, we may need to adjust them.

### Script 5: Final verification

```sql
-- Verify all animals columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('id', 'animal_id', 'status', 'name', 'type', 'subtype', 'photo_url', 'sold_date', 'deceased_date', 'transferred_date')
ORDER BY column_name;
```

**Expected:** Should show at least 10 rows

---

## After Running SQL Scripts

### Test 1: Refresh and Check Console

1. Hard refresh browser (Ctrl+Shift+R)
2. Open console (F12)
3. Clear console
4. Navigate around the app

**VERIFY:**
- ✅ No 406 errors for farm_profiles
- ✅ No 406 errors for animals
- ⚠️ 400 errors for marketplace (we'll fix separately)

### Test 2: Register Animal

1. Go to Register Animal
2. Select Goat → Female → Boer
3. Upload photo
4. Submit

**VERIFY:**
- ✅ Success message shows
- ✅ Animal ID displayed (e.g., "FEDBF-GOA-004")
- ✅ No 406 errors

### Test 3: View My Animals

1. Go to My Animals page
2. Check if animals show with IDs

**VERIFY:**
- ✅ Animals list loads
- ✅ Each animal shows its ID
- ✅ Can click to view details

---

## Requirements You Mentioned

### 1. Animal ID Should Be Visible Everywhere

**Current Implementation:**
- ✅ Shows in success message after registration
- ✅ Stored in database
- ❌ Not showing in animal cards/lists yet
- ❌ Not searchable yet

**What I'll Add:**
1. Display animal ID prominently in animal cards
2. Add search by animal ID
3. Show animal ID in animal detail page
4. Show animal ID in milk recording dropdown

### 2. Animal ID Should Be Searchable

**What I'll Implement:**
- Search bar that accepts animal ID
- Filter animals by ID
- Quick lookup by ID

### 3. Marketplace Privacy

**Requirement:** Animal ID should NOT be mandatory to show to buyers

**Current Status:** Need to check marketplace implementation

**What I'll Do:**
- Make animal ID optional in marketplace listings
- Show animal ID only to seller (owner)
- Buyers see animal type, photos, description (not internal ID)

---

## Next Steps

### Step 1: YOU Run SQL Scripts (5 minutes)

Run Scripts 1-5 above in Supabase SQL Editor

### Step 2: I'll Fix UI Issues (10 minutes)

Once SQL is done, I'll:
1. Add animal ID display to animal cards
2. Add search by animal ID
3. Fix marketplace privacy
4. Fix translation issue

### Step 3: Test Together

We'll verify:
- Animal IDs show everywhere
- Search works
- Marketplace respects privacy
- No more errors

---

## Quick Checklist

- [ ] Run Script 1 (animal_id column)
- [ ] Run Script 2 (status column)
- [ ] Run Script 3 (date columns)
- [ ] Run Script 4 (check RLS)
- [ ] Run Script 5 (verify all)
- [ ] Refresh browser
- [ ] Test animal registration
- [ ] Tell me results

---

## If You See Errors

**406 Still There:**
- Copy the exact error message
- Tell me which table/column
- I'll create specific fix

**400 Marketplace Errors:**
- This is separate issue
- We'll fix after 406 is resolved
- Likely needs marketplace table schema update

**Translation Errors:**
- Not critical
- Will fix with code update
- Doesn't block functionality

---

**START WITH SCRIPT 1 NOW!**

Copy Script 1, paste in Supabase SQL Editor, run it, and tell me the result.
