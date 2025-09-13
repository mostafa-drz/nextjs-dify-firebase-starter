'use client';

import { useState, useCallback } from 'react';
import { sendDifyMessage } from '@/lib/actions/dify';

interface UseStreamingChatOptions {
  userId: string;
  conversationId?: string;
}

interface ChatState {
  isSending: boolean;
  error: string | null;
  creditsDeducted?: number;
}

/**
 * Custom hook for handling chat functionality
 * Uses secure server actions instead of client-side API calls
 */
export function useStreamingChat({ userId, conversationId }: UseStreamingChatOptions) {
  const [chatState, setChatState] = useState<ChatState>({
    isSending: false,
    error: null,
  });

  const sendMessage = useCallback(
    async (
      query: string,
      onSuccess?: (response: any) => void,
      onError?: (error: string) => void
    ): Promise<void> => {
      if (chatState.isSending) {
        return;
      }

      setChatState({
        isSending: true,
        error: null,
      });

      try {
        const result = await sendDifyMessage(userId, {
          query,
          user: userId,
          conversation_id: conversationId,
          response_mode: 'blocking',
        });

        if (result.success && result.data) {
          setChatState((prev) => ({
            ...prev,
            isSending: false,
            creditsDeducted: result.usage?.total_tokens,
          }));

          onSuccess?.(result.data);
        } else {
          const errorMessage = result.error?.message || 'Failed to send message';
          setChatState((prev) => ({
            ...prev,
            isSending: false,
            error: errorMessage,
          }));
          onError?.(errorMessage);
        }
      } catch (error) {
        console.error('Chat error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
        setChatState((prev) => ({
          ...prev,
          isSending: false,
          error: errorMessage,
        }));
        onError?.(errorMessage);
      }
    },
    [userId, conversationId, chatState.isSending]
  );

  const clearError = useCallback(() => {
    setChatState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...chatState,
    sendMessage,
    clearError,
  };
}
