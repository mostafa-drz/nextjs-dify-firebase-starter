'use client';

import { DifyChat } from '@/components/dify/DifyChat';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Dify Chat Demo</h1>
        <p className="text-muted-foreground">
          Secure server-side integration with Dify.ai using your API key
        </p>
      </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>To use this demo:</strong> You need to add your Dify app API key to the environment variables. 
          Set <code>DIFY_API_KEY</code> in your <code>.env.local</code> file.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Chat Interface */}
        <div className="md:col-span-2">
          <DifyChat
            apiKey="app-demo-key" // This will be replaced with actual environment variable server-side
            name="Demo Assistant"
            placeholder="Ask me anything..."
            welcomeMessage="Hello! I'm your AI assistant powered by Dify. I use a secure server-side integration that protects your API keys and tracks token usage for credit deduction. How can I help you today?"
            className="w-full"
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Credit Display */}
          <CreditDisplay variant="card" />

          {/* Integration Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Secure Integration</CardTitle>
              <CardDescription>
                How this demo works
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-3">
              <div>
                <strong>✅ Server-side API calls</strong>
                <p className="text-muted-foreground">API keys never exposed to client</p>
              </div>
              
              <div>
                <strong>✅ Credit tracking</strong>
                <p className="text-muted-foreground">Automatic deduction based on token usage</p>
              </div>
              
              <div>
                <strong>✅ Pre-flight checks</strong>
                <p className="text-muted-foreground">Prevents calls without sufficient credits</p>
              </div>
              
              <div>
                <strong>✅ Error handling</strong>
                <p className="text-muted-foreground">Graceful degradation and user feedback</p>
              </div>

              <div>
                <strong>✅ Real-time updates</strong>
                <p className="text-muted-foreground">Live credit balance updates</p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}