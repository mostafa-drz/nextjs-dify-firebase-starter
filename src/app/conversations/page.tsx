'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { ConversationList } from '@/components/dify/ConversationList';
import { DifyChat } from '@/components/dify/DifyChat';
import { CreditDisplay } from '@/components/credits/CreditDisplay';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, MessageSquare } from 'lucide-react';

export default function ConversationsPage() {
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
    <PageLayout currentPage="conversations">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Conversations</h1>
          <p className="text-muted-foreground">
            Manage your AI conversations and chat history
          </p>
        </div>

      {/* Instructions */}
      <Alert className="mb-8">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Conversation Management:</strong> Browse your chat history, rename conversations, 
          and continue previous discussions. All conversations are securely stored and synced.
        </AlertDescription>
      </Alert>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Conversation List Sidebar */}
        <div className="lg:col-span-1">
          <ConversationList
            apiKey="app-demo-key"
            userId={user.uid}
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onCreateNew={handleCreateNew}
          />
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            {/* Credit Display */}
            <div className="flex justify-end">
              <CreditDisplay variant="compact" />
            </div>

            {/* Chat Interface */}
            <Card className="min-h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  {currentConversationId ? 'Continue Conversation' : 'New Conversation'}
                </CardTitle>
                <CardDescription>
                  {currentConversationId 
                    ? 'Continue your previous conversation'
                    : 'Start a new conversation with your AI assistant'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <DifyChat
                  apiKey="app-demo-key"
                  name="AI Assistant"
                  placeholder="Type your message..."
                  className="border-0"
                  conversationId={currentConversationId}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PageLayout>
  );
}
