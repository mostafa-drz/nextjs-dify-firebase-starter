'use client';

import { useState } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainArea } from '@/components/chat/ChatMainArea';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

/**
 * Client-side chat page component
 * Handles interactive chat functionality
 */
export function ChatPageClient() {
  const { user } = useUser();
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();

  // Middleware handles auth redirects, so user should always be available here
  // But we keep this as a safety check
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
  };

  const handleCreateNew = () => {
    setCurrentConversationId(undefined);
  };

  return (
    <AppLayout currentPage="chat">
      <PageContainer>
        <ChatHeader />

        <div className="grid gap-8 lg:grid-cols-4">
          <ChatSidebar
            userId={user.uid}
            currentConversationId={currentConversationId}
            onConversationSelect={handleConversationSelect}
            onCreateNew={handleCreateNew}
          />

          <ChatMainArea currentConversationId={currentConversationId} />
        </div>
      </PageContainer>
    </AppLayout>
  );
}
