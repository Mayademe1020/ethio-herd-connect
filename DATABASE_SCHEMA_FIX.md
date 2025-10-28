# Database Schema Fix - Animals Table

## 🔴 Problem

Getting `400 Bad Request` errors when trying to register animals or fetch animal list:
```
POST /rest/v1/animals 400 (Bad Request)
GET /rest/v1/animals 400 (Bad Request)
```

## 🔍 Root Cause

**Mismatch between code and database schema:**
- Code was trying to insert `animal_code` column
- Database migration (20251023000000_mvp_schema_cleanup.sql) doesn't have `animal_code`
- TypeScript types are outdated (still reference old schema)

## ✅ Fix Applied

### 1. Updated `src/hooks/useAnimalRegistration.tsx`

**Removed:**
- `animal_code` generation and insertion
- `created_at` field (database handles this automatically)

**Kept (matching actual database schema):**
- `id` (UUID)
- `user_id` (from auth)
- `name` (animal name)
- `type` (cattle/goat/sheep)
- `subtype` (Cow/Bull/Ox/Calf, etc.)
- `photo_url` (optional)
- `registration_date` (timestamp)
- `is_active` (boolean)

### 2. Added Type Assertion

Used `as any` to bypass outdated Supabase TypeScript types until they're regenerated.

## 📋 Actual Database Schema (from migration)

```sql
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL DEFAULT 'Unnamed',
  type TEXT NOT NULL DEFAULT 'cattle',
  subtype TEXT,
  photo_url TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Note:** No `animal_code`, `breed`, `birth_date`, `weight`, `gender`, etc.

## 🧪 How to Test

### 1. Restart Dev Server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Test Animal Registration
```
1. Login with phone: 911234567, PIN: 1234
2. Click "Add Animal" or go to /register-animal
3. Select type: Cattle
4. Select subtype: Cow
5. Enter name: Chaltu (optional)
6. Click Register
7. Expected: ✓ መለያ ተፈጥሯል! / Animal registered!
```

### 3. Test Animal List
```
1. Go to "My Animals" or /my-animals
2. Expected: See list of registered animals
3. No 400 errors in console
```

## 🔧 Long-term Fix Needed

### Regenerate Supabase Types

Run this command to sync TypeScript types with actual database:
```bash
npx supabase gen types typescript --project-id pbtaolycccmmqmwurinp > src/integrations/supabase/types.ts
```

This will:
- ✓ Remove `animal_code` from types
- ✓ Remove other deleted columns
- ✓ Match actual database schema
- ✓ Remove need for `as any` type assertion

## 📊 Before vs After

### Before (Broken):
```typescript
const animalData = {
  id: tempId,
  user_id: user.id,
  animal_code: animalCode, // ❌ Column doesn't exist
  name: data.name,
  type: data.type,
  subtype: data.subtype,
  photo_url: data.photo_url,
  registration_date: new Date().toISOString(),
  is_active: true,
  created_at: new Date().toISOString() // ❌ Database handles this
};
```

### After (Fixed):
```typescript
const animalData = {
  id: tempId,
  user_id: user.id,
  name: data.name || `${data.subtype}`, // ✓ Simplified
  type: data.type,
  subtype: data.subtype,
  photo_url: data.photo_url,
  registration_date: new Date().toISOString(),
  is_active: true
} as any; // ✓ Bypass outdated types
```

## ✅ Status

**Fixed:** ✅ Code now matches database schema  
**Testing:** ⏳ Restart server and test animal registration  
**Next:** Regenerate Supabase types (optional but recommended)

---

**Fixed:** October 27, 2025  
**File:** `src/hooks/useAnimalRegistration.tsx`  
**Issue:** Schema mismatch causing 400 errors  
**Solution:** Removed non-existent columns from insert
