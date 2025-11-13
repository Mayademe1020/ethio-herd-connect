# Fix 406 Not Acceptable Errors

## Problem
Getting 406 (Not Acceptable) and 400 (Bad Request) errors when trying to:
- Query `farm_profiles` table for `farm_prefix` and `farm_name`
- Query/insert `animals` table with `animal_id` column
- These columns exist in migrations but not in the actual database

## Root Cause
The database migrations haven't been applied to your Supabase instance. The TypeScript types were updated, but the actual database schema is outdated.

## Solution

### Option 1: Apply Migrations via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run These Migrations in Order**

#### Migration 1: Add animal_id column
```sql
-- Add animal_id column to animals table
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT;

-- Create unique index on animal_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN animals.animal_id IS 'Human-readable unique identifier for the animal (e.g., AbebeFarm-COW-001-2025)';
```

#### Migration 2: Add status system
```sql
-- Add status column to animals table
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' 
  CHECK (status IN ('active', 'sold', 'deceased', 'culled', 'lost', 'transferred', 'quarantine'));

-- Add status-specific date columns
ALTER TABLE animals
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

-- Update existing animals to have 'active' status
UPDATE animals
SET status = 'active'
WHERE status IS NULL;
```

#### Migration 3: Create animal_status_history table
```sql
-- Create animal status history table for audit trail
CREATE TABLE IF NOT EXISTS animal_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  animal_id TEXT REFERENCES animals(animal_id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT,
  details JSONB,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for status history
CREATE INDEX IF NOT EXISTS idx_status_history_animal_id ON animal_status_history(animal_id);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_at ON animal_status_history(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_status_history_changed_by ON animal_status_history(changed_by);

-- Enable RLS
ALTER TABLE animal_status_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own animal status history"
  ON animal_status_history FOR SELECT
  USING (
    changed_by = auth.uid() OR
    animal_id IN (
      SELECT animal_id FROM animals WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert status history for their animals"
  ON animal_status_history FOR INSERT
  WITH CHECK (
    animal_id IN (
      SELECT animal_id FROM animals WHERE user_id = auth.uid()
    )
  );
```

#### Migration 4: Check farm_profiles table
```sql
-- Check if farm_profiles table exists and has required columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'farm_profiles';

-- If farm_prefix and farm_name don't exist, add them:
ALTER TABLE farm_profiles
  ADD COLUMN IF NOT EXISTS farm_prefix TEXT,
  ADD COLUMN IF NOT EXISTS farm_name TEXT;
```

### Option 2: Use Supabase CLI (If you have it installed)

```bash
# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
npx supabase db push

# Or reset and apply all migrations
npx supabase db reset
```

### Option 3: Manual Column Addition (Quick Fix)

If you just want to get it working quickly, run this in SQL Editor:

```sql
-- Quick fix: Add all missing columns
ALTER TABLE animals 
  ADD COLUMN IF NOT EXISTS animal_id TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS sold_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deceased_date TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS transferred_date TIMESTAMPTZ;

-- Add indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id 
  ON animals(animal_id) WHERE animal_id IS NOT NULL;
  
CREATE INDEX IF NOT EXISTS idx_animals_status ON animals(status);

-- Update existing records
UPDATE animals SET status = 'active' WHERE status IS NULL;
```

## Verification

After running the migrations, verify they worked:

```sql
-- Check animals table columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'animals'
ORDER BY ordinal_position;

-- Check if animal_status_history table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'animal_status_history';
```

## After Applying Migrations

1. **Refresh your browser** - Clear cache if needed
2. **Try registering an animal again**
3. **Check browser console** - Errors should be gone

## Why This Happened

The local migration files exist in `supabase/migrations/` but they haven't been applied to your remote Supabase database. This is common when:
- Migrations are created locally but not pushed
- Database was reset without reapplying migrations
- Using a different Supabase project than migrations were created for

## Prevention

To avoid this in the future:

1. **Always push migrations after creating them**
   ```bash
   npx supabase db push
   ```

2. **Use migration tracking**
   - Supabase tracks which migrations have been applied
   - Check migration status: `npx supabase migration list`

3. **Document migration requirements**
   - Add migration notes to deployment docs
   - Include migration steps in setup guides

## Expected Result

After applying migrations, you should see:
- ✅ No more 406 errors
- ✅ Animal registration works
- ✅ Animal ID generation works
- ✅ Status tracking works
- ✅ All database queries succeed

---

**Status**: ⚠️ **ACTION REQUIRED**  
**Next Step**: Apply migrations to Supabase database  
**Priority**: HIGH - App won't work without these columns
