# Core Features Enhancement - Design Document

**Based on:** requirements.md  
**Focus:** Simple, functional, offline-first design

---

## Overview

This design document outlines the technical implementation for 7 core feature enhancements that align with our platform's value proposition: simple daily operations, accurate record keeping, direct market access, and offline-first architecture.

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Mobile App (React)                       │
├─────────────────────────────────────────────────────────────┤
│  Pages Layer                                                 │
│  - MilkProductionRecords (enhanced with summaries)          │
│  - CreateListing (enhanced with video upload)               │
│  - AnimalDetail (enhanced with edit & pregnancy)            │
│  - Notifications (enhanced with types & actions)            │
├─────────────────────────────────────────────────────────────┤
│  Components Layer                                            │
│  - MilkSummaryCard (weekly/monthly totals)                 │
│  - VideoUploadField (10-second validation)                  │
│  - EditAnimalModal (edit animal details)                    │
│  - PregnancyTracker (countdown & alerts)                    │
│  - NotificationCard (buyer interest, reminders)             │
├─────────────────────────────────────────────────────────────┤
│  Hooks Layer                                                 │
│  - useMilkSummaries (calculate totals & trends)            │
│  - useVideoUpload (compress & validate)                     │
│  - usePregnancyTracking (calculate delivery dates)          │
│  - useNotifications (fetch & manage notifications)          │
│  - useReminders (schedule milk reminders)                   │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  - milkService (CRUD + summaries)                           │
│  - videoService (upload + thumbnail generation)             │
│  - notificationService (create + deliver)                   │
│  - reminderService (schedule + trigger)                     │
│  - offlineQueue (queue all actions)                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
├─────────────────────────────────────────────────────────────┤
│  Database Tables                                             │
│  - milk_production (+ edit_history)                         │
│  - market_listings (+ video_url, video_thumbnail)          │
│  - animals (+ pregnancy_status, pregnancy_data)             │
│  - notifications (+ type, priority, metadata)               │
│  - reminders (+ schedule, status)                           │
├─────────────────────────────────────────────────────────────┤
│  Storage Buckets                                             │
│  - animal-photos                                             │
│  - listing-videos (NEW)                                      │
│  - video-thumbnails (NEW)                                    │
├─────────────────────────────────────────────────────────────┤
│  Real-time Subscriptions                                     │
│  - notifications (buyer interests)                           │
│  - market_listings (new listings)                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Milk Recording Enhancements

#### MilkSummaryCard Component
```typescript
interface MilkSummaryCardProps {
  animalId: string;
  period: 'week' | 'month';
}

interface MilkSummary {
  totalLiters: number;
  recordCount: number;
  averagePerDay: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  trendPercentage: number;
}
```

**Features:**
- Weekly/monthly totals with visual cards
- Trend indicators (↑ ↓ →)
- Average daily production
- Comparison with previous period

#### EditMilkRecordModal Component
```typescript
interface EditMilkRecordModalProps {
  recordId: string;
  currentAmount: number;
  currentSession: 'morning' | 'afternoon';
  onSave: (amount: number, session: string) => void;
  onCancel: () => void;
}
```

**Features:**
- Pre-filled form with current values
- Validation (0-100L)
- Confirmation for records >7 days old
- Edit history tracking

---

### 2. Video Upload

#### VideoUploadField Component
```typescript
interface VideoUploadFieldProps {
  onVideoSelected: (file: File, thumbnail: string) => void;
  maxDuration: number; // 10 seconds
  maxSize: number; // 20MB
}

interface VideoMetadata {
  duration: number;
  size: number;
  format: string;
  thumbnail: string;
}
```

**Features:**
- File picker (camera + gallery)
- Duration validation (≤10 seconds)
- Size validation (≤20MB)
- Thumbnail generation
- Upload progress indicator
- Error handling

#### Video Player Component
```typescript
interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl: string;
  autoPlay?: boolean;
}
```

**Features:**
- Thumbnail with play button
- Inline playback
- Simple controls (play/pause)
- Loading states

---

### 3. Edit Functionality

#### EditAnimalModal Component
```typescript
interface EditAnimalModalProps {
  animalId: string;
  currentData: {
    name: string;
    subtype: string;
    photo_url?: string;
  };
  onSave: (updates: Partial<Animal>) => void;
}
```

**Features:**
- Edit name, subtype, photo
- Photo upload/replace
- Validation
- Offline support

#### EditListingModal Component
```typescript
interface EditListingModalProps {
  listingId: string;
  currentData: MarketListing;
  onSave: (updates: Partial<MarketListing>) => void;
}
```

**Features:**
- Edit price, negotiable status
- Add/replace photos and videos
- Warning if buyer interests exist
- Preserve creation date

---

### 4. Pregnancy Tracking

#### PregnancyTracker Component
```typescript
interface PregnancyTrackerProps {
  animalId: string;
  animalType: 'cattle' | 'goat' | 'sheep';
  gender: 'female';
}

interface PregnancyData {
  breeding_date: string;
  expected_delivery: string;
  days_remaining: number;
  status: 'pregnant' | 'delivered' | 'terminated';
  offspring_id?: string;
}
```

**Features:**
- Record breeding date
- Auto-calculate delivery date
- Countdown display
- Alert when <7 days
- Record birth outcome
- Link to offspring

**Gestation Calculation:**
```typescript
const GESTATION_DAYS = {
  cattle: 283,
  goat: 150,
  sheep: 147
};

function calculateDeliveryDate(breedingDate: Date, animalType: string): Date {
  const gestationDays = GESTATION_DAYS[animalType];
  return addDays(breedingDate, gestationDays);
}
```

---

### 5. Marketplace Notifications

#### NotificationCard Component
```typescript
interface NotificationCardProps {
  notification: Notification;
  onAction: (action: 'call' | 'whatsapp' | 'mark_contacted') => void;
}

interface Notification {
  id: string;
  type: 'buyer_interest' | 'milk_reminder' | 'market_alert' | 'pregnancy_alert';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  metadata: {
    buyer_phone?: string;
    listing_id?: string;
    animal_id?: string;
  };
  is_read: boolean;
  created_at: string;
}
```

**Features:**
- Type-specific icons and colors
- Quick action buttons
- Read/unread status
- Timestamp
- Deep links to relevant pages

#### Notification Badge
```typescript
interface NotificationBadgeProps {
  count: number;
  type?: 'buyer_interest' | 'reminder' | 'alert';
}
```

**Features:**
- Count display
- Color coding by type
- Animated entrance
- Max display (99+)

---

### 6. Milk Recording Reminders

#### ReminderScheduler Service
```typescript
interface ReminderSchedule {
  user_id: string;
  morning_time: string; // "07:00"
  afternoon_time: string; // "17:00"
  enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}

interface ReminderNotification {
  session: 'morning' | 'afternoon';
  animals_pending: Animal[];
  total_count: number;
}
```

**Features:**
- Customizable reminder times
- Quiet hours support
- Animal-specific reminders
- Snooze functionality (15 min)
- Completion tracking

---

### 7. Market Intelligence Alerts

#### MarketAlertService
```typescript
interface MarketAlert {
  type: 'new_listing' | 'price_change' | 'opportunity';
  title: string;
  message: string;
  listing_id?: string;
  price_data?: {
    current: number;
    previous: number;
    change_percentage: number;
  };
  location_data?: {
    distance_km: number;
    region: string;
  };
}
```

**Features:**
- Location-based alerts (nearby listings)
- Price trend analysis
- Opportunity suggestions
- User preferences (opt-in/out)

---

## Data Models

### Enhanced milk_production Table
```sql
CREATE TABLE milk_production (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  animal_id UUID REFERENCES animals,
  liters NUMERIC NOT NULL,
  session TEXT NOT NULL, -- 'morning' | 'afternoon'
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  edited_by UUID REFERENCES auth.users,
  edit_count INTEGER DEFAULT 0
);

-- Edit history tracking
CREATE TABLE milk_edit_history (
  id UUID PRIMARY KEY,
  milk_record_id UUID REFERENCES milk_production,
  previous_liters NUMERIC,
  new_liters NUMERIC,
  previous_session TEXT,
  new_session TEXT,
  edited_by UUID REFERENCES auth.users,
  edited_at TIMESTAMP DEFAULT NOW()
);
```

### Enhanced market_listings Table
```sql
ALTER TABLE market_listings ADD COLUMN video_url TEXT;
ALTER TABLE market_listings ADD COLUMN video_thumbnail TEXT;
ALTER TABLE market_listings ADD COLUMN video_duration INTEGER; -- seconds
ALTER TABLE market_listings ADD COLUMN last_edited_at TIMESTAMP;
ALTER TABLE market_listings ADD COLUMN edit_count INTEGER DEFAULT 0;
```

### Enhanced animals Table
```sql
ALTER TABLE animals ADD COLUMN pregnancy_status TEXT; -- 'not_pregnant' | 'pregnant' | 'delivered'
ALTER TABLE animals ADD COLUMN pregnancy_data JSONB; -- { breeding_date, expected_delivery, offspring_id }
ALTER TABLE animals ADD COLUMN last_edited_at TIMESTAMP;
ALTER TABLE animals ADD COLUMN edit_count INTEGER DEFAULT 0;
```

### Enhanced notifications Table
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL, -- 'buyer_interest' | 'milk_reminder' | 'market_alert' | 'pregnancy_alert'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  action_url TEXT,
  metadata JSONB, -- { buyer_phone, listing_id, animal_id, etc. }
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_type ON notifications(user_id, type);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

### New reminders Table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  type TEXT NOT NULL, -- 'milk_morning' | 'milk_afternoon'
  schedule_time TIME NOT NULL,
  enabled BOOLEAN DEFAULT TRUE,
  last_triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Error Handling

### Video Upload Errors
```typescript
enum VideoUploadError {
  DURATION_EXCEEDED = 'Video must be 10 seconds or less',
  SIZE_EXCEEDED = 'Video must be 20MB or less',
  INVALID_FORMAT = 'Invalid video format. Use MP4, MOV, or AVI',
  UPLOAD_FAILED = 'Upload failed. Please try again',
  THUMBNAIL_FAILED = 'Could not generate thumbnail'
}
```

### Edit Errors
```typescript
enum EditError {
  STALE_DATA = 'This record was updated by another device. Please refresh',
  VALIDATION_FAILED = 'Invalid data. Please check your inputs',
  PERMISSION_DENIED = 'You do not have permission to edit this',
  OFFLINE_EDIT = 'Edit saved locally. Will sync when online'
}
```

### Notification Errors
```typescript
enum NotificationError {
  DELIVERY_FAILED = 'Could not deliver notification. Will retry',
  PERMISSION_DENIED = 'Notification permissions not granted',
  INVALID_METADATA = 'Invalid notification data'
}
```

---

## Testing Strategy

### Unit Tests
- Milk summary calculations
- Video validation logic
- Pregnancy date calculations
- Notification creation
- Reminder scheduling

### Integration Tests
- Edit flow (milk, animals, listings)
- Video upload end-to-end
- Notification delivery
- Reminder triggering
- Offline queue sync

### User Acceptance Tests
- Farmers can edit milk records easily
- Video upload works on 3G
- Notifications arrive promptly
- Reminders trigger at correct times
- All features work offline

---

## Performance Considerations

### Video Upload Optimization
- Client-side compression before upload
- Chunked upload for large files
- Background upload with progress
- Thumbnail generation on server

### Notification Performance
- Batch notification delivery
- Indexed queries for fast retrieval
- Real-time subscriptions for instant delivery
- Offline queue for reliability

### Summary Calculations
- Cached summaries (recalculate on edit)
- Indexed date queries
- Pagination for large datasets
- Background calculation for trends

---

## Security Considerations

### Video Upload Security
- File type validation
- Size limits enforced
- Virus scanning (future)
- Signed URLs for access

### Edit Permissions
- User can only edit own records
- RLS policies enforce ownership
- Edit history preserved
- Audit trail maintained

### Notification Privacy
- Buyer phone numbers encrypted
- Notifications only visible to recipient
- No sensitive data in push notifications
- Secure deep links

---

## Offline Support

### Offline Queue Actions
```typescript
type OfflineAction = 
  | { type: 'edit_milk', recordId: string, updates: Partial<MilkRecord> }
  | { type: 'upload_video', listingId: string, videoFile: File }
  | { type: 'edit_animal', animalId: string, updates: Partial<Animal> }
  | { type: 'record_pregnancy', animalId: string, data: PregnancyData }
  | { type: 'mark_notification_read', notificationId: string };
```

### Sync Strategy
1. Queue all actions in IndexedDB
2. Retry with exponential backoff
3. Show sync status to user
4. Resolve conflicts (last write wins)
5. Notify user of sync completion

---

## Bilingual Support

### Translation Keys
```json
{
  "milk.summary.weekly": "Weekly Total / ሳምንታዊ ድምር",
  "milk.summary.monthly": "Monthly Total / ወርሃዊ ድምር",
  "milk.edit.confirm": "Edit this record? / ይህን መዝገብ ያስተካክሉ?",
  "video.upload.duration_error": "Video too long (max 10 seconds) / ቪዲዮ በጣም ረጅም ነው",
  "notification.buyer_interest": "New buyer interest / አዲስ ገዢ ፍላጎት",
  "reminder.milk_morning": "Time to record morning milk / የጠዋት ወተት መመዝገቢያ ጊዜ",
  "pregnancy.days_remaining": "{{days}} days until delivery / እስከ መውለድ {{days}} ቀናት",
  "market.alert.new_listing": "New listing nearby / አቅራቢያ አዲስ ዝርዝር"
}
```

---

**This design provides a comprehensive, implementable solution for all 7 core feature enhancements while maintaining our platform's principles of simplicity, offline-first architecture, and Ethiopian context awareness.**
