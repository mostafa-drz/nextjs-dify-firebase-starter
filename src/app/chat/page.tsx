'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { DifyChat } from '@/components/dify/DifyChat';
import { ConversationList } from '@/components/dify/ConversationList';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, MessageSquare, History } from 'lucide-react';

export default function ChatPage() {
  const { user } = useUser();
  const router = useRouter();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
  };

  const handleCreateNew = () => {
    setCurrentConversationId(undefined);
  };

  return (
    <PageLayout currentPage="chat">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">AI Chat Assistant</h1>
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

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Credit Display */}
          <CreditDisplay variant="card" />

          {/* Conversation List */}
          <ConversationList
            apiKey="app-demo-key"
            userId={user.uid}
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onCreateNew={handleCreateNew}
          />

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

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="chat" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="conversations" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                Conversations
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="chat" className="mt-6">
              <DifyChat
                apiKey="app-demo-key"
                name="Demo Assistant"
                placeholder="Ask me anything..."
                welcomeMessage="Hello! I'm your AI assistant powered by Dify. I use a secure server-side integration that protects your API keys and tracks token usage for credit deduction. How can I help you today?"
                className="w-full"
                conversationId={currentConversationId}
              />
            </TabsContent>
            
            <TabsContent value="conversations" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Conversations</CardTitle>
                  <CardDescription>
                    Browse and manage your conversation history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Conversation management is available in the sidebar</p>
                    <p className="text-sm">Use the conversation list on the left to browse your chats</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}