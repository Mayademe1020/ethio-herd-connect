# Profile Page Enhancements - Implementation Plan

- [x] 1. Add translation keys for profile enhancements





  - Add new keys to src/i18n/en.json
  - Add new keys to src/i18n/am.json
  - Verify no missing keys in console
  - _Requirements: All_

- [x] 2. Create useFarmStats hook






  - [x] 2.1 Create src/hooks/useFarmStats.tsx

    - Implement query to count total animals
    - Implement query to sum milk last 30 days
    - Implement query to count active listings
    - Return FarmStats interface
    - Add loading and error states
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 3. Create FarmStatsCard component






  - [x] 3.1 Create src/components/FarmStatsCard.tsx

    - Display 3-column grid with statistics
    - Show animal count with icon
    - Show milk total with icon
    - Show listing count with icon
    - Add skeleton loader for loading state
    - Handle zero values gracefully
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 4. Create QuickActionsSection component






  - [x] 4.1 Create src/components/QuickActionsSection.tsx

    - Display 3 action buttons in grid
    - Add icons for each action
    - Implement navigation on click
    - Check if animals exist before milk/listing actions
    - Show toast if no animals when required
    - Add bilingual labels
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_
-

- [x] 5. Create EditProfileModal component





  - [x] 5.1 Create src/components/EditProfileModal.tsx

    - Create modal with dialog component
    - Add farmer name input with validation
    - Add farm name input (optional)
    - Implement save functionality
    - Show validation errors inline
    - Add loading state during save
    - Add success/error toasts
    - Disable auto-correct on inputs
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

- [x] 6. Create LogoutConfirmDialog component





  - [x] 6.1 Create src/components/LogoutConfirmDialog.tsx


    - Create alert dialog component
    - Add bilingual confirmation message
    - Add cancel and confirm buttons
    - Style confirm button as destructive
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 7. Update Profile page with real data








  - [x] 7.1 Update src/pages/Profile.tsx - Replace placeholder data


    - Remove hardcoded name/email/phone/address/birthdate
    - Use useProfile hook to fetch real data
    - Display farmer_name from profile
    - Display farm_name if exists
    - Display phone from profile
    - Add skeleton loaders for loading state
    - Add error state with retry button
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 7.2 Update src/pages/Profile.tsx - Add new components


    - Import and add FarmStatsCard component
    - Import and add QuickActionsSection component
    - Import and add EditProfileModal component
    - Import and add LogoutConfirmDialog component
    - Wire up edit button to open modal
    - Wire up logout button to show confirmation
    - _Requirements: 2.1, 3.1, 4.1, 6.1_

  - [x] 7.3 Update src/pages/Profile.tsx - Simplify settings


    - Remove dark mode toggle
    - Remove sound toggle
    - Remove font size selector
    - Remove accessibility options
    - Remove developer options
    - Keep only: language, calendar, notifications
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 7.4 Update src/pages/Profile.tsx - Remove unnecessary sections


    - Remove email field display
    - Remove address field display
    - Remove birthdate field display
    - Remove security settings card
    - Remove social profiles section
    - Remove display settings section
    - Keep: name, phone, farm name, statistics, actions, settings, analytics, help, logout
    - _Requirements: 7.1, 7.2_

- [x] 8. Add profile update mutation



  - [x] 8.1 Update src/hooks/useProfile.tsx


    - Add updateProfile mutation function
    - Validate farmer_name before update
    - Update profiles table via Supabase
    - Invalidate profile query on success
    - Handle errors with user-friendly messages
    - _Requirements: 4.5, 4.6, 4.7_

- [x] 9. Add offline support




  - [x] 9.1 Update src/hooks/useProfile.tsx - Add caching


    - Set staleTime to 5 minutes for profile query
    - Set cacheTime to 24 hours
    - Enable offline mode with cached data
    - _Requirements: 8.1, 8.2_

  - [x] 9.2 Update src/components/EditProfileModal.tsx - Offline handling


    - Detect offline state
    - Disable save button when offline
    - Show message that editing requires internet
    - _Requirements: 8.3_

  - [x] 9.3 Update src/hooks/useFarmStats.tsx - Add caching


    - Set staleTime to 5 minutes for stats query
    - Set cacheTime to 1 hour
    - Show stale indicator if data > 24 hours old
    - _Requirements: 8.4, 8.5_

- [x] 10. Add logout functionality







  - [x] 10.1 Update src/pages/Profile.tsx - Implement logout

    - Add logout confirmation state
    - Show LogoutConfirmDialog on logout click
    - Call Supabase signOut on confirm
    - Clear local storage on logout
    - Redirect to /login on success
    - Show error toast if logout fails
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 11. Add integration tests
  - Test profile loads with real data
  - Test farm statistics display correctly
  - Test quick actions navigate correctly
  - Test edit profile modal saves changes
  - Test logout confirmation works
  - Test offline behavior
  - _Requirements: All_

- [ ]* 12. Add E2E tests
  - Test complete profile flow (view → edit → save)
  - Test quick actions navigation
  - Test logout flow
  - Test offline profile viewing
  - _Requirements: All_

- [x] 13. Manual testing





  - [x] 13.1 Test with real user data

    - Login with existing account
    - Verify name and farm name display correctly
    - Verify phone number displays correctly
    - Verify statistics show correct counts
    - _Requirements: 1.1, 1.2, 1.3, 2.1_


  - [x] 13.2 Test edit profile

    - Click edit button
    - Change farmer name
    - Change farm name
    - Save and verify updates
    - Test validation with single word name
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 13.3 Test quick actions

    - Click "Register Animal" → verify navigation
    - Click "Record Milk" with no animals → verify toast
    - Register an animal
    - Click "Record Milk" with animals → verify navigation
    - Click "Create Listing" → verify navigation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_



  - [ ] 13.4 Test logout
    - Click logout button
    - Verify confirmation dialog appears
    - Click cancel → verify stays on page
    - Click logout again → confirm → verify redirects to login
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_



  - [ ] 13.5 Test offline behavior
    - Load profile while online
    - Turn off internet
    - Refresh page → verify cached data shows
    - Try to edit → verify disabled with message
    - Turn on internet → verify data refreshes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 13.6 Test on mobile devices

    - Test on iOS Safari
    - Test on Android Chrome
    - Verify touch targets are 44px+
    - Verify scrolling works smoothly
    - Verify modals display correctly
    - _Requirements: All_

