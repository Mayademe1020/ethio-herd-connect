# Performance Optimization - Implementation Tasks

## Overview

This implementation plan breaks down the performance optimization work into discrete, manageable tasks. Each task builds incrementally and can be tested independently. The plan prioritizes query optimization and pagination (critical issues) before bundle optimization and monitoring.

**Total Estimated Time:** 2-3 weeks
**Priority:** CRITICAL

---

## Phase 1: Query Optimization (Days 1-3)

### - [ ] 1. Create Query Builder Utilities

Create centralized query builders with specific field selection to replace `.select('*')` queries.

**Steps:**
1. Create `src/lib/queryBuilders.ts`
2. Define field sets for different use cases (list, detail, card)
3. Create type-safe query builder functions
4. Add JSDoc documentation

**Files to Create:**
- `src/lib/queryBuilders.ts`

**Code Structure:**
```typescript
export const ANIMAL_FIELDS = {
  list: 'id, name, type, breed, health_status, photo_url, created_at',
  detail: 'id, name, type, breed, age, weight, health_status, photo_url, last_vaccination, notes, created_at, updated_at',
  card: 'id, name, type, breed, age, weight, health_status, photo_url'
};

export const buildAnimalQuery = (supabase, userId, fields = 'list') => {
  return supabase.from('animals').select(ANIMAL_FIELDS[fields]).eq('user_id', userId);
};
```

**Verification:**
```bash
npm run build
# Should compile without errors
```

_Requirements: 3.1, 3.2_

---

### - [ ] 1.1 Add Database Indexes

Create Supabase migration to add indexes for frequently queried fields.

**Steps:**
1. Create new migration file in `supabase/migrations/`
2. Add indexes for animals, health_records, growth_records, market_listings
3. Test migration locally
4. Apply to production

**Files to Create:**
- `supabase/migrations/[timestamp]_add_performance_indexes.sql`

**Migration Content:**
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
```

**Verification:**
```bash
# Test locally
supabase db reset

# Check indexes created
supabase db inspect
```

_Requirements: 3.3_

---


### - [ ] 1.2 Refactor useAnimalsDatabase Hook

Optimize the animals hook to use specific field selection and support pagination.

**Steps:**
1. Import query builders
2. Replace `.select('*')` with specific fields
3. Add pagination support with `.range()`
4. Update return types
5. Test with existing components

**Files to Modify:**
- `src/hooks/useAnimalsDatabase.tsx`

**Key Changes:**
```typescript
// BEFORE
const { data, error } = await supabase
  .from('animals')
  .select('*')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });

// AFTER
import { ANIMAL_FIELDS } from '@/lib/queryBuilders';

const { data, error } = await supabase
  .from('animals')
  .select(ANIMAL_FIELDS.list)
  .eq('user_id', user.id)
  .order('created_at', { ascending: false });
```

**Verification:**
```bash
npm run dev
# Navigate to Animals page
# Verify animals load correctly
# Check network tab - should see smaller payload
```

_Requirements: 3.1, 3.2_

---

### - [ ] 1.3 Refactor useDashboardStats Hook

Optimize dashboard queries to fetch only needed data and use COUNT queries.

**Steps:**
1. Replace `.select('*')` with specific fields
2. Use COUNT queries instead of fetching all records
3. Optimize milk production query
4. Test dashboard loads faster

**Files to Modify:**
- `src/hooks/useDashboardStats.tsx`

**Key Changes:**
```typescript
// BEFORE - Fetches all animals
const { data, error } = await supabase
  .from('animals')
  .select('*')
  .eq('user_id', user.id);

// AFTER - Only count
const { count, error } = await supabase
  .from('animals')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', user.id);

// For health status breakdown - only fetch needed fields
const { data, error } = await supabase
  .from('animals')
  .select('id, health_status')
  .eq('user_id', user.id);
```

**Verification:**
```bash
npm run dev
# Navigate to Dashboard
# Verify stats load correctly
# Check network tab - should see much smaller payload
```

_Requirements: 3.1, 3.2, 3.7_

---

### - [ ] 1.4 Refactor useGrowthRecords Hook

Optimize growth records queries with specific field selection.

**Steps:**
1. Add field definitions to query builders
2. Replace `.select('*')` with specific fields
3. Add optional animal_id filter for detail views
4. Test growth tracking page

**Files to Modify:**
- `src/hooks/useGrowthRecords.tsx`
- `src/lib/queryBuilders.ts` (add GROWTH_RECORD_FIELDS)

**Key Changes:**
```typescript
// In queryBuilders.ts
export const GROWTH_RECORD_FIELDS = {
  list: 'id, animal_id, weight, recorded_date, notes',
  detail: 'id, animal_id, weight, height, recorded_date, notes, created_at'
};

// In useGrowthRecords.tsx
const { data, error } = await supabase
  .from('growth_records')
  .select(GROWTH_RECORD_FIELDS.list)
  .eq('user_id', user.id)
  .order('recorded_date', { ascending: false });
```

**Verification:**
```bash
npm run dev
# Navigate to Growth page
# Verify records load correctly
# Add new growth record - should work
```

_Requirements: 3.1, 3.2_

---

### - [ ] 1.5 Refactor useAnalytics Hook

Optimize analytics queries - this hook has 6 separate `.select('*')` queries.

**Steps:**
1. Add field definitions for all analytics queries
2. Replace all `.select('*')` with specific fields
3. Consider combining queries where possible
4. Test analytics page

**Files to Modify:**
- `src/hooks/useAnalytics.tsx`
- `src/lib/queryBuilders.ts`

**Key Changes:**
```typescript
// Animals query - only need type and health_status for analytics
const { data, error } = await supabase
  .from('animals')
  .select('id, type, health_status, created_at')
  .eq('user_id', user.id);

// Milk production - only need amounts and dates
const { data, error } = await supabase
  .from('milk_production')
  .select('id, amount, production_date')
  .eq('user_id', user.id)
  .order('production_date', { ascending: false });
```

**Verification:**
```bash
npm run dev
# Navigate to Analytics page
# Verify all charts render correctly
# Check network tab - should see smaller payloads
```

_Requirements: 3.1, 3.2_

---

### - [ ] 1.6 Optimize Remaining Hooks

Refactor all remaining hooks with `.select('*')` queries.

**Hooks to Optimize:**
- `src/hooks/useMilkProduction.tsx`
- `src/hooks/useNotifications.tsx`
- `src/hooks/useFinancialRecords.tsx`
- `src/hooks/useFarmAssistants.tsx`
- `src/hooks/useSecurePublicMarketplace.tsx`
- `src/hooks/usePublicMarketplace.tsx`

**Pattern to Follow:**
1. Identify what fields are actually used in UI
2. Add field definitions to queryBuilders.ts
3. Replace `.select('*')` with specific fields
4. Test the feature works correctly

**Verification:**
```bash
# Test each feature
npm run dev
# Navigate to each page and verify functionality
```

_Requirements: 3.1, 3.2_

---

### - [ ] 1.7 Enhance React Query Configuration

Optimize React Query caching for better performance and offline support.

**Steps:**
1. Update `src/lib/queryClient.ts` (or create if doesn't exist)
2. Configure optimal cache times
3. Enable offline-first mode
4. Add prefetch utilities
5. Test caching behavior

**Files to Modify/Create:**
- `src/lib/queryClient.ts`

**Configuration:**
```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      networkMode: 'offlineFirst',
    }
  }
});
```

**Verification:**
```bash
npm run dev
# Navigate between pages - should use cached data
# Go offline - should still show cached data
# Come back online - should refetch stale data
```

_Requirements: 3.5_

---


## Phase 2: Pagination Implementation (Days 4-6)

### - [ ] 2. Create Paginated Animals Hook

Create a new hook that implements pagination for the animals list.

**Steps:**
1. Create `src/hooks/usePaginatedAnimals.tsx`
2. Implement offset-based pagination with `.range()`
3. Add infinite scroll support
4. Implement prefetching for next page
5. Add filter/sort support

**Files to Create:**
- `src/hooks/usePaginatedAnimals.tsx`

**Hook Interface:**
```typescript
interface UsePaginatedAnimalsOptions {
  pageSize?: number;
  filters?: {
    type?: string;
    healthStatus?: string;
    searchQuery?: string;
  };
}

interface PaginatedAnimalsResult {
  animals: AnimalData[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  isLoading: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
  refetch: () => void;
}

export const usePaginatedAnimals = (
  options: UsePaginatedAnimalsOptions = {}
): PaginatedAnimalsResult => {
  // Implementation
}
```

**Key Features:**
- Use React Query's `useInfiniteQuery`
- Implement `.range(start, end)` for pagination
- Cache each page separately
- Support filters and search

**Verification:**
```bash
npm run build
# Should compile without errors
```

_Requirements: 1.1, 1.2, 1.5_

---

### - [ ] 2.1 Create Infinite Scroll Component

Create a reusable infinite scroll component using Intersection Observer.

**Steps:**
1. Create `src/components/InfiniteScrollList.tsx`
2. Implement Intersection Observer for scroll detection
3. Add loading states
4. Add error handling
5. Make it generic/reusable

**Files to Create:**
- `src/components/InfiniteScrollList.tsx`

**Component Interface:**
```typescript
interface InfiniteScrollListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  loader?: React.ReactNode;
}
```

**Features:**
- Trigger load 300px before bottom
- Show loading spinner
- Handle errors gracefully
- Prevent multiple simultaneous loads

**Verification:**
```bash
npm run dev
# Test component in isolation if possible
```

_Requirements: 1.2, 1.3_

---

### - [ ] 2.2 Update Animals Page with Pagination

Integrate pagination into the Animals page.

**Steps:**
1. Replace `useAnimalsDatabase` with `usePaginatedAnimals`
2. Update `AnimalsListView` to use `InfiniteScrollList`
3. Maintain filter/search functionality
4. Test with various data sizes
5. Ensure offline mode still works

**Files to Modify:**
- `src/pages/Animals.tsx`
- `src/components/AnimalsListView.tsx`

**Key Changes:**
```typescript
// In Animals.tsx
// BEFORE
const { animals, isLoading } = useAnimalStore();

// AFTER
const {
  animals,
  hasNextPage,
  fetchNextPage,
  isLoading,
  isFetchingNextPage
} = usePaginatedAnimals({
  pageSize: 30,
  filters: { type: typeFilter, healthStatus: healthFilter, searchQuery }
});

// In AnimalsListView.tsx
<InfiniteScrollList
  items={animals}
  renderItem={(animal) => <ModernAnimalCard animal={animal} />}
  onLoadMore={fetchNextPage}
  hasMore={hasNextPage}
  isLoading={isFetchingNextPage}
/>
```

**Verification:**
```bash
npm run dev
# Navigate to Animals page
# Scroll down - should load more animals
# Test with filters - should work
# Test offline - should show cached animals
```

_Requirements: 1.1, 1.2, 1.5, 1.7_

---

### - [ ] 2.3 Implement Page Prefetching

Add intelligent prefetching to load next page before user reaches bottom.

**Steps:**
1. Update `usePaginatedAnimals` to prefetch next page
2. Use React Query's `prefetchQuery`
3. Only prefetch when online
4. Respect user's data saver preferences

**Files to Modify:**
- `src/hooks/usePaginatedAnimals.tsx`

**Implementation:**
```typescript
// Prefetch next page when current page loads
useEffect(() => {
  if (hasNextPage && !isFetchingNextPage && navigator.onLine) {
    queryClient.prefetchQuery({
      queryKey: ['animals', userId, currentPage + 1],
      queryFn: () => fetchAnimalsPage(userId, currentPage + 1)
    });
  }
}, [currentPage, hasNextPage]);
```

**Verification:**
```bash
npm run dev
# Navigate to Animals page
# Check network tab - should see prefetch requests
# Scroll down - next page should load instantly
```

_Requirements: 1.5, 6.1, 6.2_

---

### - [ ] 2.4 Add Pagination to Other List Views

Apply pagination to other pages with large lists.

**Pages to Update:**
- Health Records page (if has list view)
- Growth Records page
- Market Listings page
- Milk Production records

**Steps for Each:**
1. Create paginated hook (e.g., `usePaginatedHealthRecords`)
2. Update page component
3. Test functionality
4. Verify offline support

**Pattern:**
```typescript
// Create hook
export const usePaginatedHealthRecords = (options) => {
  return useInfiniteQuery({
    queryKey: ['health-records', userId, options],
    queryFn: ({ pageParam = 0 }) => fetchHealthRecordsPage(pageParam),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    }
  });
};

// Use in component
const { data, fetchNextPage, hasNextPage } = usePaginatedHealthRecords();
```

**Verification:**
```bash
npm run dev
# Test each page with pagination
# Verify smooth scrolling and loading
```

_Requirements: 1.1, 1.2_

---


## Phase 3: Bundle Size Optimization (Days 7-9)

### - [ ] 3. Analyze Current Bundle Size

Use bundle analyzer to understand current bundle composition.

**Steps:**
1. Install `rollup-plugin-visualizer`
2. Add to Vite config
3. Build and analyze
4. Document findings
5. Identify optimization opportunities

**Commands:**
```bash
npm install --save-dev rollup-plugin-visualizer

# Add to vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ]
});

# Build and analyze
npm run build
# Opens stats.html in browser
```

**Document Findings:**
- Total bundle size
- Largest dependencies
- Duplicate code
- Optimization opportunities

**Verification:**
- Create `BUNDLE_ANALYSIS.md` with findings
- Identify top 10 largest dependencies
- Set optimization priorities

_Requirements: 2.4, 2.5_

---

### - [ ] 3.1 Implement Route-Based Code Splitting

Lazy load all route components to reduce initial bundle size.

**Steps:**
1. Update `src/routes.tsx`
2. Convert all route imports to `lazy()`
3. Add Suspense boundaries
4. Create loading component
5. Test all routes load correctly

**Files to Modify:**
- `src/routes.tsx`
- Create `src/components/LoadingSpinner.tsx` (if doesn't exist)

**Implementation:**
```typescript
import { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// BEFORE
import Animals from '@/pages/Animals';
import Analytics from '@/pages/Analytics';
import Marketplace from '@/pages/Marketplace';

// AFTER
const Animals = lazy(() => import('@/pages/Animals'));
const Analytics = lazy(() => import('@/pages/Analytics'));
const Marketplace = lazy(() => import('@/pages/Marketplace'));

// Wrap routes with Suspense
const LazyRoute = ({ component: Component }) => (
  <Suspense fallback={<LoadingSpinner />}>
    <Component />
  </Suspense>
);
```

**Verification:**
```bash
npm run build
# Check bundle - should see separate chunks for each route
npm run dev
# Navigate between pages - should lazy load
# Check network tab - should see chunk loading
```

_Requirements: 2.2, 2.3_

---

### - [ ] 3.2 Optimize Vite Manual Chunks

Enhance the existing manual chunks configuration in `vite.config.ts`.

**Steps:**
1. Review current manual chunks
2. Add more granular splitting
3. Group Radix UI components
4. Separate heavy libraries (recharts, date-fns)
5. Test bundle sizes

**Files to Modify:**
- `vite.config.ts`

**Enhanced Configuration:**
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core - loaded immediately
          'vendor-core': ['react', 'react-dom', 'react-router-dom'],
          
          // Data layer
          'vendor-data': ['@tanstack/react-query', '@supabase/supabase-js'],
          
          // State management
          'vendor-state': ['zustand'],
          
          // UI library - lazy loaded
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-popover',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast'
          ],
          
          // Charts - lazy loaded
          'vendor-charts': ['recharts'],
          
          // Forms - lazy loaded
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          
          // Date utilities
          'vendor-date': ['date-fns'],
          
          // Icons
          'vendor-icons': ['lucide-react']
        }
      }
    }
  }
});
```

**Verification:**
```bash
npm run build
# Check dist/assets/ - should see organized chunks
# Verify total size < 500KB
```

_Requirements: 2.1, 2.4_

---

### - [ ] 3.3 Add Compression Plugins

Add Brotli and Gzip compression to reduce bundle size.

**Steps:**
1. Install `vite-plugin-compression`
2. Add to Vite config
3. Configure for both Brotli and Gzip
4. Build and verify compressed sizes
5. Update server to serve compressed files

**Commands:**
```bash
npm install --save-dev vite-plugin-compression
```

**Files to Modify:**
- `vite.config.ts`

**Configuration:**
```typescript
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Brotli compression (better compression)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false
    }),
    // Gzip compression (wider browser support)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false
    })
  ]
});
```

**Verification:**
```bash
npm run build
# Check dist/assets/ - should see .br and .gz files
# Verify sizes are significantly smaller
```

_Requirements: 2.7_

---

### - [ ] 3.4 Optimize Dependencies

Replace or optimize heavy dependencies.

**Steps:**
1. Review bundle analysis findings
2. Identify replaceable dependencies
3. Implement tree-shaking where possible
4. Consider lighter alternatives
5. Test functionality after changes

**Potential Optimizations:**

1. **date-fns** → Use only needed functions
```typescript
// BEFORE
import * as dateFns from 'date-fns';

// AFTER
import { format, parseISO, differenceInDays } from 'date-fns';
```

2. **crypto-js** → Use Web Crypto API
```typescript
// BEFORE
import CryptoJS from 'crypto-js';

// AFTER
const crypto = window.crypto || window.msCrypto;
```

3. **Radix UI** → Only import used components
```typescript
// Verify only needed components are imported
// Remove unused Radix packages from package.json
```

**Verification:**
```bash
npm run build
# Compare bundle size before/after
# Test all features still work
```

_Requirements: 2.5_

---

### - [ ] 3.5 Implement Bundle Size CI Check

Add CI check to prevent bundle size regressions.

**Steps:**
1. Create bundle size check script
2. Add to package.json scripts
3. Configure size limits
4. Add to CI pipeline (if exists)
5. Document process

**Files to Create:**
- `scripts/check-bundle-size.js`

**Script:**
```javascript
const fs = require('fs');
const path = require('path');

const MAX_BUNDLE_SIZE = 500 * 1024; // 500KB in bytes
const distPath = path.join(__dirname, '../dist/assets');

const files = fs.readdirSync(distPath);
const jsFiles = files.filter(f => f.endsWith('.js'));

let totalSize = 0;
jsFiles.forEach(file => {
  const stats = fs.statSync(path.join(distPath, file));
  totalSize += stats.size;
});

console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);

if (totalSize > MAX_BUNDLE_SIZE) {
  console.error(`❌ Bundle size exceeds limit: ${(totalSize / 1024).toFixed(2)}KB > ${(MAX_BUNDLE_SIZE / 1024).toFixed(2)}KB`);
  process.exit(1);
} else {
  console.log(`✅ Bundle size within limit`);
}
```

**Add to package.json:**
```json
{
  "scripts": {
    "check-bundle-size": "node scripts/check-bundle-size.js"
  }
}
```

**Verification:**
```bash
npm run build
npm run check-bundle-size
# Should pass if bundle < 500KB
```

_Requirements: 4.5_

---


## Phase 4: Image Optimization (Days 10-11)

### - [ ] 4. Create Lazy Loading Image Component

Create a reusable image component with lazy loading and skeleton loader.

**Steps:**
1. Create `src/components/LazyImage.tsx`
2. Implement Intersection Observer
3. Add skeleton loader
4. Add fade-in animation
5. Handle loading errors

**Files to Create:**
- `src/components/LazyImage.tsx`

**Component:**
```typescript
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export const LazyImage = ({
  src,
  alt,
  className,
  placeholder = '/placeholder.svg'
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={className}>
      {!isLoaded && !error && (
        <div className="skeleton-loader animate-pulse bg-gray-200" />
      )}
      {isInView && (
        <img
          src={error ? placeholder : src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={isLoaded ? 'fade-in' : 'hidden'}
        />
      )}
    </div>
  );
};
```

**Add CSS:**
```css
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.skeleton-loader {
  width: 100%;
  height: 100%;
  min-height: 200px;
}
```

**Verification:**
```bash
npm run dev
# Test component loads images lazily
# Scroll down - images should load as they come into view
```

_Requirements: 5.1, 5.5_

---

### - [ ] 4.1 Add Image Compression Utility

Create utility to compress images before upload.

**Steps:**
1. Install `browser-image-compression`
2. Create `src/utils/imageCompression.ts`
3. Add compression function
4. Configure compression settings
5. Test with various image sizes

**Commands:**
```bash
npm install browser-image-compression
```

**Files to Create:**
- `src/utils/imageCompression.ts`

**Implementation:**
```typescript
import imageCompression from 'browser-image-compression';

interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  initialQuality?: number;
}

export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 0.5, // 500KB
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8,
    ...options
  };

  try {
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log(
      `Compressed: ${(file.size / 1024).toFixed(2)}KB → ${(compressedFile.size / 1024).toFixed(2)}KB`
    );
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    return file; // Return original if compression fails
  }
};

// Helper to check if compression is needed
export const shouldCompressImage = (file: File): boolean => {
  const maxSize = 500 * 1024; // 500KB
  return file.size > maxSize;
};
```

**Verification:**
```bash
npm run build
# Should compile without errors
```

_Requirements: 5.2, 5.4_

---

### - [ ] 4.2 Integrate Image Compression in Upload Forms

Add image compression to all photo upload forms.

**Steps:**
1. Update animal registration form
2. Update health record form
3. Update marketplace listing form
4. Show compression progress
5. Test upload flow

**Files to Modify:**
- `src/components/AnimalRegistrationForm.tsx`
- `src/components/IllnessReportModal.tsx`
- `src/components/ProfessionalMarketplace.tsx`

**Pattern:**
```typescript
import { compressImage, shouldCompressImage } from '@/utils/imageCompression';

const handleImageUpload = async (file: File) => {
  let fileToUpload = file;
  
  if (shouldCompressImage(file)) {
    toast.info('Compressing image...');
    fileToUpload = await compressImage(file);
    toast.success('Image compressed successfully');
  }
  
  // Continue with upload
  const { data, error } = await supabase.storage
    .from('animal-photos')
    .upload(`${userId}/${fileToUpload.name}`, fileToUpload);
};
```

**Verification:**
```bash
npm run dev
# Upload large image (>500KB)
# Should see compression toast
# Verify uploaded image is smaller
# Check Supabase storage - file should be compressed
```

_Requirements: 5.2_

---

### - [ ] 4.3 Replace Image Tags with LazyImage Component

Replace all `<img>` tags with the new `LazyImage` component.

**Steps:**
1. Find all image usages
2. Replace with `LazyImage`
3. Test each page
4. Verify lazy loading works
5. Check performance improvement

**Files to Modify:**
- `src/components/ModernAnimalCard.tsx`
- `src/components/ProfessionalMarketplace.tsx`
- `src/pages/Animals.tsx`
- Any other components with images

**Pattern:**
```typescript
// BEFORE
<img src={animal.photo_url} alt={animal.name} className="..." />

// AFTER
import { LazyImage } from '@/components/LazyImage';

<LazyImage
  src={animal.photo_url}
  alt={animal.name}
  className="..."
  placeholder="/placeholder.svg"
/>
```

**Verification:**
```bash
npm run dev
# Navigate to pages with images
# Scroll down - images should load lazily
# Check network tab - images load only when visible
```

_Requirements: 5.1, 5.6_

---

### - [ ]* 4.4 Add WebP Support with Fallbacks

Implement WebP image format with JPEG fallbacks for better compression.

**Steps:**
1. Update image compression to support WebP
2. Add fallback logic for unsupported browsers
3. Update LazyImage component
4. Test in different browsers
5. Measure size savings

**Files to Modify:**
- `src/utils/imageCompression.ts`
- `src/components/LazyImage.tsx`

**Implementation:**
```typescript
// In imageCompression.ts
export const compressImageWithWebP = async (file: File): Promise<File> => {
  // Try WebP first
  if (supportsWebP()) {
    try {
      return await compressImage(file, { fileType: 'image/webp' });
    } catch (error) {
      // Fallback to JPEG
      return await compressImage(file, { fileType: 'image/jpeg' });
    }
  }
  
  // Use JPEG for unsupported browsers
  return await compressImage(file, { fileType: 'image/jpeg' });
};

const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};
```

**Verification:**
```bash
npm run dev
# Upload image - should use WebP if supported
# Check uploaded file format
# Test in Safari (may not support WebP)
```

_Requirements: 5.4_

---


## Phase 5: Performance Monitoring (Days 12-13)

### - [ ] 5. Create Performance Monitor Utility

Create utility to track Web Vitals and performance metrics.

**Steps:**
1. Create `src/utils/performanceMonitor.ts`
2. Implement Web Vitals tracking (LCP, FID, CLS)
3. Add query performance tracking
4. Add console logging for development
5. Prepare for analytics integration

**Files to Create:**
- `src/utils/performanceMonitor.ts`

**Implementation:**
```typescript
interface PerformanceMetrics {
  fcp: number;
  lcp: number;
  fid: number;
  cls: number;
  ttfb: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private enabled: boolean;

  constructor() {
    this.enabled = true;
    this.observeWebVitals();
  }

  private observeWebVitals() {
    // Observe LCP
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.metrics.lcp = lastEntry.startTime;
        this.reportMetric('LCP', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observation not supported');
    }

    // Observe FID
    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
          this.reportMetric('FID', this.metrics.fid);
        });
      }).observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observation not supported');
    }

    // Observe CLS
    try {
      let cls = 0;
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        });
        this.metrics.cls = cls;
        this.reportMetric('CLS', cls);
      }).observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.warn('CLS observation not supported');
    }
  }

  private reportMetric(name: string, value: number) {
    if (!this.enabled) return;

    // Log in development
    if (process.env.NODE_ENV === 'development') {
      const formattedValue = name === 'CLS' ? value.toFixed(3) : `${value.toFixed(2)}ms`;
      console.log(`[Performance] ${name}: ${formattedValue}`);
    }

    // Check thresholds
    this.checkThresholds(name, value);
  }

  private checkThresholds(name: string, value: number) {
    const thresholds: Record<string, number> = {
      LCP: 2500,
      FID: 100,
      CLS: 0.1
    };

    if (thresholds[name] && value > thresholds[name]) {
      console.warn(
        `[Performance Warning] ${name} exceeded threshold: ${value} > ${thresholds[name]}`
      );
    }
  }

  public trackQueryPerformance(queryKey: string, duration: number) {
    if (duration > 1000) {
      console.warn(`[Slow Query] ${queryKey} took ${duration.toFixed(2)}ms`);
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Query] ${queryKey}: ${duration.toFixed(2)}ms`);
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }

  public disable() {
    this.enabled = false;
  }

  public enable() {
    this.enabled = true;
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**Verification:**
```bash
npm run dev
# Open browser console
# Should see performance metrics logged
# Navigate around - should see LCP, FID, CLS values
```

_Requirements: 4.1, 4.2_

---

### - [ ] 5.1 Integrate Performance Monitoring in App

Initialize performance monitoring in the main app.

**Steps:**
1. Import performance monitor in `src/main.tsx`
2. Initialize on app start
3. Add query performance tracking to hooks
4. Test metrics are collected
5. Verify no performance impact

**Files to Modify:**
- `src/main.tsx`
- `src/hooks/usePaginatedAnimals.tsx` (and other hooks)

**In main.tsx:**
```typescript
import { performanceMonitor } from '@/utils/performanceMonitor';

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  console.log('Performance monitoring enabled');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**In hooks:**
```typescript
import { performanceMonitor } from '@/utils/performanceMonitor';

export const usePaginatedAnimals = () => {
  return useQuery({
    queryKey: ['animals', page],
    queryFn: async () => {
      const startTime = performance.now();
      const data = await fetchAnimals();
      const duration = performance.now() - startTime;
      performanceMonitor.trackQueryPerformance('animals', duration);
      return data;
    }
  });
};
```

**Verification:**
```bash
npm run dev
# Check console for performance logs
# Navigate around app
# Verify metrics are tracked
```

_Requirements: 4.1, 4.2, 4.3_

---

### - [ ] 5.2 Add Query Performance Tracking to All Hooks

Add performance tracking to all database query hooks.

**Steps:**
1. Create helper function for tracking
2. Add to all query hooks
3. Test tracking works
4. Document slow queries
5. Optimize if needed

**Files to Modify:**
- All hooks in `src/hooks/` that use React Query

**Helper Function:**
```typescript
// In src/utils/performanceMonitor.ts
export const withQueryPerformanceTracking = <T>(
  queryKey: string,
  queryFn: () => Promise<T>
): (() => Promise<T>) => {
  return async () => {
    const startTime = performance.now();
    try {
      const result = await queryFn();
      const duration = performance.now() - startTime;
      performanceMonitor.trackQueryPerformance(queryKey, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.trackQueryPerformance(`${queryKey} (error)`, duration);
      throw error;
    }
  };
};
```

**Usage:**
```typescript
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: withQueryPerformanceTracking(
      'dashboard-stats',
      async () => {
        // Query logic
      }
    )
  });
};
```

**Verification:**
```bash
npm run dev
# Navigate to different pages
# Check console for query performance logs
# Identify any slow queries (>1s)
```

_Requirements: 4.3, 4.4_

---

### - [ ]* 5.3 Create Performance Dashboard

Create a developer dashboard to view performance metrics.

**Steps:**
1. Create `src/pages/PerformanceDashboard.tsx`
2. Display Web Vitals metrics
3. Show query performance stats
4. Add bundle size info
5. Make it dev-only

**Files to Create:**
- `src/pages/PerformanceDashboard.tsx`

**Component:**
```typescript
export const PerformanceDashboard = () => {
  const [metrics, setMetrics] = useState(performanceMonitor.getMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(performanceMonitor.getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Performance Dashboard</h1>
      
      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="LCP"
          value={metrics.lcp}
          threshold={2500}
          unit="ms"
        />
        <MetricCard
          title="FID"
          value={metrics.fid}
          threshold={100}
          unit="ms"
        />
        <MetricCard
          title="CLS"
          value={metrics.cls}
          threshold={0.1}
          unit=""
        />
      </div>

      {/* Add more sections for query stats, bundle info, etc. */}
    </div>
  );
};
```

**Verification:**
```bash
npm run dev
# Navigate to /performance-dashboard
# Should see metrics displayed
# Verify updates in real-time
```

_Requirements: 4.1_

---

### - [ ]* 5.4 Add Performance Alerts

Add alerts for performance issues during development.

**Steps:**
1. Create alert system
2. Trigger alerts for slow queries
3. Trigger alerts for large bundle
4. Show toast notifications
5. Make it configurable

**Files to Modify:**
- `src/utils/performanceMonitor.ts`

**Implementation:**
```typescript
import { toast } from 'sonner';

class PerformanceMonitor {
  // ... existing code ...

  private showAlert(message: string, type: 'warning' | 'error' = 'warning') {
    if (process.env.NODE_ENV === 'development') {
      if (type === 'error') {
        toast.error(message);
      } else {
        toast.warning(message);
      }
    }
  }

  public trackQueryPerformance(queryKey: string, duration: number) {
    if (duration > 1000) {
      this.showAlert(
        `Slow query detected: ${queryKey} took ${duration.toFixed(0)}ms`,
        'warning'
      );
    }

    if (duration > 3000) {
      this.showAlert(
        `Very slow query: ${queryKey} took ${duration.toFixed(0)}ms`,
        'error'
      );
    }

    // ... rest of tracking logic ...
  }
}
```

**Verification:**
```bash
npm run dev
# Trigger slow query (e.g., fetch 1000 animals)
# Should see toast notification
# Verify alert is helpful
```

_Requirements: 4.2, 4.4_

---


## Phase 6: Testing and Validation (Days 14-15)

### - [ ] 6. Performance Testing with Large Datasets

Test the application with realistic large datasets.

**Steps:**
1. Create test data generator
2. Generate 1000+ animals
3. Test pagination performance
4. Test query performance
5. Test bundle loading
6. Document results

**Files to Create:**
- `scripts/generate-test-data.ts`

**Script:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

const generateTestAnimals = async (userId: string, count: number) => {
  const animals = [];
  
  for (let i = 0; i < count; i++) {
    animals.push({
      user_id: userId,
      name: `Test Animal ${i}`,
      type: ['cattle', 'goat', 'sheep', 'poultry'][i % 4],
      breed: `Breed ${i % 10}`,
      age: Math.floor(Math.random() * 10),
      weight: Math.floor(Math.random() * 500) + 100,
      health_status: ['healthy', 'sick', 'attention'][i % 3],
      photo_url: '/placeholder.svg'
    });
  }

  // Insert in batches of 100
  for (let i = 0; i < animals.length; i += 100) {
    const batch = animals.slice(i, i + 100);
    const { error } = await supabase.from('animals').insert(batch);
    if (error) {
      console.error(`Error inserting batch ${i / 100}:`, error);
    } else {
      console.log(`Inserted batch ${i / 100 + 1}`);
    }
  }

  console.log(`Generated ${count} test animals`);
};

// Usage: npm run generate-test-data
generateTestAnimals('user-id-here', 1000);
```

**Test Scenarios:**
1. Load Animals page with 1000 animals
2. Scroll through all pages
3. Apply filters
4. Search animals
5. Measure load times

**Success Criteria:**
- Initial load < 3 seconds
- Pagination < 500ms
- Smooth scrolling at 60fps
- No memory leaks

**Verification:**
```bash
# Generate test data
npm run generate-test-data

# Test in browser
npm run dev
# Navigate to Animals page
# Use Chrome DevTools Performance tab
# Record and analyze
```

_Requirements: All_

---

### - [ ] 6.1 Lighthouse Performance Audit

Run Lighthouse audits and optimize based on findings.

**Steps:**
1. Run Lighthouse on key pages
2. Document scores
3. Identify issues
4. Fix critical issues
5. Re-run and verify improvements

**Pages to Audit:**
- Home/Dashboard
- Animals list
- Animal detail
- Marketplace
- Analytics

**Commands:**
```bash
# Build production version
npm run build
npm run preview

# Run Lighthouse (in Chrome DevTools)
# Or use CLI
npm install -g lighthouse
lighthouse http://localhost:4173 --view
```

**Target Scores:**
- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 80

**Document Findings:**
Create `LIGHTHOUSE_REPORT.md` with:
- Before/after scores
- Issues found
- Fixes applied
- Remaining issues

**Verification:**
```bash
# Run Lighthouse multiple times
# Average the scores
# Verify improvements
```

_Requirements: All_

---

### - [ ] 6.2 Network Throttling Tests

Test app performance on slow networks (2G/3G).

**Steps:**
1. Use Chrome DevTools network throttling
2. Test on Slow 3G (400ms RTT, 400kbps)
3. Test on Fast 3G (150ms RTT, 1.6Mbps)
4. Test offline mode
5. Document user experience

**Test Scenarios:**
1. Initial page load
2. Navigation between pages
3. Loading images
4. Pagination
5. Form submissions

**Chrome DevTools Settings:**
- Open DevTools > Network tab
- Select "Slow 3G" or "Fast 3G"
- Test all features

**Success Criteria:**
- App remains usable on Slow 3G
- Loading states are clear
- No timeouts
- Offline mode works

**Verification:**
```bash
npm run dev
# Enable network throttling
# Test all major features
# Document any issues
```

_Requirements: All_

---

### - [ ] 6.3 Memory Leak Testing

Test for memory leaks during extended usage.

**Steps:**
1. Use Chrome DevTools Memory profiler
2. Navigate through app multiple times
3. Take heap snapshots
4. Analyze memory growth
5. Fix any leaks found

**Test Process:**
1. Open Chrome DevTools > Memory tab
2. Take initial heap snapshot
3. Navigate through app (10+ page changes)
4. Take final heap snapshot
5. Compare snapshots

**Common Leak Sources:**
- Event listeners not cleaned up
- React Query cache growing unbounded
- Image references not released
- Timers not cleared

**Success Criteria:**
- Memory growth < 50MB after 10 navigations
- No detached DOM nodes
- Event listeners properly cleaned up

**Verification:**
```bash
npm run dev
# Use Memory profiler
# Navigate extensively
# Check for memory growth
```

_Requirements: 7.1, 7.2, 7.3_

---

### - [ ] 6.4 Cross-Browser Testing

Test performance across different browsers.

**Steps:**
1. Test in Chrome
2. Test in Firefox
3. Test in Safari
4. Test in Edge
5. Document any browser-specific issues

**Browsers to Test:**
- Chrome (latest)
- Firefox (latest)
- Safari (latest, if on Mac)
- Edge (latest)
- Mobile browsers (Chrome Mobile, Safari iOS)

**Test Checklist:**
- [ ] Pagination works
- [ ] Images lazy load
- [ ] Bundle loads correctly
- [ ] Performance is acceptable
- [ ] No console errors

**Known Issues:**
- Safari may not support some Web Vitals APIs
- Older browsers may not support Intersection Observer
- Mobile browsers may have different performance

**Verification:**
```bash
npm run build
npm run preview
# Test in each browser
# Document any issues
```

_Requirements: All_

---

### - [ ] 6.5 Create Performance Optimization Report

Document all optimizations and their impact.

**Steps:**
1. Compile all metrics
2. Create before/after comparison
3. Document lessons learned
4. Create recommendations
5. Share with team

**Files to Create:**
- `PERFORMANCE_OPTIMIZATION_REPORT.md`

**Report Structure:**
```markdown
# Performance Optimization Report

## Executive Summary
- Total time spent: X days
- Performance improvement: X%
- Bundle size reduction: X%
- Query time reduction: X%

## Metrics Comparison

### Before Optimization
- Bundle size: XKB
- Initial load time: Xs
- Query time (100 animals): Xs
- Lighthouse score: X

### After Optimization
- Bundle size: XKB (-X%)
- Initial load time: Xs (-X%)
- Query time (100 animals): Xs (-X%)
- Lighthouse score: X (+X)

## Optimizations Implemented

### 1. Query Optimization
- Replaced 50+ `.select('*')` queries
- Added database indexes
- Implemented query caching
- Impact: X% faster queries

### 2. Pagination
- Implemented infinite scroll
- Added prefetching
- Optimized for offline
- Impact: X% faster initial load

### 3. Bundle Optimization
- Implemented code splitting
- Lazy loaded routes
- Optimized dependencies
- Added compression
- Impact: X% smaller bundle

### 4. Image Optimization
- Implemented lazy loading
- Added compression
- WebP support
- Impact: X% less data usage

### 5. Performance Monitoring
- Web Vitals tracking
- Query performance tracking
- Bundle size CI checks
- Impact: Proactive issue detection

## Lessons Learned
1. ...
2. ...

## Recommendations
1. ...
2. ...

## Next Steps
1. ...
2. ...
```

**Verification:**
- Report is comprehensive
- Metrics are accurate
- Recommendations are actionable

_Requirements: All_

---

## Success Metrics

### Technical Metrics

| Metric | Before | Target | Achieved | Status |
|--------|--------|--------|----------|--------|
| Bundle Size | ~800KB | <500KB | ___ KB | ⏳ |
| Initial Load (3G) | ~8s | <3s | ___ s | ⏳ |
| Query Time (100 animals) | ~2s | <500ms | ___ ms | ⏳ |
| Time to Interactive | ~10s | <5s | ___ s | ⏳ |
| Lighthouse Performance | ~60 | >90 | ___ | ⏳ |
| LCP | ~4s | <2.5s | ___ s | ⏳ |
| FID | ~200ms | <100ms | ___ ms | ⏳ |
| CLS | ~0.3 | <0.1 | ___ | ⏳ |

### User Experience Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Supports 1000+ animals | ✅ | ⏳ |
| Smooth scrolling (60fps) | ✅ | ⏳ |
| Offline functionality | ✅ | ⏳ |
| Works on Slow 3G | ✅ | ⏳ |

---

## Notes

### Important Reminders

1. **Test after each phase** - Don't wait until the end
2. **Commit frequently** - Small, atomic commits
3. **Monitor production** - Watch for regressions
4. **Document issues** - Keep track of problems
5. **Ask for help** - If stuck on any task

### Commit Message Format

```
perf: [task number] - [brief description]

Examples:
perf: 1.0 - Create query builder utilities
perf: 2.0 - Implement paginated animals hook
perf: 3.1 - Add route-based code splitting
perf: 4.0 - Create lazy loading image component
perf: 5.0 - Add performance monitoring
```

### Rollback Plan

If something breaks:
1. Check git status
2. Review recent changes
3. Revert specific commit: `git revert <commit-hash>`
4. Or reset to previous state: `git reset --hard <commit-hash>`
5. Document what went wrong
6. Ask for help

---

## Estimated Timeline

### Week 1 (Days 1-5)
- **Days 1-3**: Query Optimization (Phase 1)
- **Days 4-5**: Pagination Implementation (Phase 2, partial)

### Week 2 (Days 6-10)
- **Days 6**: Pagination Implementation (Phase 2, complete)
- **Days 7-9**: Bundle Optimization (Phase 3)
- **Days 10**: Image Optimization (Phase 4, partial)

### Week 3 (Days 11-15)
- **Days 11**: Image Optimization (Phase 4, complete)
- **Days 12-13**: Performance Monitoring (Phase 5)
- **Days 14-15**: Testing and Validation (Phase 6)

**Total: 15 days (3 weeks)**

---

## Requirements Coverage

This task list covers all requirements from requirements.md:

- ✅ 1.1-1.7: Pagination System
- ✅ 2.1-2.8: Bundle Size Optimization
- ✅ 3.1-3.8: Query Optimization
- ✅ 4.1-4.7: Performance Monitoring
- ✅ 5.1-5.7: Image Optimization
- ✅ 6.1-6.7: Data Prefetching
- ✅ 7.1-7.7: React Rendering Optimization
- ✅ 8.1-8.7: Progressive Loading

---

**Ready to start? Begin with Task 1.0: Create Query Builder Utilities**
