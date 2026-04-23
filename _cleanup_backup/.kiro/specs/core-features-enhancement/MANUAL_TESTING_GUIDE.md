# Manual Testing Guide for Core Features Enhancement

This guide provides comprehensive manual testing procedures for all Phase 1-7 features implemented in the Core Features Enhancement spec.

## Prerequisites

- Application running locally or on staging environment
- Test user account with demo data
- Multiple test animals (cattle, goats, sheep) with various statuses
- Test marketplace listings
- Access to both English and Amharic language settings

---

## Phase 1: Milk Recording Enhancements

### Test 1.1: Milk Summary Card Display

**Steps:**
1. Navigate to Milk Production Records page
2. Verify milk summary card is visible at the top
3. Check that weekly total is displayed
4. Click "Monthly" toggle
5. Verify monthly total is displayed

**Expected Results:**
- Summary card shows total liters, record count, and average
- Trend indicator (↑ ↓ →) is visible with percentage
- Toggle switches between weekly and monthly views
- Comparison with previous period is shown

**Bug Severity:** Critical if summary doesn't display, High if calculations are incorrect

---

### Test 1.2: Edit Milk Record

**Steps:**
1. Navigate to Milk Production Records page
2. Find a recent milk record (< 7 days old)
3. Click the edit button on the record
4. Change the amount to a different value
5. Change the session if applicable
6. Click Save

**Expected Results:**
- Edit modal opens with pre-filled values
- Amount can be changed (0-100L validation)
- Session can be changed
- Success message appears after save
- Summary recalculates automatically

**Bug Severity:** High if edit doesn't work, Medium if validation fails

---

### Test 1.3: Edit Old Milk Record (>7 days)

**Steps:**
1. Navigate to Milk Production Records page
2. Filter to show records from 2+ weeks ago
3. Click edit on an old record
4. Verify confirmation warning appears
5. Click Confirm
6. Make changes and save

**Expected Results:**
- Warning message appears for records >7 days old
- User must confirm before editing
- Edit proceeds normally after confirmation

**Bug Severity:** Medium if warning doesn't appear

---

### Test 1.4: Milk Summary Trend Calculation

**Steps:**
1. Record milk for several days
2. Increase amounts over time
3. Navigate to Milk Production Records
4. Check trend indicator

**Expected Results:**
- Trend shows "increasing" with upward arrow (↑)
- Percentage change is displayed
- Trend updates when toggling between weekly/monthly

**Bug Severity:** Medium if trend is incorrect

---

## Phase 2: Video Upload

### Test 2.1: Upload Valid Video

**Steps:**
1. Navigate to Create Listing
2. Select an animal
3. Enter price and details
4. Upload a video (≤10 seconds, ≤20MB, MP4 format)
5. Wait for upload to complete
6. Submit listing

**Expected Results:**
- Video uploads successfully
- Progress indicator shows percentage
- Thumbnail is generated automatically
- Video preview is shown
- Listing is created with video

**Bug Severity:** Critical if video upload fails completely

---

### Test 2.2: Video Duration Validation

**Steps:**
1. Navigate to Create Listing
2. Try to upload a video >10 seconds
3. Verify error message

**Expected Results:**
- Error message: "Video must be 10 seconds or less"
- Upload is rejected
- User can try again with different video

**Bug Severity:** High if validation doesn't work

---

### Test 2.3: Video Size Validation

**Steps:**
1. Navigate to Create Listing
2. Try to upload a video >20MB
3. Verify error message

**Expected Results:**
- Error message: "Video must be 20MB or less"
- Upload is rejected
- User can try again with different video

**Bug Severity:** High if validation doesn't work

---

### Test 2.4: Video Format Validation

**Steps:**
1. Navigate to Create Listing
2. Try to upload a non-MP4/MOV/AVI video (e.g., WebM)
3. Verify error message

**Expected Results:**
- Error message: "Invalid video format. Use MP4, MOV, or AVI"
- Upload is rejected

**Bug Severity:** High if validation doesn't work

---

### Test 2.5: Video Playback in Listing Detail

**Steps:**
1. Navigate to a listing with video
2. Click on the listing
3. Verify video player is shown
4. Click play button
5. Watch video

**Expected Results:**
- Thumbnail is displayed with play button
- Video plays inline when clicked
- Play/pause controls work
- Video loads without errors

**Bug Severity:** High if video doesn't play

---

### Test 2.6: Video Upload on Slow Network

**Steps:**
1. Throttle network to 3G speed (use browser DevTools)
2. Upload a video to a listing
3. Monitor progress

**Expected Results:**
- Upload completes within 30 seconds on 3G
- Progress indicator updates smoothly
- No timeout errors

**Bug Severity:** Medium if upload is too slow

---

## Phase 3: Edit Functionality

### Test 3.1: Edit Animal Information

**Steps:**
1. Navigate to My Animals
2. Click on an animal
3. Click Edit button
4. Change name, subtype, or photo
5. Save changes

**Expected Results:**
- Edit modal opens with current values
- All fields can be modified
- Photo can be replaced
- Success message appears
- Changes are reflected immediately

**Bug Severity:** High if edit doesn't work

---

### Test 3.2: Edit Listing

**Steps:**
1. Navigate to My Listings
2. Click Edit on a listing
3. Change price, negotiable status, or description
4. Save changes

**Expected Results:**
- Edit modal opens with current values
- All fields can be modified
- Warning shown if buyer interests exist
- Original creation date is preserved
- Success message appears

**Bug Severity:** High if edit doesn't work

---

### Test 3.3: Edit History Tracking

**Steps:**
1. Edit an animal or listing multiple times
2. Check if edit count is displayed
3. Verify last_edited_at timestamp

**Expected Results:**
- Edit count increments with each edit
- Last edited timestamp updates
- Edit history is preserved in database

**Bug Severity:** Low if history tracking doesn't work

---

## Phase 4: Pregnancy Tracking

### Test 4.1: Record Pregnancy

**Steps:**
1. Navigate to a female animal (cow, ewe, female goat)
2. Click "Record Pregnancy"
3. Enter breeding date (30 days ago)
4. Verify calculated delivery date
5. Save pregnancy record

**Expected Results:**
- Pregnancy tracker modal opens
- Delivery date is calculated correctly based on animal type
  - Cattle: 283 days
  - Goat: 150 days
  - Sheep: 147 days
- Days remaining is shown
- Pregnancy status updates to "pregnant"

**Bug Severity:** Critical if pregnancy can't be recorded

---

### Test 4.2: Pregnancy Alert (<7 days)

**Steps:**
1. Find or create a pregnant animal with delivery <7 days away
2. Navigate to animal detail
3. Verify alert is shown

**Expected Results:**
- Prominent alert banner appears
- Countdown shows days remaining
- "Record Birth" button is visible
- Alert is color-coded (red/orange)

**Bug Severity:** High if alert doesn't appear

---

### Test 4.3: Record Birth

**Steps:**
1. Navigate to a pregnant animal
2. Click "Record Birth"
3. Select outcome (successful/terminated)
4. Optionally register offspring
5. Save birth record

**Expected Results:**
- Birth modal opens
- Outcome can be selected
- Option to register offspring is available
- Pregnancy status updates to "delivered"
- Pregnancy badge is removed from animal card

**Bug Severity:** High if birth can't be recorded

---

### Test 4.4: Pregnancy Badge on Animal Cards

**Steps:**
1. Navigate to My Animals
2. Find pregnant animals
3. Verify pregnancy badge is shown

**Expected Results:**
- Pregnancy badge (🤰 icon) is visible
- Days until delivery is shown
- Badge is color-coded based on urgency

**Bug Severity:** Medium if badge doesn't appear

---

### Test 4.5: Pregnancy History

**Steps:**
1. Navigate to a female animal with past pregnancies
2. Scroll to pregnancy history section
3. Verify past pregnancies are listed

**Expected Results:**
- All past pregnancies are shown
- Breeding dates and outcomes are displayed
- Offspring links work (if registered)

**Bug Severity:** Low if history doesn't display

---

## Phase 5: Marketplace Notifications

### Test 5.1: Buyer Interest Notification

**Steps:**
1. Create a listing as Seller A
2. Express interest as Buyer B (different account)
3. Check notifications as Seller A

**Expected Results:**
- Notification appears immediately
- Buyer's phone number is shown
- Optional message is displayed
- Call and WhatsApp buttons work
- Notification badge updates

**Bug Severity:** Critical if notification doesn't appear

---

### Test 5.2: Notification Badge

**Steps:**
1. Receive multiple notifications
2. Check notification badge on bottom navigation
3. Mark some as read
4. Verify badge count updates

**Expected Results:**
- Badge shows unread count
- Count updates in real-time
- Badge disappears when all read
- Max count is 99+

**Bug Severity:** Medium if badge doesn't update

---

### Test 5.3: Notification Actions

**Steps:**
1. Open a buyer interest notification
2. Click Call button
3. Click WhatsApp button
4. Click Mark as Read

**Expected Results:**
- Call button opens phone dialer with buyer's number
- WhatsApp button opens WhatsApp with pre-filled message
- Mark as Read updates notification status
- Notification moves to "Read" section

**Bug Severity:** High if actions don't work

---

### Test 5.4: Notification Filtering

**Steps:**
1. Navigate to Notifications page
2. Click "All" tab
3. Click "Unread" tab
4. Click "Buyer Interests" tab

**Expected Results:**
- All tab shows all notifications
- Unread tab shows only unread
- Buyer Interests tab shows only buyer interest notifications
- Filtering works correctly

**Bug Severity:** Medium if filtering doesn't work

---

### Test 5.5: Mark All as Read

**Steps:**
1. Have multiple unread notifications
2. Click "Mark All as Read" button
3. Verify all notifications are marked as read

**Expected Results:**
- All notifications update to read status
- Badge count goes to 0
- Unread filter shows empty state

**Bug Severity:** Low if doesn't work

---

## Phase 6: Milk Recording Reminders

### Test 6.1: Enable Morning Reminder

**Steps:**
1. Navigate to Profile page
2. Find reminder settings section
3. Enable morning reminder
4. Set time to 7:00 AM
5. Save settings

**Expected Results:**
- Toggle switches to enabled
- Time picker appears
- Settings save successfully
- Confirmation message appears

**Bug Severity:** High if reminder can't be enabled

---

### Test 6.2: Enable Afternoon Reminder

**Steps:**
1. Navigate to Profile page
2. Enable afternoon reminder
3. Set time to 5:00 PM
4. Save settings

**Expected Results:**
- Toggle switches to enabled
- Time picker appears
- Settings save successfully

**Bug Severity:** High if reminder can't be enabled

---

### Test 6.3: Reminder Notification (Time-based)

**Steps:**
1. Set morning reminder to current time + 2 minutes
2. Wait for reminder time
3. Check notifications

**Expected Results:**
- Notification appears at scheduled time
- Shows count of animals pending recording
- "Record Milk" button navigates to recording page
- Snooze button is available

**Bug Severity:** Critical if reminder doesn't trigger

---

### Test 6.4: Snooze Reminder

**Steps:**
1. Receive a milk reminder notification
2. Click Snooze button
3. Wait 15 minutes

**Expected Results:**
- Notification is snoozed
- Reminder appears again after 15 minutes
- Snooze count is tracked

**Bug Severity:** Medium if snooze doesn't work

---

### Test 6.5: Completion Notification

**Steps:**
1. Receive morning reminder
2. Record milk for all animals
3. Check for completion notification

**Expected Results:**
- Achievement notification appears
- Shows daily totals
- Shows weekly streak (if applicable)

**Bug Severity:** Low if completion notification doesn't appear

---

## Phase 7: Market Intelligence Alerts

### Test 7.1: New Listing Alert

**Steps:**
1. Enable market alerts in profile
2. Create a new listing as another user
3. Check notifications

**Expected Results:**
- Alert appears for new listing
- Shows animal type and price
- Shows distance (if location available)
- "View Listing" button works

**Bug Severity:** Medium if alert doesn't appear

---

### Test 7.2: Price Change Alert

**Steps:**
1. Enable price alerts
2. Monitor market for significant price changes
3. Check notifications

**Expected Results:**
- Alert appears when prices change >15%
- Shows price trend (up/down)
- Shows percentage change
- Chart or graph is displayed

**Bug Severity:** Low if alert doesn't appear

---

### Test 7.3: Opportunity Alert

**Steps:**
1. Have animals similar to high-demand listings
2. Wait for opportunity detection (runs daily)
3. Check notifications

**Expected Results:**
- Alert suggests listing opportunity
- Shows competitive pricing
- Shows market demand data
- "Create Listing" button works

**Bug Severity:** Low if alert doesn't appear

---

### Test 7.4: Alert Preferences

**Steps:**
1. Navigate to Profile page
2. Find market alert preferences
3. Disable certain alert types
4. Set distance threshold
5. Set price change threshold
6. Save settings

**Expected Results:**
- All preferences can be customized
- Disabled alerts don't appear
- Thresholds are respected
- Settings persist across sessions

**Bug Severity:** Medium if preferences don't work

---

## Cross-Feature Testing

### Test CF.1: Offline Mode - All Features

**Steps:**
1. Disconnect from internet
2. Edit an animal
3. Edit a milk record
4. Record a pregnancy
5. Edit a listing
6. Reconnect to internet
7. Verify all changes sync

**Expected Results:**
- All actions work offline
- Offline indicators are shown
- Actions are queued
- All changes sync when online
- No data loss

**Bug Severity:** Critical if offline mode doesn't work

---

### Test CF.2: Language Switching - All Features

**Steps:**
1. Set language to English
2. Navigate through all new features
3. Switch to Amharic
4. Navigate through all new features again
5. Verify translations

**Expected Results:**
- All text translates correctly
- Amharic text renders properly (no boxes)
- No missing translations
- Consistent terminology
- UI layout doesn't break

**Bug Severity:** High if translations are missing or broken

---

### Test CF.3: Performance - All Features

**Steps:**
1. Test milk summary calculation speed
2. Test video upload speed (on 3G)
3. Test edit operation speed
4. Test pregnancy calculation speed
5. Test notification delivery speed

**Expected Results:**
- Milk summary: <500ms
- Video upload: <30 seconds on 3G
- Edit operations: <2 seconds
- Pregnancy calculation: instant
- Notification delivery: <2 seconds

**Bug Severity:** Medium if performance targets not met

---

## Bug Reporting Template

When you find a bug, document it using this template:

```markdown
### Bug #[NUMBER]: [Short Description]

**Severity:** Critical / High / Medium / Low

**Feature:** [Phase and feature name]

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Result:**
[What should happen]

**Actual Result:**
[What actually happens]

**Screenshots/Videos:**
[Attach if applicable]

**Environment:**
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/Linux]
- Device: [Desktop/Mobile]
- Language: [English/Amharic]
- Network: [Online/Offline/3G]

**Additional Notes:**
[Any other relevant information]
```

---

## Bug Priority Guidelines

### Critical
- Feature completely broken
- Data loss occurs
- App crashes
- Security vulnerability
- Offline mode doesn't work

### High
- Feature partially broken
- Incorrect calculations
- Validation doesn't work
- Major UI issues
- Performance significantly below target

### Medium
- Minor functionality issues
- UI inconsistencies
- Missing translations
- Performance slightly below target
- Non-critical validation issues

### Low
- Cosmetic issues
- Minor UI improvements
- Nice-to-have features
- Documentation issues

---

## Testing Checklist

Use this checklist to track your testing progress:

### Phase 1: Milk Recording Enhancements
- [ ] Test 1.1: Milk Summary Card Display
- [ ] Test 1.2: Edit Milk Record
- [ ] Test 1.3: Edit Old Milk Record
- [ ] Test 1.4: Milk Summary Trend Calculation

### Phase 2: Video Upload
- [ ] Test 2.1: Upload Valid Video
- [ ] Test 2.2: Video Duration Validation
- [ ] Test 2.3: Video Size Validation
- [ ] Test 2.4: Video Format Validation
- [ ] Test 2.5: Video Playback in Listing Detail
- [ ] Test 2.6: Video Upload on Slow Network

### Phase 3: Edit Functionality
- [ ] Test 3.1: Edit Animal Information
- [ ] Test 3.2: Edit Listing
- [ ] Test 3.3: Edit History Tracking

### Phase 4: Pregnancy Tracking
- [ ] Test 4.1: Record Pregnancy
- [ ] Test 4.2: Pregnancy Alert (<7 days)
- [ ] Test 4.3: Record Birth
- [ ] Test 4.4: Pregnancy Badge on Animal Cards
- [ ] Test 4.5: Pregnancy History

### Phase 5: Marketplace Notifications
- [ ] Test 5.1: Buyer Interest Notification
- [ ] Test 5.2: Notification Badge
- [ ] Test 5.3: Notification Actions
- [ ] Test 5.4: Notification Filtering
- [ ] Test 5.5: Mark All as Read

### Phase 6: Milk Recording Reminders
- [ ] Test 6.1: Enable Morning Reminder
- [ ] Test 6.2: Enable Afternoon Reminder
- [ ] Test 6.3: Reminder Notification
- [ ] Test 6.4: Snooze Reminder
- [ ] Test 6.5: Completion Notification

### Phase 7: Market Intelligence Alerts
- [ ] Test 7.1: New Listing Alert
- [ ] Test 7.2: Price Change Alert
- [ ] Test 7.3: Opportunity Alert
- [ ] Test 7.4: Alert Preferences

### Cross-Feature Testing
- [ ] Test CF.1: Offline Mode - All Features
- [ ] Test CF.2: Language Switching - All Features
- [ ] Test CF.3: Performance - All Features

---

## Next Steps After Testing

1. **Document all bugs found** using the bug reporting template
2. **Prioritize bugs** by severity (Critical → High → Medium → Low)
3. **Fix critical and high severity bugs** immediately
4. **Retest after fixes** to verify resolution
5. **Update this document** with any new test cases discovered
6. **Create regression test suite** for future releases

---

## Notes

- Test with real data when possible
- Test on multiple devices (desktop, mobile, tablet)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test with both English and Amharic languages
- Test with slow network conditions
- Test offline mode thoroughly
- Take screenshots/videos of bugs for documentation

---

**Last Updated:** [Current Date]
**Tested By:** [Your Name]
**Version:** 1.0
