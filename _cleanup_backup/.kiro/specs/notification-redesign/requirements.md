# Notification System Redesign - Requirements

## Overview
Redesign the notification system to be contextual and integrated into the user's workflow instead of a separate page.

## User Stories

### 1. Dashboard Notifications
**As a farmer**, I want to see a notification bell icon on my dashboard, so that I can quickly check important alerts without leaving my current page.

**Acceptance Criteria:**
- Bell icon appears in the top-right of the dashboard/home page
- Badge shows unread notification count
- Clicking bell opens a dropdown with recent notifications
- Dropdown shows last 5 notifications
- Each notification has a quick action (e.g., "View", "Dismiss")

### 2. Contextual Buyer Interest
**As a seller**, I want to see buyer interest notifications on my listings page, so that I know when someone is interested without checking a separate page.

**Acceptance Criteria:**
- Buyer interest count appears as a badge on listing cards
- "3 new buyers interested!" shown prominently
- Click to see buyer details inline
- No need to navigate to separate page

### 3. Milk Recording Reminders
**As a farmer**, I want to set milk recording reminders on the milk pages, so that I don't forget to record my daily production.

**Acceptance Criteria:**
- Toggle switch on Record Milk page: "Remind me to record milk"
- Set morning time (default 6:00 AM)
- Set evening time (default 6:00 PM)
- Receive phone notification at set times
- Option to snooze (15 min, 30 min, 1 hour)

### 4. Unified Notification Settings
**As a farmer**, I want all my notification preferences in my Profile, so that I can manage them in one place.

**Acceptance Criteria:**
- All notification toggles in Profile page
- Milk recording reminders
- Buyer interest alerts
- Market price changes
- Sound/vibration preferences

## Non-Functional Requirements

- Remove separate Notifications page
- Notifications load quickly (< 500ms)
- Bell icon updates in real-time
- Works offline (shows cached notifications)
- Bilingual support (English + Amharic)
