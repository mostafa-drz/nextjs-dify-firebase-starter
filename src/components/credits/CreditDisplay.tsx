'use client';

import { useUser } from '@/components/auth/UserProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCredits, shouldWarnLowCredits } from '@/lib/utils/credits';
import { CREDIT_CONFIG, APP_CONFIG } from '@/lib/config/constants';
import { CreditCard, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface CreditDisplayProps {
  variant?: 'card' | 'inline' | 'compact';
  showHistory?: boolean;
  className?: string;
}

export function CreditDisplay({ 
  variant = 'card', 
  showHistory = false,
  className = '' 
}: CreditDisplayProps) {
  const { user, availableCredits, subscription } = useUser();

  if (!user) {
    return null;
  }

  const showWarning = shouldWarnLowCredits(availableCredits);
  const tokensAvailable = availableCredits * CREDIT_CONFIG.TOKENS_PER_CREDIT;

  // Compact variant for header/navbar
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className={`text-sm font-medium ${showWarning ? 'text-red-600' : 'text-foreground'}`}>
          {formatCredits(availableCredits)} credits
        </span>
        {showWarning && <AlertTriangle className="h-4 w-4 text-red-500" />}
      </div>
    );
  }

  // Inline variant for within other components
  if (variant === 'inline') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Available Credits:</span>
          <span className={`font-medium ${showWarning ? 'text-red-600' : 'text-foreground'}`}>
            {formatCredits(availableCredits)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">≈ Tokens:</span>
          <span className="text-sm text-muted-foreground">
            {formatCredits(tokensAvailable)}
          </span>
        </div>
        {showWarning && (
          <Alert variant="destructive" className="py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Credits running low! Contact{' '}
              <a 
                href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}
                className="underline hover:no-underline"
              >
                support
              </a>
              {' '}to add more.
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }

  // Card variant (default)
  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCredits(availableCredits)}</div>
          <p className="text-xs text-muted-foreground">
            ≈ {formatCredits(tokensAvailable)} tokens available
          </p>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>Used: {formatCredits(user.admin.usedCredits)}</span>
            <span>Plan: {subscription?.plan || 'Free'}</span>
          </div>
        </CardContent>
      </Card>

      {/* Credit conversion info */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">How Credits Work</CardTitle>
          <Info className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>1 Credit =</span>
              <span>{CREDIT_CONFIG.TOKENS_PER_CREDIT.toLocaleString()} tokens</span>
            </div>
            <div className="flex justify-between">
              <span>Free Tier =</span>
              <span>{CREDIT_CONFIG.FREE_TIER_CREDITS} credits/month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning card */}
      {showWarning && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Low credits warning!</strong>
            <br />
            You have {formatCredits(availableCredits)} credits remaining.
            <br />
            Contact{' '}
            <Button 
              variant="link" 
              className="h-auto p-0 text-red-600 underline"
              asChild
            >
              <a href={`mailto:${APP_CONFIG.SUPPORT_EMAIL}`}>
                support
              </a>
            </Button>
            {' '}to add more credits.
          </AlertDescription>
        </Alert>
      )}

      {/* Credit history preview */}
      {showHistory && user.admin.creditHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
            <CardDescription>Last 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {user.admin.creditHistory.slice(0, 5).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{transaction.operation}</span>
                    {transaction.metadata?.tokensUsed && (
                      <span className="text-muted-foreground ml-2">
                        ({transaction.metadata.tokensUsed} tokens)
                      </span>
                    )}
                  </div>
                  <span className={transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                  </span>
                </div>
              ))}
              {user.admin.creditHistory.length > 5 && (
                <div className="text-xs text-muted-foreground text-center pt-2">
                  +{user.admin.creditHistory.length - 5} more transactions
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}