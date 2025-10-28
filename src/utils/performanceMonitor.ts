/**
 * Performance Monitoring Utility
 * Tracks and reports performance metrics for device and network testing
 */

export interface PerformanceMetrics {
  loadTime: number;
  ttfb: number; // Time to First Byte
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  tti: number; // Time to Interactive
  tbt: number; // Total Blocking Time
  cls: number; // Cumulative Layout Shift
  fid: number; // First Input Delay
  memoryUsage?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  networkInfo?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  };
}

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  devicePixelRatio: number;
  online: boolean;
  cookieEnabled: boolean;
  hardwareConcurrency: number;
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};
  private marks: Map<string, number> = new Map();

  /**
   * Initialize performance monitoring
   */
  init(): void {
    if (typeof window === 'undefined') return;

    // Monitor page load
    window.addEventListener('load', () => {
      this.collectLoadMetrics();
    });

    // Monitor First Input Delay
    this.observeFirstInput();

    // Monitor Largest Contentful Paint
    this.observeLCP();

    // Monitor Cumulative Layout Shift
    this.observeCLS();

    // Log metrics when page is hidden (user leaves)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.logMetrics();
      }
    });
  }

  /**
   * Collect page load metrics
   */
  private collectLoadMetrics(): void {
    if (!performance.timing) return;

    const timing = performance.timing;
    const navigation = performance.navigation;

    this.metrics.loadTime = timing.loadEventEnd - timing.navigationStart;
    this.metrics.ttfb = timing.responseStart - timing.navigationStart;

    // Get paint timing
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    if (fcp) {
      this.metrics.fcp = fcp.startTime;
    }

    // Calculate Time to Interactive (approximation)
    this.metrics.tti = timing.domInteractive - timing.navigationStart;

    // Calculate Total Blocking Time (approximation)
    this.calculateTBT();

    console.log('📊 Load Metrics:', {
      loadTime: `${this.metrics.loadTime}ms`,
      ttfb: `${this.metrics.ttfb}ms`,
      fcp: `${this.metrics.fcp}ms`,
      tti: `${this.metrics.tti}ms`
    });
  }

  /**
   * Calculate Total Blocking Time
   */
  private calculateTBT(): void {
    const longTasks = performance.getEntriesByType('longtask') as any[];
    let tbt = 0;

    longTasks.forEach(task => {
      const blockingTime = task.duration - 50; // Tasks >50ms are blocking
      if (blockingTime > 0) {
        tbt += blockingTime;
      }
    });

    this.metrics.tbt = tbt;
  }

  /**
   * Observe First Input Delay
   */
  private observeFirstInput(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (entry.name === 'first-input') {
            this.metrics.fid = entry.processingStart - entry.startTime;
            console.log('⚡ First Input Delay:', `${this.metrics.fid}ms`);
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observation not supported');
    }
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        console.log('🎨 Largest Contentful Paint:', `${this.metrics.lcp}ms`);
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation not supported');
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    if (!('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.metrics.cls = clsValue;
      });

      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation not supported');
    }
  }

  /**
   * Get memory usage (Chrome only)
   */
  getMemoryUsage(): PerformanceMetrics['memoryUsage'] | null {
    const memory = (performance as any).memory;
    if (!memory) return null;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit
    };
  }

  /**
   * Get network information
   */
  getNetworkInfo(): PerformanceMetrics['networkInfo'] | null {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (!connection) return null;

    return {
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0,
      rtt: connection.rtt || 0,
      saveData: connection.saveData || false
    };
  }

  /**
   * Get device information
   */
  getDeviceInfo(): DeviceInfo {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };
  }

  /**
   * Mark a performance point
   */
  mark(name: string): void {
    const timestamp = performance.now();
    this.marks.set(name, timestamp);
    performance.mark(name);
  }

  /**
   * Measure time between two marks
   */
  measure(name: string, startMark: string, endMark: string): number {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      return measure.duration;
    } catch (error) {
      console.warn(`Failed to measure ${name}:`, error);
      return 0;
    }
  }

  /**
   * Get time since mark
   */
  getTimeSinceMark(markName: string): number {
    const markTime = this.marks.get(markName);
    if (!markTime) return 0;
    return performance.now() - markTime;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      memoryUsage: this.getMemoryUsage() || undefined,
      networkInfo: this.getNetworkInfo() || undefined
    } as PerformanceMetrics;
  }

  /**
   * Log all metrics to console
   */
  logMetrics(): void {
    const metrics = this.getAllMetrics();
    const deviceInfo = this.getDeviceInfo();

    console.group('📊 Performance Report');
    
    console.group('⏱️ Timing Metrics');
    console.log('Load Time:', `${metrics.loadTime}ms`);
    console.log('TTFB:', `${metrics.ttfb}ms`);
    console.log('FCP:', `${metrics.fcp}ms`);
    console.log('LCP:', `${metrics.lcp}ms`);
    console.log('TTI:', `${metrics.tti}ms`);
    console.log('TBT:', `${metrics.tbt}ms`);
    console.log('FID:', `${metrics.fid}ms`);
    console.log('CLS:', metrics.cls);
    console.groupEnd();

    if (metrics.memoryUsage) {
      console.group('💾 Memory Usage');
      console.log('Used:', `${(metrics.memoryUsage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('Total:', `${(metrics.memoryUsage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`);
      console.log('Limit:', `${(metrics.memoryUsage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
      console.groupEnd();
    }

    if (metrics.networkInfo) {
      console.group('🌐 Network Info');
      console.log('Type:', metrics.networkInfo.effectiveType);
      console.log('Downlink:', `${metrics.networkInfo.downlink} Mbps`);
      console.log('RTT:', `${metrics.networkInfo.rtt}ms`);
      console.log('Save Data:', metrics.networkInfo.saveData);
      console.groupEnd();
    }

    console.group('📱 Device Info');
    console.log('Platform:', deviceInfo.platform);
    console.log('Screen:', `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`);
    console.log('DPR:', deviceInfo.devicePixelRatio);
    console.log('Online:', deviceInfo.online);
    console.log('CPU Cores:', deviceInfo.hardwareConcurrency);
    console.groupEnd();

    console.groupEnd();
  }

  /**
   * Export metrics as JSON
   */
  exportMetrics(): string {
    const data = {
      timestamp: new Date().toISOString(),
      metrics: this.getAllMetrics(),
      device: this.getDeviceInfo()
    };

    return JSON.stringify(data, null, 2);
  }

  /**
   * Check if metrics meet targets
   */
  checkTargets(): {
    passed: boolean;
    results: Array<{ metric: string; value: number; target: number; passed: boolean }>;
  } {
    const targets = {
      loadTime: 3000, // 3 seconds
      ttfb: 600, // 600ms
      fcp: 1500, // 1.5 seconds
      lcp: 2500, // 2.5 seconds
      tti: 3800, // 3.8 seconds
      tbt: 300, // 300ms
      fid: 100, // 100ms
      cls: 0.1 // 0.1
    };

    const results = Object.entries(targets).map(([metric, target]) => {
      const value = this.metrics[metric as keyof PerformanceMetrics] as number || 0;
      const passed = value <= target;
      return { metric, value, target, passed };
    });

    const allPassed = results.every(r => r.passed);

    return { passed: allPassed, results };
  }

  /**
   * Clear all marks and measures
   */
  clear(): void {
    this.marks.clear();
    performance.clearMarks();
    performance.clearMeasures();
  }
}

// Create singleton instance
export const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  performanceMonitor.init();
}

// Expose to window for manual testing
if (typeof window !== 'undefined') {
  (window as any).performanceMonitor = performanceMonitor;
}
