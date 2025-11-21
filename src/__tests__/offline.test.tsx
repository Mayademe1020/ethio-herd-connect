/**
 * Offline Functionality Test Suite
 * Tests all features in airplane mode, sync restoration, manual sync, retry logic, and sync status
 */

import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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
  let queryClient: QueryClient;
  let originalOnLine: boolean;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    });
    
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

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );

  describe('Offline Queue - Direct Tests', () => {
    it('should add items to queue when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test Animal', type: 'cattle', subtype: 'Cow' }
      });

      const items = offlineQueue.getAll();
      expect(items.length).toBeGreaterThan(0);
    });

    it('should process queue when online', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Test', type: 'cattle', subtype: 'Cow' }
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
      expect(result.processed).toBeGreaterThan(0);
    });
  });

  describe('Retry Logic', () => {
    it('should use exponential backoff delays', () => {
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
  });

  describe('Manual Sync', () => {
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

      expect(result.total).toBe(2);
    });
  });

  describe('Complete Offline Workflow', () => {
    it('should handle offline-to-online workflow', async () => {
      // Go offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      // Add items offline
      offlineQueue.add({
        action_type: 'animal_registration',
        payload: { name: 'Offline Cow', type: 'cattle', subtype: 'Cow' }
      });

      offlineQueue.add({
        action_type: 'milk_record',
        payload: { animal_id: 'test-id', liters: 4.5, session: 'morning' }
      });

      // Verify queued
      expect(offlineQueue.getAll().length).toBe(2);

      // Go online
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

      // Sync
      const result = await offlineQueue.processQueue();

      // Verify synced
      expect(result.total).toBe(2);
    });
  });
});
