import { vi } from 'vitest';

// Mock offline queue for testing
export const offlineQueue = {
  addItem: vi.fn(() => Promise.resolve()),
  processQueue: vi.fn(() => Promise.resolve()),
  getQueueStatus: vi.fn(() => Promise.resolve({ 
    isOnline: true, 
    pendingItems: 0,
    lastSyncTime: new Date().toISOString()
  })),
  clearQueue: vi.fn(() => Promise.resolve()),
  getQueueItems: vi.fn(() => Promise.resolve([])),
  getPendingCount: vi.fn(() => Promise.resolve(0)),
  isProcessing: vi.fn(() => false),
  subscribe: vi.fn((callback: () => void) => {
    // Return unsubscribe function
    return () => {};
  }),
};

export class OfflineQueueManager {
  static instance: OfflineQueueManager | null = null;

  static getInstance() {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  init = vi.fn(() => Promise.resolve());
  addItem = vi.fn(() => Promise.resolve());
  processQueue = vi.fn(() => Promise.resolve());
  getQueueStatus = vi.fn(() => Promise.resolve({ 
    isOnline: true, 
    pendingItems: 0,
    lastSyncTime: new Date().toISOString()
  }));
  clearQueue = vi.fn(() => Promise.resolve());
  getQueueItems = vi.fn(() => Promise.resolve([]));
  getPendingCount = vi.fn(() => Promise.resolve(0));
  isProcessing = vi.fn(() => false);
  subscribe = vi.fn((callback: () => void) => {
    return () => {};
  });
}

export default offlineQueue;
