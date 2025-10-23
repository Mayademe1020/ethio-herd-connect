/**
 * Utilities for lazy loading components and routes
 * Optimized for low-end devices in Ethiopian rural areas
 */

import React, { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinnerEnhanced } from '@/components/LoadingSpinnerEnhanced';

// Performance metrics tracking
interface ComponentLoadMetrics {
  componentName: string;
  startTime: number;
  endTime?: number;
  loadTime?: number;
}

const loadMetrics: ComponentLoadMetrics[] = [];

/**
 * Track component load performance
 * @param componentName Name of the component being loaded
 * @returns Tracking object with methods to mark load completion
 */
export const trackComponentLoad = (componentName: string) => {
  const metric: ComponentLoadMetrics = {
    componentName,
    startTime: performance.now()
  };
  
  loadMetrics.push(metric);
  
  return {
    complete: () => {
      metric.endTime = performance.now();
      metric.loadTime = metric.endTime - metric.startTime;
    }
  };
};

/**
 * Get performance metrics for component loading
 * @returns Array of component load metrics
 */
export const getLoadMetrics = () => {
  return loadMetrics;
};

/**
 * Clear performance metrics
 */
export const clearLoadMetrics = () => {
  loadMetrics.length = 0;
};

/**
 * Enhanced lazy loading with performance tracking and error handling
 * @param factory Function that imports the component
 * @param componentName Name of the component for tracking
 * @returns Lazy loaded component
 */
export function lazyLoad<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  componentName: string
): React.LazyExoticComponent<T> {
  return lazy(() => {
    const tracker = trackComponentLoad(componentName);
    
    return factory()
      .then(module => {
        tracker.complete();
        return module;
      })
      .catch(error => {
        console.error(`Error loading component ${componentName}:`, error);
        throw error;
      });
  });
}

/**
 * Suspense wrapper with fallback for lazy loaded components
 * @param props Component props including children
 * @returns Suspense wrapped component
 */
export const LazyLoadWrapper: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback }) => {
  const resolvedFallback = fallback ?? React.createElement(LoadingSpinnerEnhanced, { text: 'Loading...' });
  return React.createElement(Suspense, { fallback: resolvedFallback }, children);
};

/**
 * Prefetch a component to improve perceived performance
 * @param importFunc Function that imports the component
 */
export const prefetchComponent = (importFunc: () => Promise<any>) => {
  // Start loading the component in the background
  importFunc().catch(err => {
    // Silently catch errors during prefetch
    console.debug('Error during prefetch:', err);
  });
};

/**
 * Detect if the device is low-end based on hardware concurrency and memory
 * @returns Boolean indicating if the device is low-end
 */
export const isLowEndDevice = (): boolean => {
  // Check hardware concurrency (CPU cores)
  const lowConcurrency = navigator.hardwareConcurrency 
    ? navigator.hardwareConcurrency <= 4
    : true;
  
  // Check device memory if available
  const lowMemory = (navigator as any).deviceMemory 
    ? (navigator as any).deviceMemory <= 2
    : true;
  
  return lowConcurrency && lowMemory;
};

/**
 * Get appropriate chunk size based on device capabilities
 * @returns Recommended chunk size in KB
 */
export const getOptimalChunkSize = (): number => {
  if (isLowEndDevice()) {
    return 50; // 50KB chunks for low-end devices
  }
  return 200; // 200KB chunks for better devices
};