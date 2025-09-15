'use client';

/**
 * @fileoverview Conversation history component for Recipe Analyzer demo
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { getDifyConversations } from '@/lib/actions/dify';
import { DifyConversation } from '@/types/dify';
import { History, MessageSquare, Plus, Loader2, AlertTriangle } from 'lucide-react';

interface ConversationHistoryProps {
  userId: string;
  currentConversationId?: string;
  onConversationSelect: (conversationId: string) => void;
  onCreateNew: () => void;
}

export function ConversationHistory({
  userId,
  currentConversationId,
  onConversationSelect,
  onCreateNew,
}: ConversationHistoryProps) {
  const router = useRouter();
  const [conversations, setConversations] = useState<DifyConversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadConversations = async () => {
      if (!userId) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await getDifyConversations(userId, 20);

        if (result.success && result.data?.data) {
          setConversations(result.data.data);
        } else {
          setError(result.error?.message || 'Failed to load conversations');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load conversations');
      } finally {
        setIsLoading(false);
      }
    };

    loadConversations();
  }, [userId]);

  const handleConversationClick = (conversationId: string) => {
    onConversationSelect(conversationId);
    // Update URL with conversation parameter
    router.push(`/demos/recipe-analyzer?conversation=${conversationId}`);
  };

  const handleCreateNewClick = () => {
    onCreateNew();
    // Clear conversation parameter from URL
    router.push('/demos/recipe-analyzer');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5" />
            <CardTitle className="text-lg">Conversations</CardTitle>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCreateNewClick}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Your recipe analysis history</CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <AlertTriangle className="text-destructive mb-2 h-6 w-6" />
            <p className="text-destructive text-center text-sm">{error}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <MessageSquare className="text-muted-foreground mb-2 h-8 w-8" />
            <p className="text-muted-foreground mb-3 text-center text-sm">No conversations yet</p>
            <Button variant="outline" size="sm" onClick={handleCreateNewClick}>
              Start analyzing
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-64">
            <div className="space-y-1 p-4">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`group hover:bg-accent cursor-pointer rounded-lg p-3 transition-colors ${
                    currentConversationId === conversation.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleConversationClick(conversation.id)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <h4 className="truncate text-sm font-medium">
                          {conversation.name || 'Recipe Analysis'}
                        </h4>
                        {conversation.status === 'active' && (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      {conversation.introduction && (
                        <p className="text-muted-foreground line-clamp-2 text-xs">
                          {conversation.introduction}
                        </p>
                      )}
                    </div>
                    <div className="text-muted-foreground shrink-0 text-xs">
                      {formatDate(conversation.updated_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
