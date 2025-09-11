'use client';

import { useUser } from '@/components/auth/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCredits } from '@/lib/utils/credits';
import { APP_CONFIG, CREDIT_CONFIG } from '@/lib/config/constants';
import { AlertTriangle, CreditCard, Mail, RefreshCw } from 'lucide-react';

interface InsufficientCreditsProps {
  required?: number;
  operation?: string;
  className?: string;
  variant?: 'card' | 'alert' | 'modal';
}

export function InsufficientCredits({
  required = 1,
  operation = 'this action',
  className = '',
  variant = 'card',
}: InsufficientCreditsProps) {
  const { availableCredits, user } = useUser();

  const handleContactSupport = () => {
    const subject = encodeURIComponent('Credit Top-up Request');
    const body = encodeURIComponent(`Hi,

I need to add more credits to my account.

Current balance: ${availableCredits} credits
Required for operation: ${required} credits
User ID: ${user?.uid}

Please let me know the process for adding credits.

Thank you!`);

    window.open(`mailto:${APP_CONFIG.SUPPORT_EMAIL}?subject=${subject}&body=${body}`);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Alert variant for inline warnings
  if (variant === 'alert') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Insufficient credits!</strong> You need {formatCredits(required)} credits for{' '}
          {operation}, but only have {formatCredits(availableCredits)} available.{' '}
          <Button
            variant="link"
            className="h-auto p-0 text-red-600 underline"
            onClick={handleContactSupport}
          >
            Contact support
          </Button>{' '}
          to add more credits.
        </AlertDescription>
      </Alert>
    );
  }

  // Modal variant for blocking UI
  if (variant === 'modal') {
    return (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 ${className}`}
      >
        <Card className="mx-4 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Insufficient Credits</CardTitle>
            <CardDescription>You don&apos;t have enough credits to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-muted-foreground mb-4 text-sm">
                You need <strong>{formatCredits(required)} credits</strong> for {operation}, but
                only have <strong>{formatCredits(availableCredits)} available</strong>.
              </p>

              <div className="flex flex-col space-y-3">
                <Button onClick={handleContactSupport} className="w-full">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact Support for Credits
                </Button>

                <Button variant="outline" onClick={handleRefresh} className="w-full">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh Page
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Card variant (default)
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <CreditCard className="h-6 w-6 text-red-600" />
        </div>
        <CardTitle>Insufficient Credits</CardTitle>
        <CardDescription>You need more credits to use this feature</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Credit comparison */}
        <div className="bg-muted space-y-2 rounded-lg p-4">
          <div className="flex justify-between text-sm">
            <span>Required for {operation}:</span>
            <span className="font-medium">{formatCredits(required)} credits</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Your available credits:</span>
            <span className="font-medium text-red-600">
              {formatCredits(availableCredits)} credits
            </span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Additional needed:</span>
              <span className="text-red-600">
                {formatCredits(Math.max(0, required - availableCredits))} credits
              </span>
            </div>
          </div>
        </div>

        {/* Token conversion info */}
        <div className="text-muted-foreground text-center text-sm">
          <p>1 credit = {CREDIT_CONFIG.TOKENS_PER_CREDIT.toLocaleString()} tokens</p>
          <p>Free users get {CREDIT_CONFIG.FREE_TIER_CREDITS} credits/month</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={handleContactSupport} className="w-full">
            <Mail className="mr-2 h-4 w-4" />
            Contact Support for Credits
          </Button>

          <div className="text-center">
            <Button variant="link" onClick={handleRefresh} className="text-sm">
              <RefreshCw className="mr-1 h-3 w-3" />
              Refresh to check balance
            </Button>
          </div>
        </div>

        {/* Support info */}
        <div className="border-t pt-4 text-center">
          <p className="text-muted-foreground text-xs">
            Need help? Email us at{' '}
            <a
              href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
              className="text-blue-600 hover:underline"
            >
              {APP_CONFIG.SUPPORT_EMAIL}
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
