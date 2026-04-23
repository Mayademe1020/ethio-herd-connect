/**
 * useMuzzleFeatureExtractor Hook
 * Manages model loading state and provides feature extraction functionality
 * Requirements: 2.1, 2.2, 2.3
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { muzzleMLService, type FeatureExtractionResult } from '@/services/muzzleMLService';
import { MuzzleErrorCode, type MuzzleEmbedding } from '@/types/muzzle';

// ============================================================================
// Types
// ============================================================================

export type ExtractionState =
  | 'idle'
  | 'initializing'
  | 'loading_model'
  | 'ready'
  | 'extracting'
  | 'error';

export interface ExtractionProgress {
  stage: 'model_loading' | 'preprocessing' | 'extraction' | 'complete';
  progress: number; // 0-100
  message: string;
}

export interface UseMuzzleFeatureExtractorReturn {
  /** Current extraction state */
  state: ExtractionState;
  /** Current progress information */
  progress: ExtractionProgress | null;
  /** Whether the service is ready for extraction */
  isReady: boolean;
  /** Whether extraction is currently in progress */
  isExtracting: boolean;
  /** Last error that occurred */
  error: string | null;
  /** Error code for the last error */
  errorCode: MuzzleErrorCode | null;
  /** Extract features from an image */
  extractFeatures: (
    imageSource: Blob | File | HTMLImageElement | string,
    options?: {
      modelVersion?: string;
      onProgress?: (progress: ExtractionProgress) => void;
    }
  ) => Promise<FeatureExtractionResult>;
  /** Initialize the service */
  initialize: () => Promise<void>;
  /** Retry initialization after an error */
  retryInitialization: () => Promise<void>;
  /** Clear any cached models */
  clearCache: () => Promise<void>;
  /** Get service status */
  getStatus: () => any;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_EXTRACTION_ATTEMPTS = 3;
const RETRY_BACKOFF_BASE_MS = 1000;

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMuzzleFeatureExtractor(): UseMuzzleFeatureExtractorReturn {
  const [state, setState] = useState<ExtractionState>('idle');
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<MuzzleErrorCode | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============================================================================
  // Initialization
  // ============================================================================

  const initialize = useCallback(async () => {
    if (state === 'initializing' || state === 'ready') return;

    setState('initializing');
    setError(null);
    setErrorCode(null);
    setProgress({ stage: 'model_loading', progress: 0, message: 'Initializing ML service...' });

    try {
      await muzzleMLService.initialize();
      setState('loading_model');
      setProgress({ stage: 'model_loading', progress: 25, message: 'Loading model...' });

      // Load the model
      await muzzleMLService.loadModel();
      setProgress({ stage: 'model_loading', progress: 100, message: 'Model ready' });
      setState('ready');
      setProgress(null);
    } catch (err) {
      console.error('Failed to initialize feature extractor:', err);
      const muzzleError = err as any;
      setError(muzzleError.message || 'Failed to initialize');
      setErrorCode(muzzleError.code || MuzzleErrorCode.MODEL_LOAD_FAILED);
      setState('error');
      setProgress(null);
    }
  }, [state]);

  const retryInitialization = useCallback(async () => {
    // Clear any pending retry
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Reset state
    setState('idle');
    setError(null);
    setErrorCode(null);
    setProgress(null);

    // Retry after a short delay
    retryTimeoutRef.current = setTimeout(() => {
      initialize();
    }, 1000);
  }, [initialize]);

  // Auto-initialize on mount
  useEffect(() => {
    initialize();

    return () => {
      // Cleanup
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [initialize]);

  // ============================================================================
  // Feature Extraction
  // ============================================================================

  const extractFeatures = useCallback(async (
    imageSource: Blob | File | HTMLImageElement | string,
    options: {
      modelVersion?: string;
      onProgress?: (progress: ExtractionProgress) => void;
    } = {}
  ): Promise<FeatureExtractionResult> => {
    if (state !== 'ready') {
      throw new Error('Feature extractor is not ready. Current state: ' + state);
    }

    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setState('extracting');
    setError(null);
    setErrorCode(null);

    const updateProgress = (prog: ExtractionProgress) => {
      setProgress(prog);
      options.onProgress?.(prog);
    };

    try {
      let attempt = 0;
      let result: FeatureExtractionResult;
      while (attempt < MAX_EXTRACTION_ATTEMPTS) {
        try {
          updateProgress({
            stage: 'preprocessing',
            progress: 10,
            message: attempt > 0 ? `Preprocessing image... (attempt ${attempt + 1}/${MAX_EXTRACTION_ATTEMPTS})` : 'Preprocessing image...'
          });
          result = await muzzleMLService.extractFeatures(imageSource, {
            modelVersion: options.modelVersion,
          });
          break; // success
        } catch (extractionErr) {
          const muzzleError = extractionErr as any;
          if (!muzzleError.retryable || attempt >= MAX_EXTRACTION_ATTEMPTS - 1) {
            throw extractionErr;
          }
          attempt++;
          updateProgress({
            stage: 'preprocessing',
            progress: 5 + (attempt / MAX_EXTRACTION_ATTEMPTS) * 10,
            message: `Retrying extraction... (attempt ${attempt + 1}/${MAX_EXTRACTION_ATTEMPTS})`
          });
          await new Promise(resolve => setTimeout(resolve, RETRY_BACKOFF_BASE_MS * attempt));
        }
      }
      updateProgress({
        stage: 'extraction',
        progress: 90,
        message: 'Extracting features...'
      });
      updateProgress({
        stage: 'complete',
        progress: 100,
        message: 'Feature extraction complete'
      });
      setState('ready');
      setProgress(null);
      return result!;
    } catch (err) {
      console.error('Feature extraction failed:', err);
      const muzzleError = err as any;
      setError(muzzleError.message || 'Feature extraction failed');
      setErrorCode(muzzleError.code || MuzzleErrorCode.EXTRACTION_FAILED);
      setState('error');
      setProgress(null);
      throw err;
    }
  }, [state]);

  // ============================================================================
  // Utility Methods
  // ============================================================================

  const clearCache = useCallback(async () => {
    try {
      await muzzleMLService.clearCache();
      // Re-initialize after clearing cache
      setState('idle');
      setTimeout(() => initialize(), 100);
    } catch (err) {
      console.error('Failed to clear cache:', err);
      setError('Failed to clear model cache');
      setErrorCode(MuzzleErrorCode.MODEL_LOAD_FAILED);
    }
  }, [initialize]);

  const getStatus = useCallback(() => {
    return muzzleMLService.getStatus();
  }, []);

  // ============================================================================
  // Return Interface
  // ============================================================================

  return {
    state,
    progress,
    isReady: state === 'ready',
    isExtracting: state === 'extracting',
    error,
    errorCode,
    extractFeatures,
    initialize,
    retryInitialization,
    clearCache,
    getStatus,
  };
}

export default useMuzzleFeatureExtractor;