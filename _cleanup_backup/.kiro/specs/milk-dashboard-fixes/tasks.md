# Implementation Plan: Milk Dashboard Fixes

- [ ] 1. Create centralized type definitions and query utilities
  - Create TypeScript interfaces for milk production data types
  - Create centralized milk query functions with proper error handling
  - Remove all `as any` type casts from codebase
  - _Requirements: 1.4, 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 1.1 Create milk types file
  - Create `src/types/milk.ts` with MilkProduction, DailyMilkStats, MilkSummaryRecord interfaces
  - Define proper TypeScript types for all milk-related data structures
  - Export types for use across components
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 1.2 Create centralized milk queries
  - Create `src/lib/milkQueries.ts` with getDailyStats, getMonthlySummary, getAnimalMilkRecords functions
  - Use correct table name `milk_production` instead of `milk_records`
  - Use correct column name `liters` instead of `amount`
  - Add proper TypeScript return types
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 5.1_

- [ ] 1.3 Update error handling utilities
  - Update `src/lib/errorHandling.ts` with handleMilkQueryError function
  - Add user-friendly error messages for different error types
  - Add bilingual error messages (Amharic/English)
  - _Requirements: 1.5, 4.1, 4.2, 4.3, 10.4_

- [ ] 2. Fix HomeScreen.tsx dashboard queries
  - Replace `milk_records` with `milk_production` table name
  - Replace `amount` with `liters` column name
  - Remove `as any` type casts
  - Use centralized milkQueries functions
  - Add proper error handling with toast notifications
  - _Requirements: 1.1, 1.4, 1.5, 2.1, 2.2, 4.1, 4.2_

- [ ] 2.1 Update daily milk stats query
  - Replace table name from `milk_records` to `milk_production`
  - Replace column name from `amount` to `liters`
  - Use milkQueries.getDailyStats() function
  - Add onError handler with toast notification
  - Remove type cast `as any`
  - _Requirements: 1.1, 2.1, 2.2, 4.1, 5.4_

- [ ] 2.2 Remove debug code from dashboard
  - Remove debug information box (lines 289-295)
  - Remove any console.log statements not needed for production
  - Clean up commented code
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 2.3 Add loading states to dashboard
  - Add skeleton loaders for milk production cards
  - Show loading spinner while fetching daily stats
  - Add "Loading..." text for better UX
  - _Requirements: 8.1, 8.4_

- [ ] 2.4 Improve empty state on dashboard
  - Update empty state message when no milk records exist
  - Add "Record Milk" button in empty state
  - Add bilingual labels (Amharic/English)
  - _Requirements: 7.1, 7.3, 7.4, 10.1_

- [ ] 3. Fix MilkSummary.tsx page queries
  - Replace `milk_records` with `milk_production` table name
  - Replace `amount` with `liters` column name
  - Remove `as any` type casts
  - Use centralized milkQueries functions
  - Add proper error handling
  - _Requirements: 1.2, 1.4, 1.5, 2.1, 2.2, 4.1_

- [ ] 3.1 Update monthly summary query
  - Replace table name from `milk_records` to `milk_production`
  - Replace column name from `amount` to `liters`
  - Use milkQueries.getMonthlySummary() function
  - Add onError handler with toast notification
  - Remove type cast `as any`
  - _Requirements: 1.2, 2.1, 2.2, 4.1, 5.4_

- [ ] 3.2 Fix CSV export functionality
  - Update CSV export to use `liters` field instead of `amount`
  - Add success toast notification after export
  - Add error toast notification if export fails
  - Disable button when no records exist
  - Show "Downloading..." state during export
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ] 3.3 Add loading states to milk summary
  - Add loading spinner while fetching monthly data
  - Add skeleton loaders for record list
  - Show loading indicator during CSV export
  - _Requirements: 8.2, 8.3, 8.4_

- [ ] 3.4 Improve empty state on milk summary
  - Update empty state message with guidance
  - Add "Record Milk" button in empty state
  - Add bilingual labels (Amharic/English)
  - _Requirements: 7.2, 7.3, 7.4, 10.2_

- [ ] 4. Fix AnimalDetail.tsx milk records query
  - Replace `milk_records` with `milk_production` table name
  - Replace `amount` with `liters` column name
  - Remove `as any` type casts
  - Use centralized milkQueries functions
  - Add proper error handling
  - _Requirements: 1.3, 1.4, 1.5, 2.1, 2.2, 4.1_

- [ ] 4.1 Update animal milk records query
  - Replace table name from `milk_records` to `milk_production`
  - Update select statement to use correct column names
  - Use milkQueries.getAnimalMilkRecords() function
  - Add onError handler with toast notification
  - Remove type cast `as any`
  - Remove fallback logic for old column names (amount, total_yield)
  - _Requirements: 1.3, 2.1, 2.2, 4.1, 5.4_

- [ ] 4.2 Update milk record display logic
  - Use `liters` field directly from query results
  - Remove fallback to `amount` or `total_yield` columns
  - Update TypeScript types for milk records
  - _Requirements: 2.2, 2.4, 5.2_

- [ ] 4.3 Improve empty state on animal detail
  - Update empty state message for no milk records
  - Add "Record First Milk" button
  - Add bilingual labels (Amharic/English)
  - _Requirements: 7.5, 10.1_

- [ ] 5. Add comprehensive error handling
  - Add error boundaries for milk components
  - Add retry buttons for failed queries
  - Add user-friendly error messages
  - Add bilingual error messages
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 10.4_

- [ ] 5.1 Add error states to dashboard
  - Show error message when daily stats fail to load
  - Add "Retry" button to reload data
  - Show bilingual error messages
  - _Requirements: 4.1, 4.2, 4.4, 10.4_

- [ ] 5.2 Add error states to milk summary
  - Show error message when monthly summary fails to load
  - Add "Retry" button to reload data
  - Show bilingual error messages
  - _Requirements: 4.1, 4.2, 4.4, 10.4_

- [ ] 5.3 Add error states to animal detail
  - Show error message when milk records fail to load
  - Add "Retry" button to reload data
  - Show bilingual error messages
  - _Requirements: 4.1, 4.2, 4.4, 10.4_

- [ ]* 6. Add integration tests
  - Create integration tests for milk queries
  - Test dashboard data flow
  - Test milk summary data flow
  - Test CSV export functionality
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ]* 6.1 Create milk queries unit tests
  - Test getDailyStats with correct table/column names
  - Test getMonthlySummary with correct table/column names
  - Test getAnimalMilkRecords with correct table/column names
  - Test error handling in all query functions
  - _Requirements: 9.1, 9.2, 9.3_

- [ ]* 6.2 Create dashboard integration tests
  - Test HomeScreen renders with real milk data
  - Test daily stats display correctly
  - Test weekly total calculation
  - Test navigation to milk summary
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ]* 6.3 Create milk summary integration tests
  - Test MilkSummary page renders with real data
  - Test monthly summary calculations
  - Test CSV export generates correct file
  - Test empty state displays correctly
  - _Requirements: 9.5, 9.6_

- [ ]* 6.4 Create animal detail integration tests
  - Test AnimalDetail shows milk records
  - Test milk records match animal's production
  - Test empty state for animals with no records
  - _Requirements: 9.6, 9.7_

- [ ] 7. Verify and test complete data flow
  - Test recording milk production
  - Verify data appears on dashboard
  - Verify data appears in milk summary
  - Verify CSV export works
  - Test on mobile device
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_

- [ ] 7.1 Test milk recording flow
  - Record milk production for an animal
  - Verify it appears on dashboard within 5 seconds
  - Verify it appears in milk summary
  - Verify it appears in animal detail
  - _Requirements: 9.1, 9.6_

- [ ] 7.2 Test daily stats accuracy
  - Record multiple milk sessions
  - Verify today's total is correct
  - Verify yesterday's total is correct
  - Verify weekly total is correct
  - _Requirements: 9.2, 9.3, 9.4_

- [ ] 7.3 Test CSV export accuracy
  - Export milk summary to CSV
  - Verify exported data matches displayed data
  - Verify filename includes month and year
  - Verify all columns are present
  - _Requirements: 9.5, 6.1, 6.2, 6.3_

- [ ] 7.4 Test mobile responsiveness
  - Test dashboard on mobile device
  - Test milk summary on mobile device
  - Test CSV export on mobile device
  - Verify touch targets are adequate
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 8. Update documentation
  - Update README with milk feature documentation
  - Document database schema for milk_production
  - Document API for milk queries
  - Add troubleshooting guide
  - _Requirements: All_

- [ ] 8.1 Create milk feature documentation
  - Document how to use milk dashboard
  - Document how to export CSV
  - Document how to view milk summary
  - Add screenshots of features
  - _Requirements: All_

- [ ] 8.2 Update database documentation
  - Document milk_production table schema
  - Document indexes and performance considerations
  - Document RLS policies
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 8.3 Create troubleshooting guide
  - Document common errors and solutions
  - Document how to verify database schema
  - Document how to test queries manually
  - _Requirements: 4.1, 4.2, 4.3_
