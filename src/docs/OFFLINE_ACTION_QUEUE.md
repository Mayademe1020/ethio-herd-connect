# Offline Action Queue System

## Overview

The Offline Action Queue system provides robust offline functionality for Ethio Herd Connect, allowing Ethiopian farmers to continue using the app even with intermittent connectivity. All create, update, and delete operations are queued locally and synced automatically when the connection is restored.

## Architecture

### Components

1. **IndexedDB Storage** (`src/utils/indexedDB.ts`)
   - Persistent local storage for offline data
   - Stores sync queue items with retry counts
   - Caches data for offline viewing

2. **Action Queue Manager** (`src/utils/offlineActionQueue.ts`)
   - Manages queuing and syncing of offline actions
   - Implements exponential backoff retry logic
   - Handles batch processing to avoid overwhelming the server

3. **React Hook** (`src/hooks/useOfflineActionQueue.tsx`)
   - Provides easy-to-use interface for components
   - Manages sync status and progress
   - Handles online/offline events automatically

4. **UI Components**
   - `SyncStatusIndicator`: Visual sync status display
   - `OfflineSyncStatus`: Detailed sync status card
   - `SyncStatus` page: Full sync management interface

## Features

### 1. Automatic Queuing

When offline or when operations fail, actions are automatically queued:

```typescript
import { useOfflineActionQueue } from '@/hooks/useOfflineActionQueue';

const { queueAction } = useOfflineActionQueue();

// Queue a create operation
await queueAction('create', STORES.ANIMALS, {
  name: 'Bessie',
  tag_number: 'ET-001',
  user_id: user.id
});
```

### 2. Exponential Backoff Retry

Failed sync operations are retried with increasing delays:

- Retry 1: 1 second delay
- Retry 2: 2 seconds delay
- Retry 3: 4 seconds delay
- Retry 4: 8 seconds delay
- Retry 5: 16 seconds delay (max)

After 5 failed attempts, items are marked as failed and require manual intervention.

### 3. Batch Processing

To avoid overwhelming the server and prevent rate limiting:

- Items are synced in batches of 10
- 500ms delay between batches
- Parallel processing within each batch

### 4. Automatic Sync

The system automatically syncs in the following scenarios:

- When connection is restored (online event)
- Every 60 seconds if items are pending
- Immediately after queuing an action (if online)

### 5. Data Sanitization

All data is sanitized before syncing to prevent XSS attacks:

```typescript
// Automatically sanitizes string fields
const sanitized = sanitizeDataForSync({
  name: '<script>alert("xss")</script>',
  description: 'Normal text'
});
// Result: { name: 'scriptalert("xss")/script', description: 'Normal text' }
```

## Usage

### Basic Usage

```typescript
import { useOfflineActionQueue } from '@/hooks/useOfflineActionQueue';

function MyComponent() {
  const {
    queueAction,
    syncAll,
    syncStatus,
    isOnline,
    pendingCount
  } = useOfflineActionQueue();

  const handleSave = async () => {
    // Queue the action - it will sync automatically
    await queueAction('create', STORES.ANIMALS, animalData);
  };

  const handleManualSync = async () => {
    // Manually trigger sync
    await syncAll();
  };

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Pending: {pendingCount} items</p>
      <button onClick={handleSave}>Save Animal</button>
      <button onClick={handleManualSync}>Sync Now</button>
    </div>
  );
}
```

### Displaying Sync Status

```typescript
import { SyncStatusIndicator } from '@/components/SyncStatusIndicator';
import { useOfflineActionQueue } from '@/hooks/useOfflineActionQueue';

function Header() {
  const { syncStatus, syncAll, retryFailed, clearFailed } = useOfflineActionQueue();

  return (
    <header>
      {/* Compact view for header */}
      <SyncStatusIndicator
        syncStatus={syncStatus}
        onSync={syncAll}
        compact
      />
      
      {/* Full card view */}
      <SyncStatusIndicator
        syncStatus={syncStatus}
        onSync={syncAll}
        onRetryFailed={retryFailed}
        onClearFailed={clearFailed}
      />
    </header>
  );
}
```

### Handling Failed Items

```typescript
const {
  syncStatus,
  retryFailed,
  clearFailed
} = useOfflineActionQueue();

// Retry all failed items (resets retry count)
await retryFailed();

// Clear failed items from queue
await clearFailed();

// Check failed count
if (syncStatus.failedCount > 0) {
  console.log(`${syncStatus.failedCount} items failed to sync`);
}
```

## Configuration

Configuration constants in `src/utils/offlineActionQueue.ts`:

```typescript
export const SYNC_CONFIG = {
  MAX_RETRY_COUNT: 5,        // Maximum retry attempts
  BASE_RETRY_DELAY: 1000,    // Base delay (1 second)
  MAX_RETRY_DELAY: 60000,    // Maximum delay (1 minute)
  SYNC_INTERVAL: 60000,      // Auto-sync interval (1 minute)
  BATCH_SIZE: 10,            // Items per batch
  BATCH_DELAY: 500           // Delay between batches (ms)
};
```

## Supported Operations

### Animals
- Create: Add new animal
- Update: Update animal details
- Delete: Remove animal

### Health Records
- Create: Add health event (supports bulk vaccination)
- Update: Update health record
- Delete: Remove health record

### Milk Production
- Create: Add milk production record
- Update: Update production record
- Delete: Remove production record

### Market Listings
- Create: Add marketplace listing
- Update: Update listing details
- Delete: Remove listing

## Error Handling

### Network Errors
- Automatically queued for retry
- Exponential backoff applied
- User notified of offline status

### Validation Errors
- Not retried (permanent failure)
- User notified immediately
- Item removed from queue

### Rate Limiting
- Batch processing prevents overwhelming server
- Delays between batches
- Automatic retry with backoff

## Best Practices

### 1. Always Use Queue for Mutations

```typescript
// ✅ Good - Uses queue
await queueAction('create', STORES.ANIMALS, data);

// ❌ Bad - Direct database call
await supabase.from('animals').insert(data);
```

### 2. Check Online Status

```typescript
const { isOnline } = useOfflineActionQueue();

if (!isOnline) {
  showInfo('Offline', 'Changes will sync when online');
}
```

### 3. Show Sync Status to Users

```typescript
// Always show sync status in the UI
<SyncStatusIndicator syncStatus={syncStatus} compact />
```

### 4. Handle Failed Items

```typescript
// Provide UI for users to retry or clear failed items
if (syncStatus.failedCount > 0) {
  return (
    <Alert>
      <p>{syncStatus.failedCount} items failed to sync</p>
      <Button onClick={retryFailed}>Retry</Button>
      <Button onClick={clearFailed}>Clear</Button>
    </Alert>
  );
}
```

## Monitoring

### Sync Status

```typescript
interface SyncStatus {
  isOnline: boolean;           // Network status
  syncing: boolean;            // Currently syncing
  status: 'idle' | 'syncing' | 'error' | 'success';
  progress: {
    total: number;             // Total items to sync
    completed: number;         // Successfully synced
    failed: number;            // Failed in current sync
  };
  lastSyncTime: number | null; // Last successful sync
  pendingCount: number;        // Items waiting to sync
  failedCount: number;         // Items that exceeded max retries
}
```

### Logging

All sync operations are logged:

```typescript
// Debug logs (development only)
logger.debug('Queued action', { type, table, queueId });

// Info logs (all environments)
logger.info('Sync completed', { completed, failed });

// Error logs (all environments)
logger.error('Sync failed', error);
```

## Testing

### Manual Testing

1. **Offline Mode**
   - Open DevTools → Network tab
   - Set throttling to "Offline"
   - Perform create/update/delete operations
   - Verify items are queued
   - Restore connection
   - Verify automatic sync

2. **Failed Sync**
   - Modify data to cause validation error
   - Queue the action
   - Verify retry attempts
   - Verify failure after max retries

3. **Batch Processing**
   - Queue 20+ items
   - Monitor network tab
   - Verify batched requests

### Automated Testing

```typescript
// Example test
describe('Offline Action Queue', () => {
  it('should queue actions when offline', async () => {
    // Mock offline
    Object.defineProperty(navigator, 'onLine', { value: false });
    
    // Queue action
    const queueId = await queueAction('create', STORES.ANIMALS, data);
    
    // Verify queued
    expect(queueId).toBeDefined();
    expect(pendingCount).toBe(1);
  });
});
```

## Troubleshooting

### Items Not Syncing

1. Check network connection
2. Check browser console for errors
3. Verify user is authenticated
4. Check sync status page for failed items

### High Pending Count

1. Check if user is online
2. Manually trigger sync
3. Check for validation errors
4. Verify server is responding

### Failed Items

1. Review error logs
2. Check data validity
3. Retry failed items
4. Clear if data is invalid

## Future Enhancements

1. **Conflict Resolution**
   - Detect and resolve sync conflicts
   - Merge strategies for concurrent edits

2. **Selective Sync**
   - Allow users to choose what to sync
   - Priority-based syncing

3. **Compression**
   - Compress queue data to save space
   - Batch compression for network efficiency

4. **Analytics**
   - Track sync success rates
   - Monitor queue sizes
   - Identify problematic operations

## Related Documentation

- [Offline Functionality](./OFFLINE_FUNCTIONALITY.md)
- [IndexedDB Usage](./INDEXEDDB.md)
- [Design System](./DESIGN_SYSTEM.md)

---

**Last Updated:** January 2025  
**Version:** 1.0
