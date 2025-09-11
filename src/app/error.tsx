'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  RefreshCw, 
  AlertTriangle,
  Bug
} from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Bug className="h-16 w-16 text-destructive" />
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold">
                !
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Don't worry, we've been notified and are working to fix it.
          </p>
        </div>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Development Error Details
                </h3>
                <div className="bg-muted p-3 rounded-md">
                  <p className="text-sm font-mono text-destructive">
                    {error.message}
                  </p>
                  {error.digest && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Error ID: {error.digest}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center">Try these solutions</h2>
              
              <div className="space-y-3">
                <Button onClick={reset} className="w-full justify-start">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            If the problem persists, please{' '}
            <Link href="/support" className="text-primary hover:underline">
              contact support
            </Link>
            {' '}and include the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}