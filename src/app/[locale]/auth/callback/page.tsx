'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { handleSignInWithEmailLink } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const result = await handleSignInWithEmailLink();

        if (result.success) {
          setStatus('success');
          setMessage(result.message);

          // Redirect to chat after 2 seconds
          setTimeout(() => {
            router.push('/chat');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('An unexpected error occurred during sign-in.');
        console.error('Auth callback error:', error);
      }
    };

    handleAuth();
  }, [handleSignInWithEmailLink, router]);

  const handleRetry = () => {
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardContent className="py-8">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
                <h2 className="text-xl font-semibold">Signing you in...</h2>
                <p className="text-muted-foreground">
                  Please wait while we verify your magic link.
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
                <h2 className="text-xl font-semibold text-green-800">Welcome back!</h2>
                <p className="text-muted-foreground">{message}</p>
                <p className="text-muted-foreground text-sm">Redirecting you to your chat...</p>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <XCircle className="mx-auto h-12 w-12 text-red-600" />
                <h2 className="text-xl font-semibold text-red-800">Sign-in Failed</h2>

                <Alert variant="destructive">
                  <AlertDescription>{message}</AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full">
                    Try Again
                  </Button>
                  <p className="text-muted-foreground text-sm">
                    Need help? Contact{' '}
                    <a
                      href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                      className="text-blue-600 hover:underline"
                    >
                      support
                    </a>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
