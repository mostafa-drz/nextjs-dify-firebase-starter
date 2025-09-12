/**
 * Centralized React Query Configuration
 * Optimized for Next.js 15 and React 19 patterns
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { DifyConversation, DifyMessage } from '@/types/dify';

/**
 * Centralized query configuration for different data types
 */
export const QUERY_CONFIGS = {
  // Short-lived data (user interactions, real-time updates)
  ephemeral: {
    staleTime: 0,
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  },

  // Medium-lived data (conversations, messages)
  medium: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  },

  // Long-lived data (app info, user settings)
  persistent: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 3,
    refetchOnWindowFocus: false,
  },

  // Background data (analytics, metrics)
  background: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  },
} as const;

/**
 * Default options for all queries
 */
export const defaultQueryOptions: DefaultOptions['queries'] = {
  staleTime: 2 * 60 * 1000, // 2 minutes default
  gcTime: 10 * 60 * 1000, // 10 minutes default
  retry: (failureCount, error: unknown) => {
    // Don't retry on 4xx errors (client errors)
    if (
      error &&
      typeof error === 'object' &&
      'status' in error &&
      typeof error.status === 'number' &&
      error.status >= 400 &&
      error.status < 500
    ) {
      return false;
    }
    // Retry up to 3 times for other errors
    return failureCount < 3;
  },
  refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
  refetchOnReconnect: true, // Refetch when network reconnects
  refetchOnMount: true, // Refetch when component mounts
};

/**
 * Default options for all mutations
 */
export const defaultMutationOptions: DefaultOptions['mutations'] = {
  retry: 1, // Only retry mutations once
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
};

/**
 * Create optimized QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: defaultQueryOptions,
      mutations: defaultMutationOptions,
    },
  });
}

/**
 * Query key factories for consistent key management
 */
export const queryKeys = {
  // Auth-related queries
  auth: {
    user: (userId: string) => ['auth', 'user', userId] as const,
    session: () => ['auth', 'session'] as const,
  },

  // Dify-related queries
  dify: {
    conversations: (userId: string) => ['dify', 'conversations', userId] as const,
    messages: (conversationId: string, userId: string) =>
      ['dify', 'messages', conversationId, userId] as const,
    appInfo: () => ['dify', 'appInfo'] as const,
    suggestedQuestions: () => ['dify', 'suggestedQuestions'] as const,
  },

  // Credit-related queries
  credits: {
    balance: (userId: string) => ['credits', 'balance', userId] as const,
    history: (userId: string) => ['credits', 'history', userId] as const,
  },

  // Analytics queries
  analytics: {
    metrics: (userId: string) => ['analytics', 'metrics', userId] as const,
    events: (userId: string) => ['analytics', 'events', userId] as const,
  },
} as const;

/**
 * Cache invalidation helpers
 */
export const cacheInvalidation = {
  // Invalidate all user-related data
  invalidateUser: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'user', userId] });
    queryClient.invalidateQueries({ queryKey: ['credits', 'balance', userId] });
    queryClient.invalidateQueries({ queryKey: ['dify', 'conversations', userId] });
  },

  // Invalidate all conversation data
  invalidateConversations: (queryClient: QueryClient, userId: string) => {
    queryClient.invalidateQueries({ queryKey: ['dify', 'conversations', userId] });
  },

  // Invalidate specific conversation messages
  invalidateMessages: (queryClient: QueryClient, conversationId: string, userId: string) => {
    queryClient.invalidateQueries({
      queryKey: ['dify', 'messages', conversationId, userId],
    });
  },

  // Invalidate app info
  invalidateAppInfo: (queryClient: QueryClient) => {
    queryClient.invalidateQueries({ queryKey: ['dify', 'appInfo'] });
  },
} as const;

/**
 * Optimistic update helpers
 */
export const optimisticUpdates = {
  // Add message optimistically
  addMessage: (
    queryClient: QueryClient,
    conversationId: string,
    userId: string,
    message: DifyMessage
  ) => {
    queryClient.setQueryData(['dify', 'messages', conversationId, userId], (old: unknown) => {
      if (!old || typeof old !== 'object' || !('data' in old)) return old;
      const data = (old as Record<string, unknown>).data;
      if (!Array.isArray(data)) return old;
      return {
        ...old,
        data: [...data, message],
      };
    });
  },

  // Update conversation optimistically
  updateConversation: (
    queryClient: QueryClient,
    userId: string,
    conversationId: string,
    updates: Partial<DifyConversation>
  ) => {
    queryClient.setQueryData(['dify', 'conversations', userId], (old: unknown) => {
      if (!old || typeof old !== 'object' || !('data' in old)) return old;
      const data = (old as Record<string, unknown>).data;
      if (!Array.isArray(data)) return old;
      return {
        ...old,
        data: data.map((conv: unknown) => {
          if (
            typeof conv === 'object' &&
            conv &&
            'id' in conv &&
            (conv as Record<string, unknown>).id === conversationId
          ) {
            return { ...conv, ...updates };
          }
          return conv;
        }),
      };
    });
  },
} as const;
