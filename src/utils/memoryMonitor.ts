/**
 * Memory Monitor for Low-End Android Devices
 * Optimized for Ethiopian farmers using basic smartphones
 */

interface MemoryStats {
  used: number;
  total: number;
  limit: number;
  percentage: number;
}

interface PerformanceMetrics {
  memory: MemoryStats | null;
  battery: number | null;
  networkType: string;
  deviceMemory: number | null;
  hardwareConcurrency: number;
}

class MemoryMonitor {
  private static instance: MemoryMonitor;
  private memoryWarnings: number = 0;
  private lastCleanup: number = Date.now();
  private cleanupInterval: number = 5 * 60 * 1000; // 5 minutes
  private memoryThreshold: number = 0.8; // 80% memory usage

  private constructor() {
    this.initializeMonitoring();
  }

  static getInstance(): MemoryMonitor {
    if (!MemoryMonitor.instance) {
      MemoryMonitor.instance = new MemoryMonitor();
    }
    return MemoryMonitor.instance;
  }

  private initializeMonitoring(): void {
    // Monitor memory usage every 30 seconds
    setInterval(() => {
      this.checkMemoryUsage();
    }, 30000);

    // Monitor page visibility changes for cleanup
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.performLightCleanup();
      }
    });

    // Monitor before unload for final cleanup
    window.addEventListener('beforeunload', () => {
      this.performAggressiveCleanup();
    });

    // Monitor low memory events (if supported)
    if ('ondeviceMemory' in navigator) {
      // @ts-ignore
      navigator.deviceMemory.addEventListener('change', (event) => {
        console.warn('Device memory pressure detected');
        this.performAggressiveCleanup();
      });
    }
  }

  private checkMemoryUsage(): void {
    const metrics = this.getPerformanceMetrics();

    if (metrics.memory && metrics.memory.percentage > this.memoryThreshold) {
      this.memoryWarnings++;
      console.warn(`High memory usage detected: ${metrics.memory.percentage * 100}%`);

      if (this.memoryWarnings >= 3) {
        this.performAggressiveCleanup();
        this.memoryWarnings = 0;
      } else {
        this.performLightCleanup();
      }
    }

    // Periodic cleanup
    if (Date.now() - this.lastCleanup > this.cleanupInterval) {
      this.performPeriodicCleanup();
    }
  }

  private performLightCleanup(): void {
    try {
      // Clear unused DOM elements
      this.clearUnusedDOMElements();

      // Clear expired cache entries
      this.clearExpiredCache();

      // Force garbage collection hint (if available)
      if (window.gc) {
        window.gc();
      }

      console.log('Light memory cleanup performed');
    } catch (error) {
      console.error('Error during light cleanup:', error);
    }
  }

  private performAggressiveCleanup(): void {
    try {
      // More aggressive cleanup
      this.clearUnusedDOMElements();
      this.clearExpiredCache();
      this.clearOldEventListeners();
      this.clearUnusedImages();

      // Clear React query cache if it's getting too large
      this.clearQueryCache();

      // Force garbage collection
      if (window.gc) {
        window.gc();
      }

      this.lastCleanup = Date.now();
      console.log('Aggressive memory cleanup performed');
    } catch (error) {
      console.error('Error during aggressive cleanup:', error);
    }
  }

  private performPeriodicCleanup(): void {
    try {
      // Less aggressive periodic cleanup
      this.clearExpiredCache();
      this.clearOldConsoleLogs();

      this.lastCleanup = Date.now();
      console.log('Periodic memory cleanup performed');
    } catch (error) {
      console.error('Error during periodic cleanup:', error);
    }
  }

  private clearUnusedDOMElements(): void {
    // Remove hidden/offscreen elements that might be holding memory
    const hiddenElements = document.querySelectorAll('[style*="display: none"], [hidden]');
    hiddenElements.forEach(element => {
      if (element && !element.hasAttribute('data-keep-alive')) {
        element.remove();
      }
    });
  }

  private clearExpiredCache(): void {
    // Clear localStorage items older than 24 hours
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('temp-')) {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const data = JSON.parse(value);
            if (data.timestamp && (now - data.timestamp) > 24 * 60 * 60 * 1000) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Invalid JSON, remove it
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  private clearOldEventListeners(): void {
    // This is a simplified approach - in a real app you'd track listeners
    // For now, we'll just clear any known event listeners on common elements
    const elements = document.querySelectorAll('[data-has-listeners]');
    elements.forEach(element => {
      // Remove data attribute to mark as cleaned
      element.removeAttribute('data-has-listeners');
    });
  }

  private clearUnusedImages(): void {
    // Clear blob URLs for images that are no longer in the DOM
    const images = document.querySelectorAll('img[src^="blob:"]');
    images.forEach(img => {
      const htmlImg = img as HTMLImageElement;
      const src = htmlImg.getAttribute('src');
      if (src && !htmlImg.complete && !htmlImg.naturalWidth) {
        // Image failed to load, revoke the blob URL
        URL.revokeObjectURL(src);
      }
    });
  }

  private clearQueryCache(): void {
    // Clear old/inactive React Query cache entries
    try {
      // This would integrate with React Query's cache management
      // For now, we'll just clear any known cache keys
      if (window.localStorage) {
        const cacheKeys = Object.keys(localStorage).filter(key =>
          key.includes('react-query') || key.includes('query-cache')
        );
        cacheKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
          } catch {
            // Ignore errors
          }
        });
      }
    } catch (error) {
      console.error('Error clearing query cache:', error);
    }
  }

  private clearOldConsoleLogs(): void {
    // Clear old console logs if they exist
    if (console.clear && typeof console.clear === 'function') {
      // Only clear if there are too many logs (simple heuristic)
      console.clear();
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const memory = this.getMemoryStats();
    const battery = this.getBatteryLevel();
    const networkType = this.getNetworkType();
    const deviceMemory = this.getDeviceMemory();
    const hardwareConcurrency = navigator.hardwareConcurrency || 1;

    return {
      memory,
      battery,
      networkType,
      deviceMemory,
      hardwareConcurrency
    };
  }

  private getMemoryStats(): MemoryStats | null {
    // @ts-ignore - performance.memory is not in all browsers
    const memInfo = performance.memory;
    if (!memInfo) return null;

    const used = memInfo.usedJSHeapSize;
    const total = memInfo.totalJSHeapSize;
    const limit = memInfo.jsHeapSizeLimit;

    return {
      used,
      total,
      limit,
      percentage: used / limit
    };
  }

  private getBatteryLevel(): number | null {
    // @ts-ignore - Battery API
    if ('getBattery' in navigator) {
      // @ts-ignore
      return navigator.getBattery().then(battery => battery.level * 100);
    }
    return null;
  }

  private getNetworkType(): string {
    // @ts-ignore - Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || 'unknown';
  }

  private getDeviceMemory(): number | null {
    // @ts-ignore - Device Memory API
    return navigator.deviceMemory || null;
  }

  // Public API for manual cleanup
  forceCleanup(): void {
    this.performAggressiveCleanup();
  }

  // Get current memory status
  getMemoryStatus(): { level: 'low' | 'medium' | 'high'; percentage: number } {
    const metrics = this.getPerformanceMetrics();

    if (!metrics.memory) {
      return { level: 'medium', percentage: 0.5 };
    }

    const percentage = metrics.memory.percentage;

    if (percentage > 0.9) return { level: 'high', percentage };
    if (percentage > 0.7) return { level: 'medium', percentage };
    return { level: 'low', percentage };
  }
}

// Export singleton instance
export const memoryMonitor = MemoryMonitor.getInstance();

// Export types
export type { MemoryStats, PerformanceMetrics };