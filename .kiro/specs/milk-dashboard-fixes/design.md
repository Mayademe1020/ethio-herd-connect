# Design Document: Milk Dashboard Fixes

## Overview

This design document outlines the technical approach to fix critical bugs in the milk dashboard and summary feature. The primary issues are incorrect table names (`milk_records` vs `milk_production`) and column names (`amount` vs `liters`) that cause all database queries to fail silently.

## Architecture

### Current Architecture (Broken)
```
HomeScreen.tsx → React Query → Supabase Client → milk_records table (❌ doesn't exist)
                                                → amount column (❌ doesn't exist)
                                                → Returns: []
                                                → UI shows: 0 L
```

### Fixed Architecture
```
HomeScreen.tsx → React Query → Supabase Client → milk_production table (✅ exists)
                                                → liters column (✅ exists)
                                                → Returns: actual data
                                                → UI shows: real values
```

## Components and Interfaces

### 1. TypeScript Interfaces

#### MilkProduction Interface
```typescript
// src/types/milk.ts (NEW FILE)
export interface MilkProduction {
  id: string;
  user_id: string;
  animal_id: string;
  liters: number;
  session: 'morning' | 'evening';
  recorded_at: string;
  created_at: string;
}

export interface DailyMilkStats {
  today_liters: number;
  yesterday_liters: number;
}

export interface MilkSummaryRecord {
  date: string;
  animal_name: string;
  liters: number;
  session: 'morning' | 'evening';
}

export interface MilkSummaryStats {
  totalLiters: number;
  totalRecords: number;
  uniqueAnimals: number;
}
```

### 2. Database Query Functions

#### Centralized Milk Queries
```typescript
// src/lib/milkQueries.ts (NEW FILE)
import { supabase } from '@/integrations/supabase/client';
import { MilkProduction, DailyMilkStats, MilkSummaryRecord } from '@/types/milk';

export const milkQueries = {
  // Get daily stats (today and yesterday)
  async getDailyStats(userId: string): Promise<DailyMilkStats> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Get today's milk
    const { data: todayData, error: todayError } = await supabase
      .from('milk_production')
      .select('liters')
      .eq('user_id', userId)
      .gte('recorded_at', `${todayStr}T00:00:00.000Z`)
      .lt('recorded_at', `${todayStr}T23:59:59.999Z`);

    if (todayError) throw todayError;

    // Get yesterday's milk
    const { data: yesterdayData, error: yesterdayError } = await supabase
      .from('milk_production')
      .select('liters')
      .eq('user_id', userId)
      .gte('recorded_at', `${yesterdayStr}T00:00:00.000Z`)
      .lt('recorded_at', `${yesterdayStr}T23:59:59.999Z`);

    if (yesterdayError) throw yesterdayError;

    const todayTotal = (todayData || []).reduce((sum, record) => sum + (record.liters || 0), 0);
    const yesterdayTotal = (yesterdayData || []).reduce((sum, record) => sum + (record.liters || 0), 0);

    return {
      today_liters: todayTotal,
      yesterday_liters: yesterdayTotal
    };
  },

  // Get monthly summary
  async getMonthlySummary(userId: string, monthStart: Date, monthEnd: Date): Promise<MilkSummaryRecord[]> {
    const { data, error } = await supabase
      .from('milk_production')
      .select(`
        recorded_at,
        liters,
        session,
        animals!inner(name)
      `)
      .eq('user_id', userId)
      .gte('recorded_at', monthStart.toISOString())
      .lte('recorded_at', monthEnd.toISOString())
      .order('recorded_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((record: any) => ({
      date: new Date(record.recorded_at).toISOString().split('T')[0],
      animal_name: record.animals?.name || 'Unknown Animal',
      liters: record.liters || 0,
      session: record.session || 'morning'
    }));
  },

  // Get animal milk records (last 7 days)
  async getAnimalMilkRecords(animalId: string): Promise<MilkProduction[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from('milk_production')
      .select('id, liters, recorded_at, session, created_at, user_id, animal_id')
      .eq('animal_id', animalId)
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return data || [];
  }
};
```

### 3. Error Handling Utilities

```typescript
// src/lib/errorHandling.ts (UPDATE)
import { toast } from 'sonner';

export const handleMilkQueryError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // User-friendly error messages
  if (error.message?.includes('network')) {
    toast.error('Unable to load milk data. Please check your connection.');
  } else if (error.message?.includes('permission')) {
    toast.error('You don\'t have permission to view this data.');
  } else {
    toast.error('Failed to load milk data. Please try again.');
  }
};
```

### 4. Component Updates

#### HomeScreen.tsx Changes
```typescript
// BEFORE (Broken)
const { data: dailyMilkStats, isLoading: dailyLoading } = useQuery({
  queryKey: ['daily-milk-stats', user?.id],
  queryFn: async () => {
    // ... queries milk_records with amount column
  }
});

// AFTER (Fixed)
import { milkQueries } from '@/lib/milkQueries';
import { handleMilkQueryError } from '@/lib/errorHandling';

const { data: dailyMilkStats, isLoading: dailyLoading, error: dailyError } = useQuery({
  queryKey: ['daily-milk-stats', user?.id],
  queryFn: async () => {
    if (!user) return { today_liters: 0, yesterday_liters: 0 };
    return await milkQueries.getDailyStats(user.id);
  },
  enabled: !!user,
  onError: (error) => handleMilkQueryError(error, 'daily milk stats')
});
```

#### MilkSummary.tsx Changes
```typescript
// BEFORE (Broken)
const { data, error } = await supabase
  .from('milk_records' as any)
  .select(`...`)

// AFTER (Fixed)
import { milkQueries } from '@/lib/milkQueries';
import { MilkSummaryRecord } from '@/types/milk';

const { data: milkRecords = [], isLoading, error } = useQuery({
  queryKey: ['milk-summary', user?.id, currentMonth.getMonth(), currentMonth.getFullYear()],
  queryFn: async () => {
    if (!user) return [];
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return await milkQueries.getMonthlySummary(user.id, monthStart, monthEnd);
  },
  enabled: !!user,
  onError: (error) => handleMilkQueryError(error, 'milk summary')
});
```

#### AnimalDetail.tsx Changes
```typescript
// BEFORE (Broken)
const { data, error } = await supabase
  .from('milk_records' as any)
  .select('id, amount, recorded_at, session, created_at')

// AFTER (Fixed)
import { milkQueries } from '@/lib/milkQueries';
import { MilkProduction } from '@/types/milk';

const { data: milkRecords = [], isLoading, error } = useQuery({
  queryKey: ['milk-records', id],
  queryFn: async () => {
    if (!user || !id) return [];
    return await milkQueries.getAnimalMilkRecords(id);
  },
  enabled: !!user && !!id && canProduceMilk,
  onError: (error) => handleMilkQueryError(error, 'animal milk records')
});
```

## Data Models

### Database Schema (Already Correct)
```sql
-- milk_production table (from migration 20251023000000_mvp_schema_cleanup.sql)
CREATE TABLE milk_production (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  animal_id UUID REFERENCES animals(id) NOT NULL,
  liters NUMERIC(5,1) NOT NULL DEFAULT 0,
  session TEXT DEFAULT 'morning',
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes (already exist)
CREATE INDEX idx_milk_user_id ON milk_production(user_id);
CREATE INDEX idx_milk_animal_id ON milk_production(animal_id);
CREATE INDEX idx_milk_recorded_at ON milk_production(recorded_at DESC);
CREATE INDEX idx_milk_user_date ON milk_production(user_id, recorded_at DESC);
```

### Type Definitions
```typescript
// Supabase generated types (src/integrations/supabase/types.ts)
export interface Database {
  public: {
    Tables: {
      milk_production: {
        Row: {
          id: string;
          user_id: string;
          animal_id: string;
          liters: number;
          session: string;
          recorded_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          animal_id: string;
          liters: number;
          session?: string;
          recorded_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          animal_id?: string;
          liters?: number;
          session?: string;
          recorded_at?: string;
          created_at?: string;
        };
      };
    };
  };
}
```

## Error Handling

### Error Scenarios and Responses

| Scenario | Detection | User Message | Developer Action |
|----------|-----------|--------------|------------------|
| Table not found | Supabase error | "Unable to load milk data" | Log full error |
| Network failure | Network error | "Check your connection" | Retry button |
| Permission denied | RLS error | "Permission denied" | Check auth |
| No data | Empty array | Empty state UI | Show guidance |
| Invalid date range | Validation | "Invalid date range" | Reset to defaults |
| CSV export fails | Export error | "Export failed" | Log error, retry |

### Error Handling Pattern
```typescript
try {
  const data = await milkQueries.getDailyStats(userId);
  return data;
} catch (error) {
  handleMilkQueryError(error, 'daily stats');
  return { today_liters: 0, yesterday_liters: 0 };
}
```

## Testing Strategy

### Unit Tests
```typescript
// src/lib/__tests__/milkQueries.test.ts
describe('milkQueries', () => {
  it('should fetch daily stats with correct table name', async () => {
    const stats = await milkQueries.getDailyStats('user-123');
    expect(stats).toHaveProperty('today_liters');
    expect(stats).toHaveProperty('yesterday_liters');
  });

  it('should handle errors gracefully', async () => {
    // Mock Supabase error
    const stats = await milkQueries.getDailyStats('invalid-user');
    expect(stats.today_liters).toBe(0);
  });
});
```

### Integration Tests
```typescript
// src/__tests__/milk-dashboard.integration.test.tsx
describe('Milk Dashboard Integration', () => {
  it('should display real milk data from database', async () => {
    // Seed test data
    await seedMilkProduction();
    
    // Render dashboard
    render(<HomeScreen />);
    
    // Verify data appears
    await waitFor(() => {
      expect(screen.getByText(/Today:/)).toBeInTheDocument();
      expect(screen.queryByText('0 L')).not.toBeInTheDocument();
    });
  });
});
```

### E2E Tests
```typescript
// e2e/milk-production.spec.ts
test('milk production flow', async ({ page }) => {
  // Login
  await page.goto('/auth');
  await login(page);
  
  // Record milk
  await page.goto('/record-milk');
  await page.fill('[name="liters"]', '15');
  await page.click('button:has-text("Save")');
  
  // Verify on dashboard
  await page.goto('/');
  await expect(page.locator('text=15 L')).toBeVisible();
  
  // Verify in summary
  await page.goto('/milk-summary');
  await expect(page.locator('text=15L')).toBeVisible();
  
  // Export CSV
  await page.click('button:has-text("Download")');
  // Verify download
});
```

## UI/UX Improvements

### Loading States
```typescript
// Skeleton loader for dashboard cards
{dailyLoading ? (
  <div className="animate-pulse">
    <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
    <div className="h-12 bg-gray-200 rounded w-16"></div>
  </div>
) : (
  <p className="text-2xl font-bold">{dailyMilkStats?.today_liters || 0}L</p>
)}
```

### Empty States
```typescript
// Empty state with guidance
{milkRecords.length === 0 && (
  <div className="text-center py-8">
    <Droplets className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-semibold mb-2">
      No milk records yet
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      Start tracking your daily milk production
    </p>
    <Button onClick={() => navigate('/record-milk')}>
      Record First Milk Production
    </Button>
  </div>
)}
```

### Error States
```typescript
// Error state with retry
{error && (
  <div className="text-center py-8">
    <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
    <h3 className="text-lg font-semibold mb-2">
      Failed to load milk data
    </h3>
    <p className="text-sm text-gray-600 mb-4">
      {error.message || 'Please try again'}
    </p>
    <Button onClick={() => refetch()}>
      Retry
    </Button>
  </div>
)}
```

## Performance Considerations

### Query Optimization
- ✅ Use indexes on `user_id`, `animal_id`, `recorded_at`
- ✅ Limit queries to relevant date ranges (7 days, 30 days)
- ✅ Use pagination for large result sets
- ✅ Cache results with React Query (5 minute stale time)

### Bundle Size
- ✅ Lazy load MilkSummary page
- ✅ Use tree-shaking for date utilities
- ✅ Minimize CSV export library size

## Security Considerations

### Row Level Security (RLS)
```sql
-- Already implemented in migration 20251023000001_mvp_rls_policies.sql
CREATE POLICY "Users can view own milk production"
  ON milk_production FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milk production"
  ON milk_production FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Data Validation
```typescript
// Validate before insert
const validateMilkProduction = (data: any) => {
  if (!data.liters || data.liters < 0) {
    throw new Error('Invalid liters value');
  }
  if (!['morning', 'evening'].includes(data.session)) {
    throw new Error('Invalid session');
  }
  return true;
};
```

## Migration Path

### Step 1: Add New Files
1. Create `src/types/milk.ts`
2. Create `src/lib/milkQueries.ts`
3. Update `src/lib/errorHandling.ts`

### Step 2: Update Components
1. Update `src/components/HomeScreen.tsx`
2. Update `src/pages/MilkSummary.tsx`
3. Update `src/pages/AnimalDetail.tsx`

### Step 3: Remove Debug Code
1. Remove debug box from HomeScreen.tsx
2. Remove console.logs from production code

### Step 4: Add Tests
1. Add unit tests for milkQueries
2. Add integration tests for components
3. Add E2E tests for user flows

### Step 5: Verify
1. Test with real database
2. Test CSV export
3. Test error scenarios
4. Test on mobile device

## Rollback Plan

If issues arise after deployment:
1. Revert to previous version (feature flag off)
2. Show static "0 L" with "Coming Soon" message
3. Fix issues in development
4. Redeploy with fixes

## Success Metrics

- ✅ Dashboard shows real milk data (not 0 L)
- ✅ Yesterday/Today totals are accurate
- ✅ CSV export contains actual records
- ✅ No TypeScript errors
- ✅ No runtime errors in console
- ✅ Loading states work correctly
- ✅ Error messages are user-friendly
- ✅ All tests pass
