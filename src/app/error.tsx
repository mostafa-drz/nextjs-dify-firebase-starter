'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, RefreshCw, AlertTriangle, Bug } from 'lucide-react';

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
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <Bug className="text-destructive h-16 w-16" />
              <div className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold">
                !
              </div>
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred. Don&apos;t worry, we&apos;ve been notified and are working
            to fix it.
          </p>
        </div>

        {/* Error Details */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="border-destructive/20">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <h3 className="text-destructive flex items-center gap-2 font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  Development Error Details
                </h3>
                <div className="bg-muted rounded-md p-3">
                  <p className="text-destructive font-mono text-sm">{error.message}</p>
                  {error.digest && (
                    <p className="text-muted-foreground mt-2 text-xs">Error ID: {error.digest}</p>
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
              <h2 className="text-center text-lg font-semibold">Try these solutions</h2>

              <div className="space-y-3">
                <Button onClick={reset} className="w-full justify-start">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-muted-foreground text-center text-sm">
          <p>
            If the problem persists, please{' '}
            <Link href="/support" className="text-primary hover:underline">
              contact support
            </Link>{' '}
            and include the error details above.
          </p>
        </div>
      </div>
    </div>
  );
}
