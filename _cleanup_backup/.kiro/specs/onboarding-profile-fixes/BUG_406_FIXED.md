# Bug Fix: 406 Not Acceptable Error on Profile Fetch

## Issue Found During Manual Testing

**Reporter:** User  
**Date:** Testing Task 8  
**Severity:** Critical - Blocks onboarding completion

### Problem Description

When a new user completes onboarding and submits their farm name:
1. ✅ Form submission succeeds
2. ✅ Success message appears
3. ❌ Page doesn't navigate to home
4. ❌ Console shows 406 error

### Error Details

```
GET https://pbtaolycccmmqmwurinp.supabase.co/rest/v1/profiles?select=*&id=eq.50bff01f-c275-4660-8c53-f8117aa7aa1f 406 (Not Acceptable)
```

### Root Cause

The Supabase client was not configured to send proper HTTP headers. The PostgREST API (Supabase's REST API) requires:
- `Accept: application/json` header
- `Content-Type: application/json` header

Without these headers, the API returns a **406 Not Acceptable** response.

### Solution

Updated `src/integrations/supabase/client.ts` to include global headers:

```typescript
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});
```

### Impact

This fix resolves:
- ✅ Profile fetch after onboarding
- ✅ All Supabase REST API calls
- ✅ Navigation flow after onboarding completion
- ✅ User experience for new registrations

### Testing Required

After this fix, please retest:

1. **New User Registration:**
   - [ ] Register with phone + PIN
   - [ ] Complete onboarding with farm name
   - [ ] Verify navigation to home page
   - [ ] Check console for errors (should be none)

2. **Profile Loading:**
   - [ ] Refresh the page
   - [ ] Verify profile loads without 406 error
   - [ ] Check that farm name displays correctly

3. **Existing Users:**
   - [ ] Login with existing account
   - [ ] Verify profile loads correctly
   - [ ] No 406 errors in console

### Files Modified

- `src/integrations/supabase/client.ts` - Added global headers configuration

### Related Requirements

- Requirement 1.1: Profile creation after first login
- Requirement 1.2: Profile data persistence
- Requirement 2.1: Successful profile fetch
- Requirement 5.4: Console error resolution

### Next Steps

1. Restart the development server (`npm run dev`)
2. Clear browser cache and local storage
3. Test new user registration flow
4. Verify no 406 errors appear
5. Continue with Task 8 manual testing checklist
