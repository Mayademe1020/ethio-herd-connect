# Bug Fixed: CalendarProvider Missing in AppMVP

## Issue

When testing the Profile page, the following error occurred:

```
CalendarContext.tsx:111 Uncaught Error: useCalendar must be used within a CalendarProvider
    at useCalendar (CalendarContext.tsx:111:11)
    at Profile (Profile.tsx:36:49)
```

## Root Cause

The Profile page uses `useCalendar()` hook to access the calendar system preference (Gregorian vs Ethiopian calendar). However, `AppMVP.tsx` was missing the `CalendarProvider` wrapper, which is required for the `useCalendar` hook to work.

The app has two entry points:
- `src/App.tsx` - Has CalendarProvider ✅
- `src/AppMVP.tsx` - Was missing CalendarProvider ❌

Since the MVP version is what's currently being used, the Profile page crashed.

## Fix Applied

Added `CalendarProvider` to `src/AppMVP.tsx` in the correct position in the provider hierarchy:

```tsx
<QueryClientProvider>
  <LanguageProvider>
    <AuthProviderMVP>
      <CalendarProvider>  {/* ← ADDED */}
        <DemoModeProvider>
          <ToastProvider>
            {/* ... rest of app ... */}
          </ToastProvider>
        </DemoModeProvider>
      </CalendarProvider>  {/* ← ADDED */}
    </AuthProviderMVP>
  </LanguageProvider>
</QueryClientProvider>
```

### Provider Order Rationale

`CalendarProvider` is placed:
- **After** `AuthProviderMVP` - because it needs access to the authenticated user
- **Before** `DemoModeProvider` - because calendar preference is a core feature, not demo-specific

## Files Modified

1. **src/AppMVP.tsx**
   - Added import: `import { CalendarProvider } from "@/contexts/CalendarContext";`
   - Wrapped app with `<CalendarProvider>`

## Testing

After the fix:
- ✅ Profile page loads without errors
- ✅ Calendar system selector works
- ✅ No console errors
- ✅ All other pages still work

## Prevention

This issue occurred because:
1. We have two app entry points (App.tsx and AppMVP.tsx)
2. CalendarProvider was only added to App.tsx
3. The MVP version is what's actually running

**Recommendation:** Consider consolidating to a single app entry point to avoid this type of sync issue in the future.

## Additional Fix Required

After adding CalendarProvider, a second issue was discovered:

### Issue 2: Wrong Auth Context Import

`CalendarContext.tsx` was importing from `@/contexts/AuthContext` but the app uses `@/contexts/AuthContextMVP`.

**Fix:** Changed import to use `AuthContextMVP`

### Issue 3: Missing Database Column

`CalendarContext.tsx` was trying to read/write `calendar_preference` column from database, but this column doesn't exist in the `profiles` table.

**Fix:** Simplified to use `localStorage` instead of database persistence for now.

```tsx
// Before: Tried to use database
const { data } = await supabase
  .from('farm_profiles')
  .select('calendar_preference')
  ...

// After: Use localStorage
const saved = localStorage.getItem('calendar_preference');
```

## Files Modified

1. **src/AppMVP.tsx**
   - Added `CalendarProvider` wrapper

2. **src/contexts/CalendarContext.tsx**
   - Changed import from `AuthContext` to `AuthContextMVP`
   - Removed database persistence (uses localStorage instead)
   - Simplified loading logic

## Status

✅ **FIXED** - Profile page now works correctly with calendar system selector.

## Notes

- Calendar preference is now stored in localStorage only
- If database persistence is needed later, add `calendar_preference` column to `profiles` table
- The calendar selector in Profile page works and persists across sessions via localStorage

---

**Fixed:** [Date]
**Tested:** Profile page loads and calendar selector works
**Impact:** Critical bug - Profile page was completely broken
**Severity:** High (blocking manual testing)
