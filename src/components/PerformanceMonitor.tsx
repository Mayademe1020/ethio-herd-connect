// src/components/PerformanceMonitor.tsx
// Production-ready performance monitoring and analytics

import React, { useEffect, useState } from 'react';
import { Activity, Cpu, HardDrive, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PerformanceMetrics {
  // Core Web Vitals
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift

  // Additional metrics
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  domContentLoaded: number;
  loadComplete: number;

  // Memory usage
  memoryUsage?: number;
  memoryLimit?: number;

  // Network status
  isOnline: boolean;
  connectionType?: string;
  effectiveType?: string;
}

interface PerformanceMonitorProps {
  language?: string;
  showDetails?: boolean;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  language = 'en',
  showDetails = false
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV === 'production' && !localStorage.getItem('debug')) {
      return;
    }

    const updateMetrics = () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      const lcpEntry = performance.getEntriesByType('largest-contentful-paint')[0] as any;

      // Get memory info if available
      const memory = (performance as any).memory;

      // Get network info
      const connection = (navigator as any).connection;

      const newMetrics: PerformanceMetrics = {
        lcp: lcpEntry?.startTime || 0,
        fid: 0, // Would need additional setup for FID
        cls: 0, // Would need additional setup for CLS
        fcp: paintEntries.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
        ttfb: perfData.responseStart - perfData.requestStart,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
        loadComplete: perfData.loadEventEnd - perfData.loadEventStart,
        memoryUsage: memory?.usedJSHeapSize,
        memoryLimit: memory?.jsHeapSizeLimit,
        isOnline: navigator.onLine,
        connectionType: connection?.type,
        effectiveType: connection?.effectiveType
      };

      setMetrics(newMetrics);

      // Send to analytics in production
      if (process.env.NODE_ENV === 'production') {
        sendToAnalytics(newMetrics);
      }
    };

    // Initial measurement
    if (document.readyState === 'complete') {
      updateMetrics();
    } else {
      window.addEventListener('load', updateMetrics);
    }

    // Periodic updates
    const interval = setInterval(updateMetrics, 30000); // Every 30 seconds

    // Web Vitals observers
    const observeWebVitals = () => {
      // LCP Observer
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1] as any;
          setMetrics(prev => prev ? { ...prev, lcp: lastEntry.startTime } : null);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // CLS Observer
        const clsObserver = new PerformanceObserver((list) => {
          let clsValue = 0;
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
          setMetrics(prev => prev ? { ...prev, cls: clsValue } : null);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // FID Observer
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            setMetrics(prev => prev ? { ...prev, fid: entry.processingStart - entry.startTime } : null);
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      }
    };

    observeWebVitals();

    return () => {
      clearInterval(interval);
      window.removeEventListener('load', updateMetrics);
    };
  }, []);

  const sendToAnalytics = (metrics: PerformanceMetrics) => {
    // TODO: Integrate with analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Performance metrics:', metrics);
  };

  const getPerformanceScore = (metric: number, thresholds: { good: number; poor: number }) => {
    if (metric <= thresholds.good) return 'good';
    if (metric <= thresholds.poor) return 'needs-improvement';
    return 'poor';
  };

  const getScoreColor = (score: string) => {
    switch (score) {
      case 'good': return 'text-green-600';
      case 'needs-improvement': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  if (!metrics) return null;

  const lcpScore = getPerformanceScore(metrics.lcp, { good: 2500, poor: 4000 });
  const fcpScore = getPerformanceScore(metrics.fcp, { good: 1800, poor: 3000 });
  const ttfbScore = getPerformanceScore(metrics.ttfb, { good: 800, poor: 1800 });

  return (
    <>
      {/* Floating Performance Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(!isVisible)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 p-0 shadow-lg"
          title="Performance Monitor"
        >
          <Activity size={20} />
        </Button>
      </div>

      {/* Performance Panel */}
      {isVisible && (
        <div className="fixed bottom-16 right-4 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-w-sm w-full">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Activity size={16} />
                Performance Monitor
              </h3>
              <Button
                onClick={() => setIsExpanded(!isExpanded)}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? 'Less' : 'More'}
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {/* Core Web Vitals */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Core Web Vitals</h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">LCP:</span>
                  <span className={`ml-1 font-medium ${getScoreColor(lcpScore)}`}>
                    {formatTime(metrics.lcp)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">FCP:</span>
                  <span className={`ml-1 font-medium ${getScoreColor(fcpScore)}`}>
                    {formatTime(metrics.fcp)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">TTFB:</span>
                  <span className={`ml-1 font-medium ${getScoreColor(ttfbScore)}`}>
                    {formatTime(metrics.ttfb)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">CLS:</span>
                  <span className="ml-1 font-medium text-gray-800">
                    {metrics.cls.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>

            {/* Network Status */}
            <div className="flex items-center gap-2 text-sm">
              {metrics.isOnline ? (
                <Wifi className="text-green-600" size={16} />
              ) : (
                <WifiOff className="text-red-600" size={16} />
              )}
              <span className="text-gray-600">
                {metrics.effectiveType || (metrics.isOnline ? 'Online' : 'Offline')}
              </span>
            </div>

            {/* Memory Usage */}
            {metrics.memoryUsage && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-600">
                  <span>Memory:</span>
                  <span>{formatBytes(metrics.memoryUsage)}</span>
                </div>
                {metrics.memoryLimit && (
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full"
                      style={{
                        width: `${Math.min((metrics.memoryUsage / metrics.memoryLimit) * 100, 100)}%`
                      }}
                    ></div>
                  </div>
                )}
              </div>
            )}

            {/* Expanded Details */}
            {isExpanded && showDetails && (
              <div className="border-t border-gray-200 pt-3 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Detailed Metrics</h4>

                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>DOM Content Loaded:</span>
                    <span>{formatTime(metrics.domContentLoaded)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Load Complete:</span>
                    <span>{formatTime(metrics.loadComplete)}</span>
                  </div>
                  {metrics.connectionType && (
                    <div className="flex justify-between">
                      <span>Connection:</span>
                      <span>{metrics.connectionType}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <div className="flex gap-2">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                Refresh
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};