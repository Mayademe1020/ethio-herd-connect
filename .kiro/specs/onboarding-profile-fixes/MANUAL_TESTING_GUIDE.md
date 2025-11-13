# Manual Testing Guide - Task 8
## Onboarding Profile Fixes Verification

This guide will help you systematically test all the requirements for the onboarding profile fixes.

---

## Prerequisites

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Have test devices ready:**
   - Desktop browser (Chrome/Edge)
   - iOS device with Safari
   - Android device with Chrome

3. **Prepare keyboard inputs:**
   - Amharic keyboard enabled on your device
   - Latin/English keyboard

4. **Network throttling tools:**
   - Chrome DevTools (F12 → Network tab → Throttling dropdown)
   - Or use your device's network settings

---

## Test Checklist

### ✅ 1. Amharic Keyboard Input Testing

**Test Location:** Onboarding page - Farm Name field

- [ ] Open the app and navigate to onboarding
- [ ] Switch to Amharic keyboard on your device
- [ ] Type Amharic characters in the "Farm Name" field
- [ ] **Expected:** Characters appear correctly without lag
- [ ] **Expected:** No auto-correct suggestions appear
- [ ] **Expected:** No red underlines on Amharic text
- [ ] Try typing: `የእንስሳት እርሻ` (Animal Farm in Amharic)
- [ ] **Expected:** Text saves correctly when you proceed

**Requirements Verified:** 1.3, 2.3, 3.1

---

### ✅ 2. Latin Keyboard Input Testing

**Test Location:** Onboarding page - Farm Name field

- [ ] Switch to English/Latin keyboard
- [ ] Type English characters in the "Farm Name" field
- [ ] **Expected:** Characters appear correctly
- [ ] **Expected:** No auto-correct suggestions appear
- [ ] **Expected:** No spell-check underlines
- [ ] Try typing: `Green Valley Farm`
- [ ] Try typing intentional misspellings: `Grean Valey Ferm`
- [ ] **Expected:** No corrections or suggestions offered

**Requirements Verified:** 1.3, 2.3, 3.2

---

### ✅ 3. Auto-Correct Disabled Verification

**Test Location:** Onboarding page - Farm Name field

- [ ] Type a deliberately misspelled word: `Farmm` or `Rannch`
- [ ] **Expected:** No auto-correct popup appears
- [ ] **Expected:** No automatic correction happens
- [ ] **Expected:** No red/blue underlines appear
- [ ] Right-click on the text (desktop)
- [ ] **Expected:** No spelling suggestions in context menu
- [ ] Type mixed language text: `My የእንስሳት Farm`
- [ ] **Expected:** No corrections on any part

**Requirements Verified:** 3.1, 3.2, 3.3

---

### ✅ 4. iOS Safari Testing

**Device:** iPhone/iPad with Safari

- [ ] Open the app in Safari
- [ ] Navigate to onboarding page
- [ ] Test Amharic keyboard input
  - [ ] Switch to Amharic keyboard in iOS settings
  - [ ] Type Amharic characters
  - [ ] **Expected:** No autocorrect suggestions
  - [ ] **Expected:** Smooth typing experience
- [ ] Test Latin keyboard input
  - [ ] Switch back to English keyboard
  - [ ] Type English text
  - [ ] **Expected:** No autocorrect
- [ ] Check console for errors:
  - [ ] Connect device to Mac
  - [ ] Open Safari → Develop → [Your Device] → [Your Tab]
  - [ ] Check Console tab
  - [ ] **Expected:** No errors related to input fields

**Requirements Verified:** 4.1, 5.1, 5.2

---

### ✅ 5. Android Chrome Testing

**Device:** Android phone/tablet with Chrome

- [ ] Open the app in Chrome
- [ ] Navigate to onboarding page
- [ ] Test Amharic keyboard input
  - [ ] Install Amharic keyboard (Gboard supports Amharic)
  - [ ] Switch to Amharic keyboard
  - [ ] Type Amharic characters
  - [ ] **Expected:** No autocorrect suggestions
  - [ ] **Expected:** Smooth typing experience
- [ ] Test Latin keyboard input
  - [ ] Switch to English keyboard
  - [ ] Type English text
  - [ ] **Expected:** No autocorrect
- [ ] Check console for errors:
  - [ ] Enable USB debugging on Android
  - [ ] Connect to computer
  - [ ] Open Chrome → chrome://inspect
  - [ ] Inspect your device
  - [ ] Check Console tab
  - [ ] **Expected:** No errors related to input fields

**Requirements Verified:** 4.2, 5.3, 5.4

---

### ✅ 6. Slow Network Connection Testing

**Test Location:** Onboarding page

#### Desktop Testing:
- [ ] Open Chrome DevTools (F12)
- [ ] Go to Network tab
- [ ] Set throttling to "Slow 3G"
- [ ] Refresh the page
- [ ] Navigate to onboarding
- [ ] Type in the Farm Name field
- [ ] **Expected:** Input remains responsive
- [ ] **Expected:** No lag in character appearance
- [ ] **Expected:** No autocorrect even on slow network
- [ ] Submit the form
- [ ] **Expected:** Form submits successfully (may be slow)

#### Mobile Testing:
- [ ] On iOS: Settings → Developer → Network Link Conditioner → Enable "3G"
- [ ] On Android: Developer Options → Select USB Configuration → Enable "Slow 3G"
- [ ] Open the app
- [ ] Test typing in Farm Name field
- [ ] **Expected:** Responsive input despite slow network

**Requirements Verified:** 5.1, 5.2, 5.3, 5.4

---

### ✅ 7. Console Error Verification

**Test Location:** All pages with input fields

#### Desktop:
- [ ] Open DevTools Console (F12 → Console)
- [ ] Clear console
- [ ] Navigate to onboarding page
- [ ] Type in Farm Name field with Amharic
- [ ] Type in Farm Name field with Latin
- [ ] Submit the form
- [ ] **Expected:** No errors in console
- [ ] **Expected:** No warnings about input attributes
- [ ] **Expected:** No React warnings

#### Mobile (iOS):
- [ ] Connect iPhone to Mac
- [ ] Safari → Develop → [Device] → [Tab]
- [ ] Check Console
- [ ] **Expected:** No errors

#### Mobile (Android):
- [ ] Connect Android to computer
- [ ] Chrome → chrome://inspect
- [ ] Check Console
- [ ] **Expected:** No errors

**Requirements Verified:** All (1.3, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4)

---

## Common Issues to Watch For

### ❌ Issues that indicate problems:

1. **Auto-correct appearing:** Red/blue underlines, suggestion popups
2. **Lag in typing:** Delay between keypress and character appearance
3. **Console errors:** Any JavaScript errors related to input fields
4. **Keyboard issues:** Keyboard not appearing, wrong keyboard type
5. **Data loss:** Farm name not saving correctly
6. **Mixed language issues:** Problems when switching between keyboards

---

## Test Results Template

Copy this template to document your findings:

```
## Test Results - [Date]

### Amharic Keyboard Input
- Status: ✅ Pass / ❌ Fail
- Notes: 

### Latin Keyboard Input
- Status: ✅ Pass / ❌ Fail
- Notes: 

### Auto-Correct Disabled
- Status: ✅ Pass / ❌ Fail
- Notes: 

### iOS Safari
- Status: ✅ Pass / ❌ Fail
- Device: 
- iOS Version: 
- Notes: 

### Android Chrome
- Status: ✅ Pass / ❌ Fail
- Device: 
- Android Version: 
- Notes: 

### Slow Network
- Status: ✅ Pass / ❌ Fail
- Notes: 

### Console Errors
- Status: ✅ Pass / ❌ Fail
- Errors Found: 

### Overall Status
- [ ] All tests passed
- [ ] Issues found (document below)

### Issues Found:
1. 
2. 
3. 
```

---

## Quick Start Commands

**To start testing right now:**

1. Open your terminal
2. Run: `npm run dev`
3. Open browser to the URL shown (usually http://localhost:5173)
4. Follow the checklist above

**To test on mobile:**

1. Find your computer's local IP address
2. Make sure mobile device is on same WiFi
3. Open browser on mobile to: `http://[YOUR-IP]:5173`
4. Follow mobile testing sections above

---

## Next Steps After Testing

Once you complete all tests:

1. Document any issues found
2. If all tests pass, mark task 8 as complete
3. If issues found, create bug reports for each issue
4. Retest after fixes are applied
