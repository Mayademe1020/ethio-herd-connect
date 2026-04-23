// src/lib/errorHandler.ts
// Standardized error handling system for Ethio Herd Connect

import { toast } from 'sonner';
import { getUserFriendlyError, getSuccessMessage, ErrorType, SuccessMessageType } from './errorMessages';

// Error severity levels
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// Standardized error structure
export interface AppError {
  type: ErrorType;
  message: string;
  amharicMessage: string;
  icon: string;
  severity: ErrorSeverity;
  technicalDetails?: string;
  timestamp: Date;
  shouldRetry: boolean;
  shouldReport: boolean;
}

// Error handler configuration
export interface ErrorHandlerConfig {
  language: 'amharic' | 'english';
  showToast: boolean;
  logToConsole: boolean;
  reportErrors: boolean;
  retryableErrors: ErrorType[];
}

// Default configuration
const defaultConfig: ErrorHandlerConfig = {
  language: 'amharic',
  showToast: true,
  logToConsole: true,
  reportErrors: true,
  retryableErrors: ['network', 'sync_failed', 'database_error'],
};

/**
 * Creates a standardized error object
 */
export function createError(
  error: any,
  severity: ErrorSeverity = 'error',
  config: Partial<ErrorHandlerConfig> = {}
): AppError {
  const mergedConfig = { ...defaultConfig, ...config };
  const userFriendly = getUserFriendlyError(error, mergedConfig.language);
  const englishVersion = getUserFriendlyError(error, 'english');
  
  return {
    type: userFriendly.type,
    message: englishVersion.message,
    amharicMessage: userFriendly.message,
    icon: userFriendly.icon,
    severity,
    technicalDetails: error?.message || error?.toString(),
    timestamp: new Date(),
    shouldRetry: mergedConfig.retryableErrors.includes(userFriendly.type),
    shouldReport: severity === 'error' || severity === 'critical',
  };
}

/**
 * Displays error to user with toast notification
 */
export function displayError(error: AppError, config: Partial<ErrorHandlerConfig> = {}): void {
  const mergedConfig = { ...defaultConfig, ...config };
  
  if (!mergedConfig.showToast) return;
  
  const message = mergedConfig.language === 'amharic' 
    ? error.amharicMessage 
    : error.message;
  
  switch (error.severity) {
    case 'info':
      toast.info(`${error.icon} ${message}`);
      break;
    case 'warning':
      toast.warning(`${error.icon} ${message}`);
      break;
    case 'error':
    case 'critical':
      toast.error(`${error.icon} ${message}`);
      break;
  }
}

/**
 * Logs error to console with standardized format
 */
export function logError(error: AppError, source: string, config: Partial<ErrorHandlerConfig> = {}): void {
  const mergedConfig = { ...defaultConfig, ...config };
  
  if (!mergedConfig.logToConsole) return;
  
  const logData = {
    source,
    type: error.type,
    severity: error.severity,
    message: error.message,
    amharicMessage: error.amharicMessage,
    technicalDetails: error.technicalDetails,
    timestamp: error.timestamp,
    shouldRetry: error.shouldRetry,
  };
  
  if (error.severity === 'critical') {
    console.error('[CRITICAL ERROR]', logData);
  } else if (error.severity === 'error') {
    console.error('[ERROR]', logData);
  } else if (error.severity === 'warning') {
    console.warn('[WARNING]', logData);
  } else {
    console.info('[INFO]', logData);
  }
}

/**
 * Comprehensive error handler - use this everywhere!
 * 
 * @param error - The error object
 * @param source - Where the error occurred (e.g., 'RegisterAnimal', 'useMilkRecording')
 * @param severity - Error severity level
 * @param config - Optional configuration
 * @returns Standardized AppError object
 * 
 * @example
 * try {
 *   await saveData();
 * } catch (error) {
 *   handleError(error, 'RegisterAnimal', 'error');
 * }
 */
export function handleError(
  error: any,
  source: string,
  severity: ErrorSeverity = 'error',
  config: Partial<ErrorHandlerConfig> = {}
): AppError {
  const appError = createError(error, severity, config);
  
  // Display to user
  displayError(appError, config);
  
  // Log to console
  logError(appError, source, config);
  
  // Report to analytics/monitoring if needed
  if (appError.shouldReport && config.reportErrors !== false) {
    reportError(appError, source);
  }
  
  return appError;
}

/**
 * Handles async operations with standardized error handling
 * 
 * @param operation - Async function to execute
 * @param source - Source identifier for error tracking
 * @param errorMessage - Optional custom error message
 * @returns Result of operation or null if failed
 * 
 * @example
 * const result = await handleAsync(
 *   () => supabase.from('animals').select(),
 *   'MyAnimals',
 *   'Failed to load animals'
 * );
 */
export async function handleAsync<T>(
  operation: () => Promise<T>,
  source: string,
  errorMessage?: string
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    handleError(error, source, 'error');
    return null;
  }
}

/**
 * Displays success message with standardized format
 */
export function displaySuccess(
  type: SuccessMessageType,
  language: 'amharic' | 'english' = 'amharic'
): void {
  const successMessage = getSuccessMessage(type, language);
  toast.success(`${successMessage.icon} ${successMessage.message}`);
}

/**
 * Reports error to analytics/monitoring service
 * This is a placeholder - implement with your analytics service
 */
function reportError(error: AppError, source: string): void {
   
  // TODO: Integrate with Sentry, LogRocket, or custom analytics
  // Example with Sentry:
  // Sentry.captureException(new Error(error.message), {
  //   extra: { ...error, source },
  //   level: error.severity,
  // });
   
  
  // For now, just log that we would report it
  console.log('[ERROR REPORT] Would report to analytics:', {
    type: error.type,
    severity: error.severity,
    source,
    timestamp: error.timestamp,
  });
}

/**
 * Checks if an error is retryable
 */
export function isRetryableError(error: AppError): boolean {
  return error.shouldRetry;
}

/**
 * Gets retry delay based on error type and attempt count
 */
export function getRetryDelay(errorType: ErrorType, attempt: number): number {
  const baseDelays: Record<ErrorType, number> = {
    network: 2000,
    sync_failed: 3000,
    database_error: 5000,
    auth_expired: 0, // Don't retry auth errors
    auth_phone_invalid: 0,
    photo_too_large: 0,
    photo_upload_failed: 5000,
    video_too_large: 0,
    video_too_long: 0,
    video_upload_failed: 5000,
    validation_required: 0,
    validation_invalid: 0,
    permission_denied: 0,
    not_found: 0,
    milk_load_failed: 3000,
    milk_export_failed: 5000,
    unknown: 5000,
  };
  
  const baseDelay = baseDelays[errorType] || 5000;
  // Exponential backoff: delay * 2^attempt
  return baseDelay * Math.pow(2, Math.min(attempt, 4)); // Max 16x multiplier
}

/**
 * Batch error handler for multiple operations
 */
export async function handleBatch<T>(
  operations: Array<() => Promise<T>>,
  source: string
): Promise<{ results: T[]; errors: AppError[] }> {
  const results: T[] = [];
  const errors: AppError[] = [];
  
  for (let i = 0; i < operations.length; i++) {
    try {
      const result = await operations[i]();
      results.push(result);
    } catch (error) {
      const appError = handleError(error, `${source}[${i}]`, 'error');
      errors.push(appError);
    }
  }
  
  return { results, errors };
}

// Export everything for easy importing
export * from './errorMessages';
