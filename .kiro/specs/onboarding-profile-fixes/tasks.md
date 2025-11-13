# Implementation Plan

- [x] 1. Add missing translation keys





  - Add "common.profile" key to both en.json and am.json
  - Add onboarding-specific translation keys for validation messages
  - Verify no other missing translation keys in console
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create name validation utility





  - [x] 2.1 Create src/utils/nameValidation.ts file


    - Implement validateFullName function
    - Handle both Latin and Amharic scripts
    - Return bilingual error messages
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 2.2 Write unit tests for name validation
    - Test empty name validation
    - Test single word validation (should fail)
    - Test two-word names (should pass)
    - Test Amharic names
    - Test names with short parts
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [x] 3. Update Onboarding component





  - [x] 3.1 Disable auto-correct on name input field


    - Add autoComplete="off" attribute
    - Add autoCorrect="off" attribute
    - Add spellCheck="false" attribute
    - Add data-form-type="other" attribute
    - _Requirements: 3.1, 3.2, 3.3_

  - [x] 3.2 Implement real-time name validation

    - Add validation state (nameError, touched)
    - Add handleNameChange with validation
    - Add handleNameBlur to trigger validation
    - Display inline error messages
    - _Requirements: 4.1, 4.2, 4.5, 5.2_

  - [x] 3.3 Update submit handler with validation

    - Validate name before submission
    - Show bilingual error toast on validation failure
    - Prevent submission if validation fails
    - _Requirements: 4.1, 4.2, 4.3, 5.1_

  - [x] 3.4 Improve error handling in submit

    - Detect network errors specifically
    - Show retry button for network errors
    - Show bilingual error messages
    - _Requirements: 5.1, 5.3, 5.4_

- [x] 4. Fix profile fetch 406 error





  - [x] 4.1 Update useProfile hook error handling


    - Add specific handling for 406 errors
    - Add retry logic with exponential backoff
    - Improve error logging
    - _Requirements: 2.2, 2.3_


  - [x] 4.2 Update ProtectedRoute error display

    - Show user-friendly error UI when profile fetch fails
    - Add retry button that calls refetch()
    - Display bilingual error messages
    - _Requirements: 2.3, 5.1_

  - [x] 4.3 Verify database schema and RLS policies


    - Check that profiles table exists
    - Verify RLS policies allow authenticated users to read/write their own profile
    - Document any missing policies
    - _Requirements: 2.1, 2.2_

- [x] 5. Update farm name input (optional field)




  - Add same auto-correct disable attributes as name field
  - Ensure it remains optional (no validation)
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 6. Add integration tests






  - Test onboarding component with validation
  - Test profile fetch error handling
  - Test retry functionality
  - _Requirements: 2.3, 4.1, 4.2, 5.1, 5.2, 5.3_

- [ ]* 7. Add E2E tests
  - Test complete onboarding flow with valid name
  - Test onboarding with invalid name (single word)
  - Test profile loads after onboarding
  - Verify no 406 errors in console
  - Verify no translation errors in console
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 4.1, 4.2_

- [x] 8. Manual testing and verification







  - Test with Amharic keyboard input
  - Test with Latin keyboard input
  - Verify auto-correct is disabled (no suggestions on misspelled words)
  - Test on mobile devices (iOS Safari, Android Chrome)
  - Test with slow network connection
  - Verify all console errors are resolved
  - _Requirements: 1.3, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 5.1, 5.2, 5.3, 5.4_
