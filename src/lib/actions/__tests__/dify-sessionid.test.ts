/**
 * @fileoverview Tests for sessionId handling in Dify server actions
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { sendDifyMessage } from '../dify';
import { reserveCredits, confirmReservedCredits, releaseReservedCredits } from '../credits';
import { checkUserRateLimitByAction } from '@/lib/utils/simple-rate-limit';
import { validateChatInput, validateConversationId } from '@/lib/utils/input-validation';

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

describe('Dify Server Actions - sessionId Handling', () => {
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
      sanitized: 'Hello, how are you?',
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

  describe('sessionId in metadata', () => {
    it('should NOT include sessionId when conversation_id is undefined (new conversation)', async () => {
      const request = {
        query: 'Hello, how are you?',
        user: mockUserId,
        conversation_id: undefined, // New conversation
        response_mode: 'blocking' as const,
      };

      const result = await sendDifyMessage(mockUserId, request);

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
});
