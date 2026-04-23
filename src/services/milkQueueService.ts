// src/services/milkQueueService.ts
// Handles milk recording with offline support

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { supabase } from '@/integrations/supabase/client';

// Milk record queue item
export interface MilkQueueItem {
  id: string;
  animal_id: string;
  user_id: string;
  liters: number;
  recorded_at: string;
  notes?: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retry_count: number;
  created_at: string;
  synced_at?: string;
  error?: string;
}

// IndexedDB schema
interface MilkQueueDB extends DBSchema {
  milk_records: {
    key: string;
    value: MilkQueueItem;
    indexes: { 'by-status': string; 'by-animal': string; 'by-created': string };
  };
}

const DB_NAME = 'ethio-herd-milk-queue';
const DB_VERSION = 1;
const STORE_NAME = 'milk_records';

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAYS = [2000, 5000, 10000, 20000, 30000]; // 2s, 5s, 10s, 20s, 30s

class MilkQueueService {
  private db: IDBPDatabase<MilkQueueDB> | null = null;
  private isProcessing = false;
  private listeners: Set<() => void> = new Set();

  async init() {
    if (this.db) return;

    this.db = await openDB<MilkQueueDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-animal', 'animal_id');
          store.createIndex('by-created', 'created_at');
        }
      },
    });
  }

  // Queue a milk record (for offline use)
  async queueMilkRecord(
    animalId: string,
    userId: string,
    liters: number,
    notes?: string
  ): Promise<string> {
    await this.init();

    const item: MilkQueueItem = {
      id: `milk_${animalId}_${Date.now()}`,
      animal_id: animalId,
      user_id: userId,
      liters,
      recorded_at: new Date().toISOString(),
      notes,
      status: 'pending',
      retry_count: 0,
      created_at: new Date().toISOString(),
    };

    await this.db!.add(STORE_NAME, item);
    this.notifyListeners();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processQueue();
    }

    return item.id;
  }

  // Save milk record (online: save directly, offline: queue)
  async saveMilkRecord(
    animalId: string,
    userId: string,
    liters: number,
    notes?: string
  ): Promise<{ success: boolean; queued: boolean; id?: string; error?: string }> {
    // If offline, queue it
    if (!navigator.onLine) {
      const id = await this.queueMilkRecord(animalId, userId, liters, notes);
      return { success: true, queued: true, id };
    }

    // If online, try to save directly
    try {
      const { data, error } = await supabase
        .from('milk_production')
        .insert({
          animal_id: animalId,
          user_id: userId,
          liters,
          recorded_at: new Date().toISOString(),
          notes,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, queued: false, id: data?.id };
    } catch (error) {
      console.warn('Direct save failed, queuing:', error);
      // Fallback to queue
      const id = await this.queueMilkRecord(animalId, userId, liters, notes);
      return { success: true, queued: true, id };
    }
  }

  // Process the queue (sync pending records)
  async processQueue(): Promise<{ synced: number; failed: number; total: number }> {
    if (this.isProcessing || !navigator.onLine) {
      return { synced: 0, failed: 0, total: 0 };
    }

    this.isProcessing = true;
    this.notifyListeners();

    let synced = 0;
    let failed = 0;
    let total = 0;

    try {
      await this.init();
      const pendingRecords = await this.getPendingRecords();
      total = pendingRecords.length;

      for (const record of pendingRecords) {
        try {
          // Mark as syncing
          await this.updateRecord(record.id, { status: 'syncing' });

          // Try to save to Supabase
          const { error } = await supabase
            .from('milk_production')
            .insert({
              animal_id: record.animal_id,
              user_id: record.user_id,
              liters: record.liters,
              recorded_at: record.recorded_at,
              notes: record.notes,
            });

          if (error) throw error;

          // Mark as synced
          await this.updateRecord(record.id, {
            status: 'synced',
            synced_at: new Date().toISOString(),
          });

          synced++;
        } catch (error) {
          const newRetryCount = record.retry_count + 1;

          if (newRetryCount >= MAX_RETRIES) {
            await this.updateRecord(record.id, {
              status: 'failed',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Sync failed',
            });
            failed++;
          } else {
            await this.updateRecord(record.id, {
              status: 'pending',
              retry_count: newRetryCount,
              error: error instanceof Error ? error.message : 'Sync failed',
            });

            // Wait before retry
            const delay = RETRY_DELAYS[newRetryCount - 1] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
    } finally {
      this.isProcessing = false;
      this.notifyListeners();
    }

    return { synced, failed, total };
  }

  // Get pending records
  private async getPendingRecords(): Promise<MilkQueueItem[]> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-status');
    return await index.getAll('pending');
  }

  // Update a record
  private async updateRecord(id: string, updates: Partial<MilkQueueItem>) {
    await this.init();
    const record = await this.db!.get(STORE_NAME, id);
    if (record) {
      await this.db!.put(STORE_NAME, { ...record, ...updates });
      this.notifyListeners();
    }
  }

  // Get all records for an animal
  async getRecordsForAnimal(animalId: string): Promise<MilkQueueItem[]> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readonly');
    const index = tx.store.index('by-animal');
    return await index.getAll(animalId);
  }

  // Get queue stats
  async getStats(): Promise<{
    pending: number;
    syncing: number;
    synced: number;
    failed: number;
    total: number;
  }> {
    await this.init();
    const all = await this.db!.getAll(STORE_NAME);
    return {
      pending: all.filter(r => r.status === 'pending').length,
      syncing: all.filter(r => r.status === 'syncing').length,
      synced: all.filter(r => r.status === 'synced').length,
      failed: all.filter(r => r.status === 'failed').length,
      total: all.length,
    };
  }

  // Retry failed records
  async retryFailed(): Promise<void> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const failed = await index.getAll('failed');

    for (const record of failed) {
      await tx.store.put({
        ...record,
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

  // Clear old synced records (cleanup)
  async cleanup(): Promise<number> {
    await this.init();
    const tx = this.db!.transaction(STORE_NAME, 'readwrite');
    const index = tx.store.index('by-status');
    const synced = await index.getAll('synced');

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let cleared = 0;
    for (const record of synced) {
      if (record.synced_at && new Date(record.synced_at) < sevenDaysAgo) {
        await tx.store.delete(record.id);
        cleared++;
      }
    }

    await tx.done;
    this.notifyListeners();
    return cleared;
  }

  // Subscribe to changes
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  // Check if processing
  isProcessingQueue(): boolean {
    return this.isProcessing;
  }
}

// Singleton instance
export const milkQueueService = new MilkQueueService();

// Initialize on module load
milkQueueService.init();

// Auto-process when coming online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    setTimeout(() => milkQueueService.processQueue(), 1000);
  });
}

// Periodic cleanup (every 24 hours)
if (typeof window !== 'undefined') {
  setInterval(() => {
    milkQueueService.cleanup();
  }, 24 * 60 * 60 * 1000);
}
