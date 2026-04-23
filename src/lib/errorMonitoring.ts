// Simple Error Monitoring System - Critical for Production Stability
// This provides basic error tracking without external dependencies

// Environment configuration
const ERROR_MONITORING_ENABLED = import.meta.env.PROD && import.meta.env.VITE_ERROR_MONITORING_ENABLED === 'true';
const LOG_LEVEL = import.meta.env.VITE_ERROR_LOG_LEVEL || 'error';

// Custom error types for better categorization
export class PerformanceError extends Error {
  constructor(message: string, public context: Record<string, any>) {
    super(message);
    this.name = 'PerformanceError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number, public context?: any) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public table?: string, public operation?: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Error storage for batch reporting
interface ErrorReport {
  timestamp: number;
  message: string;
  stack?: string;
  context?: Record<string, any>;
  userAgent: string;
  url: string;
  userId?: string;
  level: 'error' | 'warning' | 'info';
}

const errorQueue: ErrorReport[] = [];

// Enhanced error reporting with context
export const reportError = (error: Error, context?: Record<string, any>) => {
  const errorReport: ErrorReport = {
    timestamp: Date.now(),
    message: error.message,
    stack: error.stack,
    context,
    userAgent: navigator.userAgent,
    url: window.location.href,
    userId: getCurrentUserId(),
    level: error.name === 'PerformanceError' ? 'warning' : 'error'
  };

  // Add to queue for batch reporting
  errorQueue.push(errorReport);
  
  // Always log to console in development
  if (import.meta.env.DEV) {
    console.error('Error captured:', error, context);
  }
  
  // Store in localStorage for offline persistence
  if (ERROR_MONITORING_ENABLED) {
    storeErrorLocally(errorReport);
  }
  
  // Send to monitoring service if enabled
  if (ERROR_MONITORING_ENABLED && shouldSendError(errorReport)) {
    sendErrorReport(errorReport);
  }
  
  // Keep only last 50 errors to prevent storage bloat
  if (errorQueue.length > 50) {
    errorQueue.shift();
  }
};

// Get current user ID from localStorage
const getCurrentUserId = (): string | undefined => {
  try {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.id;
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined;
};

// Store error locally for offline reporting
const storeErrorLocally = (errorReport: ErrorReport) => {
  try {
    const storedErrors = JSON.parse(localStorage.getItem('error_reports') || '[]');
    storedErrors.push(errorReport);
    
    // Keep only last 100 errors
    if (storedErrors.length > 100) {
      storedErrors.splice(0, storedErrors.length - 100);
    }
    
    localStorage.setItem('error_reports', JSON.stringify(storedErrors));
  } catch (error) {
    console.warn('Failed to store error locally:', error);
  }
};

// Determine if error should be sent (rate limiting)
const shouldSendError = (errorReport: ErrorReport): boolean => {
  const recentErrors = errorQueue.filter(
    e => Date.now() - e.timestamp < 60000 // Last minute
  );
  
  // Don't send more than 10 errors per minute
  return recentErrors.length < 10;
};

// Send error to monitoring service
const sendErrorReport = async (errorReport: ErrorReport) => {
  try {
    // For now, we'll use a simple fetch to a logging endpoint
    // In production, this would be your actual monitoring service
    const response = await fetch('/api/errors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(errorReport),
    });
    
    if (!response.ok) {
      console.warn('Failed to send error report:', response.status);
    }
  } catch (error) {
    console.warn('Failed to send error report:', error);
  }
};

// Performance monitoring
export const trackPerformance = (name: string, duration: number, context?: Record<string, any>) => {
  if (duration > 1000) { // Only track slow operations
    reportError(new PerformanceError(`Slow operation: ${name}`, {
      operation: name,
      duration,
      ...context
    }));
  }
  
  // Always log in development
  if (import.meta.env.DEV && duration > 100) {
    console.log(`Performance: ${name} took ${duration}ms`, context);
  }
};

// Network request monitoring
export const trackNetworkRequest = (url: string, method: string, duration: number, statusCode?: number) => {
  const context = {
    url,
    method,
    duration,
    statusCode
  };
  
  if (statusCode && statusCode >= 400) {
    reportError(new NetworkError(`HTTP ${statusCode}: ${method} ${url}`, statusCode, context));
  } else if (duration > 5000) { // 5 seconds
    reportError(new PerformanceError(`Slow network request: ${method} ${url}`, context));
  }
  
  // Log in development
  if (import.meta.env.DEV && (statusCode && statusCode >= 400 || duration > 2000)) {
    console.warn('Network issue:', context);
  }
};

// User action tracking for debugging
export const trackUserAction = (action: string, details?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.log(`User Action: ${action}`, details);
  }
  
  if (ERROR_MONITORING_ENABLED) {
    const errorReport: ErrorReport = {
      timestamp: Date.now(),
      message: `User Action: ${action}`,
      context: details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: getCurrentUserId(),
      level: 'info'
    };
    
    errorQueue.push(errorReport);
  }
};

// Page load performance monitoring
export const monitorPageLoad = (pageName: string) => {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (navigation) {
    const metrics = {
      dns: navigation.domainLookupEnd - navigation.domainLookupStart,
      connect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      dom: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      load: navigation.loadEventEnd - navigation.loadEventStart,
      // Use fetchStart instead of navigationStart for compatibility
      total: navigation.loadEventEnd - navigation.fetchStart
    };
    
    // Report slow page loads
    if (metrics.total > 3000) {
      reportError(new PerformanceError(`Slow page load: ${pageName}`, {
        page: pageName,
        metrics
      }));
    }
    
    trackPerformance(`Page Load: ${pageName}`, metrics.total, metrics);
  }
};

// Memory usage monitoring
export const monitorMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
    
    if (usedMB > 50) { // Warn if using more than 50MB
      reportError(new PerformanceError('High memory usage', {
        usedMB,
        totalMB: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      }));
    }
  }
};

// Batch send stored errors
export const flushErrorQueue = async () => {
  if (!ERROR_MONITORING_ENABLED || errorQueue.length === 0) {
    return;
  }
  
  const errorsToSend = [...errorQueue];
  errorQueue.length = 0; // Clear queue
  
  try {
    const response = await fetch('/api/errors/batch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ errors: errorsToSend }),
    });
    
    if (!response.ok) {
      console.warn('Failed to send batch error reports:', response.status);
      // Re-queue errors if sending failed
      errorQueue.unshift(...errorsToSend);
    }
  } catch (error) {
    console.warn('Failed to send batch error reports:', error);
    // Re-queue errors if sending failed
    errorQueue.unshift(...errorsToSend);
  }
};

// Initialize performance monitoring
if (typeof window !== 'undefined') {
  // Monitor page loads
  window.addEventListener('load', () => {
    setTimeout(() => {
      monitorPageLoad(window.location.pathname);
    }, 0);
  });
  
  // Monitor memory usage periodically
  setInterval(monitorMemoryUsage, 30000); // Every 30 seconds
  
  // Flush error queue periodically
  setInterval(flushErrorQueue, 60000); // Every minute
  
  // Monitor unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    reportError(new Error(`Unhandled promise rejection: ${event.reason}`), {
      type: 'unhandled_promise_rejection'
    });
  });
  
  // Monitor global errors
  window.addEventListener('error', (event) => {
    reportError(new Error(`Global error: ${event.message}`), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
  
  // Flush error queue before page unload
  window.addEventListener('beforeunload', () => {
    flushErrorQueue();
  });
}

export default {
  reportError,
  trackPerformance,
  trackNetworkRequest,
  trackUserAction,
  flushErrorQueue,
  PerformanceError,
  NetworkError,
  DatabaseError
};
