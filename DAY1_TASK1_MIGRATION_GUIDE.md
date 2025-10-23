# Task 1: Deploy Database Migration
**Status:** 🔄 In Progress  
**Priority:** CRITICAL  
**Estimated Time:** 30 minutes

---

## Migration File Ready

✅ **File Created:** `supabase/migrations/20251021232133_add_custom_breed_support.sql`

The migration adds:
- `breed_custom` TEXT column (for user-provided breed descriptions)
- `is_custom_breed` BOOLEAN column (flag for custom breeds)
- Indexes for performance

---

## Deployment Options

### Option 1: Using Supabase CLI (Recommended)

#### Step 1: Check if Supabase CLI is installed
```bash
supabase --version
```

**If not installed:**
```bash
# Using npm
npm install -g supabase

# Or using homebrew (Mac)
brew install supabase/tap/supabase
```

#### Step 2: Login to Supabase
```bash
supabase login
```
This will open a browser window for authentication.

#### Step 3: Link to your project
```bash
# You'll need your project reference ID from Supabase dashboard
supabase link --project-ref YOUR_PROJECT_REF
```

**To find your project ref:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > General
4. Copy the "Reference ID"

#### Step 4: Push the migration
```bash
# This will apply all pending migrations
supabase db push
```

**Or run specific migration:**
```bash
supabase db execute -f supabase/migrations/20251021232133_add_custom_breed_support.sql
```

---

### Option 2: Using Supabase Dashboard (Alternative)

If CLI doesn't work, you can run the SQL directly:

#### Step 1: Open SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click "SQL Editor" in the left sidebar

#### Step 2: Copy Migration SQL
Open `supabase/migrations/20251021232133_add_custom_breed_support.sql` and copy all content

#### Step 3: Paste and Run
1. Paste the SQL into the editor
2. Click "Run" button
3. Wait for success message

---

## Verification Steps

### Step 1: Check Columns Exist
Run this query in SQL Editor:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'animals'
AND column_name IN ('breed_custom', 'is_custom_breed')
ORDER BY column_name;
```

**Expected Result:**
```
column_name      | data_type | is_nullable | column_default
-----------------+-----------+-------------+----------------
breed_custom     | text      | YES         | NULL
is_custom_breed  | boolean   | YES         | false
```

---

### Step 2: Check Indexes Created
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'animals'
AND indexname LIKE '%breed%'
ORDER BY indexname;
```

**Expected Result:**
```
indexname                    | indexdef
-----------------------------+------------------------------------------
idx_animals_breed            | CREATE INDEX idx_animals_breed ON...
idx_animals_is_custom_breed  | CREATE INDEX idx_animals_is_custom_breed...
idx_animals_type_breed       | CREATE INDEX idx_animals_type_breed ON...
```

---

### Step 3: Test Insert (Optional)
```sql
-- Test inserting an animal with custom breed
INSERT INTO animals (
  name, 
  type, 
  breed, 
  breed_custom, 
  is_custom_breed, 
  user_id,
  animal_code,
  health_status,
  is_vet_verified,
  birth_date
) VALUES (
  'Test Animal', 
  'cattle', 
  'other-unknown', 
  'White with black spots, medium size', 
  true, 
  (SELECT id FROM auth.users LIMIT 1), -- Use your user ID
  'TEST001',
  'healthy',
  false,
  CURRENT_DATE
);

-- Verify it was inserted
SELECT 
  name, 
  type, 
  breed, 
  breed_custom, 
  is_custom_breed
FROM animals
WHERE name = 'Test Animal';

-- Clean up test data
DELETE FROM animals WHERE name = 'Test Animal';
```

---

## Troubleshooting

### Issue: "supabase: command not found"
**Solution:** Install Supabase CLI (see Option 1, Step 1)

### Issue: "Project not linked"
**Solution:** Run `supabase link --project-ref YOUR_PROJECT_REF`

### Issue: "Permission denied"
**Solution:** Make sure you're logged in with `supabase login`

### Issue: "Column already exists"
**Solution:** Migration may have already run. Check with verification queries.

### Issue: "Cannot connect to database"
**Solution:** 
1. Check internet connection
2. Verify project is active in Supabase dashboard
3. Check if database is paused (free tier)

---

## Rollback Plan (If Needed)

If something goes wrong, you can rollback:

```sql
-- Remove columns
ALTER TABLE animals DROP COLUMN IF EXISTS breed_custom;
ALTER TABLE animals DROP COLUMN IF EXISTS is_custom_breed;

-- Remove indexes
DROP INDEX IF EXISTS idx_animals_breed;
DROP INDEX IF EXISTS idx_animals_type_breed;
DROP INDEX IF EXISTS idx_animals_is_custom_breed;
```

---

## Success Checklist

- [ ] Supabase CLI installed (or using dashboard)
- [ ] Logged into Supabase
- [ ] Project linked
- [ ] Migration executed successfully
- [ ] Columns verified in database
- [ ] Indexes verified in database
- [ ] Test insert/select works (optional)
- [ ] No errors in Supabase logs

---

## Next Steps

Once migration is deployed:
1. ✅ Mark Task 1 complete
2. ➡️ Move to Task 2: Remove Country Selector from Header
3. 📝 Update progress in `DAY1_PROGRESS_TRACKER.md`

---

## Status Update

**Started:** [Your timestamp]  
**Completed:** [Your timestamp]  
**Duration:** [Actual time taken]  
**Issues Encountered:** [None / List any issues]  
**Notes:** [Any additional notes]

---

**Need Help?** 
- Check Supabase documentation: https://supabase.com/docs/guides/cli
- Review migration file: `supabase/migrations/20251021232133_add_custom_breed_support.sql`
- Ask for assistance if stuck
