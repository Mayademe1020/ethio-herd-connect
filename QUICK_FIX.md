# Quick Fix - Animal Seeding

## The Problem
```
❌ Failed to seed animals: column "animal_id" does not exist
```

## The Fix (2 minutes)

### 1. Run This SQL in Supabase Dashboard
```sql
ALTER TABLE animals ADD COLUMN IF NOT EXISTS animal_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_animals_animal_id ON animals(animal_id) WHERE animal_id IS NOT NULL;
```

**Where:** Supabase Dashboard → SQL Editor → Paste → Run

### 2. Add Service Key to .env
```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Where to get key:** Supabase Dashboard → Settings → API → Copy "service_role"

### 3. Try Again
```bash
npm run seed:demo
```

## Done! ✅

If it works, you'll see:
```
✅ Created 3 accounts
✅ Created 20 animals
✅ Created 84 milk records
✅ Created 10 listings
```

## Still Not Working?

Read the detailed guides:
- `FIX_ANIMAL_SEEDING.md` - Full fix instructions
- `GET_SERVICE_ROLE_KEY.md` - How to get the key
- `SEEDING_ISSUE_RESOLVED.md` - Complete explanation

