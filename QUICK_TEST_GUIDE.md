# 🚀 Quick Test Guide - 5 Minutes

## Before You Start

```bash
# 1. Apply database migrations
npx supabase db push

# 2. Restart dev server
npm run dev
```

---

## Test 1: Onboarding (2 min)

**Steps:**
1. Logout if logged in
2. Login: Phone `933445566`, PIN `1234`
3. Enter farmer name: `Tadesse`
4. Enter farm name: `Green Farm` (optional)
5. Click Continue

**Expected:**
- ✓ Redirects to home
- ✓ Bottom nav visible (5 tabs)
- ✓ Language toggle visible (top right)

---

## Test 2: Animal Registration (2 min)

**Steps:**
1. Click "Add Animal"
2. Click "Cattle" → **Auto-advances** (no Continue button)
3. Click "Cow" → **Auto-advances** (no Continue button)
4. Enter name: `Chaltu`
5. Click Register

**Expected:**
- ✓ No Continue buttons (auto-advance)
- ✓ Animal registered successfully
- ✓ Animal ID generated (check database)

---

## Test 3: Navigation (1 min)

**Steps:**
1. Click each bottom nav tab
2. Click language toggle

**Expected:**
- ✓ All tabs work
- ✓ Active tab highlighted
- ✓ Language switches immediately

---

## ✅ Success!

If all 3 tests pass, everything works!

**Check Database:**
```sql
-- See animal with ID
SELECT animal_id, name, type FROM animals;

-- See profile
SELECT farmer_name, farm_name FROM profiles;
```

**Expected Animal ID Format:**
- `GreenFarm-COW-001-2025`
- `Tadesse-COW-001-2025`
- `445566-COW-001-2025`

---

## 🐛 If Something Fails

### Onboarding doesn't show:
- Check if profile already exists
- Try with completely new phone number

### Animal ID not generated:
- Check migrations applied: `npx supabase db push`
- Check console for errors

### Navigation not visible:
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Check AppLayout is wrapping routes

---

**That's it! 5 minutes to verify everything works.**

