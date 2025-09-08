'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useUser } from '@/components/auth/UserProvider';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCredits, shouldWarnLowCredits } from '@/lib/utils/credits';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, CreditCard, Settings, LogOut, AlertTriangle, TestTube } from 'lucide-react';
import Link from 'next/link';

function DashboardContent() {
  const { user, logout, availableCredits, subscription } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) return null;

  const showLowCreditWarning = shouldWarnLowCredits(availableCredits);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600">
                Welcome, {user.displayName || user.email}
              </span>
              <Button variant="outline" onClick={handleLogout} size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Low credit warning */}
        {showLowCreditWarning && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Your credits are running low ({formatCredits(availableCredits)} remaining).
              Please contact{' '}
              <a 
                href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`}
                className="underline hover:no-underline"
              >
                support
              </a>
              {' '}to add more credits.
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Credits</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCredits(availableCredits)}</div>
              <p className="text-xs text-muted-foreground">
                {user.admin.usedCredits} used this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {subscription?.plan || 'Free'}
              </div>
              <p className="text-xs text-muted-foreground">
                {subscription?.creditsPerMonth} credits/month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Account Status</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {user.admin.isBlocked ? 'Blocked' : 'Active'}
              </div>
              <p className="text-xs text-muted-foreground">
                Since {new Date(user.createdAt.seconds * 1000).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Credit Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <CreditDisplay variant="card" showHistory={true} />
          </div>
          
          {/* Quick Actions */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>
                  Learn how to integrate Dify AI into your applications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    You have <strong>{formatCredits(availableCredits)} credits</strong> to start 
                    building AI-powered features. Each credit equals approximately 1,000 tokens.
                  </p>
                  
                  <div className="space-y-2">
                    <Button className="w-full" disabled>
                      View Documentation (Coming Soon)
                    </Button>
                    
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/test-credits">
                        <TestTube className="mr-2 h-4 w-4" />
                        Test Credit System
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}