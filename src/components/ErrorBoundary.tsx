'use client';

import React from 'react';
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary';
import { logError } from '@/lib/sentry';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Modern Error Boundary using react-error-boundary
 * Replaces the class-based ErrorBoundary with React 19 patterns
 */

interface ErrorFallbackProps extends FallbackProps {
  showError?: boolean;
}

function ErrorFallback({ error, resetErrorBoundary, showError }: ErrorFallbackProps) {
  // Log error to Sentry
  React.useEffect(() => {
    logError(error, {
      errorBoundary: true,
      componentStack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center rounded-lg border border-red-200 bg-red-50 p-8">
      <AlertTriangle className="mb-4 h-12 w-12 text-red-600" />
      <h2 className="mb-2 text-xl font-semibold text-red-900">Something went wrong</h2>
      <p className="mb-4 text-center text-sm text-red-700">
        We&apos;ve encountered an unexpected error. The issue has been logged and will be
        investigated.
      </p>

      {showError && process.env.NODE_ENV !== 'production' && (
        <details className="mb-4 w-full max-w-xl">
          <summary className="cursor-pointer text-sm text-red-600 hover:text-red-800">
            Error details
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-red-100 p-2 text-xs text-red-800">
            {error.toString()}
            {error.stack}
          </pre>
        </details>
      )}

      <div className="flex gap-2">
        <Button
          onClick={resetErrorBoundary}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-100"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Reload Page
        </Button>
      </div>
    </div>
  );
}

interface ModernErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<FallbackProps>;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void;
}

/**
 * Modern Error Boundary Component
 * Uses react-error-boundary for better error handling and recovery
 */
export function ErrorBoundary({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError,
}: ModernErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack?: string | null }) => {
    // Log to Sentry
    logError(error, {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: true,
    });

    // Call custom error handler if provided
    onError?.(error, errorInfo as { componentStack: string });

    // Log to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
      onReset={() => {
        // Clear any error state or perform cleanup
        console.log('Error boundary reset');
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

/**
 * Hook for error handling in functional components
 * Provides a way to trigger error boundaries programmatically
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    logError(error, errorInfo);
  };
}

/**
 * Higher-order component for wrapping components with error boundaries
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ModernErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
