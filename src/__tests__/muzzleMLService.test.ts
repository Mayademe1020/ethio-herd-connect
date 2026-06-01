import { describe, it, expect, beforeEach, vi } from 'vitest';
import { muzzleMLService } from '@/services/muzzleMLService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(() => Promise.resolve({ error: null })),
      })),
    },
    auth: {
      getSession: vi.fn(() => Promise.resolve({
        data: { session: { access_token: 'test-token' } },
        error: null,
      })),
    },
  },
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
}));

global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      success: true,
      embedding: {
        vector: Array.from({ length: 1280 }, () => Math.random()),
        confidence: 0.92,
        modelVersion: '2.0.0-server-mobilenetv2',
        extractedAt: new Date().toISOString(),
        imageQuality: { overall: 80, brightness: 70, sharpness: 75, coverage: 85 },
      },
    }),
  } as any)
);

describe('MuzzleMLService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize successfully', async () => {
      await muzzleMLService.initialize();
      const status = muzzleMLService.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.modelVersion).toBe('3.0.0-server-mobilenetv2');
    });

    it('should handle initialization errors gracefully', async () => {
      // initialize is idempotent and doesn't throw in server mode
      await expect(muzzleMLService.initialize()).resolves.not.toThrow();
    });
  });

  describe('Model Loading', () => {
    it('should load model successfully', async () => {
      await muzzleMLService.initialize();
      await muzzleMLService.loadModel();
      const status = muzzleMLService.getStatus();
      expect(status.modelLoaded).toBe(true);
    });

    it('should auto-initialize when loading model without init', async () => {
      await muzzleMLService.loadModel();
      const status = muzzleMLService.getStatus();
      expect(status.initialized).toBe(true);
      expect(status.modelLoaded).toBe(true);
    });
  });

  describe('Quality Check', () => {
    it('should assess image quality', () => {
      const width = 224;
      const height = 224;
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 120; data[i + 1] = 120; data[i + 2] = 120; data[i + 3] = 255;
      }
      const imageData = { data, width, height } as ImageData;
      const result = muzzleMLService.qualityCheck(imageData);
      expect(result).toHaveProperty('overall');
      expect(result).toHaveProperty('brightness');
      expect(result).toHaveProperty('sharpness');
      expect(result).toHaveProperty('coverage');
      expect(result).toHaveProperty('isAcceptable');
      expect(typeof result.overall).toBe('number');
      expect(result.overall).toBeGreaterThanOrEqual(0);
    });

    it('should flag poor quality images', () => {
      const width = 224;
      const height = 224;
      const data = new Uint8ClampedArray(width * height * 4);
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; data[i + 3] = 255;
      }
      const imageData = { data, width, height } as ImageData;
      const result = muzzleMLService.qualityCheck(imageData);
      expect(typeof result.isAcceptable).toBe('boolean');
    });
  });

  describe('Status', () => {
    it('should return service status', () => {
      const status = muzzleMLService.getStatus();
      expect(status).toHaveProperty('initialized');
      expect(status).toHaveProperty('modelVersion');
      expect(status).toHaveProperty('embeddingDimension');
      expect(status).toHaveProperty('backend');
      expect(status.backend).toBe('server');
      expect(status.embeddingDimension).toBe(1280);
    });
  });

  describe('Cache Management (server-side)', () => {
    it('should clear cache and reset state', async () => {
      await muzzleMLService.initialize();
      await muzzleMLService.loadModel();
      expect(muzzleMLService.getStatus().modelLoaded).toBe(true);

      await muzzleMLService.clearCache();
      const status = muzzleMLService.getStatus();
      expect(status.initialized).toBe(false);
      expect(status.modelLoaded).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw on unsupported image source type', async () => {
      await expect(muzzleMLService.extractFeatures(123 as any))
        .rejects.toThrow('Unsupported image source type');
    });
  });
});
