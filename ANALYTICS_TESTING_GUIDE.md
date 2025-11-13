# Analytics System - Comprehensive Testing Guide

## Overview

This guide provides a complete testing strategy for the analytics system, covering all scenarios from basic functionality to edge cases and exhibition readiness.

---

## 📋 Test Categories

### 1. **Event Tracking Tests**
### 2. **Offline Queue Tests**
### 3. **Dashboard Display Tests**
### 4. **Data Accuracy Tests**
### 5. **Performance Tests**
### 6. **Edge Case Tests**
### 7. **Exhibition Readiness Tests**

---

## 1️⃣ Event Tracking Tests

### Test 1.1: Animal Registration Tracking
**Objective:** Verify animal_registered event is tracked correctly

**Steps:**
1. Navigate to Register Animal page
2. Select animal type (Cattle)
3. Select subtype (Cow)
4. Enter name (optional)
5. Upload photo (optional)
6. Submit registration

**Expected Results:**
- ✅ Event `animal_registered` created in database
- ✅ Properties include: `animal_type`, `animal_subtype`, `has_photo`, `has_name`, `is_offline`
- ✅ Event appears in analytics dashboard within 5 seconds
- ✅ Animals Registered count increments by 1

**Test Variations:**
- [ ] With photo
- [ ] Without photo
- [ ] With name
- [ ] Without name
- [ ] Different animal types (Cattle, Goat, Sheep)
- [ ] Different subtypes (Cow, Bull, Ox, Calf, etc.)

---

### Test 1.2: Milk Recording Tracking
**Objective:** Verify milk_recorded event is tracked correctly

**Steps:**
1. Navigate to Record Milk page
2. Select a cow
3. Choose milk amount (or enter custom)
4. Submit recording

**Expected Results:**
- ✅ Event `milk_recorded` created in database
- ✅ Properties include: `amount`, `session`, `animal_id`, `is_offline`
- ✅ Session auto-detected correctly (morning before 12pm, evening after)
- ✅ Event appears in analytics dashboard
- ✅ Milk Recorded count increments by 1

**Test Variations:**
- [ ] Morning session (before 12pm)
- [ ] Evening session (after 12pm)
- [ ] Different amounts (2L, 3L, 5L, 7L, 10L, custom)
- [ ] Multiple recordings for same cow
- [ ] Multiple recordings for different cows

---

### Test 1.3: Listing Creation Tracking
**Objective:** Verify listing_created event is tracked correctly

**Steps:**
1. Navigate to Create Listing page
2. Select animal to list
3. Enter price
4. Toggle negotiable option
5. Add photo (optional)
6. Add location (optional)
7. Submit listing

**Expected Results:**
- ✅ Event `listing_created` created in database
- ✅ Properties include: `price`, `is_negotiable`, `has_photo`, `has_location`, `is_offline`
- ✅ Event appears in analytics dashboard
- ✅ Listings Created count increments by 1

**Test Variations:**
- [ ] With photo
- [ ] Without photo
- [ ] With location
- [ ] Without location
- [ ] Negotiable = true
- [ ] Negotiable = false
- [ ] Different price ranges (5000, 15000, 25000, 50000)

---

### Test 1.4: Listing Viewed Tracking
**Objective:** Verify listing_viewed event is tracked correctly

**Steps:**
1. Navigate to Marketplace Browse
2. Click on any listing
3. View listing detail page

**Expected Results:**
- ✅ Event `listing_viewed` created in database
- ✅ Properties include: `listing_id`, `price`, `animal_type`, `is_negotiable`, `is_own_listing`
- ✅ Event appears in analytics dashboard
- ✅ Event fires only once per page load (not on refresh)

**Test Variations:**
- [ ] View own listing (`is_own_listing: true`)
- [ ] View other user's listing (`is_own_listing: false`)
- [ ] View multiple listings in sequence
- [ ] Refresh page (should create new event)

---

### Test 1.5: Interest Expressed Tracking
**Objective:** Verify interest_expressed event is tracked correctly

**Steps:**
1. Navigate to a listing detail page (not your own)
2. Click "Express Interest" button
3. Enter message (optional)
4. Submit interest

**Expected Results:**
- ✅ Event `interest_expressed` created in database
- ✅ Properties include: `listing_id`, `has_message`, `is_offline`
- ✅ Event appears in analytics dashboard
- ✅ Interests Expressed count increments by 1

**Test Variations:**
- [ ] With message
- [ ] Without message
- [ ] Multiple interests on different listings
- [ ] Cannot express interest on own listing

---

## 2️⃣ Offline Queue Tests

### Test 2.1: Offline Event Queuing
**Objective:** Verify events are queued when offline

**Steps:**
1. Turn on airplane mode / disconnect internet
2. Perform any tracked action (register animal, record milk, etc.)
3. Check localStorage for queued events

**Expected Results:**
- ✅ Event added to localStorage queue
- ✅ Property `is_offline: true` set correctly
- ✅ User sees "Queued for sync" message
- ✅ Dashboard shows "Pending" count > 0

**Test Variations:**
- [ ] Queue animal registration
- [ ] Queue milk recording
- [ ] Queue listing creation
- [ ] Queue interest expression
- [ ] Queue multiple events (5-10)

---

### Test 2.2: Offline Event Syncing
**Objective:** Verify queued events sync when online

**Steps:**
1. Perform Test 2.1 (queue events offline)
2. Turn off airplane mode / reconnect internet
3. Wait for auto-sync or trigger manual sync

**Expected Results:**
- ✅ All queued events sent to Supabase
- ✅ Events appear in analytics_events table
- ✅ localStorage queue cleared
- ✅ Dashboard "Pending" count returns to 0
- ✅ All counts update correctly

**Test Variations:**
- [ ] Auto-sync on reconnection
- [ ] Manual sync with button
- [ ] Sync 1 event
- [ ] Sync 10 events
- [ ] Sync mixed event types

---

### Test 2.3: Offline Queue Persistence
**Objective:** Verify queue persists across app restarts

**Steps:**
1. Queue events offline (Test 2.1)
2. Close browser tab
3. Reopen app
4. Check if queued events still present

**Expected Results:**
- ✅ Queued events persist in localStorage
- ✅ Dashboard shows correct "Pending" count
- ✅ Events sync when connection restored

---

## 3️⃣ Dashboard Display Tests

### Test 3.1: Summary Cards Display
**Objective:** Verify summary cards show correct data

**Steps:**
1. Navigate to Profile page
2. View Analytics Dashboard section
3. Check all 4 summary cards

**Expected Results:**
- ✅ Total Events card shows correct count
- ✅ Last 24h card shows events from last 24 hours only
- ✅ Last 7 days card shows events from last 7 days only
- ✅ Pending card shows queued events count

**Test Variations:**
- [ ] With 0 events (empty state)
- [ ] With 1-5 events
- [ ] With 10+ events
- [ ] With 100+ events
- [ ] With events older than 7 days

---

### Test 3.2: Activity Summary Cards
**Objective:** Verify activity cards show correct counts

**Steps:**
1. Perform various actions (register animal, record milk, etc.)
2. Navigate to Profile page
3. Check activity summary cards

**Expected Results:**
- ✅ Animals Registered card shows correct count
- ✅ Milk Recorded card shows correct count
- ✅ Listings Created card shows correct count
- ✅ Interests Expressed card shows correct count
- ✅ Counts match actual events in database

---

### Test 3.3: Top Actions Breakdown
**Objective:** Verify top actions list is accurate

**Steps:**
1. Perform multiple actions of different types
2. Navigate to Profile page
3. Check Top Actions section

**Expected Results:**
- ✅ Shows top 5 most frequent actions
- ✅ Actions sorted by count (highest first)
- ✅ Percentages add up correctly
- ✅ Progress bars reflect percentages visually
- ✅ Emoji icons display correctly
- ✅ Event names translated correctly

**Test Variations:**
- [ ] With 1-4 event types (shows all)
- [ ] With 5 event types (shows all 5)
- [ ] With 6+ event types (shows top 5 only)
- [ ] With equal counts (stable sort)

---

### Test 3.4: Empty State Display
**Objective:** Verify empty state shows when no data

**Steps:**
1. Use fresh account with no events
2. Navigate to Profile page
3. View Analytics Dashboard

**Expected Results:**
- ✅ Shows "No Data Yet" message
- ✅ Shows encouraging description
- ✅ All counts show 0
- ✅ No top actions section displayed
- ✅ Bilingual messages display correctly

---

### Test 3.5: Real-time Updates
**Objective:** Verify dashboard updates after new events

**Steps:**
1. Open Profile page with Analytics Dashboard visible
2. In another tab, perform a tracked action
3. Return to Profile page

**Expected Results:**
- ✅ Dashboard updates automatically (React Query refetch)
- ✅ New event appears in counts
- ✅ Top actions update if needed
- ✅ Summary cards reflect new data

---

## 4️⃣ Data Accuracy Tests

### Test 4.1: Event Properties Accuracy
**Objective:** Verify all event properties are correct

**Steps:**
1. Perform each tracked action
2. Query analytics_events table directly
3. Verify all properties

**Expected Results:**
- ✅ `event_name` matches action type
- ✅ `user_id` matches current user
- ✅ `session_id` is present and valid
- ✅ `properties` JSON contains all expected fields
- ✅ `created_at` timestamp is accurate
- ✅ No null or undefined values where not expected

---

### Test 4.2: Count Calculations
**Objective:** Verify dashboard counts match database

**Steps:**
1. Perform known number of actions (e.g., 5 animals, 3 milk records)
2. Query database directly for counts
3. Compare with dashboard display

**Expected Results:**
- ✅ Total events = sum of all events
- ✅ 24h events = events with created_at > 24 hours ago
- ✅ 7d events = events with created_at > 7 days ago
- ✅ Specific counts (animals, milk, etc.) match database
- ✅ Percentages calculated correctly

---

### Test 4.3: Time Period Filtering
**Objective:** Verify time-based filtering is accurate

**Steps:**
1. Create events at different times:
   - 1 hour ago
   - 12 hours ago
   - 2 days ago
   - 5 days ago
   - 10 days ago
2. Check dashboard counts

**Expected Results:**
- ✅ Last 24h includes events from 1h and 12h ago only
- ✅ Last 7 days includes events from 1h, 12h, 2d, and 5d ago
- ✅ Total includes all events
- ✅ Events older than 7 days not in 7d count

---

## 5️⃣ Performance Tests

### Test 5.1: Dashboard Load Time
**Objective:** Verify dashboard loads quickly

**Steps:**
1. Navigate to Profile page
2. Measure time until dashboard fully rendered

**Expected Results:**
- ✅ Dashboard loads in < 2 seconds
- ✅ Loading skeleton shows during fetch
- ✅ No layout shift when data loads
- ✅ Smooth transitions

**Test Variations:**
- [ ] With 0 events
- [ ] With 10 events
- [ ] With 100 events
- [ ] With 1000 events
- [ ] On slow 3G network

---

### Test 5.2: Event Tracking Performance
**Objective:** Verify tracking doesn't slow down actions

**Steps:**
1. Perform tracked action (e.g., register animal)
2. Measure total time from submit to success

**Expected Results:**
- ✅ Analytics tracking adds < 100ms overhead
- ✅ User action completes normally
- ✅ No blocking or freezing
- ✅ Tracking happens asynchronously

---

### Test 5.3: Batch Event Handling
**Objective:** Verify system handles multiple events efficiently

**Steps:**
1. Perform 10 actions rapidly in sequence
2. Check all events tracked correctly
3. Verify dashboard updates

**Expected Results:**
- ✅ All 10 events tracked
- ✅ No events lost
- ✅ Dashboard shows correct counts
- ✅ No performance degradation

---

## 6️⃣ Edge Case Tests

### Test 6.1: Rapid Action Repetition
**Objective:** Verify system handles spam/rapid clicks

**Steps:**
1. Click submit button rapidly 10 times
2. Check how many events created

**Expected Results:**
- ✅ Only 1 event created (duplicate prevention)
- ✅ OR all events created if legitimate
- ✅ No errors or crashes
- ✅ Dashboard shows correct count

---

### Test 6.2: Network Interruption Mid-Action
**Objective:** Verify graceful handling of network loss

**Steps:**
1. Start performing action
2. Disconnect internet mid-request
3. Check event status

**Expected Results:**
- ✅ Event queued for offline sync
- ✅ User sees appropriate message
- ✅ Action completes when online
- ✅ No data loss

---

### Test 6.3: Large Property Values
**Objective:** Verify system handles large data in properties

**Steps:**
1. Create event with large property values
   - Very long message (1000+ characters)
   - Large numbers
   - Special characters

**Expected Results:**
- ✅ Event stored correctly
- ✅ No truncation or corruption
- ✅ Dashboard displays correctly
- ✅ No performance issues

---

### Test 6.4: Concurrent User Sessions
**Objective:** Verify analytics work with multiple sessions

**Steps:**
1. Open app in 2 different browsers
2. Perform actions in both
3. Check both dashboards

**Expected Results:**
- ✅ Each session tracks independently
- ✅ Events associated with correct user
- ✅ No cross-contamination
- ✅ Both dashboards show correct data

---

### Test 6.5: Browser Storage Limits
**Objective:** Verify handling of localStorage limits

**Steps:**
1. Queue 100+ events offline
2. Check localStorage size
3. Attempt to queue more

**Expected Results:**
- ✅ System handles large queue
- ✅ OR shows warning when limit approached
- ✅ No crashes or data loss
- ✅ Graceful degradation if needed

---

## 7️⃣ Exhibition Readiness Tests

### Test 7.1: Demo Scenario Walkthrough
**Objective:** Verify complete demo flow works perfectly

**Demo Script:**
1. Start with fresh account (0 events)
2. Show empty state dashboard
3. Register 2 animals (1 with photo, 1 without)
4. Record milk for 1 animal
5. Create 1 marketplace listing
6. View another listing
7. Express interest on listing
8. Return to dashboard and show updated metrics

**Expected Results:**
- ✅ All actions complete smoothly
- ✅ Dashboard updates in real-time
- ✅ Counts accurate: 2 animals, 1 milk, 1 listing, 1 interest
- ✅ Top actions show all 5 event types
- ✅ Visual appeal impresses audience
- ✅ No errors or glitches

---

### Test 7.2: Offline Demo Scenario
**Objective:** Demonstrate offline capability

**Demo Script:**
1. Show dashboard with some existing data
2. Turn on airplane mode (show indicator)
3. Register animal offline
4. Record milk offline
5. Show "Pending" count increased
6. Turn off airplane mode
7. Show auto-sync happening
8. Show dashboard updated with new data

**Expected Results:**
- ✅ Offline actions work smoothly
- ✅ Clear visual feedback (pending count)
- ✅ Sync happens automatically
- ✅ Dashboard reflects synced data
- ✅ Impressive demonstration of offline capability

---

### Test 7.3: Bilingual Demo
**Objective:** Demonstrate language switching

**Demo Script:**
1. Show dashboard in English
2. Switch to Amharic
3. Show all labels translated
4. Perform action in Amharic
5. Show dashboard updates in Amharic

**Expected Results:**
- ✅ Instant language switch
- ✅ All text translated correctly
- ✅ No layout breaks
- ✅ Numbers and counts display correctly
- ✅ Smooth user experience

---

### Test 7.4: Mobile Device Demo
**Objective:** Verify perfect mobile experience

**Demo Script:**
1. Open app on physical mobile device
2. Navigate to Profile page
3. Show analytics dashboard
4. Perform actions on mobile
5. Show dashboard updates

**Expected Results:**
- ✅ Dashboard responsive on mobile
- ✅ Cards stack properly (2 columns)
- ✅ Touch targets large enough
- ✅ Smooth scrolling
- ✅ Fast load times
- ✅ Professional appearance

---

### Test 7.5: Stress Test for Exhibition
**Objective:** Verify system handles exhibition load

**Steps:**
1. Simulate 10 users performing actions simultaneously
2. Check all events tracked
3. Verify no performance degradation
4. Check database for any issues

**Expected Results:**
- ✅ All events tracked correctly
- ✅ No lost events
- ✅ No slowdowns
- ✅ Database handles load
- ✅ Ready for exhibition traffic

---

## 📊 Test Results Template

### Test Execution Checklist

| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| 1.1 | Animal Registration Tracking | ⬜ | |
| 1.2 | Milk Recording Tracking | ⬜ | |
| 1.3 | Listing Creation Tracking | ⬜ | |
| 1.4 | Listing Viewed Tracking | ⬜ | |
| 1.5 | Interest Expressed Tracking | ⬜ | |
| 2.1 | Offline Event Queuing | ⬜ | |
| 2.2 | Offline Event Syncing | ⬜ | |
| 2.3 | Offline Queue Persistence | ⬜ | |
| 3.1 | Summary Cards Display | ⬜ | |
| 3.2 | Activity Summary Cards | ⬜ | |
| 3.3 | Top Actions Breakdown | ⬜ | |
| 3.4 | Empty State Display | ⬜ | |
| 3.5 | Real-time Updates | ⬜ | |
| 4.1 | Event Properties Accuracy | ⬜ | |
| 4.2 | Count Calculations | ⬜ | |
| 4.3 | Time Period Filtering | ⬜ | |
| 5.1 | Dashboard Load Time | ⬜ | |
| 5.2 | Event Tracking Performance | ⬜ | |
| 5.3 | Batch Event Handling | ⬜ | |
| 6.1 | Rapid Action Repetition | ⬜ | |
| 6.2 | Network Interruption | ⬜ | |
| 6.3 | Large Property Values | ⬜ | |
| 6.4 | Concurrent User Sessions | ⬜ | |
| 6.5 | Browser Storage Limits | ⬜ | |
| 7.1 | Demo Scenario Walkthrough | ⬜ | |
| 7.2 | Offline Demo Scenario | ⬜ | |
| 7.3 | Bilingual Demo | ⬜ | |
| 7.4 | Mobile Device Demo | ⬜ | |
| 7.5 | Stress Test | ⬜ | |

**Legend:** ⬜ Not Started | 🟡 In Progress | ✅ Passed | ❌ Failed

---

## 🔍 Database Verification Queries

### Check Total Events
```sql
SELECT COUNT(*) as total_events
FROM analytics_events
WHERE user_id = 'YOUR_USER_ID';
```

### Check Events by Type
```sql
SELECT event_name, COUNT(*) as count
FROM analytics_events
WHERE user_id = 'YOUR_USER_ID'
GROUP BY event_name
ORDER BY count DESC;
```

### Check Recent Events (24h)
```sql
SELECT event_name, COUNT(*) as count
FROM analytics_events
WHERE user_id = 'YOUR_USER_ID'
  AND created_at > NOW() - INTERVAL '24 hours'
GROUP BY event_name;
```

### Check Event Properties
```sql
SELECT event_name, properties, created_at
FROM analytics_events
WHERE user_id = 'YOUR_USER_ID'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Events Not Appearing in Dashboard
**Symptoms:** Actions performed but dashboard doesn't update
**Checks:**
- Verify event in database
- Check React Query cache
- Verify user_id matches
- Check browser console for errors

**Solutions:**
- Refresh page
- Clear React Query cache
- Check network tab for failed requests

### Issue 2: Incorrect Counts
**Symptoms:** Dashboard counts don't match database
**Checks:**
- Run database queries to verify actual counts
- Check time period filtering logic
- Verify user_id filtering

**Solutions:**
- Fix calculation logic in useAnalytics hook
- Clear cache and refetch

### Issue 3: Offline Queue Not Syncing
**Symptoms:** Events stay in "Pending" after going online
**Checks:**
- Check localStorage for queued events
- Verify network connection
- Check browser console for sync errors

**Solutions:**
- Trigger manual sync
- Check Supabase connection
- Verify RLS policies allow insert

---

## ✅ Sign-Off Criteria

Analytics system is ready for exhibition when:

- [ ] All 30 tests pass
- [ ] No critical bugs found
- [ ] Demo scenarios work flawlessly
- [ ] Mobile experience is smooth
- [ ] Offline capability demonstrated
- [ ] Bilingual support verified
- [ ] Performance meets targets (<2s load)
- [ ] Database queries optimized
- [ ] Error handling graceful
- [ ] Exhibition team trained on demo

---

## 📝 Notes for Testers

1. **Test on Real Devices:** Use actual mobile phones, not just browser DevTools
2. **Test with Real Data:** Use realistic Ethiopian names, amounts, prices
3. **Test Network Conditions:** Use Chrome DevTools to simulate 3G/4G
4. **Document Everything:** Screenshot any issues, note exact steps to reproduce
5. **Think Like a User:** Test as if you're a farmer using the app
6. **Test Edge Cases:** Try to break it - rapid clicks, large inputs, etc.
7. **Verify Translations:** Check both English and Amharic thoroughly
8. **Time Everything:** Measure load times, action completion times
9. **Check Mobile UX:** Ensure touch targets are large enough (44px minimum)
10. **Prepare for Demo:** Practice the demo script multiple times

---

**Testing Duration Estimate:** 2-3 hours for comprehensive testing
**Priority:** HIGH - Critical for exhibition success
**Owner:** QA Team + Development Team
**Deadline:** Before exhibition deployment
