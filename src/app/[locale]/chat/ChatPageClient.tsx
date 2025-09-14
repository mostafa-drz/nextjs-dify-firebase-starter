'use client';

import { useState } from 'react';
import { useUser } from '@/components/auth/UserProvider';
import { AppLayout } from '@/components/layout/AppLayout';
import { PageContainer } from '@/components/layout/PageContainer';
import { ChatHeader } from '@/components/chat/ChatHeader';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatMainArea } from '@/components/chat/ChatMainArea';

/**
 * Client-side chat page component
 * Handles interactive chat functionality
 */
export function ChatPageClient() {
  const { user } = useUser();
  console.log('user', user);
  const [currentConversationId, setCurrentConversationId] = useState<string | undefined>();
  if (!user) {
    return null;
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
