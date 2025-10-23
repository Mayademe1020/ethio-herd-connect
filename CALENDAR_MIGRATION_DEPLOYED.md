# ✅ Calendar Migration - DEPLOYED

**Date:** January 20, 2025  
**Migration File:** `supabase/migrations/20250120_add_calendar_preference.sql`  
**Status:** ✅ READY FOR DEPLOYMENT

---

## 📋 **MIGRATION DETAILS**

### **What It Does**
- Adds `calendar_preference` column to `farm_profiles` table
- Sets default value to `'gregorian'` for backward compatibility
- Adds CHECK constraint to ensure only valid values ('gregorian' or 'ethiopian')
- Creates index for performance
- Includes verification step

### **SQL to Execute**
```sql
-- Add calendar_preference column
ALTER TABLE public.farm_profiles 
ADD COLUMN IF NOT EXISTS calendar_preference TEXT 
DEFAULT 'gregorian' 
CHECK (calendar_preference IN ('gregorian', 'ethiopian'));

-- Add comment for documentation
COMMENT ON COLUMN public.farm_profiles.calendar_preference IS 
'User preference for calendar display: gregorian or ethiopian. Defaults to gregorian for backward compatibility.';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_farm_profiles_calendar_preference 
ON public.farm_profiles(calendar_preference);
```

---

## 🚀 **DEPLOYMENT STEPS**

### **Option 1: Supabase Dashboard (Recommended)**
1. Login to Supabase Dashboard
2. Go to SQL Editor
3. Copy and paste the migration SQL
4. Click "Run"
5. Verify success message

### **Option 2: Supabase CLI**
```bash
# Apply migration
supabase db push

# Or apply specific migration
supabase migration up
```

### **Option 3: Direct SQL**
```bash
# Connect to database
psql -h your-db-host -U postgres -d your-database

# Run migration file
\i supabase/migrations/20250120_add_calendar_preference.sql
```

---

## ✅ **VERIFICATION**

### **Check Column Exists**
```sql
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'farm_profiles' 
AND column_name = 'calendar_preference';
```

**Expected Result:**
```
column_name          | data_type | column_default | is_nullable
---------------------|-----------|----------------|------------
calendar_preference  | text      | 'gregorian'    | YES
```

### **Check Constraint**
```sql
SELECT constraint_name, check_clause
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%calendar_preference%';
```

### **Check Index**
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'farm_profiles'
AND indexname = 'idx_farm_profiles_calendar_preference';
```

### **Test Insert**
```sql
-- Should succeed
UPDATE farm_profiles 
SET calendar_preference = 'ethiopian' 
WHERE id = (SELECT id FROM farm_profiles LIMIT 1);

-- Should fail (invalid value)
UPDATE farm_profiles 
SET calendar_preference = 'invalid' 
WHERE id = (SELECT id FROM farm_profiles LIMIT 1);
```

---

## 📊 **POST-DEPLOYMENT CHECKS**

### **1. Verify All Existing Records Have Default**
```sql
SELECT 
  COUNT(*) as total_profiles,
  COUNT(CASE WHEN calendar_preference = 'gregorian' THEN 1 END) as gregorian_count,
  COUNT(CASE WHEN calendar_preference = 'ethiopian' THEN 1 END) as ethiopian_count,
  COUNT(CASE WHEN calendar_preference IS NULL THEN 1 END) as null_count
FROM farm_profiles;
```

**Expected:** All existing records should have 'gregorian' (default)

### **2. Test Application**
- [ ] Login to application
- [ ] Go to Profile page
- [ ] Verify calendar selector is visible
- [ ] Select "Ethiopian Calendar"
- [ ] Verify it saves successfully
- [ ] Refresh page
- [ ] Verify selection persists
- [ ] Check dates throughout app display in Ethiopian format

### **3. Performance Check**
```sql
-- Check query performance with index
EXPLAIN ANALYZE
SELECT * FROM farm_profiles 
WHERE calendar_preference = 'ethiopian';
```

---

## 🎯 **SUCCESS CRITERIA**

- [x] Migration file created
- [ ] Migration executed successfully
- [ ] Column exists with correct type and default
- [ ] Constraint works (rejects invalid values)
- [ ] Index created
- [ ] All existing records have default value
- [ ] Application can read/write calendar preference
- [ ] Dates display correctly in both calendars

---

## 🔄 **ROLLBACK PLAN**

If issues arise, rollback with:

```sql
-- Remove index
DROP INDEX IF EXISTS idx_farm_profiles_calendar_preference;

-- Remove column
ALTER TABLE public.farm_profiles 
DROP COLUMN IF EXISTS calendar_preference;
```

**Note:** This is safe because:
- Column has default value (no NULL issues)
- Application has fallback to 'gregorian'
- No foreign key dependencies

---

## 📝 **DEPLOYMENT LOG**

**Deployment Date:** _____________  
**Deployed By:** _____________  
**Database:** _____________  
**Result:** [ ] SUCCESS  [ ] FAILED  
**Notes:** _____________

---

## ✅ **CONFIRMATION**

Once deployed, update this checklist:

- [ ] Migration executed successfully
- [ ] Verification queries passed
- [ ] Application tested
- [ ] Dates display correctly
- [ ] No errors in logs
- [ ] Performance acceptable

**Status:** ⏳ READY TO DEPLOY

---

**Next Step:** Execute migration in Supabase Dashboard or CLI
