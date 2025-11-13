# Fix Animal ID Display & 406 Errors - URGENT

## Problem Summary

1. **Animal ID IS being generated** ✅ (backend works)
2. **Animal ID NOT showing to user** ❌ (406 error blocks it)
3. **406 errors** ❌ (database columns missing)

## Root Cause

The console shows:
```
GET .../farm_profiles?select=farm_prefix%2Cfarm_name 406 (Not Acceptable)
GET .../animals?select=id&animal_id=eq.FEDBF-SHP-001 406 (Not Acceptable)
```

This means:
- Animal ID generator tries to get `farm_prefix` and `farm_name` → **406 error**
- After registration, tries to fetch `animal_id` → **406 error**
- Database columns don't exist yet

## The Flow (What Should Happen)

1. User registers animal
2. System generates ID like `FEDBF-SHP-001`
3. Saves to database with `animal_id` column
4. Fetches back to show user
5. User sees: "Animal registered - ID: FEDBF-SHP-001"

## What's Actually Happening

1. User registers animal ✅
2. System tries to get farm prefix → **406 ERROR** ❌
3. Falls back to simple ID generation ⚠️
4. Saves to database (but `animal_id` column missing) ❌
5. Tries to fetch animal_id → **406 ERROR** ❌
6. User sees generic success message (no ID shown) ❌

---

## SOLUTION: Run SQL Scripts NOW

You MUST run these 3 SQL scripts in Supabase to fix everything:

### Step 1: Open Supabase Dashboard
- Go to your Supabase project
- Click "SQL Editor" in left sidebar
- Click "New Query"

### Step 2: Run Script 1 - Add animal_id column

```sql
-- Add animal_id column to animals table
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

-- Create unique index for animal_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Verify
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'animals' AND column_name = 'animal_id';
```

**Expected Result:** Should show `animal_id | text`

### Step 3: Run Script 2 - Add status column

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

**Expected Result:** Should show `status | text`

### Step 4: Run Script 3 - Add date columns

```sql
-- Add date columns for status tracking
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

**Expected Result:** Should show 3 rows with timestamp columns

### Step 5: Verify farm_profiles columns exist

```sql
-- Check if farm_profiles table has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'farm_profiles' 
  AND column_name IN ('farm_prefix', 'farm_name');
```

**Expected Result:** Should show 2 rows

**If NOT showing 2 rows, run this:**

```sql
-- Add missing columns to farm_profiles
ALTER TABLE farm_profiles
  ADD COLUMN IF NOT EXISTS farm_prefix TEXT,
  ADD COLUMN IF NOT EXISTS farm_name TEXT;
```

---

## After Running SQL Scripts

### Test 1: Register a New Animal

1. Refresh browser (Ctrl+Shift+R)
2. Go to "Register Animal"
3. Select: Sheep → Female → Awassi
4. Enter name: "Chaltu"
5. Click "Register"

**VERIFY:**
- ✅ No 406 errors in console
- ✅ Success message shows: "Animal registered - ID: XXXX-SHP-001"
- ✅ Animal ID is visible

### Test 2: Check Animal ID Format

The ID should look like:
- `FEDBF-SHP-001` (Sheep #1)
- `FEDBF-GOA-001` (Goat #1)
- `FEDBF-COW-001` (Cow #1)

Format: `FARM_PREFIX-TYPE_CODE-SEQUENCE_NUMBER`

### Test 3: Record Milk

1. Go to "Record Milk"
2. Select the animal you just registered
3. Enter amount
4. Submit

**VERIFY:**
- ✅ No 406 errors
- ✅ Milk recorded successfully

---

## Understanding the Animal ID System

### Farm Prefix
- Comes from your farm profile's `farm_prefix` field
- Or generated from `farm_name`
- Example: "Abebe Farm" → "ABEBE" or "FEDBF"

### Type Codes
- COW = Cow
- BUL = Bull
- GOA = Goat
- SHP = Sheep
- EWE = Ewe (female sheep)
- RAM = Ram (male sheep)

### Sequence Number
- Auto-increments per farm + type
- Padded to 3 digits: 001, 002, 003...
- Unique per farm

### Cross-Reference Usage
The animal_id is used to:
- Link milk production records
- Link marketplace listings
- Track animal history
- Generate reports
- Professional identification

---

## Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Ran Script 1 (animal_id column)
- [ ] Ran Script 2 (status column)
- [ ] Ran Script 3 (date columns)
- [ ] Verified farm_profiles columns
- [ ] Refreshed browser
- [ ] Registered test animal
- [ ] Saw Animal ID in success message
- [ ] No 406 errors in console

---

## If Still Not Working

Tell me:
1. Which SQL script failed? (copy error message)
2. What does the verification query show?
3. Screenshot of console errors after refresh

---

**START WITH STEP 1 NOW!** 

The animal ID system is already implemented and working - it just needs the database columns to exist!
