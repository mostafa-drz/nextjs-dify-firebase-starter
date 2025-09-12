/**
 * @fileoverview Chat service for Dify API - handles message sending and streaming
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { BaseDifyService } from '../base';
import {
  ChatRequest,
  ChatCompletionResponse,
  StreamingEvent,
  DifyApiResponse,
  StopGenerationRequest,
  StopGenerationResponse,
} from '../types';
import { fetchEventSource } from '@microsoft/fetch-event-source';

/**
 * Service for handling chat operations with Dify API
 * Provides both blocking and streaming message capabilities
 */
export class ChatService extends BaseDifyService {
  /**
   * Sends a chat message in blocking mode
   * @param request - Chat request parameters
   * @returns Promise resolving to chat completion response
   * @example
   * ```typescript
   * const response = await chatService.sendMessage({
   *   query: "Hello, how are you?",
   *   user: "user123",
   *   response_mode: "blocking"
   * });
   *
   * if (response.success) {
   *   console.log("Assistant:", response.data?.answer);
   * }
   * ```
   */
  async sendMessage(request: ChatRequest): Promise<DifyApiResponse<ChatCompletionResponse>> {
    try {
      this.validateRequired(request, ['query', 'user']);

      const response = await this.makeRequest('/chat-messages', {
        method: 'POST',
        body: JSON.stringify({
          ...request,
          response_mode: 'blocking', // Force blocking mode for this method
        }),
      });

      const data: ChatCompletionResponse = await response.json();

      return {
        success: true,
        data,
        usage: data.metadata?.usage,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Sends a chat message in streaming mode
   * @param request - Chat request parameters
   * @returns Promise resolving to a ReadableStream of streaming events
   * @example
   * ```typescript
   * const stream = await chatService.sendMessageStreaming({
   *   query: "Tell me a story",
   *   user: "user123",
   *   response_mode: "streaming"
   * });
   *
   * const reader = stream.getReader();
   * while (true) {
   *   const { done, value } = await reader.read();
   *   if (done) break;
   *
   *   const event = JSON.parse(new TextDecoder().decode(value));
   *   console.log("Event:", event.event, "Content:", event.answer);
   * }
   * ```
   */
  async sendMessageStreaming(request: ChatRequest): Promise<ReadableStream<Uint8Array>> {
    try {
      this.validateRequired(request, ['query', 'user']);

      const response = await this.makeRequest('/chat-messages', {
        method: 'POST',
        headers: {
          Accept: 'text/event-stream',
        },
        body: JSON.stringify({
          ...request,
          response_mode: 'streaming', // Force streaming mode for this method
        }),
      });

      if (!response.body) {
        throw new Error('No response body received');
      }

      return response.body;
    } catch (error) {
      // For streaming, we need to create an error stream
      const errorResponse = this.handleError(error);
      const errorText = JSON.stringify(errorResponse);
      return new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(`data: ${errorText}\n\n`));
          controller.close();
        },
      });
    }
  }

  /**
   * Stops a streaming message generation
   * @param taskId - Task ID from the streaming response
   * @returns Promise resolving to stop generation response
   * @example
   * ```typescript
   * const result = await chatService.stopGeneration("task-123");
   * if (result.success) {
   *   console.log("Generation stopped successfully");
   * }
   * ```
   */
  async stopGeneration(taskId: string): Promise<DifyApiResponse<StopGenerationResponse>> {
    try {
      this.validateRequired({ taskId }, ['taskId']);

      const request: StopGenerationRequest = {
        user: this.userId,
      };

      const response = await this.makeRequest(`/chat-messages/${taskId}/stop`, {
        method: 'POST',
        body: JSON.stringify(request),
      });

      const data: StopGenerationResponse = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Parses Server-Sent Events from streaming response
   * @param stream - ReadableStream from sendMessageStreaming
   * @returns AsyncGenerator yielding parsed streaming events
   * @example
   * ```typescript
   * const stream = await chatService.sendMessageStreaming(request);
   * for await (const event of chatService.parseStreamingEvents(stream)) {
   *   switch (event.event) {
   *     case 'message':
   *       console.log('Partial:', event.answer);
   *       break;
   *     case 'message_end':
   *       console.log('Complete!');
   *       break;
   *   }
   * }
   * ```
   */
  async *parseStreamingEvents(stream: ReadableStream<Uint8Array>): AsyncGenerator<StreamingEvent> {
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep the last incomplete line

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = line.slice(6); // Remove 'data: ' prefix
              if (eventData.trim() === '') continue;

              const event: StreamingEvent = JSON.parse(eventData);
              yield event;
            } catch (parseError) {
              console.warn('Failed to parse streaming event:', parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Sends a message with automatic streaming event handling
   * @param request - Chat request parameters
   * @param onEvent - Callback function for each streaming event
   * @returns Promise resolving to the final message end event
   * @example
   * ```typescript
   * const finalEvent = await chatService.sendMessageWithCallbacks(
   *   { query: "Hello", user: "user123" },
   *   (event) => {
   *     if (event.event === 'message') {
   *       console.log('Streaming:', event.answer);
   *     }
   *   }
   * );
   * ```
   */
  async sendMessageWithCallbacks(
    request: ChatRequest,
    onEvent: (event: StreamingEvent) => void
  ): Promise<StreamingEvent | null> {
    try {
      const stream = await this.sendMessageStreaming(request);
      let finalEvent: StreamingEvent | null = null;

      for await (const event of this.parseStreamingEvents(stream)) {
        onEvent(event);

        if (event.event === 'message_end' || event.event === 'error') {
          finalEvent = event;
        }
      }

      return finalEvent;
    } catch (error) {
      console.error('Error in sendMessageWithCallbacks:', error);
      return null;
    }
  }

  /**
   * Production-ready streaming with retry logic and proper error handling
   * @param request - Chat request parameters
   * @param onEvent - Callback function for each streaming event
   * @param abortController - AbortController for cleanup
   * @returns Promise resolving to the final message end event
   * @example
   * ```typescript
   * const abortController = new AbortController();
   * const finalEvent = await chatService.sendMessageStreamingProduction(
   *   { query: "Hello", user: "user123" },
   *   (event) => console.log('Event:', event),
   *   abortController
   * );
   * ```
   */
  async sendMessageStreamingProduction(
    request: ChatRequest,
    onEvent: (event: StreamingEvent) => void,
    abortController: AbortController
  ): Promise<StreamingEvent | null> {
    try {
      this.validateRequired(request, ['query', 'user']);

      const url = `${this.baseUrl}/chat-messages`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'text/event-stream',
      };

      let finalEvent: StreamingEvent | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      await fetchEventSource(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...request,
          response_mode: 'streaming',
        }),
        signal: abortController.signal,

        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            console.log('Streaming connection opened');
            return;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Client error - don't retry
            throw new Error(`Client error: ${response.status}`);
          } else {
            // Server error or rate limit - retry
            throw new Error(`Server error: ${response.status}`);
          }
        },

        onmessage: (event) => {
          try {
            if (event.data.trim() === '') return;

            const streamingEvent: StreamingEvent = JSON.parse(event.data);
            onEvent(streamingEvent);

            if (streamingEvent.event === 'message_end' || streamingEvent.event === 'error') {
              finalEvent = streamingEvent;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming event:', parseError);
          }
        },

        onclose: () => {
          console.log('Streaming connection closed');
        },

        onerror: (error) => {
          console.error('Streaming error:', error);
          retryCount++;

          if (retryCount >= maxRetries) {
            console.error('Max retries reached, stopping stream');
            throw error;
          }

          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
        },
      });

      return finalEvent;
    } catch (error) {
      console.error('Error in sendMessageStreamingProduction:', error);
      return null;
    }
  }

  /**
   * Streaming with simple credit management - deduct only on success
   * @param request - Chat request parameters
   * @param onEvent - Callback function for each streaming event
   * @param abortController - AbortController for cleanup
   * @param creditManager - Credit management functions
   * @returns Promise resolving to the final message end event with credit info
   * @example
   * ```typescript
   * const abortController = new AbortController();
   * const finalEvent = await chatService.sendMessageStreamingWithCredits(
   *   { query: "Hello", user: "user123" },
   *   (event) => console.log('Event:', event),
   *   abortController,
   *   { deductCredits }
   * );
   * ```
   */
  async sendMessageStreamingWithCredits(
    request: ChatRequest,
    onEvent: (event: StreamingEvent) => void,
    abortController: AbortController,
    creditManager: {
      deductCredits: (
        userId: string,
        tokensUsed: number,
        operation: string
      ) => Promise<{ success: boolean; message: string; creditsDeducted?: number }>;
    }
  ): Promise<{ finalEvent: StreamingEvent | null; creditsDeducted?: number }> {
    try {
      this.validateRequired(request, ['query', 'user']);

      const url = `${this.baseUrl}/chat-messages`;
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        Accept: 'text/event-stream',
      };

      let finalEvent: StreamingEvent | null = null;
      let retryCount = 0;
      const maxRetries = 3;

      await fetchEventSource(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          ...request,
          response_mode: 'streaming',
        }),
        signal: abortController.signal,

        onopen: async (response) => {
          if (response.ok && response.headers.get('content-type')?.includes('text/event-stream')) {
            console.log('Streaming connection opened');
            return;
          } else if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Client error - don't retry
            throw new Error(`Client error: ${response.status}`);
          } else {
            // Server error or rate limit - retry
            throw new Error(`Server error: ${response.status}`);
          }
        },

        onmessage: (event) => {
          try {
            if (event.data.trim() === '') return;

            const streamingEvent: StreamingEvent = JSON.parse(event.data);
            onEvent(streamingEvent);

            if (streamingEvent.event === 'message_end' || streamingEvent.event === 'error') {
              finalEvent = streamingEvent;
            }
          } catch (parseError) {
            console.warn('Failed to parse streaming event:', parseError);
          }
        },

        onclose: () => {
          console.log('Streaming connection closed');
        },

        onerror: (error) => {
          console.error('Streaming error:', error);
          retryCount++;

          if (retryCount >= maxRetries) {
            console.error('Max retries reached, stopping stream');
            throw error;
          }

          // Exponential backoff: 1s, 2s, 4s
          return Math.min(1000 * Math.pow(2, retryCount - 1), 10000);
        },
      });

      // Deduct credits only on successful completion
      if (finalEvent && (finalEvent as StreamingEvent).event === 'message_end') {
        const messageEndEvent = finalEvent as import('../types').MessageEndStreamingEvent;
        if (messageEndEvent.metadata?.usage?.total_tokens) {
          const deductResult = await creditManager.deductCredits(
            request.user,
            messageEndEvent.metadata.usage.total_tokens,
            'dify_streaming_complete'
          );

          if (deductResult.success) {
            return { finalEvent, creditsDeducted: deductResult.creditsDeducted };
          } else {
            console.error('Credit deduction failed:', deductResult.message);
            // Still return the event, but log the credit issue
            return { finalEvent };
          }
        }
      }

      // No token usage info, no credits deducted
      return { finalEvent };
    } catch (error) {
      console.error('Error in sendMessageStreamingWithCredits:', error);
      // No credits deducted on error - generous policy
      return { finalEvent: null };
    }
  }
}
