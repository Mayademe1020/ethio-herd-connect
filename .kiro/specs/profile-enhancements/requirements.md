# Profile Page Enhancements - Requirements Document

## Introduction

This spec focuses on essential profile page improvements following the simplicity-first principle. The exhibition is complete, and we're now enhancing the profile page with real data integration and farmer-focused features while keeping complexity minimal.

**Core Principle:** Simple, valuable features for Ethiopian farmers (cattle/goat/sheep owners)

## Requirements

### Requirement 1: Display Real User Data

**User Story:** As a farmer, I want to see my actual name and farm information on my profile, so that I know the app recognizes me.

#### Acceptance Criteria

1. WHEN a user opens the profile page THEN the system SHALL display their actual farmer_name from the profiles table
2. WHEN a user has a farm_name THEN the system SHALL display it below their name
3. WHEN a user has no farm_name THEN the system SHALL show only the farmer name without empty space
4. WHEN the profile data is loading THEN the system SHALL show skeleton loaders instead of placeholder data
5. WHEN the profile fails to load THEN the system SHALL show an error message with retry button

### Requirement 2: Show Farm Statistics Card

**User Story:** As a farmer, I want to see a quick summary of my farm activity, so that I can understand my farm's status at a glance.

#### Acceptance Criteria

1. WHEN a user views their profile THEN the system SHALL display a statistics card showing:
   - Total number of registered animals
   - Total milk recorded in last 30 days (in liters)
   - Number of active marketplace listings
2. WHEN the user has no animals THEN the system SHALL show "0 Animals" with a prompt to register
3. WHEN the user has no milk records THEN the system SHALL show "0 L" 
4. WHEN the user has no listings THEN the system SHALL show "0 Listings"
5. WHEN statistics are loading THEN the system SHALL show loading indicators

### Requirement 3: Add Quick Action Buttons

**User Story:** As a farmer, I want quick access to common actions from my profile, so that I can perform tasks efficiently.

#### Acceptance Criteria

1. WHEN a user views their profile THEN the system SHALL display quick action buttons for:
   - Register New Animal
   - Record Milk
   - Create Listing
2. WHEN the user taps "Register New Animal" THEN the system SHALL navigate to /register-animal
3. WHEN the user taps "Record Milk" THEN the system SHALL navigate to /record-milk
4. WHEN the user taps "Create Listing" THEN the system SHALL navigate to /create-listing
5. WHEN the user has no animals AND taps "Record Milk" THEN the system SHALL show a message prompting to register animals first
6. WHEN the user has no animals AND taps "Create Listing" THEN the system SHALL show a message prompting to register animals first

### Requirement 4: Enable Profile Editing

**User Story:** As a farmer, I want to edit my name and farm name, so that I can keep my information up to date.

#### Acceptance Criteria

1. WHEN a user taps "Edit Profile" button THEN the system SHALL open an edit modal
2. WHEN the edit modal opens THEN the system SHALL pre-fill current farmer_name and farm_name
3. WHEN the user edits farmer_name THEN the system SHALL validate it requires at least 2 words (first name + father's name)
4. WHEN the user edits farm_name THEN the system SHALL allow it to be optional
5. WHEN the user saves valid changes THEN the system SHALL update the profiles table
6. WHEN the save succeeds THEN the system SHALL show a success message and close the modal
7. WHEN the save fails THEN the system SHALL show an error message and keep the modal open
8. WHEN the user cancels THEN the system SHALL close the modal without saving

### Requirement 5: Simplify Settings Section

**User Story:** As a farmer, I want only essential settings visible, so that I'm not overwhelmed with options I don't need.

#### Acceptance Criteria

1. WHEN a user views settings THEN the system SHALL show ONLY:
   - Language selector (Amharic/English)
   - Calendar preference (Gregorian/Ethiopian)
   - Notifications toggle
2. WHEN a user views settings THEN the system SHALL NOT show:
   - Dark mode toggle
   - Sound toggle
   - Font size options
   - Developer options
   - Experimental features
3. WHEN the user changes language THEN the system SHALL update immediately and show success toast
4. WHEN the user changes calendar THEN the system SHALL save to database and show success toast
5. WHEN the user toggles notifications THEN the system SHALL save preference

### Requirement 6: Add Logout Confirmation

**User Story:** As a farmer, I want to confirm before logging out, so that I don't accidentally lose my session.

#### Acceptance Criteria

1. WHEN a user taps the logout button THEN the system SHALL show a confirmation dialog
2. WHEN the confirmation dialog appears THEN the system SHALL display bilingual message (Amharic/English)
3. WHEN the user confirms logout THEN the system SHALL clear the session and redirect to login
4. WHEN the user cancels THEN the system SHALL close the dialog and remain on profile page
5. WHEN logout fails THEN the system SHALL show an error message

### Requirement 7: Remove Unnecessary Sections

**User Story:** As a farmer, I want a clean profile page without features I don't use, so that I can focus on what matters.

#### Acceptance Criteria

1. WHEN a user views the profile page THEN the system SHALL NOT display:
   - Email field (not collected during onboarding)
   - Physical address field (not collected)
   - Birthdate field (not collected)
   - Security settings section (change password, 2FA)
   - Social profiles section
   - Display settings section
2. WHEN a user views the profile page THEN the system SHALL keep:
   - Personal info (name, farm name, phone)
   - Farm statistics card
   - Quick actions
   - Settings (language, calendar, notifications)
   - Analytics dashboard
   - Help & support links
   - Logout button

### Requirement 8: Maintain Offline Support

**User Story:** As a farmer with unreliable internet, I want my profile to work offline, so that I can view my information anytime.

#### Acceptance Criteria

1. WHEN the profile loads successfully THEN the system SHALL cache the data locally
2. WHEN the user opens profile offline THEN the system SHALL display cached data
3. WHEN the user tries to edit profile offline THEN the system SHALL show a message that editing requires internet
4. WHEN the user goes back online THEN the system SHALL refresh profile data automatically
5. WHEN cached data is stale (>24 hours) THEN the system SHALL show a "data may be outdated" indicator

