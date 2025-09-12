/**
 * @fileoverview Tests for authentication server actions
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeNewUser, updateLastLogin } from '../auth';
import { getFirestoreAdmin } from '@/lib/utils/firebase-admin';

// Mock Firebase Admin
vi.mock('@/lib/utils/firebase-admin', () => ({
  getFirestoreAdmin: vi.fn(),
  FieldValue: {
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
  },
}));

describe('Authentication Server Actions', () => {
  const mockUserId = 'test-user-123';
  const mockEmail = 'test@example.com';
  const mockDisplayName = 'Test User';

  beforeEach(() => {
    vi.clearAllMocks();

    // Suppress console.error during tests to keep output clean
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('initializeNewUser', () => {
    it('should successfully initialize a new user with default settings', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ exists: false }),
          set: vi.fn().mockResolvedValue(undefined),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await initializeNewUser(mockUserId, mockEmail, mockDisplayName);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User initialized successfully');
      expect(result.credits).toBe(100); // FREE_TIER_CREDITS
    });

    it('should handle user already exists scenario', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ exists: true }),
          set: vi.fn(),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await initializeNewUser(mockUserId, mockEmail, mockDisplayName);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User already exists');
    });

    it('should initialize user without display name', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockResolvedValue({ exists: false }),
          set: vi.fn().mockResolvedValue(undefined),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await initializeNewUser(mockUserId, mockEmail);

      expect(result.success).toBe(true);
      expect(result.message).toBe('User initialized successfully');
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          get: vi.fn().mockRejectedValue(new Error('Database error')),
          set: vi.fn(),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await initializeNewUser(mockUserId, mockEmail, mockDisplayName);

      expect(result.success).toBe(false);
      expect(result.message).toBe('Failed to initialize user');
    });
  });

  describe('updateLastLogin', () => {
    it('should successfully update user last login timestamp', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          update: vi.fn().mockResolvedValue(undefined),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await updateLastLogin(mockUserId);

      expect(result.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const mockDb = {
        doc: vi.fn().mockReturnValue({
          update: vi.fn().mockRejectedValue(new Error('Database error')),
        }),
      };

      vi.mocked(getFirestoreAdmin).mockReturnValue(mockDb as any);

      const result = await updateLastLogin(mockUserId);

      expect(result.success).toBe(false);
    });
  });
});
