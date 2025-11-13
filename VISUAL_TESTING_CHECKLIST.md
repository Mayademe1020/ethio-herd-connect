# 📱 Visual Testing Checklist - Animal Registration

## 🎯 Quick Reference Guide

Print this or keep it open while testing!

---

## ✅ Test 1: Cattle Registration (4 Steps)

```
┌─────────────────────────────────────────┐
│  STEP 1: Select Type                    │
│  ☐ See 3 cards: 🐄 🐐 🐑               │
│  ☐ Click Cattle                         │
│  ☐ Card highlights with blue ring       │
│  ☐ Auto-advances to Step 2              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  STEP 2: Select Gender                  │
│  ☐ See Male / Female options            │
│  ☐ Click Female                         │
│  ☐ Selection highlights                 │
│  ☐ Auto-advances to Step 3              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  STEP 3: Select Subtype                 │
│  ☐ See female options only:             │
│     - Cow, Heifer, Female Calf          │
│  ☐ Click Cow                            │
│  ☐ Auto-advances to Step 4              │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  STEP 4: Name & Photo                   │
│  ☐ Enter name: "Meron"                  │
│  ☐ Upload photo (optional)              │
│  ☐ See compression progress             │
│  ☐ Click "Register"                     │
│  ☐ Success! Redirects to My Animals     │
└─────────────────────────────────────────┘
```

**Expected Time:** 2-3 minutes

---

## ✅ Test 2: Goat Registration (3 Steps)

```
┌─────────────────────────────────────────┐
│  STEP 1: Select Type                    │
│  ☐ Click Goat 🐐                       │
│  ☐ Auto-advances                        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  STEP 2: Select Subtype                 │
│  ☐ See Male / Female                    │
│  ☐ Click Male                           │
│  ☐ Auto-advances                        │
└─────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────┐
│  STEP 3: Name & Photo                   │
│  ☐ Click "Skip" button                  │
│  ☐ Registers without name/photo         │
│  ☐ Auto-generated name appears          │
└─────────────────────────────────────────┘
```

**Expected Time:** 1-2 minutes

---

## ✅ Test 3: Photo Upload

```
┌─────────────────────────────────────────┐
│  Photo Upload Flow                      │
│  ☐ Click camera icon                    │
│  ☐ Select image file                    │
│  ☐ See "Optimizing photo..." toast      │
│  ☐ Progress bar shows 0-100%            │
│  ☐ See compression stats:               │
│     "2MB → 150KB, 92% reduction"        │
│  ☐ Preview appears                      │
│  ☐ "Remove" button visible              │
│  ☐ Can remove and re-upload             │
└─────────────────────────────────────────┘
```

**Expected Time:** 1 minute

---

## ✅ Test 4: Mobile View

```
┌─────────────────────────────────────────┐
│  Mobile Testing (F12 → Device Mode)     │
│  ☐ Cards stack properly                 │
│  ☐ Text is readable                     │
│  ☐ Buttons are large enough             │
│  ☐ Touch targets work (44px+)           │
│  ☐ No horizontal scrolling              │
│  ☐ Images scale correctly               │
│  ☐ Progress indicator fits              │
└─────────────────────────────────────────┘
```

**Devices to Test:**
- ☐ iPhone 12 Pro (390x844)
- ☐ Pixel 5 (393x851)
- ☐ iPad (768x1024)

---

## ✅ Test 5: Draft Restoration

```
┌─────────────────────────────────────────┐
│  Draft Flow                             │
│  ☐ Start registration                   │
│  ☐ Select Cattle → Male                 │
│  ☐ Navigate away (Back button)          │
│  ☐ Return to Register Animal            │
│  ☐ See "Restore draft?" prompt          │
│  ☐ Click "Restore"                      │
│  ☐ Form state restored correctly        │
│  ☐ Returns to Step 3                    │
└─────────────────────────────────────────┘
```

---

## ✅ Test 6: Language Switching

```
┌─────────────────────────────────────────┐
│  English → Amharic                      │
│  ☐ Click language selector              │
│  ☐ Select Amharic (አማርኛ)              │
│  ☐ Title: "እንስሳ ይመዝግቡ"               │
│  ☐ Buttons: "ቀጣይ", "ዝለል", "መዝግብ"     │
│  ☐ Animal types in Amharic              │
│  ☐ Complete registration in Amharic     │
│  ☐ Success message in Amharic           │
└─────────────────────────────────────────┘
```

---

## ✅ Test 7: Error Handling

```
┌─────────────────────────────────────────┐
│  Error Scenarios                        │
│  ☐ Upload non-image file                │
│     → See "Invalid file" error          │
│  ☐ Upload 15MB image                    │
│     → See "Large file" warning          │
│     → Still compresses successfully     │
│  ☐ Go offline (DevTools)                │
│     → Submit registration               │
│     → See offline queue message         │
└─────────────────────────────────────────┘
```

---

## 🐛 Bug Severity Guide

```
🔴 CRITICAL
   - App crashes
   - Data loss
   - Can't complete registration
   - Photo upload completely broken

🟠 HIGH
   - Major feature broken
   - Poor user experience
   - Difficult workaround
   - Mobile layout broken

🟡 MEDIUM
   - Minor feature issue
   - Workaround available
   - Cosmetic but noticeable
   - Performance slow but usable

🟢 LOW
   - Cosmetic issue
   - Nice-to-have
   - Doesn't affect functionality
```

---

## 📊 Quick Status Tracker

```
Test Scenario              Status    Bugs Found
─────────────────────────────────────────────────
1. Cattle Registration     ☐ Pass    _________
                          ☐ Fail    

2. Goat Registration       ☐ Pass    _________
                          ☐ Fail    

3. Photo Upload           ☐ Pass    _________
                          ☐ Fail    

4. Mobile View            ☐ Pass    _________
                          ☐ Fail    

5. Draft Restoration      ☐ Pass    _________
                          ☐ Fail    

6. Language Switching     ☐ Pass    _________
                          ☐ Fail    

7. Error Handling         ☐ Pass    _________
                          ☐ Fail    

─────────────────────────────────────────────────
TOTAL PASSED:             ___/7
TOTAL BUGS:               _____
DEPLOYMENT READY:         ☐ YES  ☐ NO
```

---

## 🎯 5-Minute Smoke Test

```
┌─────────────────────────────────────────┐
│  Quick Sanity Check                     │
│  1. ☐ Register Cattle → Female → Cow   │
│  2. ☐ Register Goat → Male (skip name) │
│  3. ☐ Test mobile view                  │
│  4. ☐ Switch to Amharic                 │
│                                         │
│  If all 4 pass → Core functionality OK! │
└─────────────────────────────────────────┘
```

---

## 📸 Screenshot Checklist

Take screenshots at these points:

```
☐ Step 1 - Animal type selection
☐ Step 2 - Gender selection (cattle)
☐ Step 3 - Subtype selection
☐ Step 4 - Name & photo form
☐ Photo upload progress
☐ Photo preview with compression stats
☐ Success state after registration
☐ My Animals list with new animal
☐ Mobile view (portrait)
☐ Mobile view (landscape)
☐ Amharic language view
☐ Draft restoration prompt
☐ Any bugs found
```

---

## 🚨 Common Issues & Quick Fixes

```
Issue: Auto-advance not working
Fix: Check console for errors

Issue: Photo upload fails
Fix: Check Supabase storage permissions

Issue: Draft not saving
Fix: Check localStorage in DevTools

Issue: Language not switching
Fix: Check i18n files for missing keys

Issue: Mobile layout broken
Fix: Check responsive breakpoints

Issue: Compression too slow
Fix: Test with smaller image first
```

---

## ✅ Final Checklist

Before marking testing complete:

```
☐ All critical tests passed
☐ All bugs documented in BUGS_FOUND.md
☐ Screenshots taken for issues
☐ Tested on desktop
☐ Tested on mobile
☐ Tested in both languages
☐ Performance acceptable
☐ No console errors
☐ Ready for exhibition demo
```

---

## 📝 Quick Bug Template

```
BUG-AR-XXX: [Title]
Severity: 🔴/🟠/🟡/🟢
Steps: 1. 2. 3.
Expected: [What should happen]
Actual: [What happened]
Screenshot: [Attach]
```

---

## 🎉 Success Criteria

```
✅ Can register all animal types
✅ Photo upload works
✅ Mobile experience good
✅ Language switching works
✅ No critical bugs
✅ Performance acceptable
✅ Ready to demo!
```

---

**Testing Time Estimate:**
- Quick test: 5 minutes
- Full test: 30-45 minutes
- With bug documentation: 1-2 hours

**Good luck! 🚀**
