import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Home, 
  ArrowLeft, 
  Search,
  AlertTriangle
} from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Error Icon */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-muted-foreground" />
              <div className="absolute -top-1 -right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-center">What would you like to do?</h2>
              
              <div className="space-y-3">
                <Button asChild className="w-full justify-start">
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Go to Homepage
                  </Link>
                </Button>
                
                <Button variant="outline" asChild className="w-full justify-start">
                  <Link href="/chat">
                    <Search className="h-4 w-4 mr-2" />
                    Start Chatting
                  </Link>
                </Button>
                
                <Button 
                  variant="ghost" 
                  onClick={() => window.history.back()}
                  className="w-full justify-start"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Go Back
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="text-center text-sm text-muted-foreground">
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
