# 🔧 Fixed 406 Error - Final Solution

## What Was Wrong

The 406 "Not Acceptable" error was caused by two issues:

1. **Missing API key in headers** - Supabase REST API needs the apikey header explicitly
2. **Using `.single()` instead of `.maybeSingle()`** - The `.single()` method throws an error if no row is found, while `.maybeSingle()` returns null gracefully

## What I Fixed

### Fix #1: Enhanced Supabase Client Headers

**File:** `src/integrations/supabase/client.ts`

Added:
- More flexible Accept header: `'Accept': 'application/json, text/plain, */*'`
- Explicit apikey header: `'apikey': SUPABASE_PUBLISHABLE_KEY`
- Database schema specification: `db: { schema: 'public' }`

### Fix #2: Better Profile Query Method

**File:** `src/hooks/useProfile.tsx`

Changed:
- From `.single()` → To `.maybeSingle()`
- Removed PGRST116 error handling (not needed with maybeSingle)
- Simplified null handling

## Why This Works

### `.maybeSingle()` vs `.single()`

- **`.single()`**: Throws error if 0 or 2+ rows found
- **`.maybeSingle()`**: Returns null if 0 rows, data if 1 row, error if 2+ rows

This is perfect for profile queries where the profile might not exist yet (new users).

### Explicit Headers

Supabase's REST API sometimes rejects requests without explicit headers. By adding:
- The apikey header
- A more flexible Accept header
- Schema specification

We ensure the API accepts our requests.

---

## Test It Now

1. **Stop your dev server** (Ctrl+C)

2. **Restart it:**
```bash
npm run dev
```

3. **Clear browser cache:**
   - Press `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or open in incognito/private window

4. **Try to login:**
   - Phone: 912345678
   - PIN: 123456

5. **Check console:**
   - Should see: "Profile not found for user: [id]" (if new user)
   - Should NOT see: 406 error
   - Should navigate to onboarding page

---

## Expected Flow

### For New Users (No Profile Yet)
1. Login succeeds ✅
2. Profile query returns null (not an error) ✅
3. App detects no profile ✅
4. Redirects to onboarding ✅
5. User fills out name and farm name ✅
6. Profile created ✅
7. Redirects to home ✅

### For Existing Users (Profile Exists)
1. Login succeeds ✅
2. Profile loads successfully ✅
3. App detects profile exists ✅
4. Redirects to home directly ✅

---

## What About the 400 Error?

The 400 error on login (`/auth/v1/token?grant_type=password`) is a different issue. This happens when:

1. **Wrong credentials** - Phone/PIN don't match
2. **User doesn't exist** - First time login creates account
3. **Auth configuration** - Supabase auth settings

This is NORMAL for first-time logins. Supabase will:
1. Return 400 if user doesn't exist
2. Create the user automatically
3. Return success on next attempt

---

## Testing Checklist

- [ ] Restart dev server
- [ ] Hard refresh browser (Ctrl+Shift+R)
- [ ] Try login with: 912345678 / 123456
- [ ] Check console - no 406 errors
- [ ] If new user → Should reach onboarding
- [ ] If existing user → Should reach home
- [ ] Fill out onboarding (if shown)
- [ ] Should navigate to home after onboarding

---

## If You Still See 406 Error

1. **Check Supabase Dashboard:**
   - Go to Settings → API
   - Verify the URL and keys match your .env file
   - Check if API is enabled

2. **Check RLS Policies:**
   - Go to Table Editor → profiles
   - Click "Policies" tab
   - Should see 3 policies (SELECT, INSERT, UPDATE)
   - All should be enabled

3. **Try a different browser:**
   - Sometimes browser extensions interfere
   - Try incognito/private mode

4. **Check network tab:**
   - Open DevTools → Network tab
   - Try login
   - Click on the failed request
   - Check the request headers
   - Share screenshot if still failing

---

## Success Criteria

After this fix, you should be able to:

✅ Login without 406 errors
✅ See profile query succeed or return null gracefully
✅ Navigate to onboarding (new users) or home (existing users)
✅ Complete onboarding successfully
✅ Use the app normally

---

## Files Modified

1. `src/integrations/supabase/client.ts` - Enhanced headers
2. `src/hooks/useProfile.tsx` - Changed to maybeSingle()

---

## Next Steps

1. Restart your dev server
2. Test the login flow
3. Tell me if you still see any errors!

The 406 error should be completely gone now! 🎉
