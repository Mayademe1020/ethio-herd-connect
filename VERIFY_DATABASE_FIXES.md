# Database Fixes Verification Guide

## What We Fixed Last Session

✅ **22 localization test failures** - Updated test expectations
✅ **8 TypeScript errors** - Updated Supabase types  
✅ **406 database errors** - Provided SQL scripts to add missing columns

## Current Status

🟡 **farm_profiles** - Columns added successfully (confirmed)
🟡 **animals table** - Needs verification

---

## Step 1: Verify Animals Table Columns

Run this SQL in your Supabase SQL Editor:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals' 
  AND column_name IN ('animal_id', 'status', 'sold_date', 'deceased_date', 'transferred_date')
ORDER BY column_name;
```

### Expected Result:
You should see 5 rows:
- `animal_id` - text
- `deceased_date` - timestamp with time zone
- `sold_date` - timestamp with time zone  
- `status` - text
- `transferred_date` - timestamp with time zone

---

## Step 2: Test the Application

### 2.1 Refresh Your Browser
- Press `Ctrl+Shift+R` (hard refresh)
- Open DevTools Console (F12)

### 2.2 Test Animal Registration
1. Navigate to Register Animal page
2. Fill out the form
3. Submit
4. **Check console** - Should see NO 406 errors

### 2.3 Test Milk Recording
1. Navigate to Record Milk page
2. Select an animal
3. Enter milk amount
4. Submit
5. **Check console** - Should see NO 406 errors

---

## Step 3: Run Tests

```bash
npm test
```

Check if the test count improved from last session.

---

## What to Report Back

Please tell me:

1. **Animals table verification result** - Did you see all 5 columns?
2. **406 errors gone?** - Check browser console
3. **Any new errors?** - Share what you see
4. **Test results** - How many tests pass/fail now?

---

## If Animals Table Columns Are Missing

If the verification query shows missing columns, run these scripts one at a time:

### Script 1: Add animal_id
```sql
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;
```

### Script 2: Add status
```sql
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

UPDATE animals SET status = 'active' WHERE status IS NULL;
```

### Script 3: Add date columns
```sql
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;
```

---

## Next Steps After Verification

Once the database is confirmed working:

1. **Fix remaining test failures** (53 tests still failing)
2. **Complete end-to-end testing** 
3. **Test on mobile devices**
4. **Prepare for deployment**

---

Ready to verify? Start with Step 1 and let me know what you find!
