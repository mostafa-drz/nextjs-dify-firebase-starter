/**
 * @fileoverview User test data fixtures
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { User } from '@/types/user';

export const mockUser: User = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: undefined,
  preferences: {
    language: 'en',
  },
  createdAt: {
    seconds: 1704067200,
    nanoseconds: 0,
    toDate: () => new Date('2024-01-01T00:00:00Z'),
    toMillis: () => 1704067200000,
    isEqual: () => false,
  } as any,
  admin: {
    availableCredits: 100,
    usedCredits: 0,
    creditHistory: [],
    subscription: {
      plan: 'free',
      creditsPerMonth: 100,
      expiresAt: null,
    },
    limits: {
      dailyRequests: 50,
      maxTokensPerRequest: 2000,
      maxConcurrentSessions: 3,
    },
    isBlocked: false,
    updatedAt: {
      seconds: 1704067200,
      nanoseconds: 0,
      toDate: () => new Date('2024-01-01T00:00:00Z'),
      toMillis: () => 1704067200000,
      isEqual: () => false,
    } as any,
  },
};

export const mockUserWithLowCredits: User = {
  ...mockUser,
  admin: {
    ...mockUser.admin,
    availableCredits: 5,
    usedCredits: 95,
  },
};

export const mockUserWithNoCredits: User = {
  ...mockUser,
  admin: {
    ...mockUser.admin,
    availableCredits: 0,
    usedCredits: 100,
  },
};

export const mockUserWithReservedCredits: User = {
  ...mockUser,
  admin: {
    ...mockUser.admin,
    availableCredits: 80,
  },
};
