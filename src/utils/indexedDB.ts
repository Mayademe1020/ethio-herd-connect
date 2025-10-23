/**
 * IndexedDB utility for offline data caching
 * Optimized for Ethiopian farmers with limited connectivity
 */

import { logger } from './logger';

const DB_NAME = 'ethio-herd-connect-offline';
const DB_VERSION = 1;

// Store names for different data types
export const STORES = {
  ANIMALS: 'animals',
  HEALTH_RECORDS: 'health_records',
  MILK_PRODUCTION: 'milk_production',
  MARKET_LISTINGS: 'market_listings',
  SYNC_QUEUE: 'sync_queue',
  METADATA: 'metadata'
} as const;

export type StoreName = typeof STORES[keyof typeof STORES];

interface CachedData<T = any> {
  id: string;
  data: T;
  timestamp: number;
  userId: string;
  synced?: boolean;
}

interface SyncQueueItem {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: StoreName;
  data: any;
  timestamp: number;
  retryCount: number;
  userId: string;
}

/**
 * Initialize IndexedDB database with required object stores
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      logger.error('Failed to open IndexedDB', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      logger.debug('IndexedDB opened successfully');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains(STORES.ANIMALS)) {
        const animalStore = db.createObjectStore(STORES.ANIMALS, { keyPath: 'id' });
        animalStore.createIndex('userId', 'userId', { unique: false });
        animalStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.HEALTH_RECORDS)) {
        const healthStore = db.createObjectStore(STORES.HEALTH_RECORDS, { keyPath: 'id' });
        healthStore.createIndex('userId', 'userId', { unique: false });
        healthStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.MILK_PRODUCTION)) {
        const milkStore = db.createObjectStore(STORES.MILK_PRODUCTION, { keyPath: 'id' });
        milkStore.createIndex('userId', 'userId', { unique: false });
        milkStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.MARKET_LISTINGS)) {
        const marketStore = db.createObjectStore(STORES.MARKET_LISTINGS, { keyPath: 'id' });
        marketStore.createIndex('userId', 'userId', { unique: false });
        marketStore.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        const syncStore = db.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id' });
        syncStore.createIndex('userId', 'userId', { unique: false });
        syncStore.createIndex('timestamp', 'timestamp', { unique: false });
        syncStore.createIndex('type', 'type', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.METADATA)) {
        db.createObjectStore(STORES.METADATA, { keyPath: 'key' });
      }

      logger.info('IndexedDB schema created/updated');
    };
  });
};

/**
 * Cache data to IndexedDB
 */
export const cacheData = async <T>(
  storeName: StoreName,
  data: T[],
  userId: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    const timestamp = Date.now();

    for (const item of data) {
      const cachedItem: CachedData<T> = {
        id: (item as any).id || `${Date.now()}-${Math.random()}`,
        data: item,
        timestamp,
        userId,
        synced: true
      };
      store.put(cachedItem);
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Cached ${data.length} items to ${storeName}`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error(`Failed to cache data to ${storeName}`, transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error(`Error caching data to ${storeName}`, error);
    throw error;
  }
};

/**
 * Get cached data from IndexedDB
 */
export const getCachedData = async <T>(
  storeName: StoreName,
  userId: string
): Promise<T[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('userId');

    const request = index.getAll(userId);

    const result = await new Promise<CachedData<T>[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        logger.error(`Failed to get cached data from ${storeName}`, request.error);
        reject(request.error);
      };
    });

    db.close();

    // Return just the data, not the wrapper
    return result.map(item => item.data);
  } catch (error) {
    logger.error(`Error getting cached data from ${storeName}`, error);
    return [];
  }
};

/**
 * Get a single cached item by ID
 */
export const getCachedItem = async <T>(
  storeName: StoreName,
  id: string
): Promise<T | null> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    const request = store.get(id);

    const result = await new Promise<CachedData<T> | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        logger.error(`Failed to get cached item from ${storeName}`, request.error);
        reject(request.error);
      };
    });

    db.close();

    return result ? result.data : null;
  } catch (error) {
    logger.error(`Error getting cached item from ${storeName}`, error);
    return null;
  }
};

/**
 * Clear cached data for a specific store
 */
export const clearCachedData = async (
  storeName: StoreName,
  userId?: string
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    if (userId) {
      // Clear only data for specific user
      const index = store.index('userId');
      const request = index.openCursor(userId);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };
    } else {
      // Clear all data
      store.clear();
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Cleared cached data from ${storeName}`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error(`Failed to clear cached data from ${storeName}`, transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error(`Error clearing cached data from ${storeName}`, error);
    throw error;
  }
};

/**
 * Add item to sync queue
 */
export const addToSyncQueue = async (
  type: 'create' | 'update' | 'delete',
  table: StoreName,
  data: any,
  userId: string
): Promise<string> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);

    const queueItem: SyncQueueItem = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      table,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      userId
    };

    store.add(queueItem);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Added ${type} action to sync queue for ${table}`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error('Failed to add to sync queue', transaction.error);
        reject(transaction.error);
      };
    });

    db.close();

    return queueItem.id;
  } catch (error) {
    logger.error('Error adding to sync queue', error);
    throw error;
  }
};

/**
 * Get all items from sync queue
 */
export const getSyncQueue = async (userId: string): Promise<SyncQueueItem[]> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readonly');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);
    const index = store.index('userId');

    const request = index.getAll(userId);

    const result = await new Promise<SyncQueueItem[]>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        logger.error('Failed to get sync queue', request.error);
        reject(request.error);
      };
    });

    db.close();

    return result;
  } catch (error) {
    logger.error('Error getting sync queue', error);
    return [];
  }
};

/**
 * Remove item from sync queue
 */
export const removeFromSyncQueue = async (id: string): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);

    store.delete(id);

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Removed item ${id} from sync queue`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error('Failed to remove from sync queue', transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error('Error removing from sync queue', error);
    throw error;
  }
};

/**
 * Update retry count for sync queue item
 */
export const updateSyncQueueRetryCount = async (
  id: string,
  retryCount: number
): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.SYNC_QUEUE], 'readwrite');
    const store = transaction.objectStore(STORES.SYNC_QUEUE);

    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        item.retryCount = retryCount;
        store.put(item);
      }
    };

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Updated retry count for ${id} to ${retryCount}`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error('Failed to update retry count', transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error('Error updating retry count', error);
    throw error;
  }
};

/**
 * Get metadata value
 */
export const getMetadata = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.METADATA], 'readonly');
    const store = transaction.objectStore(STORES.METADATA);

    const request = store.get(key);

    const result = await new Promise<any>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => {
        logger.error('Failed to get metadata', request.error);
        reject(request.error);
      };
    });

    db.close();

    return result;
  } catch (error) {
    logger.error('Error getting metadata', error);
    return null;
  }
};

/**
 * Set metadata value
 */
export const setMetadata = async (key: string, value: any): Promise<void> => {
  try {
    const db = await initDB();
    const transaction = db.transaction([STORES.METADATA], 'readwrite');
    const store = transaction.objectStore(STORES.METADATA);

    store.put({ key, value, timestamp: Date.now() });

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.debug(`Set metadata ${key}`);
        resolve();
      };
      transaction.onerror = () => {
        logger.error('Failed to set metadata', transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error('Error setting metadata', error);
    throw error;
  }
};

/**
 * Get database size estimate
 */
export const getDBSize = async (): Promise<number> => {
  try {
    if ('estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return estimate.usage || 0;
    }
    return 0;
  } catch (error) {
    logger.error('Error getting DB size', error);
    return 0;
  }
};

/**
 * Clear all offline data (for logout or reset)
 */
export const clearAllOfflineData = async (): Promise<void> => {
  try {
    const db = await initDB();
    const storeNames = [
      STORES.ANIMALS,
      STORES.HEALTH_RECORDS,
      STORES.MILK_PRODUCTION,
      STORES.MARKET_LISTINGS,
      STORES.SYNC_QUEUE,
      STORES.METADATA
    ];

    const transaction = db.transaction(storeNames, 'readwrite');

    for (const storeName of storeNames) {
      const store = transaction.objectStore(storeName);
      store.clear();
    }

    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => {
        logger.info('Cleared all offline data');
        resolve();
      };
      transaction.onerror = () => {
        logger.error('Failed to clear all offline data', transaction.error);
        reject(transaction.error);
      };
    });

    db.close();
  } catch (error) {
    logger.error('Error clearing all offline data', error);
    throw error;
  }
};
