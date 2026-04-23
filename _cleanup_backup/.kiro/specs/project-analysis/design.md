# Code Quality Cleanup - Technical Design Document

## Overview

This design document outlines the technical approach for cleaning up critical code quality issues in the Livestock Management System. The cleanup focuses on three main areas:

1. **Console.log Removal** - Remove 95+ debugging statements
2. **File Deduplication** - Fix duplicate useOfflineSync files
3. **Mock Data Audit** - Identify and replace hardcoded data

**Goal:** Improve code maintainability, security, and data accuracy.

---

## Architecture

### 1. Logging Strategy

**Current State:**
- 95+ console.log statements scattered across codebase
- No centralized logging
- Potential sensitive data exposure
- Debugging artifacts in production

**Proposed Architecture:**

```typescript
// src/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, data);
    }
  },
  info: (message: string, data?: any) => {
    console.info(`[INFO] ${message}`, data);
  },
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data);
  },
  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);
    // Future: Send to error tracking service (Sentry)
  }
};
```

**Benefits:**
- Centralized logging control
- Environment-aware (dev vs production)
- Easy to integrate with error tracking
- Consistent log format
- No sensitive data leakage

### 2. File Structure Consolidation

**Current State:**
```
src/hooks/
  ├── useOfflineSync.ts    ← DELETE THIS
  └── useOfflineSync.tsx   ← KEEP THIS
```

**Issue:** Two files with same name, different extensions
- Causes confusion
- Risk of importing wrong version
- Maintenance nightmare

**Solution:**
- Delete `useOfflineSync.ts`
- Keep `useOfflineSync.tsx` (has React components)
- Update all imports to explicit `.tsx`
- Verify no broken references

### 3. Data Source Management

**Current State:**
- Mock data in multiple locations
- Inconsistent data sources
- Some components use real data, others don't
- Hard to track what's real vs fake

**Proposed Architecture:**

```typescript
// src/config/dataSource.ts
export const DATA_SOURCE = {
  USE_MOCK_DATA: process.env.NODE_ENV === 'development' && 
                 localStorage.getItem('useMockData') === 'true',
  
  // Feature flags for data sources
  FEATURES: {
    DASHBOARD: { useMock: false },
    ANIMALS: { useMock: false },
    GROWTH: { useMock: false },
    MARKETPLACE: { useMock: false },
    ANALYTICS: { useMock: true }, // Still needs connection
    NOTIFICATIONS: { useMock: true }, // Still needs connection
  }
};
```

**Benefits:**
- Clear visibility of what uses mock data
- Easy to toggle for testing
- Centralized configuration
- Gradual migration path

---

## Components and Interfaces

### 1. Logger Utility

**File:** `src/utils/logger.ts`

```typescript
interface LoggerConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
  errorTrackingService?: (error: Error, context?: any) => void;
}

interface Logger {
  debug: (message: string, data?: any) => void;
  info: (message: string, data?: any) => void;
  warn: (message: string, data?: any) => void;
  error: (message: string, error?: any) => void;
  setConfig: (config: Partial<LoggerConfig>) => void;
}

export const createLogger = (config?: Partial<LoggerConfig>): Logger => {
  // Implementation
};

export const logger = createLogger({
  enableDebug: process.env.NODE_ENV === 'development',
  enableInfo: true,
  enableWarn: true,
  enableError: true,
});
```

### 2. Data Source Configuration

**File:** `src/config/dataSource.ts`

```typescript
interface FeatureDataSource {
  useMock: boolean;
  reason?: string; // Why using mock data
  targetDate?: string; // When to switch to real data
}

interface DataSourceConfig {
  USE_MOCK_DATA: boolean;
  FEATURES: {
    [key: string]: FeatureDataSource;
  };
}

export const getDataSource = (feature: string): FeatureDataSource => {
  return DATA_SOURCE.FEATURES[feature] || { useMock: false };
};
```

### 3. Mock Data Registry

**File:** `src/data/mockDataRegistry.ts`

```typescript
interface MockDataLocation {
  file: string;
  component: string;
  dataType: string;
  priority: 'high' | 'medium' | 'low';
  replacementHook?: string;
  status: 'identified' | 'in-progress' | 'replaced';
}

export const MOCK_DATA_REGISTRY: MockDataLocation[] = [
  // Will be populated during audit
];
```

---

## Data Models

### Console.log Audit Results

```typescript
interface ConsoleLogLocation {
  file: string;
  line: number;
  type: 'log' | 'debug' | 'info' | 'warn' | 'error';
  content: string;
  hasSensitiveData: boolean;
  replacement: 'remove' | 'logger.debug' | 'logger.info' | 'logger.error';
  priority: 'high' | 'medium' | 'low';
}
```

### File Dependency Map

```typescript
interface FileDependency {
  file: string;
  imports: string[];
  usesOfflineSync: boolean;
  importPath: string;
  needsUpdate: boolean;
}
```

### Mock Data Audit

```typescript
interface MockDataUsage {
  component: string;
  file: string;
  dataType: string;
  mockDataSource: string;
  realDataHook?: string;
  estimatedEffort: string;
  userImpact: 'high' | 'medium' | 'low';
  status: 'not-started' | 'in-progress' | 'completed';
}
```

---

## Error Handling

### 1. Logger Error Handling

```typescript
// Wrap logger calls in try-catch to prevent logging errors from breaking app
export const safeLog = (
  level: 'debug' | 'info' | 'warn' | 'error',
  message: string,
  data?: any
) => {
  try {
    logger[level](message, data);
  } catch (error) {
    // Fail silently - logging should never break the app
    console.error('Logger error:', error);
  }
};
```

### 2. Data Source Fallback

```typescript
// If real data fails, optionally fall back to mock (with warning)
export const withFallback = async <T>(
  realDataFn: () => Promise<T>,
  mockData: T,
  feature: string
): Promise<T> => {
  try {
    const data = await realDataFn();
    return data;
  } catch (error) {
    logger.error(`Failed to fetch real data for ${feature}`, error);
    logger.warn(`Falling back to mock data for ${feature}`);
    return mockData;
  }
};
```

---

## Testing Strategy

### 1. Console.log Removal Testing

**Verification Steps:**
1. Search codebase for remaining console.log
2. Run app in development mode
3. Check browser console for unexpected logs
4. Verify no sensitive data in logs
5. Test error scenarios still log properly

**Test Commands:**
```bash
# Search for remaining console.log
grep -r "console\.log" src/ --exclude-dir=node_modules

# Search for console.debug, info, warn, error (should only be in logger.ts)
grep -r "console\." src/ --exclude-dir=node_modules | grep -v "logger.ts"

# Count remaining instances
grep -r "console\.log" src/ --exclude-dir=node_modules | wc -l
```

### 2. File Deduplication Testing

**Verification Steps:**
1. Verify useOfflineSync.ts is deleted
2. Search for imports of useOfflineSync
3. Run TypeScript compiler
4. Run app and test offline functionality
5. Check for any import errors

**Test Commands:**
```bash
# Verify file is deleted
ls src/hooks/useOfflineSync.ts  # Should fail

# Find all imports
grep -r "useOfflineSync" src/ --exclude-dir=node_modules

# TypeScript check
npm run build

# Run app
npm run dev
```

### 3. Mock Data Audit Testing

**Verification Steps:**
1. Review mock data registry
2. Test each component with real data
3. Verify data displays correctly
4. Check for loading states
5. Test error scenarios

**Test Checklist:**
- [ ] Dashboard shows real animal counts
- [ ] Growth page shows real weight records
- [ ] Analytics shows real calculations
- [ ] Notifications show real notifications
- [ ] No hardcoded values visible

---

## Implementation Plan

### Phase 1: Console.log Removal (Day 1)

**Step 1: Create Logger Utility** (1 hour)
- Create `src/utils/logger.ts`
- Implement logger interface
- Add environment checks
- Export singleton instance

**Step 2: Audit Console.log Statements** (1 hour)
- Run grep search for all console.log
- Categorize by file and purpose
- Identify sensitive data
- Create replacement plan

**Step 3: Replace Console.log** (2 hours)
- Replace debugging logs with logger.debug
- Replace info logs with logger.info
- Replace error logs with logger.error
- Remove unnecessary logs

**Step 4: Verify** (30 minutes)
- Run grep to find remaining console.log
- Test app functionality
- Check browser console
- Verify no sensitive data

**Files to Modify:**
```
src/utils/logger.ts (NEW)
src/pages/SystemAnalysis.tsx
src/components/ProfessionalMarketplace.tsx
src/components/PerformanceMonitor.tsx
src/components/ContactSellerModal.tsx
src/pages/Market.tsx
src/components/StaffManagement.tsx
... (and ~20-30 more files)
```

### Phase 2: File Deduplication (Day 1)

**Step 1: Analyze Dependencies** (30 minutes)
- Find all files importing useOfflineSync
- Check which version they import
- Create update list

**Step 2: Update Imports** (30 minutes)
- Update all imports to use .tsx version
- Ensure explicit file extension
- Update any type imports

**Step 3: Delete Duplicate** (5 minutes)
- Delete `src/hooks/useOfflineSync.ts`
- Commit change

**Step 4: Verify** (15 minutes)
- Run TypeScript compiler
- Test offline functionality
- Check for broken imports

**Files to Modify:**
```
DELETE: src/hooks/useOfflineSync.ts
UPDATE: Any files importing useOfflineSync (TBD after search)
```

### Phase 3: Mock Data Audit (Day 2)

**Step 1: Create Registry** (1 hour)
- Create `src/data/mockDataRegistry.ts`
- Search for mock data usage
- Document each instance
- Categorize by priority

**Step 2: Create Data Source Config** (30 minutes)
- Create `src/config/dataSource.ts`
- Define feature flags
- Add toggle mechanism

**Step 3: Prioritize Replacements** (30 minutes)
- Rank by user impact
- Identify available hooks
- Estimate effort
- Create task list

**Step 4: Document Findings** (1 hour)
- Create detailed report
- List files needing updates
- Provide code examples
- Set target dates

**Files to Create:**
```
src/utils/logger.ts (NEW)
src/config/dataSource.ts (NEW)
src/data/mockDataRegistry.ts (NEW)
```

---

## Detailed File Changes

### 1. Create Logger Utility

**File:** `src/utils/logger.ts`

```typescript
/**
 * Centralized logging utility
 * Prevents console.log pollution and sensitive data leakage
 */

interface LoggerConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  debug(message: string, data?: any): void {
    if (this.config.enableDebug) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.config.enableInfo) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.config.enableWarn) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.config.enableError) {
      console.error(`[ERROR] ${message}`, error || '');
      // Future: Send to error tracking service
    }
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create singleton instance
export const logger = new Logger({
  enableDebug: process.env.NODE_ENV === 'development',
  enableInfo: true,
  enableWarn: true,
  enableError: true,
});

// Export for testing
export { Logger };
```

### 2. Example Console.log Replacement

**Before:**
```typescript
// src/components/ProfessionalMarketplace.tsx
const handleSubmitListing = async (formData: any) => {
  console.log('Submitting listing:', formData);
  // This would call the backend API to create the listing
};
```

**After:**
```typescript
// src/components/ProfessionalMarketplace.tsx
import { logger } from '@/utils/logger';

const handleSubmitListing = async (formData: any) => {
  logger.debug('Submitting listing', { formData });
  // This would call the backend API to create the listing
};
```

### 3. Create Data Source Config

**File:** `src/config/dataSource.ts`

```typescript
/**
 * Centralized data source configuration
 * Tracks which features use mock vs real data
 */

interface FeatureDataSource {
  useMock: boolean;
  reason?: string;
  targetDate?: string;
  hook?: string;
}

interface DataSourceConfig {
  FEATURES: {
    [key: string]: FeatureDataSource;
  };
}

export const DATA_SOURCE: DataSourceConfig = {
  FEATURES: {
    DASHBOARD: {
      useMock: false,
      hook: 'useDashboardStats',
    },
    ANIMALS: {
      useMock: false,
      hook: 'useAnimalsDatabase',
    },
    GROWTH: {
      useMock: false,
      hook: 'useGrowthRecords',
    },
    MARKETPLACE: {
      useMock: false,
      hook: 'useSecurePublicMarketplace',
    },
    MILK_PRODUCTION: {
      useMock: false,
      hook: 'useMilkProduction',
    },
    ANALYTICS: {
      useMock: true,
      reason: 'Hook exists but not connected to UI',
      targetDate: '2025-02-01',
      hook: 'useAnalytics',
    },
    NOTIFICATIONS: {
      useMock: true,
      reason: 'Hook exists but needs trigger system',
      targetDate: '2025-02-15',
      hook: 'useNotifications',
    },
    HEALTH_RECORDS: {
      useMock: true,
      reason: 'Display components use mock data',
      targetDate: '2025-02-01',
    },
  },
};

export const getDataSource = (feature: string): FeatureDataSource => {
  return DATA_SOURCE.FEATURES[feature] || { useMock: false };
};

export const isUsingMockData = (feature: string): boolean => {
  return getDataSource(feature).useMock;
};
```

### 4. Create Mock Data Registry

**File:** `src/data/mockDataRegistry.ts`

```typescript
/**
 * Registry of all mock data usage in the application
 * Used to track migration from mock to real data
 */

export interface MockDataLocation {
  id: string;
  file: string;
  component: string;
  dataType: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  userImpact: 'high' | 'medium' | 'low';
  replacementHook?: string;
  estimatedEffort: string;
  status: 'identified' | 'in-progress' | 'completed';
  notes?: string;
}

export const MOCK_DATA_REGISTRY: MockDataLocation[] = [
  // Will be populated during audit
  // Example:
  // {
  //   id: 'dashboard-stats',
  //   file: 'src/components/HomeScreen.tsx',
  //   component: 'HomeScreen',
  //   dataType: 'Dashboard Statistics',
  //   description: 'Hardcoded animal counts and growth rates',
  //   priority: 'high',
  //   userImpact: 'high',
  //   replacementHook: 'useDashboardStats',
  //   estimatedEffort: '1 day',
  //   status: 'identified',
  //   notes: 'Hook already exists, just needs UI connection'
  // }
];

// Helper functions
export const getMockDataByPriority = (priority: 'high' | 'medium' | 'low') => {
  return MOCK_DATA_REGISTRY.filter(item => item.priority === priority);
};

export const getMockDataByStatus = (status: MockDataLocation['status']) => {
  return MOCK_DATA_REGISTRY.filter(item => item.status === status);
};

export const getHighPriorityMockData = () => {
  return MOCK_DATA_REGISTRY.filter(
    item => item.priority === 'high' && item.status !== 'completed'
  );
};
```

---

## Search Commands for Audit

### Find All Console.log

```bash
# Find all console.log statements
grep -rn "console\.log" src/ --exclude-dir=node_modules

# Count total instances
grep -r "console\.log" src/ --exclude-dir=node_modules | wc -l

# Find console.log with potential sensitive data
grep -rn "console\.log.*user\|console\.log.*password\|console\.log.*token\|console\.log.*email" src/ --exclude-dir=node_modules

# Find all console methods
grep -rn "console\." src/ --exclude-dir=node_modules | grep -v "logger.ts"
```

### Find useOfflineSync Imports

```bash
# Find all imports of useOfflineSync
grep -rn "useOfflineSync" src/ --exclude-dir=node_modules

# Find specific import statements
grep -rn "import.*useOfflineSync" src/ --exclude-dir=node_modules

# Check which file exists
ls -la src/hooks/useOfflineSync.*
```

### Find Mock Data Usage

```bash
# Find hardcoded arrays/objects that look like mock data
grep -rn "const.*=.*\[{" src/pages/ src/components/

# Find files with "mock" in name or content
find src/ -name "*mock*"
grep -rn "mockData\|MOCK_DATA\|mock.*=" src/ --exclude-dir=node_modules

# Find hardcoded animal data
grep -rn "name:.*'Bessie'\|name:.*'Daisy'" src/

# Find hardcoded statistics
grep -rn "totalAnimals.*=.*[0-9]\|healthyAnimals.*=.*[0-9]" src/
```

---

## Verification Checklist

### Console.log Removal
- [ ] Created `src/utils/logger.ts`
- [ ] Replaced all console.log with logger.debug
- [ ] Replaced all console.info with logger.info
- [ ] Replaced all console.error with logger.error
- [ ] Removed unnecessary logs
- [ ] Verified no sensitive data in logs
- [ ] Tested app in development mode
- [ ] Tested app in production mode
- [ ] Grep search returns 0 console.log instances

### File Deduplication
- [ ] Identified all useOfflineSync imports
- [ ] Updated imports to use .tsx version
- [ ] Deleted useOfflineSync.ts
- [ ] TypeScript compiles without errors
- [ ] App runs without import errors
- [ ] Offline functionality still works
- [ ] No broken references

### Mock Data Audit
- [ ] Created mock data registry
- [ ] Created data source config
- [ ] Identified all mock data usage
- [ ] Categorized by priority
- [ ] Documented replacement hooks
- [ ] Estimated effort for each
- [ ] Created task list
- [ ] Prioritized by user impact

---

## Success Metrics

### Quantitative
- **Console.log count:** 95+ → 0
- **Duplicate files:** 1 → 0
- **Mock data locations:** TBD → Documented
- **Build time:** No change expected
- **Bundle size:** Slight decrease expected

### Qualitative
- **Code maintainability:** Improved
- **Security posture:** Improved (no sensitive data leaks)
- **Developer experience:** Improved (clear logging)
- **Data accuracy:** Improved (real data everywhere)
- **User trust:** Improved (accurate information)

---

## Risks and Mitigation

### Risk 1: Breaking Changes
**Risk:** Removing console.log might break debugging workflows
**Mitigation:** 
- Keep logger.debug for development
- Document new logging approach
- Provide examples

### Risk 2: Missing Imports
**Risk:** Deleting useOfflineSync.ts might break imports
**Mitigation:**
- Search all imports first
- Update before deleting
- Test thoroughly
- Have rollback plan

### Risk 3: Mock Data Dependencies
**Risk:** Some components might depend on mock data structure
**Mitigation:**
- Audit carefully
- Test each replacement
- Keep mock data as fallback initially
- Gradual migration

### Risk 4: Performance Impact
**Risk:** Logger might impact performance
**Mitigation:**
- Disable debug logs in production
- Use conditional logging
- Benchmark if needed

---

## Future Enhancements

### 1. Error Tracking Integration
```typescript
// Future: Integrate with Sentry or similar
import * as Sentry from '@sentry/react';

error(message: string, error?: any): void {
  console.error(`[ERROR] ${message}`, error);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { message },
    });
  }
}
```

### 2. Log Aggregation
```typescript
// Future: Send logs to aggregation service
import { logToService } from './logAggregation';

info(message: string, data?: any): void {
  console.info(`[INFO] ${message}`, data);
  if (process.env.NODE_ENV === 'production') {
    logToService('info', message, data);
  }
}
```

### 3. Performance Monitoring
```typescript
// Future: Add performance logging
export const performanceLogger = {
  startTimer: (label: string) => {
    performance.mark(`${label}-start`);
  },
  endTimer: (label: string) => {
    performance.mark(`${label}-end`);
    performance.measure(label, `${label}-start`, `${label}-end`);
    const measure = performance.getEntriesByName(label)[0];
    logger.debug(`Performance: ${label}`, { duration: measure.duration });
  },
};
```

---

## Conclusion

This design provides a comprehensive approach to cleaning up critical code quality issues:

1. **Centralized Logging** - Replace console.log with proper logger
2. **File Consolidation** - Remove duplicate files
3. **Data Source Tracking** - Document and replace mock data

**Next Steps:**
1. Review and approve this design
2. Create implementation tasks
3. Execute Phase 1 (Console.log removal)
4. Execute Phase 2 (File deduplication)
5. Execute Phase 3 (Mock data audit)

**Estimated Total Effort:** 2-3 days

**Expected Outcome:** Cleaner, more maintainable, more secure codebase.
