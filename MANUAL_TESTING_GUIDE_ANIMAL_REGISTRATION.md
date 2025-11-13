# 📱 Manual Testing Guide - Animal Registration Flow

## 🎯 What We're Testing

Based on the actual code, we'll test the complete animal registration flow including:
- 4-step wizard for cattle (Type → Gender → Subtype → Name/Photo)
- 3-step wizard for goats/sheep (Type → Subtype → Name/Photo)
- Mobile responsiveness
- Photo upload and compression
- Form draft restoration
- Bilingual support (English/Amharic)

---

## 🚀 How to Start Testing

### Step 1: Start the Development Server

Open your terminal and run:
```bash
npm run dev
```

The app should start at: `http://127.0.0.1:5173`

### Step 2: Open in Browser

**Desktop Testing:**
- Open Chrome: `http://127.0.0.1:5173`
- Open DevTools: Press `F12`
- Check Console for errors

**Mobile Testing:**
- Open Chrome DevTools: `F12`
- Click device toolbar icon (or `Ctrl+Shift+M`)
- Select "iPhone 12 Pro" or "Pixel 5"
- Refresh the page

---

## 📋 Test Scenario 1: Register Cattle (4-Step Flow)

### Expected Flow:
```
Step 1: Select Type (Cattle) 
  ↓
Step 2: Select Gender (Male/Female)
  ↓
Step 3: Select Subtype (Bull/Cow/Ox/Heifer/Calf)
  ↓
Step 4: Name & Photo (Optional)
  ↓
Submit
```

### Testing Steps:

#### 1.1 Navigate to Registration
- [ ] Click "Register Animal" or "+" button from home
- [ ] **Expected:** Registration page loads
- [ ] **Check:** Progress indicator shows "Step 1"
- [ ] **Check:** Title shows "እንስሳ ይመዝግቡ / Register Animal"
- [ ] **Check:** Back button visible

**Screenshot checkpoint:** Take screenshot of Step 1

#### 1.2 Select Animal Type (Step 1)
- [ ] **See:** 3 cards with icons: 🐄 Cattle, 🐐 Goat, 🐑 Sheep
- [ ] Click on **Cattle (🐄)**
- [ ] **Expected:** Card highlights with blue ring
- [ ] **Expected:** Checkmark appears on selected card
- [ ] **Expected:** Auto-advances to Step 2 after ~300ms
- [ ] **Check:** Progress indicator shows "Step 2" in bold

**What to look for:**
- ✅ Cards are large and easy to tap (mobile)
- ✅ Hover effect works (desktop)
- ✅ Active scale animation on tap
- ✅ Smooth transition to next step

**Screenshot checkpoint:** Take screenshot of selected cattle

#### 1.3 Select Gender (Step 2 - Cattle Only)
- [ ] **See:** Title "የእንስሳ ፆታ ይምረጡ / Select Animal Gender"
- [ ] **See:** 2 options: Male / Female
- [ ] Click on **Female**
- [ ] **Expected:** Selection highlights
- [ ] **Expected:** Auto-advances to Step 3 after ~300ms
- [ ] **Check:** Progress indicator shows "Step 3"

**What to look for:**
- ✅ Gender selector only appears for cattle
- ✅ Clear visual feedback on selection
- ✅ Smooth auto-advance

**Screenshot checkpoint:** Take screenshot of gender selection

#### 1.4 Select Subtype (Step 3 - Cattle)
- [ ] **See:** Title "ዝርያ ይምረጡ / Select Subtype"
- [ ] **See:** Female cattle options only:
  - 🐄 Cow
  - 🐄 Heifer
  - 🐮 Female Calf
- [ ] Click on **Cow (🐄)**
- [ ] **Expected:** Selection highlights
- [ ] **Expected:** Auto-advances to Step 4 after ~300ms
- [ ] **Check:** Progress indicator shows "Step 4"

**What to look for:**
- ✅ Only female subtypes shown (filtered by gender)
- ✅ Icons display correctly
- ✅ Grid layout works on mobile (2 columns)

**Screenshot checkpoint:** Take screenshot of subtype selection

#### 1.5 Add Name and Photo (Step 4)
- [ ] **See:** Title "ስም እና ፎቶ / Name & Photo"
- [ ] **See:** Name input field (optional)
- [ ] **See:** Photo upload area with camera icon
- [ ] **See:** Two buttons: "ዝለል / Skip" and "መዝግብ / Register"

**Test Name Input:**
- [ ] Type: "Meron" in the name field
- [ ] **Expected:** Text appears as you type
- [ ] **Expected:** Character limit is 50
- [ ] **Check:** Placeholder text visible before typing

**Test Photo Upload:**
- [ ] Click on the photo upload area (camera icon)
- [ ] **Expected:** File picker opens
- [ ] Select a test image (any photo)
- [ ] **Expected:** Toast message: "📸 በማመቻቸት ላይ... / Optimizing photo..."
- [ ] **Expected:** Progress indicator appears
- [ ] **Expected:** Image compresses (shows size reduction)
- [ ] **Expected:** Preview appears
- [ ] **Expected:** Success toast with compression stats
- [ ] **Check:** "Remove" button appears on preview

**What to look for:**
- ✅ Image compression works (shows KB reduction)
- ✅ Preview displays correctly
- ✅ Can remove photo after upload
- ✅ Compression progress shows percentage
- ✅ Success message shows size reduction

**Screenshot checkpoint:** Take screenshot with photo preview

#### 1.6 Submit Registration
- [ ] Click **"መዝግብ / Register"** button
- [ ] **Expected:** Button shows "በመስራት ላይ..." (Processing)
- [ ] **Expected:** Button is disabled during submission
- [ ] **Expected:** Photo uploads to Supabase (if photo added)
- [ ] **Expected:** Success toast appears
- [ ] **Expected:** Redirects to "My Animals" page
- [ ] **Expected:** New cow "Meron" appears in the list

**What to look for:**
- ✅ Loading state shows during submission
- ✅ No duplicate submissions possible
- ✅ Success feedback clear
- ✅ Navigation works correctly

**Screenshot checkpoint:** Take screenshot of success state

---

## 📋 Test Scenario 2: Register Goat (3-Step Flow)

### Expected Flow:
```
Step 1: Select Type (Goat)
  ↓
Step 2: Select Subtype (Male/Female)
  ↓
Step 3: Name & Photo (Optional)
  ↓
Submit
```

### Testing Steps:

#### 2.1 Start Fresh Registration
- [ ] Navigate back to Register Animal page
- [ ] Click on **Goat (🐐)**
- [ ] **Expected:** Auto-advances to Step 2
- [ ] **Check:** Progress shows "Step 1 → Step 2 → Step 3" (only 3 steps)

#### 2.2 Select Subtype (Step 2 - Goat)
- [ ] **See:** 2 options:
  - 🐐 Male Goat
  - 🐐 Female Goat
- [ ] Click on **Male Goat**
- [ ] **Expected:** Auto-advances to Step 3
- [ ] **Check:** No gender step (goes straight to subtype)

#### 2.3 Skip Name and Photo
- [ ] **See:** Name and photo fields
- [ ] **Don't enter anything**
- [ ] Click **"ዝለል / Skip"** button
- [ ] **Expected:** Registers without name/photo
- [ ] **Expected:** Auto-generated name appears in list
- [ ] **Check:** Animal appears in "My Animals"

**What to look for:**
- ✅ Skip button works
- ✅ Auto-generated name is reasonable
- ✅ No photo placeholder shows correctly

---

## 📋 Test Scenario 3: Mobile Responsiveness

### Testing Steps:

#### 3.1 Test Touch Interactions
- [ ] Switch to mobile view (DevTools device mode)
- [ ] **Test:** Tap on animal type cards
- [ ] **Expected:** Cards respond to touch
- [ ] **Expected:** Active scale animation on tap
- [ ] **Check:** Touch targets are large enough (44px minimum)

#### 3.2 Test Layout on Small Screen
- [ ] **Check:** Cards stack properly (1 column on very small screens)
- [ ] **Check:** Text is readable (not too small)
- [ ] **Check:** Buttons are full-width and easy to tap
- [ ] **Check:** Progress indicator fits on screen
- [ ] **Check:** Photo preview scales correctly

#### 3.3 Test Landscape Orientation
- [ ] Rotate device to landscape (DevTools)
- [ ] **Check:** Layout adapts
- [ ] **Check:** Cards still visible
- [ ] **Check:** No horizontal scrolling

**What to look for:**
- ✅ All elements accessible on mobile
- ✅ No text cutoff
- ✅ Buttons easy to tap
- ✅ Images scale properly

---

## 📋 Test Scenario 4: Form Draft Restoration

### Testing Steps:

#### 4.1 Create Draft
- [ ] Start registering an animal
- [ ] Select Type: Cattle
- [ ] Select Gender: Male
- [ ] **Don't complete registration**
- [ ] Navigate away (click Back button)
- [ ] **Expected:** Draft saved automatically

#### 4.2 Restore Draft
- [ ] Navigate back to Register Animal
- [ ] **Expected:** Draft restoration prompt appears
- [ ] **See:** "You have an unsaved draft" message
- [ ] **See:** Two buttons: "Restore" and "Discard"
- [ ] Click **"Restore"**
- [ ] **Expected:** Form state restored (Cattle + Male selected)
- [ ] **Expected:** Returns to Step 3 (where you left off)

#### 4.3 Discard Draft
- [ ] Navigate away again
- [ ] Return to Register Animal
- [ ] Click **"Discard"** on draft prompt
- [ ] **Expected:** Form starts fresh
- [ ] **Expected:** No selections pre-filled

**What to look for:**
- ✅ Draft saves automatically
- ✅ Restoration prompt appears
- ✅ Restored state is accurate
- ✅ Can discard and start fresh

---

## 📋 Test Scenario 5: Language Switching

### Testing Steps:

#### 5.1 Switch to Amharic
- [ ] Click language selector (top of page)
- [ ] Select **Amharic (አማርኛ)**
- [ ] **Expected:** All UI text changes to Amharic
- [ ] **Check:** Title: "እንስሳ ይመዝግቡ"
- [ ] **Check:** Buttons: "ቀጣይ", "ዝለል", "መዝግብ"
- [ ] **Check:** Animal type labels in Amharic

#### 5.2 Complete Flow in Amharic
- [ ] Register an animal in Amharic
- [ ] **Check:** All steps work
- [ ] **Check:** Success messages in Amharic
- [ ] **Check:** Error messages in Amharic (if any)

#### 5.3 Switch Back to English
- [ ] Change language to English
- [ ] **Expected:** All text changes back
- [ ] **Check:** No missing translations
- [ ] **Check:** Layout doesn't break

**What to look for:**
- ✅ Complete translation coverage
- ✅ No English text in Amharic mode
- ✅ Layout works with Amharic text
- ✅ Language preference persists

---

## 📋 Test Scenario 6: Error Handling

### Testing Steps:

#### 6.1 Test Invalid Photo
- [ ] Try to upload a non-image file (PDF, TXT)
- [ ] **Expected:** Error toast: "❌ ልክ ያልሆነ ፋይል / Invalid file"
- [ ] **Expected:** File not accepted

#### 6.2 Test Large Photo
- [ ] Upload a very large image (>10MB if possible)
- [ ] **Expected:** Warning message about large file
- [ ] **Expected:** Compression takes longer
- [ ] **Expected:** Still works, just slower

#### 6.3 Test Network Error
- [ ] Open DevTools → Network tab
- [ ] Set throttling to "Offline"
- [ ] Try to submit registration
- [ ] **Expected:** Error message about network
- [ ] **Expected:** Data queued for offline sync
- [ ] **Check:** Animal appears with sync indicator

**What to look for:**
- ✅ Clear error messages
- ✅ User not stuck on error
- ✅ Can retry after error
- ✅ Offline mode works

---

## 📋 Test Scenario 7: Performance Testing

### Testing Steps:

#### 7.1 Test Image Compression
- [ ] Upload a large photo (2-5MB)
- [ ] **Measure:** Time to compress
- [ ] **Check:** Compression ratio (should be >50%)
- [ ] **Check:** Final size (should be <500KB)
- [ ] **Expected:** Progress indicator shows stages
- [ ] **Expected:** Success message shows size reduction

#### 7.2 Test Page Load Speed
- [ ] Refresh the page
- [ ] **Measure:** Time to interactive
- [ ] **Expected:** Page loads in <2 seconds
- [ ] **Check:** No layout shifts
- [ ] **Check:** Images load progressively

#### 7.3 Test on Slow 3G
- [ ] DevTools → Network → Slow 3G
- [ ] Complete registration flow
- [ ] **Check:** Still usable
- [ ] **Check:** Loading states show
- [ ] **Check:** No timeouts

**What to look for:**
- ✅ Fast compression (<3 seconds)
- ✅ Good compression ratio
- ✅ Usable on slow network
- ✅ Clear loading feedback

---

## 🐛 Bug Tracking Template

When you find an issue, document it like this:

```markdown
### BUG-AR-001: [Brief description]

**Severity:** Critical / High / Medium / Low

**Found in:** Test Scenario X.X

**Steps to Reproduce:**
1. Navigate to Register Animal
2. Select Cattle
3. [Specific action that causes bug]

**Expected:** [What should happen]

**Actual:** [What actually happened]

**Environment:**
- Browser: Chrome 120
- Device: Desktop / Mobile (iPhone 12 Pro)
- Network: WiFi / 3G / Offline
- Language: English / Amharic

**Screenshot:** [Attach screenshot]

**Console Errors:**
```
[Paste any console errors here]
```

**Status:** 🔴 Open
```

---

## ✅ Test Completion Checklist

### Critical Tests (Must Pass)
- [ ] Cattle registration (4-step flow) works
- [ ] Goat registration (3-step flow) works
- [ ] Sheep registration (3-step flow) works
- [ ] Photo upload and compression works
- [ ] Form submission succeeds
- [ ] Data appears in "My Animals"
- [ ] Mobile layout works
- [ ] Touch interactions work

### Important Tests (Should Pass)
- [ ] Draft restoration works
- [ ] Language switching works
- [ ] Error handling works
- [ ] Skip name/photo works
- [ ] Remove photo works
- [ ] Back navigation works

### Nice to Have Tests
- [ ] Performance is good
- [ ] Compression is efficient
- [ ] Offline mode works
- [ ] All animations smooth

---

## 📊 Test Results Summary

After testing, fill this out:

**Date:** [Date]
**Tester:** [Your name]
**Duration:** [Time spent]

**Results:**
- ✅ Passed: X tests
- ❌ Failed: X tests
- ⚠️ Issues: X bugs found

**Critical Bugs:** [List]
**High Priority Bugs:** [List]
**Medium/Low Bugs:** [List]

**Deployment Ready?** YES / NO / WITH CAUTIONS

**Notes:**
[Any additional observations]

---

## 🎯 Quick Test (5 Minutes)

If you're short on time, run this quick smoke test:

1. **Register Cattle:**
   - Select Cattle → Female → Cow → Name: "Meron" → Register
   - ✅ Should work end-to-end

2. **Register Goat:**
   - Select Goat → Male → Skip → Register
   - ✅ Should work without name/photo

3. **Test Mobile:**
   - Switch to mobile view
   - Register Sheep → Ewe → Register
   - ✅ Should work on mobile

4. **Test Language:**
   - Switch to Amharic
   - Register any animal
   - ✅ Should work in Amharic

**If all 4 pass, core functionality is good!** 🎉

---

## 📞 Need Help?

**Common Issues:**

**Q: Auto-advance not working?**
A: Check console for errors, verify step state is updating

**Q: Photo upload fails?**
A: Check Supabase storage bucket permissions, verify file size

**Q: Draft not restoring?**
A: Check localStorage in DevTools → Application tab

**Q: Language not switching?**
A: Check i18n files (en.json, am.json) for missing keys

---

## 🚀 Ready to Test!

**Your next steps:**

1. ✅ Start dev server: `npm run dev`
2. ✅ Open browser: `http://127.0.0.1:5173`
3. ✅ Follow Test Scenario 1 (Cattle registration)
4. ✅ Document any bugs in BUGS_FOUND.md
5. ✅ Continue with remaining scenarios

**Good luck testing!** 🎯
