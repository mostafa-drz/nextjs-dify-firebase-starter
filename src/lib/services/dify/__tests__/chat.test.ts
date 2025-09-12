/**
 * @fileoverview Tests for Dify chat service
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChatService } from '../chat';
import { mockDifyChatResponse } from '@/__tests__/fixtures/dify-responses';

// Mock fetchEventSource
vi.mock('@microsoft/fetch-event-source', () => ({
  fetchEventSource: vi.fn(),
}));

// Mock the base service
vi.mock('../base', () => ({
  BaseDifyService: class MockBaseDifyService {
    makeRequest = vi.fn();
    validateRequired = vi.fn();
    handleError = vi.fn((error) => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
    config = {
      apiKey: 'app-test-api-key',
      userId: 'test-user-123',
      baseUrl: 'https://api.dify.ai/v1',
    };
  },
}));

describe('ChatService', () => {
  let chatService: ChatService;
  let mockMakeRequest: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock instance
    chatService = new ChatService({
      apiKey: 'app-test-api-key',
      userId: 'test-user-123',
      baseUrl: 'https://api.dify.ai/v1',
    });

    // Get the mocked makeRequest function
    mockMakeRequest = (chatService as any).makeRequest;
  });

  describe('sendMessage', () => {
    const mockRequest = {
      query: 'Hello, how are you?',
      user: 'test-user-123',
      response_mode: 'blocking' as const,
    };

    it('should send message successfully in blocking mode', async () => {
      mockMakeRequest.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockDifyChatResponse),
      });

      const result = await chatService.sendMessage(mockRequest);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDifyChatResponse);
      expect(mockMakeRequest).toHaveBeenCalledWith('/chat-messages', {
        method: 'POST',
        body: JSON.stringify({
          ...mockRequest,
          response_mode: 'blocking',
        }),
      });
    });

    it('should handle API errors gracefully', async () => {
      mockMakeRequest.mockRejectedValue(new Error('API Error'));

      const result = await chatService.sendMessage(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should validate required fields', async () => {
      const invalidRequest = {
        query: '',
        user: 'test-user-123',
        response_mode: 'blocking' as const,
      };

      await chatService.sendMessage(invalidRequest);

      expect((chatService as any).validateRequired).toHaveBeenCalledWith(invalidRequest, [
        'query',
        'user',
      ]);
    });

    it('should handle network errors', async () => {
      mockMakeRequest.mockRejectedValue(new Error('Network error'));

      const result = await chatService.sendMessage(mockRequest);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
    });
  });

  describe('sendMessageStreaming', () => {
    const mockRequest = {
      query: 'Hello, how are you?',
      user: 'test-user-123',
      response_mode: 'streaming' as const,
    };

    it('should handle streaming message successfully', async () => {
      const mockStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            new TextEncoder().encode('data: {"event": "message", "answer": "Hello!"}\n\n')
          );
          controller.close();
        },
      });

      mockMakeRequest.mockResolvedValue(mockStream);

      const result = await chatService.sendMessageStreaming(mockRequest);

      expect(result).toBeInstanceOf(ReadableStream);
      expect(mockMakeRequest).toHaveBeenCalledWith('/chat-messages', {
        method: 'POST',
        body: JSON.stringify(mockRequest),
        headers: {
          Accept: 'text/event-stream',
        },
      });
    });

    it('should handle streaming errors', async () => {
      mockMakeRequest.mockRejectedValue(new Error('Streaming error'));

      const result = await chatService.sendMessageStreaming(mockRequest);

      expect(result).toBeInstanceOf(ReadableStream);
      // The method returns an error stream instead of throwing
      const reader = result.getReader();
      const { value } = await reader.read();
      const errorText = new TextDecoder().decode(value!);
      expect(errorText).toContain('Streaming error');
    });
  });

  describe('stopGeneration', () => {
    const mockTaskId = 'task-123';

    it('should stop message generation successfully', async () => {
      mockMakeRequest.mockResolvedValue({
        json: vi.fn().mockResolvedValue({ result: 'stopped' }),
      });

      const result = await chatService.stopGeneration(mockTaskId);

      expect(result.success).toBe(true);
      expect(mockMakeRequest).toHaveBeenCalledWith(`/chat-messages/${mockTaskId}/stop`, {
        method: 'POST',
        body: '{}',
      });
    });

    it('should handle stop generation errors', async () => {
      mockMakeRequest.mockRejectedValue(new Error('Task not found'));

      const result = await chatService.stopGeneration(mockTaskId);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Task not found');
    });
  });
});
