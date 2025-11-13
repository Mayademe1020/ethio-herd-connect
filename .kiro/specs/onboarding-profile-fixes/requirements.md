# Requirements Document

## Introduction

This spec addresses critical bugs in the onboarding and profile flow that are preventing users from completing registration and accessing the application. The issues include missing translations, profile fetch errors, unwanted auto-correct behavior, and insufficient name validation for Ethiopian naming conventions.

## Requirements

### Requirement 1: Fix Missing Translation Keys

**User Story:** As a user completing onboarding, I want all UI text to display correctly without missing translation errors, so that I can understand the interface.

#### Acceptance Criteria

1. WHEN the application loads THEN the system SHALL ensure all translation keys referenced in the code exist in both en.json and am.json
2. WHEN the key "common.profile" is referenced THEN the system SHALL return the appropriate translation without errors
3. WHEN any translation is missing THEN the system SHALL log a warning but display a fallback value instead of breaking the UI

### Requirement 2: Fix Profile Fetch 406 Error

**User Story:** As a user who has completed onboarding, I want my profile to load successfully, so that I can access the application features.

#### Acceptance Criteria

1. WHEN a user completes onboarding THEN the system SHALL successfully create a profile record in the database
2. WHEN the profile is fetched from Supabase THEN the system SHALL use the correct Accept headers to avoid 406 errors
3. WHEN the profile fetch fails THEN the system SHALL display a user-friendly error message and provide a retry option
4. WHEN the profile is successfully fetched THEN the system SHALL cache it to avoid repeated API calls

### Requirement 3: Disable Auto-Correct on Name Input

**User Story:** As a user entering my Ethiopian name, I want the input field to accept my name without auto-correction, so that my name is spelled correctly.

#### Acceptance Criteria

1. WHEN a user types in the name field THEN the system SHALL disable browser spell-check and auto-correct features
2. WHEN a user types in the name field THEN the system SHALL accept any Unicode characters including Amharic script
3. WHEN a user types in the name field THEN the system SHALL not suggest corrections or modifications

### Requirement 4: Enforce Full Name Validation (Ethiopian Convention)

**User Story:** As a system enforcing data quality, I want to ensure users enter their full name (first name + father's name), so that we have complete identification information.

#### Acceptance Criteria

1. WHEN a user enters a name THEN the system SHALL validate that at least two words are present (first name and father's name)
2. WHEN a user enters only one word THEN the system SHALL display an error message requesting the father's name
3. WHEN a user enters a valid full name THEN the system SHALL allow form submission
4. WHEN validating names THEN the system SHALL support both Latin and Amharic scripts
5. WHEN displaying the error message THEN the system SHALL show it in both Amharic and English

### Requirement 5: Improve Error Handling and User Feedback

**User Story:** As a user experiencing errors during onboarding, I want clear feedback about what went wrong and how to fix it, so that I can successfully complete the process.

#### Acceptance Criteria

1. WHEN any error occurs during onboarding THEN the system SHALL display a bilingual error message (Amharic and English)
2. WHEN a validation error occurs THEN the system SHALL highlight the problematic field
3. WHEN a network error occurs THEN the system SHALL provide a retry button
4. WHEN the user successfully completes onboarding THEN the system SHALL show a success message before redirecting
