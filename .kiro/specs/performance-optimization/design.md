# Performance Optimization - Design Document

## Overview

This design document outlines the technical approach for optimizing EthioHerd Connect's performance across three critical areas: pagination, bundle size, and database query optimization. The design prioritizes maintaining offline functionality while dramatically improving load times and reducing data usage for farmers in rural Ethiopia with limited connectivity.

### Current Performance Issues

**Identified Problems:**
1. **No Pagination**: `useAnimalsDatabase` fetches ALL animals with `.select('*')` - will timeout with 100+ animals
2. **Unoptimized Queries**: 50+ instances of `.select('*')` across the codebase fetching unnecessary data
3. **Large Bundle Size**: Current build not analyzed, likely exceeding 500KB due to heavy dependencies
4. **No Query Caching**: React Query used but not optimally configured for offline scenarios
5. **No Image Optimization**: Photos loaded at full resolution without lazy loading

### Performance Targets

- Initial page load: < 3 seconds on 3G
- Bundle size: < 500KB gzipped
- Database queries: < 1 second for 95th percentile
- Pagination: < 500ms to load next page
- Support 1000+ animals without degradation

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Application                       │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Pagination │  │    Bundle    │  │    Query     │     │
│  │    Layer     │  │  Optimizer   │  │  Optimizer   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         └──────────────────┴──────────────────┘             │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │  React Query    │                       │
│                   │  Cache Layer    │                       │
│                   └────────┬────────┘                       │
│                            │                                │
│                   ┌────────▼────────┐                       │
│                   │   Supabase      │                       │
│                   │   Client        │                       │
│                   └────────┬────────┘                       │
└────────────────────────────┼────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Supabase      │
                    │   Database      │
                    │  (PostgreSQL)   │
                    └─────────────────┘
```


### Technology Stack

**Existing Technologies (Keep):**
- React 18.3.1 with hooks
- TypeScript 5.5.3
- Vite 5.4.1 (build tool)
- React Query 5.56.2 (data fetching)
- Supabase 2.50.0 (backend)
- Zustand 5.0.8 (state management)

**New Technologies (Add):**
- `react-window` or `react-virtualized` - Virtual scrolling for large lists
- `vite-plugin-compression` - Brotli/Gzip compression
- `rollup-plugin-visualizer` - Bundle analysis
- `sharp` (server-side) or `browser-image-compression` - Image optimization

## Components and Interfaces

### 1. Pagination System

#### 1.1 Paginated Query Hook

**File**: `src/hooks/usePaginatedAnimals.tsx`

```typescript
interface PaginationConfig {
  pageSize: number;
  prefetchPages: number;
}

interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  isFetching: boolean;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
  goToPage: (page: number) => void;
}

export const usePaginatedAnimals = (
  config: PaginationConfig = { pageSize: 30, prefetchPages: 1 }
): PaginatedResult<AnimalData> => {
  // Implementation details in tasks
}
```

**Key Features:**
- Cursor-based pagination for better performance
- Automatic prefetching of next page
- Offline support with cached pages
- Filter/sort state preservation


#### 1.2 Infinite Scroll Component

**File**: `src/components/InfiniteScrollList.tsx`

```typescript
interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number; // Distance from bottom to trigger load
}

export const InfiniteScrollList = <T,>({
  items,
  renderItem,
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 300
}: InfiniteScrollListProps<T>) => {
  // Uses Intersection Observer API
  // Triggers onLoadMore when threshold reached
}
```

#### 1.3 Virtual Scrolling for Large Lists

**File**: `src/components/VirtualizedAnimalList.tsx`

For users with 500+ animals, implement virtual scrolling:

```typescript
import { FixedSizeList } from 'react-window';

interface VirtualizedAnimalListProps {
  animals: AnimalData[];
  itemHeight: number;
  containerHeight: number;
}

export const VirtualizedAnimalList = ({
  animals,
  itemHeight = 120,
  containerHeight = 600
}: VirtualizedAnimalListProps) => {
  // Only renders visible items + buffer
  // Dramatically reduces DOM nodes
}
```

### 2. Bundle Size Optimization

#### 2.1 Code Splitting Strategy

**Current State Analysis:**
- `vite.config.ts` already has some manual chunks configured
- Need to add more granular splitting
- Need to analyze actual bundle sizes

**Optimization Strategy:**

```typescript
// vite.config.ts - Enhanced configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core (loaded immediately)
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          
          // UI (loaded on first interaction)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            // ... other radix components
          ],
          
          // Charts (lazy loaded)
          'vendor-charts': ['recharts'],
          
          // Forms (lazy loaded)
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Feature-based chunks
          'feature-animals': [
            './src/pages/Animals',
            './src/components/EnhancedAnimalCard'
          ],
          'feature-marketplace': [
            './src/pages/Marketplace',
            './src/pages/PublicMarketplace'
          ],
          'feature-analytics': [
            './src/pages/Analytics',
            './src/hooks/useAnalytics'
          ]
        }
      }
    }
  }
});
```


#### 2.2 Lazy Loading Routes

**File**: `src/routes.tsx` (modify existing)

```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Lazy load all route components
const Animals = lazy(() => import('@/pages/Animals'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));
// ... etc

// Wrap with Suspense
const LazyRoute = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);
```

#### 2.3 Dependency Optimization

**Heavy Dependencies to Replace/Optimize:**

1. **Radix UI** (currently 20+ packages)
   - Keep only used components
   - Consider tree-shaking optimization
   - Current size: ~150KB

2. **Recharts** (heavy charting library)
   - Current size: ~200KB
   - Alternative: `chart.js` (~60KB) or `lightweight-charts` (~40KB)
   - Decision: Keep but lazy load

3. **date-fns** (date utilities)
   - Current size: ~70KB
   - Use only needed functions with tree-shaking
   - Alternative: `dayjs` (~2KB)

4. **crypto-js** (encryption)
   - Current size: ~100KB
   - Consider using native Web Crypto API
   - Only load when needed

**Bundle Size Targets:**
- Initial bundle: < 200KB
- Vendor chunks: < 300KB total
- Feature chunks: < 50KB each

### 3. Query Optimization

#### 3.1 Optimized Query Patterns

**Current Problem**: 50+ instances of `.select('*')` fetching all columns

**Solution**: Create typed query builders

**File**: `src/lib/queryBuilders.ts`

```typescript
// Define minimal field sets for different use cases
export const ANIMAL_FIELDS = {
  // For list views - minimal data
  list: 'id, name, type, breed, health_status, photo_url, created_at',
  
  // For detail views - more data
  detail: 'id, name, type, breed, age, weight, health_status, photo_url, last_vaccination, notes, created_at, updated_at',
  
  // For cards - medium data
  card: 'id, name, type, breed, age, weight, health_status, photo_url',
  
  // For counts only
  count: 'id'
};

export const HEALTH_RECORD_FIELDS = {
  list: 'id, record_type, administered_date, medicine_name, severity',
  detail: 'id, record_type, administered_date, medicine_name, severity, notes, photo_url, created_at'
};

// Type-safe query builder
export const buildAnimalQuery = (
  supabase: SupabaseClient,
  userId: string,
  fields: keyof typeof ANIMAL_FIELDS = 'list'
) => {
  return supabase
    .from('animals')
    .select(ANIMAL_FIELDS[fields])
    .eq('user_id', userId);
};
```


#### 3.2 Database Indexes

**Required Indexes** (to be added via Supabase migration):

```sql
-- Animals table indexes
CREATE INDEX IF NOT EXISTS idx_animals_user_id ON animals(user_id);
CREATE INDEX IF NOT EXISTS idx_animals_created_at ON animals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_animals_type ON animals(type);
CREATE INDEX IF NOT EXISTS idx_animals_health_status ON animals(health_status);
CREATE INDEX IF NOT EXISTS idx_animals_user_type ON animals(user_id, type);

-- Health records indexes
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_animal_id ON health_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(administered_date DESC);

-- Growth records indexes
CREATE INDEX IF NOT EXISTS idx_growth_records_user_id ON growth_records(user_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_animal_id ON growth_records(animal_id);
CREATE INDEX IF NOT EXISTS idx_growth_records_date ON growth_records(recorded_date DESC);

-- Market listings indexes
CREATE INDEX IF NOT EXISTS idx_market_listings_user_id ON market_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_market_listings_status ON market_listings(status);
CREATE INDEX IF NOT EXISTS idx_market_listings_created_at ON market_listings(created_at DESC);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_animals_user_status ON animals(user_id, health_status);
CREATE INDEX IF NOT EXISTS idx_listings_status_created ON market_listings(status, created_at DESC);
```

#### 3.3 Query Caching Strategy

**File**: `src/lib/queryClient.ts` (enhance existing)

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Keep in cache for 10 minutes
      cacheTime: 10 * 60 * 1000,
      
      // Retry failed queries
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (but respect staleTime)
      refetchOnWindowFocus: true,
      
      // Don't refetch on mount if data is fresh
      refetchOnMount: false,
      
      // Enable offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once
      retry: 1,
      networkMode: 'offlineFirst',
    }
  }
});

// Prefetch strategies
export const prefetchAnimals = async (userId: string, page: number = 1) => {
  await queryClient.prefetchQuery({
    queryKey: ['animals', userId, page],
    queryFn: () => fetchAnimalsPage(userId, page)
  });
};
```


#### 3.4 Optimized Hook Refactoring

**Example: Refactor `useAnimalsDatabase`**

**Current Implementation** (fetches all data):
```typescript
const { data, error } = await supabase
  .from('animals')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Optimized Implementation**:
```typescript
// For list view
const { data, error } = await supabase
  .from('animals')
  .select('id, name, type, breed, health_status, photo_url, created_at')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })
  .range(start, end); // Pagination

// For detail view (only when needed)
const { data, error } = await supabase
  .from('animals')
  .select('*')
  .eq('id', animalId)
  .eq('user_id', user.id)
  .single();
```

### 4. Image Optimization

#### 4.1 Lazy Loading Images

**File**: `src/components/LazyImage.tsx`

```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

export const LazyImage = ({ src, alt, className, placeholder }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' } // Start loading 50px before visible
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && (
        <div className="skeleton-loader" />
      )}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={isLoaded ? 'fade-in' : 'hidden'}
        />
      )}
    </div>
  );
};
```

#### 4.2 Image Compression

**File**: `src/utils/imageCompression.ts`

```typescript
import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File): Promise<File> => {
  const options = {
    maxSizeMB: 0.5, // 500KB max
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8
  };

  try {
    const compressedFile = await imageCompression(file, options);
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
};
```


### 5. Performance Monitoring

#### 5.1 Performance Metrics Tracker

**File**: `src/utils/performanceMonitor.ts`

```typescript
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

export class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.observeWebVitals();
  }

  private observeWebVitals() {
    // Observe LCP
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      this.reportMetric('LCP', lastEntry.startTime);
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // Observe FID
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.metrics.fid = entry.processingStart - entry.startTime;
        this.reportMetric('FID', this.metrics.fid);
      });
    }).observe({ entryTypes: ['first-input'] });

    // Observe CLS
    new PerformanceObserver((list) => {
      let cls = 0;
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          cls += entry.value;
        }
      });
      this.metrics.cls = cls;
      this.reportMetric('CLS', cls);
    }).observe({ entryTypes: ['layout-shift'] });
  }

  private reportMetric(name: string, value: number) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${value.toFixed(2)}ms`);
    }

    // Send to analytics in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to analytics service
    }

    // Warn if metrics exceed thresholds
    this.checkThresholds(name, value);
  }

  private checkThresholds(name: string, value: number) {
    const thresholds = {
      LCP: 2500, // 2.5s
      FID: 100,  // 100ms
      CLS: 0.1   // 0.1
    };

    if (thresholds[name] && value > thresholds[name]) {
      console.warn(`[Performance Warning] ${name} exceeded threshold: ${value} > ${thresholds[name]}`);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

// Initialize globally
export const performanceMonitor = new PerformanceMonitor();
```

#### 5.2 Query Performance Tracking

**File**: `src/utils/queryPerformanceTracker.ts`

```typescript
export const trackQueryPerformance = (queryKey: string, startTime: number) => {
  const duration = performance.now() - startTime;
  
  if (duration > 1000) {
    console.warn(`[Slow Query] ${queryKey} took ${duration.toFixed(2)}ms`);
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Query Performance] ${queryKey}: ${duration.toFixed(2)}ms`);
  }
  
  return duration;
};

// Usage in hooks
export const usePaginatedAnimals = () => {
  const startTime = performance.now();
  
  const query = useQuery({
    queryKey: ['animals', page],
    queryFn: async () => {
      const data = await fetchAnimals();
      trackQueryPerformance('animals', startTime);
      return data;
    }
  });
  
  return query;
};
```


## Data Models

### Pagination State Model

```typescript
interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface CursorPagination {
  cursor: string | null;
  hasMore: boolean;
  items: any[];
}
```

### Performance Metrics Model

```typescript
interface QueryMetrics {
  queryKey: string;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
}

interface BundleMetrics {
  initialSize: number;
  vendorSize: number;
  featureChunks: Record<string, number>;
  totalSize: number;
}
```

## Error Handling

### Query Error Handling

```typescript
// Centralized error handler for queries
export const handleQueryError = (error: any, queryKey: string) => {
  // Log error
  logger.error(`Query failed: ${queryKey}`, error);
  
  // Check if it's a network error
  if (error.message?.includes('network') || error.message?.includes('fetch')) {
    toast.error('Network error. Please check your connection.');
    return;
  }
  
  // Check if it's a timeout
  if (error.message?.includes('timeout')) {
    toast.error('Request timed out. Please try again.');
    return;
  }
  
  // Generic error
  toast.error('Something went wrong. Please try again.');
};
```

### Pagination Error Handling

```typescript
// Handle pagination errors gracefully
export const usePaginatedAnimals = () => {
  const query = useQuery({
    queryKey: ['animals', page],
    queryFn: fetchAnimals,
    onError: (error) => {
      // Don't clear existing data on error
      // Show error toast but keep showing cached data
      handleQueryError(error, 'animals');
    },
    // Keep previous data while fetching new page
    keepPreviousData: true
  });
  
  return query;
};
```

## Testing Strategy

### Performance Testing

1. **Bundle Size Testing**
   ```bash
   # Analyze bundle after each build
   npm run build
   npx vite-bundle-visualizer
   
   # Fail CI if bundle exceeds 500KB
   ```

2. **Query Performance Testing**
   ```typescript
   // Test query performance with large datasets
   describe('usePaginatedAnimals', () => {
     it('should load 1000 animals in under 3 seconds', async () => {
       const startTime = performance.now();
       const { result } = renderHook(() => usePaginatedAnimals());
       await waitFor(() => expect(result.current.isSuccess).toBe(true));
       const duration = performance.now() - startTime;
       expect(duration).toBeLessThan(3000);
     });
   });
   ```

3. **Pagination Testing**
   ```typescript
   describe('Pagination', () => {
     it('should load next page without refetching previous pages', async () => {
       const { result } = renderHook(() => usePaginatedAnimals());
       await waitFor(() => expect(result.current.data).toHaveLength(30));
       
       act(() => result.current.fetchNextPage());
       await waitFor(() => expect(result.current.data).toHaveLength(60));
       
       // Verify only new page was fetched
       expect(mockFetch).toHaveBeenCalledTimes(2);
     });
   });
   ```


### Load Testing

```typescript
// Simulate 100+ animals
const generateMockAnimals = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `animal-${i}`,
    name: `Animal ${i}`,
    type: 'cattle',
    breed: 'Holstein',
    health_status: 'healthy',
    created_at: new Date().toISOString()
  }));
};

// Test with 1000 animals
describe('Performance with large datasets', () => {
  it('should handle 1000 animals without timeout', async () => {
    const animals = generateMockAnimals(1000);
    // Test pagination, filtering, sorting
  });
});
```

## Implementation Phases

### Phase 1: Query Optimization (Week 1)
**Priority: CRITICAL**

1. Create query builders with specific field selection
2. Add database indexes via migration
3. Refactor all `.select('*')` queries
4. Implement query performance tracking
5. Configure React Query caching

**Expected Impact:**
- 60% reduction in data transferred
- 70% faster query execution
- Support for 500+ animals

### Phase 2: Pagination (Week 1-2)
**Priority: CRITICAL**

1. Implement `usePaginatedAnimals` hook
2. Create infinite scroll component
3. Add pagination to Animals page
4. Implement prefetching
5. Add offline pagination support

**Expected Impact:**
- Initial load time: 3s → 1s
- Support for 1000+ animals
- 80% reduction in initial data load

### Phase 3: Bundle Optimization (Week 2)
**Priority: HIGH**

1. Analyze current bundle size
2. Implement lazy loading for routes
3. Optimize manual chunks in Vite config
4. Replace heavy dependencies
5. Add compression plugins

**Expected Impact:**
- Bundle size: ~800KB → <500KB
- Initial load time: 5s → 2s on 3G
- 40% faster Time to Interactive

### Phase 4: Image Optimization (Week 2-3)
**Priority: MEDIUM**

1. Implement lazy loading for images
2. Add image compression on upload
3. Create responsive image component
4. Implement blur-up loading
5. Add WebP support with fallbacks

**Expected Impact:**
- 70% reduction in image data
- Faster page rendering
- Better mobile experience

### Phase 5: Performance Monitoring (Week 3)
**Priority: MEDIUM**

1. Implement Web Vitals tracking
2. Add query performance monitoring
3. Create performance dashboard
4. Set up alerts for slow queries
5. Add bundle size CI checks

**Expected Impact:**
- Proactive issue detection
- Data-driven optimization
- Prevent performance regressions


## Design Decisions and Rationales

### 1. Cursor-based vs Offset-based Pagination

**Decision**: Use offset-based pagination initially, migrate to cursor-based for scale

**Rationale**:
- Offset-based is simpler to implement with Supabase `.range()`
- Works well for datasets under 10,000 records
- Cursor-based is better for real-time data but more complex
- Can migrate later if needed

### 2. Infinite Scroll vs Traditional Pagination

**Decision**: Implement infinite scroll with optional traditional pagination

**Rationale**:
- Better mobile experience (primary use case)
- Reduces cognitive load for farmers
- Maintains scroll position on navigation
- Traditional pagination as fallback for accessibility

### 3. React Query vs Custom Caching

**Decision**: Enhance existing React Query setup

**Rationale**:
- Already integrated in the codebase
- Excellent offline support
- Built-in caching and prefetching
- Well-maintained and documented

### 4. Virtual Scrolling: When to Use

**Decision**: Only use for lists with 500+ items

**Rationale**:
- Adds complexity and bundle size
- Not needed for typical use cases (50-200 animals)
- Implement as progressive enhancement
- Most farmers won't need it

### 5. Image Compression: Client vs Server

**Decision**: Client-side compression before upload

**Rationale**:
- Reduces bandwidth usage immediately
- Faster uploads on slow connections
- Supabase storage costs reduced
- No server-side processing needed

### 6. Bundle Splitting Strategy

**Decision**: Feature-based splitting with vendor chunks

**Rationale**:
- Aligns with user navigation patterns
- Maximizes code reuse
- Better caching (vendor chunks rarely change)
- Easier to maintain

### 7. Lazy Loading Threshold

**Decision**: Load images 50px before they enter viewport

**Rationale**:
- Feels instant to users
- Prevents blank images during scroll
- Minimal wasted bandwidth
- Good balance for slow connections

## Migration Strategy

### Backward Compatibility

All optimizations must maintain backward compatibility:

1. **Pagination**: Existing components continue to work
2. **Query Changes**: Hooks maintain same interface
3. **Bundle Changes**: No breaking changes to imports
4. **Image Loading**: Graceful degradation for old browsers

### Rollout Plan

1. **Week 1**: Deploy query optimizations (low risk)
2. **Week 2**: Deploy pagination (test with beta users)
3. **Week 2**: Deploy bundle optimizations (monitor errors)
4. **Week 3**: Deploy image optimizations
5. **Week 3**: Enable performance monitoring

### Rollback Strategy

Each phase can be rolled back independently:

```typescript
// Feature flags for gradual rollout
export const FEATURE_FLAGS = {
  USE_PAGINATION: true,
  USE_LAZY_IMAGES: true,
  USE_VIRTUAL_SCROLL: false, // Disabled by default
  ENABLE_PERFORMANCE_MONITORING: true
};
```

## Success Metrics

### Technical Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Initial Bundle Size | ~800KB | <500KB | Webpack analyzer |
| Initial Load Time (3G) | ~8s | <3s | Lighthouse |
| Query Time (100 animals) | ~2s | <500ms | Performance API |
| Time to Interactive | ~10s | <5s | Lighthouse |
| Largest Contentful Paint | ~4s | <2.5s | Web Vitals |
| First Input Delay | ~200ms | <100ms | Web Vitals |

### User Experience Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bounce rate reduction | 30% | Analytics |
| Page load satisfaction | >80% | User surveys |
| Scroll smoothness | 60fps | Performance monitoring |
| Offline functionality | 100% | Testing |

### Business Metrics

| Metric | Target | Impact |
|--------|--------|--------|
| Support tickets (slow app) | -50% | Reduced complaints |
| User retention | +20% | Better experience |
| Data costs | -40% | Optimized queries |
| Server costs | -30% | Fewer resources |

## Risks and Mitigations

### Risk 1: Pagination Breaks Offline Mode

**Mitigation**:
- Cache all fetched pages locally
- Implement smart prefetching
- Test extensively offline
- Provide clear offline indicators

### Risk 2: Bundle Splitting Increases Requests

**Mitigation**:
- Use HTTP/2 multiplexing
- Implement aggressive prefetching
- Monitor actual load times
- Adjust chunk strategy based on data

### Risk 3: Query Optimization Misses Edge Cases

**Mitigation**:
- Comprehensive testing with various data sizes
- Monitor query errors in production
- Gradual rollout with feature flags
- Easy rollback mechanism

### Risk 4: Image Compression Reduces Quality

**Mitigation**:
- Test compression settings thoroughly
- Allow users to view original
- Provide quality slider in settings
- Monitor user feedback

## Conclusion

This design provides a comprehensive approach to optimizing EthioHerd Connect's performance across pagination, bundle size, and query optimization. The phased implementation allows for gradual rollout with minimal risk, while the monitoring strategy ensures we can measure impact and catch regressions early.

The optimizations are specifically tailored for the Ethiopian rural context with slow networks and limited devices, ensuring the application remains fast and responsive even under challenging conditions.

**Next Steps**: Proceed to implementation tasks document for detailed step-by-step execution plan.
