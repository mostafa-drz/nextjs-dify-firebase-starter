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
}
