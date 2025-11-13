// src/components/ErrorBoundary.tsx
// Comprehensive error boundary system for production-ready error handling

import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
  level?: 'page' | 'component' | 'global';
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log error details
    console.error('Error Boundary caught an error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component'
    });

    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportError(error, errorInfo);
    }
  }

  reportError = (error: Error, errorInfo: React.ErrorInfo) => {
    // TODO: Integrate with error reporting service (e.g., Sentry, LogRocket)
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      level: this.props.level || 'component'
    };

    // For now, store in localStorage for debugging
    try {
      const existingReports = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingReports.push(errorReport);
      // Keep only last 10 reports
      if (existingReports.length > 10) {
        existingReports.shift();
      }
      localStorage.setItem('errorReports', JSON.stringify(existingReports));
    } catch (e) {
      console.warn('Could not store error report:', e);
    }
  };

  resetError = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  goHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback component
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default error UI based on level
      const isGlobal = this.props.level === 'global';
      const isPage = this.props.level === 'page';

      return (
        <div className={`min-h-screen flex items-center justify-center p-4 ${
          isGlobal ? 'bg-gradient-to-br from-red-50 to-orange-50' : 'bg-gray-50'
        }`}>
          <div className={`text-center max-w-md ${isGlobal ? 'max-w-lg' : ''}`}>
            <div className={`text-6xl mb-4 ${isGlobal ? 'text-red-500' : 'text-orange-500'}`}>
              <AlertTriangle className="mx-auto" size={72} />
            </div>

            <h2 className={`text-xl font-bold mb-2 ${
              isGlobal ? 'text-red-800' : 'text-gray-800'
            }`}>
              {isGlobal ? 'Application Error' : 'Something went wrong'}
            </h2>

            <p className="text-gray-600 mb-6 leading-relaxed">
              {isGlobal
                ? 'The application encountered a critical error. Please refresh the page or contact support if the problem persists.'
                : isPage
                ? 'This page encountered an error. You can try refreshing or go back to the home page.'
                : 'This component encountered an error. Please try again.'
              }
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left bg-gray-100 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.message}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.resetError}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Try Again
              </Button>

              {!isGlobal && (
                <Button
                  onClick={this.goHome}
                  variant="outline"
                  className="px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Home size={16} />
                  Go Home
                </Button>
              )}
            </div>

            {isGlobal && (
              <p className="text-xs text-gray-500 mt-4">
                Error ID: {Date.now().toString(36)}
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
}

// Hook for manual error reporting
export const useErrorReporting = () => {
  const reportError = (error: Error, context?: string) => {
    console.error(`Manual error report${context ? ` (${context})` : ''}:`, error);

    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      // reportErrorToService(error, context);
    }
  };

  return { reportError };
};