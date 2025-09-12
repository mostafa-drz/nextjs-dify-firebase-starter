/**
 * @fileoverview Authentication test utilities
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { vi } from 'vitest';
import { mockUser } from '../fixtures/users';

/**
 * Creates a mock authenticated user context
 */
export const createMockAuthContext = (user = mockUser) => ({
  user,
  loading: false,
  sendSignInEmail: vi.fn().mockResolvedValue({ success: true, message: 'Email sent' }),
  handleSignInWithEmailLink: vi.fn().mockResolvedValue({ success: true, message: 'Signed in' }),
  logout: vi.fn().mockResolvedValue(undefined),
  checkCredits: vi.fn((required: number) => user.admin.availableCredits >= required),
  availableCredits: user.admin.availableCredits,
  subscription: user.admin.subscription,
});

/**
 * Creates a mock unauthenticated user context
 */
export const createMockUnauthContext = () => ({
  user: null,
  loading: false,
  sendSignInEmail: vi.fn().mockResolvedValue({ success: true, message: 'Email sent' }),
  handleSignInWithEmailLink: vi.fn().mockResolvedValue({ success: true, message: 'Signed in' }),
  logout: vi.fn().mockResolvedValue(undefined),
  checkCredits: vi.fn(() => false),
  availableCredits: 0,
  subscription: null,
});

/**
 * Creates a mock loading auth context
 */
export const createMockLoadingAuthContext = () => ({
  user: null,
  loading: true,
  sendSignInEmail: vi.fn(),
  handleSignInWithEmailLink: vi.fn(),
  logout: vi.fn(),
  checkCredits: vi.fn(),
  availableCredits: 0,
  subscription: null,
});
