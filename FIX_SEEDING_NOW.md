# Fix Seeding - Updated Script

## What I Fixed

1. ✅ **Removed `location` from profiles** - The profiles table doesn't have this column
2. ✅ **Commented out `animal_id`** - Until you apply the migration
3. ✅ **Fixed account detection** - Now properly finds existing accounts

## Run These Commands Now

### Step 1: Reset (Clean Up Partial Data)
```bash
npm run reset:demo
```

This will clean up the accounts that were created without profiles.

### Step 2: Seed Again
```bash
npm run seed:demo
```

This should now work! You'll see:
```
✅ Created account: Abebe Kebede (+251911234567)
✅ Created profile for Abebe Kebede
✅ Created account: Chaltu Tadesse (+251922345678)
✅ Created profile for Chaltu Tadesse
✅ Created account: Dawit Haile (+251933456789)
✅ Created profile for Dawit Haile
✅ Created 20 animals
✅ Created 84 milk records
✅ Created 10 listings
```

### Step 3: Verify
```bash
npm run verify:demo
```

## About animal_id

I've temporarily commented out the `animal_id` column in the seeding script. The animals will be created with just the UUID `id`.

**To add animal_id later:**
1. Apply the migration I created: `supabase/migrations/20251028140000_add_animal_id_column.sql`
2. Uncomment the `animal_id` lines in `scripts/seed-demo-data.ts`
3. Run `npm run reset:demo` and `npm run seed:demo` again

## Why This Happened

1. **Profiles table** - Doesn't have `location` column (it's just: id, phone, farmer_name, farm_name)
2. **animal_id column** - Doesn't exist in database yet (needs migration)
3. **Account detection** - Was using `.single()` which throws error if not found

All fixed now! Try the commands above.

