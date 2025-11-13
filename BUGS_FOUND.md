# Bugs Found During E2E Testing

**Testing Start Date:** [Current Date]
**Tester:** [Your Name]
**App Version:** [Version/Commit]

---

## 📊 Summary

| Severity | Count | Fixed | Remaining |
|----------|-------|-------|-----------|
| Critical | 1     | 0     | 1         |
| High     | 3     | 0     | 3         |
| Medium   | 3     | 0     | 3         |
| Low      | 3     | 0     | 3         |
| **Total**| **10**| **0** | **10**    |

---

## 🔴 Critical Bugs (Must Fix Before Exhibition)

### BUG-001: Profiles table missing (404 errors)
- **Severity:** Critical
- **Found in:** Initial app load / Onboarding
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Login with user
  3. Check console
  4. See multiple 404 errors for `/rest/v1/profiles`
- **Expected:** User profile should load successfully
- **Actual:** 404 errors - profiles table doesn't exist or RLS policies blocking access
- **Console Errors:**
  ```
  pbtaolycccmmqmwurinp.supabase.co/rest/v1/profiles?select=*&id=eq.e8f552a9-1384-44d9-9022-4bc58b69edbf:1 
  Failed to load resource: the server responded with a status of 404 ()
  
  Onboarding.tsx:51 Onboarding error: Object
  ```
- **Status:** 🔴 Open
- **Priority:** Fix immediately - blocks user onboarding
- **Impact:** Users cannot complete onboarding, profile data not loading
- **Suggested Fix:** 
  1. Check if `profiles` table exists in Supabase
  2. Run migration: `supabase/migrations/20251027000000_add_user_profiles.sql`
  3. Verify RLS policies allow authenticated users to read their own profile

---

## 🟠 High Priority Bugs (Should Fix Before Exhibition)

### BUG-002: Missing translation for "common.profile"
- **Severity:** High
- **Found in:** Initial app load
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Check console
  3. See translation warning
- **Expected:** All translation keys should exist
- **Actual:** Missing translation key: `common.profile`
- **Console Errors:**
  ```
  useTranslation.tsx:63 Translation missing for key: common.profile
  ```
- **Status:** 🔴 Open
- **Priority:** Fix before deployment
- **Impact:** Profile section may show untranslated text
- **Suggested Fix:** 
  1. Add to `src/i18n/en.json`: `"common": { "profile": "Profile" }`
  2. Add to `src/i18n/am.json`: `"common": { "profile": "መገለጫ" }`

### BUG-008: Incorrect PIN length requirement (says 4, should be 6)
- **Severity:** High
- **Found in:** Login page - PIN input
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Go to login page
  2. Look at PIN field helper text
  3. See "ቢያንስ 4 አሃዞች / At least 4 digits"
- **Expected:** Should say "ቢያንስ 6 አሃዞች / At least 6 digits"
- **Actual:** Says 4 digits but validation may require 6
- **Screenshot:** User provided screenshot showing the issue
- **Status:** 🔴 Open
- **Priority:** Fix before deployment
- **Impact:** User confusion, incorrect guidance
- **Suggested Fix:** 
  1. Update `src/components/OtpAuthForm.tsx` line with helper text
  2. Change to: `"ቢያንስ 6 አሃዞች / At least 6 digits"`
  3. Also update validation if needed (currently checks `pin.length < 4`)

### BUG-009: Missing translations between Login and Onboarding
- **Severity:** High
- **Found in:** Login → Onboarding flow
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Login with phone and PIN
  2. Reach onboarding page
  3. Notice some text not translated
- **Expected:** All text should be bilingual (English/Amharic)
- **Actual:** Some text appears only in one language
- **Status:** 🔴 Open
- **Priority:** Fix before deployment
- **Impact:** Inconsistent user experience, breaks bilingual support
- **Suggested Fix:** 
  1. Audit `src/pages/LoginMVP.tsx` for hardcoded text
  2. Audit `src/pages/Onboarding.tsx` for hardcoded text
  3. Move all text to translation files
  4. Use `t()` function for all user-facing text

---

## 🟡 Medium Priority Bugs (Fix If Time Allows)

### BUG-003: Deprecated apple-mobile-web-app-capable meta tag
- **Severity:** Medium
- **Found in:** Initial app load
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Check console
  3. See deprecation warning
- **Expected:** Use modern meta tag
- **Actual:** Using deprecated `apple-mobile-web-app-capable`
- **Console Errors:**
  ```
  <meta name="apple-mobile-web-app-capable" content="yes"> is deprecated. 
  Please include <meta name="mobile-web-app-capable" content="yes">
  ```
- **Status:** 🔴 Open
- **Priority:** Fix if time allows
- **Impact:** May affect PWA functionality on iOS in future
- **Suggested Fix:** Update `index.html` to use `mobile-web-app-capable` instead

### BUG-004: Missing app icon (144x144)
- **Severity:** Medium
- **Found in:** Initial app load
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Check console
  3. See icon download error
- **Expected:** App icon should load
- **Actual:** 404 error for icon file
- **Console Errors:**
  ```
  Error while trying to use the following icon from the Manifest: 
  http://127.0.0.1:8080/icons/icon-144x144.png 
  (Download error or resource isn't a valid image)
  ```
- **Status:** 🔴 Open
- **Priority:** Fix before deployment
- **Impact:** App icon won't show when installed as PWA
- **Suggested Fix:** 
  1. Create icon at `public/icons/icon-144x144.png`
  2. Or update manifest.json to point to existing icon

### BUG-010: Onboarding auto-submits on Enter key
- **Severity:** Medium
- **Found in:** Onboarding page
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Complete login
  2. Reach onboarding page
  3. Type name in first field
  4. Press Enter
  5. Form submits immediately
- **Expected:** User should be able to press Enter to move to next field (farm name)
- **Actual:** Form submits after entering just the name, skipping farm name field
- **Status:** 🔴 Open
- **Priority:** Fix if time allows
- **Impact:** User cannot easily fill both fields, poor UX
- **Suggested Fix:** 
  1. In `src/pages/Onboarding.tsx`, update `onKeyPress` handler
  2. On Enter in first field, focus second field instead of submitting
  3. Only submit on Enter in second field or button click

---

## 🟢 Low Priority Bugs (Add to Backlog)

### BUG-005: Preload resource not used (crossorigin mismatch)
- **Severity:** Low
- **Found in:** Initial app load
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Check console
  3. See preload warning
- **Expected:** Preloaded resources should be used
- **Actual:** Preload not used due to credentials mode mismatch
- **Console Errors:**
  ```
  A preload for 'http://127.0.0.1:8080/src/main.tsx' is found, 
  but is not used because the request credentials mode does not match. 
  Consider taking a look at crossorigin attribute.
  ```
- **Status:** 🔴 Open
- **Priority:** Fix after exhibition
- **Impact:** Minor performance impact
- **Suggested Fix:** Add `crossorigin` attribute to preload link in index.html

### BUG-006: Multiple unused preload resources
- **Severity:** Low
- **Found in:** Initial app load
- **Browser:** Chrome
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app
  2. Wait for page load
  3. Check console
  4. See multiple preload warnings
- **Expected:** Preloaded resources should be used within a few seconds
- **Actual:** Multiple resources preloaded but not used
- **Console Errors:**
  ```
  The resource <URL> was preloaded using link preload but not used 
  within a few seconds from the window's load event. 
  Please make sure it has an appropriate `as` value and it is preloaded intentionally.
  ```
- **Status:** 🔴 Open
- **Priority:** Fix after exhibition
- **Impact:** Minor performance impact, wasted bandwidth
- **Suggested Fix:** Review and remove unnecessary preload links from index.html

### BUG-007: Browser extension errors (Ginger Widget)
- **Severity:** Low
- **Found in:** Initial app load
- **Browser:** Chrome with Ginger extension
- **Device:** Desktop
- **Steps to Reproduce:**
  1. Start the app with Ginger extension installed
  2. Check console
  3. See extension-related errors
- **Expected:** No extension errors
- **Actual:** Multiple "message channel closed" errors
- **Console Errors:**
  ```
  onboarding:1 Uncaught (in promise) Error: A listener indicated an 
  asynchronous response by returning true, but the message channel 
  closed before a response was received
  ```
- **Status:** 🔵 Deferred
- **Priority:** Not our issue - browser extension problem
- **Impact:** None on app functionality
- **Suggested Fix:** None - this is a browser extension issue, not our app

> App crashes, data loss, core flow completely blocked

<!-- Example:
### BUG-001: App crashes when uploading large images
- **Severity:** Critical
- **Found in:** Task 3.2 - Animal Registration
- **Browser:** Chrome Mobile
- **Device:** Android Pixel 5
- **Steps to Reproduce:**
  1. Navigate to Register Animal
  2. Select Cattle → Cow
  3. Click "Add Photo"
  4. Select image larger than 5MB
  5. App crashes with white screen
- **Expected:** Image should be compressed and uploaded
- **Actual:** App crashes, console shows "Out of memory" error
- **Screenshot:** [Attach screenshot]
- **Console Errors:**
  ```
  Error: Out of memory
  at imageCompression.ts:45
  ```
- **Status:** 🔴 Open
- **Priority:** Fix immediately
- **Assigned to:** [Name]
- **Fixed in:** [Commit/PR]
-->

---

## 🟠 High Priority Bugs (Should Fix Before Exhibition)

> Major feature broken, poor UX, difficult workaround

<!-- Example:
### BUG-002: Milk recording doesn't save offline
- **Severity:** High
- **Found in:** Task 4.2 - Offline Milk Recording
- **Browser:** Chrome Desktop
- **Steps to Reproduce:**
  1. Enable airplane mode
  2. Navigate to Record Milk
  3. Select cow and amount
  4. Click "Record Milk"
  5. Record appears in UI but not in offline queue
- **Expected:** Record should be queued for sync
- **Actual:** Record disappears after page refresh
- **Screenshot:** [Attach]
- **Status:** 🟡 In Progress
- **Priority:** Fix before deployment
- **Workaround:** Tell users to stay online
-->

---

## 🟡 Medium Priority Bugs (Fix If Time Allows)

> Minor feature issue, workaround available

<!-- Example:
### BUG-003: Language selector doesn't show current language
- **Severity:** Medium
- **Found in:** Task 5.1 - Language Switching
- **Browser:** All browsers
- **Steps to Reproduce:**
  1. Switch to Amharic
  2. Look at language selector
  3. Still shows "English" as selected
- **Expected:** Should show "አማርኛ" as selected
- **Actual:** Shows "English" even though UI is in Amharic
- **Screenshot:** [Attach]
- **Status:** 🟢 Fixed
- **Workaround:** Users can still switch languages, just confusing
- **Fixed in:** commit abc123
-->

---

## 🟢 Low Priority Bugs (Add to Backlog)

> Cosmetic issues, nice-to-have improvements

<!-- Example:
### BUG-004: Animal card image slightly misaligned on mobile
- **Severity:** Low
- **Found in:** Task 6.1 - Mobile Responsiveness
- **Browser:** Safari iOS
- **Steps to Reproduce:**
  1. View animal list on iPhone
  2. Notice animal photos are 2px off-center
- **Expected:** Photos centered in card
- **Actual:** Photos slightly left-aligned
- **Screenshot:** [Attach]
- **Status:** 🔵 Deferred
- **Priority:** Fix after exhibition
-->

---

## ✅ Fixed Bugs

<!-- Move bugs here after they're fixed and verified -->

---

## 📝 Testing Notes

### General Observations
- [Note any patterns or recurring issues]
- [Performance observations]
- [User experience feedback]

### Environment Issues
- [Any setup or configuration problems]
- [Browser-specific quirks]
- [Device-specific issues]

### Positive Findings
- [What works really well]
- [Features that exceeded expectations]
- [Good user experience moments]

---

## 🎯 Deployment Readiness Assessment

### Blocking Issues
- [ ] All critical bugs fixed
- [ ] All high priority bugs fixed or have workarounds
- [ ] Core user flows work end-to-end

### Risk Assessment
**Overall Risk Level:** 🟢 Low / 🟡 Medium / 🔴 High

**Justification:**
[Explain why you think the app is/isn't ready for exhibition]

### Recommendations
- [ ] **GO for deployment** - App is exhibition ready
- [ ] **GO with caution** - App works but has known issues
- [ ] **NO GO** - Critical issues must be fixed first

**Conditions for GO:**
[List any conditions or workarounds needed]

---

## 📋 Bug Template (Copy This)

```markdown
### BUG-XXX: [Brief title]
- **Severity:** Critical / High / Medium / Low
- **Found in:** Task X.X - [Task name]
- **Browser:** Chrome / Firefox / Safari / Mobile
- **Device:** Desktop / Android / iOS
- **Steps to Reproduce:**
  1. Step 1
  2. Step 2
  3. Step 3
- **Expected:** What should happen
- **Actual:** What actually happened
- **Screenshot:** [Attach screenshot]
- **Console Errors:** 
  ```
  [Paste any console errors]
  ```
- **Status:** 🔴 Open / 🟡 In Progress / 🟢 Fixed / 🔵 Deferred
- **Priority:** Fix immediately / Fix before deployment / Fix after exhibition
- **Workaround:** [If any]
- **Assigned to:** [Name]
- **Fixed in:** [Commit/PR number]
```

---

## 🔍 How to Use This Document

1. **As you test**, add bugs immediately using the template
2. **Categorize by severity** - be honest about impact
3. **Update status** as bugs get fixed
4. **Move fixed bugs** to the "Fixed Bugs" section
5. **Update summary table** at the top
6. **Use for triage meetings** to prioritize fixes
7. **Reference in deployment decision** - are we ready?

---

## 📞 Quick Reference

**Severity Guidelines:**
- **Critical:** Can't demo core features, data loss, crashes
- **High:** Major feature broken, very poor UX, hard to work around
- **Medium:** Minor feature issue, annoying but not blocking
- **Low:** Cosmetic, nice-to-have, doesn't affect functionality

**Status Indicators:**
- 🔴 Open - Not started
- 🟡 In Progress - Being worked on
- 🟢 Fixed - Fixed and verified
- 🔵 Deferred - Will fix later

**Priority Levels:**
- **Fix immediately:** Blocking exhibition
- **Fix before deployment:** Should fix but not blocking
- **Fix after exhibition:** Add to backlog

---

**Last Updated:** [Date/Time]
