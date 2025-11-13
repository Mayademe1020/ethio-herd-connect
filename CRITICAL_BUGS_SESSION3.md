# Critical Bugs Found - Session 3

## 🔥 ISSUE 1: 406 Errors Still Present

**Error:**
```
GET .../farm_profiles?select=farm_prefix%2Cfarm_name&user_id=eq... 406 (Not Acceptable)
GET .../animals?select=id&animal_id=eq.FEDBF-GOA-002 406 (Not Acceptable)
```

**Root Cause:** Database columns not added yet

**Fix:** Run SQL scripts in Supabase NOW

---

## 🔥 ISSUE 2: Image Upload Not Visible

**Problem:** When registering a goat, uploaded image is not responding or visible

**Likely Causes:**
- Image preview not rendering after compression
- State not updating after upload
- CSS/display issue

**Files to Check:**
- `src/components/AnimalPhotoUpload.tsx`
- `src/pages/RegisterAnimal.tsx`

---

## 🔥 ISSUE 3: Duplicate Milk Recording Prevention

**Business Requirement:**
- Animal can only give milk ONCE per session (morning/evening)
- If user tries to record again for same animal + same session + same date:
  - Show error: "Already recorded for this session"
  - Allow user to EDIT the existing record instead
  - Allow user to set to 0 if it was a mistake

**Current State:** No duplicate prevention exists

**Needs:**
1. Database constraint or check
2. UI validation before submit
3. Edit functionality for existing records

---

## 🔴 ISSUE 4: Missing Translation Keys

**Errors:**
```
Translation missing for key: sync.online
```

**Fix:** Add missing keys to translation files

---

## IMMEDIATE ACTION PLAN

### Step 1: Fix 406 Errors (DO THIS FIRST)

Go to Supabase SQL Editor and run these scripts ONE AT A TIME:

```sql
-- Script 1: Add animal_id column
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;
```

```sql
-- Script 2: Add status column
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

UPDATE animals SET status = 'active' WHERE status IS NULL;
```

```sql
-- Script 3: Add date columns
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;
```

### Step 2: Fix Translation Keys

I'll add the missing translation keys.

### Step 3: Fix Image Upload Issue

I'll investigate and fix the photo upload component.

### Step 4: Add Duplicate Prevention

I'll create a spec for the duplicate milk recording prevention feature.

---

## Priority Order

1. **CRITICAL** - Fix 406 errors (blocks all functionality)
2. **HIGH** - Fix image upload (user experience)
3. **HIGH** - Add duplicate prevention (data integrity)
4. **LOW** - Fix translation keys (cosmetic)

---

## What You Need to Do RIGHT NOW

1. Open Supabase Dashboard
2. Go to SQL Editor
3. Run the 3 SQL scripts above (one at a time)
4. Tell me when done
5. Then I'll fix the other issues

Ready?
