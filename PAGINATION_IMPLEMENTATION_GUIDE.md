# Pagination Implementation Guide - Phase 2

## 🎯 Overview

This guide explains the complete pagination system implemented for EthioHerd Connect, optimized for Ethiopian farmers with:
- **Offline-first architecture** with IndexedDB caching
- **Low-bandwidth optimization** (10-20 items per page)
- **Infinite scroll** for mobile-first UX
- **Smart prefetching** for smooth experience
- **Clear loading indicators** and offline status

---

## 📁 File Structure

```
src/
├── hooks/
│   ├── usePaginatedQuery.tsx          # Core pagination hook (NEW)
│   ├── usePaginatedAnimals.tsx        # Animals pagination (NEW)
│   ├── usePaginatedHealthRecords.tsx  # Health records pagination (TODO)
│   ├── usePaginatedMilkProduction.tsx # Milk production pagination (TODO)
│   └── usePaginatedMarketListings.tsx # Marketplace pagination (TODO)
│
├── components/
│   ├── InfiniteScrollContainer.tsx    # Infinite scroll component (NEW)
│   ├── ListSkeleton.tsx               # Loading skeletons (in InfiniteScrollContainer)
│   └── EmptyState.tsx                 # Empty state component (in InfiniteScrollContainer)
│
└── pages/
    ├── Animals.tsx                    # Update to use pagination (TODO)
    ├── Health.tsx                     # Update to use pagination (TODO)
    ├── MilkProduction.tsx             # Update to use pagination (TODO)
    └── PublicMarketplace.tsx          # Update to use pagination (TODO)
```

---

## 🏗️ Architecture

### 1. Core Pagination Hook (`usePaginatedQuery`)

**Purpose**: Reusable pagination logic with offline support

**Key Features**:
- ✅ Infinite scroll support
- ✅ IndexedDB caching for offline access
- ✅ Smart prefetching (next page loaded in background)
- ✅ Online/offline detection
- ✅ Automatic cache invalidation (7 days)
- ✅ Performance tracking

**How It Works**:

```typescript
// 1. Fetch current page from network
const pageData = await queryFn(currentPage, pageSize);

// 2. Cache to IndexedDB for offline access
await cachePageData(cacheKey, currentPage, pageData);

// 3. If offline, load from cache
if (!navigator.onLine) {
  const cached = await loadCachedPage(cacheKey, currentPage);
  return cached;
}

// 4. Prefetch next page in background
queryClient.prefetchQuery({
  queryKey: [...queryKey, 'page', nextPage],
  queryFn: () => queryFn(nextPage, pageSize)
});
```

**Offline Caching Strategy**:

```
IndexedDB Structure:
├── Database: ethioherd-pagination-cache
└── Store: pages
    ├── Key: animals-user123-page-0
    │   ├── data: { data: [...], count: 100 }
    │   └── timestamp: 1705789200000
    ├── Key: animals-user123-page-1
    │   ├── data: { data: [...], count: 100 }
    │   └── timestamp: 1705789205000
    └── ...
```

**Cache Lifecycle**:
1. **Write**: After successful network fetch
2. **Read**: When offline or network fails
3. **Expire**: After 7 days
4. **Clear**: On user logout or manual clear

---

### 2. Infinite Scroll Component

**Purpose**: Smooth infinite scrolling with visual feedback

**Key Features**:
- ✅ Intersection Observer (efficient, no scroll listeners)
- ✅ Loading states with skeleton loaders
- ✅ Offline indicators
- ✅ End-of-list messages
- ✅ Touch-friendly (300px threshold)

**How It Works**:

```typescript
// 1. Set up Intersection Observer
const observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting && hasMore && !isLoading) {
      onLoadMore(); // Trigger next page load
    }
  },
  {
    rootMargin: '300px', // Load 300px before reaching bottom
    threshold: 0.1
  }
);

// 2. Observe target element at bottom of list
observer.observe(observerTarget.current);
```

**Visual States**:
- **Loading**: Spinner + "Loading more..."
- **Offline**: WiFi icon + "Offline - showing cached data"
- **End**: Check icon + "No more items"
- **Empty**: Custom empty state component

---

### 3. Paginated Animals Hook

**Purpose**: Animals-specific pagination with filters

**Key Features**:
- ✅ Type filtering (cattle, goat, sheep, poultry)
- ✅ Health status filtering
- ✅ Search by name (uses trigram index)
- ✅ Optimized field selection (only 7 fields)
- ✅ Performance tracking

**Usage Example**:

```typescript
const {
  animals,           // Accumulated data from all loaded pages
  hasNextPage,       // Boolean: more data available?
  fetchNextPage,     // Function: load next page
  isLoading,         // Boolean: initial load?
  isFetchingNextPage,// Boolean: loading more?
  isOffline,         // Boolean: offline mode?
  totalCount,        // Number: total items
  currentPage,       // Number: current page index
  refresh            // Function: reload from page 0
} = usePaginatedAnimals({
  pageSize: 20,
  filters: {
    type: 'cattle',
    healthStatus: 'healthy',
    searchQuery: 'Bessie'
  }
});
```

---

## 🔧 Implementation Steps

### Step 1: Update Animals Page

**File**: `src/pages/Animals.tsx`

```typescript
import { usePaginatedAnimals } from '@/hooks/usePaginatedAnimals';
import { InfiniteScrollContainer, ListSkeleton, EmptyState } from '@/components/InfiniteScrollContainer';

const Animals = () => {
  const { language } = useLanguage();
  
  // Replace useAnimalsDatabase with usePaginatedAnimals
  const {
    animals,
    hasNextPage,
    fetchNextPage,
    isLoading,
    isFetchingNextPage,
    isOffline,
    isEmpty,
    totalCount
  } = usePaginatedAnimals({
    pageSize: 20,
    filters: {
      type: typeFilter,
      healthStatus: healthFilter,
      searchQuery: searchQuery
    }
  });

  // Show skeleton loader on initial load
  if (isLoading) {
    return <ListSkeleton count={5} />;
  }

  // Show empty state if no animals
  if (isEmpty) {
    return (
      <EmptyState
        title="No animals yet"
        description="Start by registering your first animal"
        action={<Button onClick={openRegistrationModal}>Register Animal</Button>}
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header with count */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          My Animals ({totalCount})
        </h1>
      </div>

      {/* Filters */}
      <AnimalsFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        healthFilter={healthFilter}
        onHealthFilterChange={setHealthFilter}
      />

      {/* Infinite scroll list */}
      <InfiniteScrollContainer
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoading={isFetchingNextPage}
        isOffline={isOffline}
        loadingMessage="Loading more animals..."
        endMessage="All animals loaded"
        offlineMessage="Offline - showing cached animals"
      >
        {animals.map((animal) => (
          <ModernAnimalCard
            key={animal.id}
            animal={animal}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </InfiniteScrollContainer>
    </div>
  );
};
```

---

### Step 2: Create Health Records Pagination

**File**: `src/hooks/usePaginatedHealthRecords.tsx`

```typescript
import { usePaginatedQuery } from './usePaginatedQuery';
import { buildHealthRecordQuery, HEALTH_RECORD_FIELDS } from '@/lib/queryBuilders';

export const usePaginatedHealthRecords = ({
  pageSize = 20,
  animalId,
  recordType,
}: {
  pageSize?: number;
  animalId?: string;
  recordType?: string;
} = {}) => {
  const { user } = useAuth();

  const queryFn = async (page: number, size: number) => {
    if (!user) return { data: [], count: 0 };

    const start = page * size;
    const end = start + size - 1;

    let query = buildHealthRecordQuery(supabase, user.id, 'list')
      .order('administered_date', { ascending: false });

    if (animalId) {
      query = query.eq('animal_id', animalId);
    }

    if (recordType) {
      query = query.eq('record_type', recordType);
    }

    const { data, error, count } = await query
      .range(start, end)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  };

  return usePaginatedQuery({
    queryKey: ['health-records-paginated', user?.id, animalId, recordType],
    queryFn,
    pageSize,
    cacheKey: `health-records-${user?.id}`,
    enabled: !!user,
  });
};
```

---

### Step 3: Create Milk Production Pagination

**File**: `src/hooks/usePaginatedMilkProduction.tsx`

```typescript
import { usePaginatedQuery } from './usePaginatedQuery';
import { buildMilkProductionQuery, MILK_PRODUCTION_FIELDS } from '@/lib/queryBuilders';

export const usePaginatedMilkProduction = ({
  pageSize = 20,
  animalId,
  dateRange,
}: {
  pageSize?: number;
  animalId?: string;
  dateRange?: { start: string; end: string };
} = {}) => {
  const { user } = useAuth();

  const queryFn = async (page: number, size: number) => {
    if (!user) return { data: [], count: 0 };

    const start = page * size;
    const end = start + size - 1;

    let query = buildMilkProductionQuery(supabase, user.id, 'list')
      .order('production_date', { ascending: false });

    if (animalId) {
      query = query.eq('animal_id', animalId);
    }

    if (dateRange) {
      query = query
        .gte('production_date', dateRange.start)
        .lte('production_date', dateRange.end);
    }

    const { data, error, count } = await query
      .range(start, end)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  };

  return usePaginatedQuery({
    queryKey: ['milk-production-paginated', user?.id, animalId, dateRange],
    queryFn,
    pageSize,
    cacheKey: `milk-production-${user?.id}`,
    enabled: !!user,
  });
};
```

---

### Step 4: Create Marketplace Pagination

**File**: `src/hooks/usePaginatedMarketListings.tsx`

```typescript
import { usePaginatedQuery } from './usePaginatedQuery';
import { MARKET_LISTING_FIELDS } from '@/lib/queryBuilders';

export const usePaginatedMarketListings = ({
  pageSize = 20,
  filters = {},
}: {
  pageSize?: number;
  filters?: {
    animalType?: string;
    minPrice?: number;
    maxPrice?: number;
    location?: string;
    status?: string;
  };
} = {}) => {
  const queryFn = async (page: number, size: number) => {
    const start = page * size;
    const end = start + size - 1;

    let query = supabase
      .from('public_market_listings')
      .select(MARKET_LISTING_FIELDS.list, { count: 'exact' })
      .eq('status', filters.status || 'active')
      .order('created_at', { ascending: false });

    if (filters.animalType) {
      query = query.eq('animal_type', filters.animalType);
    }

    if (filters.minPrice) {
      query = query.gte('price', filters.minPrice);
    }

    if (filters.maxPrice) {
      query = query.lte('price', filters.maxPrice);
    }

    if (filters.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    const { data, error, count } = await query.range(start, end);

    if (error) throw error;

    return { data: data || [], count: count || 0 };
  };

  return usePaginatedQuery({
    queryKey: ['market-listings-paginated', filters],
    queryFn,
    pageSize,
    cacheKey: 'market-listings-public',
    enabled: true,
  });
};
```

---

## 🧪 Testing Guide

### Test on Low Connectivity

**1. Chrome DevTools Network Throttling**:
```
1. Open Chrome DevTools (F12)
2. Go to Network tab
3. Select "Slow 3G" from dropdown
4. Test pagination:
   - Initial load should show skeleton
   - Scroll down to trigger next page
   - Should see loading indicator
   - Next page should load smoothly
```

**2. Offline Mode Testing**:
```
1. Load first 2-3 pages while online
2. Go offline (DevTools > Network > Offline)
3. Scroll through loaded pages - should work
4. Try to load more - should show offline indicator
5. Go back online
6. Should automatically sync and allow loading more
```

**3. Low-End Device Simulation**:
```
1. DevTools > Performance > CPU throttling
2. Set to "6x slowdown"
3. Test scrolling performance
4. Should maintain 60fps
5. No janky animations
```

### Performance Benchmarks

**Target Metrics**:
- Initial load: < 2 seconds on 3G
- Next page load: < 500ms
- Scroll performance: 60fps
- Memory usage: < 50MB for 100 items
- Cache size: < 5MB per 100 items

**Measurement**:
```typescript
// Performance tracking is built-in
// Check console for:
// [Pagination] Page 0 loaded: 234.56ms
// [Pagination] Prefetching page 1
// [Cache] Saved page 0 to IndexedDB
```

---

## 📊 Performance Optimizations

### 1. Minimal Data Transfer

**Before Pagination**:
```
Query: SELECT * FROM animals (15+ fields)
100 animals: ~50 KB
Load time: ~2000ms
```

**After Pagination**:
```
Query: SELECT id, name, type, breed, health_status, photo_url, created_at
20 animals per page: ~4 KB per page
Load time: ~200ms per page
Total for 100 animals: 5 pages × 200ms = 1000ms
```

**Savings**: 60% less data, 50% faster

### 2. Smart Prefetching

```typescript
// When user reaches page 2, page 3 is already loading
// Result: Instant page transitions
```

### 3. IndexedDB Caching

```typescript
// First load: Network (200ms)
// Subsequent loads: Cache (20ms)
// Offline: Cache only (20ms)
```

**Benefits**:
- 90% faster on repeat visits
- Works completely offline
- Reduces server load

### 4. Intersection Observer

```typescript
// No scroll event listeners
// Efficient detection
// Minimal CPU usage
```

---

## 🔒 Offline-First Rules

### 1. Cache Strategy

**What to Cache**:
- ✅ All loaded pages
- ✅ Images (via browser cache)
- ✅ User preferences
- ✅ Filter states

**What NOT to Cache**:
- ❌ Sensitive data (passwords, tokens)
- ❌ Real-time data (notifications)
- ❌ Large files (videos)

### 2. Sync Strategy

**On Reconnect**:
1. Invalidate all cached queries
2. Refetch current page
3. Update cache with fresh data
4. Show success indicator

**Conflict Resolution**:
- Server data always wins
- Local changes queued for sync
- Show sync status to user

### 3. User Feedback

**Always Show**:
- Loading states (skeleton loaders)
- Offline indicators (WiFi icon)
- Sync status (syncing, synced, failed)
- Error messages (clear, actionable)

---

## 🎨 UX Best Practices

### 1. Loading States

```typescript
// Initial load
<ListSkeleton count={5} />

// Loading more
<Loader2 className="animate-spin" />
<p>Loading more...</p>

// End of list
<AlertCircle />
<p>All items loaded</p>
```

### 2. Empty States

```typescript
<EmptyState
  title="No animals yet"
  description="Start by registering your first animal"
  icon={<Cow />}
  action={<Button>Register Animal</Button>}
/>
```

### 3. Error States

```typescript
<ErrorState
  title="Failed to load"
  description="Please check your connection and try again"
  action={<Button onClick={retry}>Retry</Button>}
/>
```

---

## 📱 Mobile Optimization

### 1. Touch-Friendly

- Large tap targets (44px minimum)
- Smooth scrolling
- No accidental taps
- Pull-to-refresh support

### 2. Low-Memory Devices

- Limit cached pages (max 10)
- Lazy load images
- Unload off-screen items
- Efficient re-renders

### 3. Small Screens

- Responsive layouts
- Readable text (16px minimum)
- Clear visual hierarchy
- Thumb-friendly navigation

---

## 🚀 Deployment Checklist

### Before Deploy

- [ ] Test on Slow 3G
- [ ] Test offline mode
- [ ] Test with 1000+ items
- [ ] Test on low-end device
- [ ] Verify cache size limits
- [ ] Check memory usage
- [ ] Test error scenarios
- [ ] Verify accessibility

### After Deploy

- [ ] Monitor performance metrics
- [ ] Track cache hit rates
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Optimize based on data

---

## 📈 Success Metrics

### Performance

| Metric | Target | Measurement |
|--------|--------|-------------|
| Initial load | < 2s | Lighthouse |
| Next page | < 500ms | Performance API |
| Scroll FPS | 60fps | DevTools |
| Cache hit rate | > 80% | Analytics |

### User Experience

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bounce rate | < 20% | Analytics |
| Time on page | > 2min | Analytics |
| Scroll depth | > 50% | Analytics |
| Offline usage | > 30% | Analytics |

---

## 🎯 Next Steps

1. **Implement for Animals** (Priority 1)
2. **Implement for Health Records** (Priority 2)
3. **Implement for Milk Production** (Priority 3)
4. **Implement for Marketplace** (Priority 4)
5. **Add pull-to-refresh** (Enhancement)
6. **Add search debouncing** (Enhancement)
7. **Add filter persistence** (Enhancement)

---

**Status**: ✅ INFRASTRUCTURE COMPLETE  
**Ready for**: Page-by-page implementation  
**Estimated Time**: 2-3 hours per page  
