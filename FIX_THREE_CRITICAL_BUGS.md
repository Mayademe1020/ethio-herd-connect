# Fix Three Critical Bugs - Action Plan

## Bug Summary

1. **406 Errors** - Database columns missing
2. **Photo Preview Not Visible** - Image upload working but not displaying
3. **Duplicate Milk Recording** - No prevention for recording same animal twice in one session

---

## 🔥 BUG 1: 406 Errors (BLOCKING)

### Problem
```
GET .../farm_profiles?select=farm_prefix%2Cfarm_name 406 (Not Acceptable)
GET .../animals?select=id&animal_id=eq.FEDBF-GOA-002 406 (Not Acceptable)
```

### Root Cause
Database columns don't exist yet in your Supabase database.

### Fix - YOU MUST DO THIS NOW

Open Supabase Dashboard → SQL Editor → Run these 3 scripts:

**Script 1:**
```sql
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;
```

**Script 2:**
```sql
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

UPDATE animals SET status = 'active' WHERE status IS NULL;
```

**Script 3:**
```sql
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;
```

---

## 🔥 BUG 2: Photo Preview Not Visible

### Problem
- Image compresses successfully (logs show: "Image compressed to target size")
- But preview doesn't show on screen
- User can't see what they uploaded

### Root Cause Analysis
Looking at the code:
1. `handlePhotoSelect` compresses image ✅
2. Creates preview with `FileReader` ✅  
3. Sets `photoPreview` state ✅
4. UI renders `<img src={photoPreview}>` ✅

**Possible Issues:**
- State update timing issue
- Image data URL not rendering
- CSS hiding the image
- React not re-rendering

### Fix
I'll add better state management and force re-render after image load.

---

## 🔥 BUG 3: Duplicate Milk Recording Prevention

### Business Requirement
- An animal can only give milk ONCE per session (morning/evening) per day
- If user tries to record again:
  - Show error: "Already recorded for this session"
  - Offer to EDIT the existing record
  - Allow changing amount (including to 0 if mistake)

### Current State
NO duplicate prevention exists.

### Implementation Plan

#### Database Level
Add unique constraint:
```sql
CREATE UNIQUE INDEX idx_milk_production_unique_session 
  ON milk_production(animal_id, date, session);
```

#### Application Level
1. Before saving, check if record exists
2. If exists, show modal: "Already recorded. Edit instead?"
3. If user confirms, navigate to edit mode
4. Update existing record instead of creating new

---

## Priority & Execution Order

### IMMEDIATE (Do Right Now)
1. **YOU**: Run the 3 SQL scripts to fix 406 errors
2. **ME**: Fix photo preview rendering issue
3. **ME**: Add duplicate prevention

### After Fixes
1. Test animal registration with photo
2. Test milk recording duplicate prevention
3. Verify 406 errors are gone

---

## What I'll Fix Now

1. Photo preview rendering
2. Duplicate milk recording prevention

## What You Must Do

1. Run the 3 SQL scripts in Supabase
2. Tell me when done
3. Test the app

Ready to proceed?
