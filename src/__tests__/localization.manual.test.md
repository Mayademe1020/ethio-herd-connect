# Manual Localization Testing Guide

This guide covers all 23 test cases from FINAL_TESTING_REPORT.md Section 13.6.

## Test Environment Setup
- Browser: Chrome/Firefox
- Device: Desktop + Mobile (Android recommended)
- Network: Online

## 13.6.1 Amharic Display (7 tests)

### Test 1: Login Page Amharic Labels
**Steps:**
1. Open application
2. If logged in, logout first
3. On login page, switch language to Amharic (if not already)
4. Verify all text is in Amharic

**Expected Results:**
- ✅ "ስልክ ቁጥር" (Phone Number) label visible
- ✅ "ኮድ ላክ" (Send Code) button visible
- ✅ "6 አሃዝ ኮድ ያስገቡ" (Enter 6-digit code) placeholder visible
- ✅ No English text visible on page

**Status:** ⬜ Pass ⬜ Fail

---

### Test 2: Home Dashboard Amharic Labels
**Steps:**
1. Login to application
2. Navigate to home dashboard
3. Switch language to Amharic
4. Verify all quick action buttons and labels

**Expected Results:**
- ✅ "እንኳን ደህና መጡ" (Welcome) greeting visible
- ✅ "ወተት ይመዝግቡ" (Record Milk) button visible
- ✅ "እንስሳ ያክሉ" (Add Animal) button visible
- ✅ "እንስሳቶቼ" (My Animals) button visible
- ✅ "ገበያ" (Marketplace) button visible
- ✅ Sync status in Amharic

**Status:** ⬜ Pass ⬜ Fail

---

### Test 3: Animal Registration Amharic Labels
**Steps:**
1. Click "Add Animal" button
2. Verify animal type selection screen
3. Select an animal type
4. Verify subtype selection screen

**Expected Results:**
- ✅ "ላም" (Cattle) option visible
- ✅ "ፍየል" (Goat) option visible
- ✅ "በግ" (Sheep) option visible
- ✅ Subtype labels in Amharic (e.g., "ላም", "በሬ", "ጥጃ")
- ✅ "ስም ያስገቡ" (Enter Name) label visible

**Status:** ⬜ Pass ⬜ Fail

---

### Test 4: Milk Recording Amharic Labels
**Steps:**
1. Navigate to "Record Milk" page
2. Verify cow selection screen
3. Select a cow
4. Verify amount selection screen

**Expected Results:**
- ✅ "ላም ይምረጡ" (Select Cow) label visible
- ✅ "ሊትር" (Liters) label visible
- ✅ Quick amount buttons visible (2L, 3L, 5L, etc.)
- ✅ "ጠዋት" (Morning) / "ማታ" (Evening) session labels

**Status:** ⬜ Pass ⬜ Fail

---

### Test 5: Marketplace Amharic Labels
**Steps:**
1. Navigate to Marketplace
2. Verify listing cards
3. Click on a listing
4. Verify listing detail page

**Expected Results:**
- ✅ "ገበያ" (Marketplace) title visible
- ✅ "ዋጋ" (Price) label visible
- ✅ "ብር" (Birr) currency label visible
- ✅ "ፍላጎት ያሳዩ" (Express Interest) button visible
- ✅ Filter labels in Amharic

**Status:** ⬜ Pass ⬜ Fail

---

### Test 6: Profile Page Amharic Labels
**Steps:**
1. Navigate to Profile page
2. Verify all settings and labels

**Expected Results:**
- ✅ "መገለጫ" (Profile) title visible
- ✅ "ቋንቋ" (Language) label visible
- ✅ "አማርኛ" (Amharic) option visible
- ✅ "ውጣ" (Logout) button visible

**Status:** ⬜ Pass ⬜ Fail

---

### Test 7: All Pages Display Correctly in Amharic
**Steps:**
1. Navigate through all pages in the app
2. Verify no English text appears (except proper nouns)

**Expected Results:**
- ✅ Login page: All Amharic
- ✅ Home: All Amharic
- ✅ Register Animal: All Amharic
- ✅ My Animals: All Amharic
- ✅ Animal Detail: All Amharic
- ✅ Record Milk: All Amharic
- ✅ Marketplace: All Amharic
- ✅ Profile: All Amharic

**Status:** ⬜ Pass ⬜ Fail

---

## 13.6.2 Language Switching (4 tests)

### Test 8: Language Switcher Works on Profile Page
**Steps:**
1. Navigate to Profile page
2. Current language should be displayed
3. Click language toggle/button
4. Verify language changes

**Expected Results:**
- ✅ Language toggle button visible
- ✅ Current language indicated (flag or text)
- ✅ Clicking toggle changes language
- ✅ UI updates immediately

**Status:** ⬜ Pass ⬜ Fail

---

### Test 9: UI Updates Immediately on Language Change
**Steps:**
1. On any page, switch language
2. Observe UI changes

**Expected Results:**
- ✅ All text changes instantly (no page reload)
- ✅ Buttons update to new language
- ✅ Labels update to new language
- ✅ Navigation items update to new language
- ✅ No delay or flicker

**Status:** ⬜ Pass ⬜ Fail

---

### Test 10: Language Preference Persists
**Steps:**
1. Switch language to English
2. Close browser tab
3. Reopen application
4. Verify language is still English

**Expected Results:**
- ✅ Language persists after browser close
- ✅ Language persists after page refresh
- ✅ Language persists across sessions

**Status:** ⬜ Pass ⬜ Fail

---

### Test 11: Flag Icons Display Correctly
**Steps:**
1. Navigate to Profile page
2. Observe language selector

**Expected Results:**
- ✅ Ethiopian flag (🇪🇹) for Amharic visible
- ✅ UK/US flag (🇬🇧/🇺🇸) for English visible
- ✅ Flags render correctly (not broken)
- ✅ Flags are appropriately sized

**Status:** ⬜ Pass ⬜ Fail

---

## 13.6.3 Error Messages (5 tests)

### Test 12: Authentication Errors in Both Languages
**Steps:**
1. On login page, enter invalid phone number
2. Try to send OTP
3. Observe error message
4. Switch language and repeat

**Expected Results:**
- ✅ Amharic: "ልክ ያልሆነ ስልክ ቁጥር" (Invalid phone number)
- ✅ English: "Invalid phone number"
- ✅ Error message displays prominently
- ✅ Error is user-friendly (not technical)

**Status:** ⬜ Pass ⬜ Fail

---

### Test 13: Validation Errors in Both Languages
**Steps:**
1. Try to register animal without selecting type
2. Try to record milk without selecting cow
3. Try to create listing without price
4. Observe validation errors in both languages

**Expected Results:**
- ✅ Amharic validation messages display correctly
- ✅ English validation messages display correctly
- ✅ Messages are specific to the field
- ✅ Messages are user-friendly

**Status:** ⬜ Pass ⬜ Fail

---

### Test 14: Network Errors in Both Languages
**Steps:**
1. Turn on airplane mode
2. Try to perform an action (register animal, record milk)
3. Observe offline message
4. Test in both languages

**Expected Results:**
- ✅ Amharic: "ኢንተርኔት የለም። መረጃው በስልክዎ ተቀምጧል።"
- ✅ English: "No internet. Your data is saved on your phone."
- ✅ Message is reassuring, not alarming
- ✅ Indicates data is saved locally

**Status:** ⬜ Pass ⬜ Fail

---

### Test 15: Upload Errors in Both Languages
**Steps:**
1. Try to upload a very large photo (>5MB)
2. Observe error message
3. Test in both languages

**Expected Results:**
- ✅ Amharic: "ፎቶው በጣም ትልቅ ነው። እባክዎ ሌላ ይምረጡ።"
- ✅ English: "Photo is too large. Please choose another."
- ✅ Error provides clear action to take
- ✅ Error is not technical

**Status:** ⬜ Pass ⬜ Fail

---

### Test 16: All Error Messages User-Friendly
**Steps:**
1. Review all error messages encountered
2. Verify none are technical (no "PGRST116", "JWT expired", etc.)

**Expected Results:**
- ✅ No database error codes shown
- ✅ No technical jargon
- ✅ All errors explain what happened
- ✅ All errors suggest what to do next

**Status:** ⬜ Pass ⬜ Fail

---

## 13.6.4 Layout Integrity (5 tests)

### Test 17: No Text Overflow with Amharic
**Steps:**
1. Switch to Amharic
2. Navigate through all pages
3. Look for text that overflows containers

**Expected Results:**
- ✅ No text cut off or hidden
- ✅ No horizontal scrolling
- ✅ All text fits within buttons
- ✅ All text fits within cards
- ✅ Long Amharic words wrap properly

**Status:** ⬜ Pass ⬜ Fail

---

### Test 18: Buttons Remain Properly Sized
**Steps:**
1. Switch to Amharic
2. Check all buttons on all pages
3. Verify buttons don't become too large or small

**Expected Results:**
- ✅ Quick action buttons maintain size
- ✅ Form submit buttons maintain size
- ✅ Navigation buttons maintain size
- ✅ Buttons remain tappable (min 44x44px)
- ✅ Button text doesn't overflow

**Status:** ⬜ Pass ⬜ Fail

---

### Test 19: Forms Layout Correctly
**Steps:**
1. Switch to Amharic
2. Open animal registration form
3. Open milk recording form
4. Open listing creation form
5. Verify all form layouts

**Expected Results:**
- ✅ Form labels align properly
- ✅ Input fields maintain proper width
- ✅ Form buttons align properly
- ✅ No overlapping elements
- ✅ Proper spacing maintained

**Status:** ⬜ Pass ⬜ Fail

---

### Test 20: Cards Display Properly
**Steps:**
1. Switch to Amharic
2. View animal cards on My Animals page
3. View listing cards on Marketplace
4. Verify card layouts

**Expected Results:**
- ✅ Animal cards maintain structure
- ✅ Listing cards maintain structure
- ✅ Card text doesn't overflow
- ✅ Card images display correctly
- ✅ Card actions remain accessible

**Status:** ⬜ Pass ⬜ Fail

---

### Test 21: Navigation Labels Fit Correctly
**Steps:**
1. Switch to Amharic
2. Check bottom navigation (if present)
3. Check top navigation/header
4. Check sidebar navigation (if present)

**Expected Results:**
- ✅ Navigation labels don't overflow
- ✅ Navigation icons visible
- ✅ Navigation items remain tappable
- ✅ Active state clearly indicated
- ✅ Proper spacing between items

**Status:** ⬜ Pass ⬜ Fail

---

## Summary

### Test Results
- **Total Tests:** 21
- **Passed:** ___
- **Failed:** ___
- **Not Tested:** ___

### Critical Issues Found
1. 
2. 
3. 

### Recommendations
1. 
2. 
3. 

### Sign-off
- **Tester Name:** _______________
- **Date:** _______________
- **Status:** ⬜ Ready for Exhibition ⬜ Needs Fixes
