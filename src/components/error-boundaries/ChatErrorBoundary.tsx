'use client';

import React from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, MessageSquare } from 'lucide-react';
import { logError } from '@/lib/sentry';

/**
 * Specialized Error Boundary for Chat Components
 * Provides chat-specific error handling and recovery
 */

function ChatErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  React.useEffect(() => {
    logError(error, {
      errorBoundary: true,
      component: 'ChatErrorBoundary',
      componentStack: error.stack,
    });
  }, [error]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-600">
          <MessageSquare className="h-5 w-5" />
          Chat Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-red-600">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm">Something went wrong with the chat</span>
        </div>

        <p className="text-muted-foreground text-sm">
          The chat component encountered an error. This might be due to a network issue or a problem
          with the AI service.
        </p>

        <div className="flex gap-2">
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Chat
          </Button>
          <Button onClick={() => window.location.reload()} variant="destructive" size="sm">
            Reload Page
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

interface ChatErrorBoundaryProps {
  children: React.ReactNode;
}

export function ChatErrorBoundary({ children }: ChatErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack?: string | null }) => {
    logError(error, {
      componentStack: errorInfo.componentStack || '',
      errorBoundary: true,
      component: 'ChatErrorBoundary',
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={ChatErrorFallback}
      onError={handleError}
      onReset={() => {
        console.log('Chat error boundary reset');
      }}
    >
      {children}
    </ErrorBoundary>
  );
}
