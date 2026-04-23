/**
 * Muzzle ML Service — Server-Side Processing
 * 
 * Flow:
 * 1. Compress image client-side
 * 2. Upload to Supabase Storage
 * 3. Call edge function for feature extraction
 * 4. Receive 1280-dim embedding
 * 
 * No TF.js on client — works on any phone including 2GB devices.
 */

import { supabase } from '@/integrations/supabase/client';
import { MuzzleErrorCode, MuzzleError, type MuzzleEmbedding } from '@/types/muzzle';
import { logger } from '@/utils/logger';

export interface FeatureExtractionResult {
  embedding: MuzzleEmbedding;
  extractionTimeMs: number;
  modelVersion: string;
}

export interface QualityCheckResult {
  overall: number;
  brightness: number;
  sharpness: number;
  coverage: number;
  isAcceptable: boolean;
}

export interface CropInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

const MODEL_VERSION = '2.0.0-server-mobilenetv2';
const STORAGE_BUCKET = 'muzzle-images';
const EXTRACTION_TIMEOUT_MS = 30000;

export class MuzzleMLService {
  private _initialized = false;
  private _modelLoaded = false;

  /**
   * Initialize the ML service (server-side — no client model to load)
   */
  async initialize(): Promise<void> {
    if (this._initialized) return;
    this._initialized = true;
    logger.info('MuzzleMLService initialized (server-side processing mode)');
  }

  /**
   * Load the model — no-op for server-side processing
   */
  async loadModel(): Promise<void> {
    if (!this._initialized) {
      await this.initialize();
    }
    this._modelLoaded = true;
    logger.info('Model loaded (server-side — no client model required)');
  }

  /**
   * Check image quality using client-side canvas analysis
   */
  qualityCheck(imageData: ImageData): QualityCheckResult {
    const { data, width, height } = imageData;
    const totalPixels = width * height;

    // Brightness: average luminance across all pixels
    let totalBrightness = 0;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      totalBrightness += (0.299 * r + 0.587 * g + 0.114 * b);
    }
    const avgBrightness = totalBrightness / totalPixels;
    const brightnessScore = this.mapToScore(avgBrightness, 40, 200);

    // Sharpness: measure edge density using Laplacian-like variance
    let variance = 0;
    const stride = width * 4;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        const center = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        const left = data[idx - 4] * 0.299 + data[idx - 3] * 0.587 + data[idx - 2] * 0.114;
        const right = data[idx + 4] * 0.299 + data[idx + 5] * 0.587 + data[idx + 6] * 0.114;
        const top = data[idx - stride] * 0.299 + data[idx - stride + 1] * 0.587 + data[idx - stride + 2] * 0.114;
        const bottom = data[idx + stride] * 0.299 + data[idx + stride + 1] * 0.587 + data[idx + stride + 2] * 0.114;
        const laplacian = Math.abs(4 * center - left - right - top - bottom);
        variance += laplacian;
      }
    }
    const edgeDensity = variance / ((width - 2) * (height - 2));
    const sharpnessScore = this.mapToScore(edgeDensity, 5, 80);

    // Coverage: check if center region has sufficient content (not too dark/bright)
    const marginX = Math.floor(width * 0.15);
    const marginY = Math.floor(height * 0.1);
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const sampleRadius = Math.min(width, height) * 0.3;
    let coveredPixels = 0;
    let totalSampled = 0;
    for (let y = centerY - sampleRadius; y < centerY + sampleRadius; y++) {
      for (let x = centerX - sampleRadius; x < centerX + sampleRadius; x++) {
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        const dx = x - centerX;
        const dy = y - centerY;
        if (dx * dx + dy * dy > sampleRadius * sampleRadius) continue;
        const idx = (y * width + x) * 4;
        const luminance = data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
        if (luminance > 15 && luminance < 240) coveredPixels++;
        totalSampled++;
      }
    }
    const coverageScore = totalSampled > 0 ? (coveredPixels / totalSampled) * 100 : 50;

    const overall = (brightnessScore * 0.3 + sharpnessScore * 0.4 + coverageScore * 0.3);

    return {
      overall: Math.round(overall * 10) / 10,
      brightness: Math.round(brightnessScore * 10) / 10,
      sharpness: Math.round(sharpnessScore * 10) / 10,
      coverage: Math.round(coverageScore * 10) / 10,
      isAcceptable: overall >= 40 && brightnessScore >= 25 && sharpnessScore >= 20,
    };
  }

  /**
   * Generate embedding from a canvas element by converting to blob and extracting features
   */
  async generateEmbedding(canvas: HTMLCanvasElement): Promise<number[]> {
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas to blob failed'))),
        'image/jpeg',
        0.9
      );
    });

    const result = await this.extractFeatures(blob);
    return Array.from(result.embedding.vector);
  }

  /**
   * Extract features by uploading to server and processing
   */
  async extractFeatures(
    imageSource: Blob | File | HTMLImageElement | string,
    options?: {
      modelVersion?: string;
      onProgress?: (progress: { stage: string; progress: number; message: string }) => void;
    }
  ): Promise<FeatureExtractionResult> {
    const startTime = performance.now();

    try {
      let blob: Blob;

      if (imageSource instanceof Blob || imageSource instanceof File) {
        blob = imageSource;
      } else if (imageSource instanceof HTMLImageElement) {
        blob = await this.imageElementToBlob(imageSource);
      } else if (typeof imageSource === 'string') {
        blob = await this.dataUrlOrUrlToBlob(imageSource);
      } else {
        throw new Error('Unsupported image source type');
      }

      const compressedBlob = await this.compressImage(blob);

      const storagePath = `temp/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, compressedBlob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/muzzle-inference`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ storagePath }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${errorText.slice(0, 200)}`);
      }

      const result = await response.json();

      if (!result.success || !result.embedding) {
        throw new Error(result.error || 'Extraction failed');
      }

      const embedding: MuzzleEmbedding = {
        id: crypto.randomUUID(),
        vector: new Float32Array(result.embedding.vector),
        confidence: result.embedding.confidence,
        modelVersion: result.embedding.modelVersion || options?.modelVersion || MODEL_VERSION,
        extractedAt: result.embedding.extractedAt || new Date().toISOString(),
        imageQuality: result.embedding.imageQuality || {
          overall: 80,
          brightness: 80,
          sharpness: 80,
          coverage: 80,
        },
        captureConditions: {
          lighting: 'good' as const,
          distance: 'optimal' as const,
          motion: false,
          deviceType: navigator.userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        },
      };

      return {
        embedding,
        extractionTimeMs: performance.now() - startTime,
        modelVersion: options?.modelVersion || MODEL_VERSION,
      };

    } catch (error) {
      logger.error('Feature extraction failed', error);
      throw this.createError(
        MuzzleErrorCode.EXTRACTION_FAILED,
        `Extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Convert HTMLImageElement to Blob
   */
  private async imageElementToBlob(img: HTMLImageElement): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Image to blob failed'))),
        'image/jpeg',
        0.9
      );
    });
  }

  /**
   * Convert data URL or remote URL to Blob
   */
  private async dataUrlOrUrlToBlob(url: string): Promise<Blob> {
    if (url.startsWith('data:')) {
      const response = await fetch(url);
      return response.blob();
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    return response.blob();
  }

  /**
   * Compress image to reduce upload size
   * Target: <100KB for fast upload on 3G
   */
  private async compressImage(source: Blob | File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const maxSize = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed'));
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(source);
    });
  }

  /**
   * Map a raw value to a 0-100 score given min/max bounds
   */
  private mapToScore(value: number, min: number, max: number): number {
    if (value <= min) return 0;
    if (value >= max) return 100;
    return ((value - min) / (max - min)) * 100;
  }

  getStatus() {
    return {
      initialized: this._initialized,
      modelVersion: MODEL_VERSION,
      embeddingDimension: 1280,
      backend: 'server',
      modelLoaded: this._modelLoaded,
    };
  }

  async clearCache(): Promise<void> {
    this._initialized = false;
    this._modelLoaded = false;
  }

  private createError(code: MuzzleErrorCode, message: string): MuzzleError {
    return {
      code,
      message,
      messageAm: message,
      retryable: [MuzzleErrorCode.MODEL_LOAD_FAILED, MuzzleErrorCode.EXTRACTION_FAILED].includes(code),
    };
  }
}

export const muzzleMLService = new MuzzleMLService();
export default muzzleMLService;
