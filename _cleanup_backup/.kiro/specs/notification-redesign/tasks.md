# Notification Redesign - Implementation Tasks

## Phase 1: Core Infrastructure

- [x] 1. Create NotificationDropdown component

  - Bell icon with badge
  - Dropdown menu with notifications list
  - Quick actions for each notification
  - _Requirements: 1.1, 1.2_


- [ ] 2. Add bell icon to SimpleHome/Dashboard
  - Position in top-right corner
  - Show unread count badge
  - Wire up to NotificationDropdown
  - _Requirements: 1.1_


- [ ] 3. Remove Notifications page
  - Delete src/pages/Notifications.tsx
  - Remove route from App.tsx
  - Update any navigation links


  - _Requirements: All_

- [ ] 4. Update translations
  - Add bell icon labels
  - Add dropdown text
  - Add quick action labels


  - _Requirements: All_

## Phase 2: Contextual Notifications (Future)




- [ ] 5. Add buyer interest badges to My Listings
  - Show count on listing cards
  - Inline buyer details
  - _Requirements: 2.1_

- [ ] 6. Add milk reminder toggle to Record Milk page
  - Quick toggle at top of page
  - Time picker for morning/evening
  - _Requirements: 3.1_

## Notes
- Phase 1 focuses on infrastructure
- Phase 2 adds contextual features
- Keep existing notification hooks/services
