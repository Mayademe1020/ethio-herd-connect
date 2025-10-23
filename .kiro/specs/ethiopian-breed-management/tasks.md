# Implementation Plan

- [x] 1. Create breed data infrastructure


  - Create `src/data/ethiopianBreeds.ts` with comprehensive Ethiopian breed database including cattle (Boran, Horro, Fogera, Arsi, Danakil, Begait, Sheko), sheep (Menz, Horro, Bonga, Arsi-Bale, Blackhead Somali, Afar), goat (Woyto-Guji, Afar, Abergelle, Keffa, Long-eared Somali), and poultry breeds
  - Define TypeScript interfaces for `BreedInfo`, `AnimalType`, and `BreedRegistry`
  - Include English and Amharic names for each breed
  - Add optional breed characteristics (size, color, distinguishing features)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 5.1, 5.2_



- [ ] 2. Implement breed registry service
  - Create `src/utils/breedRegistry.ts` with `BreedRegistryService` class
  - Implement `getBreedsByAnimalType()` method to retrieve breeds filtered by animal type and formatted for UI display
  - Implement `searchBreeds()` method with case-insensitive search across English and Amharic names
  - Implement `getBreedInfo()` method to retrieve detailed breed information by ID


  - Implement `isValidBreed()` method to validate breed-animal type combinations
  - _Requirements: 1.1, 3.1, 3.2, 6.1, 6.2, 6.3_

- [ ] 3. Update database schema for custom breeds
  - Create migration file `supabase/migrations/[timestamp]_add_custom_breed_support.sql`


  - Add `breed_custom` TEXT column to animals table for user-provided breed descriptions
  - Add `is_custom_breed` BOOLEAN column with default FALSE
  - Create indexes on `breed` and composite index on `(type, breed)` for query performance
  - _Requirements: 3.3, 8.4_





- [ ] 4. Update TypeScript types for breed support
  - Update `AnimalData` interface in `src/types/index.ts` to include `breed_custom?: string` and `is_custom_breed?: boolean` fields
  - Export `AnimalType` type from breed data file

  - Ensure type safety across breed-related operations
  - _Requirements: 1.1, 8.4, 8.5_

- [ ] 5. Create BreedSelector component
- [ ] 5.1 Implement base BreedSelector component structure
  - Create `src/components/BreedSelector.tsx` with props interface including animalType, selectedBreed, customBreed, callbacks, and language

  - Implement component state management for breed options, search query, and custom breed mode
  - Add disabled state handling when no animal type is selected
  - _Requirements: 1.1, 1.3, 4.1_

- [ ] 5.2 Implement breed filtering and selection logic
  - Integrate BreedRegistryService to fetch breeds when animal type changes

  - Implement automatic breed reset when animal type changes
  - Add "Other/Unknown" option to breed list
  - Handle breed selection and propagate changes to parent component
  - _Requirements: 1.1, 1.2, 1.4, 3.3_

- [x] 5.3 Add search and filter functionality

  - Implement real-time search input with debouncing (300ms)
  - Filter breed options based on search query using BreedRegistryService
  - Display "No results found" message when search yields no matches
  - Show suggestion to use "Other/Unknown" option when no matches found



  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 5.4 Implement custom breed input
  - Add conditional rendering of custom breed text input when "Other/Unknown" is selected
  - Implement character limit (200 characters) with counter display


  - Add placeholder text and helper text for guidance
  - Validate minimum length (3 characters) for custom breed descriptions
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 5.5 Add breed information tooltips

  - Implement optional breed info display on hover or selection
  - Show breed characteristics (size, color, features) when available
  - Ensure non-intrusive display that doesn't slow down registration
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 6. Integrate BreedSelector into animal registration form

  - Update `src/components/EnhancedAnimalRegistrationForm.tsx` to import and use BreedSelector component
  - Replace existing breed selection dropdown with BreedSelector
  - Add state management for `customBreed` and `isCustomBreed` fields
  - Pass animal type, language, and callbacks to BreedSelector
  - Update form submission to include custom breed data when applicable
  - _Requirements: 4.1, 4.2, 8.4_


- [ ] 7. Update animal card display for breeds
  - Modify `src/components/EnhancedAnimalCard.tsx` to display breed information
  - Show standard breed names for predefined breeds
  - Display custom breed descriptions with "Custom" badge indicator
  - Ensure proper display in both English and Amharic
  - _Requirements: 4.3, 8.5_


- [ ] 8. Add breed translation support
  - Add breed name translations to `src/i18n/translations/am.json` for Amharic
  - Add breed name translations to `src/i18n/translations/en.json` for English
  - Implement fallback logic to English when Amharic translation is missing

  - Test language switching with breed names
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Implement form validation for breeds
  - Add validation rule requiring breed selection when animal type is selected
  - Add validation for custom breed description when "Other/Unknown" is selected
  - Implement minimum length validation (3 characters) for custom descriptions
  - Add breed-animal type consistency validation
  - Display appropriate error messages in current language
  - _Requirements: 4.1, 8.3, 8.6_

- [ ] 10. Add input sanitization for custom breeds
  - Implement sanitization for custom breed descriptions in `src/utils/securityUtils.ts`
  - Prevent XSS attacks by escaping HTML in breed display
  - Validate and sanitize breed IDs against known breeds
  - Apply sanitization in form submission handler
  - _Requirements: 8.2, 8.4_

- [ ] 11. Update animal database hooks for breed support
  - Modify `src/hooks/useAnimalsDatabase.tsx` to handle custom breed fields
  - Update `useSecureAnimalRegistration` hook to save `breed_custom` and `is_custom_breed` fields
  - Ensure breed data is properly retrieved and transformed in queries
  - _Requirements: 4.2, 8.4_

- [ ] 12. Create breed data migration script
  - Create script to analyze existing breed data in database
  - Identify animals with non-standard breed values
  - Mark appropriate animals with `is_custom_breed = true`
  - Move non-standard breed values to `breed_custom` field
  - Validate data integrity after migration
  - _Requirements: 3.2, 8.4_

- [ ]* 13. Write component tests for BreedSelector
  - Write unit tests for breed filtering when animal type changes
  - Test custom breed input toggle and validation
  - Test search functionality with various queries
  - Test disabled state behavior
  - Test language switching for breed names
  - _Requirements: 1.1, 1.2, 6.1, 8.1_

- [ ]* 14. Write integration tests for breed registration flow
  - Test complete animal registration with standard breed selection
  - Test registration with custom breed description
  - Test breed persistence and retrieval from database
  - Test breed display in animal cards and details
  - Test breed editing functionality
  - _Requirements: 4.1, 4.2, 4.3, 8.4_

- [x] 15. Add error handling and user feedback

  - Implement error messages for breed validation failures
  - Add loading states for breed data fetching
  - Display success feedback when breed is saved
  - Handle edge cases (missing translations, invalid data)
  - _Requirements: 1.4, 8.3_

- [x] 16. Performance optimization

  - Memoize breed options to prevent unnecessary recalculations
  - Implement debounced search to reduce filtering operations
  - Add lazy loading for breed descriptions if needed
  - Optimize re-renders in BreedSelector component
  - _Requirements: 6.1, 6.2_

- [x] 17. Documentation and code comments


  - Add JSDoc comments to BreedRegistryService methods
  - Document BreedSelector component props and usage
  - Add inline comments explaining breed filtering logic
  - Update README with breed management feature description
  - _Requirements: 3.1, 3.2_
