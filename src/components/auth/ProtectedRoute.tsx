'use client';

import { useUser } from './UserProvider';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { LoginForm } from './LoginForm';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { user, loading } = useUser();

  // Show loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            <p className="text-muted-foreground mt-4 text-sm">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        {fallback || <LoginForm />}
      </div>
    );
  }

  // User is authenticated, show protected content
  return <>{children}</>;
}
