'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useDifyMessages, useDifyAppInfo, useDifyMutations } from './useDify';
import { DifyMessage } from '@/types/dify';

/**
 * Custom hook to manage chat messages and consolidate useEffect logic
 * Replaces multiple useEffect hooks in DifyChat component
 */

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokensUsed?: number;
  creditsDeducted?: number;
}

interface UseChatMessagesProps {
  conversationId?: string;
  userId: string;
  welcomeMessage?: string;
}

export function useChatMessages({ conversationId, userId, welcomeMessage }: UseChatMessagesProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messagesCleared, setMessagesCleared] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load conversation messages if conversationId is provided
  const {
    data: conversationData,
    isLoading: messagesLoading,
    error: messagesError,
    addMessage,
  } = useDifyMessages(userId, conversationId);

  // React Query hooks for app info and mutations
  const { suggestedQuestions, openingStatement } = useDifyAppInfo();

  const { sendMessage, sendMessageMutation } = useDifyMutations(userId);

  // Consolidated effect for welcome messages and conversation loading
  useEffect(() => {
    // Don't add welcome messages if user has explicitly cleared messages
    if (messagesCleared) {
      return;
    }

    // Priority: custom welcome message > opening statement > conversation data
    if (welcomeMessage && messages.length === 0) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      return;
    }

    if (openingStatement && messages.length === 0 && !welcomeMessage) {
      const welcomeMsg: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: openingStatement,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
      return;
    }

    // Load conversation messages only when no welcome message or opening statement
    if (!welcomeMessage && !openingStatement && conversationData && conversationData.length > 0) {
      const loadedMessages: ChatMessage[] = conversationData.map((msg: unknown) => {
        const message = msg as {
          id: string;
          role: string;
          content: string;
          created_at: number;
          metadata?: {
            usage?: {
              total_tokens: number;
              credits_deducted?: number;
            };
          };
        };

        return {
          id: message.id,
          role: message.role === 'user' ? 'user' : 'assistant',
          content: message.content,
          timestamp: new Date(message.created_at * 1000),
          tokensUsed: message.metadata?.usage?.total_tokens,
          creditsDeducted: message.metadata?.usage?.credits_deducted,
        };
      });

      setMessages(loadedMessages);
    } else if (
      conversationId &&
      !messagesLoading &&
      !messagesError &&
      !welcomeMessage &&
      !openingStatement
    ) {
      // Clear messages if we're switching to a conversation with no messages
      setMessages([]);
    }
  }, [
    conversationData,
    conversationId,
    messagesLoading,
    messagesError,
    welcomeMessage,
    openingStatement,
    messages.length,
    messagesCleared,
  ]);

  // Auto-scroll effect
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Message handling functions
  const addUserMessage = useCallback(
    (content: string) => {
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Convert ChatMessage to DifyMessage for the API
      const difyMessage: DifyMessage = {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        created_at: userMessage.timestamp.toISOString(),
      };
      addMessage(difyMessage);
      return userMessage;
    },
    [addMessage]
  );

  const addAssistantMessage = useCallback(
    (messageData: {
      id: string;
      content: string;
      tokensUsed?: number;
      creditsDeducted?: number;
    }) => {
      const assistantMessage: ChatMessage = {
        id: messageData.id,
        role: 'assistant',
        content: messageData.content,
        timestamp: new Date(),
        tokensUsed: messageData.tokensUsed,
        creditsDeducted: messageData.creditsDeducted,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Convert ChatMessage to DifyMessage for the API
      const difyMessage: DifyMessage = {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        created_at: assistantMessage.timestamp.toISOString(),
      };
      addMessage(difyMessage);
      return assistantMessage;
    },
    [addMessage]
  );

  const removeMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setMessagesCleared(true);
  }, []);

  return {
    messages,
    setMessages,
    scrollAreaRef,
    suggestedQuestions,
    openingStatement,
    sendMessage,
    sendMessageMutation,
    addUserMessage,
    addAssistantMessage,
    removeMessage,
    clearMessages,
    messagesLoading,
    messagesError,
  };
}
