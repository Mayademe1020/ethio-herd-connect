/**
 * Centralized error handling utilities for Ethio Herd Connect
 * Provides consistent error handling, logging, and user feedback
 * Optimized for offline-first and low-connectivity environments
 */

import { useToastNotifications } from '@/hooks/useToastNotifications';
import { useTranslations } from '@/hooks/useTranslations';
import { logger } from './logger';

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
  data?: any;
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
  data?: any
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
export const handleNetworkError = (error: any, t: (key: string) => string): AppError => {
  const appError = createError(
    t('Network connection issue'),
    ErrorCategory.NETWORK,
    ErrorSeverity.WARNING,
    error.message
  );
  
  logError(appError);
  return appError;
};

/**
 * Handle database errors with appropriate user feedback
 */
export const handleDatabaseError = (error: any, t: (key: string) => string): AppError => {
  const appError = createError(
    t('Database operation failed'),
    ErrorCategory.DATABASE,
    ErrorSeverity.ERROR,
    error.message
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
  const { showError, showWarning, showInfo } = useToastNotifications();
  const { t } = useTranslations();
  
  const handleError = (error: any, category?: ErrorCategory): AppError => {
    // Determine error category if not provided
    if (!category) {
      if (error.name === 'NetworkError' || error.message?.includes('network')) {
        category = ErrorCategory.NETWORK;
      } else if (error.code?.startsWith('auth/')) {
        category = ErrorCategory.AUTHENTICATION;
      } else {
        category = ErrorCategory.UNKNOWN;
      }
    }
    
    // Create structured error
    const appError = createError(
      error.message || t('An error occurred'),
      category,
      category === ErrorCategory.NETWORK ? ErrorSeverity.WARNING : ErrorSeverity.ERROR,
      error.stack,
      error.code
    );
    
    // Log error
    logError(appError);
    
    // Show appropriate notification
    switch (appError.severity) {
      case ErrorSeverity.WARNING:
        showWarning(appError.message, appError.details || '');
        break;
      case ErrorSeverity.ERROR:
      case ErrorSeverity.CRITICAL:
        showError(appError.message, appError.details || '');
        break;
      default:
        showInfo(appError.message, appError.details || '');
    }
    
    return appError;
  };
  
  return {
    handleError,
    handleNetworkError: (error: any) => handleNetworkError(error, t),
    handleDatabaseError: (error: any) => handleDatabaseError(error, t),
    logError,
    getErrorLog,
    clearErrorLog
  };
};