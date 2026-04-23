// src/hooks/useErrorHandler.ts
// React hook for standardized error handling

import { useCallback } from 'react';
import { 
  handleError, 
  handleAsync, 
  displaySuccess,
  createError,
  AppError,
  ErrorSeverity,
  ErrorType,
  ErrorHandlerConfig,
} from '@/lib/errorHandler';

interface UseErrorHandlerOptions {
  source: string;
  language?: 'amharic' | 'english';
  showToast?: boolean;
}

/**
 * React hook for consistent error handling across components
 * 
 * @example
 * function MyComponent() {
 *   const { handleError: handle, handleAsync: asyncHandler, showSuccess } = useErrorHandler({
 *     source: 'MyComponent',
 *     language: 'amharic'
 *   });
 * 
 *   const saveData = async () => {
 *     const result = await asyncHandler(async () => {
 *       return await api.save(data);
 *     });
 *     
 *     if (result) {
 *       showSuccess('animal_registered');
 *     }
 *   };
 * }
 */
export function useErrorHandler(options: UseErrorHandlerOptions) {
  const { source, language = 'amharic', showToast = true } = options;

  /**
   * Handle an error with standardized processing
   */
  const handleErrorFn = useCallback((
    error: any,
    severity: ErrorSeverity = 'error',
    config?: Partial<ErrorHandlerConfig>
  ): AppError => {
    return handleError(error, source, severity, {
      language,
      showToast,
      ...config,
    });
  }, [source, language, showToast]);

  /**
   * Handle async operation with automatic error handling
   */
  const handleAsyncFn = useCallback(<T>(
    operation: () => Promise<T>,
    customMessage?: string
  ): Promise<T | null> => {
    return handleAsync(operation, source, customMessage);
  }, [source]);

  /**
   * Show success message
   */
  const showSuccess = useCallback((
    type: Parameters<typeof displaySuccess>[0]
  ): void => {
    displaySuccess(type, language);
  }, [language]);

  /**
   * Create error without displaying (for custom handling)
   */
  const createErrorFn = useCallback((
    error: any,
    severity: ErrorSeverity = 'error'
  ): AppError => {
    return createError(error, severity, { language, showToast: false });
  }, [language]);

  return {
    handleError: handleErrorFn,
    handleAsync: handleAsyncFn,
    showSuccess,
    createError: createErrorFn,
    source,
    language,
  };
}

/**
 * Higher-order function to wrap async operations with error handling
 * 
 * @example
 * const safeFetch = withErrorHandling(fetchAnimals, 'MyComponent');
 * const animals = await safeFetch();
 */
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  source: string,
  language: 'amharic' | 'english' = 'amharic'
): (...args: Parameters<T>) => Promise<ReturnType<T> | null> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | null> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, source, 'error', { language });
      return null;
    }
  };
}

/**
 * Hook for form validation errors
 */
export function useFormErrorHandler(source: string) {
  const { handleError, createError } = useErrorHandler({ source });

  const handleValidationError = useCallback((
    field: string,
    message: string
  ): void => {
    const error = new Error(`Validation failed for ${field}: ${message}`);
    handleError(error, 'warning');
  }, [handleError]);

  const handleSubmitError = useCallback((error: any): void => {
    handleError(error, 'error');
  }, [handleError]);

  return {
    handleValidationError,
    handleSubmitError,
    handleError,
    createError,
  };
}

/**
 * Hook for API-specific error handling
 */
export function useApiErrorHandler(source: string) {
  const { handleError, handleAsync, showSuccess } = useErrorHandler({
    source,
    language: 'amharic',
  });

  const handleApiCall = useCallback(<T>(
    operation: () => Promise<T>,
    successMessage?: Parameters<typeof showSuccess>[0]
  ): Promise<T | null> => {
    return handleAsync(async () => {
      const result = await operation();
      if (successMessage) {
        showSuccess(successMessage);
      }
      return result;
    });
  }, [handleAsync, showSuccess]);

  return {
    handleApiCall,
    handleError,
    handleAsync,
    showSuccess,
  };
}
