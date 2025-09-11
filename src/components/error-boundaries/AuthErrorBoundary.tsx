'use client';

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Shield } from 'lucide-react';
import { logError } from '@/lib/sentry';

/**
 * Specialized Error Boundary for Authentication Components
 * Provides auth-specific error handling and recovery
 */

function AuthErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  React.useEffect(() => {
    logError(error, {
      errorBoundary: true,
      component: 'AuthErrorBoundary',
      componentStack: error.stack,
    });
  }, [error]);

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <Shield className="h-5 w-5" />
          Authentication Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Authentication system error</span>
        </div>

        <p className="text-muted-foreground text-sm">
          There was an issue with the authentication system. This might be due to a network problem
          or service outage.
        </p>

        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} variant="outline" size="sm" className="flex-1">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
          <Button
            onClick={() => (window.location.href = '/login')}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            Go to Login
          </Button>
        </div>

        {process.env.NODE_ENV !== 'production' && (
          <details className="mt-4">
            <summary className="text-muted-foreground cursor-pointer text-xs">
              Error Details (Development)
            </summary>
            <pre className="mt-2 overflow-x-auto rounded bg-red-50 p-2 text-xs text-red-800">
              {error.toString()}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

interface AuthErrorBoundaryProps {
  children: React.ReactNode;
}

export function AuthErrorBoundary({ children }: AuthErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack?: string | null }) => {
    logError(error, {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: true,
      component: 'AuthErrorBoundary',
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={AuthErrorFallback}
      onError={handleError}
      onReset={() => {
        console.log('Auth error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
