/**
 * Centralized error handling utilities for Ethio Herd Connect
 * Provides consistent error handling, logging, and user feedback
 * Optimized for offline-first and low-connectivity environments
 */

import { toast } from 'sonner';
import { useTranslations } from '@/hooks/useTranslations';
import { logger } from './logger';

/**
 * Safely extract a message string from an unknown error value
 */
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
};

/**
 * Extract common Error properties from an unknown value
 */
const getErrorInfo = (error: unknown): { name?: string; message?: string; code?: string; stack?: string } => {
  if (error instanceof Error) {
    const code = (error as Error & { code?: unknown }).code;
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      code: typeof code === 'string' ? code : undefined,
    };
  }
  if (error && typeof error === 'object') {
    const obj = error as Record<string, unknown>;
    return {
      name: typeof obj.name === 'string' ? obj.name : undefined,
      message: typeof obj.message === 'string' ? obj.message : undefined,
      code: typeof obj.code === 'string' ? obj.code : undefined,
      stack: typeof obj.stack === 'string' ? obj.stack : undefined,
    };
  }
  return {};
};

// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Error categories for better organization and handling
export enum ErrorCategory {
  NETWORK = 'network',
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  PERMISSION = 'permission',
  SYNC = 'sync',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

// Error interface
export interface AppError {
  message: string;
  details?: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: number;
  data?: unknown;
}

// Store recent errors for debugging and reporting
const errorLog: AppError[] = [];
const MAX_ERROR_LOG_SIZE = 50;

/**
 * Log error to local storage for later reporting when online
 */
export const logError = (error: AppError): void => {
  // Add to in-memory log
  errorLog.unshift(error);
  
  // Trim log if too large
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop();
  }
  
  // Store in local storage for persistence
  try {
    const storedErrors = localStorage.getItem('error-log');
    let errors = storedErrors ? JSON.parse(storedErrors) : [];
    errors.unshift(error);
    
    // Keep log size manageable
    if (errors.length > MAX_ERROR_LOG_SIZE) {
      errors = errors.slice(0, MAX_ERROR_LOG_SIZE);
    }
    
    localStorage.setItem('error-log', JSON.stringify(errors));
  } catch (e) {
    logger.error('Failed to store error in local storage', e);
  }
  
  // Log using logger utility
  logger.error(`[${error.category}][${error.severity}] ${error.message}`, error);
}

/**
 * Create a formatted error object
 */
export const createError = (
  message: string,
  category: ErrorCategory = ErrorCategory.UNKNOWN,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  details?: string,
  code?: string,
  data?: unknown
): AppError => {
  return {
    message,
    details,
    code,
    severity,
    category,
    timestamp: Date.now(),
    data
  };
};

/**
 * Handle network errors with appropriate user feedback
 */
export const handleNetworkError = (error: unknown, t: (key: string) => string): AppError => {
  const appError = createError(
    t('Network connection issue'),
    ErrorCategory.NETWORK,
    ErrorSeverity.WARNING,
    getErrorMessage(error)
  );

  logError(appError);
  return appError;
};

/**
 * Handle database errors with appropriate user feedback
 */
export const handleDatabaseError = (error: unknown, t: (key: string) => string): AppError => {
  const appError = createError(
    t('Database operation failed'),
    ErrorCategory.DATABASE,
    ErrorSeverity.ERROR,
    getErrorMessage(error)
  );

  logError(appError);
  return appError;
};

/**
 * Get all logged errors
 */
export const getErrorLog = (): AppError[] => {
  return [...errorLog];
};

/**
 * Clear error log
 */
export const clearErrorLog = (): void => {
  errorLog.length = 0;
  try {
    localStorage.removeItem('error-log');
  } catch (e) {
    logger.error('Failed to clear error log from local storage', e);
  }
};

/**
 * Hook for using the error handling system
 */
export const useErrorHandler = () => {
  const { t } = useTranslations();
  
  const handleError = (error: unknown, category?: ErrorCategory): AppError => {
    const errorInfo = getErrorInfo(error);
    // Determine error category if not provided
    if (!category) {
      if (errorInfo.name === 'NetworkError' || (typeof errorInfo.message === 'string' && errorInfo.message.includes('network'))) {
        category = ErrorCategory.NETWORK;
      } else if (typeof errorInfo.code === 'string' && errorInfo.code.startsWith('auth/')) {
        category = ErrorCategory.AUTHENTICATION;
      } else {
        category = ErrorCategory.UNKNOWN;
      }
    }

    // Create structured error
    const appError = createError(
      errorInfo.message || t('An error occurred'),
      category,
      category === ErrorCategory.NETWORK ? ErrorSeverity.WARNING : ErrorSeverity.ERROR,
      errorInfo.stack,
      errorInfo.code
    );
    
    // Log error
    logError(appError);
    
    // Show appropriate notification
    switch (appError.severity) {
      case ErrorSeverity.WARNING:
        toast.warning(appError.message);
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        toast.error(appError.message);
        break;
      default:
        toast.info(appError.message);
    }
    
    return appError;
  };
  
  return {
    handleError,
    handleNetworkError: (error: unknown) => handleNetworkError(error, t),
    handleDatabaseError: (error: unknown) => handleDatabaseError(error, t),
    logError,
    getErrorLog,
    clearErrorLog
  };
};