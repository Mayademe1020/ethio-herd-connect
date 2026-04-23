# ETHIO HERD CONNECT - BETA TESTING SCRIPT
## Critical Features: Animal Registration + Milk Recording + Offline Sync

### Version: Pre-Beta 1.0
### Date: 2026-02-08
### Scope: Core Farmer Functionality

---

## 1. ANIMAL REGISTRATION TEST SUITE

### 1.1 TECHNICAL TESTING

#### Test 1.1.1: Basic Registration Flow
**Purpose**: Verify animal can be registered with minimal fields
**Preconditions**: User logged in, online mode
**Steps**:
1. Navigate to "Add Animal" from SimpleHome
2. Select Type: "Cattle"
3. Select Subtype: "Cow"
4. Enter Name: "TestCow001"
5. Upload photo (< 500KB)
6. Click "Register"

**Expected Results**:
- ✅ Registration completes in < 3 seconds
- ✅ Animal appears in "My Animals" list immediately
- ✅ Photo optimized to < 100KB
- ✅ Success toast shown in Amharic

**Technical Checks**:
```javascript
// Verify IndexedDB has animal
db.animals.where('name').equals('TestCow001').count() // Should be 1

// Verify Supabase has animal
supabase.from('animals').select().eq('name', 'TestCow001') // Should return 1 row

// Verify photo URL format
animal.photo_url.startsWith('https://') // Should be true
```

#### Test 1.1.2: Offline Registration
**Purpose**: Register animal without internet
**Preconditions**: User logged in, **airplane mode ON**
**Steps**:
1. Turn off WiFi/Mobile data
2. Click "Add Animal"
3. Complete registration (Type, Subtype, Name, Photo)
4. Submit
5. Check offline queue
6. Turn internet back on
7. Wait for sync

**Expected Results**:
- ✅ Shows "Saved locally - will sync when online"
- ✅ Animal in IndexedDB with `sync_status: 'pending'`
- ✅ Queue has 1 item with action_type: 'animal_registration'
- ✅ After sync: Animal appears in Supabase
- ✅ Offline banner disappears after sync

**Technical Validation**:
```javascript
// Check queue before sync
const queue = await offlineQueue.getAll();
queue.length === 1 // true
queue[0].status === 'pending' // true

// Check after sync
queue[0].status === 'synced' // true
```

#### Test 1.1.3: Duplicate Detection
**Purpose**: Prevent duplicate animal registration
**Preconditions**: Animal "Bella" already registered
**Steps**:
1. Try to register another animal named "Bella"
2. Same type: "Cattle", subtype: "Cow"

**Expected Results**:
- ⚠️ Warning: "Animal with this name already exists"
- ❌ Registration blocked OR
- ✅ Registration allowed with warning

**Technical Check**:
```sql
-- Should show existing animal
SELECT * FROM animals 
WHERE user_id = 'current_user' 
AND name ILIKE 'bella' 
AND type = 'cattle';
```

#### Test 1.1.4: Photo Compression
**Purpose**: Ensure photos are optimized for slow networks
**Steps**:
1. Select photo: 5MB, 4000x3000px
2. Complete registration

**Expected Results**:
- ✅ Original: 5MB → Compressed: < 100KB
- ✅ Dimensions reduced to max 800x600
- ✅ Format: JPEG, quality: 80%
- ✅ Compression takes < 2 seconds

**Metrics**:
```javascript
const metrics = {
  originalSize: 5120000, // bytes
  compressedSize: 85000, // bytes
  compressionRatio: 98.3, // %
  processingTime: 1200, // ms
  width: 800,
  height: 600
};
```

---

### 1.2 OPERATIONAL TESTING

#### Test 1.2.1: User Workflow Efficiency
**Scenario**: Farmer has 20 animals to register
**Steps**:
1. Time registration of 5 animals
2. Count clicks per registration
3. Measure cognitive load

**Acceptance Criteria**:
- ✅ < 30 seconds per animal
- ✅ < 5 clicks to complete
- ✅ No typing required (dropdowns only)
- ✅ Photo optional (can skip)

**Performance Benchmarks**:
```
Average registration time: ___ seconds
Average clicks: ___
Error rate: ___%
User satisfaction (1-5): ___
```

#### Test 1.2.2: Error Recovery
**Scenario**: Registration fails mid-process
**Steps**:
1. Start registration
2. Kill app at step 2
3. Reopen app
4. Check if data preserved

**Expected Results**:
- ✅ Form draft saved
- ✅ Photo preserved
- ✅ User returns to same step

#### Test 1.2.3: Battery Impact
**Test**: Register 10 animals with photos
**Device**: Low-end Android (2GB RAM)
**Measurement**:
- Battery before: ___%
- Battery after: ___%
- Time elapsed: ___ minutes

**Acceptance**: < 5% battery drain for 10 registrations

---

### 1.3 INTEGRATION TESTING

#### Test 1.3.1: Animal → Milk Recording Integration
**Flow**: Register animal → Record milk for it
**Steps**:
1. Register cow "MorningStar"
2. Immediately go to Record Milk
3. Check if "MorningStar" appears in list

**Expected Results**:
- ✅ New animal appears in milk recording list
- ✅ No app restart required
- ✅ Appears within 2 seconds

#### Test 1.3.2: Animal → Analytics Integration
**Steps**:
1. Register 5 animals
2. Go to Analytics Dashboard
3. Check "Total Animals" metric

**Expected Results**:
- ✅ Count updates immediately
- ✅ Chart reflects new data
- ✅ All animal types shown correctly

#### Test 1.3.3: Multi-Device Sync
**Scenario**: Same user on 2 phones
**Steps**:
1. Phone A: Register animal offline
2. Phone B: Online, view animals
3. Phone A: Go online
4. Check Phone B

**Expected Results**:
- ✅ Phone B eventually sees new animal
- ✅ Sync within 30 seconds
- ✅ No duplicates created

---

### 1.4 OPTIMIZATION TESTING

#### Test 1.4.1: Large Dataset Performance
**Test**: Register 100 animals
**Metrics**:
- Initial load time: ___ ms
- Scroll performance: ___ fps
- Search response: ___ ms
- Memory usage: ___ MB

**Acceptance**:
- Load time < 2 seconds
- Scroll maintains 60fps
- Search < 100ms

#### Test 1.4.2: Network Optimization
**Test**: Register on 2G network (0.1 Mbps)
**Steps**:
1. Throttle network to 2G
2. Register animal with photo
3. Measure time

**Acceptance**:
- Registration completes < 10 seconds
- Photo uploads in background
- User can continue using app

#### Test 1.4.3: Storage Management
**Test**: Device with limited storage (100MB free)
**Steps**:
1. Fill storage to 95%
2. Try to register animal
3. Check behavior

**Expected Results**:
- ⚠️ Warning: "Storage almost full"
- ✅ Suggests clearing old photos
- ❌ OR blocks new registrations

---

## 2. MILK RECORDING TEST SUITE

### 2.1 TECHNICAL TESTING

#### Test 2.1.1: Basic Recording
**Purpose**: Record milk production
**Steps**:
1. Go to "Record Milk"
2. Select cow: "Bella"
3. Enter amount: 12.5 liters
4. Submit

**Expected Results**:
- ✅ Record saved to Supabase
- ✅ Appears in "Today's Records"
- ✅ Daily total updated
- ✅ Success notification

**Database Validation**:
```sql
-- Check milk_production table
SELECT * FROM milk_production 
WHERE animal_id = 'bella_id' 
AND recorded_at >= CURRENT_DATE;
-- Should return 1 row with liters = 12.5
```

#### Test 2.1.2: Offline Recording
**Purpose**: Record milk without internet
**Steps**:
1. Turn off internet
2. Record 15L for "Bella"
3. Record 8L for "Daisy"
4. Check queue
5. Turn on internet

**Expected Results**:
- ✅ Both records in queue
- ✅ Queue status: 'pending'
- ✅ After sync: both in database
- ✅ Totals calculated correctly

**Queue Validation**:
```javascript
const queue = await offlineQueue.getPending();
queue.length === 2 // true
queue.every(item => item.action_type === 'milk_record') // true
```

#### Test 2.1.3: Today's Tasks Widget
**Purpose**: Show cows needing milk recording
**Steps**:
1. Register 5 cows
2. Record milk for 3 cows
3. Check SimpleHome "Today's Tasks"

**Expected Results**:
- ✅ Shows 2 cows without milk
- ✅ Lists by priority (oldest first?)
- ✅ "Record Milk" button works
- ✅ Updates after recording

**Algorithm Check**:
```javascript
// Should return cows WITHOUT milk records today
const cowsNeedingMilk = allCows.filter(cow => {
  const hasRecordToday = milkRecords.some(record => 
    record.animal_id === cow.id && 
    isToday(record.recorded_at)
  );
  return !hasRecordToday;
});
```

#### Test 2.1.4: Daily Totals Calculation
**Purpose**: Accurate daily milk production
**Steps**:
1. Record multiple amounts throughout day
2. Check SimpleHome stats
3. Compare yesterday vs today

**Test Data**:
```
Morning: Bella 12L, Daisy 8L
Evening: Bella 10L, Daisy 6L
Expected Total Today: 36L
```

**Validation**:
```sql
SELECT SUM(liters) as total 
FROM milk_production 
WHERE user_id = 'user_id' 
AND recorded_at >= CURRENT_DATE 
AND recorded_at < CURRENT_DATE + INTERVAL '1 day';
-- Should return 36
```

#### Test 2.1.5: Edit/Delete Records
**Purpose**: Fix recording mistakes
**Steps**:
1. Record 10L for Bella
2. Realize mistake: should be 12L
3. Edit record
4. Delete test record

**Expected Results**:
- ✅ Edit updates total
- ✅ Delete removes from total
- ✅ History shows edit trail
- ✅ Offline edits sync correctly

---

### 2.2 OPERATIONAL TESTING

#### Test 2.2.1: Morning Rush Scenario
**Scenario**: Farmer records 20 cows before 7 AM
**Measurement**:
- Time per recording: ___ seconds
- Total time: ___ minutes
- Errors made: ___

**Acceptance**:
- < 10 seconds per cow
- < 5 minutes total
- Zero errors

#### Test 2.2.2: Low Light Conditions
**Test**: Use app at 5 AM (dark)
**Checks**:
- Screen brightness adequate
- Buttons large enough
- Text readable
- No eye strain

#### Test 2.2.3: One-Handed Operation
**Test**: Record milk while holding bucket
**Steps**:
1. Try to navigate with one hand
2. Try to enter amounts
3. Submit record

**Acceptance**:
- ✅ All actions possible with one hand
- ✅ No precise tapping required
- ✅ Voice input works (if available)

---

### 2.3 INTEGRATION TESTING

#### Test 2.3.1: Milk → Analytics Flow
**Steps**:
1. Record milk for 7 days
2. Check Milk Summary page
3. Check Analytics Dashboard

**Expected Results**:
- ✅ Daily chart shows all 7 days
- ✅ Trends calculated correctly
- ✅ Average per cow accurate
- ✅ Compare to last week

#### Test 2.3.2: Milk → Financial Integration
**Steps**:
1. Record milk: 50L/day for 30 days
2. Set price: 25 ETB/liter
3. Check income calculation

**Expected**:
- ✅ Monthly income: 50 × 25 × 30 = 37,500 ETB
- ✅ Shows in dashboard
- ✅ Yearly projection available

#### Test 2.3.3: Multiple Users Same Farm
**Scenario**: Husband and wife both record milk
**Steps**:
1. User A records Bella: 12L
2. User B records Bella: 12L (duplicate)
3. Check totals

**Expected**:
- ⚠️ Duplicate warning OR
- ✅ Both records kept (total 24L)
- ❌ OR second overwrites first

---

### 2.4 OPTIMIZATION TESTING

#### Test 2.4.1: Concurrent Recordings
**Test**: 2 workers record simultaneously
**Steps**:
1. Worker A and B both online
2. Both record milk for different cows
3. Both submit at same time

**Expected**:
- ✅ No conflicts
- ✅ Both records saved
- ✅ No data corruption

#### Test 2.4.2: Historical Data Performance
**Test**: 1 year of milk records (5000+ entries)
**Metrics**:
- Load time: ___ ms
- Chart rendering: ___ fps
- Export time: ___ seconds

**Acceptance**:
- < 3 seconds to load year view
- Smooth scrolling

---

## 3. OFFLINE SYNC TEST SUITE

### 3.1 TECHNICAL TESTING

#### Test 3.1.1: Queue Management
**Purpose**: Verify queue stores actions correctly
**Steps**:
1. Register 5 animals offline
2. Record milk 10 times offline
3. Check queue state

**Expected Results**:
- ✅ 15 items in queue
- ✅ All status: 'pending'
- ✅ retry_count: 0
- ✅ created_at timestamps accurate

**Validation**:
```javascript
const stats = await offlineQueue.getStats();
stats.total === 15 // true
stats.pending === 15 // true
stats.failed === 0 // true
```

#### Test 3.1.2: Sync Order
**Purpose**: Actions sync in correct order
**Steps**:
1. Register animal "A"
2. Record milk for "A"
3. Update "A" name to "B"
4. Go online

**Expected**:
- ✅ Sync order: Register → Milk → Update
- ✅ No dependency errors
- ✅ Final state: Animal named "B" with milk record

#### Test 3.1.3: Retry Mechanism
**Purpose**: Failed actions retry correctly
**Steps**:
1. Add item to queue
2. Block network (fail sync)
3. Check retry_count
4. Restore network

**Expected**:
- ✅ retry_count increments
- ✅ Uses exponential backoff
- ✅ Max 5 retries
- ✅ After max: status = 'failed'

**Backoff Schedule**:
```
Retry 1: 1 second
Retry 2: 2 seconds
Retry 3: 4 seconds
Retry 4: 8 seconds
Retry 5: 16 seconds
```

#### Test 3.1.4: Conflict Resolution
**Purpose**: Handle edit conflicts
**Scenario**:
1. Phone A offline: Edit animal name to "X"
2. Phone B online: Edit same animal name to "Y"
3. Phone A goes online

**Expected Results** (choose strategy):
- ✅ Last write wins: Name = "X"
- ✅ OR First write wins: Name = "Y"
- ✅ OR Conflict warning shown
- ❌ No data corruption

#### Test 3.1.5: Storage Limits
**Purpose**: Handle queue overflow
**Steps**:
1. Add 1000 items to queue
2. Check IndexedDB
3. Try to add more

**Expected**:
- ✅ Warning at 500 items
- ✅ Error at 1000 items
- ✅ Oldest items auto-removed OR
- ✅ Block new additions

---

### 3.2 OPERATIONAL TESTING

#### Test 3.2.1: Long Offline Period
**Scenario**: 7 days without internet
**Test**:
1. Use app normally for 7 days offline
2. Record all activities
3. Go online
4. Wait for sync

**Expected**:
- ✅ All 7 days data syncs
- ✅ No data loss
- ✅ Sync completes < 5 minutes
- ✅ User notified of success

#### Test 3.2.2: Intermittent Connectivity
**Scenario**: Network comes and goes
**Steps**:
1. Start sync
2. Disconnect at 50%
3. Reconnect
4. Check queue

**Expected**:
- ✅ Partial sync resumes
- ✅ No duplicate data
- ✅ Failed items retry

#### Test 3.2.3: Battery Optimization
**Test**: Sync 500 records
**Measurement**:
- Battery drain: ___%
- CPU usage: ___%
- Time to complete: ___

**Acceptance**:
- < 10% battery drain
- Background sync works
- User can continue using app

---

### 3.3 INTEGRATION TESTING

#### Test 3.3.1: Sync + UI Updates
**Steps**:
1. Have pending items
2. Watch "Sync Status" indicator
3. Go online

**Expected**:
- ✅ Shows "Syncing..." with count
- ✅ Progress updates
- ✅ "All synced" when done
- ✅ Sync badge disappears

#### Test 3.3.2: Sync + Notifications
**Steps**:
1. Complete sync
2. Check for notifications
3. Verify notification content

**Expected**:
- ✅ Toast: "15 items synced"
- ✅ Breakdown by type
- ✅ Click notification → Sync Status page

#### Test 3.3.3: Multi-Table Sync
**Test**: Actions across multiple tables
**Actions**:
1. Register animal → animals table
2. Record milk → milk_production table
3. Create listing → market_listings table

**Expected**:
- ✅ All tables updated
- ✅ Referential integrity maintained
- ✅ No orphaned records

---

### 3.4 OPTIMIZATION TESTING

#### Test 3.4.1: Batch Sync Performance
**Test**: Sync 100 records at once
**Metrics**:
- Total time: ___ seconds
- Requests made: ___
- Failed retries: ___

**Optimization**: Should batch into 10 requests (10 records each)

#### Test 3.4.2: Network Efficiency
**Test**: Compare sync approaches
**Approach A**: 100 individual requests
**Approach B**: 10 batched requests

**Expected**: Approach B is 5x faster

#### Test 3.4.3: Compression
**Test**: Sync large data
**Measurement**:
- Uncompressed size: ___ KB
- Compressed size: ___ KB
- Compression ratio: ___%
- Time saved: ___%

---

## 4. INTERCORRELATION TESTS

### Test 4.1: Full Day Workflow
**Scenario**: Complete farmer daily routine
**Timeline**:
1. **6:00 AM** - Open app (offline), check today's tasks
2. **6:30 AM** - Record morning milk (5 cows)
3. **8:00 AM** - Register new calf
4. **12:00 PM** - View analytics
5. **4:00 PM** - Record evening milk (5 cows)
6. **6:00 PM** - Go online (sync all)

**Validation Points**:
- ✅ Morning milk recorded
- ✅ New calf registered
- ✅ Daily totals accurate
- ✅ All data synced
- ✅ No conflicts

### Test 4.2: Multi-Feature Interaction
**Test**: Use all core features in sequence
**Steps**:
1. Register 3 animals
2. Record milk for all 3
3. View My Animals
4. View Milk Records
5. Check Analytics
6. Edit one animal
7. Delete test data

**Expected**:
- ✅ All features work together
- ✅ Data consistent across views
- ✅ Edits propagate correctly
- ✅ Deletions handled properly

### Test 4.3: Stress Test
**Scenario**: Maximum load simulation
**Load**:
- 100 animals registered
- 500 milk records/day
- 30 days of data
- 10 users on same farm

**Metrics**:
- App response time: ___ ms
- Sync time: ___ minutes
- Memory usage: ___ MB
- Battery drain: ___%/hour

---

## 5. ACCEPTANCE CRITERIA SUMMARY

### Must Pass (Critical):
- [ ] Animal registration works offline
- [ ] Milk recording works offline
- [ ] Sync completes without errors
- [ ] No data loss in any scenario
- [ ] App works on 2G network
- [ ] App works with 100MB free storage

### Should Pass (High):
- [ ] Sync completes < 5 minutes for 7 days data
- [ ] Photo upload < 10 seconds on 2G
- [ ] Registration < 30 seconds
- [ ] Milk recording < 10 seconds
- [ ] Battery drain < 5% per hour

### Nice to Pass (Medium):
- [ ] Handles 1000 animals smoothly
- [ ] Syncs 100 records in < 1 minute
- [ ] Works on 5-year-old Android phone
- [ ] Functions with 50MB free storage

---

## 6. TEST EXECUTION LOG

### Session 1: Basic Functionality
**Date**: _______
**Tester**: _______
**Device**: _______
**Network**: _______

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1.1 | Basic Registration | ⬜ | |
| 1.1.2 | Offline Registration | ⬜ | |
| 2.1.1 | Basic Recording | ⬜ | |
| 2.1.2 | Offline Recording | ⬜ | |

### Session 2: Edge Cases
**Date**: _______
**Issues Found**: _______
**Fixed**: _______

### Session 3: User Acceptance
**Date**: _______
**Testers**: _______
**Feedback**: _______

---

## 7. BUG REPORT TEMPLATE

```
Bug ID: BUG-001
Feature: Animal Registration
Severity: High/Medium/Low

Description:
[Clear description of the bug]

Steps to Reproduce:
1. 
2. 
3. 

Expected:
[What should happen]

Actual:
[What actually happens]

Environment:
- Device: 
- OS: 
- Network: 
- App Version: 

Screenshots:
[Attach screenshots]

Console Errors:
[Paste error messages]
```

---

**END OF TEST SCRIPT**

**Next Steps**:
1. Execute all tests in Session 1
2. Log results in execution log
3. File bugs using template
4. Fix critical issues
5. Re-test until all "Must Pass" criteria met
6. Proceed to Beta release
