/**
 * Tensor Cleanup Utilities
 * Aggressive memory management for 2GB RAM phones
 * Ensures tensors are disposed properly to prevent memory leaks
 */

/**
 * Memory budget for ML operations on 2GB RAM phones
 */
export const MEMORY_BUDGET = {
  // Maximum memory to use for ML operations (MB)
  ML_MAX_MEMORY_MB: 100,
  
  // Threshold to trigger aggressive cleanup (MB)
  CLEANUP_THRESHOLD_MB: 80,
  
  // Interval between memory checks (ms)
  CHECK_INTERVAL_MS: 1000,
  
  // Maximum tensors to keep in cache
  MAX_TENSOR_CACHE: 3,
} as const;

/**
 * Memory statistics interface
 */
export interface MemoryStats {
  usedMB: number;
  limitMB: number;
  tensorCount: number;
  isLowMemory: boolean;
}

/**
 * Track tensor disposal for debugging
 */
const tensorDisposalLog: Set<string> = new Set();

/**
 * Enhanced tensor disposal with memory tracking
 */
export function disposeTensor(tensor: any, name?: string): void {
  if (!tensor) return;
  
  try {
    // Check if tensor has dispose method
    if (typeof tensor.dispose === 'function') {
      tensor.dispose();
      
      if (name) {
        tensorDisposalLog.add(name);
        // Keep only last 100 logs
        if (tensorDisposalLog.size > 100) {
          const first = tensorDisposalLog.values().next().value;
          tensorDisposalLog.delete(first);
        }
      }
    }
  } catch (error) {
    console.warn('[TensorCleanup] Failed to dispose tensor:', error);
  }
}

/**
 * Dispose multiple tensors at once
 */
export function disposeTensors(tensors: (any | null | undefined)[]): void {
  for (const tensor of tensors) {
    if (tensor) {
      disposeTensor(tensor);
    }
  }
}

/**
 * Create a scope that automatically disposes tensors
 */
export function withTensorScope<T>(
  callback: (dispose: typeof disposeTensors) => T
): T {
  const tensors: any[] = [];
  
  const trackedTensor = <T extends any>(tensor: T): T => {
    tensors.push(tensor);
    return tensor;
  };
  
  const dispose = (ts?: any[]) => {
    if (ts) {
      disposeTensors(ts);
    } else {
      disposeTensors(tensors);
      tensors.length = 0;
    }
  };
  
  try {
    return callback(dispose);
  } finally {
    dispose();
  }
}

/**
 * Check if we're in low memory condition
 * Uses Navigator.deviceMemory and performance.memory (Chrome only)
 */
export function checkMemoryStatus(): MemoryStats {
  const stats: MemoryStats = {
    usedMB: 0,
    limitMB: 2048, // Default assumption for 2GB RAM
    tensorCount: 0,
    isLowMemory: false,
  };
  
  // Check device memory
  const deviceMemory = (navigator as any).deviceMemory;
  if (deviceMemory) {
    stats.limitMB = deviceMemory * 1024; // Convert GB to MB
  }
  
  // Check JS heap size (Chrome/Edge only)
  const perf = performance as any;
  if (perf?.memory) {
    stats.usedMB = perf.memory.usedJSHeapSize / (1024 * 1024);
    
    // Check if using more than 80% of budget
    stats.isLowMemory = stats.usedMB > (MEMORY_BUDGET.ML_MAX_MEMORY_MB * 0.8);
  }
  
  return stats;
}

/**
 * Force garbage collection if available
 * This is a hint, not guaranteed
 */
export function requestGC(): void {
  // Try to trigger GC by forcing allocations
  // This is a workaround for browsers that don't expose GC
  
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      // Create and release objects to hint GC
      const temp = new Array(100000).fill(0);
      temp.length = 0;
    }, { timeout: 100 });
  } else {
    setTimeout(() => {
      const temp = new Array(100000).fill(0);
      temp.length = 0;
    }, 100);
  }
}

/**
 * Memory monitor class for tracking ML memory usage
 */
export class MemoryMonitor {
  private checkInterval: number | null = null;
  private callbacks: Set<(stats: MemoryStats) => void> = new Set();
  
  start(): void {
    if (this.checkInterval) return;
    
    this.checkInterval = window.setInterval(() => {
      const stats = checkMemoryStatus();
      
      // Notify all callbacks
      for (const callback of this.callbacks) {
        try {
          callback(stats);
        } catch (e) {
          console.warn('[MemoryMonitor] Callback error:', e);
        }
      }
      
      // Auto cleanup if low memory
      if (stats.isLowMemory) {
        this.triggerCleanup();
      }
    }, MEMORY_BUDGET.CHECK_INTERVAL_MS);
  }
  
  stop(): void {
    if (this.checkInterval) {
      window.clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
  
  subscribe(callback: (stats: MemoryStats) => void): () => void {
    this.callbacks.add(callback);
    return () => this.callbacks.delete(callback);
  }
  
  private triggerCleanup(): void {
    console.warn('[MemoryMonitor] Low memory detected, requesting cleanup');
    requestGC();
  }
  
  getStats(): MemoryStats {
    return checkMemoryStatus();
  }
}

// Singleton instance
export const memoryMonitor = new MemoryMonitor();

/**
 * Utility to estimate tensor memory usage
 */
export function estimateTensorSize(shape: number[], dtype: string = 'float32'): number {
  const elementSize = dtype === 'float32' ? 4 : dtype === 'int32' ? 4 : 1;
  const totalElements = shape.reduce((a, b) => a * b, 1);
  return (totalElements * elementSize) / (1024 * 1024); // MB
}

/**
 * Pre-check before loading model
 */
export function canLoadModel(estimatedSizeMB: number): boolean {
  const stats = checkMemoryStatus();
  const availableMB = stats.limitMB - stats.usedMB;
  
  // Require at least 2x the model size as buffer
  return availableMB > (estimatedSizeMB * 2);
}

/**
 * Get recommended batch size based on available memory
 */
export function getRecommendedBatchSize(baseSize: number = 1): number {
  const stats = checkMemoryStatus();
  
  if (stats.isLowMemory || stats.limitMB <= 2048) {
    return 1; // Process one at a time on 2GB phones
  }
  
  if (stats.limitMB <= 4096) {
    return Math.min(baseSize, 2);
  }
  
  return baseSize;
}

export default {
  MEMORY_BUDGET,
  disposeTensor,
  disposeTensors,
  withTensorScope,
  checkMemoryStatus,
  requestGC,
  memoryMonitor,
  estimateTensorSize,
  canLoadModel,
  getRecommendedBatchSize,
};
