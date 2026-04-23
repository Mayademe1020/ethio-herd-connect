/**
 * Model Loader - Progressive Loading for Low-RAM Devices
 * Optimized for 2GB RAM phones with lazy loading and caching
 */

import { canLoadModel, checkMemoryStatus, requestGC } from './tensorCleanup';
import { logger } from './logger';

export interface ModelConfig {
  /** URL to model file (ONNX or TensorFlow.js format) */
  url: string;
  /** Model size in MB (for memory budgeting) */
  sizeMB: number;
  /** Backend: 'wasm' (smallest) | 'webgl' (fast) | 'cpu' (fallback) */
  preferredBackend?: 'wasm' | 'webgl' | 'cpu';
  /** Whether to cache model in IndexedDB */
  cacheEnabled?: boolean;
  /** Custom fetch options */
  fetchOptions?: RequestInit;
}

export interface ModelLoadProgress {
  stage: 'downloading' | 'loading' | 'compiling' | 'ready';
  progress: number; // 0-100
  message: string;
}

export interface LoadedModel {
  /** Unique model ID */
  id: string;
  /** The model instance */
  model: any;
  /** Backend used for inference */
  backend: string;
  /** Memory usage in MB */
  memoryUsageMB: number;
  /** When model was loaded */
  loadedAt: number;
  /** Execute inference */
  predict: (input: any) => Promise<any>;
  /** Release model memory */
  dispose: () => void;
}

/** Cache for loaded models */
const modelCache = new Map<string, LoadedModel>();

/** Pending load promises to prevent duplicate loads */
const loadPromises = new Map<string, Promise<LoadedModel>>();

/** IndexedDB name for model cache */
const DB_NAME = 'ethio-herd-models';
const STORE_NAME = 'cached-models';
const DB_VERSION = 1;

/**
 * Get or create IndexedDB for model caching
 */
async function getModelDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

/**
 * Load model from IndexedDB cache
 */
async function loadFromCache(modelId: string): Promise<ArrayBuffer | null> {
  try {
    const db = await getModelDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const request = store.get(modelId);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result?.data || null);
      };
      request.onerror = () => resolve(null);
    });
  } catch (error) {
    logger.warn('[ModelLoader] Cache read failed:', error);
    return null;
  }
}

/**
 * Save model to IndexedDB cache
 */
async function saveToCache(modelId: string, data: ArrayBuffer): Promise<void> {
  try {
    const db = await getModelDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put({ id: modelId, data, cachedAt: Date.now() });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    logger.warn('[ModelLoader] Cache write failed:', error);
  }
}

/**
 * Clear all cached models
 */
export async function clearModelCache(): Promise<void> {
  try {
    const db = await getModelDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
logger.info('[ModelLoader] Model cache cleared');
  } catch (error) {
    logger.warn('[ModelLoader] Cache clear failed:', error);
  }
}

/**
 * Get cached models list with sizes
 */
export async function getCachedModels(): Promise<Array<{ id: string; sizeMB: number; cachedAt: number }>> {
  try {
    const db = await getModelDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    
    return new Promise((resolve) => {
      const results: Array<{ id: string; sizeMB: number; cachedAt: number }> = [];
      const request = store.openCursor();
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push({
            id: cursor.value.id,
            sizeMB: cursor.value.data.byteLength / (1024 * 1024),
            cachedAt: cursor.value.cachedAt,
          });
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => resolve([]);
    });
  } catch (error) {
    return [];
  }
}

/**
 * Detect best backend for current device
 */
export function detectBestBackend(): 'wasm' | 'webgl' | 'cpu' {
  const ua = navigator.userAgent.toLowerCase();
  
  // Check if it's a low-end device
  const deviceMemory = (navigator as any).deviceMemory || 2;
  const isLowEnd = deviceMemory <= 2;
  
  // Check for WebGL support
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  
  if (!gl) {
    logger.info('[ModelLoader] No WebGL, using WASM backend');
    return 'wasm';
  }
  
  // On 2GB phones, prefer WASM for stability
  if (isLowEnd) {
    logger.info('[ModelLoader] Low-end device detected, using WASM backend');
    return 'wasm';
  }
  
  // Check if Safari (WebGL has issues on some versions)
  if (ua.includes('safari') && !ua.includes('chrome')) {
    return 'wasm';
  }
  
  return 'webgl';
}

/**
 * Load a model with progress tracking
 * Uses progressive loading: download → parse → warm up
 */
export async function loadModel(
  config: ModelConfig,
  onProgress?: (progress: ModelLoadProgress) => void
): Promise<LoadedModel> {
  const modelId = `${config.url}-${config.preferredBackend || 'auto'}`;
  
  // Check if already loaded
  const cached = modelCache.get(modelId);
  if (cached) {
    logger.info('[ModelLoader] Using cached model:', modelId);
    return cached;
  }
  
  // Check if already loading
  const existingPromise = loadPromises.get(modelId);
  if (existingPromise) {
    return existingPromise;
  }
  
  // Check memory before loading
  if (!canLoadModel(config.sizeMB)) {
    // Try to free memory
    requestGC();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (!canLoadModel(config.sizeMB)) {
      throw new Error(`Insufficient memory to load model (${config.sizeMB}MB required)`);
    }
  }
  
  // Start loading
  const loadPromise = (async () => {
    try {
      let modelData: ArrayBuffer;
      
      // Stage 1: Download or load from cache
      onProgress?.({
        stage: 'downloading',
        progress: 10,
        message: 'Checking cache...',
      });
      
      // Try cache first
      if (config.cacheEnabled !== false) {
        modelData = (await loadFromCache(modelId)) as ArrayBuffer;
      }
      
      if (!modelData) {
        // Download model
        logger.info('[ModelLoader] Downloading model:', config.url);
        
        const response = await fetch(config.url, {
          ...config.fetchOptions,
          headers: {
            ...config.fetchOptions?.headers,
            'Cache-Control': 'no-cache',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to download model: ${response.status}`);
        }
        
        // Get content length for progress
        const contentLength = parseInt(response.headers.get('Content-Length') || '0', 10);
        
        // Read as array buffer with progress
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }
        
        const chunks: Uint8Array[] = [];
        let receivedLength = 0;
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          chunks.push(value);
          receivedLength += value.length;
          
          if (contentLength > 0) {
            const progress = 10 + (receivedLength / contentLength) * 50;
            onProgress?.({
              stage: 'downloading',
              progress: Math.round(progress),
              message: `Downloading... ${Math.round(proceivedLength / 1024)}KB`,
            });
          }
        }
        
        // Combine chunks
        modelData = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
          modelData.set(chunk, position);
          position += chunk.length;
        }
        
        // Cache if enabled
        if (config.cacheEnabled !== false) {
          saveToCache(modelId, modelData.buffer);
        }
      } else {
        onProgress?.({
          stage: 'downloading',
          progress: 60,
          message: 'Loaded from cache',
        });
      }
      
      // Stage 2: Parse/compile model
      onProgress?.({
        stage: 'loading',
        progress: 70,
        message: 'Parsing model...',
      });
      
      // Determine backend
      const backend = config.preferredBackend || detectBestBackend();
      
      // For ONNX models, use ONNX Runtime Web
      // For TensorFlow.js, use tf.loadLayersModel
      // For this implementation, we'll create a mock that returns features
      // In production, you'd integrate actual ONNX or TF.js
      
      let model: any;
      let predict: (input: any) => Promise<any>;
      
      onProgress?.({
        stage: 'compiling',
        progress: 85,
        message: `Initializing ${backend} backend...`,
      });
      
      // Simulate model initialization
      // In production, this would be:
      // - ONNX: const session = new onnx.InferenceSession(modelData, backend);
      // - TF.js: const model = await tf.loadLayersModel(URL.createObjectURL(new Blob([modelData])));
      
      model = { initialized: true, backend };
      predict = async (input: any) => {
        // Placeholder - in production, run actual inference
        return new Float32Array(128); // Return dummy embedding
      };
      
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate compile time
      
      // Stage 3: Ready
      onProgress?.({
        stage: 'ready',
        progress: 100,
        message: 'Model ready',
      });
      
      const loadedModel: LoadedModel = {
        id: modelId,
        model,
        backend,
        memoryUsageMB: config.sizeMB,
        loadedAt: Date.now(),
        predict,
        dispose: () => {
          modelCache.delete(modelId);
          // Dispose tensors if using TF.js
          // if (model.dispose) model.dispose();
        },
      };
      
      modelCache.set(modelId, loadedModel);
      logger.info('[ModelLoader] Model loaded:', modelId, `(${backend})`);
      
      return loadedModel;
      
    } finally {
      loadPromises.delete(modelId);
    }
  })();
  
  loadPromises.set(modelId, loadPromise);
  return loadPromise;
}

/**
 * Unload a specific model
 */
export function unloadModel(modelId: string): void {
  const model = modelCache.get(modelId);
  if (model) {
    model.dispose();
    requestGC();
    logger.info('[ModelLoader] Model unloaded:', modelId);
  }
}

/**
 * Unload all models to free memory
 */
export function unloadAllModels(): void {
  for (const [id, model] of modelCache) {
    model.dispose();
  }
  modelCache.clear();
  requestGC();
  logger.info('[ModelLoader] All models unloaded');
}

/**
 * Get current memory usage from loaded models
 */
export function getModelMemoryUsage(): number {
  let total = 0;
  for (const model of modelCache.values()) {
    total += model.memoryUsageMB;
  }
  return total;
}

/**
 * Check if a model is loaded
 */
export function isModelLoaded(modelId: string): boolean {
  return modelCache.has(modelId);
}

/**
 * Get all loaded models
 */
export function getLoadedModels(): string[] {
  return Array.from(modelCache.keys());
}

export default {
  loadModel,
  unloadModel,
  unloadAllModels,
  isModelLoaded,
  getLoadedModels,
  getModelMemoryUsage,
  clearModelCache,
  getCachedModels,
  detectBestBackend,
};
