# Implementation Plan: 5-Day Exhibition MVP Sprint

## Overview

This implementation plan transforms the Ethiopian Livestock Management System into a focused, working MVP in 5 days. Each task builds incrementally, with testing at every step. The plan prioritizes working features over comprehensive features.

## Task List

- [ ] 1. Codebase Cleanup & Foundation (Day 1)





  - Remove non-MVP features and dependencies
  - Simplify authentication to Ethiopia-only
  - Clean up database schema
  - _Requirements: 2.1, 2.3, 10.2_

- [x] 1.1 Delete non-essential feature folders


  - Remove `src/components/analytics`, `src/components/growth`, `src/components/vaccination`, `src/components/health`, `src/components/poultry`, `src/components/farm-assistants`
  - Remove corresponding page files: `Analytics*.tsx`, `GrowthTracking*.tsx`, `VaccinationSchedule*.tsx`, `HealthRecords*.tsx`, `PoultryManagement*.tsx`, `FarmAssistants*.tsx`
  - Remove unused hook files: `useGrowthRecords.tsx`, `useVaccinationSchedule.tsx`, `usePaginatedHealthRecords.tsx`, `usePoultryGroups.tsx`, `useFarmAssistants.tsx`, `useDashboardStats.tsx`
  - _Requirements: 10.2_

- [x] 1.2 Remove multi-country support


  - Delete `src/utils/countries.ts` and `src/contexts/CountryContext.tsx`
  - Update `OtpAuthForm.tsx` to hardcode +251 (Ethiopia) country code
  - Remove country selector UI components
  - Update phone validation to Ethiopian format only (9 digits starting with 9)
  - _Requirements: 2.1_

- [x] 1.3 Simplify App.tsx routing


  - Remove routes for deleted features (analytics, growth, vaccination, health, poultry, farm-assistants)
  - Keep only: Login, SimpleHome, RegisterAnimal, RecordMilk, MyAnimals, AnimalDetail, MarketplaceBrowse, CreateListing, MyListings, ListingDetail, Profile
  - Update navigation components to remove deleted feature links
  - _Requirements: 2.3_

- [x] 1.4 Clean up database schema in Supabase


  - Drop tables: `growth_records`, `health_records`, `health_submissions`, `vaccination_schedules`, `farm_assistants`, `farm_profiles`, `poultry_groups`
  - Remove columns from `animals` table: `breed`, `birth_date`, `weight`, `height`, `health_status`, `parent_id`, `color`, `notes`, `estimated_value`, `acquisition_date`, `gender`
  - Remove columns from `milk_production` table: `quality`, `fat_content`, `morning_amount`, `evening_amount`
  - Rename `milk_production.amount` to `milk_production.liters`
  - Create simplified `market_listings` table with only essential fields
  - Create `buyer_interests` table for marketplace connections
  - Add indexes for performance
  - _Requirements: 2.2, 10.1_

- [x] 1.5 Update RLS policies for simplified schema


  - Create policy: Users can view own animals
  - Create policy: Users can insert own animals
  - Create policy: Anyone can view active marketplace listings
  - Create policy: Users can update own listings
  - Create policy: Buyers can create interests
  - Create policy: Users can view own interests
  - _Requirements: 6.1_
-

- [x] 2. Authentication System (Day 1 Evening)










  - Implement phone-only authentication for Ethiopian farmers
  - Create persistent session management
  - _Requirements: 2.1, 11.1_





- [x] 2.1 Create simplified OtpAuthForm component


  - Build phone input with hardcoded +251 prefix
  - Implement OTP request flow with Supabase auth
  - Implement OTP verification flow
  - Add user-friendly error messages in Amharic and English
  - Style with large touch targets (min 44x44px)
  - _Requirements: 2.1, 10.1_

- [x] 2.2 Implement AuthContext with persistent sessions


  - Create context for authentication state management
  - Implement non expiry session persistence
  - Add loading states for auth checks
  - Create ProtectedRoute wrapper component
  - _Requirements: 2.1_

- [x] 2.3 Create Login page


  - Build login page using OtpAuthForm component
  - Add Ethiopian flag and welcoming Amharic text
  - Implement redirect to home after successful login
  - Test on mobile viewport
  - _Requirements: 2.1, 11.1_


- [x] 2.4 Test authentication flow end-to-end




  - Test phone number input validation
  - Test OTP sending (verify SMS received)
  - Test OTP verification
  - Test session persistence (close and reopen app)
  - Test logout functionality
  - _Requirements: 2.1_

- [x] 3. Home Dashboard (Day 2 Morning)





  - Create farmer-friendly home screen with quick actions
  - Implement sync status indicator
  - _Requirements: 10.1, 10.3_

- [x] 3.1 Create SimpleHome page component


  - Build welcome header with user greeting
  - Add sync status indicator (online/offline, pending items)
  - Create 4 large quick action buttons: Record Milk, Add Animal, My Animals, Marketplace
  - Use icons and minimal text
  - Implement responsive grid layout
  - _Requirements: 10.1_


- [x] 3.2 Add today's tasks widget

  - Display max 3 urgent items (vaccinations due, pregnancy checks, etc.)
  - Show empty state when no tasks
  - Make tasks tappable to navigate to relevant page
  - _Requirements: 10.1_


- [x] 3.3 Add quick stats widget

  - Display total animals count
  - Display milk recorded this week
  - Use large numbers with icons
  - _Requirements: 10.1_

- [x] 3.4 Test home dashboard


  - Verify all buttons navigate correctly
  - Test sync status updates when going offline/online
  - Test on mobile device
  - Verify Amharic labels display correctly
  - _Requirements: 10.1_

- [x] 4. Animal Registration (Day 2)







  - Implement 3-click animal registration flow
  - Create visual animal type selection

  - _Requirements: 1.1, 10.1, 10.3_


- [x] 4.1 Create AnimalTypeSelector component

  - Build visual grid with large cards for Cattle 🐄, Goat 🐐, Sheep 🐑
  - Add icons and bilingual labels (Amharic + English)
  - Implement selection state with visual feedback
  - _Requirements: 10.1_


- [x] 4.2 Create AnimalSubtypeSelector component

  - Build dynamic subtype selector based on type (Cow/Bull/Ox/Calf for cattle, Male/Female for goats/sheep)
  - Use visual cards with icons
  - Add bilingual labels
  - _Requirements: 10.1_

- [x] 4.3 Create RegisterAnimal page


  - Implement 3-step flow: Type → Subtype → Name
   - name is optional (can skip)
  - Add progress indicator (Step 1 of 3, Step 2 of 3, Step 3 of 3)
  - Create name input with Amharic keyboard support
  - Add optional photo upload (can skip)
  - Implement optimistic UI update
  - Add to offline queue if no connection
  - Show success message and navigate to animal detail
  - _Requirements: 1.1, 10.1, 10.3_

- [x] 4.4 Create useAnimalRegistration hook


  - Implement registration logic with Supabase
  - Add offline queue support
  - Implement optimistic UI updates
  - Add error handling with user-friendly messages
  - _Requirements: 1.1, 6.1_

- [x] 4.5 Test animal registration flow


  - Register cattle (all subtypes: Cow, Bull, Ox, Calf)
  - Register goat (Male, Female)
  - Register sheep (Ram, Ewe)
  - Test with photo upload
  - Test without photo (skip)
  - Test offline registration
  - Verify data appears in Supabase
  - _Requirements: 1.1, 10.1_

- [x] 5. Animal List & Detail Views (Day 2 Evening)





  - Create visual animal list with cards
  - Implement animal detail page

  - _Requirements: 1.1, 10.1_

- [x] 5.1 Create AnimalCard component

  - Build card with photo, name, type icon, and status
  - Add quick action buttons (Record Milk for cows,Record pregnancy for cows, View Details)
  - Show key info (registration date, health status)
  - Use color coding for status (green = healthy, yellow = attention needed)
  - _Requirements: 10.1_


- [x] 5.2 Create MyAnimals page

  - Fetch and display user's animals using TanStack Query
  - Render animals as grid of AnimalCard components
  - Add floating action button for "Add Animal"
  - Implement pull-to-refresh
  - Show empty state with call-to-action when no animals
  - Add filter by type (All, Cattle, Goats, Sheep)
  - _Requirements: 1.1, 10.1_

- [x] 5.3 Create AnimalDetail page


  - Display animal photo, name, type, subtype
  - Show registration date and age
  - Add action buttons: Record Milk (if cow), Edit, 
  Delete, List for Sale
    - Add action buttons: Record pregnancy (if cow)(if female goat)(if femal sheep), Edit, 
  Delete, List for Sale
  - Display recent milk records (if cow)(if female goat)(if femal sheep)
  - Display recent pregnancy records (if cow)(if female goat)(if femal sheep)
  - Show placeholder for future features (health, growth)
  - _Requirements: 1.1_

- [x] 5.4 Implement animal deletion


  - Add delete confirmation dialog with Amharic text
  - Soft delete (set is_active = false) instead of hard delete
  - Update UI optimistically
  - Add to offline queue if no connection
  - _Requirements: 1.1_


- [x] 5.5 Test animal list and detail views

  - Verify animals display correctly
  - Test filter by type
  - Test navigation to detail page
  - Test delete functionality
  - Test offline behavior
  - _Requirements: 1.1, 10.1_

- [x] 6. Milk Recording (Day 3 Morning)





  - Implement 2-click milk recording flow
  - Create quick amount buttons
  - _Requirements: 1.1, 10.1, 10.3_

- [x] 6.1 Create MilkAmountSelector component


  - Build quick amount buttons (2L, 3L, 5L, 7L, 10L)
  - Add custom amount input field
  - Implement visual feedback on selection
  - Add bilingual labels
  - _Requirements: 10.1_

- [x] 6.2 Create RecordMilk page


  - Display list of cows only (filter animals by subtype = 'Cow')
  - Show cow cards with photos and names
  - Implement cow selection
  - Show MilkAmountSelector after cow selected
  - Auto-detect session (morning if before 12pm, evening after)
  - Implement optimistic UI update
  - Add to offline queue if no connection
  - Show success toast and return to home
  - _Requirements: 1.1, 10.1, 10.3_

- [x] 6.3 Create useMilkRecording hook


  - Implement milk recording logic with Supabase
  - Add offline queue support
  - Implement optimistic UI updates
  - Add error handling with user-friendly messages
  - Auto-fill recorded_at and session fields
  - _Requirements: 1.1, 6.1_

- [x] 6.4 Add milk history to AnimalDetail page


  - Display recent milk records (last 7 days)
  - Show daily total and weekly total
  - Add simple line chart showing trend
  - Use visual indicators (↑ increasing, ↓ decreasing, → stable)
  - _Requirements: 1.1_

- [x] 6.5 Test milk recording flow


  - Record milk for multiple cows
  - Test quick amount buttons
  - Test custom amount input
  - Test morning vs evening session detection
  - Test offline recording
  - Verify data appears in Supabase
  - Verify totals calculate correctly
  - _Requirements: 1.1, 10.1_

7. Marketplace - Create Listing (Day 3 Afternoon)
- Implement 3-click listing creation
- Add photo upload with compression
- Add video upload with validation (≤10 seconds, ≤20MB)
- Add female animal specific attributes
 - Add disclaimer for animal health information
- _Requirements: 5.1, 5.2, 10.1, 10.3_

- [ ] 7.1 Create CreateListing page
Display user's animals (exclude already listed animals)
-Implement animal selection with gender identification
Create price input with Ethiopian Birr (ETB) label
Add "Negotiable" toggle switch
Add photo upload with preview (optional but encouraged)
Add video upload with preview (optional but recommended)
Add female animal specific fields (pregnancy status, lactation info)
Add capacity/production details for relevant animals
Add health disclaimer checkbox
Auto-fill location and contact phone from user profile
Implement optimistic UI update
Add to offline queue if no connection
Show success message and navigate to marketplace
_Requirements: 5.1, 10.1,_

 10.3
7.2 Implement photo upload with compression
Add photo picker with camera and gallery options
Compress images to <500KB before upload
Show upload progress indicator
Handle upload errors gracefully
Store photo URL in listing
-_Requirements: 5.2_
7.3 Implement video upload with validation
Add video picker with camera and gallery options
Validate video duration (≤10 seconds)
Validate video file size (≤20MB)
Generate video preview
Show upload progress indicator
Handle upload errors gracefully
Store video URL in listing
-_Requirements: 5.2_
7.4 Create useMarketplaceListing hook
Implement listing creation logic with Supabase
Add offline queue support
Implement optimistic UI updates
Add error handling with user-friendly messages
Auto-fill location and contact_phone
Handle female animal specific attributes
-_Requirements: 5.1, 6.1_
7.5 Create MyListings page
Fetch and display user's active listings
Show listing cards with photo/video indicator, animal name, price, views count
Display female animal specific attributes when applicable
Add action buttons: View Interests, Mark as Sold, Cancel Listing
Show empty state when no listings
- _Requirements: 5.1_

7.6 Test listing creation flow
Create listing with photo
Create listing with video
Create listing with both photo and video
Create listing for female animal with pregnancy/lactation info
Test price input validation
Test negotiable toggle
Test offline listing creation
Verify listing appears in marketplace
Verify listing appears in MyListings
Verify female animal attributes display correctly
-_Requirements: 5.1, 10.1_


- [x] 8. Marketplace - Browse & Contact (Day 3 Evening)





  - Implement marketplace browsing with filters
  - Create buyer interest system
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [x] 8.1 Create ListingCard component


  - Build card with photo, animal type icon, price, location
  - Show "Negotiable" badge if applicable
  - Display seller badges (if any)
  - Add views count
  - Show "NEW" badge for listings <48 hours old
  - _Requirements: 5.1_

- [x] 8.2 Create MarketplaceBrowse page


  - Fetch and display all active listings
  - Implement filter by animal type (All, Cattle, Goats, Sheep)
  - Add sort options (Newest, Lowest Price, Highest Price)
  - Implement infinite scroll pagination
  - Show empty state when no listings match filters
  - Increment views_count when listing is viewed
  - _Requirements: 5.1, 5.5_

- [x] 8.3 Create ListingDetail page


  - Display full listing details (photo, animal info, price, location, seller contact)
  - Show seller information (phone number, badges)
  - Add "Express Interest" button for buyers
  - Show "Your Listing" banner if user is the seller
  - Display number of interested buyers (if seller)
  - _Requirements: 5.1, 5.3_

- [x] 8.4 Implement buyer interest system


  - Create interest submission form (optional message)
  - Store buyer interest in buyer_interests table
  - Send notification to seller (in-app)
  - Show buyer's phone number to seller
  - Allow seller to mark interest as "contacted" or "closed"
  - _Requirements: 5.3_

- [x] 8.5 Create InterestsList component for sellers


  - Display interests on seller's listings
  - Show buyer phone number and message
  - Add "Call" button (opens phone dialer)
  - Add "Mark as Contacted" button
  - Show timestamp of interest
  - _Requirements: 5.3_

- [x] 8.6 Test marketplace browsing and contact flow


  - Browse listings as buyer
  - Test filters (type, sort)
  - View listing details
  - Express interest with message
  - View interests as seller
  - Test call button
  - Mark interest as contacted
  - Verify views count increments
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [x] 9. Offline Queue & Sync (Day 4 Morning)





  - Implement robust offline queue system
  - Create sync status indicator
  - _Requirements: 6.1, 6.2_

- [x] 9.1 Create offline queue management system


  - Implement queue storage in IndexedDB
  - Create queue processor with exponential backoff retry
  - Add action types: animal_registration, milk_record, listing_creation, buyer_interest
  - Implement retry logic (max 5 attempts: 1s, 2s, 4s, 8s, 16s)
  - Remove from queue after successful sync
  - _Requirements: 6.1_

- [x] 9.2 Create SyncStatusIndicator component


  - Show online/offline status with icon
  - Display pending items count when offline
  - Add "Sync Now" button for manual sync
  - Show sync progress during sync
  - Display last sync timestamp
  - _Requirements: 6.1_

- [x] 9.3 Integrate offline queue with all features


  - Update useAnimalRegistration to use queue
  - Update useMilkRecording to use queue
  - Update useMarketplaceListing to use queue
  - Update buyer interest submission to use queue
  - _Requirements: 6.1_


- [x] 9.4 Implement background sync

  - Add service worker for background sync
  - Register sync event when connection restored
  - Process queue automatically when online
  - Show toast notifications for sync results
  - _Requirements: 6.1_


- [x] 9.5 Test offline functionality

  - Turn on airplane mode
  - Register animal offline
  - Record milk offline
  - Create listing offline
  - Express interest offline
  - Turn off airplane mode
  - Verify all actions sync automatically
  - Test manual sync button
  - Test retry logic with failed syncs
  - _Requirements: 6.1, 6.2_

- [x] 10. Error Handling & User Feedback (Day 4 Afternoon)





  - Implement user-friendly error messages
  - Create toast notification system
  - _Requirements: 3.4, 11.2_

- [x] 10.1 Create error message translation system


  - Define error messages in Amharic and English
  - Map technical errors to user-friendly messages
  - Add contextual icons for each error type
  - Include recovery actions for each error
  - _Requirements: 3.4, 11.2_

- [x] 10.2 Create Toast component


  - Build toast notification with Amharic support
  - Implement success, error, warning, info variants
  - Add auto-dismiss after 3 seconds
  - Allow manual dismiss
  - Stack multiple toasts
  - _Requirements: 3.4_

- [x] 10.3 Integrate error handling across all features


  - Replace technical error messages with user-friendly ones
  - Add toast notifications for all user actions
  - Show loading states during async operations
  - Add retry buttons for failed operations
  - _Requirements: 3.4_


- [x] 10.4 Test error scenarios

  - Test network errors (offline)
  - Test authentication errors (expired session)
  - Test validation errors (invalid input)
  - Test photo upload errors (file too large)
  - Verify all errors show Amharic messages
  - Verify recovery actions work
  - _Requirements: 3.4, 11.2_

- [x] 11. Amharic Localization (Day 4 Evening)





  - Complete Amharic translations for all UI text
  - Implement language switching
  - _Requirements: 3.5, 11.1, 11.2_

- [x] 11.1 Create translation files


  - Create en.json with all English strings
  - Create am.json with all Amharic translations
  - Organize by feature (auth, animals, milk, marketplace, common)
  - _Requirements: 11.2_

- [x] 11.2 Implement LanguageContext


  - Create context for language state management
  - Implement language switching function
  - Persist language preference in localStorage
  - Default to Amharic for Ethiopian users
  - _Requirements: 11.1_

- [x] 11.3 Create useTranslation hook


  - Implement translation lookup function
  - Add fallback to English if Amharic missing
  - Support interpolation for dynamic values
  - _Requirements: 11.2_

- [x] 11.4 Update all components with translations


  - Replace hardcoded strings with translation keys
  - Update button labels, form labels, error messages
  - Update navigation labels
  - Update empty states and placeholders
  - _Requirements: 11.2_

- [x] 11.5 Add language switcher to Profile page


  - Create toggle for Amharic/English
  - Show current language with flag icons
  - Update UI immediately on language change
  - _Requirements: 11.1_

- [x] 11.6 Test Amharic localization



  - Switch to Amharic and verify all text displays correctly
  - Test all pages in Amharic
  - Test error messages in Amharic
  - Test form validation messages in Amharic
  - Verify Amharic text doesn't break layouts
  - _Requirements: 11.2_

- [x] 12. Performance Optimization (Day 5 Morning)





  - Optimize bundle size and load times
  - Implement lazy loading
  - _Requirements: 6.1, 6.5_

- [x] 12.1 Implement code splitting


  - Lazy load marketplace pages
  - Lazy load animal detail page
  - Lazy load profile page
  - Add loading fallbacks for lazy routes
  - _Requirements: 6.1_

- [x] 12.2 Optimize images


  - Implement lazy loading for animal photos
  - Add blur placeholder for images
  - Compress uploaded photos to <500KB
  - Use WebP format where supported
  - _Requirements: 6.1_

- [x] 12.3 Optimize database queries


  - Add indexes for frequently queried fields
  - Implement pagination for animal list (20 per page)
  - Implement pagination for milk records (50 per page)
  - Implement pagination for marketplace listings (20 per page)
  - Use select() to fetch only needed columns
  - _Requirements: 6.1_

- [x] 12.4 Measure and optimize bundle size


  - Run build and check bundle size
  - Remove unused dependencies
  - Tree-shake unused code
  - Target <450KB gzipped
  - _Requirements: 6.5_

- [x] 12.5 Test performance


  - Run Lighthouse audit (target: 92/100)
  - Test on 3G network simulation
  - Test on old Android device (Android 8, 2GB RAM)
  - Measure page load times (<3 seconds)
  - Measure time to interactive (<5 seconds)
  - _Requirements: 6.1, 6.5_

- [-] 13. Final Testing & Bug Fixes (Day 5 Afternoon)






  - Comprehensive end-to-end testing
  - Fix critical bugs
  - _Requirements: All_


- [x] 13.1 Complete authentication testing

  - Test phone number input validation
  - Test OTP sending and verification
  - Test session persistence
  - Test logout and re-login
  - _Requirements: 2.1_

- [x] 13.2 Complete animal management testing


  - Test registering all animal types and subtypes
  - Test viewing animal list
  - Test viewing animal details
  - Test deleting animals
  - Test with and without photos
  - _Requirements: 1.1, 10.1_

- [x] 13.3 Complete milk recording testing






  - Test recording milk for multiple cows
  - Test quick amount buttons and custom input
  - Test morning/evening session detection
  - Test viewing milk history
  - Test weekly totals calculation
  - _Requirements: 1.1, 10.1_

- [x] 13.4 Complete marketplace testing



  - Test creating listings with and without photos
  - Test browsing and filtering listings
  - Test viewing listing details
  - Test expressing interest as buyer
  - Test viewing interests as seller
  - Test marking listings as sold
  - _Requirements: 5.1, 5.3, 5.4, 5.5_



- [x] 13.5 Complete offline testing




  - Test all features in airplane mode
  - Test sync when connection restored
  - Test manual sync button
  - Test retry logic for failed syncs
  - Test sync status indicator
  - _Requirements: 6.1, 6.2_

- [x] 13.6 Complete localization testing







  - Test all pages in Amharic
  - Test language switching
  - Test error messages in both languages
  - Verify no layout breaks with Amharic text
  - _Requirements: 11.2_

- [x] 13.7 Device and network testing




  - Test on old Android device (Android 8, 2GB RAM)
  - Test on mid-range Android device
  - Test on 2G network simulation
  - Test on 3G network simulation
  - Test in low battery mode
  - _Requirements: 6.1, 6.2_
-

- [ ] 13.8 Fix critical bugs



  - Document all bugs found during testing
  - Prioritize by severity (critical, high, medium, low)
  - Fix all critical bugs
  - Fix high priority bugs if time permits
  - Create backlog for medium/low priority bugs
  - _Requirements: All_

- [ ] 14. Deployment & Exhibition Prep (Day 5 Evening)
  - Deploy to production
  - Prepare exhibition materials
  - _Requirements: All_

- [ ] 14.1 Deploy to production
  - Build production bundle
  - Deploy to Vercel/Netlify
  - Configure custom domain (if available)
  - Test production URL on mobile device
  - Verify all features work in production
  - _Requirements: 6.3_

- [ ] 14.2 Create QR code for exhibition
  - Generate QR code linking to production URL
  - Print QR code poster for booth
  - Test QR code scanning with multiple devices
  - _Requirements: 9.1_

- [ ] 14.3 Prepare demo script
  - Write step-by-step demo flow (2-3 minutes)
  - Practice demo on mobile device
  - Prepare talking points about features
  - Prepare answers to common questions
  - _Requirements: 9.1_

- [ ] 14.4 Prepare backup plan
  - Download offline-capable PWA version
  - Prepare demo video (if internet fails at venue)
  - Have screenshots of key features
  - Test app works without venue internet
  - _Requirements: 9.1_

- [ ] 14.5 Share with test users
  - Send production URL to 2-3 test users
  - Ask them to try registering and using app
  - Gather immediate feedback
  - Fix any critical issues reported
  - _Requirements: 9.1_

- [ ] 15. Post-Exhibition Follow-up (After Exhibition)
  - Gather user feedback
  - Analyze usage data
  - Plan next iteration
  - _Requirements: 9.2, 9.3_

- [ ] 15.1 Collect user feedback at exhibition
  - Note common questions and confusion points
  - Record feature requests
  - Document bugs reported by users
  - Count how many farmers tried each feature
  - _Requirements: 9.1_

- [ ] 15.2 Analyze usage data
  - Check how many users registered
  - Check how many animals were registered
  - Check how many milk records were created
  - Check how many marketplace listings were created
  - Identify most and least used features
  - _Requirements: 9.2_

- [ ] 15.3 Create post-exhibition roadmap
  - Prioritize top 3 requested features
  - Plan bug fixes based on severity
  - Schedule next release (Week 2)
  - Define success metrics for Month 1
  - _Requirements: 9.2, 9.3_

## Notes

- Each task should be completed and tested before moving to the next
- If a task is blocked, document the blocker and move to the next task
- Test on actual mobile devices frequently, not just browser DevTools
- Prioritize working features over perfect code
- Keep commits small and descriptive for easy rollback
- Deploy early and often to catch production issues
- Focus on the 3-click philosophy: every action should be fast and simple
- Remember: Better to have 5 features that work perfectly than 20 that are broken

## Success Criteria

By end of Day 5, the app must:
- ✅ Allow farmers to register with phone number (Ethiopia +251)
- ✅ Allow farmers to register animals in 3 clicks
- ✅ Allow farmers to record milk in 2 clicks
- ✅ Allow farmers to list animals for sale in 3 clicks
- ✅ Allow buyers to browse and express interest
- ✅ Work offline and sync when online
- ✅ Display all text in Amharic and English
- ✅ Load in <3 seconds on 3G
- ✅ Work on old Android devices (Android 8+)
- ✅ Have no critical bugs


---

## 🔮 FUTURE ENHANCEMENTS (Post-MVP)

### Phase 2: Smart Feed Personalization & Engagement
**Goal:** Turn onboarding data into GMV by personalizing the marketplace feed

**Context:** We collect phone, species, and herd-size during onboarding but don't use it to personalize the experience. This phase will make the feed algorithm smart.

**Key Features to Build:**
- [ ] Feed algorithm: Match listings by species + herd-size ± 1 bucket + location radius
- [ ] Pre-fill posting form: Auto-select species chip, set count slider to bucket midpoint, use farm name
- [ ] "I'm buying" toggle: Convert feed to buy-alert list with push notifications
- [ ] Ethiopian calendar widget: For pickup dates (use `ethiopian_date` library)
- [ ] Analytics event: `feed_personalized` - fires when first 5 cards match user profile
- [ ] Settings: Editable radius (default 50km to save data)

**Success Metric:** ≥80% of sessions show personalized feed within 3 seconds

**Micro-tasks for Junior Devs:**
1. Wire onboarding answers to feed query (species, herd-size, radius)
2. Implement Firestore query with matching logic
3. Pre-fill "Post a lot" screen with user defaults
4. Add "I'm buying" toggle on home top-bar
5. Integrate Ethiopian calendar for dates
6. Add analytics tag for feed personalization

**What NOT to Add:**
- ❌ Crop/mixed-farming branches (GMV zero)
- ❌ OTP/email changes (still banned)
- ❌ Weight typing (stick to 5-kg picker)
- ❌ Chat attachments (4× data cost)

**Rule of Thumb:** "Does this PR make the first 5 cards closer to '7 Borana bulls, 320-350 kg, 20 km away'? If yes, ship. If no, revert."

**Status:** 📋 Planned - Create dedicated spec when ready to implement

---
