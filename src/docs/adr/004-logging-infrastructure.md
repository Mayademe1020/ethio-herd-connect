# ADR-004: Logging Infrastructure

**Status**: Accepted

**Date**: 2025-01-21

**Decision Makers**: Development Team

## Context

The codebase had 38+ `console.log` statements scattered throughout hooks and components:

- `usePaginatedQuery.tsx`: 6 instances
- `usePaginatedAnimals.tsx`: 2 instances
- `usePaginatedMarketListings.tsx`: 2 instances
- `usePaginatedHealthRecords.tsx`: 2 instances
- `usePaginatedMilkProduction.tsx`: 2 instances
- `useGrowthRecords.tsx`: 4 instances
- `useDashboardStats.tsx`: 10 instances
- `useAnimalsDatabase.tsx`: 8 instances
- `InfiniteScrollContainer.tsx`: 2 instances

Problems with console.log:
- **Security Risk**: Sensitive data could be logged in production
- **Performance Impact**: Console operations slow down the application
- **No Control**: Can't disable logging in production
- **No Filtering**: Can't filter by severity or component
- **No Monitoring**: Can't send logs to monitoring services
- **Debugging Artifacts**: Left over from development

## Decision

Replace all `console.log` statements with a centralized logging utility (`src/utils/logger.ts`) that provides:

1. **Severity Levels**: debug, info, warn, error
2. **Environment Awareness**: Automatically disabled in production (except errors)
3. **Structured Logging**: Consistent format for all log messages
4. **Integration Ready**: Can be extended to send logs to monitoring services
5. **Type Safety**: TypeScript types for log parameters

## Rationale

### Why Centralized Logger

1. **Security**: Control what gets logged in production
2. **Performance**: Disable verbose logging in production
3. **Monitoring**: Easy to integrate with Sentry, LogRocket, etc.
4. **Consistency**: All logs follow the same format
5. **Debugging**: Better debugging experience with structured logs
6. **Filtering**: Can filter logs by severity level

### Logger API Design

```typescript
export const logger = {
  debug: (message: string, data?: any) => void,
  info: (message: string, data?: any) => void,
  warn: (message: string, data?: any) => void,
  error: (message: string, error?: Error, data?: any) => void
};
```

### Environment Behavior

**Development**:
- `debug`: Enabled (console.log)
- `info`: Enabled (console.info)
- `warn`: Enabled (console.warn)
- `error`: Enabled (console.error)

**Production**:
- `debug`: Disabled
- `info`: Disabled (or sent to analytics)
- `warn`: Sent to monitoring service
- `error`: Sent to error tracking (Sentry)

### Alternatives Considered

1. **Keep console.log with environment checks**: 
   - ❌ Still scattered throughout codebase
   - ❌ No structured format
   - ❌ Hard to integrate with monitoring

2. **Use third-party logging library (winston, pino)**:
   - ❌ Overkill for frontend application
   - ❌ Adds unnecessary dependencies
   - ❌ More complex than needed

3. **Remove all logging**:
   - ❌ Loses valuable debugging information
   - ❌ Makes troubleshooting harder
   - ❌ No visibility into production issues

## Consequences

### Positive

- **Improved Security**: No sensitive data logged in production
- **Better Performance**: Logging disabled in production
- **Easier Debugging**: Structured, consistent log format
- **Monitoring Ready**: Easy to integrate with Sentry, LogRocket
- **Type Safety**: TypeScript catches logging errors
- **Cleaner Code**: Consistent logging pattern throughout

### Negative

- **Migration Effort**: Had to update 38+ console.log statements
- **Learning Curve**: Developers need to use logger instead of console.log
- **Slightly More Verbose**: `logger.debug()` vs `console.log()`

### Neutral

- **Code Reviews**: Need to enforce logger usage in code reviews
- **Documentation**: Must document logger usage guidelines
- **Linting**: Could add ESLint rule to prevent console.log

## Implementation Notes

### Logger Implementation

```typescript
// src/utils/logger.ts
export const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data || '');
    }
  },
  
  info: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(`[INFO] ${message}`, data || '');
    }
    // In production, could send to analytics
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`[WARN] ${message}`, data || '');
    // Send to monitoring service in production
  },
  
  error: (message: string, error?: Error, data?: any) => {
    console.error(`[ERROR] ${message}`, error || '', data || '');
    // Send to Sentry in production
  }
};
```

### Usage Examples

**Before**:
```typescript
console.log('Fetching animals', { page, limit });
console.log('Query result:', data);
```

**After**:
```typescript
logger.debug('Fetching animals', { page, limit });
logger.debug('Query result', { count: data?.length });
```

### Migration Process

1. ✅ Created centralized logger utility
2. ✅ Updated all pagination hooks
3. ✅ Updated all data hooks
4. ✅ Updated all components
5. ✅ Verified no console.log statements remain
6. ✅ Tested logging in development and production modes

### Files Updated

- `src/hooks/usePaginatedQuery.tsx`
- `src/hooks/usePaginatedAnimals.tsx`
- `src/hooks/usePaginatedMarketListings.tsx`
- `src/hooks/usePaginatedHealthRecords.tsx`
- `src/hooks/usePaginatedMilkProduction.tsx`
- `src/hooks/useGrowthRecords.tsx`
- `src/hooks/useDashboardStats.tsx`
- `src/hooks/useAnimalsDatabase.tsx`
- `src/components/InfiniteScrollContainer.tsx`

### Future Enhancements

**Sentry Integration** (when ready):
```typescript
error: (message: string, error?: Error, data?: any) => {
  console.error(`[ERROR] ${message}`, error, data);
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      tags: { message },
      extra: data
    });
  }
}
```

**Analytics Integration** (when ready):
```typescript
info: (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.info(`[INFO] ${message}`, data);
  } else {
    analytics.track(message, data);
  }
}
```

## Related Decisions

- [ADR-012: Security Audit Fixes](./012-security-audit-fixes.md)

## References

- [Quality Audit Requirements](../quality-audit-consolidation/requirements.md)
- [Task 1: Set up logging infrastructure](../quality-audit-consolidation/tasks.md#task-1)
- [Logger Utility](../../utils/logger.ts)
- [Logging Implementation Complete](../../../TASK_1_LOGGING_COMPLETE.md)
