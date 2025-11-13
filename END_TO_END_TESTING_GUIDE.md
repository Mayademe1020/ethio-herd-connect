# End-to-End Testing Guide - Day 1 Morning

## 🎯 Objective
Test all major user flows, document bugs, and fix critical issues before deployment.

## ⏱️ Time Allocation: 2-4 hours
- Testing: 1-2 hours
- Bug documentation: 30 minutes
- Bug fixing: 1-2 hours

---

## 🧪 Testing Setup

### Prerequisites
1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Open Browser**
   - Chrome (primary)
   - Firefox (secondary)
   - Mobile device (if available)

3. **Prepare Test Data**
   - Test phone number: +251912345678
   - Test animal names: Chaltu, Beza, Abebe
   - Test prices: 5000, 10000, 25000 ETB

4. **Testing Tools**
   - Browser DevTools (Console, Network tab)
   - Mobile device or Chrome DevTools mobile emulation
   - Airplane mode for offline testing

---

## 📝 Test Scenarios

### ✅ FLOW 1: New User Registration & Login
**Priority**: 🔴 CRITICAL
**Time**: 5 minutes

**Steps**:
1. Open app in incognito/private window
2. Should redirect to login page
3. Enter phone: +251912345678
4. Click "Send Code"
5. Check console for OTP (or check SMS)
6. Enter OTP code
7. Click "Verify"
8. Should redirect to home dashboard

**Expected Results**:
- ✅ Login page loads
- ✅ Phone input accepts Ethiopian format
- ✅ OTP is sent (check console/SMS)
- ✅ OTP verification works
- ✅ Redirects to home
- ✅ Session persists (refresh page, still logged in)

**Bug Tracking**:
- [ ] Bug found? Document below:
  ```
  Bug #: 
  Severity: Critical/High/Medium/Low
  Description: 
  Steps to reproduce: 
  Expected: 
  Actual: 
  ```

---

### ✅ FLOW 2: Animal Registration
**Priority**: 🔴 CRITICAL
**Time**: 10 minutes

**Test Case 2.1: Register Cow with Photo**
1. Click "Add Animal" button on home
2. Select "Cattle" 🐄
3. Select "Cow"
4. Enter name: "Chaltu"
5. Click "Add Photo" (optional)
6. Select/take photo
7. Wait for upload
8. Click "Register"
9. Should see success message
10. Should navigate to animal detail

**Expected Results**:
- ✅ Type selector shows 3 options
- ✅ Subtype selector shows Cow/Bull/Ox/Calf
- ✅ Name input accepts Amharic
- ✅ Photo uploads successfully
- ✅ Success message appears
- ✅ Animal appears in "My Animals"

**Test Case 2.2: Register Goat without Photo**
1. Click "Add Animal"
2. Select "Goat" 🐐
3. Select "Female Goat"
4. Enter name: "Beza"
5. Skip photo
6. Click "Register"

**Expected Results**:
- ✅ Registration works without photo
- ✅ Default icon shows in animal list

**Test Case 2.3: Offline Registration**
1. Turn on airplane mode
2. Try to register animal
3. Should see "Saved locally" message
4. Turn off airplane mode
5. Should sync automatically

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 3: Milk Recording
**Priority**: 🔴 CRITICAL
**Time**: 5 minutes

**Steps**:
1. Click "Record Milk" on home
2. Should see list of cows only
3. Select "Chaltu"
4. Click "5L" quick button
5. Should see success message
6. Should return to home

**Expected Results**:
- ✅ Only cows appear in list
- ✅ Quick buttons work (2L, 3L, 5L, 7L, 10L)
- ✅ Custom input works
- ✅ Session auto-detected (morning/evening)
- ✅ Success message shows
- ✅ Record appears in animal detail

**Test Offline**:
1. Turn on airplane mode
2. Record milk
3. Should queue for sync
4. Turn off airplane mode
5. Should sync automatically

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 4: Marketplace Listing Creation
**Priority**: 🔴 CRITICAL
**Time**: 10 minutes

**Test Case 4.1: Create Listing with Photo**
1. Navigate to "Create Listing"
2. **Step 1**: Select animal "Chaltu"
3. Click "Next"
4. **Step 2**: Enter price: 10000
5. Toggle "Negotiable" ON
6. Click "Next"
7. **Step 3**: Upload photo
8. Click "Next" (or "Skip")
9. **Step 4**: Check health disclaimer
10. Click "Create Listing"

**Expected Results**:
- ✅ Progress bar shows 25%, 50%, 75%, 100%
- ✅ Can go back to previous steps
- ✅ Price validation works (min 100, max 1,000,000)
- ✅ Photo uploads and compresses
- ✅ Cannot submit without disclaimer
- ✅ Success message appears
- ✅ Redirects to marketplace

**Test Case 4.2: Female Animal with Details**
1. Register a cow (if not already done)
2. Create listing for the cow
3. In Step 4, should see female animal fields
4. Select pregnancy status: "Pregnant"
5. Select lactation status: "Lactating"
6. Enter milk production: 5 liters/day
7. Submit listing

**Expected Results**:
- ✅ Female fields only show for Cow/Female Goat/Ewe
- ✅ Pregnancy status saves
- ✅ Lactation status saves
- ✅ Milk production saves

**Test Case 4.3: Video Upload**
1. Create new listing
2. In Step 3, upload video
3. Should validate duration (≤10 seconds)
4. Should validate size (≤20MB)

**Expected Results**:
- ✅ Video uploads successfully
- ✅ Thumbnail generates
- ✅ Duration validation works
- ✅ Size validation works

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 5: View My Listings
**Priority**: 🔴 CRITICAL
**Time**: 5 minutes

**Steps**:
1. Navigate to "My Listings"
2. Should see all your listings
3. Should see summary cards (Active/Sold/Cancelled)
4. Click "Mark as Sold" on a listing
5. Verify status changes

**Expected Results**:
- ✅ All listings display
- ✅ Photo/video indicators show
- ✅ Price displays correctly
- ✅ Views count shows
- ✅ Mark as sold works
- ✅ Cancel listing works

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 6: Marketplace Browse
**Priority**: 🔴 CRITICAL
**Time**: 5 minutes

**Steps**:
1. Navigate to "Marketplace"
2. Should see all active listings
3. Filter by "Cattle"
4. Sort by "Lowest Price"
5. Click on a listing
6. Should see listing detail

**Expected Results**:
- ✅ Listings display correctly
- ✅ Filters work
- ✅ Sort works
- ✅ Listing detail loads
- ✅ Views count increments

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 7: Buyer Interest
**Priority**: 🔴 CRITICAL
**Time**: 5 minutes

**Steps**:
1. View a listing (not your own)
2. Click "Express Interest"
3. Add message: "Is the cow healthy?"
4. Click "Send Interest"
5. Should see success message
6. Button should change to "You've expressed interest"

**As Seller**:
1. View your own listing
2. Should see "Interested Buyers" section
3. Should see buyer phone number
4. Should see buyer message
5. Click "📞 Call" button
6. Should open phone dialer

**Expected Results**:
- ✅ Interest submission works
- ✅ Message saves
- ✅ Seller sees phone number
- ✅ Seller sees message
- ✅ Call button works
- ✅ WhatsApp hint shows

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 8: Language Switching
**Priority**: 🟡 HIGH
**Time**: 5 minutes

**Steps**:
1. Navigate to Profile
2. Click language switcher
3. Switch to Amharic
4. Navigate through all pages
5. Verify all text is in Amharic
6. Switch back to English

**Expected Results**:
- ✅ Language switcher works
- ✅ All pages show Amharic text
- ✅ No layout breaks
- ✅ Error messages in Amharic
- ✅ Buttons in Amharic

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 9: Offline Mode
**Priority**: 🔴 CRITICAL
**Time**: 10 minutes

**Steps**:
1. Turn on airplane mode
2. Register animal → Should queue
3. Record milk → Should queue
4. Create listing → Should queue
5. Express interest → Should queue
6. Check sync status indicator
7. Turn off airplane mode
8. Wait for auto-sync
9. Verify all data synced

**Expected Results**:
- ✅ All actions work offline
- ✅ "Saved locally" messages show
- ✅ Sync indicator shows pending count
- ✅ Auto-sync works when online
- ✅ No data loss
- ✅ Success messages after sync

**Bug Tracking**:
- [ ] Bugs found? Document:

---

### ✅ FLOW 10: Mobile Responsiveness
**Priority**: 🟡 HIGH
**Time**: 5 minutes

**Steps**:
1. Open DevTools
2. Toggle device toolbar (mobile view)
3. Test on different screen sizes:
   - iPhone SE (375px)
   - iPhone 12 (390px)
   - Samsung Galaxy (360px)
4. Navigate through all pages
5. Test all buttons and forms

**Expected Results**:
- ✅ All pages responsive
- ✅ Buttons large enough (44px+)
- ✅ Text readable
- ✅ No horizontal scroll
- ✅ Forms usable on mobile

**Bug Tracking**:
- [ ] Bugs found? Document:

---

## 🐛 Bug Documentation Template

### Bug Report Format
```markdown
## Bug #[NUMBER]

**Severity**: Critical / High / Medium / Low

**Feature**: [Authentication / Animal Registration / Milk Recording / Marketplace / etc.]

**Description**: 
[Clear description of the bug]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Screenshots/Console Errors**:
[Paste any errors or screenshots]

**Environment**:
- Browser: Chrome/Firefox/Safari
- Device: Desktop/Mobile
- Language: English/Amharic

**Priority for Fix**:
- [ ] Must fix before deployment
- [ ] Should fix before deployment
- [ ] Can fix after deployment
```

---

## 🔧 Bug Fixing Priority

### Critical (Must Fix Before Deployment)
- App crashes
- Cannot login
- Cannot register animal
- Cannot record milk
- Cannot create listing
- Data loss issues
- Security vulnerabilities

### High (Should Fix Before Deployment)
- UI breaks on mobile
- Buttons not working
- Forms not submitting
- Translations missing
- Offline sync fails

### Medium (Can Fix After Deployment)
- Minor UI issues
- Non-critical translations
- Performance optimizations
- Nice-to-have features

### Low (Backlog)
- Cosmetic issues
- Enhancement requests
- Future features

---

## ✅ Testing Checklist

### Core Functionality
- [ ] Login works
- [ ] Animal registration works
- [ ] Milk recording works
- [ ] Marketplace listing creation works
- [ ] Marketplace browsing works
- [ ] Buyer interest works
- [ ] My listings page works
- [ ] Language switching works
- [ ] Offline mode works
- [ ] Sync works

### UI/UX
- [ ] All buttons responsive
- [ ] All forms submittable
- [ ] All pages load
- [ ] Mobile responsive
- [ ] No layout breaks
- [ ] Icons display correctly
- [ ] Images load
- [ ] Progress indicators work

### Data Integrity
- [ ] Animals save correctly
- [ ] Milk records save correctly
- [ ] Listings save correctly
- [ ] Interests save correctly
- [ ] No duplicate data
- [ ] No data loss offline

### Translations
- [ ] All English text present
- [ ] All Amharic text present
- [ ] No missing translations
- [ ] Error messages translated
- [ ] Buttons translated

### Performance
- [ ] Pages load quickly (<3 seconds)
- [ ] No console errors
- [ ] No memory leaks
- [ ] Images compressed
- [ ] Smooth animations

---

## 🚨 Common Issues to Watch For

### 1. Authentication Issues
- OTP not sending
- OTP verification failing
- Session not persisting
- Logout not working

### 2. Form Issues
- Validation not working
- Submit button disabled
- Data not saving
- Error messages not showing

### 3. Upload Issues
- Photos not uploading
- Videos not uploading
- Compression failing
- Progress stuck

### 4. Offline Issues
- Queue not working
- Sync not triggering
- Data loss
- Duplicate submissions

### 5. Translation Issues
- Missing translations
- Wrong language showing
- Layout breaks with Amharic
- Language not persisting

### 6. Mobile Issues
- Buttons too small
- Text too small
- Horizontal scroll
- Keyboard covering inputs

---

## 📊 Testing Results Template

### Test Session: [Date/Time]

**Tester**: [Your Name]
**Environment**: [Browser, Device, OS]
**Duration**: [Time spent]

#### Summary
- Total tests: [Number]
- Passed: [Number]
- Failed: [Number]
- Bugs found: [Number]

#### Critical Bugs
1. [Bug description]
2. [Bug description]

#### High Priority Bugs
1. [Bug description]
2. [Bug description]

#### Medium/Low Priority Bugs
1. [Bug description]
2. [Bug description]

#### Notes
[Any additional observations]

---

## 🔄 After Testing

### 1. Review Bugs
- Categorize by severity
- Prioritize fixes
- Estimate fix time

### 2. Fix Critical Bugs
- Fix blocking issues first
- Test fixes
- Verify no regressions

### 3. Document Fixes
- Update bug list
- Mark as fixed
- Note any workarounds

### 4. Re-Test
- Test fixed bugs
- Run smoke test
- Get sign-off

---

## ✅ Sign-Off Criteria

Before moving to deployment, ensure:
- [ ] All critical bugs fixed
- [ ] All high-priority bugs fixed or documented
- [ ] No console errors
- [ ] All core flows work
- [ ] Tested on mobile
- [ ] Tested offline mode
- [ ] Translations complete
- [ ] Performance acceptable

---

## 🎯 Next Steps After Testing

Once testing is complete and bugs are fixed:
1. ✅ Mark Task 13.8 as complete
2. ✅ Move to Task 14.1 (Deploy to production)
3. ✅ Continue with deployment workflow

---

## 💡 Testing Tips

1. **Test Like a Farmer**
   - Use simple language
   - Test on mobile
   - Test with poor internet
   - Test in bright sunlight (if possible)

2. **Be Thorough**
   - Test happy paths
   - Test error cases
   - Test edge cases
   - Test offline scenarios

3. **Document Everything**
   - Screenshot bugs
   - Copy console errors
   - Note exact steps
   - Include environment details

4. **Think User Experience**
   - Is it intuitive?
   - Is it fast?
   - Is it forgiving?
   - Is it helpful?

---

## 🚀 Ready to Start?

1. Start development server: `npm run dev`
2. Open browser to http://localhost:5173
3. Begin with Flow 1 (Authentication)
4. Work through each flow systematically
5. Document bugs as you find them
6. Fix critical bugs immediately
7. Create backlog for non-critical bugs

**Good luck with testing! 🎉**
