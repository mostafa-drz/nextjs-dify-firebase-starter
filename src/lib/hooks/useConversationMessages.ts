'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getDifyConversationMessages } from '@/lib/actions/dify';

/**
 * Hook for managing conversation messages with React Query caching
 * 
 * This hook provides:
 * - Automatic caching of conversation messages
 * - Background refetching
 * - Optimistic updates
 * - Error handling
 * 
 * @param conversationId - The conversation ID to load messages for
 * @param userId - User ID for the API call
 * @param apiKey - Dify API key
 * @param enabled - Whether the query should be enabled
 */
export function useConversationMessages(
  conversationId: string | undefined,
  userId: string,
  apiKey: string,
  enabled: boolean = true
) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['conversation-messages', conversationId, userId],
    queryFn: async () => {
      if (!conversationId) return null;
      
      const result = await getDifyConversationMessages(
        userId,
        apiKey,
        conversationId,
        50 // Load last 50 messages
      );
      
      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to load messages');
      }
      
      return result.data;
    },
    enabled: enabled && !!conversationId && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });

  /**
   * Add a new message to the cache optimistically
   * This allows immediate UI updates while the API call is in progress
   */
  const addMessageOptimistically = (message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    tokensUsed?: number;
    creditsDeducted?: number;
  }) => {
    if (!conversationId) return;

    queryClient.setQueryData(
      ['conversation-messages', conversationId, userId],
      (oldData: unknown) => {
        if (!oldData) return oldData;
        
        const data = oldData as {
          data: unknown[];
          has_more: boolean;
          first_id: string;
        };
        
        return {
          ...data,
          data: [
            ...data.data,
            {
              id: message.id,
              role: message.role,
              content: message.content,
              created_at: Math.floor(message.timestamp.getTime() / 1000),
              metadata: message.tokensUsed ? {
                usage: {
                  total_tokens: message.tokensUsed,
                  credits_deducted: message.creditsDeducted
                }
              } : undefined
            }
          ]
        };
      }
    );
  };

  /**
   * Update a message in the cache (useful for token usage updates)
   */
  const updateMessage = (messageId: string, updates: Partial<{
    tokensUsed: number;
    creditsDeducted: number;
  }>) => {
    if (!conversationId) return;

    queryClient.setQueryData(
      ['conversation-messages', conversationId, userId],
      (oldData: unknown) => {
        if (!oldData) return oldData;
        
        const data = oldData as {
          data: unknown[];
          has_more: boolean;
          first_id: string;
        };
        
        return {
          ...data,
          data: data.data.map((msg: unknown) => {
            const message = msg as {
              id: string;
              metadata?: {
                usage?: {
                  total_tokens: number;
                  credits_deducted?: number;
                };
              };
            };
            
            return message.id === messageId 
              ? {
                  ...message,
                  metadata: {
                    ...message.metadata,
                    usage: {
                      ...message.metadata?.usage,
                      total_tokens: updates.tokensUsed || message.metadata?.usage?.total_tokens,
                      credits_deducted: updates.creditsDeducted || message.metadata?.usage?.credits_deducted
                    }
                  }
                }
              : message;
          })
        };
      }
    );
  };

  /**
   * Invalidate the cache to force a refetch
   */
  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ['conversation-messages', conversationId, userId]
    });
  };

  return {
    ...query,
    addMessageOptimistically,
    updateMessage,
    invalidate,
    messages: query.data?.data || [],
    hasMore: query.data?.has_more || false,
  };
}

/**
 * Hook for prefetching conversation messages
 * Useful for preloading messages when hovering over conversation items
 */
export function usePrefetchConversationMessages() {
  const queryClient = useQueryClient();

  const prefetchMessages = (
    conversationId: string,
    userId: string,
    apiKey: string
  ) => {
    queryClient.prefetchQuery({
      queryKey: ['conversation-messages', conversationId, userId],
      queryFn: async () => {
        const result = await getDifyConversationMessages(
          userId,
          apiKey,
          conversationId,
          50
        );
        
        if (!result.success) {
          throw new Error(result.error?.message || 'Failed to load messages');
        }
        
        return result.data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return { prefetchMessages };
}
