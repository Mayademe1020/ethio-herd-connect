/**
 * Error Tracking Service for EthioHerd Connect
 * Provides error reporting interface compatible with Sentry, LogRocket, or custom backend
 * Works without requiring Sentry/LogRocket packages - uses local storage fallback
 */

import { supabase } from '@/integrations/supabase/client';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
const LOGROCKET_APP_ID = import.meta.env.VITE_LOGROCKET_APP_ID || '';

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  userId?: string;
  userAgent: string;
  url: string;
  level: 'error' | 'warning' | 'info';
}

class ErrorTrackingService {
  private initialized = false;
  private localErrors: ErrorInfo[] = [];
  private maxLocalErrors = 10;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    // Log configuration status
    console.log('Error tracking initialized', { 
      sentryConfigured: !!SENTRY_DSN, 
      logrocketConfigured: !!LOGROCKET_APP_ID 
    });
    
    this.initialized = true;
  }

  /**
   * Capture an error
   */
  async captureError(error: Error, context?: Record<string, any>): Promise<void> {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: 'error',
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      errorInfo.userId = user?.id;
    } catch {
      // Auth not available
    }

    if (context) {
      errorInfo.message = `${error.message} | Context: ${JSON.stringify(context)}`;
    }

    // Send to external service if configured
    if (SENTRY_DSN) {
      this.sendToSentry(error, context);
    }

    if (LOGROCKET_APP_ID) {
      this.sendToLogRocket(error, context);
    }

    this.storeLocalError(errorInfo);
  }

  private async sendToSentry(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      // Simple Sentry capture using fetch
      await fetch(`https://sentry.io/api/${SENTRY_DSN.split('/').pop()}/store/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sentry-Auth': `Sentry sentry_version=7, sentry_key=${SENTRY_DSN.split('@')[0].split('/').pop()}`,
        },
        body: JSON.stringify({
          event_id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          level: 'error',
          message: error.message,
          stacktrace: error.stack ? { frames: this.parseStackTrace(error.stack) } : undefined,
          extra: context,
        }),
      });
    } catch {
      // Sentry send failed, will use local storage
    }
  }

  private parseStackTrace(stack: string): any[] {
    return stack.split('\n').slice(1).map(line => ({
      filename: line.match(/\((.*?)\)/)?.[1] || 'unknown',
      function: line.match(/at (.*?)\(/)?.[1] || 'unknown',
    }));
  }

  private async sendToLogRocket(error: Error, context?: Record<string, any>): Promise<void> {
    try {
      await fetch(`https://lr.logrocket.io${LOGROCKET_APP_ID}/store`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'exception',
          error: { message: error.message, stack: error.stack },
          extra: context,
        }),
      });
    } catch {
      // LogRocket send failed
    }
  }

  /**
   * Capture a message
   */
  async captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info'): Promise<void> {
    const errorInfo: ErrorInfo = {
      message,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level,
    };

    this.storeLocalError(errorInfo);
  }

  async setUser(userId: string, email?: string): Promise<void> {
    console.log('User context set:', { userId, email });
  }

  async addBreadcrumb(message: string, category: string = 'action'): Promise<void> {
    console.log('Breadcrumb:', { category, message });
  }

  private storeLocalError(error: ErrorInfo): void {
    this.localErrors.push(error);
    
    if (this.localErrors.length > this.maxLocalErrors) {
      this.localErrors = this.localErrors.slice(-this.maxLocalErrors);
    }

    try {
      const stored = JSON.parse(localStorage.getItem('errorReports') || '[]');
      stored.push(error);
      localStorage.setItem('errorReports', JSON.stringify(stored.slice(-20)));
    } catch {
      // localStorage not available
    }
  }

  getLocalErrors(): ErrorInfo[] {
    return this.localErrors;
  }

  clearLocalErrors(): void {
    this.localErrors = [];
    localStorage.removeItem('errorReports');
  }

  isEnabled(): boolean {
    return this.initialized;
  }
}

export const errorTrackingService = new ErrorTrackingService();
export default errorTrackingService;
