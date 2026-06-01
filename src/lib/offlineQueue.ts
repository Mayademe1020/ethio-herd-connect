import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { logger } from '@/utils/logger';

// Queue action types
export type QueueActionType =
  | 'animal_registration'
  | 'animal_update'
  | 'milk_record'
  | 'update_milk_record'
  | 'listing_creation'
  | 'listing_update'
  | 'buyer_interest'
  | 'pregnancy_record'
  | 'birth_record'
  | 'pregnancy_terminate'
  | 'create_notification'
  | 'mark_notification_read'
  | 'mark_all_notifications_read'
  | 'muzzle_registration'
  | 'muzzle_duplicate_event'
  | 'health_record'
  | 'update_health_record'
  | 'delete_health_record';

// Queue item interface
export interface QueueItem {
  id: string;
  action_type: QueueActionType; // Changed to match test expectations
  payload: unknown;
  status: 'pending' | 'processing' | 'failed' | 'completed' | 'synced';
  retry_count: number; // Changed to match test expectations
  created_at: string; // Changed to match test expectations
  last_attempt_at?: string;
  synced_at?: string;
  error?: string;
}

// IndexedDB schema
interface OfflineQueueDB extends DBSchema {
  queue: {
    key: string;
    value: QueueItem;
    indexes: { 'by-status': string; 'by-created': string };
  };
}

const DB_NAME = 'ethio-herd-offline-queue';
const DB_VERSION = 1;
const STORE_NAME = 'queue';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // 1s, 2s, 4s, 8s, 16s

class OfflineQueueManager {
  private db: IDBPDatabase<OfflineQueueDB> | null = null;
  private processingQueue = false;
  private listeners: Set<() => void> = new Set();
  private memoryStore: Map<string, QueueItem> = new Map();
  private useMemoryFallback = false;

  async init() {
    if (this.db) return;
    if (this.useMemoryFallback) return;

    try {
      this.db = await openDB<OfflineQueueDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('by-status', 'status');
            store.createIndex('by-created', 'createdAt');
          }
        },
      });
    } catch {
      this.useMemoryFallback = true;
    }
  }

  // Force memory-only mode (used in test environments)
  forceMemoryOnly(): void {
    this.db = null;
    this.useMemoryFallback = true;
  }

  // Add item to queue
  async addToQueue(actionType: QueueActionType, payload: unknown): Promise<string> {
    await this.init();

    const item: QueueItem = {
      id: `${actionType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action_type: actionType,
      payload,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };

    if (this.useMemoryFallback) {
      this.memoryStore.set(item.id, item);
    } else {
      await this.db!.add(STORE_NAME, item);
    }
    this.notifyListeners();

    // Try to process immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return item.id;
  }

  // Simplified add method that stores in memory for synchronous access
  add(data: { action_type: QueueActionType; payload: unknown }): QueueItem {
    const item: QueueItem = {
      id: `${data.action_type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      action_type: data.action_type,
      payload: data.payload,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };

    this.memoryStore.set(item.id, item);

    return item;
  }

  // Get all items synchronously (for tests)
  getAll(): QueueItem[] {
    return Array.from(this.memoryStore.values());
  }

  // Clear all items
  clear(): void {
    this.memoryStore.clear();
    if (this.db) {
      this.db.clear(STORE_NAME).catch((err) => logger.warn('Failed to clear offline queue:', err));
    }
  }

  // Get all pending items
  async getPendingItems(): Promise<QueueItem[]> {
    await this.init();
    const memoryItems = Array.from(this.memoryStore.values()).filter(i => i.status === 'pending');
    if (this.useMemoryFallback) return memoryItems;
    const tx = this.db!.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-status');
    const dbItems = await index.getAll('pending');
    const dbMap = new Map(dbItems.map(i => [i.id, i]));
    for (const item of memoryItems) {
      if (!dbMap.has(item.id)) dbMap.set(item.id, item);
    }
    return Array.from(dbMap.values());
  }

  // Get all items (for display)
  async getAllItems(): Promise<QueueItem[]> {
    await this.init();
    const memoryItems = Array.from(this.memoryStore.values());
    if (this.useMemoryFallback) return memoryItems;
    const dbItems = await this.db!.getAll(STORE_NAME);
    const dbMap = new Map(dbItems.map(i => [i.id, i]));
    for (const item of memoryItems) {
      if (!dbMap.has(item.id)) dbMap.set(item.id, item);
    }
    return Array.from(dbMap.values());
  }

  // Get pending count
  async getPendingCount(): Promise<number> {
    const items = await this.getPendingItems();
    return items.length;
  }

  // Update item status
  async updateItem(id: string, updates: Partial<QueueItem>) {
    await this.init();
    const existing = this.memoryStore.get(id);
    if (existing) {
      this.memoryStore.set(id, { ...existing, ...updates } as QueueItem);
    }
    if (!this.useMemoryFallback) {
      const dbItem = await this.db!.get(STORE_NAME, id);
      if (dbItem) {
        await this.db!.put(STORE_NAME, { ...dbItem, ...updates });
      }
    }
    this.notifyListeners();
  }

  // Remove item from queue
  async removeItem(id: string) {
    await this.init();
    this.memoryStore.delete(id);
    if (!this.useMemoryFallback) {
      await this.db!.delete(STORE_NAME, id);
    }
    this.notifyListeners();
  }

  // Process queue with retry logic
  async processQueue(): Promise<{ processed: number; failed: number; total: number }> {
    if (this.processingQueue || !navigator.onLine) {
      return { processed: 0, failed: 0, total: 0 };
    }

    this.processingQueue = true;
    this.notifyListeners();

    let processed = 0;
    let failed = 0;
    let total = 0;

    try {
      const pendingItems = await this.getPendingItems();
      total = pendingItems.length;

      for (const item of pendingItems) {
        try {
          // Mark as processing
          await this.updateItem(item.id, {
            status: 'processing',
            last_attempt_at: new Date().toISOString(),
          });

          // Process the item
          await this.processItem(item);

          // Mark as synced on success
          await this.updateItem(item.id, {
            status: 'synced',
            synced_at: new Date().toISOString(),
          });
          
          processed++;
        } catch (error) {
          // Handle retry logic
          const newRetryCount = item.retry_count + 1;

          if (newRetryCount >= MAX_RETRIES) {
            // Max retries reached, mark as failed
            await this.updateItem(item.id, {
              status: 'failed',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
            failed++;
          } else {
            // Schedule retry with exponential backoff
            await this.updateItem(item.id, {
              status: 'pending',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Unknown error',
            });

            // Wait before next retry
            const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } finally {
      this.processingQueue = false;
      this.notifyListeners();
    }

    return { processed, failed, total };
  }

  // Process individual item based on action type
  private async processItem(item: QueueItem): Promise<void> {
    const { action_type, payload: rawPayload } = item;
    // Per-action-type payload narrowing is not yet implemented; cast to any for supabase operations.
    const payload = rawPayload as any;

    // Import Supabase client
    const { supabase } = await import('@/integrations/supabase/client');

    switch (action_type) {
      case 'animal_registration': {
        const { data, error } = await supabase
          .from('animals')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        break;
      }

      case 'milk_record': {
        const { data, error } = await supabase
          .from('milk_production')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        break;
      }

      case 'listing_creation': {
        const { data, error } = await supabase
          .from('market_listings')
          .insert(payload)
          .select()
          .single();
        
        if (error) throw error;
        break;
      }

      case 'buyer_interest': {
        const { data, error } = await supabase
          .from('buyer_interests')
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        break;
      }

      case 'muzzle_registration': {
        const { data, error } = await supabase
          .from('muzzle_registrations' as any)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        break;
      }

      case 'muzzle_duplicate_event': {
        const { data, error } = await supabase
          .from('muzzle_duplicate_events' as any)
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        break;
      }

      case 'animal_update': {
        const { error } = await supabase
          .from('animals')
          .update(payload)
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'update_milk_record': {
        const { error } = await supabase
          .from('milk_production')
          .update(payload)
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'listing_update': {
        const { error } = await supabase
          .from('market_listings')
          .update(payload)
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'pregnancy_record': {
        const { error } = await supabase
          .from('pregnancy_records' as any)
          .insert(payload);
        
        if (error) throw error;
        break;
      }

      case 'birth_record': {
        const { error } = await supabase
          .from('animals')
          .insert(payload);
        
        if (error) throw error;
        break;
      }

      case 'pregnancy_terminate': {
        const { error } = await supabase
          .from('pregnancy_records' as any)
          .update({ status: 'terminated' })
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'create_notification': {
        const { error } = await supabase
          .from('notifications' as any)
          .insert(payload);
        
        if (error) throw error;
        break;
      }

      case 'mark_notification_read': {
        const { error } = await supabase
          .from('notifications' as any)
          .update({ is_read: true })
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'mark_all_notifications_read': {
        const { error } = await supabase
          .from('notifications' as any)
          .update({ is_read: true })
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'health_record': {
        const { error } = await supabase
          .from('health_records')
          .insert(payload);
        
        if (error) throw error;
        break;
      }

      case 'update_health_record': {
        const { error } = await supabase
          .from('health_records')
          .update(payload)
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      case 'delete_health_record': {
        const { error } = await supabase
          .from('health_records')
          .delete()
          .eq('id', payload.id)
          .eq('user_id', payload.user_id);
        
        if (error) throw error;
        break;
      }

      default:
        throw new Error(`Unknown action type: ${action_type}`);
    }
  }

  // Retry failed items
  async retryFailedItems() {
    await this.init();
    if (this.useMemoryFallback) {
      for (const [id, item] of this.memoryStore) {
        if (item.status === 'failed') {
          this.memoryStore.set(id, { ...item, status: 'pending', retry_count: 0, error: undefined });
        }
      }
      this.notifyListeners();
      if (navigator.onLine) this.processQueue();
      return;
    }
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const failedItems = await index.getAll('failed');

    for (const item of failedItems) {
      await tx.store.put({
        ...item,
        status: 'pending',
        retry_count: 0,
        error: undefined,
      });
    }

    await tx.done;
    this.notifyListeners();
    
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  // Clear completed items (cleanup)
  async clearCompleted() {
    await this.init();
    if (this.useMemoryFallback) {
      for (const [id, item] of this.memoryStore) {
        if (item.status === 'completed' || item.status === 'synced') {
          this.memoryStore.delete(id);
        }
      }
      this.notifyListeners();
      return;
    }
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const completedItems = await index.getAll('completed');

    for (const item of completedItems) {
      await tx.store.delete(item.id);
    }

    await tx.done;
    this.notifyListeners();
  }

  // Subscribe to queue changes
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Check if currently processing
  isProcessing(): boolean {
    return this.processingQueue;
  }

  // Get retry delay for a given retry count
  getRetryDelay(retryCount: number): number {
    return RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSyncAt?: string;
  } {
    return {
      isOnline: navigator.onLine,
      isSyncing: this.processingQueue,
      pendingCount: Array.from(this.memoryStore.values()).filter(i => i.status === 'pending').length,
      lastSyncAt: undefined,
    };
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueueManager();

// Initialize on module load
offlineQueue.init();

// Auto-process queue when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    offlineQueue.processQueue();
  });
}
