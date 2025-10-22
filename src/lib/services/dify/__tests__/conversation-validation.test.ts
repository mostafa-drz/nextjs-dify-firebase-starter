/**
 * @fileoverview Tests for ConversationService validation - specifically userId checks
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConversationService } from '../conversation';

// Mock the base service
vi.mock('../base', () => ({
  BaseDifyService: class MockBaseDifyService {
    constructor(config: any) {
      this.apiKey = config.apiKey;
      this.userId = config.userId;
      this.baseUrl = config.baseUrl || 'https://api.dify.ai/v1';
      this.timeout = config.timeout || 30000;
    }

    makeRequest = vi.fn();
    validateRequired = vi.fn();
    handleError = vi.fn((error) => ({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }));

    apiKey: string;
    userId: string;
    baseUrl: string;
    timeout: number;
  },
}));

describe('ConversationService Validation', () => {
  let conversationService: ConversationService;
  let mockMakeRequest: ReturnType<typeof vi.fn>;
  let mockValidateRequired: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should fail when userId is undefined', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: undefined as any, // This was our bug!
      });

      const result = await conversationService.getConversations();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_USER_ID');
      expect(result.error?.message).toBe('User ID is required');
      expect(result.error?.status).toBe(400);
    });

    it('should fail when userId is null', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: null as any,
      });

      const result = await conversationService.getConversations();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_USER_ID');
      expect(result.error?.message).toBe('User ID is required');
    });

    it('should fail when userId is empty string', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: '',
      });

      const result = await conversationService.getConversations();

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_USER_ID');
      expect(result.error?.message).toBe('User ID is required');
    });

    it('should succeed when userId is valid', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: 'valid-user-123',
      });

      mockMakeRequest = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ data: [] }),
      });
      (conversationService as any).makeRequest = mockMakeRequest;

      const result = await conversationService.getConversations();

      expect(result.success).toBe(true);
      expect(mockMakeRequest).toHaveBeenCalled();
    });
  });

  describe('getConversationHistory', () => {
    it('should fail when userId is undefined', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: undefined as any,
      });

      const result = await conversationService.getConversationHistory('conv-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_USER_ID');
      expect(result.error?.message).toBe('User ID is required');
      expect(result.error?.status).toBe(400);
    });

    it('should fail when userId is null', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: null as any,
      });

      const result = await conversationService.getConversationHistory('conv-123');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('INVALID_USER_ID');
    });

    it('should validate conversationId when userId is valid', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: 'valid-user-123',
      });

      mockValidateRequired = vi.fn();
      (conversationService as any).validateRequired = mockValidateRequired;

      await conversationService.getConversationHistory('conv-123');

      expect(mockValidateRequired).toHaveBeenCalledWith({ conversationId: 'conv-123' }, [
        'conversationId',
      ]);
    });

    it('should succeed when both userId and conversationId are valid', async () => {
      conversationService = new ConversationService({
        apiKey: 'app-test-api-key',
        userId: 'valid-user-123',
      });

      mockMakeRequest = vi.fn().mockResolvedValue({
        json: vi.fn().mockResolvedValue({ data: [] }),
      });
      (conversationService as any).makeRequest = mockMakeRequest;

      const result = await conversationService.getConversationHistory('conv-123');

      expect(result.success).toBe(true);
      expect(mockMakeRequest).toHaveBeenCalled();
    });
  });
});
