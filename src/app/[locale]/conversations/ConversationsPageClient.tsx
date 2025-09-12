'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/components/auth/UserProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ConversationList } from '@/components/dify/ConversationList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, MessageSquare, History, Loader2 } from 'lucide-react';

/**
 * Client-side conversations page component
 * Handles interactive conversation management
 */
export function ConversationsPageClient() {
  const { user } = useUser();
  const router = useRouter();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

  // Loading state while user is being fetched
  if (!user) {
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

  const handleConversationSelect = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    // Navigate to chat page with the selected conversation
    router.push(`/chat?conversation=${conversationId}`);
  };

  const handleCreateNew = () => {
    setCurrentConversationId(undefined);
    // Navigate to chat page for new conversation
    router.push('/chat');
  };

  return (
    <AppLayout currentPage="conversations">
      <PageContainer>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Conversations</h1>
              <p className="text-muted-foreground mt-2">
                Manage your chat conversations and history
              </p>
            </div>
            <Button onClick={handleCreateNew} className="gap-2">
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>
          </div>

          {/* Conversations List */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Conversations
                  </CardTitle>
                  <CardDescription>Browse and manage your conversation history</CardDescription>
                </CardHeader>
                <CardContent>
                  <ConversationList
                    userId={user.uid}
                    currentConversationId={currentConversationId}
                    onConversationSelect={handleConversationSelect}
                    onCreateNew={handleCreateNew}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar with quick actions */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={handleCreateNew} className="w-full gap-2" variant="outline">
                    <Plus className="h-4 w-4" />
                    Start New Chat
                  </Button>
                  <Button
                    onClick={() => router.push('/chat')}
                    className="w-full gap-2"
                    variant="outline"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Go to Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Usage Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Conversations:</span>
                      <span>Loading...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Messages Sent:</span>
                      <span>Loading...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Credits Used:</span>
                      <span>Loading...</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </PageContainer>
    </AppLayout>
  );
}
