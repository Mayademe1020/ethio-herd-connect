/**
 * useLocalMuzzleInference - React Hook for Offline ML
 * 
 * SIMPLE PURPOSE:
 *   - Initialize ML once
 *   - Provide extractFeatures() function
 *   - Track readiness status
 * 
 * USAGE:
 *   const { extractFeatures, status, isReady } = useLocalMuzzleInference();
 *   const embedding = await extractFeatures(imageElement);
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  muzzleLocalMLService, 
  type LocalFeatureExtractionResult,
  type ImageQuality 
} from '@/services/muzzleLocalMLService';
import { checkMemoryStatus } from '@/utils/tensorCleanup';
import { logger } from '@/utils/logger';

// Status types
export type MLStatus = 'idle' | 'loading' | 'ready' | 'error';

// Hook return type
export interface UseLocalMuzzleInferenceReturn {
  /** Current status of ML service */
  status: MLStatus;
  
  /** True when ready to extract features */
  isReady: boolean;
  
  /** Error message if status is 'error' */
  error: string | null;
  
  /** Progress message during loading */
  progressMessage: string;
  
  /** Current memory usage in MB */
  memoryUsageMB: number;
  
  /** Initialize ML service (auto-called on mount) */
  initialize: () => Promise<void>;
  
  /** Extract features from image - THE MAIN FUNCTION */
  extractFeatures: (
    imageSource: HTMLImageElement | HTMLCanvasElement | ImageData
  ) => Promise<LocalFeatureExtractionResult>;
  
  /** Validate image quality without extracting */
  validateQuality: (
    imageSource: HTMLImageElement | HTMLCanvasElement | ImageData
  ) => Promise<ImageQuality>;
  
  /** Cleanup and free memory */
  dispose: () => void;
}

/**
 * useLocalMuzzleInference
 * 
 * ONE HOOK. ONE PURPOSE. SIMPLE.
 */
export function useLocalMuzzleInference(): UseLocalMuzzleInferenceReturn {
  // State
  const [status, setStatus] = useState<MLStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progressMessage, setProgressMessage] = useState<string>('');
  const [memoryUsageMB, setMemoryUsageMB] = useState<number>(0);
  
  // Track if initialized
  const initializedRef = useRef(false);
  
  // Initialize ML service
  const initialize = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      setStatus('loading');
      setProgressMessage('Starting ML service...');
      
      await muzzleLocalMLService.initialize((msg, progress) => {
        setProgressMessage(`${msg} (${progress}%)`);
      });
      
      initializedRef.current = true;
      setStatus('ready');
      setError(null);
      setProgressMessage('Ready');
      
      logger.info('[useLocalMuzzleInference] ML service ready');
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initialize';
      setStatus('error');
      setError(errorMsg);
      setProgressMessage('Error');
      
      logger.error('[useLocalMuzzleInference] Init failed:', err);
    }
  }, []);
  
  // Auto-initialize on mount
  useEffect(() => {
    initialize();
    
    // Update memory usage periodically
    const interval = setInterval(() => {
      const mem = checkMemoryStatus();
      setMemoryUsageMB(Math.round(mem.usedMB));
    }, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [initialize]);
  
  // Extract features from image
  const extractFeatures = useCallback(async (
    imageSource: HTMLImageElement | HTMLCanvasElement | ImageData
  ): Promise<LocalFeatureExtractionResult> => {
    // Ensure initialized
    if (!initializedRef.current) {
      await initialize();
    }
    
    if (status === 'error') {
      return {
        success: false,
        quality: { overall: 0, brightness: 0, sharpness: 0, coverage: 0, isAcceptable: false },
        processingTimeMs: 0,
        mode: 'local',
        error: error || 'ML not initialized',
      };
    }
    
    try {
      // Call the ML service
      const result = await muzzleLocalMLService.extractFeatures(imageSource);
      
      // Update memory after extraction
      const mem = checkMemoryStatus();
      setMemoryUsageMB(Math.round(mem.usedMB));
      
      return result;
      
    } catch (err) {
      logger.error('[useLocalMuzzleInference] Extraction failed:', err);
      return {
        success: false,
        quality: { overall: 0, brightness: 0, sharpness: 0, coverage: 0, isAcceptable: false },
        processingTimeMs: 0,
        mode: 'local',
        error: err instanceof Error ? err.message : 'Extraction failed',
      };
    }
  }, [initialize, status, error]);
  
  // Validate quality only
  const validateQuality = useCallback(async (
    imageSource: HTMLImageElement | HTMLCanvasElement | ImageData
  ): Promise<ImageQuality> => {
    return muzzleLocalMLService.validateImageQuality(imageSource);
  }, []);
  
  // Cleanup
  const dispose = useCallback(() => {
    muzzleLocalMLService.dispose();
    initializedRef.current = false;
    setStatus('idle');
    setProgressMessage('');
  }, []);
  
  return {
    status,
    isReady: status === 'ready',
    error,
    progressMessage,
    memoryUsageMB,
    initialize,
    extractFeatures,
    validateQuality,
    dispose,
  };
}

// Named export for convenience
export default useLocalMuzzleInference;
