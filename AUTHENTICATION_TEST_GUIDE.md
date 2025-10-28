# Authentication Testing Guide - Ethiopian Reality Edition

## Overview
This guide covers end-to-end testing of the authentication system with both password and SMS OTP options, optimized for Ethiopian farmers.

## Test Environment Setup

### Prerequisites
- Supabase project configured with phone authentication enabled
- Test Ethiopian phone numbers (+251 9XX XXX XXX format)
- Mobile device or browser DevTools mobile emulation
- Network throttling capability (to test 2G/3G conditions)

---

## Test Suite 1: Password Authentication (PRIMARY METHOD)

### Test 1.1: New User Registration with Password
**Steps:**
1. Navigate to `/login`
2. Ensure "Password" tab is selected (default)
3. Enter Ethiopian phone: `911234567`
4. Enter password: `test123456`
5. Click "ግባ / Login" button

**Expected Results:**
- ✓ Account created successfully
- ✓ Toast message: "መለያ ተፈጥሯል! / Account created!"
- ✓ Automatic redirect to home page (`/`)
- ✓ User session persisted in browser

**Pass Criteria:**
- [ ] New account created in Supabase auth.users
- [ ] User redirected to home within 2 seconds
- [ ] No console errors

---

### Test 1.2: Existing User Login with Password
**Steps:**
1. Use phone number from Test 1.1: `911234567`
2. Enter correct password: `test123456`
3. Click "ግባ / Login"

**Expected Results:**
- ✓ Login successful
- ✓ Toast message: "✓ Login successful! Welcome back!"
- ✓ Redirect to home page
- ✓ User data loaded correctly

**Pass Criteria:**
- [ ] Login completes within 2 seconds
- [ ] Session token stored in localStorage
- [ ] User object available in AuthContext

---

### Test 1.3: Invalid Password
**Steps:**
1. Enter valid phone: `911234567`
2. Enter wrong password: `wrongpass`
3. Click "ግባ / Login"

**Expected Results:**
- ✓ Error toast: "መግባት አልተቻለም / Login failed"
- ✓ User remains on login page
- ✓ Form fields remain filled (phone number)
- ✓ Password field cleared for security

**Pass Criteria:**
- [ ] Clear error message displayed
- [ ] No redirect occurs
- [ ] User can retry immediately

---

### Test 1.4: Phone Number Validation
**Test Cases:**

| Input | Expected Result |
|-------|----------------|
| `811234567` | ❌ Error: "Must start with 9" |
| `91123456` | ❌ Error: "Must be 9 digits" |
| `9112345678` | ❌ Error: "Must be 9 digits" |
| `abc123456` | ❌ Only digits allowed in input |
| `911234567` | ✓ Valid |
| `0911234567` | ✓ Valid (leading 0 stripped) |

**Pass Criteria:**
- [ ] All validation messages in Amharic + English
- [ ] Input field only accepts digits
- [ ] Leading zeros automatically removed

---

### Test 1.5: Password Validation
**Test Cases:**

| Password | Expected Result |
|----------|----------------|
| `12345` | ❌ Error: "Password too short" |
| `123456` | ✓ Valid (minimum 6 chars) |
| `mypassword123` | ✓ Valid |
| `` (empty) | ❌ Button disabled |

**Pass Criteria:**
- [ ] Minimum 6 character requirement enforced
- [ ] Clear error messages
- [ ] Button disabled when invalid

---

## Test Suite 2: SMS OTP Authentication (FALLBACK METHOD)

### Test 2.1: Switch to SMS Mode
**Steps:**
1. On login page, click "SMS ኮድ / SMS Code" tab
2. Observe warning message

**Expected Results:**
- ✓ Tab switches to SMS mode
- ✓ Warning displayed: "⚠️ SMS may cost money and can be delayed"
- ✓ Password field hidden
- ✓ "Send SMS Code" button shown

**Pass Criteria:**
- [ ] Warning clearly visible
- [ ] UI updates immediately
- [ ] No errors in console

---

### Test 2.2: Send OTP
**Steps:**
1. In SMS mode, enter phone: `911234567`
2. Click "ኮድ ላክ / Send SMS Code"

**Expected Results:**
- ✓ Loading state shown: "እየላክ ነው... / Sending..."
- ✓ Success toast: "✓ OTP sent to your phone"
- ✓ UI switches to OTP entry screen
- ✓ SMS received on phone (may take 5-30 minutes in Ethiopia)

**Pass Criteria:**
- [ ] Supabase OTP request succeeds
- [ ] UI transitions smoothly
- [ ] SMS eventually received (note delay)

---

### Test 2.3: Verify OTP
**Steps:**
1. After receiving SMS, enter 6-digit code
2. Click "✓ አረጋግጥ እና ግባ / Verify & Login"

**Expected Results:**
- ✓ Loading state shown
- ✓ Success toast: "✓ Login successful!"
- ✓ Redirect to home page
- ✓ Session created

**Pass Criteria:**
- [ ] OTP verification succeeds
- [ ] User authenticated
- [ ] Session persisted

---

### Test 2.4: Invalid OTP
**Steps:**
1. Enter incorrect 6-digit code: `123456`
2. Click verify button

**Expected Results:**
- ✓ Error toast: "ልክ ያልሆነ ኮድ / Invalid OTP"
- ✓ User remains on OTP screen
- ✓ Can retry with correct code

**Pass Criteria:**
- [ ] Clear error message
- [ ] No redirect
- [ ] Retry allowed

---

### Test 2.5: Change Phone Number
**Steps:**
1. On OTP entry screen, click "← ስልክ ቁጥር ቀይር / Change phone number"

**Expected Results:**
- ✓ Returns to phone entry screen
- ✓ Previous phone number cleared
- ✓ Can enter new number

**Pass Criteria:**
- [ ] Navigation works
- [ ] Form state reset
- [ ] No errors

---

## Test Suite 3: Session Management

### Test 3.1: Session Persistence
**Steps:**
1. Login with password
2. Close browser tab
3. Reopen application

**Expected Results:**
- ✓ User still logged in
- ✓ No login screen shown
- ✓ Direct access to home page
- ✓ User data loaded

**Pass Criteria:**
- [ ] Session survives browser close
- [ ] No re-authentication required
- [ ] Session token valid

---

### Test 3.2: Logout Functionality
**Steps:**
1. Login successfully
2. Navigate to profile or settings
3. Click logout button
4. Observe behavior

**Expected Results:**
- ✓ Toast: "✓ ተወጥተዋል / Signed out"
- ✓ Redirect to `/login`
- ✓ Session cleared
- ✓ Cannot access protected routes

**Pass Criteria:**
- [ ] Logout completes successfully
- [ ] Session token removed
- [ ] User redirected properly

---

### Test 3.3: Protected Route Access
**Steps:**
1. Without logging in, try to access:
   - `/` (home)
   - `/my-animals`
   - `/marketplace`
   - `/profile`

**Expected Results:**
- ✓ All routes redirect to `/login`
- ✓ Loading spinner shown briefly
- ✓ No flash of protected content

**Pass Criteria:**
- [ ] All protected routes secured
- [ ] Smooth redirect experience
- [ ] No unauthorized access

---

### Test 3.4: Auto-Redirect After Login
**Steps:**
1. Try to access `/my-animals` while logged out
2. Get redirected to `/login`
3. Login successfully

**Expected Results:**
- ✓ After login, redirect to originally requested page (`/my-animals`)
- ✓ OR redirect to home page (acceptable fallback)

**Pass Criteria:**
- [ ] User reaches intended destination
- [ ] No broken navigation

---

## Test Suite 4: Mobile & Network Conditions

### Test 4.1: Mobile Touch Targets
**Steps:**
1. Open login page on mobile device (or DevTools mobile emulation)
2. Measure button sizes
3. Test tap accuracy

**Expected Results:**
- ✓ All buttons minimum 44x44px (WCAG standard)
- ✓ Phone input: 48px height
- ✓ Login button: 56px height
- ✓ OTP input: 64px height
- ✓ Easy to tap without mistakes

**Pass Criteria:**
- [ ] All touch targets meet minimum size
- [ ] Comfortable spacing between elements
- [ ] No accidental taps

---

### Test 4.2: Slow Network (2G Simulation)
**Steps:**
1. Enable Chrome DevTools Network Throttling: "Slow 3G"
2. Attempt password login
3. Observe loading states

**Expected Results:**
- ✓ Loading spinner shown immediately
- ✓ Button disabled during request
- ✓ Request completes (may take 5-10 seconds)
- ✓ No timeout errors
- ✓ User feedback throughout

**Pass Criteria:**
- [ ] App remains responsive
- [ ] Clear loading indicators
- [ ] Request eventually succeeds

---

### Test 4.3: Offline Behavior
**Steps:**
1. Disconnect from internet
2. Attempt to login

**Expected Results:**
- ✓ Error message: "No internet connection"
- ✓ User informed to check connectivity
- ✓ App doesn't crash

**Pass Criteria:**
- [ ] Graceful error handling
- [ ] Clear user guidance
- [ ] App remains stable

---

## Test Suite 5: Amharic Language Support

### Test 5.1: Bilingual Labels
**Verify all labels are bilingual:**

| Element | Amharic | English |
|---------|---------|---------|
| Phone label | ስልክ ቁጥር | Phone Number |
| Password label | ይለፍ ቃል | Password |
| Login button | ግባ | Login |
| Send OTP | ኮድ ላክ | Send OTP |
| Verify button | አረጋግጥ እና ግባ | Verify & Login |
| Loading | እባክዎ ይጠብቁ | Please wait |
| Error messages | ልክ ያልሆነ | Invalid |

**Pass Criteria:**
- [ ] All text bilingual
- [ ] Amharic text renders correctly
- [ ] No encoding issues

---

## Test Suite 6: Edge Cases

### Test 6.1: Rapid Button Clicks
**Steps:**
1. Enter valid credentials
2. Click login button 5 times rapidly

**Expected Results:**
- ✓ Only one request sent
- ✓ Button disabled after first click
- ✓ No duplicate accounts created

**Pass Criteria:**
- [ ] Request deduplication works
- [ ] No race conditions

---

### Test 6.2: Browser Back Button
**Steps:**
1. Login successfully
2. Click browser back button

**Expected Results:**
- ✓ User stays on home page (or navigates normally)
- ✓ Does NOT return to login page
- ✓ Session maintained

**Pass Criteria:**
- [ ] Navigation behaves correctly
- [ ] No logout on back button

---

### Test 6.3: Multiple Tabs
**Steps:**
1. Open app in Tab 1, login
2. Open app in Tab 2

**Expected Results:**
- ✓ Tab 2 recognizes existing session
- ✓ Both tabs show authenticated state
- ✓ Logout in one tab affects both

**Pass Criteria:**
- [ ] Session shared across tabs
- [ ] State synchronized

---

## Test Suite 7: Cost & Reliability Analysis

### Test 7.1: SMS Cost Tracking
**For Exhibition/Demo:**
- Track number of SMS OTP requests
- Calculate cost: requests × $0.05
- Compare password vs OTP usage ratio

**Target Metrics:**
- Password usage: >80%
- SMS OTP usage: <20%
- Average cost per user: <$0.10

---

### Test 7.2: SMS Delivery Time
**Test with real Ethiopian numbers:**
- Send 10 OTP requests
- Record delivery time for each
- Calculate average and max delay

**Expected Results:**
- Average: 2-5 minutes
- Max: 30 minutes
- Success rate: >90%

---

## Success Criteria Summary

### Critical (Must Pass)
- [ ] Password authentication works reliably
- [ ] Session persistence across browser restarts
- [ ] Protected routes secured
- [ ] Mobile touch targets adequate
- [ ] Amharic text displays correctly
- [ ] Phone validation prevents invalid numbers

### Important (Should Pass)
- [ ] SMS OTP works (even if slow)
- [ ] Loading states clear
- [ ] Error messages helpful
- [ ] Works on slow networks (3G)
- [ ] No console errors

### Nice to Have
- [ ] Smooth animations
- [ ] Auto-redirect to intended page
- [ ] Multi-tab session sync

---

## Known Issues & Limitations

### SMS OTP Challenges
- ⚠️ Cost: $0.05 per SMS
- ⚠️ Delay: 5-30 minutes in Ethiopia
- ⚠️ Reliability: Ethio Telecom delays common
- ⚠️ Shared phones: OTP may go to wrong person

### Mitigation Strategy
- ✓ Password auth as default
- ✓ Clear warning about SMS costs/delays
- ✓ SMS OTP available but discouraged
- ✓ Future: Consider USSD or alternative auth

---

## Testing Checklist

Before marking Task 2.4 complete:

- [ ] All Test Suite 1 (Password Auth) tests pass
- [ ] All Test Suite 3 (Session Management) tests pass
- [ ] Test Suite 4.1 (Mobile Touch Targets) passes
- [ ] Test Suite 5.1 (Amharic Support) passes
- [ ] At least one SMS OTP test completed successfully
- [ ] No critical console errors
- [ ] App works on mobile device
- [ ] Documentation updated

---

## Next Steps After Testing

1. **If tests pass:** Mark Task 2.4 complete, proceed to Task 3
2. **If tests fail:** Document failures, fix issues, re-test
3. **Cost analysis:** Track SMS usage in production, adjust strategy if needed
4. **User feedback:** Gather farmer feedback on auth experience

---

## Notes for Ethiopian Context

- **Password is primary:** Most farmers will use password auth
- **SMS is backup:** Available but not recommended due to cost/delays
- **Phone as username:** Ethiopian phone number is the unique identifier
- **No email:** Email not required (many farmers don't have email)
- **Offline-first:** Auth must work with intermittent connectivity
- **Low literacy:** Visual cues and bilingual text critical
