/**
 * Memory monitoring hook for low-end devices
 * Monitors memory usage and triggers cleanup when needed
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  usagePercentage: number;
}

interface UseMemoryMonitorOptions {
  threshold?: number; // Percentage threshold (0-100) default 80%
  checkInterval?: number; // Check interval in ms default 30000
  onCleanup?: () => void;
}

export const useMemoryMonitor = (options: UseMemoryMonitorOptions = {}) => {
  const { 
    threshold = 80, 
    checkInterval = 30000,
    onCleanup 
  } = options;
  
  const intervalRef = useRef<number | null>(null);
  const lastCleanupRef = useRef<number>(0);

  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    const memory = (performance as any).memory;
    if (!memory) return null;

    const usagePercentage = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
    
    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage
    };
  }, []);

  const checkMemory = useCallback(() => {
    const memoryInfo = getMemoryInfo();
    
    if (memoryInfo && memoryInfo.usagePercentage > threshold) {
      // Throttle cleanup to once per minute
      const now = Date.now();
      if (now - lastCleanupRef.current > 60000) {
        lastCleanupRef.current = now;
        
        if (onCleanup) {
          onCleanup();
        }
        
        // Log warning in development
        if (import.meta.env.DEV) {
          console.warn(`[Memory] High usage: ${memoryInfo.usagePercentage.toFixed(1)}%`);
        }
      }
    }
  }, [getMemoryInfo, threshold, onCleanup]);

  useEffect(() => {
    // Only run on devices with memory API (Chrome)
    if (!(performance as any).memory) {
      return;
    }

    // Initial check
    checkMemory();

    // Set up periodic checking
    intervalRef.current = window.setInterval(checkMemory, checkInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [checkMemory, checkInterval]);

  return {
    getMemoryInfo,
    isAboveThreshold: getMemoryInfo()?.usagePercentage ? 
      getMemoryInfo()!.usagePercentage > threshold : false
  };
};

/**
 * Hook to get device memory category
 */
export const useDeviceMemoryCategory = (): 'low' | 'medium' | 'high' => {
  const getCategory = (): 'low' | 'medium' | 'high' => {
    const memory = (navigator as any).deviceMemory;
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    
    if (!memory && hardwareConcurrency <= 2) return 'low';
    if (!memory) return 'medium';
    
    if (memory <= 2 || hardwareConcurrency <= 2) return 'low';
    if (memory <= 4 || hardwareConcurrency <= 4) return 'medium';
    return 'high';
  };

  return getCategory();
};

/**
 * Hook to check if reduced animations should be applied
 */
export const useReducedMotion = (): boolean => {
  const [shouldReduce, setShouldReduce] = useState(false);

  useEffect(() => {
    const checkReducedMotion = () => {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const memory = (navigator as any).deviceMemory;
      const hardwareConcurrency = navigator.hardwareConcurrency || 2;
      
      // Reduce motion on low-end devices or user preference
      const isLowEnd = (memory && memory <= 2) || (hardwareConcurrency <= 2);
      
      setShouldReduce(prefersReducedMotion || isLowEnd);
    };

    checkReducedMotion();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = () => checkReducedMotion();
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return shouldReduce;
};
