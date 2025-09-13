/**
 * @fileoverview Dify hooks for React components
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DifyMessage, DifyConversationResponse } from '@/types/dify';

// Mock implementation for testing
export function useDifyMessages(userId: string, conversationId?: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['dify-messages', conversationId, userId],
    queryFn: async (): Promise<DifyMessage[]> => {
      // Mock implementation - return array of messages directly
      return [];
    },
    enabled: !!conversationId,
  });

  const addMessage = (message: DifyMessage) => {
    queryClient.setQueryData(['dify-messages', conversationId, userId], (old: any) => [
      ...(old || []),
      message,
    ]);
  };

  return {
    data: query.data,
    isLoading: query.isLoading,
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
      // Mock implementation - return array of conversations
      return [
        {
          id: 'conv-1',
          name: 'Sample Conversation 1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 'conv-2',
          name: 'Sample Conversation 2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
    },
    enabled: !!userId,
  });

  return {
    conversations: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
  };
}

export function useDifyMutations(_userId: string) {
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
    mutationFn: async ({
      conversationId: _conversationId,
      name: _name,
    }: {
      conversationId: string;
      name: string;
    }) => {
      // Mock implementation
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations'] });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async (_conversationId: string) => {
      // Mock implementation
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations'] });
    },
  });

  return {
    sendMessage: sendMessageMutation.mutateAsync,
    renameConversation: renameConversationMutation,
    deleteConversation: deleteConversationMutation,
  };
}
