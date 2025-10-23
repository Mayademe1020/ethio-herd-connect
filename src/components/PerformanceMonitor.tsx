import React, { useEffect, useState } from 'react';
import { getLoadMetrics, clearLoadMetrics } from '@/utils/lazyLoading';
import { detectConnectionQuality } from '@/utils/imageOptimization';
import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  memoryUsage: number | null; // Memory usage in MB
  connectionType: string; // Connection type (4g, 3g, etc.)
  batteryLevel: number | null; // Battery level (0-1)
  batteryCharging: boolean | null; // Is battery charging
}

export const PerformanceMonitor: React.FC<{ language: string }> = ({ language }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    memoryUsage: null,
    connectionType: detectConnectionQuality(),
    batteryLevel: null,
    batteryCharging: null
  });
  const [showDebug, setShowDebug] = useState(false);
  const { showWarning } = useToastNotifications();
  const t = useTranslations(language);

  // Monitor web vitals
  useEffect(() => {
    // Only run performance monitoring in production
    if (process.env.NODE_ENV !== 'production') return;

    try {
      // First Contentful Paint
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });

      // First Input Delay
      const fidObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-input') {
            setMetrics(prev => ({ ...prev, fid: (entry as any).processingStart - entry.startTime }));
          }
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });

      // Layout Shifts
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            setMetrics(prev => ({ ...prev, cls: clsValue }));
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });

      // Memory usage
      const checkMemory = () => {
        if ((performance as any).memory) {
          const memoryInfo = (performance as any).memory;
          const memoryUsageMB = Math.round(memoryInfo.usedJSHeapSize / (1024 * 1024));
          setMetrics(prev => ({ ...prev, memoryUsage: memoryUsageMB }));
          
          // Warn if memory usage is high
          if (memoryUsageMB > 100) {
            showWarning(
              t('performance.highMemoryTitle'),
              t('performance.highMemoryMessage')
            );
          }
        }
      };

      // Battery status
      const updateBatteryStatus = (battery: any) => {
        setMetrics(prev => ({
          ...prev,
          batteryLevel: battery.level,
          batteryCharging: battery.charging
        }));
        
        // Warn if battery is low and not charging
        if (battery.level < 0.15 && !battery.charging) {
          showWarning(
            t('performance.lowBatteryTitle'),
            t('performance.lowBatteryMessage')
          );
        }
      };

      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then(updateBatteryStatus);
      }

      // Check metrics periodically
      const intervalId = setInterval(() => {
        checkMemory();
        
        // Update connection type
        setMetrics(prev => ({
          ...prev,
          connectionType: detectConnectionQuality()
        }));
      }, 30000); // Every 30 seconds

      return () => {
        clearInterval(intervalId);
        paintObserver.disconnect();
        lcpObserver.disconnect();
        fidObserver.disconnect();
        clsObserver.disconnect();
      };
    } catch (error) {
      console.error('Error setting up performance monitoring:', error);
    }
  }, [showWarning, t]);

  // Enable debug mode with 5 taps
  const handleTap = () => {
    setShowDebug(prev => !prev);
    clearLoadMetrics(); // Reset component load metrics when toggling
  };

  if (!showDebug) return <div className="hidden" onClick={handleTap}></div>;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs z-50 max-h-32 overflow-auto">
      <div className="flex justify-between items-center">
        <h4 className="font-bold">Performance Monitor</h4>
        <button onClick={handleTap} className="text-xs bg-gray-700 px-2 py-1 rounded">
          Hide
        </button>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-1">
        <div>FCP: {metrics.fcp ? `${Math.round(metrics.fcp)}ms` : 'N/A'}</div>
        <div>LCP: {metrics.lcp ? `${Math.round(metrics.lcp)}ms` : 'N/A'}</div>
        <div>FID: {metrics.fid ? `${Math.round(metrics.fid)}ms` : 'N/A'}</div>
        <div>CLS: {metrics.cls ? metrics.cls.toFixed(3) : 'N/A'}</div>
        <div>Memory: {metrics.memoryUsage ? `${metrics.memoryUsage}MB` : 'N/A'}</div>
        <div>Network: {metrics.connectionType}</div>
        <div>Battery: {metrics.batteryLevel !== null ? `${Math.round(metrics.batteryLevel * 100)}%` : 'N/A'}</div>
        <div>Charging: {metrics.batteryCharging !== null ? (metrics.batteryCharging ? 'Yes' : 'No') : 'N/A'}</div>
      </div>
      <div className="mt-1 border-t border-gray-700 pt-1">
        <div className="font-bold">Component Load Times:</div>
        <div className="grid grid-cols-2 gap-x-4">
          {getLoadMetrics().map((metric, index) => (
            <div key={index}>
              {metric.componentName}: {metric.loadTime ? `${Math.round(metric.loadTime)}ms` : 'Loading...'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};