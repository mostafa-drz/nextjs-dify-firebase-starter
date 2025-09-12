/**
 * @fileoverview Tests for credit server actions
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { deductCredits, addCredits, deductCreditsForTokens, reserveCredits } from '../credits';
import { getFirestoreAdmin } from '@/lib/utils/firebase-admin';

// Mock Firebase Admin
vi.mock('@/lib/utils/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    arrayUnion: vi.fn((value) => value),
  },
}));

describe('Credit Server Actions', () => {
  const mockUserId = 'test-user-123';
  const mockDb = {
    doc: vi.fn(),
    runTransaction: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

    // Setup mock doc to return a proper reference
    mockDb.doc.mockReturnValue({ id: 'test-user-123' });

    // Suppress console.error during tests to keep output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('deductCredits', () => {
    it('should successfully deduct credits when user has sufficient balance', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 100,
              usedCredits: 0,
              creditHistory: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await deductCredits(mockUserId, 20, 'test_operation');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Credits deducted successfully');
      expect(result.remainingCredits).toBe(80);
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'admin.availableCredits': 80,
          'admin.usedCredits': 20,
          'admin.creditHistory': expect.any(Object),
          'admin.updatedAt': 'mock-timestamp',
        })
      );
    });

    it('should reject transaction when user has insufficient credits', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 10,
              usedCredits: 0,
              creditHistory: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await deductCredits(mockUserId, 20, 'test_operation');

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient credits');
      expect(result.remainingCredits).toBe(10);
      expect(mockTransaction.update).not.toHaveBeenCalled();
    });

    it('should handle user not found error', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: false,
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await deductCredits(mockUserId, 20, 'test_operation');

      expect(result.success).toBe(false);
      expect(result.message).toBe('User not found');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.runTransaction.mockRejectedValue(new Error('Database error'));

      const result = await deductCredits(mockUserId, 20, 'test_operation');

      expect(result.success).toBe(false);
      expect(result.message).toBe('Database error');
    });
  });

  describe('addCredits', () => {
    it('should successfully add credits to user account', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 50,
              usedCredits: 20,
              creditHistory: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await addCredits(mockUserId, 30, 'credit_purchase');

      expect(result.success).toBe(true);
      expect(result.message).toBe('Credits added successfully');
      expect(result.newBalance).toBe(80);
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'admin.availableCredits': 80,
          'admin.creditHistory': expect.any(Object),
          'admin.updatedAt': 'mock-timestamp',
        })
      );
    });
  });

  describe('deductCreditsForTokens', () => {
    it('should calculate and deduct credits based on token usage', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 100,
              usedCredits: 0,
              creditHistory: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await deductCreditsForTokens(mockUserId, 2000, 'dify_chat');

      expect(result.success).toBe(true);
      expect(result.creditsDeducted).toBeGreaterThan(0);
      expect(result.remainingCredits).toBeLessThan(100);
    });
  });

  describe('reserveCredits', () => {
    it('should successfully reserve credits for an operation', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 100,
              reservedCredits: 0,
              creditReservations: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await reserveCredits(
        mockUserId,
        20,
        'dify_chat_reservation',
        'reservation-123'
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe('Credits reserved successfully');
      expect(result.remainingCredits).toBe(80);
      expect(mockTransaction.update).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          'admin.availableCredits': 80,
          'admin.reservedCredits': 20,
          'admin.creditReservations': expect.any(Object),
          'admin.updatedAt': 'mock-timestamp',
        })
      );
    });

    it('should reject reservation when user has insufficient credits', async () => {
      const mockTransaction = {
        get: vi.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            admin: {
              availableCredits: 10,
              reservedCredits: 0,
              creditReservations: [],
            },
          }),
        }),
        update: vi.fn(),
      };

      mockDb.runTransaction.mockImplementation(async (callback) => {
        return callback(mockTransaction);
      });

      const result = await reserveCredits(
        mockUserId,
        20,
        'dify_chat_reservation',
        'reservation-123'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Insufficient credits');
      expect(result.remainingCredits).toBe(10);
    });
  });
});
