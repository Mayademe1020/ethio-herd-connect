# Design Document: Exhibition Readiness Sprint

## Overview

This design document outlines the technical approach for making Ethio Herd Connect exhibition-ready within a 20-24 hour sprint. The focus is on demo infrastructure, testing, and production deployment rather than new features.

**Key Principles:**
- Pragmatic over perfect
- Demo-ready over feature-complete
- Automated over manual
- Tested over untested

---

## Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Exhibition Layer                         │
├─────────────────────────────────────────────────────────────┤
│  Demo Mode    │  Analytics    │  Testing     │  Monitoring  │
│  Toggle       │  Tracking     │  Suite       │  & Alerts    │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Existing MVP Core                        │
├─────────────────────────────────────────────────────────────┤
│  Auth  │  Animals  │  Milk  │  Marketplace  │  Offline     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                     Infrastructure                           │
├─────────────────────────────────────────────────────────────┤
│  Supabase  │  Storage  │  IndexedDB  │  Service Worker     │
└─────────────────────────────────────────────────────────────┘
```

---

## Components and Interfaces

### 1. Demo Data Seeding System

**Location:** `scripts/seed-demo-data.ts`

```typescript
interface DemoAccount {
  phone: string;
  farmer_name: string;
  farm_name: string;
  location: string;
}

interface DemoDataConfig {
  accounts: DemoAccount[];
  animalsPerAccount: number;
  milkRecordsPerAnimal: number;
  listingsCount: number;
}

class DemoDataSeeder {
  async seed(config: DemoDataConfig): Promise<void>
  async reset(): Promise<void>
  async verify(): Promise<boolean>
}
```

**Demo Accounts:**
```typescript
const DEMO_ACCOUNTS = [
  {
    phone: '+251911234567',
    farmer_name: 'Abebe Kebede',
    farm_name: 'Abebe Farm',
    location: 'Bahir Dar, Amhara'
  },
  {
    phone: '+251922345678',
    farmer_name: 'Chaltu Tadesse',
    farm_name: 'Chaltu Dairy',
    location: 'Addis Ababa'
  },
  {
    phone: '+251933456789',
    farmer_name: 'Dawit Haile',
    farm_name: 'Haile Ranch',
    location: 'Hawassa, SNNPR'
  }
];
```

**Animal Distribution:**
- Account 1: 4 cows, 2 bulls, 1 calf
- Account 2: 3 cows, 2 goats (1 male, 1 female)
- Account 3: 2 cows, 3 sheep (2 ewes, 1 ram), 2 goats

**Milk Records Pattern:**
- Last 7 days
- 2 sessions per day (morning: 6-8 AM, evening: 5-7 PM)
- Realistic amounts: 2-8 liters per session
- Slight variation day-to-day

---

### 2. Demo Mode System

**Location:** `src/contexts/DemoModeContext.tsx`

```typescript
interface DemoModeContextType {
  isDemoMode: boolean;
  toggleDemoMode: () => void;
  getDemoData: (type: DemoDataType) => any;
}

type DemoDataType = 
  | 'animal_name'
  | 'milk_amount'
  | 'listing_price'
  | 'location'
  | 'phone';

const DEMO_DATA = {
  animal_names: ['Chaltu', 'Beza', 'Abebe', 'Tigist', 'Kebede'],
  milk_amounts: [3, 5, 7],
  listing_prices: [15000, 25000, 35000],
  locations: ['Bahir Dar', 'Addis Ababa', 'Hawassa'],
  phones: ['+251911111111', '+251922222222']
};
```

**UI Indicator:**
```tsx
// Top-right corner indicator
{isDemoMode && (
  <div className="fixed top-4 right-4 z-50 bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
    🎬 DEMO MODE
  </div>
)}
```

**Keyboard Shortcut:**
```typescript
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      toggleDemoMode();
    }
  };
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

### 3. Analytics System

**Location:** `src/lib/analytics.ts`

```typescript
interface AnalyticsEvent {
  event_name: string;
  user_id?: string;
  timestamp: string;
  properties: Record<string, any>;
}

class Analytics {
  track(eventName: string, properties?: Record<string, any>): void
  page(pageName: string): void
  identify(userId: string, traits?: Record<string, any>): void
  flush(): Promise<void> // Send queued events
}

// Events to track
const EVENTS = {
  ANIMAL_REGISTERED: 'animal_registered',
  MILK_RECORDED: 'milk_recorded',
  LISTING_CREATED: 'listing_created',
  LISTING_VIEWED: 'listing_viewed',
  INTEREST_EXPRESSED: 'interest_expressed',
  OFFLINE_ACTION_QUEUED: 'offline_action_queued',
  OFFLINE_ACTION_SYNCED: 'offline_action_synced'
};
```

**Implementation Options:**
1. **Google Analytics 4** (Free, easy setup)
2. **Plausible** (Privacy-focused, lightweight)
3. **Custom Supabase Table** (Full control, no external dependencies)

**Recommended:** Custom Supabase table for exhibition (full control, no external dependencies)

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_name ON analytics_events(event_name);
```

---

### 4. Photo Compression Optimization

**Location:** `src/utils/imageCompression.ts` (update existing)

```typescript
interface CompressionOptions {
  maxSizeKB: number;      // Target: 100KB
  maxWidth: number;       // 1200px
  maxHeight: number;      // 1200px
  quality: number;        // Starting quality: 0.9
  minQuality: number;     // Minimum quality: 0.3
  onProgress?: (progress: number) => void;
}

async function compressImage(
  file: File,
  options: CompressionOptions
): Promise<{
  blob: Blob;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}> {
  // Iterative compression with quality reduction
  // Show progress at each iteration
  // Return detailed metrics
}
```

**Progress UI:**
```tsx
<div className="space-y-2">
  <div className="flex justify-between text-sm">
    <span>Compressing...</span>
    <span>{progress}%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
    <div 
      className="bg-blue-500 h-2 rounded-full transition-all"
      style={{ width: `${progress}%` }}
    />
  </div>
  <div className="text-xs text-gray-500">
    {originalSize}KB → {currentSize}KB
  </div>
</div>
```

---

### 5. Testing Infrastructure

**Location:** `src/__tests__/exhibition-readiness/`

```
src/__tests__/exhibition-readiness/
├── demo-mode.test.ts
├── analytics.test.ts
├── compression.test.ts
├── stress-test.test.ts
└── integration.test.ts
```

**Test Structure:**
```typescript
describe('Exhibition Readiness', () => {
  describe('Demo Mode', () => {
    it('should toggle demo mode with keyboard shortcut');
    it('should pre-fill forms in demo mode');
    it('should use placeholder images in demo mode');
  });

  describe('Analytics', () => {
    it('should track animal registration');
    it('should track milk recording');
    it('should queue events when offline');
  });

  describe('Stress Testing', () => {
    it('should handle 100 rapid clicks');
    it('should handle 20 photo uploads');
    it('should handle 50 tab switches');
  });
});
```

---

### 6. Production Deployment Pipeline

**Location:** `.github/workflows/deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

**Monitoring Setup:**
- **Sentry** for error tracking
- **UptimeRobot** for uptime monitoring
- **Vercel Analytics** for performance metrics

---

## Data Models

### Analytics Event Model

```typescript
interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id?: string;
  session_id: string;
  properties: {
    animal_type?: string;
    milk_amount?: number;
    listing_price?: number;
    is_demo_mode?: boolean;
    [key: string]: any;
  };
  created_at: string;
}
```

### Demo Mode State

```typescript
interface DemoModeState {
  enabled: boolean;
  lastToggled: string;
  sessionCount: number;
  prefilledForms: number;
}
```

---

## Error Handling

### Demo Mode Errors

```typescript
try {
  await seedDemoData();
} catch (error) {
  toast.error('Demo data seeding failed', {
    description: 'Please check console for details'
  });
  console.error('Seeding error:', error);
}
```

### Analytics Errors

```typescript
try {
  analytics.track('event_name', properties);
} catch (error) {
  // Fail silently - don't block user actions
  console.warn('Analytics tracking failed:', error);
}
```

### Compression Errors

```typescript
try {
  const compressed = await compressImage(file, options);
} catch (error) {
  toast.error('Photo compression failed', {
    description: 'Try a different photo or reduce size'
  });
  // Allow user to proceed without photo
}
```

---

## Testing Strategy

### Unit Tests
- Demo mode toggle logic
- Analytics event formatting
- Compression algorithm
- Data seeding functions

### Integration Tests
- Complete animal registration flow
- Complete milk recording flow
- Complete marketplace listing flow
- Offline queue with analytics

### Stress Tests
- 100 rapid button clicks
- 20 sequential photo uploads
- 50 tab switches
- 6-hour session (memory leak check)
- 10 airplane mode toggles

### Device Tests
- Low-end Android (<2GB RAM)
- Mid-range Android (2-4GB RAM)
- iOS device
- 3+ year old phone
- Multiple browsers (Chrome, Firefox, Safari, Samsung Internet)

---

## Performance Considerations

### Photo Compression
- Target: <2 seconds for 5MB photo
- Progressive quality reduction
- Web Worker for non-blocking compression (future enhancement)

### Analytics
- Batch events (send every 10 events or 30 seconds)
- Queue when offline
- Minimal payload size

### Demo Mode
- Instant form pre-fill (no API calls)
- Cached placeholder images
- Reduced animation durations

---

## Security Considerations

### Demo Accounts
- Use test phone numbers (not real)
- Clear separation from production data
- Easy to identify and filter in analytics

### Analytics
- Anonymize user IDs
- No PII in event properties
- Respect user privacy settings

### Deployment
- Environment variables for secrets
- Automated security scanning
- SSL/TLS enforcement

---

## Deployment Strategy

### Pre-Deployment Checklist
1. All tests passing
2. Demo data seeded
3. Analytics configured
4. Monitoring enabled
5. Backup verified
6. Rollback plan ready

### Deployment Steps
1. Run test suite
2. Build production bundle
3. Deploy to staging
4. Smoke test on staging
5. Deploy to production
6. Verify production health
7. Monitor for 30 minutes

### Rollback Plan
1. Detect issue (monitoring alerts)
2. Trigger rollback (one command)
3. Verify previous version working
4. Investigate issue
5. Fix and redeploy

---

## Exhibition Day Procedures

### Pre-Demo Setup (15 minutes before)
1. Verify internet connection
2. Load demo accounts
3. Enable demo mode
4. Test one complete flow
5. Clear browser cache
6. Prepare backup device

### During Demo
1. Use demo mode for speed
2. Show offline mode capability
3. Switch languages mid-demo
4. Highlight speed (2-tap milk recording)
5. Show analytics dashboard

### Post-Demo Reset (2 minutes)
1. Run reset script
2. Verify data cleared
3. Re-seed demo data
4. Test one flow
5. Ready for next demo

---

## Success Metrics

### Technical Metrics
- Test coverage: >60%
- Build time: <3 minutes
- Deployment time: <5 minutes
- Page load time: <2 seconds
- Photo compression: <2 seconds

### Demo Metrics
- Demo setup time: <15 minutes
- Demo reset time: <2 minutes
- Demo flow completion: <5 minutes
- Zero crashes during demos
- Smooth offline demonstration

### Production Metrics
- Uptime: >99.9%
- Error rate: <0.1%
- Response time: <500ms (p95)
- Successful deployments: 100%

