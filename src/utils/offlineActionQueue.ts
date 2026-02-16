/**
 * Offline Action Queue Manager
 * Handles queuing, syncing, and retry logic for offline actions
 * Optimized for Ethiopian farmers with intermittent connectivity
 */

import { supabase } from '@/integrations/supabase/client';
import { logger } from './logger';
import {
  addToSyncQueue,
  getSyncQueue,
  removeFromSyncQueue,
  updateSyncQueueRetryCount,
  STORES,
  StoreName
} from './indexedDB';
import { sanitizeInput } from './animalIdGenerator';

// Configuration
export const SYNC_CONFIG = {
  MAX_RETRY_COUNT: 5,
  BASE_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_DELAY: 60000, // 1 minute
  SYNC_INTERVAL: 60000, // 1 minute
  BATCH_SIZE: 10, // Process 10 items at a time
  BATCH_DELAY: 500 // 500ms delay between batches
} as const;

export interface QueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: StoreName;
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
  error?: string;
}

export interface SyncResult {
  success: boolean;
  completed: number;
  failed: number;
  errors: Array<{ itemId: string; error: string }>;
}

export interface SyncProgress {
  total: number;
  completed: number;
  failed: number;
  currentItem?: string;
}

/**
 * Calculate exponential backoff delay with jitter
 */
export const calculateRetryDelay = (retryCount: number): number => {
  const exponentialDelay = SYNC_CONFIG.BASE_RETRY_DELAY * Math.pow(2, retryCount);
  const cappedDelay = Math.min(exponentialDelay, SYNC_CONFIG.MAX_RETRY_DELAY);
  
  // Add jitter (±20%) to prevent thundering herd
  const jitter = cappedDelay * 0.2 * (Math.random() - 0.5);
  
  return Math.floor(cappedDelay + jitter);
};

/**
 * Sanitize data before syncing to prevent XSS
 */
export const sanitizeDataForSync = (data: any): any => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sanitized = { ...data };
  
  // Sanitize all string fields
  const stringFields = [
    'name', 'description', 'notes', 'symptoms', 'medicine_name',
    'group_name', 'title', 'breed', 'location', 'tag_number',
    'treatment', 'diagnosis', 'veterinarian', 'comments'
  ];

  for (const field of stringFields) {
    if (typeof sanitized[field] === 'string') {
      sanitized[field] = sanitizeInput(sanitized[field]);
    }
  }

  return sanitized;
};

/**
 * Map store names to actual database table names
 */
const getTableName = (storeName: StoreName): string => {
  const tableMap: Record<string, string> = {
    [STORES.ANIMALS]: 'animals',
    [STORES.HEALTH_RECORDS]: 'health_records',
    [STORES.MILK_PRODUCTION]: 'milk_production',
    [STORES.MARKET_LISTINGS]: 'market_listings'
  };

  return tableMap[storeName] || storeName;
};

/**
 * Execute a single sync operation
 */
export const executeSyncOperation = async (
  type: 'create' | 'update' | 'delete',
  table: string,
  data: any
): Promise<{ success: boolean; error?: string }> => {
  try {
    let result: any;

    switch (type) {
      case 'create':
        // Handle special cases
        if (table === 'health_records' && data.animalIds && Array.isArray(data.animalIds)) {
          // Bulk vaccination
          const healthRecords = data.animalIds.map((animalId: string) => ({
            animal_id: animalId,
            user_id: data.user_id,
            record_type: 'vaccination',
            medicine_name: data.medicine,
            administered_date: data.date,
            notes: data.notes
          }));
          result = await supabase.from(table as any).insert(healthRecords);
        } else {
          result = await supabase.from(table as any).insert([data]);
        }
        break;

      case 'update':
        result = await supabase
          .from(table as any)
          .update(data)
          .eq('id', data.id)
          .eq('user_id', data.user_id);
        break;

      case 'delete':
        result = await supabase
          .from(table as any)
          .delete()
          .eq('id', data.id)
          .eq('user_id', data.user_id);
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    if (result?.error) {
      throw result.error;
    }

    logger.info(`Successfully executed ${type} on ${table}`, { dataId: data.id });
    return { success: true };
  } catch (error: any) {
    const errorMessage = error?.message || 'Unknown error';
    logger.error(`Failed to execute ${type} on ${table}`, error);
    return { success: false, error: errorMessage };
  }
};

/**
 * Sync a single queue item with retry logic
 */
export const syncQueueItem = async (item: QueueItem): Promise<boolean> => {
  try {
    // Apply exponential backoff delay if this is a retry
    if (item.retryCount > 0) {
      const delay = calculateRetryDelay(item.retryCount);
      logger.debug(`Applying retry delay of ${delay}ms for item ${item.id}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Sanitize data before syncing
    const sanitizedData = sanitizeDataForSync(item.data);
    const tableName = getTableName(item.table);

    // Execute the sync operation
    const result = await executeSyncOperation(item.type, tableName, sanitizedData);

    if (result.success) {
      // Remove from queue on success
      await removeFromSyncQueue(item.id);
      logger.info(`Successfully synced item ${item.id}`, {
        type: item.type,
        table: item.table
      });
      return true;
    } else {
      // Update retry count on failure
      const newRetryCount = item.retryCount + 1;
      await updateSyncQueueRetryCount(item.id, newRetryCount);
      
      logger.warn(`Failed to sync item ${item.id}, retry ${newRetryCount}/${SYNC_CONFIG.MAX_RETRY_COUNT}`, {
        error: result.error
      });
      
      return false;
    }
  } catch (error) {
    logger.error(`Error syncing queue item ${item.id}`, error);
    
    // Update retry count
    const newRetryCount = item.retryCount + 1;
    await updateSyncQueueRetryCount(item.id, newRetryCount);
    
    return false;
  }
};

/**
 * Sync all pending items in batches
 */
export const syncAllPendingItems = async (
  userId: string,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncResult> => {
  try {
    logger.info('Starting sync for all pending items', { userId });

    // Get all pending items
    const queue = await getSyncQueue(userId);
    const itemsToSync = queue.filter(
      item => item.retryCount < SYNC_CONFIG.MAX_RETRY_COUNT
    );

    if (itemsToSync.length === 0) {
      logger.info('No items to sync');
      return { success: true, completed: 0, failed: 0, errors: [] };
    }

    logger.info(`Found ${itemsToSync.length} items to sync`);

    let completed = 0;
    let failed = 0;
    const errors: Array<{ itemId: string; error: string }> = [];

    // Process items in batches to avoid overwhelming the server
    for (let i = 0; i < itemsToSync.length; i += SYNC_CONFIG.BATCH_SIZE) {
      const batch = itemsToSync.slice(i, i + SYNC_CONFIG.BATCH_SIZE);
      
      logger.debug(`Processing batch ${Math.floor(i / SYNC_CONFIG.BATCH_SIZE) + 1}`, {
        batchSize: batch.length
      });

      // Process batch items in parallel
      const batchResults = await Promise.all(
        batch.map(async (item) => {
          // Report progress
          if (onProgress) {
            onProgress({
              total: itemsToSync.length,
              completed,
              failed,
              currentItem: `${item.type} ${item.table}`
            });
          }

          const success = await syncQueueItem(item);
          
          if (success) {
            completed++;
          } else {
            failed++;
            errors.push({
              itemId: item.id,
              error: `Failed to sync ${item.type} on ${item.table}`
            });
          }

          return success;
        })
      );

      // Delay between batches to avoid rate limiting
      if (i + SYNC_CONFIG.BATCH_SIZE < itemsToSync.length) {
        await new Promise(resolve => setTimeout(resolve, SYNC_CONFIG.BATCH_DELAY));
      }
    }

    // Final progress update
    if (onProgress) {
      onProgress({
        total: itemsToSync.length,
        completed,
        failed
      });
    }

    logger.info('Sync completed', { completed, failed, errors: errors.length });

    return {
      success: completed > 0,
      completed,
      failed,
      errors
    };
  } catch (error) {
    logger.error('Failed to sync pending items', error);
    throw error;
  }
};

/**
 * Queue an action for offline sync
 */
export const queueOfflineAction = async (
  type: 'create' | 'update' | 'delete',
  table: StoreName,
  data: any,
  userId: string
): Promise<string> => {
  try {
    // Sanitize data before queuing
    const sanitizedData = sanitizeDataForSync(data);
    
    // Add to sync queue
    const queueId = await addToSyncQueue(type, table, sanitizedData, userId);
    
    logger.info(`Queued ${type} action for ${table}`, {
      queueId,
      dataId: data.id
    });

    return queueId;
  } catch (error) {
    logger.error('Failed to queue offline action', error);
    throw error;
  }
};

/**
 * Get pending items count
 */
export const getPendingItemsCount = async (userId: string): Promise<number> => {
  try {
    const queue = await getSyncQueue(userId);
    return queue.filter(item => item.retryCount < SYNC_CONFIG.MAX_RETRY_COUNT).length;
  } catch (error) {
    logger.error('Failed to get pending items count', error);
    return 0;
  }
};

/**
 * Get failed items (exceeded max retries)
 */
export const getFailedItems = async (userId: string): Promise<QueueItem[]> => {
  try {
    const queue = await getSyncQueue(userId);
    return queue.filter(item => item.retryCount >= SYNC_CONFIG.MAX_RETRY_COUNT);
  } catch (error) {
    logger.error('Failed to get failed items', error);
    return [];
  }
};

/**
 * Retry failed items (reset retry count)
 */
export const retryFailedItems = async (userId: string): Promise<number> => {
  try {
    const failedItems = await getFailedItems(userId);
    
    for (const item of failedItems) {
      await updateSyncQueueRetryCount(item.id, 0);
    }

    logger.info(`Reset retry count for ${failedItems.length} failed items`);
    return failedItems.length;
  } catch (error) {
    logger.error('Failed to retry failed items', error);
    return 0;
  }
};

/**
 * Clear failed items from queue
 */
export const clearFailedItems = async (userId: string): Promise<number> => {
  try {
    const failedItems = await getFailedItems(userId);
    
    for (const item of failedItems) {
      await removeFromSyncQueue(item.id);
    }

    logger.info(`Cleared ${failedItems.length} failed items from queue`);
    return failedItems.length;
  } catch (error) {
    logger.error('Failed to clear failed items', error);
    return 0;
  }
};
