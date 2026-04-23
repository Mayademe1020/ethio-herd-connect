# Animal ID Visibility & Search - Implementation Tasks

- [x] 1. Create reusable AnimalIdBadge component


  - Create component with copy functionality
  - Add monospace styling
  - Support different sizes (sm, md, lg)
  - Add bilingual tooltips
  - _Requirements: 1.1, 1.6, 3.1, 3.2, 3.3, 3.5_



- [x] 2. Create AnimalSearchBar component


  - Create search input with icon
  - Add debouncing (300ms)
  - Add clear button


  - Bilingual placeholder
  - _Requirements: 2.1, 2.5_



- [ ] 3. Create useAnimalSearch hook
  - Implement search logic


  - Case-insensitive matching
  - Partial ID matching
  - Also search by name
  - _Requirements: 2.2, 2.3, 2.6_





- [ ] 4. Update AnimalCard component
  - Add AnimalIdBadge at top
  - Style for visibility


  - Ensure responsive layout


  - _Requirements: 1.1, 3.2_

- [ ] 5. Update MyAnimals page
  - Add AnimalSearchBar at top
  - Integrate useAnimalSearch hook


  - Show "No animals found" message
  - Display search results count
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_




- [ ] 6. Update RegisterAnimal page
  - Add ID format preview section
  - Show example based on animal type
  - Explain ID structure
  - Bilingual explanation
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Update AnimalDetail page
  - Display animal ID prominently at top
  - Add copy button
  - Show in page title
  - _Requirements: 1.2_

- [ ] 8. Update RecordMilk page
  - Show animal ID in dropdown


  - Format: "Name (ID)"
  - Make searchable





  - _Requirements: 1.3, 5.1_

- [ ] 9. Implement marketplace privacy
  - Hide animal_id from buyers in ListingCard
  - Hide animal_id from buyers in ListingDetail
  - Show animal_id to sellers only
  - Add conditional rendering logic
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 10. Add translations
  - Add English translations for all new text
  - Add Amharic translations for all new text
  - Update translation files
  - _Requirements: 6.5_

- [ ] 11. Test and verify
  - Test search functionality
  - Test ID display on all pages
  - Test marketplace privacy
  - Test copy functionality
  - Verify no 406 errors
  - _Requirements: All_
