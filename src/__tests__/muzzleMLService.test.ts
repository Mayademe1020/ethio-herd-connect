/**
 * Unit tests for MuzzleMLService
 * Tests model loading, feature extraction, caching, and server fallback
 */

import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { muzzleMLService } from '@/services/muzzleMLService';
import * as tf from '@tensorflow/tfjs';

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: vi.fn(),
  setBackend: vi.fn(),
  ready: vi.fn(),
  getBackend: vi.fn(() => 'webgl'),
  sequential: vi.fn(() => ({
    add: vi.fn(),
    compile: vi.fn(),
    layers: [],
    getWeights: vi.fn(() => []),
    predict: vi.fn(() => ({
      dataSync: vi.fn(() => new Float32Array(512)),
      dispose: vi.fn(),
    })),
    dispose: vi.fn(),
  })),
  layers: {
    conv2d: vi.fn(() => ({ activation: 'relu', padding: 'same' })),
    maxPooling2d: vi.fn(),
    flatten: vi.fn(),
    dense: vi.fn(() => ({ activation: 'relu' })),
  },
  tensor: vi.fn(() => ({
    dataSync: vi.fn(() => new Float32Array(512)),
    dispose: vi.fn(),
  })),
  tidy: vi.fn((fn) => fn()),
}));

// Mock HTMLCanvasElement and related APIs
Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  value: vi.fn(() => ({
    fillStyle: '',
    fillRect: vi.fn(),
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(224 * 224 * 4),
      width: 224,
      height: 224,
    })),
    save: vi.fn(),
    restore: vi.fn(),
  })),
});

// Mock fetch for server fallback tests
global.fetch = vi.fn();

describe('MuzzleMLService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset service state
    (muzzleMLService as any).isInitialized = false;
    (muzzleMLService as any).modelCache.cache.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      (tf.setBackend as Mock).mockResolvedValue(undefined);
      (tf.ready as Mock).mockResolvedValue(undefined);

      await muzzleMLService.initialize();

      expect(tf.setBackend).toHaveBeenCalled();
      expect(tf.ready).toHaveBeenCalled();
      expect((muzzleMLService as any).isInitialized).toBe(true);
    });

    it('should handle initialization errors', async () => {
      (tf.setBackend as Mock).mockRejectedValue(new Error('Backend failed'));

      await expect(muzzleMLService.initialize()).rejects.toThrow('Failed to initialize ML service');
      expect((muzzleMLService as any).isInitialized).toBe(false);
    });
  });

  describe('Model Loading', () => {
    beforeEach(async () => {
      await muzzleMLService.initialize();
    });

    it('should load model successfully', async () => {
      const mockModel = {
        dispose: vi.fn(),
        layers: [
          { getWeights: vi.fn(() => [{ size: 1000 }]) },
          { getWeights: vi.fn(() => [{ size: 2000 }]) },
        ]
      };
      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);

      const result = await muzzleMLService.loadModel();

      expect(result).toHaveProperty('model');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('loadTimeMs');
      expect(tf.loadLayersModel).toHaveBeenCalled();
    });

    it('should cache loaded models', async () => {
      const mockModel = {
        dispose: vi.fn(),
        layers: [
          { getWeights: vi.fn(() => [{ size: 1000 }]) },
          { getWeights: vi.fn(() => [{ size: 2000 }]) },
        ]
      };
      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);

      // Load model twice
      await muzzleMLService.loadModel();
      await muzzleMLService.loadModel();

      // Should only call loadLayersModel once due to caching
      expect(tf.loadLayersModel).toHaveBeenCalledTimes(1);
    });

    it('should handle model loading timeout', async () => {
      (tf.loadLayersModel as Mock).mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('Model load timeout')), 100)) // Simulate timeout
      );

      await expect(muzzleMLService.loadModel()).rejects.toThrow('Model load timeout');
    }, 1000); // Set test timeout
  });

  describe('Feature Extraction', () => {
    beforeEach(async () => {
      await muzzleMLService.initialize();
    });

    it('should extract features successfully', async () => {
      const mockModel = {
        layers: [],
        getWeights: vi.fn(() => []),
        predict: vi.fn(() => ({
          dataSync: vi.fn(() => new Float32Array(512)),
          dispose: vi.fn(),
        })),
        dispose: vi.fn(),
      };

      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);
      (tf.tensor as Mock).mockReturnValue({
        dataSync: vi.fn(() => new Float32Array(512)),
        dispose: vi.fn(),
      });

      // Mock fetch for server fallback (though it should use local first)
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          embedding: {
            vector: Array.from({ length: 512 }, () => Math.random()),
            confidence: 0.85,
            modelVersion: '1.0.0',
            extractedAt: new Date().toISOString(),
            imageQuality: {
              overall: 80,
              brightness: 70,
              sharpness: 75,
              coverage: 85,
            },
            captureConditions: {
              lighting: 'good',
              distance: 'optimal',
              motion: false,
              deviceType: 'server_processed',
            },
          },
        }),
      });

      // Create a mock image blob
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      const result = await muzzleMLService.extractFeatures(mockBlob);

      expect(result).toHaveProperty('embedding');
      expect(result).toHaveProperty('extractionTimeMs');
      expect(result).toHaveProperty('modelVersion');
      expect(result.embedding).toHaveProperty('vector');
      expect(result.embedding).toHaveProperty('confidence');
    });

    it('should fall back to server when local extraction fails', async () => {
      // Mock local extraction failure
      const mockModel = {
        predict: vi.fn(() => {
          throw new Error('Local extraction failed');
        }),
        dispose: vi.fn(),
      };

      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);

      // Mock successful server response
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          embedding: {
            vector: Array.from({ length: 512 }, () => Math.random()),
            confidence: 0.85,
            modelVersion: '1.0.0',
            extractedAt: new Date().toISOString(),
            imageQuality: {
              overall: 80,
              brightness: 70,
              sharpness: 75,
              coverage: 85,
            },
            captureConditions: {
              lighting: 'good',
              distance: 'optimal',
              motion: false,
              deviceType: 'server_processed',
            },
          },
        }),
      });

      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const result = await muzzleMLService.extractFeatures(mockBlob);

      expect(global.fetch).toHaveBeenCalledWith('/functions/v1/muzzle-inference', expect.any(Object));
      expect(result).toHaveProperty('embedding');
    });

    it('should force server fallback when requested', async () => {
      // Mock server response
      (global.fetch as Mock).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          embedding: {
            vector: Array.from({ length: 512 }, () => Math.random()),
            confidence: 0.85,
            modelVersion: '1.0.0',
            extractedAt: new Date().toISOString(),
            imageQuality: {
              overall: 80,
              brightness: 70,
              sharpness: 75,
              coverage: 85,
            },
            captureConditions: {
              lighting: 'good',
              distance: 'optimal',
              motion: false,
              deviceType: 'server_processed',
            },
          },
        }),
      });

      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const result = await muzzleMLService.extractFeatures(mockBlob, { forceServerFallback: true });

      expect(global.fetch).toHaveBeenCalled();
      expect(result).toHaveProperty('embedding');
    });

    it('should handle extraction timeout', async () => {
      const mockModel = {
        layers: [{ getWeights: vi.fn(() => [{ size: 1000 }]) }],
        predict: vi.fn(() => {
          throw new Error('Local extraction timeout');
        }),
        dispose: vi.fn(),
      };

      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);

      // Mock server response for fallback
      (global.fetch as Mock).mockResolvedValue({
        ok: false,
        status: 408,
        statusText: 'Request Timeout',
      });

      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });

      await expect(muzzleMLService.extractFeatures(mockBlob)).rejects.toThrow('Server inference failed');
    });
  });

  describe('Cache Management', () => {
    beforeEach(async () => {
      await muzzleMLService.initialize();
    });

    it('should clear cache successfully', async () => {
      const mockModel = {
        dispose: vi.fn(),
        layers: [
          { getWeights: vi.fn(() => [{ size: 1000 }]) },
          { getWeights: vi.fn(() => [{ size: 2000 }]) },
        ]
      };
      (tf.loadLayersModel as Mock).mockResolvedValue(mockModel);

      // Load a model to cache
      await muzzleMLService.loadModel();

      // Clear cache
      await muzzleMLService.clearCache();

      // Verify cache is empty
      const stats = (muzzleMLService as any).modelCache.getStats();
      expect(stats.entries).toBe(0);
      expect(mockModel.dispose).toHaveBeenCalled();
    });

    it('should provide cache statistics', async () => {
      const stats = muzzleMLService.getStatus();
      expect(stats).toHaveProperty('cacheStats');
      expect(stats.cacheStats).toHaveProperty('entries');
      expect(stats.cacheStats).toHaveProperty('totalSizeBytes');
    });
  });

  describe('Device Capability Detection', () => {
    it('should detect local inference capability', () => {
      // Mock WebGL availability
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue({}),
      };
      global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

      // Mock navigator properties
      Object.defineProperty(navigator, 'deviceMemory', { value: 4, configurable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 4, configurable: true });

      const canRunLocally = (muzzleMLService as any).canRunLocally();
      expect(canRunLocally).toBe(true);
    });

    it('should detect low-end device', () => {
      // Mock no WebGL
      const mockCanvas = {
        getContext: vi.fn().mockReturnValue(null),
      };
      global.document.createElement = vi.fn().mockReturnValue(mockCanvas);

      // Mock low-end device
      Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true });
      Object.defineProperty(navigator, 'hardwareConcurrency', { value: 1, configurable: true });

      const canRunLocally = (muzzleMLService as any).canRunLocally();
      expect(canRunLocally).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should create standardized errors', () => {
      const error = (muzzleMLService as any).createError('MODEL_LOAD_FAILED', 'Test error');

      expect(error).toHaveProperty('code', 'MODEL_LOAD_FAILED');
      expect(error).toHaveProperty('message', 'Test error');
      expect(error).toHaveProperty('retryable', true);
    });

    it('should identify retryable errors', () => {
      expect((muzzleMLService as any).isRetryableError('MODEL_LOAD_FAILED')).toBe(true);
      expect((muzzleMLService as any).isRetryableError('EXTRACTION_FAILED')).toBe(false);
    });
  });
});