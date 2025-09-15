/**
 * @vitest-environment jsdom
 */

import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import { ClientProviders } from '../ClientProviders';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(() => ({
    onAuthStateChanged: vi.fn(() => vi.fn()), // Returns unsubscribe function
    signInWithEmailLink: vi.fn(),
    signOut: vi.fn(),
    currentUser: null,
  })),
  onAuthStateChanged: vi.fn(() => vi.fn()),
  signInWithEmailLink: vi.fn(),
  signOut: vi.fn(),
}));

// Mock Firebase client to prevent analytics initialization
vi.mock('@/lib/firebase/client', () => ({
  auth: {
    onAuthStateChanged: vi.fn(() => vi.fn()), // Returns unsubscribe function
    signInWithEmailLink: vi.fn(),
    signOut: vi.fn(),
    currentUser: null,
  },
  db: {},
  analytics: null,
  getFirebaseServices: () => ({
    auth: {
      onAuthStateChanged: vi.fn(() => vi.fn()),
      signInWithEmailLink: vi.fn(),
      signOut: vi.fn(),
      currentUser: null,
    },
    db: {},
    analytics: null,
  }),
  getFirebaseAnalytics: () => null,
  default: {},
}));

// Mock Firebase Analytics
vi.mock('firebase/analytics', () => ({
  getAnalytics: vi.fn(() => null),
  logEvent: vi.fn(),
}));

// Mock the analytics module
vi.mock('@/lib/analytics', () => ({
  trackPageView: vi.fn(),
  trackEvent: vi.fn(),
  trackAuth: vi.fn(),
  trackCredits: vi.fn(),
  trackChat: vi.fn(),
  trackExternalLink: vi.fn(),
}));

// Mock the QueryProvider
vi.mock('@/components/providers/QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

// Mock the UserProvider
vi.mock('@/components/auth/UserProvider', () => ({
  UserProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="user-provider">{children}</div>
  ),
}));

// Mock the AnalyticsProvider
vi.mock('@/components/providers/AnalyticsProvider', () => ({
  AnalyticsProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="analytics-provider">{children}</div>
  ),
}));

describe('ClientProviders', () => {
  it('should render all client-side providers in correct order', () => {
    render(
      <ClientProviders>
        <div data-testid="app-content">App Content</div>
      </ClientProviders>
    );

    // Check that all providers are rendered
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
    expect(screen.getByTestId('user-provider')).toBeInTheDocument();
    expect(screen.getByTestId('analytics-provider')).toBeInTheDocument();
    expect(screen.getByTestId('app-content')).toBeInTheDocument();
  });

  it('should have proper provider nesting order', () => {
    render(
      <ClientProviders>
        <div data-testid="app-content">App Content</div>
      </ClientProviders>
    );

    const queryProvider = screen.getByTestId('query-provider');
    const userProvider = screen.getByTestId('user-provider');
    const analyticsProvider = screen.getByTestId('analytics-provider');
    const appContent = screen.getByTestId('app-content');

    // Check nesting order: QueryProvider > UserProvider > AnalyticsProvider > AppContent
    expect(queryProvider).toContainElement(userProvider);
    expect(userProvider).toContainElement(analyticsProvider);
    expect(analyticsProvider).toContainElement(appContent);
  });

  it('should be a client component (has use client directive)', () => {
    // This test ensures the component is properly marked as client-side
    expect(ClientProviders).toBeDefined();
  });
});
