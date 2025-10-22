/**
 * @fileoverview Tests for useCredits hook
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCredits } from '../useCredits';
import {
  createMockAuthContext,
  createMockUnauthContext,
  createMockLoadingAuthContext,
} from '@/__tests__/utils/auth';

// Mock the UserProvider
vi.mock('@/components/auth/UserProvider', () => ({
  useUser: vi.fn(),
}));

// Mock the credit actions
vi.mock('@/lib/actions/credits', () => ({
  deductCreditsForTokens: vi.fn(),
  addCredits: vi.fn(),
}));

// Mock the credit utilities
vi.mock('@/lib/utils/credits', () => ({
  calculateCreditsFromTokens: vi.fn(),
  hasEnoughCredits: vi.fn(),
  shouldWarnLowCredits: vi.fn(),
}));

describe('useCredits', () => {
  const mockUser = {
    uid: 'test-user-123',
    email: 'test@example.com',
    createdAt: { toDate: () => new Date() } as any, // Mock Timestamp
    admin: {
      availableCredits: 100,
      usedCredits: 0,
      creditHistory: [],
      subscription: {
        plan: 'free' as const,
        creditsPerMonth: 1000,
        expiresAt: null,
      },
      limits: {
        dailyRequests: 100,
        maxTokensPerRequest: 4000,
        maxConcurrentSessions: 3,
      },
      isBlocked: false,
      updatedAt: { toDate: () => new Date() } as any,
    },
  };

  const mockAuthContext = createMockAuthContext(mockUser);

  beforeEach(async () => {
    vi.clearAllMocks();

    // Setup default mocks
    const { useUser } = await import('@/components/auth/UserProvider');
    vi.mocked(useUser).mockReturnValue(mockAuthContext);

    const { deductCreditsForTokens, addCredits } = await import('@/lib/actions/credits');
    vi.mocked(deductCreditsForTokens).mockResolvedValue({
      success: true,
      message: 'Credits deducted successfully',
      creditsDeducted: 5,
      remainingCredits: 95,
    });
    vi.mocked(addCredits).mockResolvedValue({
      success: true,
      message: 'Credits added successfully',
      newBalance: 150,
    });

    const { calculateCreditsFromTokens, hasEnoughCredits, shouldWarnLowCredits } = await import(
      '@/lib/utils/credits'
    );
    vi.mocked(calculateCreditsFromTokens).mockReturnValue(5);
    vi.mocked(hasEnoughCredits).mockReturnValue(true);
    vi.mocked(shouldWarnLowCredits).mockReturnValue(false);
  });

  describe('deductForTokens', () => {
    it('should deduct credits for tokens successfully', async () => {
      const { result } = renderHook(() => useCredits());

      let deductResult: any;
      await act(async () => {
        deductResult = await result.current.deductForTokens(1000, 'chat_message');
      });

      expect(deductResult.success).toBe(true);
      expect(deductResult.creditsDeducted).toBe(5);
      expect(deductResult.remainingCredits).toBe(95);
    });

    it('should handle unauthenticated user', async () => {
      const { useUser } = await import('@/components/auth/UserProvider');
      vi.mocked(useUser).mockReturnValue(createMockUnauthContext());

      const { result } = renderHook(() => useCredits());

      let deductResult: any;
      await act(async () => {
        deductResult = await result.current.deductForTokens(1000, 'chat_message');
      });

      expect(deductResult.success).toBe(false);
      expect(deductResult.message).toBe('User not authenticated');
    });

    it('should handle credit deduction errors', async () => {
      const { deductCreditsForTokens } = await import('@/lib/actions/credits');
      vi.mocked(deductCreditsForTokens).mockRejectedValue(new Error('Database error'));

      const { result } = renderHook(() => useCredits());

      let deductResult: any;
      await act(async () => {
        deductResult = await result.current.deductForTokens(1000, 'chat_message');
      });

      expect(deductResult.success).toBe(false);
      expect(deductResult.message).toBe('Database error');
    });

    it('should set processing state during operation', async () => {
      const { result } = renderHook(() => useCredits());

      expect(result.current.isProcessing).toBe(false);

      act(() => {
        result.current.deductForTokens(1000, 'chat_message');
      });

      expect(result.current.isProcessing).toBe(true);

      await act(async () => {
        // Wait for the operation to complete
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(result.current.isProcessing).toBe(false);
    });
  });

  describe('addCreditsToUser', () => {
    it('should add credits successfully', async () => {
      const { result } = renderHook(() => useCredits());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.addCreditsToUser(50, 'credit_purchase');
      });

      expect(addResult.success).toBe(true);
      expect(addResult.newBalance).toBe(150);
    });

    it('should handle unauthenticated user', async () => {
      const { useUser } = await import('@/components/auth/UserProvider');
      vi.mocked(useUser).mockReturnValue(createMockUnauthContext());

      const { result } = renderHook(() => useCredits());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.addCreditsToUser(50, 'credit_purchase');
      });

      expect(addResult.success).toBe(false);
      expect(addResult.message).toBe('User not authenticated');
    });

    it('should handle add credits errors', async () => {
      const { addCredits } = await import('@/lib/actions/credits');
      vi.mocked(addCredits).mockRejectedValue(new Error('Payment failed'));

      const { result } = renderHook(() => useCredits());

      let addResult: any;
      await act(async () => {
        addResult = await result.current.addCreditsToUser(50, 'credit_purchase');
      });

      expect(addResult.success).toBe(false);
      expect(addResult.message).toBe('Payment failed');
    });
  });

  describe('credit utilities', () => {
    it('should calculate credits from tokens', () => {
      const { result } = renderHook(() => useCredits());

      const credits = result.current.calculateCreditsFromTokens(1000);
      expect(credits).toBe(5);
    });

    it('should check if user has enough credits', () => {
      const { result } = renderHook(() => useCredits());

      const hasEnough = result.current.hasEnoughCredits(50);
      expect(hasEnough).toBe(true);
    });

    it('should check if user should be warned about low credits', () => {
      const { result } = renderHook(() => useCredits());

      const shouldWarn = result.current.shouldWarnLowCredits();
      expect(shouldWarn).toBe(false);
    });
  });

  describe('credit information', () => {
    it('should return current credit information', () => {
      const { result } = renderHook(() => useCredits());

      expect(result.current.availableCredits).toBe(100);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should handle loading state', async () => {
      const { useUser } = await import('@/components/auth/UserProvider');
      vi.mocked(useUser).mockReturnValue(createMockLoadingAuthContext());

      const { result } = renderHook(() => useCredits());

      expect(result.current.user).toBeNull();
      expect(result.current.availableCredits).toBe(0);
    });
  });
});
