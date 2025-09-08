'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { InsufficientCredits } from '@/components/credits/InsufficientCredits';
import { useCredits } from '@/lib/hooks/useCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Loader2, Zap, Plus } from 'lucide-react';

function TestCreditsContent() {
  const { 
    deductForTokens, 
    addCreditsToUser, 
    isProcessing, 
    hasEnoughCredits, 
    availableCredits 
  } = useCredits();
  
  const [tokensToDeduct, setTokensToDeduct] = useState(1000);
  const [creditsToAdd, setCreditsToAdd] = useState(10);
  const [lastResult, setLastResult] = useState<any>(null);

  const handleDeductTokens = async () => {
    const result = await deductForTokens(
      tokensToDeduct, 
      'test-token-deduction',
      {
        difyAppToken: 'test-app',
        sessionId: 'test-session-' + Date.now()
      }
    );
    setLastResult(result);
  };

  const handleAddCredits = async () => {
    const result = await addCreditsToUser(creditsToAdd, 'test-credit-addition');
    setLastResult(result);
  };

  const canDeductTokens = hasEnoughCredits(Math.ceil(tokensToDeduct / 1000));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-slate-900">Credit System Test</h1>
            </div>
            <CreditDisplay variant="compact" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Credit Display */}
          <div className="space-y-6">
            <CreditDisplay variant="card" showHistory={true} />
            
            {/* Demo insufficient credits */}
            {!canDeductTokens && (
              <InsufficientCredits 
                required={Math.ceil(tokensToDeduct / 1000)}
                operation="token deduction test"
                variant="card"
              />
            )}
          </div>

          {/* Test Controls */}
          <div className="space-y-6">
            
            {/* Token Deduction Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="mr-2 h-5 w-5" />
                  Test Token Deduction
                </CardTitle>
                <CardDescription>
                  Simulate Dify API token usage and credit deduction
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tokens">Tokens to deduct</Label>
                  <Input
                    id="tokens"
                    type="number"
                    value={tokensToDeduct}
                    onChange={(e) => setTokensToDeduct(Number(e.target.value))}
                    min="1"
                    max="10000"
                  />
                  <p className="text-xs text-muted-foreground">
                    Will deduct {Math.ceil(tokensToDeduct / 1000)} credits
                  </p>
                </div>
                
                <Button 
                  onClick={handleDeductTokens}
                  disabled={isProcessing || !canDeductTokens}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Deduct {Math.ceil(tokensToDeduct / 1000)} Credits
                    </>
                  )}
                </Button>
                
                {!canDeductTokens && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      Insufficient credits for this operation
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Credit Addition Test */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="mr-2 h-5 w-5" />
                  Test Credit Addition
                </CardTitle>
                <CardDescription>
                  Simulate adding credits to account (admin function)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credits">Credits to add</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={creditsToAdd}
                    onChange={(e) => setCreditsToAdd(Number(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                
                <Button 
                  onClick={handleAddCredits}
                  disabled={isProcessing}
                  variant="secondary"
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add {creditsToAdd} Credits
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Last Result */}
            {lastResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Last Operation Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert variant={lastResult.success ? "default" : "destructive"}>
                    <AlertDescription>
                      <strong>{lastResult.success ? 'Success' : 'Error'}:</strong> {lastResult.message}
                      {lastResult.remainingCredits !== undefined && (
                        <span className="block mt-1">
                          Remaining credits: {lastResult.remainingCredits}
                        </span>
                      )}
                      {lastResult.creditsDeducted !== undefined && (
                        <span className="block mt-1">
                          Credits deducted: {lastResult.creditsDeducted}
                        </span>
                      )}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Separator className="my-8" />
        
        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>
                <strong>1. Token Deduction:</strong> Enter a number of tokens and click "Deduct Credits". 
                This simulates what happens when you use Dify AI features.
              </p>
              <p>
                <strong>2. Credit Addition:</strong> Enter credits to add and click "Add Credits". 
                This simulates an admin adding credits to your account.
              </p>
              <p>
                <strong>3. Real-time Updates:</strong> Watch the credit display update in real-time 
                as operations complete.
              </p>
              <p>
                <strong>4. Low Credit Warning:</strong> When you have 10 or fewer credits, 
                you'll see warning messages.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function TestCreditsPage() {
  return (
    <ProtectedRoute>
      <TestCreditsContent />
    </ProtectedRoute>
  );
}