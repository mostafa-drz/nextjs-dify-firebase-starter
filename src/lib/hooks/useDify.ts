'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getDifyConversations, 
  getDifyAppInfo, 
  getDifyConversationMessages,
  sendDifyMessage,
  renameDifyConversation,
  deleteDifyConversation
} from '@/lib/actions/dify';

/**
 * Unified React Query configuration for all Dify API calls
 * Provides consistent caching, error handling, and optimistic updates
 */

// Shared query configurations
const QUERY_CONFIGS = {
  conversations: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,   // 5 minutes
  },
  appInfo: {
    staleTime: 10 * 60 * 1000, // 10 minutes (rarely changes)
    gcTime: 30 * 60 * 1000,    // 30 minutes
  },
  messages: {
    staleTime: 5 * 60 * 1000,  // 5 minutes
    gcTime: 10 * 60 * 1000,    // 10 minutes
  },
} as const;

/**
 * Generic Dify query hook with unified configuration
 */
function useDifyQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  config: keyof typeof QUERY_CONFIGS,
  enabled: boolean = true
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    retry: 2,
    ...QUERY_CONFIGS[config],
  });
}

/**
 * Conversations hook - simplified
 */
export function useDifyConversations(userId: string, apiKey: string) {
  const queryClient = useQueryClient();
  
  const query = useDifyQuery(
    ['dify-conversations', userId],
    async () => {
      const result = await getDifyConversations(userId, apiKey);
      if (!result.success) throw new Error(result.error?.message || 'Failed to load conversations');
      return result.data;
    },
    'conversations',
    !!userId && !!apiKey
  );

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['dify-conversations', userId] });

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
export function useDifyAppInfo(apiKey: string) {
  const query = useDifyQuery(
    ['dify-app-info', apiKey],
    async () => {
      const result = await getDifyAppInfo(apiKey);
      if (!result.success) throw new Error(result.error?.message || 'Failed to load app info');
      return result.data;
    },
    'appInfo',
    !!apiKey
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
export function useDifyMessages(conversationId: string | undefined, userId: string, apiKey: string) {
  const queryClient = useQueryClient();
  
  const query = useDifyQuery(
    ['dify-messages', conversationId || '', userId],
    async () => {
      if (!conversationId) return null;
      const result = await getDifyConversationMessages(userId, apiKey, conversationId, 50);
      if (!result.success) throw new Error(result.error?.message || 'Failed to load messages');
      return result.data;
    },
    'messages',
    !!conversationId && !!userId && !!apiKey
  );

  const addMessage = (message: unknown) => {
    if (!conversationId) return;
    queryClient.setQueryData(['dify-messages', conversationId, userId], (old: unknown) => {
      if (!old) return old;
      const data = old as { data: unknown[]; has_more: boolean; first_id: string };
      return { ...data, data: [...data.data, message] };
    });
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
export function useDifyMutations(userId: string, apiKey: string) {
  const queryClient = useQueryClient();

  const sendMessage = useMutation({
    mutationFn: async (params: { query: string; conversation_id?: string; response_mode?: 'blocking' | 'streaming' }) => {
      const result = await sendDifyMessage(userId, apiKey, { ...params, user: userId });
      if (!result.success) throw new Error(result.error?.message || 'Failed to send message');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations', userId] });
    },
  });

  const renameConversation = useMutation({
    mutationFn: async ({ conversationId, name }: { conversationId: string; name: string }) => {
      const result = await renameDifyConversation(userId, apiKey, conversationId, name);
      if (!result.success) throw new Error(result.error?.message || 'Failed to rename conversation');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations', userId] });
    },
  });

  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const result = await deleteDifyConversation(userId, apiKey, conversationId);
      if (!result.success) throw new Error(result.error?.message || 'Failed to delete conversation');
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dify-conversations', userId] });
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
