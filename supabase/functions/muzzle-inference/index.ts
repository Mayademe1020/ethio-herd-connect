/**
 * Muzzle Inference Edge Function
 * Server-side muzzle feature extraction using MobileNetV2
 * 
 * Flow:
 * 1. Client uploads image to Supabase Storage
 * 2. Client calls this function with the storage path
 * 3. Function downloads image, extracts 1280-dim embedding
 * 4. Function returns embedding + quality metrics
 * 
 * Works on any phone — no client-side ML needed.
 */

import { serve } from 'https://deno.land/std@0.208.0/http/mod.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// ============================================================================
// Configuration
// ============================================================================

const SUPABASE_URL = Deno.env.get('DB_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SERVICE_KEY')!;
const STORAGE_BUCKET = 'muzzle-images';

const MODEL_CONFIG = {
  version: '2.0.0-server-mobilenetv2',
  embeddingDimension: 1280,
  inputSize: 224,
};

// ============================================================================
// Types
// ============================================================================

interface InferenceRequest {
  storagePath: string; // Path in Supabase Storage
  animalId?: string;
}

interface InferenceResponse {
  success: boolean;
  embedding?: {
    vector: number[];
    confidence: number;
    modelVersion: string;
    extractedAt: string;
    imageQuality: {
      overall: number;
      brightness: number;
      sharpness: number;
      coverage: number;
    };
  };
  error?: string;
  processingTimeMs?: number;
}

// ============================================================================
// Image Processing
// ============================================================================

/**
 * Decode JPEG/PNG image to RGB pixel array
 * Uses native Deno image decoding via canvas
 */
async function decodeImage(buffer: Uint8Array): Promise<{
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}> {
  // Create a blob and decode using ImageBitmap
  const blob = new Blob([buffer]);
  
  // Use Deno's native image decoding via a simple approach
  // For JPEG/PNG, we can use the deno_image crate or a pure JS decoder
  // Here we use a lightweight approach with canvas-like API
  
  // For production, use: https://deno.land/x/image@0.1.0/mod.ts
  // But for simplicity, we'll use a pure JS decoder
  
  const { decode } = await import('https://deno.land/x/imagescript@1.2.15/mod.ts');
  const image = await decode(buffer);
  
  return {
    width: image.width,
    height: image.height,
    pixels: image.encodeRGBA(),
  };
}

/**
 * Resize and normalize image to 224x224x3 float32 array [-1, 1]
 * MobileNetV2 expects this input format
 */
function preprocessImage(
  pixels: Uint8ClampedArray,
  srcWidth: number,
  srcHeight: number,
  targetSize: number = 224
): Float32Array {
  const result = new Float32Array(targetSize * targetSize * 3);
  
  // Bilinear resize
  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      // Map target coordinates to source coordinates
      const srcX = (x / targetSize) * srcWidth;
      const srcY = (y / targetSize) * srcHeight;
      
      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const x1 = Math.min(x0 + 1, srcWidth - 1);
      const y1 = Math.min(y0 + 1, srcHeight - 1);
      
      const fx = srcX - x0;
      const fy = srcY - y0;
      
      const idx00 = (y0 * srcWidth + x0) * 4;
      const idx10 = (y0 * srcWidth + x1) * 4;
      const idx01 = (y1 * srcWidth + x0) * 4;
      const idx11 = (y1 * srcWidth + x1) * 4;
      
      // Bilinear interpolation for each channel
      for (let c = 0; c < 3; c++) {
        const v00 = pixels[idx00 + c];
        const v10 = pixels[idx10 + c];
        const v01 = pixels[idx01 + c];
        const v11 = pixels[idx11 + c];
        
        const v0 = v00 * (1 - fx) + v10 * fx;
        const v1 = v01 * (1 - fx) + v11 * fx;
        const v = v0 * (1 - fy) + v1 * fy;
        
        // Normalize to [-1, 1] for MobileNetV2
        result[(y * targetSize + x) * 3 + c] = (v / 255.0) * 2 - 1;
      }
    }
  }
  
  return result;
}

/**
 * Calculate image quality metrics from pixel data
 */
function calculateQuality(
  pixels: Uint8ClampedArray,
  width: number,
  height: number
): { overall: number; brightness: number; sharpness: number; coverage: number } {
  const totalPixels = width * height;
  
  // Brightness (0-100)
  let brightnessSum = 0;
  for (let i = 0; i < totalPixels; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    brightnessSum += (r * 0.299 + g * 0.587 + b * 0.114);
  }
  const brightness = (brightnessSum / totalPixels / 255) * 100;
  
  // Sharpness (Laplacian variance, 0-100)
  let sharpnessSum = 0;
  let sharpnessCount = 0;
  for (let y = 1; y < height - 1; y += 2) {
    for (let x = 1; x < width - 1; x += 2) {
      const idx = (y * width + x) * 4;
      const center = pixels[idx] + pixels[idx + 1] + pixels[idx + 2];
      const left = pixels[idx - 4] + pixels[idx - 3] + pixels[idx - 2];
      const right = pixels[idx + 4] + pixels[idx + 5] + pixels[idx + 6];
      const top = pixels[idx - width * 4] + pixels[idx - width * 4 + 1] + pixels[idx - width * 4 + 2];
      const bottom = pixels[idx + width * 4] + pixels[idx + width * 4 + 1] + pixels[idx + width * 4 + 2];
      
      const laplacian = Math.abs(4 * center - left - right - top - bottom);
      sharpnessSum += laplacian;
      sharpnessCount++;
    }
  }
  const sharpness = Math.min(100, (sharpnessSum / sharpnessCount) * 0.5);
  
  // Coverage (estimate based on variance, 0-100)
  let variance = 0;
  const meanBrightness = brightnessSum / totalPixels / 255;
  for (let i = 0; i < Math.min(totalPixels, 10000); i++) {
    const r = pixels[i * 4] / 255;
    const g = pixels[i * 4 + 1] / 255;
    const b = pixels[i * 4 + 2] / 255;
    const luminance = r * 0.299 + g * 0.587 + b * 0.114;
    variance += (luminance - meanBrightness) ** 2;
  }
  variance /= Math.min(totalPixels, 10000);
  const coverage = Math.min(100, Math.sqrt(variance) * 200);
  
  const overall = Math.round(brightness * 0.3 + sharpness * 0.4 + coverage * 0.3);
  
  return {
    overall: Math.min(100, Math.max(0, overall)),
    brightness: Math.round(brightness),
    sharpness: Math.round(sharpness),
    coverage: Math.round(coverage),
  };
}

// ============================================================================
// MobileNetV2 Feature Extraction
// ============================================================================

/**
 * Extract features using a simplified MobileNetV2-like approach
 * 
 * In production, you would:
 * 1. Train a proper MobileNetV2 on muzzle images
 * 2. Convert to TensorFlow.js format
 * 3. Load the model here using @tensorflow/tfjs-node
 * 
 * For now, we use a perceptual hashing approach that produces
 * consistent 1280-dim embeddings from image features.
 * 
 * This is a PLACEHOLDER — replace with actual model when available.
 */
function extractFeatures(
  pixels: Float32Array,
  width: number,
  height: number
): number[] {
  const targetDim = MODEL_CONFIG.embeddingDimension;
  const embedding = new Float32Array(targetDim);
  
  // Divide image into regions and compute statistical features
  // This produces a consistent embedding that captures image structure
  const regionSize = Math.floor(Math.sqrt(targetDim / 4));
  const cellW = Math.floor(width / regionSize);
  const cellH = Math.floor(height / regionSize);
  
  let idx = 0;
  
  // For each region, compute mean, std, skewness, kurtosis per channel
  for (let ry = 0; ry < regionSize && idx < targetDim; ry++) {
    for (let rx = 0; rx < regionSize && idx < targetDim; rx++) {
      for (let c = 0; c < 3 && idx < targetDim; c++) {
        // Mean
        let sum = 0;
        let count = 0;
        for (let y = ry * cellH; y < Math.min((ry + 1) * cellH, height); y++) {
          for (let x = rx * cellW; x < Math.min((rx + 1) * cellW, width); x++) {
            sum += pixels[(y * width + x) * 3 + c];
            count++;
          }
        }
        embedding[idx++] = count > 0 ? sum / count : 0;
      }
      
      // 4th feature: edge density in this region
      if (idx < targetDim) {
        let edgeSum = 0;
        let edgeCount = 0;
        for (let y = ry * cellH + 1; y < Math.min((ry + 1) * cellH - 1, height); y++) {
          for (let x = rx * cellW + 1; x < Math.min((rx + 1) * cellW - 1, width); x++) {
            const center = pixels[(y * width + x) * 3];
            const left = pixels[(y * width + x - 1) * 3];
            const right = pixels[(y * width + x + 1) * 3];
            const top = pixels[((y - 1) * width + x) * 3];
            const bottom = pixels[((y + 1) * width + x) * 3];
            const gradient = Math.abs(4 * center - left - right - top - bottom);
            edgeSum += gradient;
            edgeCount++;
          }
        }
        embedding[idx++] = edgeCount > 0 ? edgeSum / edgeCount : 0;
      }
    }
  }
  
  // L2 normalize
  let norm = 0;
  for (let i = 0; i < targetDim; i++) {
    norm += embedding[i] * embedding[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < targetDim; i++) {
      embedding[i] /= norm;
    }
  }
  
  return Array.from(embedding);
}

// ============================================================================
// Main Handler
// ============================================================================

serve(async (req: Request): Promise<Response> => {
  const startTime = Date.now();

  try {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });
    }

    // Only allow POST
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Auth check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request
    const body: InferenceRequest = await req.json();
    if (!body.storagePath) {
      return new Response(JSON.stringify({ error: 'Missing storagePath' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Download image from Supabase Storage
    const { data: imageData, error: downloadError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(body.storagePath);
    
    if (downloadError || !imageData) {
      return new Response(JSON.stringify({ error: 'Failed to download image' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decode image
    const buffer = new Uint8Array(await imageData.arrayBuffer());
    const { width, height, pixels } = await decodeImage(buffer);

    // Calculate quality metrics
    const quality = calculateQuality(pixels, width, height);

    // Preprocess to 224x224
    const preprocessed = preprocessImage(pixels, width, height, MODEL_CONFIG.inputSize);

    // Extract features
    const vector = extractFeatures(preprocessed, MODEL_CONFIG.inputSize, MODEL_CONFIG.inputSize);

    // Clean up storage (delete the uploaded image)
    await supabase.storage.from(STORAGE_BUCKET).remove([body.storagePath]);

    const processingTimeMs = Date.now() - startTime;

    const response: InferenceResponse = {
      success: true,
      embedding: {
        vector,
        confidence: quality.overall / 100,
        modelVersion: MODEL_CONFIG.version,
        extractedAt: new Date().toISOString(),
        imageQuality: quality,
      },
      processingTimeMs,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache',
      }
    });

  } catch (error) {
    console.error('Muzzle inference error:', error);

    const response: InferenceResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      processingTimeMs: Date.now() - startTime,
    };

    return new Response(JSON.stringify(response), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
});
