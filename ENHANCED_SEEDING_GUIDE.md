# Enhanced Demo Data Seeding Guide v2.0

## 🎉 What's New

The seeding script has been completely rewritten with production-ready features:

### ✅ Smart Existence Checks
- Automatically detects existing data
- Skips creation if data already exists
- No more "already registered" errors
- Fully idempotent - safe to run multiple times

### ✅ Schema Awareness
- Validates columns exist before inserting
- Adapts to your database schema
- Clear error messages if schema mismatch
- No more "column not found" errors

### ✅ Detailed Verification
- Comprehensive reports with breakdowns
- Counts by type (cattle, goats, sheep)
- Status indicators (✅/❌)
- Clear next steps if incomplete

### ✅ Safe Repeatability
- Run as many times as needed
- Won't create duplicates
- Preserves existing data by default
- Force flag for clean reseed

### ✅ Better Error Handling
- Graceful failures
- Clear error messages
- Continues on partial failures
- Detailed logging

---

## 📋 Commands

### Seed Demo Data (Idempotent)
```bash
npm run seed:demo
```

**What it does:**
- Checks if accounts exist → skips if found
- Checks if animals exist → skips if found
- Checks if milk records exist → skips if found
- Checks if listings exist → skips if found
- **Safe to run multiple times!**

**Output:**
```
🌱 Starting demo data seeding...

📝 Creating demo accounts...
   ℹ️  User +251911234567 already exists, skipping creation.
   ℹ️  User +251922345678 already exists, skipping creation.
   ℹ️  User +251933456789 already exists, skipping creation.

🐄 Seeding animals...
   ℹ️  Found 20 existing animals, skipping creation.

🥛 Seeding milk production records...
   ℹ️  Found 84 existing milk records, skipping creation.

🏪 Seeding marketplace listings...
   ℹ️  Found 10 existing listings, skipping creation.

✅ Demo data seeding completed successfully!
```

---

### Force Reseed (Clean Slate)
```bash
npm run seed:demo:force
```

**What it does:**
- Deletes ALL existing demo data
- Creates fresh accounts
- Seeds new animals
- Seeds new milk records
- Seeds new listings
- **Use when you want to start over!**

**Output:**
```
🌱 Starting demo data seeding...
⚠️  FORCE MODE: Will delete and recreate all demo data

📝 Creating demo accounts...
   🔄 Force mode: Deleting existing user +251911234567...
   ✅ Created account: Abebe Kebede (+251911234567)
   ✅ Created profile for Abebe Kebede
   ...

🐄 Seeding animals...
   🔄 Force mode: Deleting 20 existing animals...
   ✅ Created 20 animals

✅ Demo data seeding completed successfully!
```

---

### Reset Demo Data
```bash
npm run reset:demo
```

**What it does:**
- Deletes marketplace listings
- Deletes milk production records
- Deletes animals
- Deletes user profiles
- Deletes auth users (if SERVICE_ROLE_KEY available)

**Output:**
```
🗑️  Resetting demo data...

🔍 Found 3 demo accounts to clean up...
   ✅ Marketplace listings deleted
   ✅ Milk production records deleted
   ✅ Animals deleted
   ✅ User profiles deleted
   ✅ Auth users deleted

✅ Demo data reset completed!
```

---

### Verify Demo Data
```bash
npm run verify:demo
```

**What it does:**
- Counts demo accounts
- Counts animals by type
- Counts milk records
- Counts listings by status
- Shows detailed breakdown
- Indicates if complete or incomplete

**Output:**
```
🔍 Verifying demo data...

👥 Demo Accounts: 3/3
   ✅ +251911234567 - Abebe Kebede
   ✅ +251922345678 - Chaltu Tadesse
   ✅ +251933456789 - Dawit Haile

🐄 Animals: 20 total
   - Cattle: 15
   - Goats: 6
   - Sheep: 4

🥛 Milk Records: 84

🏪 Marketplace Listings: 10 total
   - Active: 10
   - Other: 0

✅ Demo data verification PASSED!

📊 Summary:
   ✅ 3 accounts
   ✅ 20 animals
   ✅ 84 milk records
   ✅ 10 marketplace listings
```

---

## 🔧 How It Works

### Smart Existence Checks

**Before creating accounts:**
```typescript
// Check if profile exists
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('*')
  .eq('phone', account.phone)
  .maybeSingle();

if (existingProfile && !force) {
  console.log(`ℹ️  User ${account.phone} already exists, skipping creation.`);
  continue;
}
```

**Before creating animals:**
```typescript
// Check for existing animals
const { count: existingCount } = await supabase
  .from('animals')
  .select('*', { count: 'exact', head: true })
  .in('user_id', userIds);

if (existingCount && existingCount > 0 && !force) {
  console.log(`ℹ️  Found ${existingCount} existing animals, skipping creation.`);
  return existingData;
}
```

### Schema Validation

```typescript
async function validateSchema(tableName: string, requiredColumns: string[]): Promise<boolean> {
  // Fetch one row to get column names
  const { data } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  const availableColumns = Object.keys(data[0]);
  const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));

  if (missingColumns.length > 0) {
    console.error(`❌ Missing columns in ${tableName}:`, missingColumns.join(', '));
    return false;
  }

  return true;
}
```

---

## 🎯 Use Cases

### First Time Setup
```bash
# 1. Seed demo data
npm run seed:demo

# 2. Verify it worked
npm run verify:demo

# 3. Test login with demo accounts
```

### Between Demos (Quick Reset)
```bash
# Option 1: Reset and reseed (2 commands)
npm run reset:demo
npm run seed:demo

# Option 2: Force reseed (1 command)
npm run seed:demo:force
```

### After Schema Changes
```bash
# Force reseed to use new schema
npm run seed:demo:force

# Verify new data
npm run verify:demo
```

### Checking Data Status
```bash
# Quick verification
npm run verify:demo
```

### Fixing Partial Data
```bash
# If some data is missing, just run seed again
# It will only create what's missing
npm run seed:demo
```

---

## 🚨 Troubleshooting

### "No SERVICE_ROLE_KEY" Warning

**Issue:** Can't create auth users without service role key

**Solution:**
1. Get key from Supabase Dashboard → Settings → API
2. Add to `.env`:
```env
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

**Workaround:** Create accounts manually in Supabase Dashboard, then run seed

---

### "Schema validation failed"

**Issue:** Required column doesn't exist in table

**Solution:**
1. Check which column is missing in error message
2. Apply the migration that adds it
3. Run seed again

**Example:**
```
❌ Missing columns in animals: animal_id
```
→ Apply migration: `supabase/migrations/20251028140000_add_animal_id_column.sql`

---

### "Found X existing items, skipping"

**Issue:** Data already exists, not creating duplicates

**Solution:** This is normal! The script is being idempotent.

**If you want fresh data:**
```bash
npm run seed:demo:force
```

---

### Partial Data Created

**Issue:** Some data created, then error occurred

**Solution:** Just run seed again - it will create missing data
```bash
npm run seed:demo
```

---

## 📊 What Gets Seeded

### 3 Demo Accounts
- Abebe Kebede (+251911234567) - Abebe Farm
- Chaltu Tadesse (+251922345678) - Chaltu Dairy
- Dawit Haile (+251933456789) - Haile Ranch

### 20 Animals
- **Account 1:** 7 cattle (Cow, Bull, Ox, Calf mix)
- **Account 2:** 5 cattle + 2 goats
- **Account 3:** 3 cattle + 4 goats + 4 sheep
- 50% have placeholder photos
- Registered over past 30 days

### 84 Milk Records
- Past 7 days of data
- 2 sessions per day (morning + evening)
- 2-8 liters per session
- Only for milk-producing animals (cows, female goats/sheep)

### 10 Marketplace Listings
- Mix of animal types
- Prices: 5,000-50,000 Birr
- 70% negotiable
- Random view counts
- Created over past 7 days

---

## 🎓 Best Practices

### ✅ DO:
- Run `verify:demo` to check status
- Use regular `seed:demo` for normal seeding
- Use `seed:demo:force` when you need clean data
- Run `reset:demo` before force reseed for clean slate

### ❌ DON'T:
- Don't manually delete data - use `reset:demo`
- Don't worry about running seed multiple times - it's safe
- Don't skip verification - always check with `verify:demo`

---

## 🔄 Workflow Examples

### Exhibition Prep
```bash
# Day before exhibition
npm run seed:demo:force
npm run verify:demo

# Between demos
npm run seed:demo:force  # Fresh data for each demo
```

### Development
```bash
# Initial setup
npm run seed:demo

# After code changes
npm run seed:demo  # Adds any missing data

# After schema changes
npm run seed:demo:force  # Fresh data with new schema
```

### Testing
```bash
# Before tests
npm run seed:demo

# After tests
npm run reset:demo  # Clean up

# For next test run
npm run seed:demo
```

---

## 📝 Summary

The enhanced seeding script is:
- ✅ **Idempotent** - Safe to run multiple times
- ✅ **Smart** - Detects existing data
- ✅ **Flexible** - Force flag for clean reseed
- ✅ **Robust** - Schema validation
- ✅ **Detailed** - Comprehensive verification
- ✅ **Production-ready** - Proper error handling

**Try it now:**
```bash
npm run seed:demo
npm run verify:demo
```

