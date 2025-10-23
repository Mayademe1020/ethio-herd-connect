/**
 * Centralized logging utility
 * Prevents console.log pollution and sensitive data leakage
 */

interface LoggerConfig {
  enableDebug: boolean;
  enableInfo: boolean;
  enableWarn: boolean;
  enableError: boolean;
}

class Logger {
  private config: LoggerConfig;

  constructor(config: LoggerConfig) {
    this.config = config;
  }

  debug(message: string, data?: any): void {
    if (this.config.enableDebug) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any): void {
    if (this.config.enableInfo) {
      console.info(`[INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any): void {
    if (this.config.enableWarn) {
      console.warn(`[WARN] ${message}`, data || '');
    }
  }

  error(message: string, error?: any): void {
    if (this.config.enableError) {
      console.error(`[ERROR] ${message}`, error || '');
      // Future: Send to error tracking service (Sentry)
    }
  }

  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// Create singleton instance
export const logger = new Logger({
  enableDebug: process.env.NODE_ENV === 'development',
  enableInfo: true,
  enableWarn: true,
  enableError: true,
});

// Export for testing
export { Logger };
