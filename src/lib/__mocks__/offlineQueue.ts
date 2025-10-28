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
}

export default offlineQueue;
