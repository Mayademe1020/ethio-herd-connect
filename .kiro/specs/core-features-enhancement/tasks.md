# Core Features Enhancement - Implementation Tasks

**Based on:** requirements.md and design.md  
**Approach:** Incremental, test-driven, focused on core logic

---

## Task List

### PHASE 1: Milk Recording Enhancements (8-10 hours)

- [x] 1. Implement milk summaries and editing




  - [x] 1.1 Create milk summary calculation service


    - Write `calculateWeeklySummary()` function
    - Write `calculateMonthlySummary()` function
    - Write `calculateTrend()` function (increasing/decreasing/stable)
    - Add unit tests for calculations
    - _Requirements: 1.1, 1.6_

  - [x] 1.2 Create MilkSummaryCard component



    - Build card UI with weekly/monthly toggle
    - Display total liters, record count, average
    - Add trend indicator (↑ ↓ →) with percentage
    - Add bilingual labels
    - _Requirements: 1.1, 1.6_

  - [x] 1.3 Update MilkProductionRecords page





    - Integrate MilkSummaryCard at top
    - Add period selector (week/month)
    - Show comparison with previous period
    - _Requirements: 1.1, 1.4_

  - [x] 1.4 Create EditMilkRecordModal component


    - Build modal with pre-filled form
    - Add amount input (0-100L validation)
    - Add session selector (morning/afternoon)
    - Add confirmation for records >7 days old
    - _Requirements: 1.2, 1.5_

  - [x] 1.5 Implement milk record editing logic


    - Create `updateMilkRecord()` function
    - Add edit history tracking
    - Update summaries after edit
    - Add offline queue support
    - _Requirements: 1.2, 1.3_

  - [x] 1.6 Add edit button to milk records list


    - Add edit icon to each record
    - Open EditMilkRecordModal on click
    - Show success toast after save
    - _Requirements: 1.2_

  - [x] 1.7 Create milk edit history table


    - Run database migration
    - Add RLS policies
    - Test edit tracking
    - _Requirements: 1.3_

  - [x] 1.8 Add translations for milk enhancements


    - Add English translations
    - Add Amharic translations
    - Test language switching
    - _Requirements: All Requirement 1_

---

### PHASE 2: Video Upload (10-12 hours)

- [x] 2. Implement marketplace video upload





  - [x] 2.1 Create video validation utilities


    - Write `validateVideoDuration()` (≤10 seconds)
    - Write `validateVideoSize()` (≤20MB)
    - Write `validateVideoFormat()` (MP4, MOV, AVI)
    - Add unit tests
    - _Requirements: 2.2, 2.3, 2.4_

  - [x] 2.2 Create VideoUploadField component


    - Build file picker UI (camera + gallery)
    - Add video preview
    - Show validation errors
    - Display upload progress
    - _Requirements: 2.1, 2.8_

  - [x] 2.3 Implement video compression


    - Add client-side compression library
    - Compress videos before upload
    - Target <5MB compressed size
    - Show compression progress
    - _Requirements: 2.2, 2.3_

  - [x] 2.4 Implement thumbnail generation


    - Generate thumbnail from first frame
    - Compress thumbnail to <100KB
    - Store thumbnail URL
    - _Requirements: 2.5_

  - [x] 2.5 Create video upload service


    - Upload to Supabase Storage
    - Handle chunked uploads
    - Retry on failure
    - Add offline queue support
    - _Requirements: 2.1, 2.7_

  - [x] 2.6 Update CreateListing page


    - Integrate VideoUploadField
    - Make video optional
    - Save video URL and thumbnail
    - _Requirements: 2.1_

  - [x] 2.7 Create VideoPlayer component


    - Display thumbnail with play button
    - Implement inline playback
    - Add simple controls (play/pause)
    - Handle loading states
    - _Requirements: 2.6_

  - [x] 2.8 Update ListingDetail page


    - Show video player if video exists
    - Fallback to photo if no video
    - Track video views (analytics)
    - _Requirements: 2.6_

  - [x] 2.9 Create video storage buckets


    - Create `listing-videos` bucket
    - Create `video-thumbnails` bucket
    - Set up RLS policies
    - Configure CORS
    - _Requirements: 2.1_

  - [x] 2.10 Add translations for video upload


    - Add English translations
    - Add Amharic translations
    - Test error messages
    - _Requirements: All Requirement 2_

---

### PHASE 3: Edit Functionality (6-8 hours)

- [-] 3. Implement edit functionality for animals and listings




  - [x] 3.1 Update database schema for edits


    - Add `last_edited_at` column to animals table
    - Add `edit_count` column to animals table
    - Add `last_edited_at` column to market_listings table
    - Add `edit_count` column to market_listings table
    - Run migration
    - _Requirements: 3.3, 3.8_

  - [x] 3.2 Create EditAnimalModal component


    - Build modal with pre-filled form
    - Allow editing name, subtype, photo
    - Add photo upload/replace functionality
    - Add validation (name required, photo optional)
    - Include bilingual labels
    - _Requirements: 3.2, 3.3_

  - [x] 3.3 Implement animal update service


    - Create `updateAnimal()` function in animal service
    - Update `last_edited_at` and increment `edit_count`
    - Add offline queue support
    - Return updated animal data
    - _Requirements: 3.3_

  - [x] 3.4 Integrate edit functionality in AnimalDetail page


    - Replace placeholder edit button with functional one
    - Open EditAnimalModal on click
    - Refresh animal data after successful edit
    - Show success toast with bilingual message
    - _Requirements: 3.1, 3.2_

  - [x] 3.5 Create EditListingModal component


    - Build modal with pre-filled form
    - Allow editing price, negotiable status, description
    - Allow adding/replacing photos and videos
    - Show warning if buyer interests exist
    - Include bilingual labels
    - _Requirements: 3.5, 3.6, 3.7_

  - [x] 3.6 Implement listing update service


    - Create `updateListing()` function in marketplace service
    - Preserve original creation date
    - Update `last_edited_at` and increment `edit_count`
    - Add offline queue support
    - _Requirements: 3.8_

  - [x] 3.7 Integrate edit functionality in MyListings page






    - Add edit button to each active listing card
    - Open EditListingModal on click
    - Refresh listings after successful edit
    - Show success toast with bilingual message
    - _Requirements: 3.4, 3.5_

  - [x] 3.8 Add translations for edit functionality





    - Add English translations (edit.title, edit.success, edit.confirm, etc.)
    - Add Amharic translations
    - Test language switching in edit flows
    - _Requirements: All Requirement 3_

---

### PHASE 4: Pregnancy Tracking (8-10 hours)

- [x] 4. Implement pregnancy tracking system






  - [x] 4.1 Update database schema for pregnancy


    - Add `pregnancy_status` column to animals table (enum: 'not_pregnant', 'pregnant', 'delivered')
    - Add `pregnancy_data` JSONB column to animals table
    - Run migration
    - Add RLS policies for pregnancy data
    - _Requirements: 4.2, 4.3, 4.7_

  - [x] 4.2 Create pregnancy calculation utilities


    - Write `calculateDeliveryDate()` function with gestation periods (cattle: 283, goat: 150, sheep: 147)
    - Write `calculateDaysRemaining()` function
    - Write `isDeliverySoon()` function (<7 days check)
    - Add unit tests for calculations
    - _Requirements: 4.3, 4.4_

  - [x] 4.3 Create PregnancyTracker component


    - Build pregnancy recording form with breeding date picker
    - Show calculated delivery date based on animal type
    - Display countdown to delivery
    - Add validation (breeding date cannot be in future)
    - Include bilingual labels
    - _Requirements: 4.2, 4.3, 4.4_

  - [x] 4.4 Implement pregnancy service


    - Create `recordPregnancy()` function
    - Store pregnancy data in JSONB (breeding_date, expected_delivery, status)
    - Update animal pregnancy_status
    - Add offline queue support
    - _Requirements: 4.2, 4.3_

  - [x] 4.5 Create PregnancyAlert component


    - Show alert when <7 days to delivery
    - Display prominently with countdown
    - Add action button to record birth
    - Include bilingual text
    - _Requirements: 4.5_

  - [x] 4.6 Create RecordBirthModal component


    - Build birth recording form
    - Allow marking pregnancy as complete
    - Option to register offspring (link to RegisterAnimal)
    - Store birth outcome in pregnancy_data
    - _Requirements: 4.6_

  - [x] 4.7 Update AnimalDetail page for pregnancy


    - Replace placeholder "Record Pregnancy" button with functional one (female animals only)
    - Show pregnancy status and countdown if pregnant
    - Display pregnancy history from pregnancy_data
    - Show PregnancyAlert if <7 days to delivery
    - _Requirements: 4.1, 4.4, 4.5, 4.7_

  - [x] 4.8 Update AnimalCard component for pregnancy


    - Show pregnancy badge if pregnant
    - Display days until delivery
    - Add visual indicator (🤰 icon)
    - _Requirements: 4.8_
 

  - [x] 4.9 Add translations for pregnancy tracking





    - Add English translations (pregnancy.record, pregnancy.daysRemaining, pregnancy.deliverySoon, etc.)
    - Add Amharic translations
    - Test all pregnancy flows with language switching
    - _Requirements: All Requirement 4_

---

### PHASE 5: Marketplace Notifications (6-8 hours)

- [x] 5. Implement marketplace notifications system







  - [x] 5.1 Create notifications database table

    - Create table with columns: id, user_id, type, title, message, priority, action_url, metadata (JSONB), is_read, created_at
    - Add notification types: 'buyer_interest', 'milk_reminder', 'market_alert', 'pregnancy_alert'
    - Add priority levels: 'high', 'medium', 'low'
    - Add indexes on (user_id, type) and (user_id, is_read)
    - Add RLS policies
    - Run migration
    - _Requirements: 5.1, 5.7_


  - [x] 5.2 Create notification service

    - Write `createNotification()` function
    - Write `markAsRead()` function
    - Write `markAllAsRead()` function
    - Write `getUnreadCount()` function
    - Add offline queue support
    - _Requirements: 5.1, 5.5_


  - [x] 5.3 Create NotificationCard component

    - Build card UI with type-specific icons (💰 buyer, 🥛 milk, 📊 market, 🤰 pregnancy)
    - Add quick action buttons (Call, WhatsApp for buyer interests)
    - Show timestamp (relative time)
    - Add read/unread indicator
    - Include bilingual text
    - _Requirements: 5.2, 5.3_


  - [x] 5.4 Create NotificationBadge component

    - Show unread count (max 99+)
    - Add to bottom navigation
    - Animate on new notification
    - Color code by priority (red for high, orange for medium)
    - _Requirements: 5.4_


  - [x] 5.5 Create or update Notifications page

    - List all notifications with NotificationCard
    - Group by date (Today, Yesterday, Earlier)
    - Add filter tabs (All, Unread, Buyer Interests)
    - Implement pull-to-refresh
    - Show empty state
    - _Requirements: 5.1, 5.4_


  - [x] 5.6 Implement buyer interest notifications

    - Trigger notification on buyer_interests insert
    - Include buyer phone and message in metadata
    - Add deep link to listing detail
    - Set priority to 'high'
    - _Requirements: 5.1, 5.2, 5.3_


  - [x] 5.7 Add real-time notification subscriptions

    - Subscribe to notifications table for current user
    - Update UI on new notification
    - Show toast for high-priority notifications
    - Update badge count in real-time
    - _Requirements: 5.1_

  - [x] 5.8 Add translations for notifications


    - Add English translations (notifications.title, notifications.buyerInterest, notifications.markAsRead, etc.)
    - Add Amharic translations
    - Test all notification types with language switching
    - _Requirements: 5.7, All Requirement 5_

---

### PHASE 6: Milk Recording Reminders (6-8 hours)

- [x] 6. Implement milk recording reminders







  - [x] 6.1 Create reminders database table

    - Create table with columns: id, user_id, type ('milk_morning', 'milk_afternoon'), schedule_time (TIME), enabled (boolean), last_triggered_at, created_at
    - Add RLS policies
    - Run migration
    - _Requirements: 6.1, 6.7_


  - [x] 6.2 Create reminder scheduling service

    - Write `scheduleReminder()` function
    - Write `triggerReminder()` function (checks schedule_time)
    - Write `updateReminderSchedule()` function
    - Add time-based logic (morning: 6-8 AM, afternoon: 4-6 PM)
    - _Requirements: 6.1, 6.4_


  - [x] 6.3 Create ReminderSettings component

    - Build settings UI with time pickers
    - Add enable/disable toggle for morning/afternoon
    - Add quiet hours settings (optional)
    - Save to reminders table
    - Include bilingual labels
    - _Requirements: 6.7_


  - [x] 6.4 Implement reminder notification creation

    - Create notification on schedule trigger
    - Include count of animals pending recording
    - Add deep link to RecordMilk page
    - Set priority to 'medium'
    - _Requirements: 6.1, 6.2_

  - [x] 6.5 Add snooze functionality


    - Add snooze button to reminder notification (15 minutes)
    - Reschedule reminder
    - Track snooze count in notification metadata
    - _Requirements: 6.3_

  - [x] 6.6 Implement completion tracking


    - Detect when all milk-producing animals recorded for session
    - Send achievement notification with daily totals
    - Show weekly streak
    - _Requirements: 6.5_

  - [x] 6.7 Add follow-up reminders


    - Send follow-up reminder 2 hours after missed session
    - Show missed recording count
    - Option to record late (mark as late entry)
    - _Requirements: 6.6_

  - [x] 6.8 Update Profile page with reminder settings


    - Add reminder settings section
    - Integrate ReminderSettings component
    - Allow customization of times
    - Save preferences to database
    - _Requirements: 6.7_

  - [x] 6.9 Add translations for reminders


    - Add English translations (reminders.morning, reminders.afternoon, reminders.snooze, etc.)
    - Add Amharic translations
    - Test reminder flows with language switching
    - _Requirements: 6.8, All Requirement 6_

---

### PHASE 7: Market Intelligence Alerts (6-8 hours)

- [x] 7. Implement market intelligence alerts





  - [x] 7.1 Create market alert service


    - Write `detectNewListings()` function (checks for new listings in last 24h)
    - Write `analyzePriceChanges()` function (tracks price trends)
    - Write `findOpportunities()` function (compares user animals with market)
    - Add background job scheduler (runs daily)
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 7.2 Implement location-based alerts


    - Calculate distance to new listings (if location data available)
    - Filter by proximity threshold (default <50km)
    - Create "New listing nearby" notifications
    - Include animal type and price in notification
    - _Requirements: 7.1, 7.2_

  - [x] 7.3 Implement price trend analysis


    - Track average prices by animal type over time
    - Calculate percentage changes (week-over-week)
    - Identify significant trends (>15% change)
    - Create price alert notifications
    - _Requirements: 7.3_

  - [x] 7.4 Implement opportunity detection


    - Compare user's animals with current market listings
    - Suggest listing opportunities based on demand
    - Show competitive pricing recommendations
    - Create opportunity notifications
    - _Requirements: 7.4_

  - [x] 7.5 Create MarketAlertCard component


    - Build card UI for market alerts (extends NotificationCard)
    - Show price data and trends with charts
    - Add action buttons (View Listing, Create Listing)
    - Include bilingual text
    - _Requirements: 7.6_

  - [x] 7.6 Add alert preferences to Profile



    - Allow enabling/disabling alert types (new listings, price changes, opportunities)
    - Set distance threshold slider (10-100km)
    - Set price change threshold (5-30%)
    - Save preferences to user_profiles
    - _Requirements: 7.5_


  - [x] 7.7 Implement alert delivery system

    - Trigger alerts on new listings (respects preferences)
    - Trigger alerts on price changes (respects threshold)
    - Trigger opportunity alerts (weekly)
    - Add offline queue support
    - Set priority to 'medium'
    - _Requirements: 7.1, 7.3, 7.7_

  - [x] 7.8 Add translations for market alerts


    - Add English translations (marketAlerts.newListing, marketAlerts.priceChange, marketAlerts.opportunity, etc.)
    - Add Amharic translations
    - Test all alert types with language switching
    - _Requirements: All Requirement 7_

---

### PHASE 8: Testing & Polish (4-6 hours)

- [x] 8. Comprehensive testing and bug fixes






  - [x] 8.1 Write unit tests for implemented features
    - Pregnancy calculation utilities (COMPLETE - pregnancyCalculations.test.ts)
    - Notification service functions (COMPLETE - notifications.test.ts)
    - Video validation (COMPLETE - videoValidation.test.ts)
    - Milk summary service (COMPLETE - milkSummaryService.test.ts)
    - Edit translations (COMPLETE - edit-translations.test.tsx)
    - _Requirements: Phases 1-5_

  - [x] 8.2 Write e2e tests for edit functionality


    - Add animal editing test to e2e/animal-management.spec.ts (basic edit exists, needs edit history verification)
    - Add listing editing test to e2e/marketplace.spec.ts (basic edit exists, needs comprehensive coverage)
    - Verify edit history tracking in database
    - Test offline edit and sync with queue
    - _Requirements: All Requirement 3_


  - [x] 8.3 Write e2e tests for pregnancy tracking

    - Add pregnancy recording flow test to e2e/animal-management.spec.ts
    - Test delivery alerts display in animal detail page
    - Test birth recording modal and flow
    - Verify pregnancy history display in animal detail
    - Test pregnancy badge on animal cards
    - _Requirements: All Requirement 4_

  - [x] 8.4 Write e2e tests for notifications


    - Add notification page navigation test
    - Test buyer interest notification creation and display
    - Test notification badge updates in real-time
    - Test action buttons (Call, WhatsApp, Mark as Read)
    - Test mark all as read functionality
    - Test notification filtering (All, Unread, Buyer Interests)
    - _Requirements: All Requirement 5_

  - [x] 8.5 Write e2e tests for video upload


    - Add video upload test to e2e/marketplace.spec.ts
    - Test video validation errors (duration, size, format)
    - Test video playback in listing detail page
    - Test thumbnail generation and display
    - Test video upload progress indicator
    - _Requirements: All Requirement 2_

  - [x] 8.6 Write e2e tests for milk enhancements


    - Add milk summary card display test to e2e/milk-recording.spec.ts
    - Test weekly/monthly toggle functionality
    - Test edit milk record flow
    - Test edit confirmation for records >7 days old
    - Verify summary recalculation after edit
    - _Requirements: All Requirement 1_

  - [x] 8.7 Write e2e tests for reminders


    - Add reminder settings test to e2e profile or settings page
    - Test reminder time customization
    - Test enable/disable reminder toggles
    - Verify reminder notification creation (may need to mock time)
    - Test snooze functionality
    - _Requirements: All Requirement 6_

  - [x] 8.8 Test bilingual support for new features


    - Verify milk summary translations display correctly (en.json and am.json)
    - Test edit modal translations (animal and listing)
    - Test pregnancy tracker translations
    - Test notification translations for all types
    - Test reminder translations
    - Verify Amharic text renders properly in all new components
    - _Requirements: All_

  - [x] 8.9 Performance and offline testing for new features


    - Test video upload offline (should queue)
    - Test edit operations offline (should queue)
    - Test pregnancy recording offline (should queue)
    - Test notification creation offline (should queue)
    - Verify offline queue syncs correctly for all new features
    - Test video compression performance on low-end devices
    - Test notification real-time subscription performance
    - _Requirements: All_

  - [x] 8.10 Manual testing and bug fixes


    - Manually test all Phase 1-6 features end-to-end
    - Test milk summary calculations with real data
    - Test video upload with various file sizes and formats
    - Test pregnancy tracking through full lifecycle
    - Test notification delivery and actions
    - Test reminder scheduling and triggering
    - Document any bugs found
    - Prioritize by severity (critical, high, medium, low)
    - Fix all critical and high severity bugs
    - Retest after fixes
    - _Requirements: All_

---

## Notes

### Testing Approach
- Write unit tests for all calculations
- Test offline functionality for all features
- Verify bilingual support throughout
- Test on low-end devices

### Performance Targets
- Video upload: <30 seconds on 3G
- Notification delivery: <2 seconds
- Summary calculations: <500ms
- Edit operations: <2 seconds

### Offline Support
- All features must work offline
- Queue all actions for sync
- Show clear offline indicators
- Never lose user data

### Bilingual Support
- All new text must be translated
- Test language switching
- Verify Amharic text displays correctly
- Use consistent terminology

---

**Total Estimated Time:** 54-70 hours  
**Recommended Execution:** Sequential phases, test after each phase  
**Focus:** Core logic, simple UI, offline-first, bilingual support
