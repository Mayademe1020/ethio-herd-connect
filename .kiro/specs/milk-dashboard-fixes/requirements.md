# Requirements Document: Milk Dashboard Fixes

## Introduction

This specification addresses critical bugs in the milk dashboard and summary feature that prevent it from functioning. The feature was implemented with incorrect table and column names, causing all database queries to fail silently. This document outlines the requirements to fix the implementation and bring it to production quality.

## Requirements

### Requirement 1: Fix Database Query Table Names

**User Story:** As a farmer, I want to see my actual milk production data on the dashboard, so that I can track my daily and weekly milk output.

#### Acceptance Criteria

1. WHEN the dashboard loads THEN the system SHALL query the `milk_production` table instead of `milk_records`
2. WHEN the milk summary page loads THEN the system SHALL query the `milk_production` table instead of `milk_records`
3. WHEN viewing animal details THEN the system SHALL query the `milk_production` table instead of `milk_records`
4. WHEN any milk query executes THEN the system SHALL NOT use type casting `as any` to bypass TypeScript errors
5. WHEN a milk query fails THEN the system SHALL log the error AND display a user-friendly error message

### Requirement 2: Fix Database Query Column Names

**User Story:** As a farmer, I want the system to correctly read my milk production amounts, so that I see accurate liter values instead of zeros.

#### Acceptance Criteria

1. WHEN querying milk production THEN the system SHALL select the `liters` column instead of `amount`
2. WHEN displaying milk records THEN the system SHALL use the `liters` field from the database
3. WHEN calculating totals THEN the system SHALL sum the `liters` column values
4. WHEN a record has no liters value THEN the system SHALL default to 0
5. WHEN displaying session information THEN the system SHALL use the `session` column (morning/evening)

### Requirement 3: Remove Development Debug Code

**User Story:** As a farmer, I want a clean professional interface, so that I don't see confusing debug information on my dashboard.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN the system SHALL NOT display debug information boxes
2. WHEN viewing any production screen THEN the system SHALL NOT show technical debugging data
3. WHEN errors occur THEN the system SHALL log to console for developers BUT NOT show raw error details to users
4. WHEN in production mode THEN the system SHALL NOT render any debug UI components

### Requirement 4: Add Proper Error Handling

**User Story:** As a farmer, I want to know when something goes wrong, so that I can take appropriate action or contact support.

#### Acceptance Criteria

1. WHEN a milk query fails THEN the system SHALL display a toast notification with a user-friendly message
2. WHEN the database is unreachable THEN the system SHALL show "Unable to load milk data. Please check your connection."
3. WHEN a query returns an error THEN the system SHALL log the full error to console for debugging
4. WHEN retrying a failed operation THEN the system SHALL provide a "Retry" button
5. WHEN data is loading THEN the system SHALL show appropriate loading indicators

### Requirement 5: Implement Type Safety

**User Story:** As a developer, I want proper TypeScript types for milk production data, so that I can catch errors at compile time.

#### Acceptance Criteria

1. WHEN defining milk production queries THEN the system SHALL use a proper TypeScript interface
2. WHEN accessing milk production fields THEN TypeScript SHALL validate field names at compile time
3. WHEN a field name is incorrect THEN TypeScript SHALL show a compilation error
4. WHEN querying the database THEN the system SHALL NOT use `as any` type assertions
5. WHEN mapping database results THEN the system SHALL use typed interfaces

### Requirement 6: Validate CSV Export Functionality

**User Story:** As a farmer, I want to export my milk records to CSV, so that I can keep offline records for my bookkeeping.

#### Acceptance Criteria

1. WHEN clicking "Download CSV" THEN the system SHALL export all visible milk records
2. WHEN the CSV is generated THEN it SHALL include columns: Date, Animal Name, Amount (L), Session
3. WHEN the CSV is downloaded THEN the filename SHALL include the month and year (e.g., milk-summary-2025-11.csv)
4. WHEN there are no records THEN the "Download CSV" button SHALL be disabled
5. WHEN export is in progress THEN the button SHALL show "Downloading..." and be disabled
6. WHEN export completes THEN the system SHALL show a success toast notification
7. WHEN export fails THEN the system SHALL show an error toast notification

### Requirement 7: Improve Empty States

**User Story:** As a new farmer, I want guidance when I have no milk records, so that I know what to do next.

#### Acceptance Criteria

1. WHEN viewing the dashboard with no milk records THEN the system SHALL show "No milk recorded yet"
2. WHEN viewing the milk summary with no records THEN the system SHALL show an empty state with guidance
3. WHEN in an empty state THEN the system SHALL provide a "Record Milk" button
4. WHEN clicking the empty state button THEN the system SHALL navigate to the milk recording page
5. WHEN viewing animal details with no milk records THEN the system SHALL show "Record First Milk" button

### Requirement 8: Add Loading States

**User Story:** As a farmer, I want to see when data is loading, so that I know the app is working and not frozen.

#### Acceptance Criteria

1. WHEN milk data is loading THEN the dashboard SHALL show skeleton loaders or spinners
2. WHEN the milk summary is loading THEN the page SHALL show a loading indicator
3. WHEN CSV export is processing THEN the button SHALL show "Downloading..." text
4. WHEN data loads successfully THEN the loading indicators SHALL be replaced with actual data
5. WHEN loading takes more than 3 seconds THEN the system SHALL show "This is taking longer than usual..."

### Requirement 9: Test Data Flow End-to-End

**User Story:** As a quality assurance tester, I want to verify the milk feature works completely, so that farmers can rely on accurate data.

#### Acceptance Criteria

1. WHEN a farmer records milk production THEN it SHALL appear on the dashboard within 5 seconds
2. WHEN viewing yesterday's total THEN it SHALL match the sum of all yesterday's records
3. WHEN viewing today's total THEN it SHALL match the sum of all today's records
4. WHEN viewing the weekly total THEN it SHALL match the sum of the last 7 days
5. WHEN exporting to CSV THEN the exported data SHALL match what's displayed on screen
6. WHEN viewing animal details THEN the milk records SHALL match the animal's actual production
7. WHEN multiple sessions are recorded THEN both morning and evening SHALL be counted

### Requirement 10: Ensure Bilingual Support

**User Story:** As an Ethiopian farmer, I want to see milk production labels in both Amharic and English, so that I can understand the interface in my preferred language.

#### Acceptance Criteria

1. WHEN viewing the dashboard THEN milk production labels SHALL be shown in both Amharic and English
2. WHEN viewing the milk summary THEN all labels SHALL be bilingual
3. WHEN viewing empty states THEN messages SHALL be in both languages
4. WHEN viewing error messages THEN they SHALL be in both languages
5. WHEN exporting CSV THEN column headers SHALL be in English (standard for data files)
