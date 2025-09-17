/**
 * @fileoverview Dify hooks for React components
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DifyMessage, DifyConversationResponse } from '@/types/dify';
import {
  getDifyConversations,
  getDifyConversationMessages,
  renameDifyConversation,
  deleteDifyConversation,
} from '@/lib/actions/dify';

export function useDifyMessages(userId: string, conversationId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dify-messages', conversationId, userId],
    queryFn: async (): Promise<DifyMessage[]> => {
      if (!conversationId) return [];

      // Validate userId (should always be valid in protected routes)
      if (!userId) {
        throw new Error('User ID is required');
      }

      try {
        const result = await getDifyConversationMessages(userId, conversationId, 50);

        if (!result.success) {
          // Handle 404 errors gracefully - conversation doesn't exist
          if (result.error?.status === 404) {
            console.warn(`Conversation ${conversationId} not found`);
            return [];
          }
          throw new Error(result.error?.message || 'Failed to fetch conversation messages');
        }

        if (!result.data?.data) {
          return [];
        }

        // Transform conversation messages to DifyMessage[]
        const messages: DifyMessage[] = [];

        result.data.data.forEach((msg: any) => {
          // Add user message if query exists
          if (msg.query) {
            messages.push({
              id: `${msg.id}-user`,
              role: 'user',
              content: msg.query,
              created_at: new Date(msg.created_at).toISOString(),
            });
          }

          // Add assistant message if answer exists
          if (msg.answer) {
            messages.push({
              id: `${msg.id}-assistant`,
              role: 'assistant',
              content: msg.answer,
              created_at: new Date(msg.created_at).toISOString(),
            });
          }
        });

        // Sort messages by creation time to maintain chronological order
        messages.sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return messages;
      } catch (error) {
        // Handle any other errors (including network errors) gracefully
        console.error('Error fetching conversation messages:', error);

        // If it's a DifyApiError with 404 status, return empty array instead of throwing
        if (error instanceof Error && error.message.includes('HTTP 404')) {
          console.warn(`Conversation ${conversationId} not found (404)`);
          return [];
        }

        throw error;
      }
    },
    enabled: !!conversationId && !!userId,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const addMessage = (message: DifyMessage) => {
    queryClient.setQueryData(['dify-messages', conversationId, userId], (old: any) => [
      ...(old || []),
      message,
    ]);
  };

  return {
    data: query.data,
    isLoading: query.isPending,
    error: query.error,
    addMessage,
  };
}

export function useDifyAppInfo() {
  const query = useQuery({
    queryKey: ['dify-app-info'],
    queryFn: async () => {
      // Mock implementation
      return {
        suggestedQuestions: ['What can you do?', 'How does this work?'],
        openingStatement: 'Hello! How can I help you today?',
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 10 * 60 * 1000, // 10 minutes - app info rarely changes
  });

  return {
    suggestedQuestions: query.data?.suggestedQuestions || [],
    openingStatement: query.data?.openingStatement || '',
  };
}

export function useDifyConversations(userId: string) {
  const query = useQuery({
    queryKey: ['dify-conversations', userId],
    queryFn: async () => {
      // Validate userId (should always be valid in protected routes)
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await getDifyConversations(userId, 20);

      if (!result.success) {
        throw new Error(result.error?.message || 'Failed to fetch conversations');
      }

      return result.data?.data || [];
    },
    enabled: !!userId,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    conversations: query.data || [],
    isLoading: query.isPending,
    error: query.error,
  };
}

export function useDifyMutations(userId: string) {
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (_message: string) => {
      // Mock implementation
      return {
        success: true,
        data: {
          answer: 'Mock response',
          conversation_id: 'conv-123',
          message_id: 'msg-123',
        } as DifyConversationResponse,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-messages'] });
    },
  });

  const renameConversationMutation = useMutation({
    mutationFn: async ({ conversationId, name }: { conversationId: string; name: string }) => {
      return await renameDifyConversation(userId, conversationId, name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations'] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      return await deleteDifyConversation(userId, conversationId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations'] });
    },
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    sendMessageMutation,
    renameConversation: renameConversationMutation,
    deleteConversation: deleteConversationMutation,
  };
}
