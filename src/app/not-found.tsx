import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, ArrowLeft, Search, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <AlertTriangle className="text-muted-foreground h-16 w-16" />
              <div className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-bold">
                4
              </div>
            </div>
          </div>
          <h1 className="mb-2 text-4xl font-bold">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-center text-lg font-semibold">What would you like to do?</h2>

              <div className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Go to Homepage
                  </Link>
                </Button>

                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/chat">
                    <Search className="mr-2 h-4 w-4" />
                    Start Chatting
                  </Link>
                </Button>

                <Button
                  variant="ghost"
                  onClick={() => window.history.back()}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-muted-foreground text-center text-sm">
          <p>
            If you believe this is an error, please{' '}
            <Link href="/support" className="text-primary hover:underline">
              contact support
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
