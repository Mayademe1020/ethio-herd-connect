/**
 * Offline Functionality Test Suite
 * Tests all features in airplane mode, sync restoration, manual sync, retry logic, and sync status
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { offlineQueue } from '../lib/offlineQueue';

// Mock Supabase
const mockSupabase = {
  from: vi.fn(() => ({
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn()
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn()
        }))
      }))
    })),
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        single: vi.fn()
      }))
    }))
  })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({
      data: { user: { id: 'test-user-id' } },
      error: null
    }))
  }
};

vi.mock('../integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

describe('Offline Functionality Tests', () => {
  let originalOnLine: boolean;

  beforeEach(() => {
    // Store original online status
    originalOnLine = navigator.onLine;
    
    // Clear offline queue
    offlineQueue.clear();
    
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore online status
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: originalOnLine
    });
  });

  describe('Airplane Mode - Queue Operations', () => {
    it('should queue animal registration when offline', () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Offline Cow', type: 'cattle', subtype: 'Cow' }
      });

      const queuedItems = offlineQueue.getAll();
      expect(queuedItems.length).toBeGreaterThan(0);
      
      const queuedAnimal = queuedItems.find(
        item => item.action_type === 'animal_registration'
      );
      expect(queuedAnimal).toBeDefined();
      expect(queuedAnimal?.payload.name).toBe('Offline Cow');
      expect(queuedAnimal?.status).toBe('pending');
    });

    it('should queue milk record when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test-animal-id', liters: 5.5, session: 'morning' }
      });

      const queuedItems = offlineQueue.getAll();
      const queuedMilk = queuedItems.find(
        item => item.action_type === 'milk_record'
      );
      
      expect(queuedMilk).toBeDefined();
      expect(queuedMilk?.payload.liters).toBe(5.5);
      expect(queuedMilk?.status).toBe('pending');
    });

    it('should queue listing creation when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'listing_creation',
        payload: { 
          animal_id: 'test-animal-id',
          price: 15000,
          is_negotiable: true,
          location: 'Addis Ababa',
          contact_phone: '+251912345678'
        }
      });

      const queuedItems = offlineQueue.getAll();
      const queuedListing = queuedItems.find(
        item => item.action_type === 'listing_creation'
      );
      
      expect(queuedListing).toBeDefined();
      expect(queuedListing?.payload.price).toBe(15000);
    });

    it('should queue buyer interest when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'buyer_interest',
        payload: { listing_id: 'test-listing-id', message: 'Interested in buying' }
      });

      const queuedItems = offlineQueue.getAll();
      const queuedInterest = queuedItems.find(
        item => item.action_type === 'buyer_interest'
      );
      
      expect(queuedInterest).toBeDefined();
      expect(queuedInterest?.payload.message).toBe('Interested in buying');
    });
  });

  describe('Connection Restored - Auto Sync', () => {
    it('should process queued items when connection restored', async () => {
      // Start offline and queue items
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test Animal', type: 'cattle', subtype: 'Cow' }
      });

      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test-id', liters: 3.5, session: 'morning' }
      });

      expect(offlineQueue.getAll().length).toBe(2);

      // Restore connection
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Mock successful sync
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      // Trigger sync
      const result = await offlineQueue.processQueue();

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
    });

    it('should mark items as synced after successful sync', async () => {
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test', type: 'cattle', subtype: 'Cow' }
      });

      const items = offlineQueue.getAll();
      const itemId = items[0].id;

      // Mock successful response
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      await offlineQueue.processQueue();

      const syncedItem = offlineQueue.getAll().find(item => item.id === itemId);
      expect(syncedItem?.status).toBe('synced');
    });
  });

  describe('Manual Sync Button', () => {
    it('should process queue when manual sync triggered', async () => {
      // Queue items while offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test', liters: 4, session: 'evening' }
      });

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      // Manual sync
      const result = await offlineQueue.processQueue();

      expect(result.processed).toBeGreaterThan(0);
      expect(result.failed).toBe(0);
    });

    it('should return sync results with counts', async () => {
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test1', type: 'cattle', subtype: 'Cow' }
      });
      
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test2', type: 'goat', subtype: 'Male Goat' }
      });

      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      const result = await offlineQueue.processQueue();

      expect(result.processed).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.total).toBe(2);
    });
  });

  describe('Retry Logic for Failed Syncs', () => {
    it('should retry failed syncs with exponential backoff', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test', type: 'cattle', subtype: 'Cow' }
      });

      // Mock failure
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Network error' } 
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      await offlineQueue.processQueue();

      const items = offlineQueue.getAll();
      const failedItem = items[0];

      expect(failedItem.retry_count).toBeGreaterThan(0);
      expect(failedItem.status).toBe('pending');
    });

    it('should mark as failed after max retries', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      const item = offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test', type: 'cattle', subtype: 'Cow' }
      });

      // Set retry count to max
      const items = offlineQueue.getAll();
      items[0].retry_count = 5;

      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Network error' } 
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      await offlineQueue.processQueue();

      const failedItem = offlineQueue.getAll().find(i => i.id === item.id);
      expect(failedItem?.status).toBe('failed');
    });

    it('should use exponential backoff delays (1s, 2s, 4s, 8s, 16s)', () => {
      const delays = [
        offlineQueue.getRetryDelay(0),
        offlineQueue.getRetryDelay(1),
        offlineQueue.getRetryDelay(2),
        offlineQueue.getRetryDelay(3),
        offlineQueue.getRetryDelay(4)
      ];

      expect(delays).toEqual([1000, 2000, 4000, 8000, 16000]);
    });
  });

  describe('Sync Status Indicator', () => {
    it('should show online status when connected', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      const status = offlineQueue.getSyncStatus();
      expect(status.isOnline).toBe(true);
    });

    it('should show offline status when disconnected', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      const status = offlineQueue.getSyncStatus();
      expect(status.isOnline).toBe(false);
    });

    it('should show pending items count', () => {
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test1', type: 'cattle', subtype: 'Cow' }
      });
      
      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test', liters: 3, session: 'morning' }
      });

      const status = offlineQueue.getSyncStatus();
      expect(status.pendingCount).toBe(2);
    });

    it('should show syncing status during sync', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test', type: 'cattle', subtype: 'Cow' }
      });

      // Mock slow response
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => new Promise(resolve => {
              setTimeout(() => {
                resolve({ data: {}, error: null });
              }, 100);
            }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      const syncPromise = offlineQueue.processQueue();
      
      // Check status during sync
      const statusDuringSync = offlineQueue.getSyncStatus();
      expect(statusDuringSync.isSyncing).toBe(true);

      await syncPromise;

      const statusAfterSync = offlineQueue.getSyncStatus();
      expect(statusAfterSync.isSyncing).toBe(false);
    });
  });

  describe('Integration - Complete Offline Workflow', () => {
    it('should handle complete offline-to-online workflow', async () => {
      // Step 1: Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Step 2: Perform multiple actions offline
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Offline Cow', type: 'cattle', subtype: 'Cow' }
      });

      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test-id', liters: 4.5, session: 'morning' }
      });

      offlineQueue.add({
        action_type: 'listing_creation',
        payload: { 
          animal_id: 'test-id', 
          price: 20000, 
          is_negotiable: true,
          location: 'Addis Ababa',
          contact_phone: '+251912345678'
        }
      });

      // Verify items are queued
      expect(offlineQueue.getAll().length).toBe(3);
      expect(offlineQueue.getSyncStatus().pendingCount).toBe(3);

      // Step 3: Go back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Mock successful responses
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ data: {}, error: null }))
          }))
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn()
            }))
          }))
        })),
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn()
          }))
        }))
      });

      // Step 4: Sync
      const result = await offlineQueue.processQueue();

      // Step 5: Verify all synced
      expect(result.processed).toBe(3);
      expect(result.failed).toBe(0);
      expect(offlineQueue.getSyncStatus().pendingCount).toBe(0);
    });
  });
});
