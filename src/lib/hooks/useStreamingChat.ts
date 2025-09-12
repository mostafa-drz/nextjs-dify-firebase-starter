'use client';

import { useState, useCallback, useRef } from 'react';
import { DifyService } from '@/lib/services/dify';
import { StreamingEvent, ChatRequest } from '@/lib/services/dify/types';
import { deductCreditsForTokens } from '@/lib/actions/credits';

interface UseStreamingChatOptions {
  userId: string;
  conversationId?: string;
  enableStreaming?: boolean;
}

interface StreamingState {
  isStreaming: boolean;
  currentMessage: string;
  error: string | null;
  abortController: AbortController | null;
  creditsDeducted?: number;
}

/**
 * Custom hook for handling streaming chat functionality
 * Provides production-ready streaming with proper cleanup and error handling
 */
export function useStreamingChat({
  userId,
  conversationId,
  enableStreaming = false,
}: UseStreamingChatOptions) {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    currentMessage: '',
    error: null,
    abortController: null,
  });

  const difyServiceRef = useRef<DifyService | null>(null);

  // Initialize Dify service
  if (!difyServiceRef.current) {
    difyServiceRef.current = new DifyService({
      apiKey: process.env.NEXT_PUBLIC_DIFY_API_KEY || '',
      userId,
    });
  }

  const startStreaming = useCallback(
    async (
      request: Omit<ChatRequest, 'user' | 'conversation_id'>,
      onEvent?: (event: StreamingEvent) => void
    ): Promise<StreamingEvent | null> => {
      if (!enableStreaming || streamingState.isStreaming) {
        return null;
      }

      const abortController = new AbortController();

      setStreamingState({
        isStreaming: true,
        currentMessage: '',
        error: null,
        abortController,
      });

      try {
        const fullRequest: ChatRequest = {
          ...request,
          user: userId,
          conversation_id: conversationId,
        };

        const result = await difyServiceRef.current!.chat.sendMessageStreamingWithCredits(
          fullRequest,
          (event: StreamingEvent) => {
            // Update current message content
            if (event.event === 'message' && event.answer) {
              setStreamingState((prev) => ({
                ...prev,
                currentMessage: prev.currentMessage + event.answer,
              }));
            }

            // Call custom event handler
            onEvent?.(event);
          },
          abortController,
          {
            deductCredits: async (userId: string, tokensUsed: number, operation: string) => {
              const result = await deductCreditsForTokens(userId, tokensUsed, operation);
              return {
                success: result.success,
                message: result.message,
                creditsDeducted: result.creditsDeducted,
              };
            },
          }
        );

        const finalEvent = result.finalEvent;

        setStreamingState((prev) => ({
          ...prev,
          isStreaming: false,
          abortController: null,
          creditsDeducted: result.creditsDeducted,
        }));

        return finalEvent;
      } catch (error) {
        console.error('Streaming error:', error);
        setStreamingState((prev) => ({
          ...prev,
          isStreaming: false,
          error: error instanceof Error ? error.message : 'Streaming failed',
          abortController: null,
        }));
        return null;
      }
    },
    [userId, conversationId, enableStreaming, streamingState.isStreaming]
  );

  const stopStreaming = useCallback(() => {
    if (streamingState.abortController) {
      streamingState.abortController.abort();
      setStreamingState((prev) => ({
        ...prev,
        isStreaming: false,
        abortController: null,
      }));
    }
  }, [streamingState.abortController]);

  const clearError = useCallback(() => {
    setStreamingState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  return {
    ...streamingState,
    startStreaming,
    stopStreaming,
    clearError,
  };
}
