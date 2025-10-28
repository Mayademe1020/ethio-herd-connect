# Offline Functionality Testing Guide

## Overview
This guide provides step-by-step instructions for manually testing all offline functionality in the Ethiopian Livestock Management System MVP.

## Prerequisites
- Mobile device or browser with DevTools
- Active internet connection (to start)
- Test account with phone number authentication

## Test Environment Setup

### Option 1: Mobile Device (Recommended)
1. Open the app on your mobile device
2. Log in with your test account
3. Enable Airplane Mode in device settings

### Option 2: Browser DevTools
1. Open the app in Chrome/Edge
2. Open DevTools (F12)
3. Go to Network tab
4. Check "Offline" checkbox

## Test Cases

### Test 1: Animal Registration Offline

**Objective:** Verify animals can be registered while offline and sync when online.

**Steps:**
1. ✅ **Go Offline**
   - Enable Airplane Mode (mobile) or DevTools offline mode (browser)
   - Verify sync status indicator shows "Offline" with red/yellow icon

2. ✅ **Register Animal Offline**
   - Navigate to Home → Add Animal
   - Select Type: Cattle
   - Select Subtype: Cow
   - Enter Name: "Offline Test Cow"
   - (Optional) Skip photo
   - Tap "Register Animal"
   - **Expected:** Success message appears immediately
   - **Expected:** Animal appears in My Animals list
   - **Expected:** Sync indicator shows "1 pending item"

3. ✅ **Register Multiple Animals**
   - Repeat step 2 with:
     - Goat → Male Goat → "Offline Goat"
     - Sheep → Ewe → "Offline Sheep"
   - **Expected:** Sync indicator shows "3 pending items"

4. ✅ **Go Online**
   - Disable Airplane Mode
   - **Expected:** Sync indicator shows "Syncing..." with spinner
   - Wait 5-10 seconds
   - **Expected:** Sync indicator shows "All synced" with green checkmark
   - **Expected:** Pending count returns to 0

5. ✅ **Verify Data in Database**
   - Refresh the app
   - Navigate to My Animals
   - **Expected:** All 3 animals still appear
   - **Expected:** Animals have proper IDs from database

**Pass Criteria:**
- [ ] Animals registered instantly while offline
- [ ] Sync indicator shows correct pending count
- [ ] Auto-sync occurs when connection restored
- [ ] All animals appear in database after sync

---

### Test 2: Milk Recording Offline

**Objective:** Verify milk records can be created offline and sync properly.

**Steps:**
1. ✅ **Setup**
   - Ensure you have at least 1 cow registered
   - Go to Home

2. ✅ **Go Offline**
   - Enable Airplane Mode
   - Verify offline indicator

3. ✅ **Record Milk Offline**
   - Tap "Record Milk" button
   - Select a cow
   - Tap "5L" quick button
   - **Expected:** Success toast appears
   - **Expected:** Redirected to Home
   - **Expected:** Sync indicator shows "1 pending item"

4. ✅ **Record Multiple Sessions**
   - Record milk for same cow: 3L
   - Record milk for different cow: 4L
   - **Expected:** Sync indicator shows "3 pending items"

5. ✅ **Go Online**
   - Disable Airplane Mode
   - **Expected:** Auto-sync starts
   - **Expected:** All 3 records sync successfully

6. ✅ **Verify Milk History**
   - Navigate to My Animals → Select cow → View Details
   - **Expected:** Milk records appear in history
   - **Expected:** Daily/weekly totals are correct

**Pass Criteria:**
- [ ] Milk recorded instantly while offline
- [ ] Multiple records queue correctly
- [ ] Auto-sync processes all records
- [ ] Milk history displays correctly after sync

---

### Test 3: Marketplace Listing Offline

**Objective:** Verify marketplace listings can be created offline.

**Steps:**
1. ✅ **Setup**
   - Ensure you have at least 1 animal not yet listed
   - Go offline

2. ✅ **Create Listing Offline**
   - Navigate to Marketplace → My Listings → Create Listing
   - Select an animal
   - Enter price: 15000 ETB
   - Toggle "Negotiable" ON
   - (Optional) Skip photo
   - Tap "Create Listing"
   - **Expected:** Success message
   - **Expected:** Listing appears in My Listings
   - **Expected:** Sync indicator shows "1 pending item"

3. ✅ **Go Online and Sync**
   - Disable Airplane Mode
   - Wait for auto-sync
   - **Expected:** Listing syncs successfully

4. ✅ **Verify in Marketplace**
   - Navigate to Marketplace → Browse
   - **Expected:** Your listing appears
   - **Expected:** Other users can see it

**Pass Criteria:**
- [ ] Listing created instantly while offline
- [ ] Listing appears in My Listings immediately
- [ ] Auto-sync publishes listing
- [ ] Listing visible to other users after sync

---

### Test 4: Buyer Interest Offline

**Objective:** Verify buyer interests can be expressed offline.

**Steps:**
1. ✅ **Setup**
   - Browse marketplace listings (while online)
   - Find a listing you want to express interest in
   - Go offline

2. ✅ **Express Interest Offline**
   - Tap on listing to view details
   - Tap "Express Interest" button
   - Enter message: "Interested in buying"
   - Tap "Send"
   - **Expected:** Success message
   - **Expected:** Sync indicator shows "1 pending item"

3. ✅ **Go Online and Sync**
   - Disable Airplane Mode
   - Wait for auto-sync
   - **Expected:** Interest syncs successfully

4. ✅ **Verify Seller Receives Interest**
   - Log in as the seller (different account)
   - Navigate to My Listings → View Interests
   - **Expected:** Interest appears with buyer's phone and message

**Pass Criteria:**
- [ ] Interest submitted instantly while offline
- [ ] Auto-sync delivers interest to seller
- [ ] Seller can see buyer's contact info

---

### Test 5: Manual Sync Button

**Objective:** Verify manual sync button works correctly.

**Steps:**
1. ✅ **Queue Multiple Actions Offline**
   - Go offline
   - Register 1 animal
   - Record milk for 1 cow
   - Create 1 listing
   - **Expected:** Sync indicator shows "3 pending items"

2. ✅ **Go Online (Don't Wait for Auto-Sync)**
   - Disable Airplane Mode
   - Immediately tap "Sync Now" button in sync indicator
   - **Expected:** Sync starts immediately
   - **Expected:** Progress indicator shows syncing

3. ✅ **Verify Sync Completes**
   - Wait for sync to finish
   - **Expected:** Success toast: "3 items synced"
   - **Expected:** Pending count returns to 0
   - **Expected:** Last sync timestamp updates

**Pass Criteria:**
- [ ] Manual sync button is visible when pending items exist
- [ ] Manual sync processes all queued items
- [ ] Success message shows correct count
- [ ] Last sync timestamp updates

---

### Test 6: Retry Logic for Failed Syncs

**Objective:** Verify retry logic with exponential backoff.

**Steps:**
1. ✅ **Simulate Network Failure**
   - Go offline
   - Register 1 animal
   - Go online
   - Immediately go offline again (before sync completes)
   - **Expected:** Sync fails

2. ✅ **Observe Retry Attempts**
   - Go online
   - Watch sync indicator
   - **Expected:** Retry attempt 1 after 1 second
   - If fails, **Expected:** Retry attempt 2 after 2 seconds
   - If fails, **Expected:** Retry attempt 3 after 4 seconds
   - Continue up to 5 attempts

3. ✅ **Verify Max Retries**
   - If all 5 retries fail:
   - **Expected:** Item marked as "Failed"
   - **Expected:** Error message shown
   - **Expected:** Option to retry manually

4. ✅ **Manual Retry**
   - Tap "Retry Failed Items" button
   - **Expected:** Failed items reset to pending
   - **Expected:** Sync attempts again

**Pass Criteria:**
- [ ] Retry delays follow exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] Max 5 retry attempts before marking as failed
- [ ] Failed items can be manually retried
- [ ] Successful retry removes item from queue

---

### Test 7: Sync Status Indicator

**Objective:** Verify sync status indicator displays correct information.

**Steps:**
1. ✅ **Online Status**
   - Ensure device is online
   - **Expected:** Green checkmark icon
   - **Expected:** Text: "All synced" or "Online"
   - **Expected:** Last sync timestamp visible

2. ✅ **Offline Status**
   - Go offline
   - **Expected:** Red/yellow icon
   - **Expected:** Text: "Offline"
   - **Expected:** No pending items initially

3. ✅ **Pending Items Count**
   - While offline, register 2 animals
   - **Expected:** Badge shows "2"
   - **Expected:** Text: "2 pending items"

4. ✅ **Syncing Status**
   - Go online
   - During sync:
   - **Expected:** Spinner icon
   - **Expected:** Text: "Syncing..."
   - **Expected:** Progress indicator (optional)

5. ✅ **Last Sync Timestamp**
   - After successful sync:
   - **Expected:** Timestamp updates
   - **Expected:** Format: "Last synced: 2 minutes ago"
   - **Expected:** Updates in real-time

6. ✅ **Error Status**
   - If sync fails:
   - **Expected:** Warning icon
   - **Expected:** Text: "Sync failed"
   - **Expected:** Retry button visible

**Pass Criteria:**
- [ ] Indicator shows correct online/offline status
- [ ] Pending count is accurate
- [ ] Syncing animation displays during sync
- [ ] Last sync timestamp updates correctly
- [ ] Error states are clearly communicated

---

### Test 8: Complete Offline-to-Online Workflow

**Objective:** Test complete user journey from offline to online.

**Steps:**
1. ✅ **Start Offline**
   - Enable Airplane Mode
   - Open app (should work from cache)

2. ✅ **Perform Multiple Actions**
   - Register 2 animals
   - Record milk for 2 cows (4 records total)
   - Create 1 marketplace listing
   - Express interest in 1 listing
   - **Expected:** All actions complete instantly
   - **Expected:** Sync indicator shows "8 pending items"

3. ✅ **Verify Local Data**
   - Navigate through app
   - **Expected:** All new data visible locally
   - **Expected:** Animals appear in My Animals
   - **Expected:** Milk records show in history
   - **Expected:** Listing appears in My Listings

4. ✅ **Go Online**
   - Disable Airplane Mode
   - **Expected:** Auto-sync starts within 2 seconds
   - **Expected:** Progress indicator shows syncing

5. ✅ **Monitor Sync Progress**
   - Watch sync indicator
   - **Expected:** Pending count decreases as items sync
   - **Expected:** "7 pending... 6 pending... 5 pending..." etc.

6. ✅ **Verify Sync Completion**
   - Wait for all items to sync
   - **Expected:** Success toast: "8 items synced"
   - **Expected:** Pending count: 0
   - **Expected:** Last sync timestamp updates

7. ✅ **Verify Data Persistence**
   - Close and reopen app
   - **Expected:** All data still present
   - **Expected:** No pending items
   - **Expected:** Data matches database

**Pass Criteria:**
- [ ] All 8 actions queue correctly while offline
- [ ] Local data is immediately accessible
- [ ] Auto-sync processes all items in order
- [ ] No data loss during sync
- [ ] App remains usable during sync

---

## Performance Benchmarks

### Sync Speed Targets
- **Single item sync:** < 1 second
- **10 items sync:** < 5 seconds
- **50 items sync:** < 20 seconds

### Network Conditions
Test on different network speeds:
- **WiFi:** All items should sync in < 5 seconds
- **4G:** All items should sync in < 10 seconds
- **3G:** All items should sync in < 20 seconds
- **2G:** May take longer, but should complete

---

## Common Issues and Troubleshooting

### Issue: Items Not Syncing
**Symptoms:** Pending count stays the same after going online
**Solutions:**
1. Check internet connection is actually restored
2. Tap "Sync Now" button manually
3. Check browser console for errors
4. Verify Supabase connection

### Issue: Duplicate Items After Sync
**Symptoms:** Same animal appears twice after sync
**Solutions:**
1. Check offline queue for duplicate entries
2. Verify optimistic UI updates are working
3. Clear local cache and retry

### Issue: Sync Indicator Not Updating
**Symptoms:** Indicator shows old status
**Solutions:**
1. Refresh the page
2. Check if listeners are properly subscribed
3. Verify state management is working

### Issue: Failed Syncs Not Retrying
**Symptoms:** Items marked as failed immediately
**Solutions:**
1. Check retry logic implementation
2. Verify exponential backoff delays
3. Check max retry count setting

---

## Test Results Template

### Test Session Information
- **Date:** _______________
- **Tester:** _______________
- **Device:** _______________
- **OS Version:** _______________
- **Browser:** _______________
- **Network:** _______________

### Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| 1. Animal Registration Offline | ⬜ Pass ⬜ Fail | |
| 2. Milk Recording Offline | ⬜ Pass ⬜ Fail | |
| 3. Marketplace Listing Offline | ⬜ Pass ⬜ Fail | |
| 4. Buyer Interest Offline | ⬜ Pass ⬜ Fail | |
| 5. Manual Sync Button | ⬜ Pass ⬜ Fail | |
| 6. Retry Logic | ⬜ Pass ⬜ Fail | |
| 7. Sync Status Indicator | ⬜ Pass ⬜ Fail | |
| 8. Complete Workflow | ⬜ Pass ⬜ Fail | |

### Overall Assessment
- **Total Tests:** 8
- **Passed:** ___
- **Failed:** ___
- **Pass Rate:** ___%

### Critical Issues Found
1. _______________
2. _______________
3. _______________

### Recommendations
1. _______________
2. _______________
3. _______________

---

## Automated Test Execution

To run the automated offline tests:

```bash
npm run test -- src/__tests__/offline.test.ts
```

Or with Vitest UI:

```bash
npm run test:ui
```

Then navigate to `offline.test.ts` in the UI.

---

## Sign-Off

**Tester Signature:** _______________
**Date:** _______________
**Status:** ⬜ Approved ⬜ Needs Revision

