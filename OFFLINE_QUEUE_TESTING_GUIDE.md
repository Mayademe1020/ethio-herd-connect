# Offline Queue & Sync Testing Guide

## Overview

This guide provides comprehensive testing instructions for the offline queue and sync functionality implemented in Task 9.

## Implementation Summary

### Components Created

1. **offlineQueue.ts** - IndexedDB-based queue manager with exponential backoff retry
2. **SyncStatusIndicator.tsx** - Visual component showing online/offline status and pending items
3. **useBackgroundSync.tsx** - Hook for service worker registration and background sync
4. **useMarketplaceListing.tsx** - New hook for marketplace listings with offline support

### Components Updated

1. **useAnimalRegistration.tsx** - Integrated with offline queue
2. **useMilkRecording.tsx** - Integrated with offline queue
3. **useBuyerInterest.tsx** - Added offline support
4. **SimpleHome.tsx** - Added SyncStatusIndicator and background sync
5. **service-worker.js** - Updated to support background sync

## Testing Checklist

### Prerequisites

- [ ] Application is running locally
- [ ] User is logged in
- [ ] Browser DevTools is open (F12)
- [ ] Network tab is visible in DevTools

### Test 1: Register Animal Offline

**Steps:**
1. Open DevTools → Network tab
2. Enable "Offline" mode (checkbox at top)
3. Navigate to "Add Animal" page
4. Select animal type (e.g., Cattle)
5. Select subtype (e.g., Cow)
6. Enter name (optional)
7. Click "Register"

**Expected Results:**
- [ ] Toast notification shows "📱 ከመስመር ውጭ / Offline"
- [ ] Message says "Animal saved locally. Will sync when online."
- [ ] Animal appears in local state
- [ ] SyncStatusIndicator shows "Offline" with pending count
- [ ] No network errors in console

**Verification:**
```javascript
// Open browser console and run:
const { offlineQueue } = await import('./src/lib/offlineQueue.ts');
const pending = await offlineQueue.getPendingItems();
console.log('Pending items:', pending);
// Should show 1 item with actionType: 'animal_registration'
```

### Test 2: Record Milk Offline

**Steps:**
1. Keep "Offline" mode enabled
2. Navigate to "Record Milk" page
3. Select a cow
4. Select amount (e.g., 5L)
5. Click "Record"

**Expected Results:**
- [ ] Milk record is saved locally
- [ ] Optimistic UI update shows the record immediately
- [ ] SyncStatusIndicator shows increased pending count (now 2)
- [ ] No errors in console

### Test 3: Create Listing Offline

**Steps:**
1. Keep "Offline" mode enabled
2. Navigate to marketplace
3. Try to create a new listing
4. Fill in required fields
5. Submit

**Expected Results:**
- [ ] Toast shows offline message
- [ ] Listing saved locally
- [ ] SyncStatusIndicator shows increased pending count (now 3)

### Test 4: Express Interest Offline

**Steps:**
1. Keep "Offline" mode enabled
2. Browse marketplace listings
3. Click on a listing
4. Click "Express Interest"
5. Add optional message
6. Submit

**Expected Results:**
- [ ] Interest saved locally
- [ ] SyncStatusIndicator shows increased pending count (now 4)

### Test 5: Automatic Sync When Online

**Steps:**
1. Disable "Offline" mode in DevTools
2. Wait 2-3 seconds
3. Observe the sync process

**Expected Results:**
- [ ] SyncStatusIndicator changes to "Online"
- [ ] Toast notification shows "✓ መስመር ላይ / Back Online"
- [ ] Another toast shows "Syncing your data..."
- [ ] Pending count decreases as items sync
- [ ] After sync completes, shows "All synced"
- [ ] All 4 actions are now in Supabase database

**Verification:**
```javascript
// Check queue is empty:
const pending = await offlineQueue.getPendingItems();
console.log('Pending items:', pending);
// Should show empty array []
```

### Test 6: Manual Sync Button

**Steps:**
1. Enable "Offline" mode again
2. Register another animal
3. Disable "Offline" mode
4. Click "Sync Now" button in SyncStatusIndicator

**Expected Results:**
- [ ] Button shows loading state
- [ ] Sync processes immediately
- [ ] Toast shows success message
- [ ] Pending count goes to 0

### Test 7: Retry Logic with Failed Syncs

**Steps:**
1. Enable "Offline" mode
2. Register an animal
3. Disable "Offline" mode
4. Quickly enable "Offline" mode again (before sync completes)
5. Wait and observe retry attempts

**Expected Results:**
- [ ] Queue attempts to sync
- [ ] Fails due to offline mode
- [ ] Retries with exponential backoff (1s, 2s, 4s, 8s, 16s)
- [ ] After 5 failed attempts, marks as failed
- [ ] When back online, can retry failed items

**Verification:**
```javascript
// Check retry counts:
const items = await offlineQueue.getAllItems();
console.log('Items with retry counts:', items);
// Should show retryCount incrementing
```

### Test 8: Background Sync (Service Worker)

**Steps:**
1. Ensure service worker is registered
2. Enable "Offline" mode
3. Register an animal
4. Close the browser tab
5. Disable "Offline" mode (in OS network settings)
6. Wait 30 seconds
7. Reopen the application

**Expected Results:**
- [ ] Service worker triggered background sync
- [ ] Animal is synced to database
- [ ] Queue is empty when app reopens

**Verification:**
```javascript
// Check service worker status:
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('Service Worker:', reg);
  console.log('Active:', reg.active);
});
```

### Test 9: Multiple Items Sync Order

**Steps:**
1. Enable "Offline" mode
2. Register 3 animals
3. Record milk for 2 cows
4. Create 1 listing
5. Express interest in 1 listing
6. Disable "Offline" mode
7. Observe sync order

**Expected Results:**
- [ ] Items sync in order they were created
- [ ] All items sync successfully
- [ ] No duplicate entries in database
- [ ] SyncStatusIndicator shows progress

### Test 10: Sync Status Persistence

**Steps:**
1. Enable "Offline" mode
2. Register an animal
3. Refresh the page
4. Check SyncStatusIndicator

**Expected Results:**
- [ ] Pending count persists after refresh
- [ ] Queue items are still in IndexedDB
- [ ] Can still sync when going online

### Test 11: Error Handling

**Steps:**
1. Enable "Offline" mode
2. Register an animal with invalid data (if possible)
3. Disable "Offline" mode
4. Observe error handling

**Expected Results:**
- [ ] Invalid items are marked as failed
- [ ] Error message is stored
- [ ] User can see failed items
- [ ] Can retry failed items manually

### Test 12: Network Interruption During Sync

**Steps:**
1. Enable "Offline" mode
2. Register 5 animals
3. Disable "Offline" mode
4. As soon as sync starts, enable "Offline" mode again
5. Observe behavior

**Expected Results:**
- [ ] Some items may sync successfully
- [ ] Remaining items stay in queue
- [ ] No data corruption
- [ ] Retry logic handles interruption gracefully

## Performance Testing

### Test 13: Large Queue Performance

**Steps:**
1. Enable "Offline" mode
2. Register 20 animals
3. Record milk 30 times
4. Create 10 listings
5. Disable "Offline" mode
6. Measure sync time

**Expected Results:**
- [ ] Sync completes in reasonable time (<30 seconds)
- [ ] UI remains responsive during sync
- [ ] No memory leaks
- [ ] IndexedDB handles large queue efficiently

### Test 14: Concurrent Operations

**Steps:**
1. Enable "Offline" mode
2. Quickly register 5 animals in succession
3. Disable "Offline" mode immediately
4. Observe sync behavior

**Expected Results:**
- [ ] All items are queued correctly
- [ ] No race conditions
- [ ] All items sync successfully
- [ ] No duplicate entries

## Browser Compatibility Testing

Test on the following browsers:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Chrome Mobile (Android)
- [ ] Safari Mobile (iOS)

## Device Testing

Test on the following devices:
- [ ] Desktop (Windows/Mac/Linux)
- [ ] Android phone (old device - Android 8)
- [ ] Android phone (mid-range - Android 11)
- [ ] iPhone (iOS 14+)
- [ ] Tablet (Android/iOS)

## Network Conditions Testing

Test under the following network conditions:
- [ ] WiFi (fast)
- [ ] 4G (good signal)
- [ ] 3G (simulated in DevTools)
- [ ] 2G (simulated in DevTools)
- [ ] Intermittent connectivity (toggle on/off)
- [ ] Airplane mode

## Known Limitations

1. **Service Worker Scope**: Background sync only works when service worker is active
2. **Browser Support**: Background Sync API not supported in all browsers (fallback to manual sync)
3. **Storage Limits**: IndexedDB has storage limits (typically 50MB+)
4. **Retry Limits**: Max 5 retry attempts before marking as failed

## Troubleshooting

### Queue Not Processing

**Problem**: Items stay in queue even when online

**Solutions**:
1. Check browser console for errors
2. Verify service worker is registered
3. Manually trigger sync with "Sync Now" button
4. Check network connectivity
5. Verify Supabase connection

### Duplicate Entries

**Problem**: Same item appears multiple times in database

**Solutions**:
1. Check for race conditions in code
2. Verify unique ID generation
3. Add database constraints
4. Check retry logic

### Sync Failures

**Problem**: Items marked as failed after retries

**Solutions**:
1. Check error messages in queue items
2. Verify data format matches schema
3. Check authentication status
4. Verify RLS policies allow insert

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No data loss
- ✅ No duplicate entries
- ✅ Smooth user experience
- ✅ Clear status indicators
- ✅ Reliable sync when online
- ✅ Graceful offline handling

## Next Steps

After testing is complete:
1. Document any bugs found
2. Fix critical issues
3. Optimize performance if needed
4. Update user documentation
5. Prepare for production deployment
