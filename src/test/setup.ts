import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock indexedDB globally before any tests run and before modules are loaded
// This is CRITICAL for offlineQueue.ts to initialize properly
const mockIDBRequest = {
  onsuccess: null,
  onerror: null,
  result: null,
};

const mockObjectStore = {
  add: vi.fn(() => mockIDBRequest),
  get: vi.fn(() => mockIDBRequest),
  getAll: vi.fn(() => mockIDBRequest),
  put: vi.fn(() => mockIDBRequest),
  delete: vi.fn(() => mockIDBRequest),
  clear: vi.fn(() => mockIDBRequest),
  count: vi.fn(() => mockIDBRequest),
  openCursor: vi.fn(() => mockIDBRequest),
  index: vi.fn(() => ({
    get: vi.fn(() => mockIDBRequest),
    getAll: vi.fn(() => mockIDBRequest),
  })),
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
  oncomplete: null,
  onerror: null,
  onabort: null,
};

const mockDatabase = {
  createObjectStore: vi.fn(() => mockObjectStore),
  transaction: vi.fn(() => mockTransaction),
  close: vi.fn(),
  objectStoreNames: {
    contains: vi.fn(() => false),
  },
};

const mockOpenRequest = {
  onsuccess: null,
  onerror: null,
  onupgradeneeded: null,
  result: mockDatabase,
};

Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn((name: string, version?: number) => {
      // Simulate async open
      setTimeout(() => {
        if (mockOpenRequest.onupgradeneeded) {
          mockOpenRequest.onupgradeneeded({ target: { result: mockDatabase } } as any);
        }
        if (mockOpenRequest.onsuccess) {
          mockOpenRequest.onsuccess({ target: { result: mockDatabase } } as any);
        }
      }, 0);
      return mockOpenRequest;
    }),
    deleteDatabase: vi.fn(() => mockIDBRequest),
    cmp: vi.fn((a, b) => (a < b ? -1 : a > b ? 1 : 0)),
    databases: vi.fn(() => Promise.resolve([])),
  },
  writable: true,
  configurable: true,
});

// Mock IntersectionObserver (needed for some components)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (needed for some components)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any;

// Mock matchMedia (needed for responsive components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});