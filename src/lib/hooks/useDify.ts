'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DifyMessage } from '@/types/dify';
import {
  getDifyConversations,
  getDifyAppInfo,
  getDifyConversationMessages,
  sendDifyMessage,
  renameDifyConversation,
  deleteDifyConversation,
} from '@/lib/actions/dify';
import { QUERY_CONFIGS, queryKeys, cacheInvalidation, optimisticUpdates } from '@/lib/query/config';

/**
 * Unified React Query hooks for Dify API calls
 * Uses centralized configuration and optimized patterns
 */

/**
 * Generic Dify query hook with unified configuration
 */
function useDifyQuery<T>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<T>,
  config: keyof typeof QUERY_CONFIGS,
  enabled: boolean = true
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    ...QUERY_CONFIGS[config],
  });
}

/**
 * Conversations hook - simplified
 */
export function useDifyConversations(userId: string) {
  const queryClient = useQueryClient();

  const query = useDifyQuery(
    queryKeys.dify.conversations(userId),
    async () => {
      const result = await getDifyConversations(userId);
      if (!result.success) throw new Error(result.error?.message || 'Failed to load conversations');
      return result.data;
    },
    'medium',
    !!userId
  );

  const invalidate = () => cacheInvalidation.invalidateConversations(queryClient, userId);

  return {
    ...query,
    invalidate,
    conversations: query.data?.data || [],
    hasMore: query.data?.has_more || false,
  };
}

/**
 * App info hook - simplified
 */
export function useDifyAppInfo() {
  const query = useDifyQuery(
    queryKeys.dify.appInfo(),
    async () => {
      const result = await getDifyAppInfo();
      if (!result.success) throw new Error(result.error?.message || 'Failed to load app info');
      return result.data;
    },
    'persistent',
    true
  );

  return {
    ...query,
    suggestedQuestions: query.data?.suggested_questions || [],
    openingStatement: query.data?.opening_statement,
    speechToTextEnabled: query.data?.speech_to_text?.enabled || false,
    retrieverEnabled: query.data?.retriever_resource?.enabled || false,
  };
}

/**
 * Conversation messages hook - simplified
 */
export function useDifyMessages(conversationId: string | undefined, userId: string) {
  const queryClient = useQueryClient();

  const query = useDifyQuery(
    conversationId ? queryKeys.dify.messages(conversationId, userId) : [],
    async () => {
      if (!conversationId) return null;
      const result = await getDifyConversationMessages(userId, conversationId, 50);
      if (!result.success) throw new Error(result.error?.message || 'Failed to load messages');
      return result.data;
    },
    'medium',
    !!conversationId && !!userId
  );

  const addMessage = (message: DifyMessage) => {
    if (!conversationId) return;
    optimisticUpdates.addMessage(queryClient, conversationId, userId, message);
  };

  return {
    ...query,
    addMessage,
    messages: query.data?.data || [],
    hasMore: query.data?.has_more || false,
  };
}

/**
 * Unified mutations hook - simplified
 */
export function useDifyMutations(userId: string) {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (params: {
      query: string;
      conversation_id?: string;
      response_mode?: 'blocking' | 'streaming';
      inputs?: Record<string, unknown>;
    }) => {
      const result = await sendDifyMessage(userId, { ...params, user: userId });
      if (!result.success) throw new Error(result.error?.message || 'Failed to send message');
      return result;
    },
    onSuccess: () => {
      cacheInvalidation.invalidateConversations(queryClient, userId);
    },
  });

  const renameConversation = useMutation({
    mutationFn: async ({ conversationId, name }: { conversationId: string; name: string }) => {
      const result = await renameDifyConversation(userId, conversationId, name);
      if (!result.success)
        throw new Error(result.error?.message || 'Failed to rename conversation');
      return result;
    },
    onSuccess: (result, { conversationId, name }) => {
      cacheInvalidation.invalidateConversations(queryClient, userId);
      optimisticUpdates.updateConversation(queryClient, userId, conversationId, { name });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const result = await deleteDifyConversation(userId, conversationId);
      if (!result.success)
        throw new Error(result.error?.message || 'Failed to delete conversation');
      return result;
    },
    onSuccess: () => {
      cacheInvalidation.invalidateConversations(queryClient, userId);
    },
  });

  return {
    sendMessage: {
      mutate: sendMessage.mutate,
      mutateAsync: sendMessage.mutateAsync,
      isLoading: sendMessage.isPending,
      error: sendMessage.error,
    },
    renameConversation: {
      mutate: renameConversation.mutate,
      mutateAsync: renameConversation.mutateAsync,
      isLoading: renameConversation.isPending,
      error: renameConversation.error,
    },
    deleteConversation: {
      mutate: deleteConversation.mutate,
      mutateAsync: deleteConversation.mutateAsync,
      isLoading: deleteConversation.isPending,
      error: deleteConversation.error,
    },
  };
}
