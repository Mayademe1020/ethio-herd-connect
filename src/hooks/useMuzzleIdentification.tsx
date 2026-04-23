/**
 * useMuzzleIdentification Hook
 * Manages the muzzle identification flow with local and cloud search capabilities
 * Requirements: 3.1, 3.2, 3.3, 6.2
 */

import { useState, useCallback, useRef } from 'react';
import { useMuzzleFeatureExtractor } from './useMuzzleFeatureExtractor';
import { muzzleSearchService, type SearchOptions } from '@/services/muzzleSearchService';
import { rateLimiter } from '@/utils/rateLimiter';
import { identificationLogger } from '@/services/identificationLogger';
import { useAuth } from '@/contexts/AuthContext';
import {
  type IdentificationResult,
  type SearchMode,
  type MuzzleEmbedding,
  type MuzzleError,
  MuzzleErrorCode,
  type IdentificationStatus
} from '@/types/muzzle';

// ============================================================================
// Types
// ============================================================================

export type IdentificationState =
  | 'idle'
  | 'extracting_features'
  | 'searching'
  | 'processing_results'
  | 'complete'
  | 'error';

export interface UseMuzzleIdentificationReturn {
  /** Current identification state */
  state: IdentificationState;
  /** Current identification result */
  result: IdentificationResult | null;
  /** Whether identification is currently in progress */
  isIdentifying: boolean;
  /** Last error that occurred */
  error: MuzzleError | null;
  /** Progress information */
  progress: {
    stage: 'feature_extraction' | 'local_search' | 'cloud_search' | 'processing';
    progress: number; // 0-100
    message: string;
  } | null;

  /** Identify muzzle from image */
  identifyMuzzle: (
    imageSource: Blob | File | HTMLImageElement | string,
    options?: {
      searchMode?: SearchMode;
      confidenceThreshold?: number;
      maxResults?: number;
      includeAlternatives?: boolean;
      onProgress?: (progress: { stage: string; progress: number; message: string }) => void;
    }
  ) => Promise<IdentificationResult>;

  /** Retry identification after an error */
  retryIdentification: () => Promise<void>;
  /** Clear current result and reset state */
  clearResult: () => void;
  /** Get identification history */
  getHistory: () => IdentificationResult[];
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_IDENTIFICATION_OPTIONS = {
  searchMode: 'hybrid' as SearchMode,
  confidenceThreshold: 0.85,
  maxResults: 5,
  includeAlternatives: true,
};

const MAX_IDENTIFICATION_ATTEMPTS = 2;
const IDENTIFICATION_TIMEOUT_MS = 30000; // 30 seconds

// ============================================================================
// Hook Implementation
// ============================================================================

export function useMuzzleIdentification(): UseMuzzleIdentificationReturn {
  const [state, setState] = useState<IdentificationState>('idle');
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [error, setError] = useState<MuzzleError | null>(null);
  const [progress, setProgress] = useState<{
    stage: 'feature_extraction' | 'local_search' | 'cloud_search' | 'processing';
    progress: number;
    message: string;
  } | null>(null);

  // Refs for tracking current operation
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastOptionsRef = useRef<any>(null);
  const lastImageSourceRef = useRef<any>(null);
  const historyRef = useRef<IdentificationResult[]>([]);

  // Use the feature extractor hook
  const {
    extractFeatures,
    isReady: isFeatureExtractorReady,
    error: featureExtractorError,
  } = useMuzzleFeatureExtractor();

  // Get current user for rate limiting and logging
  const { user } = useAuth();

  // ============================================================================
  // Main Identification Function
  // ============================================================================

  const identifyMuzzle = useCallback(async (
    imageSource: Blob | File | HTMLImageElement | string,
    options: {
      searchMode?: SearchMode;
      confidenceThreshold?: number;
      maxResults?: number;
      includeAlternatives?: boolean;
      onProgress?: (progress: { stage: string; progress: number; message: string }) => void;
    } = {}
  ): Promise<IdentificationResult> => {
    // Store for retry functionality
    lastOptionsRef.current = options;
    lastImageSourceRef.current = imageSource;

    // Cancel any existing operation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    // Reset state
    setState('idle');
    setError(null);
    setResult(null);

    const identificationOptions = { ...DEFAULT_IDENTIFICATION_OPTIONS, ...options };

    try {
      // Check rate limit before proceeding
      const currentUserId = user?.id || 'anonymous';
      const rateLimitCheck = await rateLimiter.checkLimit(
        currentUserId,
        'muzzle_identification'
      );

      if (!rateLimitCheck.allowed) {
        const rateLimitError: MuzzleError = {
          code: MuzzleErrorCode.RATE_LIMIT_EXCEEDED,
          message: `Rate limit exceeded. Try again after ${new Date(rateLimitCheck.resetTime).toLocaleTimeString()}`,
          messageAm: 'የመጠን ገደብ ከተለያ፣ እንደገና ይሞክሩ',
          retryable: false,
        };

        // Log security event
        await identificationLogger.logIdentification({
          result: {
            status: 'error',
            confidence: 0,
            searchedLocal: false,
            searchedCloud: false,
            timestamp: new Date().toISOString(),
            searchDurationMs: 0,
          },
          searchMode: identificationOptions.searchMode,
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
          },
        });

        setError(rateLimitError);
        setState('error');
        throw rateLimitError;
      }

      let attempt = 0;
      let finalResult: IdentificationResult;

      while (attempt < MAX_IDENTIFICATION_ATTEMPTS) {
        try {
          finalResult = await performIdentification(imageSource, identificationOptions, options.onProgress);
          break; // Success
        } catch (identificationError) {
          const muzzleError = identificationError as MuzzleError;
          if (!muzzleError.retryable || attempt >= MAX_IDENTIFICATION_ATTEMPTS - 1) {
            throw identificationError;
          }
          attempt++;
          setProgress({
            stage: 'feature_extraction',
            progress: 10 + (attempt / MAX_IDENTIFICATION_ATTEMPTS) * 10,
            message: `Retrying identification... (attempt ${attempt + 1}/${MAX_IDENTIFICATION_ATTEMPTS})`
          });
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      // Log successful identification
      await identificationLogger.logIdentification({
        result: finalResult,
        searchMode: identificationOptions.searchMode,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
        },
      });

      // Store in history
      historyRef.current.unshift(finalResult);
      // Keep only last 10 results
      if (historyRef.current.length > 10) {
        historyRef.current = historyRef.current.slice(0, 10);
      }

      setResult(finalResult);
      setState('complete');
      setProgress(null);

      return finalResult;

    } catch (err) {
      console.error('Muzzle identification failed:', err);
      const muzzleError = err as MuzzleError;
      setError(muzzleError);
      setState('error');
      setProgress(null);
      throw err;
    }
  }, [extractFeatures]);

  // ============================================================================
  // Identification Flow
  // ============================================================================

  const performIdentification = async (
    imageSource: Blob | File | HTMLImageElement | string,
    identificationOptions: typeof DEFAULT_IDENTIFICATION_OPTIONS,
    onProgress?: (progress: { stage: string; progress: number; message: string }) => void
  ): Promise<IdentificationResult> => {
    // Check if feature extractor is ready
    if (!isFeatureExtractorReady) {
      throw {
        code: MuzzleErrorCode.MODEL_NOT_CACHED,
        message: 'Feature extractor is not ready',
        messageAm: 'Feature extractor is not ready',
        retryable: true,
      } as MuzzleError;
    }

    // Initialize search service
    await muzzleSearchService.initialize();

    // Step 1: Extract features
    setState('extracting_features');
    updateProgress('feature_extraction', 10, 'Extracting features from image...', onProgress);

    const embedding = await extractFeatures(imageSource, {
      onProgress: (prog) => {
        updateProgress('feature_extraction', 10 + (prog.progress * 0.4), prog.message, onProgress);
      }
    });

    updateProgress('feature_extraction', 50, 'Features extracted successfully', onProgress);

    // Step 2: Perform search
    setState('searching');
    updateProgress('local_search', 60, 'Searching local database...', onProgress);

    const searchOptions: SearchOptions = {
      mode: identificationOptions.searchMode,
      confidenceThreshold: identificationOptions.confidenceThreshold,
      maxResults: identificationOptions.maxResults,
      includeAlternatives: identificationOptions.includeAlternatives,
      timeoutMs: IDENTIFICATION_TIMEOUT_MS,
    };

    const searchResult = await muzzleSearchService.identifyMuzzle(embedding.embedding, searchOptions);

    // Update progress based on search mode
    if (searchOptions.mode === 'local' || searchOptions.mode === 'hybrid') {
      updateProgress('local_search', 80, 'Local search completed', onProgress);
    }
    if (searchOptions.mode === 'cloud' || searchOptions.mode === 'hybrid') {
      updateProgress('cloud_search', 90, 'Cloud search completed', onProgress);
    }

    // Step 3: Process results
    setState('processing_results');
    updateProgress('processing', 95, 'Processing identification results...', onProgress);

    // Add any additional processing here if needed

    updateProgress('processing', 100, 'Identification complete', onProgress);

    return searchResult;
  };

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const updateProgress = (
    stage: 'feature_extraction' | 'local_search' | 'cloud_search' | 'processing',
    progress: number,
    message: string,
    onProgress?: (progress: { stage: string; progress: number; message: string }) => void
  ) => {
    const progressInfo = { stage, progress, message };
    setProgress(progressInfo);
    onProgress?.(progressInfo);
  };

  const retryIdentification = useCallback(async () => {
    if (!lastOptionsRef.current || !lastImageSourceRef.current) {
      throw new Error('No previous identification to retry');
    }

    await identifyMuzzle(lastImageSourceRef.current, lastOptionsRef.current);
  }, [identifyMuzzle]);

  const clearResult = useCallback(() => {
    setState('idle');
    setResult(null);
    setError(null);
    setProgress(null);
  }, []);

  const getHistory = useCallback(() => {
    return [...historyRef.current];
  }, []);

  // ============================================================================
  // Return Interface
  // ============================================================================

  return {
    state,
    result,
    isIdentifying: state === 'extracting_features' || state === 'searching' || state === 'processing_results',
    error: error || (featureExtractorError ? {
      code: MuzzleErrorCode.MODEL_LOAD_FAILED,
      message: typeof featureExtractorError === 'string' ? featureExtractorError : 'Feature extractor error',
      messageAm: 'የባህሪ ማውጫ ስህተት',
      retryable: true,
    } : null),
    progress,

    identifyMuzzle,
    retryIdentification,
    clearResult,
    getHistory,
  };
}

export default useMuzzleIdentification;