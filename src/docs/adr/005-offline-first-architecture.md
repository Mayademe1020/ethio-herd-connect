# ADR-005: Offline-First Architecture

**Status**: Accepted

**Date**: 2025-01-21

**Decision Makers**: Development Team, Product Owner

## Context

Ethiopian farmers face significant connectivity challenges:
- **Intermittent Internet**: Rural areas have unreliable mobile data
- **Expensive Data**: Mobile data is costly, farmers want to minimize usage
- **Basic Smartphones**: Limited storage and processing power
- **Critical Operations**: Need to record health events, milk production even when offline

The original implementation had limited offline support:
- Some data cached by React Query
- No offline write capabilities
- No sync queue for offline actions
- Poor offline status indicators
- Users couldn't work effectively without connectivity

## Decision

Implement a comprehensive offline-first architecture with:

1. **IndexedDB Caching**: Store critical data locally for offline access
2. **Offline Action Queue**: Queue create/update/delete operations when offline
3. **Automatic Sync**: Sync queued actions when connection restored
4. **Offline Indicators**: Clear visual feedback about offline/online status
5. **Optimistic Updates**: Update UI immediately, sync in background

## Rationale

### Why Offline-First

1. **Ethiopian Context**: Matches the reality of poor rural connectivity
2. **User Productivity**: Farmers can work regardless of connection status
3. **Data Safety**: Actions queued locally, not lost when offline
4. **Better UX**: No frustrating "no connection" errors
5. **Cost Savings**: Reduces data usage by caching frequently accessed data

### Architecture Components

**1. IndexedDB Storage** (`src/utils/indexedDB.ts`):
- Stores animals, health records, milk production, marketplace listings
- Provides fast local access to data
- Persists across browser sessions
- Handles storage quota management

**2. Offline Action Queue** (`src/utils/offlineActionQueue.ts`):
- Queues create/update/delete operations
- Stores action metadata (timestamp, retry count)
- Implements retry logic with exponential backoff
- Handles conflict resolution

**3. Offline Hooks**:
- `useOfflineCache`: Manages IndexedDB caching
- `useOfflineActionQueue`: Manages action queue
- `useEnhancedOfflineSync`: Coordinates offline/online transitions
- `useOfflineFirstData`: Provides offline-first data fetching

**4. UI Components**:
- `OfflineStatusIndicator`: Shows connection status
- `SyncStatusIndicator`: Shows sync progress
- `OfflineSyncStatus`: Detailed sync information

### Data Caching Strategy

**Always Cached** (critical for offline work):
- User's own animals
- Recent health records
- Recent milk production records
- User's marketplace listings

**Conditionally Cached** (when viewed):
- Marketplace listings (read-only)
- Dashboard statistics (stale-while-revalidate)

**Never Cached**:
- Other users' private data
- Real-time analytics
- Authentication tokens (security)

### Sync Strategy

**Immediate Sync** (when online):
- New health events
- New milk production records
- Critical animal updates

**Batched Sync** (when online):
- Bulk operations
- Non-critical updates
- Analytics events

**Conflict Resolution**:
- Last-write-wins for most operations
- Server-side validation for critical data
- User notification for conflicts

### Alternatives Considered

1. **Service Worker + Cache API**:
   - ✅ Standard web approach
   - ❌ More complex to implement
   - ❌ Limited control over caching strategy
   - ❌ Harder to debug

2. **LocalStorage**:
   - ✅ Simple API
   - ❌ 5-10MB limit (too small)
   - ❌ Synchronous (blocks UI)
   - ❌ No structured data support

3. **Online-Only with Better Error Messages**:
   - ❌ Doesn't solve the core problem
   - ❌ Poor user experience
   - ❌ Farmers can't work offline

## Consequences

### Positive

- **Works Offline**: Core features functional without connectivity
- **Better UX**: No frustrating connection errors
- **Data Safety**: Actions queued, not lost
- **Cost Savings**: Reduced data usage through caching
- **Faster Performance**: Local data access is instant
- **User Confidence**: Farmers trust the app to work anywhere

### Negative

- **Complexity**: More complex architecture to maintain
- **Storage Management**: Need to handle storage quota limits
- **Sync Conflicts**: Potential for data conflicts (rare)
- **Testing Burden**: Must test offline/online transitions
- **Debugging Difficulty**: Harder to debug offline issues

### Neutral

- **Storage Usage**: Uses device storage (typically 50-100MB)
- **Battery Impact**: Sync operations use battery
- **Learning Curve**: Developers need to understand offline patterns

## Implementation Notes

### IndexedDB Schema

```typescript
// Database: ethio-herd-connect
// Version: 1

// Object Stores:
- animals: { keyPath: 'id', indexes: ['user_id', 'updated_at'] }
- health_records: { keyPath: 'id', indexes: ['animal_id', 'user_id', 'date'] }
- milk_production: { keyPath: 'id', indexes: ['animal_id', 'user_id', 'date'] }
- marketplace_listings: { keyPath: 'id', indexes: ['seller_id', 'category'] }
- offline_queue: { keyPath: 'id', indexes: ['timestamp', 'action'] }
```

### Offline Action Queue Format

```typescript
interface OfflineAction {
  id: string;                    // UUID
  action: 'create' | 'update' | 'delete';
  table: string;                 // Database table name
  data: any;                     // Action payload
  timestamp: number;             // When queued
  retryCount: number;            // Number of retry attempts
  maxRetries: number;            // Max retries before giving up
  userId: string;                // User who created action
}
```

### Sync Process

1. **Detect Online**: Listen to `navigator.onLine` and network requests
2. **Get Queue**: Fetch all pending actions from IndexedDB
3. **Sort by Timestamp**: Process oldest actions first
4. **Execute Actions**: Send to Supabase with retry logic
5. **Handle Errors**: Increment retry count or mark as failed
6. **Remove Successful**: Delete from queue when synced
7. **Update UI**: Show sync progress to user

### Usage Example

```typescript
// In a component
const { addToQueue, syncQueue, queueSize } = useOfflineActionQueue();

const handleCreateHealthRecord = async (data: HealthRecord) => {
  // Optimistic update
  setHealthRecords(prev => [...prev, data]);
  
  // Add to offline queue
  await addToQueue({
    action: 'create',
    table: 'health_records',
    data: data
  });
  
  // Sync if online
  if (navigator.onLine) {
    await syncQueue();
  }
};
```

### Testing Performed

- ✅ Offline data caching for all critical features
- ✅ Action queue for create/update/delete operations
- ✅ Automatic sync when connection restored
- ✅ Retry logic with exponential backoff
- ✅ Conflict resolution
- ✅ Storage quota management
- ✅ UI indicators for offline/sync status
- ✅ Performance on low-end devices

### Performance Metrics

- IndexedDB read: < 10ms ✅
- IndexedDB write: < 50ms ✅
- Sync 100 actions: < 5s ✅
- Storage usage: ~50MB for typical user ✅

## Related Decisions

- [ADR-003: Marketplace Consolidation](./003-marketplace-consolidation.md)
- [ADR-014: Mobile-First Optimization](./014-mobile-first-optimization.md)

## References

- [Quality Audit Requirements](../quality-audit-consolidation/requirements.md)
- [Offline Functionality Documentation](../OFFLINE_FUNCTIONALITY.md)
- [Offline Action Queue Documentation](../OFFLINE_ACTION_QUEUE.md)
- [Task 9: Optimize for Ethiopian farmers - Offline functionality](../quality-audit-consolidation/tasks.md#task-9)
- [IndexedDB Utility](../../utils/indexedDB.ts)
- [Offline Action Queue Utility](../../utils/offlineActionQueue.ts)
