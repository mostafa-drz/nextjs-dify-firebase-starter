/**
 * @fileoverview Tests for simple rate limiting utility
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  checkUserRateLimit,
  checkUserRateLimitByAction,
  RATE_LIMIT_CONFIGS,
} from '../simple-rate-limit';
import { getFirestoreAdmin } from '@/lib/utils/firebase-admin';

// Mock Firebase Admin
vi.mock('@/lib/utils/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
  },
}));

describe('Simple Rate Limiting', () => {
  const mockUserId = 'test-user-123';
  const mockConfig = {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    action: 'test_action',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Suppress console.error during tests to keep output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkUserRateLimit', () => {
    it('should allow request when no rate limit exists', async () => {
      const mockDoc = {
        exists: () => false,
        data: () => null,
      };

      const mockDb = {
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockDoc),
            set: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimit(mockUserId, mockConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // maxRequests - 1
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });

    it('should allow request when rate limit window has expired', async () => {
      const expiredTime = Date.now() - 1000; // 1 second ago
      const mockDoc = {
        exists: () => true,
        data: () => ({
          count: 3,
          resetTime: expiredTime,
        }),
      };

      const mockDb = {
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockDoc),
            set: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimit(mockUserId, mockConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4); // maxRequests - 1
    });

    it('should deny request when rate limit exceeded', async () => {
      const futureTime = Date.now() + 30000; // 30 seconds from now
      const mockDoc = {
        exists: () => true,
        data: () => ({
          count: 5, // Already at max
          resetTime: futureTime,
        }),
      };

      const mockDb = {
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockDoc),
            update: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimit(mockUserId, mockConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
      expect(result.error).toContain('Rate limit exceeded');
    });

    it('should increment count for valid request', async () => {
      const futureTime = Date.now() + 30000; // 30 seconds from now
      const mockDoc = {
        exists: () => true,
        data: () => ({
          count: 2,
          resetTime: futureTime,
        }),
      };

      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      const mockDb = {
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockDoc),
            update: mockUpdate,
          })),
        })),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimit(mockUserId, mockConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2); // maxRequests - (count + 1)
      expect(mockUpdate).toHaveBeenCalledWith({
        count: 3,
        updatedAt: 'mock-timestamp',
      });
    });
  });

  describe('checkUserRateLimitByAction', () => {
    it('should use predefined configuration for chat_message', async () => {
      const mockDoc = {
        exists: () => false,
        data: () => null,
      };

      const mockDb = {
        collection: vi.fn(() => ({
          doc: vi.fn(() => ({
            get: vi.fn().mockResolvedValue(mockDoc),
            set: vi.fn().mockResolvedValue(undefined),
          })),
        })),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimitByAction(mockUserId, 'chat_message');

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(RATE_LIMIT_CONFIGS.chat_message.maxRequests - 1);
    });
  });

  describe('Error Handling', () => {
    it('should allow request when rate limit check fails', async () => {
      const mockDb = {
        collection: vi.fn(() => {
          throw new Error('Database error');
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await checkUserRateLimit(mockUserId, mockConfig);

      // Should allow request on error to prevent breaking the app
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(mockConfig.maxRequests);
    });
  });
});
