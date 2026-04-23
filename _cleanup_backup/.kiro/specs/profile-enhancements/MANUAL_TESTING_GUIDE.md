# Profile Enhancements - Manual Testing Guide

## Overview

This guide provides step-by-step instructions for manually testing all profile enhancement features. Complete each test case and mark it as ✅ Pass or ❌ Fail.

**Testing Environment:**
- Device: [Your device]
- Browser: [Your browser]
- Date: [Testing date]
- Tester: [Your name]

---

## Pre-Testing Setup

### Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure you have test accounts:**
   - Account with animals, milk records, and listings
   - Account with no data (fresh account)

3. **Test both languages:**
   - English
   - Amharic (አማርኛ)

4. **Prepare for offline testing:**
   - Know how to disable network on your device
   - Have DevTools ready (F12 in browser)

---

## Test Suite 1: Display Real User Data

**Requirements Tested:** 1.1, 1.2, 1.3, 2.1

### Test 1.1: Login and View Profile with Existing Account

**Steps:**
1. Open the app in your browser
2. Login with an existing account that has:
   - Farmer name set
   - Farm name set
   - Some animals registered
3. Navigate to Profile page (tap Profile icon in bottom navigation)

**Expected Results:**
- [ ] Profile page loads successfully
- [ ] Your actual farmer name displays at the top (not "John Doe" or placeholder)
- [ ] Your farm name displays below your name
- [ ] Phone number displays correctly (format: +251...)
- [ ] No placeholder or dummy data visible

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 1.2: View Profile Without Farm Name

**Steps:**
1. Login with an account that has:
   - Farmer name set
   - NO farm name set
2. Navigate to Profile page

**Expected Results:**
- [x] Farmer name displays correctly



- [ ] No empty space or "null" where farm name would be
- [ ] Layout looks clean without farm name
- [ ] No error messages

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 1.3: Profile Loading State

**Steps:**
1. Open DevTools (F12) → Network tab
2. Set throttling to "Slow 3G"
3. Refresh the profile page
4. Observe the loading state

**Expected Results:**
- [x] Skeleton loaders appear while data loads



- [ ] No "undefined" or "null" text visible



- [ ] Loading state looks professional
- [ ] Data appears smoothly after loading

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 1.4: Profile Load Error Handling

**Steps:**
1. Open DevTools → Network tab
2. Set to "Offline" mode
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try to load profile page

**Expected Results:**
- [x] Error message displays clearly

- [x] Message says something like "Unable to load profile"
- [x] "Retry" button is visible
- [x] No crash or blank screen

**Status:** ✅ Pass / ⬜ Fail  
**Notes:** Error handling is implemented in Profile.tsx lines 367-387. Shows AlertCircle icon, error title, description, and Retry button. Works in both English and Amharic.

---

## Test Suite 2: Farm Statistics Card

**Requirements Tested:** 2.1, 2.2, 2.3, 2.4, 2.5

### Test 2.1: View Statistics with Data

**Steps:**
1. Login with account that has:
   - At least 2 animals registered
   - Some milk records in last 30 days
   - At least 1 active marketplace listing
2. Navigate to Profile page
3. Locate the "Farm Statistics" card

**Expected Results:**
- [ ] Statistics card is visible
- [ ] Shows correct number of animals (count matches My Animals page)
- [ ] Shows milk amount in liters (e.g., "15.5 L")
- [ ] Shows correct number of active listings
- [ ] Icons display correctly (cow, droplet, shopping bag)
- [ ] Numbers are readable and properly formatted

**Status:** ⬜ Pass / ⬜ Fail  
**Actual Values:**
- Animals: ___
- Milk (30 days): ___ L
- Listings: ___

---

### Test 2.2: Statistics with No Animals

**Steps:**
1. Login with a fresh account (no animals registered)
2. Navigate to Profile page
3. Check the statistics card

**Expected Results:**
- [ ] Shows "0 Animals"
- [ ] Shows "0 L" for milk
- [ ] Shows "0 Listings"
- [ ] No error messages
- [ ] Card still looks good with zeros

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 2.3: Verify Milk Calculation (Last 30 Days)

**Steps:**
1. Login with account that has milk records
2. Note today's date
3. Go to Milk Production Records page
4. Manually count milk records from last 30 days
5. Sum up the liters
6. Go back to Profile page
7. Compare the statistics card value

**Expected Results:**
- [ ] Statistics card shows only milk from last 30 days
- [ ] Older records (>30 days) are NOT included
- [ ] Calculation is accurate (matches your manual count)

**Status:** ⬜ Pass / ⬜ Fail  
**Manual Count:** ___ L  
**App Shows:** ___ L

---

### Test 2.4: Statistics Loading State

**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Refresh profile page
4. Watch the statistics card

**Expected Results:**
- [ ] Loading indicators appear in statistics card
- [ ] No "undefined" or "NaN" values
- [ ] Smooth transition when data loads

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Test Suite 3: Quick Actions

**Requirements Tested:** 3.1, 3.2, 3.3, 3.4, 3.5, 3.6

### Test 3.1: Quick Actions Display

**Steps:**
1. Login with any account
2. Navigate to Profile page
3. Locate the "Quick Actions" section

**Expected Results:**
- [ ] Three action buttons are visible:
  - Register New Animal
  - Record Milk
  - Create Listing
- [ ] Each button has an icon
- [ ] Text is clear and readable
- [ ] Buttons are large enough to tap easily (44px+ touch target)

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 3.2: Register Animal Action

**Steps:**
1. From Profile page
2. Tap "Register New Animal" button

**Expected Results:**
- [ ] Navigates to /register-animal page
- [ ] Navigation is instant (no delay)
- [ ] Register Animal form loads correctly

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 3.3: Record Milk with No Animals

**Steps:**
1. Login with account that has NO animals
2. Navigate to Profile page
3. Tap "Record Milk" button

**Expected Results:**
- [ ] Toast/message appears
- [ ] Message says something like "Please register animals first"
- [ ] Does NOT navigate to Record Milk page
- [ ] Message is in correct language (English or Amharic)

**Status:** ⬜ Pass / ⬜ Fail  
**Message Text:**

---

### Test 3.4: Record Milk with Animals

**Steps:**
1. Login with account that HAS animals
2. Navigate to Profile page
3. Tap "Record Milk" button

**Expected Results:**
- [x] Navigates to /record-milk page
- [x] No error message
- [x] Record Milk form loads correctly


**Status:** ✅ Pass / ⬜ Fail  
**Notes:** Verified - Form loads with proper structure: header, cow selection grid with search/favorites, amount selector with quick buttons and custom input, and submit button. All components render without errors.

---

### Test 3.5: Create Listing with No Animals

**Steps:**
1. Login with account that has NO animals
2. Navigate to Profile page
3. Tap "Create Listing" button

**Expected Results:**
- [ ] Toast/message appears
- [ ] Message says something like "Please register animals first"
- [ ] Does NOT navigate to Create Listing page
- [ ] Message is in correct language

**Status:** ⬜ Pass / ⬜ Fail  
**Message Text:**

---

### Test 3.6: Create Listing with Animals

**Steps:**
1. Login with account that HAS animals
2. Navigate to Profile page
3. Tap "Create Listing" button

**Expected Results:**
- [ ] Navigates to /create-listing page
- [ ] No error message
- [ ] Create Listing form loads correctly

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Test Suite 4: Edit Profile

**Requirements Tested:** 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8

### Test 4.1: Open Edit Profile Modal

**Steps:**
1. Navigate to Profile page
2. Tap "Edit Profile" button (near your name)

**Expected Results:**
- [ ] Modal/dialog opens
- [ ] Modal has title "Edit Profile"
- [ ] Current farmer name is pre-filled
- [ ] Current farm name is pre-filled (if exists)
- [ ] Two input fields visible
- [ ] Save and Cancel buttons visible

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.2: Edit Farmer Name Successfully

**Steps:**
1. Open Edit Profile modal
2. Change farmer name to a valid full name (e.g., "Abebe Kebede")
3. Keep farm name as is
4. Tap "Save"

**Expected Results:**
- [ ] Modal closes
- [ ] Success message appears (toast)
- [ ] Profile page shows updated name immediately
- [ ] Refresh page → name still updated

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.3: Edit Farm Name Successfully

**Steps:**
1. Open Edit Profile modal
2. Keep farmer name as is
3. Change farm name to something new (e.g., "Sunshine Farm")
4. Tap "Save"

**Expected Results:**
- [ ] Modal closes
- [ ] Success message appears
- [ ] Profile page shows updated farm name immediately
- [ ] Refresh page → farm name still updated

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.4: Validation - Single Word Name

**Steps:**
1. Open Edit Profile modal
2. Change farmer name to single word (e.g., "Abebe")
3. Tap "Save"

**Expected Results:**
- [ ] Error message appears
- [ ] Message says name must have at least 2 words
- [ ] Modal stays open
- [ ] Save button doesn't work until fixed

**Status:** ⬜ Pass / ⬜ Fail  
**Error Message:**

---

### Test 4.5: Validation - Empty Farmer Name

**Steps:**
1. Open Edit Profile modal
2. Clear the farmer name field (make it empty)
3. Tap "Save"

**Expected Results:**
- [ ] Error message appears
- [ ] Modal stays open
- [ ] Cannot save with empty name

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.6: Farm Name is Optional

**Steps:**
1. Open Edit Profile modal
2. Clear the farm name field (make it empty)
3. Keep farmer name valid
4. Tap "Save"

**Expected Results:**
- [ ] Save succeeds
- [ ] No error about empty farm name
- [ ] Profile shows only farmer name (no farm name)

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.7: Cancel Edit

**Steps:**
1. Open Edit Profile modal
2. Change both farmer name and farm name
3. Tap "Cancel" button

**Expected Results:**
- [ ] Modal closes
- [ ] No changes saved
- [ ] Profile shows original names
- [ ] No error messages

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 4.8: Edit Profile with Network Error

**Steps:**
1. Open Edit Profile modal
2. Open DevTools → Network tab
3. Set to "Offline" mode
4. Change farmer name
5. Tap "Save"

**Expected Results:**
- [ ] Error message appears
- [ ] Message mentions network/connection issue
- [ ] Modal stays open
- [ ] Can try again when back online

**Status:** ⬜ Pass / ⬜ Fail  
**Error Message:**

---

## Test Suite 5: Logout Confirmation

**Requirements Tested:** 6.1, 6.2, 6.3, 6.4, 6.5

### Test 5.1: Logout Button Visible

**Steps:**
1. Navigate to Profile page
2. Scroll to bottom

**Expected Results:**
- [ ] Logout button is visible
- [ ] Button is clearly labeled "Logout" or "ውጣ"
- [ ] Button looks like a logout button (red or prominent)

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 5.2: Logout Confirmation Dialog

**Steps:**
1. Tap the Logout button

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Dialog asks "Are you sure you want to logout?"
- [ ] Message is in correct language (English or Amharic)
- [ ] Two buttons visible: Cancel and Logout/Confirm

**Status:** ⬜ Pass / ⬜ Fail  
**Dialog Text:**

---

### Test 5.3: Cancel Logout

**Steps:**
1. Tap Logout button
2. In confirmation dialog, tap "Cancel"

**Expected Results:**
- [ ] Dialog closes
- [ ] Still on Profile page
- [ ] Still logged in
- [ ] No errors

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 5.4: Confirm Logout

**Steps:**
1. Tap Logout button
2. In confirmation dialog, tap "Logout" or "Confirm"

**Expected Results:**
- [ ] Dialog closes
- [ ] Redirects to login page
- [ ] Session is cleared
- [ ] Cannot go back to profile without logging in again

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 5.5: Logout in Both Languages

**Steps:**
1. Change language to Amharic
2. Go to Profile page
3. Tap Logout button
4. Check confirmation dialog text
5. Cancel
6. Change language to English
7. Repeat

**Expected Results:**
- [ ] Amharic dialog shows Amharic text
- [ ] English dialog shows English text
- [ ] Both work correctly

**Status:** ⬜ Pass / ⬜ Fail  
**Amharic Text:**  
**English Text:**

---

## Test Suite 6: Offline Behavior

**Requirements Tested:** 8.1, 8.2, 8.3, 8.4, 8.5

### Test 6.1: Load Profile While Online

**Steps:**
1. Ensure you're online
2. Login and navigate to Profile page
3. Wait for everything to load
4. Note the data displayed

**Expected Results:**
- [ ] Profile loads successfully
- [ ] All data displays correctly
- [ ] No errors

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 6.2: View Cached Profile Offline

**Steps:**
1. After Test 6.1, with profile loaded
2. Open DevTools → Network tab
3. Set to "Offline" mode
4. Refresh the page (F5)

**Expected Results:**
- [ ] Profile page loads from cache
- [ ] Shows the same data as before
- [ ] No "Unable to load" error
- [ ] May show "offline" indicator

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 6.3: Try to Edit Profile Offline

**Steps:**
1. While offline (from Test 6.2)
2. Try to tap "Edit Profile" button

**Expected Results:**
- [ ] Either button is disabled, OR
- [ ] Modal opens but shows message about needing internet, OR
- [ ] Error message when trying to save
- [ ] Clear indication that editing requires internet

**Status:** ⬜ Pass / ⬜ Fail  
**Behavior:**

---

### Test 6.4: Return Online and Refresh

**Steps:**
1. While viewing cached profile offline
2. Open DevTools → Network tab
3. Set back to "Online" mode
4. Wait a few seconds or refresh page

**Expected Results:**
- [ ] Profile data refreshes automatically
- [ ] Shows latest data from server
- [ ] No errors
- [ ] Smooth transition

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 6.5: Stale Data Indicator

**Steps:**
1. Load profile while online
2. Go offline
3. Wait 24+ hours (or manually set device time forward)
4. View profile

**Expected Results:**
- [ ] Shows cached data
- [ ] Displays indicator that data may be outdated
- [ ] Suggests going online to refresh

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:** (This test may be skipped if time-consuming)

---

## Test Suite 7: Mobile Device Testing

**Requirements Tested:** All requirements on mobile devices

### Test 7.1: iOS Safari Testing

**Device:** [iPhone model]  
**iOS Version:** [version]

**Steps:**
1. Open app in Safari on iPhone
2. Login and navigate to Profile
3. Test all features:
   - View profile data
   - Tap quick actions
   - Edit profile
   - Logout

**Expected Results:**
- [ ] All features work on iOS Safari
- [ ] Touch targets are easy to tap (44px+)
- [ ] No layout issues
- [ ] Modals display correctly
- [ ] Scrolling is smooth
- [ ] No iOS-specific bugs

**Status:** ⬜ Pass / ⬜ Fail  
**Issues Found:**

---

### Test 7.2: Android Chrome Testing

**Device:** [Android model]  
**Android Version:** [version]

**Steps:**
1. Open app in Chrome on Android
2. Login and navigate to Profile
3. Test all features:
   - View profile data
   - Tap quick actions
   - Edit profile
   - Logout

**Expected Results:**
- [ ] All features work on Android Chrome
- [ ] Touch targets are easy to tap
- [ ] No layout issues
- [ ] Modals display correctly
- [ ] Scrolling is smooth
- [ ] No Android-specific bugs

**Status:** ⬜ Pass / ⬜ Fail  
**Issues Found:**

---

### Test 7.3: Mobile Touch Targets

**Steps:**
1. On mobile device, navigate to Profile
2. Try tapping all interactive elements:
   - Edit Profile button
   - Quick action buttons
   - Settings toggles
   - Logout button

**Expected Results:**
- [ ] All buttons are easy to tap (not too small)
- [ ] No accidental taps on wrong elements
- [ ] Buttons have adequate spacing
- [ ] Touch feedback is clear (visual response)

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 7.4: Mobile Scrolling

**Steps:**
1. On mobile device, view Profile page
2. Scroll up and down
3. Open Edit Profile modal and scroll if needed

**Expected Results:**
- [ ] Scrolling is smooth
- [ ] No janky/stuttering scrolling
- [ ] Can scroll to see all content
- [ ] Bottom navigation doesn't interfere

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 7.5: Mobile Modals

**Steps:**
1. On mobile device
2. Open Edit Profile modal
3. Open Logout confirmation dialog

**Expected Results:**
- [ ] Modals display correctly on small screen
- [ ] All content is visible
- [ ] Can interact with all buttons
- [ ] Can close modals easily
- [ ] No content cut off

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Test Suite 8: Bilingual Testing

### Test 8.1: English Language

**Steps:**
1. Set language to English
2. Navigate to Profile page
3. Check all text elements

**Expected Results:**
- [ ] All text is in English
- [ ] No Amharic text mixed in
- [ ] Translations make sense
- [ ] No "undefined" or missing translations

**Status:** ⬜ Pass / ⬜ Fail  
**Issues:**

---

### Test 8.2: Amharic Language

**Steps:**
1. Set language to Amharic (አማርኛ)
2. Navigate to Profile page
3. Check all text elements

**Expected Results:**
- [ ] All text is in Amharic
- [ ] No English text mixed in
- [ ] Translations make sense
- [ ] Amharic text displays correctly (no boxes/gibberish)

**Status:** ⬜ Pass / ⬜ Fail  
**Issues:**

---

### Test 8.3: Language Switch

**Steps:**
1. View Profile in English
2. Switch to Amharic
3. Observe the change
4. Switch back to English

**Expected Results:**
- [ ] Language changes immediately
- [ ] All text updates
- [ ] No page refresh needed
- [ ] No errors during switch

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Test Suite 9: Edge Cases

### Test 9.1: Very Long Names

**Steps:**
1. Edit profile
2. Enter very long farmer name (e.g., 50+ characters)
3. Enter very long farm name
4. Save

**Expected Results:**
- [ ] Names save successfully
- [ ] Display doesn't break layout
- [ ] Text wraps or truncates gracefully
- [ ] No overflow issues

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 9.2: Special Characters in Names

**Steps:**
1. Edit profile
2. Enter name with special characters (e.g., "Abebe-Kebede O'Brien")
3. Save

**Expected Results:**
- [ ] Saves successfully
- [ ] Displays correctly
- [ ] No encoding issues

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 9.3: Large Numbers in Statistics

**Steps:**
1. Use account with many animals (100+) or lots of milk records
2. View statistics card

**Expected Results:**
- [ ] Large numbers display correctly
- [ ] No layout breaking
- [ ] Numbers are formatted (e.g., "1,234" or "1234")

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

### Test 9.4: Rapid Button Tapping

**Steps:**
1. Tap "Edit Profile" button multiple times rapidly
2. Tap "Save" button multiple times rapidly
3. Tap quick action buttons rapidly

**Expected Results:**
- [ ] No duplicate modals open
- [ ] No duplicate saves
- [ ] No crashes
- [ ] Buttons handle rapid taps gracefully

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Test Suite 10: Performance

### Test 10.1: Profile Load Time

**Steps:**
1. Open DevTools → Network tab
2. Clear cache
3. Refresh profile page
4. Note load time

**Expected Results:**
- [ ] Profile loads in under 3 seconds on good connection
- [ ] No unnecessary network requests
- [ ] Images/icons load quickly

**Status:** ⬜ Pass / ⬜ Fail  
**Load Time:** ___ seconds

---

### Test 10.2: Statistics Calculation Performance

**Steps:**
1. Use account with lots of data (100+ animals, 1000+ milk records)
2. Navigate to Profile
3. Observe statistics load time

**Expected Results:**
- [ ] Statistics load within 2-3 seconds
- [ ] No browser freeze
- [ ] Smooth experience

**Status:** ⬜ Pass / ⬜ Fail  
**Notes:**

---

## Summary

### Test Results Overview

**Total Tests:** 60+  
**Passed:** ___  
**Failed:** ___  
**Skipped:** ___

### Critical Issues Found

1. 
2. 
3. 

### Minor Issues Found

1. 
2. 
3. 

### Recommendations

1. 
2. 
3. 

### Sign-off

**Tester Name:** _______________  
**Date:** _______________  
**Overall Status:** ⬜ Ready for Production / ⬜ Needs Fixes

---

## Quick Reference Checklist

Use this for a quick smoke test:

- [ ] Login and see real name/farm name
- [ ] Statistics show correct numbers
- [ ] All 3 quick actions work
- [ ] Edit profile and save successfully
- [ ] Logout with confirmation works
- [ ] Works offline (cached data)
- [ ] Works on mobile device
- [ ] Works in both languages
- [ ] No console errors
- [ ] Performance is acceptable

---

## Tips for Effective Testing

1. **Test with real data:** Use accounts with actual animals, milk records, and listings
2. **Test edge cases:** Empty states, large numbers, special characters
3. **Test both languages:** Switch between English and Amharic
4. **Test on real devices:** Don't just use browser DevTools mobile emulation
5. **Test offline:** Actually disconnect from internet, don't just use DevTools
6. **Take screenshots:** Document any issues you find
7. **Note exact error messages:** Copy the exact text of any errors
8. **Test slowly:** Don't rush through the tests
9. **Retest after fixes:** If bugs are fixed, retest those specific areas
10. **Think like a farmer:** Would this be easy for an Ethiopian farmer to use?

---

## Reporting Issues

When you find a bug, document:

1. **What you were doing** (exact steps)
2. **What you expected** to happen
3. **What actually happened**
4. **Screenshots** (if applicable)
5. **Device/browser** information
6. **How often** it happens (always, sometimes, once)

Good luck with testing! 🧪
