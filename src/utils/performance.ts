// src/utils/performance.ts - Performance monitoring and optimization utilities
// Used to measure and optimize app performance

export interface PerformanceMetrics {
  pageLoadTime: number;
  dataLoadTime: number;
  componentRenderTime: number;
  totalBundleSize: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics[] = [];
  private startTime: Record<string, number> = {};

  static getInstance(): PerformanceMonitor {
    if (!this.instance) {
      this.instance = new PerformanceMonitor();
    }
    return this.instance;
  }

  // Start timing a operation
  start(label: string): void {
    this.startTime[label] = performance.now();
  }

  // End timing and record metric
  end(label: string): number {
    const startTime = this.startTime[label];
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
    
    delete this.startTime[label];
    return duration;
  }

  // Record page load time
  recordPageLoad(pageName: string, loadTime: number): void {
    this.metrics.push({
      pageLoadTime: loadTime,
      dataLoadTime: 0,
      componentRenderTime: 0,
      totalBundleSize: 0,
      timestamp: Date.now()
    });
    
    // Log slow pages (> 3 seconds)
    if (loadTime > 3000) {
      console.warn(`⚠️ Slow page load detected: ${pageName} - ${loadTime.toFixed(0)}ms`);
    }
  }

  // Measure Supabase query performance
  async measureQuery<T>(
    queryName: string,
    queryFn: () => Promise<T>
  ): Promise<T> {
    this.start(queryName);
    try {
      const result = await queryFn();
      const duration = this.end(queryName);
      
      if (duration > 1000) {
        console.warn(`⚠️ Slow query detected: ${queryName} - ${duration.toFixed(0)}ms`);
      }
      
      return result;
    } catch (error) {
      this.end(queryName);
      throw error;
    }
  }

  // Get performance summary
  getSummary(): {
    averageLoadTime: number;
    slowQueries: number;
    totalQueries: number;
  } {
    const recentMetrics = this.metrics.slice(-10); // Last 10 page loads
    const avgLoadTime = recentMetrics.length > 0
      ? recentMetrics.reduce((acc, m) => acc + m.pageLoadTime, 0) / recentMetrics.length
      : 0;
    
    return {
      averageLoadTime: avgLoadTime,
      slowQueries: 0,
      totalQueries: this.metrics.length
    };
  }
}

// Prefetch utilities for route prefetching
export const prefetchRoutes = (routes: string[]) => {
  // In development, log prefetching
  if (import.meta.env.DEV) {
    console.log('[Prefetch] Prefetching routes:', routes);
  }
};

// Cache time constants
export const CACHE_TIMES = {
  ANIMALS: 5 * 60 * 1000, // 5 minutes
  MILK_RECORDS: 1 * 60 * 1000, // 1 minute
  LISTINGS: 2 * 60 * 1000, // 2 minutes
};

// Image optimization using Supabase Storage transformations
export const getOptimizedImageUrl = (url: string, width: number = 200): string => {
  if (!url) return '';
  
  // Check if it's a Supabase Storage URL
  if (url.includes('supabase.co') && url.includes('storage')) {
    // Supabase uses format: /storage/v1/object/renderize/image/...)
    // We need to use their transformation API
    // Format: bucketurl/photos/image.jpg?width=200&height=200&resize=contain
    
    // Use transform API
    const transformUrl = url.includes('?') 
      ? `${url}&width=${width}` 
      : `${url}?width=${width}`;
    
    return transformUrl;
  }
  
  // For other URLs (e.g., external CDN), return as-is
  return url;
};

// Check if a URL supports transformation
export const supportsTransformation = (url: string): boolean => {
  if (!url) return false;
  return url.includes('supabase.co') && url.includes('storage');
};

// 生成低质量图片 URL 用于慢速网络
export const getLowQualityImageUrl = (url: string, width: number = 100): string => {
  return getOptimizedImageUrl(url, width);
};

// 获取中等质量图片 URL 用于常规网络
export const getMediumQualityImageUrl = (url: string, width: number = 300): string => {
  return getOptimizedImageUrl(url, width);
};

// 获取高质量图片 URL 用于快速网络
export const getHighQualityImageUrl = (url: string, width: number = 800): string => {
  return getOptimizedImageUrl(url, width);
};

// Debounce utility for search inputs
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle utility for scroll events
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export default PerformanceMonitor;
