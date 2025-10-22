/**
 * @fileoverview Comprehensive tests for Dify API server actions
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendDifyMessage, getDifyConversationMessages } from '../dify';
import { reserveCredits, confirmReservedCredits, releaseReservedCredits } from '../credits';
import { checkUserRateLimitByAction } from '@/lib/utils/simple-rate-limit';
import { validateChatInput, validateConversationId } from '@/lib/utils/input-validation';
import { DifyChatRequest } from '@/types/dify';

// Mock dependencies
vi.mock('../credits', () => ({
  reserveCredits: vi.fn(),
  confirmReservedCredits: vi.fn(),
  releaseReservedCredits: vi.fn(),
}));

vi.mock('@/lib/utils/simple-rate-limit', () => ({
  checkUserRateLimitByAction: vi.fn(),
}));

vi.mock('@/lib/utils/input-validation', () => ({
  validateChatInput: vi.fn(),
  validateConversationId: vi.fn(),
}));

vi.mock('@/lib/utils/credits', () => ({
  calculateCreditsFromTokens: vi.fn((tokens) => Math.ceil(tokens / 1000)),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Capture console.log to verify payload construction
const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

describe('Dify Server Actions', () => {
  const mockUserId = 'test-user-123';
  const mockApiKey = 'test-api-key-12345';

  beforeEach(() => {
    vi.clearAllMocks();

    // Set up environment variables
    process.env.DIFY_API_KEY = mockApiKey;
    process.env.DIFY_BASE_URL = 'https://api.dify.ai/v1';

    // Mock successful rate limit check
    vi.mocked(checkUserRateLimitByAction).mockResolvedValue({
      allowed: true,
      remaining: 100,
      resetTime: Date.now() + 3600000,
    });

    // Mock successful input validation
    vi.mocked(validateChatInput).mockReturnValue({
      valid: true,
      sanitized: 'test query',
      error: undefined,
    });

    vi.mocked(validateConversationId).mockReturnValue({
      valid: true,
      sanitized: 'conv-123',
      error: undefined,
    });

    // Mock successful credit operations
    vi.mocked(reserveCredits).mockResolvedValue({
      success: true,
      message: 'Credits reserved successfully',
      remainingCredits: 80,
    });

    vi.mocked(confirmReservedCredits).mockResolvedValue({
      success: true,
      message: 'Credits confirmed successfully',
      remainingCredits: 75,
      creditsDeducted: 5,
    });

    vi.mocked(releaseReservedCredits).mockResolvedValue({
      success: true,
      message: 'Credits released successfully',
      remainingCredits: 85,
    });

    // Mock successful Dify API response
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        message_id: 'msg-123',
        conversation_id: 'conv-456',
        answer: 'Hello! How can I help you today?',
        metadata: {
          usage: {
            total_tokens: 150,
          },
        },
      }),
    } as Response);
  });

  describe('API Payload Construction', () => {
    describe('Inputs Parameter', () => {
      it('should always include inputs parameter, even when empty', async () => {
        const request: DifyChatRequest = {
          query: 'Hello world',
          user: mockUserId,
        };

        await sendDifyMessage(mockUserId, request);

        // Check that console.log was called with the payload
        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.inputs).toEqual({});
      });

      it('should include user-provided inputs when provided', async () => {
        const request: DifyChatRequest = {
          query: 'Hello world',
          user: mockUserId,
          inputs: {
            language: 'en',
            timezone: 'UTC',
            custom_field: 'test_value',
          },
        };

        await sendDifyMessage(mockUserId, request);

        // Check that console.log was called with the payload containing inputs
        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.inputs).toEqual({
          language: 'en',
          timezone: 'UTC',
          custom_field: 'test_value',
        });
      });

      it('should merge user inputs with default empty object', async () => {
        const request: DifyChatRequest = {
          query: 'Hello world',
          user: mockUserId,
          inputs: {
            user_preference: 'vegetarian',
          },
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.inputs).toEqual({
          user_preference: 'vegetarian',
        });
      });
    });

    describe('Files Parameter', () => {
      it('should not include files parameter when not provided', async () => {
        const request: DifyChatRequest = {
          query: 'Hello world',
          user: mockUserId,
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload).not.toHaveProperty('files');
      });

      it('should not include files parameter when empty array', async () => {
        const request: DifyChatRequest = {
          query: 'Hello world',
          user: mockUserId,
          files: [],
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload).not.toHaveProperty('files');
      });

      it('should include files parameter when files are provided', async () => {
        const request: DifyChatRequest = {
          query: 'Analyze this image',
          user: mockUserId,
          files: [
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: 'file-123',
            },
          ],
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.files).toEqual([
          {
            type: 'image',
            transfer_method: 'local_file',
            upload_file_id: 'file-123',
          },
        ]);
      });

      it('should include multiple files when provided', async () => {
        const request: DifyChatRequest = {
          query: 'Compare these images',
          user: mockUserId,
          files: [
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: 'file-1',
            },
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: 'file-2',
            },
          ],
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.files).toHaveLength(2);
        expect(payload.files[0].upload_file_id).toBe('file-1');
        expect(payload.files[1].upload_file_id).toBe('file-2');
      });
    });

    describe('Required Parameters', () => {
      it('should always include required parameters', async () => {
        const request: DifyChatRequest = {
          query: 'Test query',
          user: mockUserId,
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);

        // Required parameters
        expect(payload.query).toBe('test query'); // sanitized
        expect(payload.user).toBe(mockUserId);
        expect(payload.inputs).toBeDefined();
        expect(payload.response_mode).toBe('blocking');
      });

      it('should include conversation_id when provided', async () => {
        const request: DifyChatRequest = {
          query: 'Continue conversation',
          user: mockUserId,
          conversation_id: 'conv-123',
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.conversation_id).toBe('conv-123');
      });

      it('should not include conversation_id when not provided', async () => {
        const request: DifyChatRequest = {
          query: 'Start new conversation',
          user: mockUserId,
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);
        expect(payload.conversation_id).toBeUndefined();
      });
    });

    describe('Complete Payload Examples', () => {
      it('should construct correct payload for text-only conversation', async () => {
        const request: DifyChatRequest = {
          query: 'Hello, how are you?',
          user: mockUserId,
          inputs: {
            language: 'en',
            user_id: mockUserId,
          },
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);

        expect(payload).toEqual({
          query: 'test query',
          user: mockUserId,
          inputs: {
            language: 'en',
            user_id: mockUserId,
          },
          conversation_id: undefined,
          response_mode: 'blocking',
          // files should not be present
        });
        expect(payload).not.toHaveProperty('files');
      });

      it('should construct correct payload for multimodal conversation', async () => {
        const request: DifyChatRequest = {
          query: 'What can I cook with these ingredients?',
          user: mockUserId,
          inputs: {
            language: 'en',
            user_id: mockUserId,
          },
          files: [
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: 'recipe-image-123',
            },
          ],
        };

        await sendDifyMessage(mockUserId, request);

        const logCall = consoleSpy.mock.calls.find(
          (call) => call[0] === 'Dify API Request Payload:'
        );
        expect(logCall).toBeDefined();

        const payload = JSON.parse(logCall![1] as string);

        expect(payload).toEqual({
          query: 'test query',
          user: mockUserId,
          inputs: {
            language: 'en',
            user_id: mockUserId,
          },
          conversation_id: undefined,
          response_mode: 'blocking',
          files: [
            {
              type: 'image',
              transfer_method: 'local_file',
              upload_file_id: 'recipe-image-123',
            },
          ],
        });
      });
    });
  });

  describe('Session ID Handling', () => {
    it('should NOT include sessionId when conversation_id is undefined (new conversation)', async () => {
      const request = {
        query: 'Hello, how are you?',
        user: mockUserId,
        conversation_id: undefined, // New conversation
        response_mode: 'blocking' as const,
      };

      await sendDifyMessage(mockUserId, request);

      // Verify reserveCredits was called without sessionId
      expect(reserveCredits).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Number),
        'dify_chat_reservation',
        expect.any(String),
        expect.objectContaining({
          difyAppToken: expect.any(String),
          estimatedTokens: 50,
          // sessionId should NOT be present
        })
      );

      // Check that sessionId is not in the metadata
      const reserveCall = vi.mocked(reserveCredits).mock.calls[0];
      const metadata = reserveCall[4] as Record<string, unknown>;
      expect(metadata.sessionId).toBeUndefined();
    });

    it('should include sessionId when conversation_id is defined (existing conversation)', async () => {
      const request = {
        query: 'Hello, how are you?',
        user: mockUserId,
        conversation_id: 'conv-123', // Existing conversation
        response_mode: 'blocking' as const,
      };

      await sendDifyMessage(mockUserId, request);

      // Verify reserveCredits was called with sessionId
      expect(reserveCredits).toHaveBeenCalledWith(
        mockUserId,
        expect.any(Number),
        'dify_chat_reservation',
        expect.any(String),
        expect.objectContaining({
          difyAppToken: expect.any(String),
          sessionId: 'conv-123', // sessionId should be present
          estimatedTokens: 50,
        })
      );

      // Check that sessionId is in the metadata
      const reserveCall = vi.mocked(reserveCredits).mock.calls[0];
      const metadata = reserveCall[4] as Record<string, unknown>;
      expect(metadata.sessionId).toBe('conv-123');
    });

    it('should NOT include sessionId when conversation_id is empty string', async () => {
      const request = {
        query: 'Hello, how are you?',
        user: mockUserId,
        conversation_id: '', // Empty string should be treated as undefined
        response_mode: 'blocking' as const,
      };

      await sendDifyMessage(mockUserId, request);

      // Verify reserveCredits was called without sessionId
      const reserveCall = vi.mocked(reserveCredits).mock.calls[0];
      const metadata = reserveCall[4] as Record<string, unknown>;
      expect(metadata.sessionId).toBeUndefined();
    });

    it('should NOT include sessionId when conversation_id is null', async () => {
      const request = {
        query: 'Hello, how are you?',
        user: mockUserId,
        conversation_id: null as any, // null should be treated as undefined
        response_mode: 'blocking' as const,
      };

      await sendDifyMessage(mockUserId, request);

      // Verify reserveCredits was called without sessionId
      const reserveCall = vi.mocked(reserveCredits).mock.calls[0];
      const metadata = reserveCall[4] as Record<string, unknown>;
      expect(metadata.sessionId).toBeUndefined();
    });
  });

  describe('getDifyConversationMessages', () => {
    it('should successfully fetch conversation messages using correct endpoint', async () => {
      const mockUserId = 'test-user-123';
      const mockConversationId = 'conv-456';

      const result = await getDifyConversationMessages(mockUserId, mockConversationId, 20);

      // Verify successful response (using MSW handler data)
      expect(result.success).toBe(true);
      expect(result.data?.data).toBeDefined();
      expect(Array.isArray(result.data?.data)).toBe(true);

      // Verify the response structure matches expected format
      expect(result.data).toHaveProperty('has_more');
      expect(result.data).toHaveProperty('limit');
    });
  });
});
