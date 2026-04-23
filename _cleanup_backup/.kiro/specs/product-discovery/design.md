# Ethiopian Livestock Management System - MVP Design

## Overview

This design document outlines the simplified MVP architecture for the Ethiopian Livestock Management System (Ethio Herd Connect) optimized for the 5-day pre-exhibition sprint. The design focuses on 5 core features that work flawlessly rather than 20 features that are partially functional.

### Design Principles

1. **3-Click Philosophy**: Every major action completes in 3 taps maximum
2. **Offline-First**: All features work without connectivity, sync when available
3. **Ethiopian-Focused**: Hardcoded to Ethiopia (+251), Ethiopian calendar, Amharic primary
4. **Minimal Data Entry**: Smart defaults, auto-fill, progressive disclosure
5. **Visual Over Text**: Icons, images, and color-coding over text labels

### Target Users

- **Primary**: Ethiopian farmers with basic smartphones (3+ years old Android)
- **Connectivity**: 2G/3G, often offline during field work
- **Literacy**: Mixed literacy levels, prefer visual interfaces
- **Language**: Amharic primary, English secondary
- **Tech Savvy**: Limited, uses WhatsApp and calls primarily

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React 18 + TypeScript                │
│                         (Vite)                          │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌──────▼──────┐  ┌────────▼────────┐
│  TanStack      │  │   Zustand   │  │  Service Worker │
│  Query         │  │   (State)   │  │  (Offline)      │
│  (Data Sync)   │  │             │  │                 │
└───────┬────────┘  └──────┬──────┘  └────────┬────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Supabase Backend    │
                │  - Auth (Phone OTP)   │
                │  - PostgreSQL         │
                │  - Storage (Photos)   │
                │  - RLS Policies       │
                └───────────────────────┘
```

### Data Flow

```
User Action → Optimistic UI Update → Local Queue → Background Sync → Server
     ↓              ↓                      ↓              ↓            ↓
  Instant      Immediate             Persisted      When Online   Confirmed
  Feedback     Response              Locally        Auto-Retry    Success
```

## Components and Interfaces

### Core Features (MVP)

#### 1. Phone Authentication (Ethiopia Only)

**Flow:**
```
Step 1: Enter phone (auto-prefix +251)
   ↓
Step 2: Receive SMS OTP
   ↓
Step 3: Enter 6-digit code
   ↓
Logged in (30-day session)
```

**Interface:**
```typescript
interface AuthState {
  user: User | null;
  phone: string;
  isAuthenticated: boolean;
  loading: boolean;
}

interface User {
  id: string;
  phone: string;
  created_at: string;
}
```

#### 2. Animal Registration (3-Click)

**Flow:**
```
Click 1: Select Type (🐄 Cattle / 🐐 Goat / 🐑 Sheep)
   ↓
Click 2: Select Subtype (Cow/Bull/Ox/Calf)
   ↓
Click 3: Enter Name → DONE
   ↓
(Optional: Add photo, more details later)
```

**Interface:**
```typescript
interface Animal {
  id: string;
  user_id: string;
  name: string;
  type: 'cattle' | 'goat' | 'sheep';
  subtype: string; // Cow, Bull, Ox, Calf, Male Goat, Female Goat, etc.
  photo_url?: string;
  registration_date: string;
  is_active: boolean;
  created_at: string;
}

// Smart defaults based on subtype
const ANIMAL_FEATURES = {
  'Cow': ['milk_production', 'pregnancy', 'health'],
  'Bull': ['weight', 'health', 'marketplace'],
  'Ox': ['weight', 'health', 'marketplace'],
  'Calf': ['growth', 'health', 'weaning'],
  'Female Goat': ['pregnancy', 'health', 'offspring'],
  'Ewe': ['pregnancy', 'health', 'offspring']
};
```

#### 3. Milk Recording (2-Click)

**Flow:**
```
Click 1: Select Cow (visual cards with photos)
   ↓
Click 2: Enter Amount (quick buttons: 2L, 3L, 5L, Custom)
   ↓
DONE (auto-saves with timestamp)
```

**Interface:**
```typescript
interface MilkRecord {
  id: string;
  user_id: string;
  animal_id: string;
  liters: number; // Only field user enters
  recorded_at: string; // Auto-filled
  session: 'morning' | 'evening'; // Auto-detected from time
}

// Quick action buttons
const QUICK_AMOUNTS = [2, 3, 5, 7, 10]; // liters
```

#### 4. Marketplace - List Animal (3-Click)

**Flow:**
```
Click 1: Select Animal from My Animals
   ↓
Click 2: Enter Price (with "Negotiable" toggle)
   ↓
Click 3: Add Photo (optional) → POST
   ↓
LIVE on marketplace
```

**Interface:**
```typescript
interface MarketListing {
  id: string;
  user_id: string;
  animal_id: string;
  price: number; // Ethiopian Birr
  is_negotiable: boolean;
  location: string; // Auto-filled from user profile
  contact_phone: string; // Auto-filled
  status: 'active' | 'sold' | 'cancelled';
  views_count: number;
  created_at: string;
  updated_at: string;
}

// Derived data from animal
interface ListingDisplay extends MarketListing {
  animal: Animal; // Joined data
  seller_badges: string[]; // Reputation
}
```

#### 5. Marketplace - Browse & Contact

**Flow:**
```
Browse → Filter by Type → View Details → Express Interest
```

**Interface:**
```typescript
interface BuyerInterest {
  id: string;
  listing_id: string;
  buyer_id: string;
  message?: string;
  status: 'pending' | 'contacted' | 'closed';
  created_at: string;
}

// Seller sees interests on their listings
interface InterestNotification {
  listing: MarketListing;
  buyer_phone: string; // For direct contact
  message: string;
  created_at: string;
}
```

### Supporting Features

#### Home Dashboard

**Layout:**
```
┌─────────────────────────────────────┐
│  Welcome, [Name] 👋                 │
│  [Sync Status: ✓ All synced]       │
├─────────────────────────────────────┤
│  QUICK ACTIONS (Large Buttons)     │
│  ┌──────────┐ ┌──────────┐        │
│  │ 🥛 Record│ │ ➕ Add   │        │
│  │   Milk   │ │  Animal  │        │
│  └──────────┘ └──────────┘        │
│  ┌──────────┐ ┌──────────┐        │
│  │ 🐄 My    │ │ 🛒 Market│        │
│  │  Animals │ │   place  │        │
│  └──────────┘ └──────────┘        │
├─────────────────────────────────────┤
│  TODAY'S TASKS (3 max)             │
│  ⚠️ Chaltu - Vaccination due       │
│  📅 Beza - Pregnancy check         │
├─────────────────────────────────────┤
│  QUICK STATS                       │
│  🐄 8 Animals  🥛 45L This Week    │
└─────────────────────────────────────┘
```

#### Animal List (Visual Cards)

**Layout:**
```
┌─────────────────────────────────────┐
│  My Animals (8)          [+ Add]    │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐ │
│  │ [Photo] Chaltu          🐄    │ │
│  │ Cow • Registered 3 months ago │ │
│  │ 🥛 3.5L today  ✓ Healthy     │ │
│  │ [Record Milk] [View Details]  │ │
│  └───────────────────────────────┘ │
│  ┌───────────────────────────────┐ │
│  │ [Photo] Beza            🐄    │ │
│  │ Cow • Pregnant (2 months)     │ │
│  │ 🥛 4.2L today  ✓ Healthy     │ │
│  │ [Record Milk] [View Details]  │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

## Data Models

### Simplified Database Schema

```sql
-- 1. USERS (Supabase Auth)
-- Managed by Supabase, only phone number required

-- 2. ANIMALS (Core entity)
CREATE TABLE animals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'cattle' | 'goat' | 'sheep'
  subtype TEXT NOT NULL, -- 'Cow' | 'Bull' | 'Ox' | 'Calf' | etc.
  photo_url TEXT,
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MILK RECORDS (Simplified)
CREATE TABLE milk_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  liters NUMERIC(5,1) NOT NULL, -- e.g., 3.5
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  session TEXT DEFAULT 'morning' -- 'morning' | 'evening'
);

-- 4. MARKET LISTINGS
CREATE TABLE market_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  is_negotiable BOOLEAN DEFAULT true,
  location TEXT,
  contact_phone TEXT,
  status TEXT DEFAULT 'active',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. BUYER INTERESTS
CREATE TABLE buyer_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES market_listings(id) NOT NULL,
  buyer_id UUID REFERENCES auth.users(id) NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. OFFLINE QUEUE
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT DEFAULT 'pending',
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);
```

### What We Removed

**Deleted Tables:**
- `growth_records` - Can add later
- `health_records` - Can add later
- `health_submissions` - Can add later
- `vaccination_schedules` - Can add later
- `farm_assistants` - Not needed for MVP
- `farm_profiles` - Overcomplicated
- `poultry_groups` - Focus on cattle/goats/sheep first

**Deleted Columns from animals:**
- `breed` - Too complex, farmers don't know
- `birth_date` - Often unknown
- `weight` - Requires scales
- `height` - Not tracked
- `health_status` - Can add later
- `parent_id` - Pedigree not needed
- `color` - Not essential
- `notes` - Can add later
- `estimated_value` - Private
- `acquisition_date` - Not needed
- `gender` - Captured in subtype

**Deleted Columns from milk_records:**
- `quality` - Buyer measures this
- `fat_content` - Requires lab equipment
- `morning_amount` / `evening_amount` - Simplified to single amount

## Error Handling

### User-Friendly Error System

**Principle:** Never show technical errors to farmers.

```typescript
interface ErrorMessage {
  amharic: string;
  english: string;
  icon: string;
  action: {
    label: string;
    handler: () => void;
  };
}

const ERROR_MESSAGES = {
  network: {
    amharic: 'ኢንተርኔት የለም። መረጃው በስልክዎ ተቀምጧል።',
    english: 'No internet. Your data is saved on your phone.',
    icon: '📱',
    action: {
      label: 'OK',
      handler: () => {}
    }
  },
  auth_expired: {
    amharic: 'እባክዎ እንደገና ይግቡ',
    english: 'Please log in again',
    icon: '🔐',
    action: {
      label: 'Login',
      handler: () => navigate('/login')
    }
  },
  photo_too_large: {
    amharic: 'ፎቶው በጣም ትልቅ ነው። እባክዎ ሌላ ይምረጡ።',
    english: 'Photo is too large. Please choose another.',
    icon: '📸',
    action: {
      label: 'Choose Photo',
      handler: () => openPhotoPicker()
    }
  }
};
```

### Offline Handling

```typescript
// Optimistic UI pattern
async function recordMilk(animalId: string, liters: number) {
  // 1. Immediate UI update
  const tempRecord = {
    id: generateTempId(),
    animal_id: animalId,
    liters,
    recorded_at: new Date().toISOString(),
    status: 'pending'
  };
  
  addToLocalState(tempRecord);
  showToast('✓ Milk recorded', 'success');
  
  // 2. Queue for sync
  if (!navigator.onLine) {
    addToOfflineQueue({
      action_type: 'milk_record',
      payload: tempRecord
    });
    return tempRecord;
  }
  
  // 3. Sync immediately if online
  try {
    const saved = await supabase
      .from('milk_records')
      .insert(tempRecord);
    
    updateLocalState(tempRecord.id, saved);
    return saved;
  } catch (error) {
    // Queue for retry
    addToOfflineQueue({
      action_type: 'milk_record',
      payload: tempRecord
    });
    return tempRecord;
  }
}
```

## Testing Strategy

### Manual Testing Checklist (Pre-Exhibition)

**Day 1: Authentication**
- [ ] Phone number input accepts Ethiopian format
- [ ] OTP is received via SMS
- [ ] Login persists for 30 days
- [ ] Logout works correctly

**Day 2: Animal Management**
- [ ] Register cattle (all subtypes)
- [ ] Register goat (male/female)
- [ ] Register sheep (ram/ewe)
- [ ] View animal list
- [ ] View animal details
- [ ] Delete animal

**Day 3: Milk Recording**
- [ ] Record milk for cow
- [ ] Quick amount buttons work
- [ ] Custom amount input works
- [ ] View milk history
- [ ] See daily/weekly totals

**Day 4: Marketplace**
- [ ] Create listing from animal
- [ ] Upload photo
- [ ] Browse listings
- [ ] Filter by type
- [ ] Express interest
- [ ] View interests on my listings
- [ ] Mark as sold

**Day 5: Offline & Polish**
- [ ] Record milk offline
- [ ] Register animal offline
- [ ] Create listing offline
- [ ] Sync when back online
- [ ] All Amharic labels correct
- [ ] All buttons responsive
- [ ] App loads in <3 seconds

### Device Testing

**Test on:**
- [ ] Old Android (Android 8, 2GB RAM)
- [ ] Mid-range Android (Android 11, 4GB RAM)
- [ ] 2G network simulation
- [ ] Airplane mode (offline)
- [ ] Low battery mode

## Performance Targets

### Load Times
- Initial load: <3 seconds on 3G
- Page transitions: <500ms
- Form submissions: Instant (optimistic UI)

### Bundle Size
- Target: <450KB gzipped
- Current: TBD (measure after cleanup)

### Database Queries
- Animal list: <200ms
- Milk records: <300ms
- Marketplace listings: <500ms

### Offline Sync
- Queue processing: <5 seconds per item
- Retry strategy: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- Max retries: 5 attempts

## Security Considerations

### Row Level Security (RLS)

```sql
-- Users can only see their own animals
CREATE POLICY "Users can view own animals"
  ON animals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own animals"
  ON animals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Anyone can view active marketplace listings
CREATE POLICY "Anyone can view active listings"
  ON market_listings FOR SELECT
  USING (status = 'active');

-- Users can only modify their own listings
CREATE POLICY "Users can update own listings"
  ON market_listings FOR UPDATE
  USING (auth.uid() = user_id);
```

### Input Sanitization

```typescript
// Sanitize all user inputs
function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/<script>/gi, '')
    .replace(/javascript:/gi, '')
    .substring(0, 500); // Max length
}

// Validate phone numbers
function validateEthiopianPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 9 && cleaned.startsWith('9');
}

// Validate prices
function validatePrice(price: number): boolean {
  return price > 0 && price < 1000000; // Max 1M Birr
}
```

## Deployment Strategy

### Pre-Exhibition Deployment

**Day 4 Evening:**
1. Deploy to Vercel/Netlify
2. Test on production URL
3. Share with 2-3 test users
4. Fix critical bugs

**Day 5 Morning:**
1. Final deployment
2. QR code for exhibition booth
3. Demo script prepared
4. Backup plan if internet fails at venue

### Post-Exhibition

**Week 1:**
- Gather user feedback
- Fix reported bugs
- Add requested features to backlog

**Week 2-4:**
- Implement top 3 requested features
- Improve based on usage analytics
- Prepare for wider launch

## Future Enhancements (Post-MVP)

### Phase 2 (Month 2)
- Health records (vaccinations, illnesses)
- Weight/growth tracking
- Pregnancy tracking
- Badge system for sellers

### Phase 3 (Month 3)
- Analytics dashboard
- Export reports (PDF)
- Batch operations
- Voice input (Amharic)

### Phase 4 (Month 4+)
- Vet directory
- Feed management
- Financial tracking
- Community features

## Success Metrics

### Exhibition Goals
- 20+ farmers try the app
- 15+ complete animal registration
- 10+ record milk
- 5+ create marketplace listing
- 3+ express interest in buying

### Post-Exhibition (Month 1)
- 100+ registered farmers
- 500+ animals registered
- 1000+ milk records
- 50+ marketplace listings
- 10+ successful sales

### Long-term (Month 6)
- 1000+ active farmers
- 5000+ animals tracked
- 10000+ milk records
- 500+ marketplace transactions
- 4.5+ star rating
