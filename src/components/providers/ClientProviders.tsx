'use client';

import { QueryProvider } from './QueryProvider';
import { UserProvider } from '@/components/auth/UserProvider';
import { AnalyticsProvider } from './AnalyticsProvider';
import { EnvValidation } from '@/components/EnvValidation';

/**
 * ClientProviders - Client-side provider wrapper
 *
 * This component wraps all client-side providers and components that require
 * client-side functionality (hooks, state, browser APIs, etc.).
 *
 * IMPORTANT: This component MUST be marked with 'use client' directive
 * because it contains client-side providers and components.
 *
 * @param children - The child components to wrap with providers
 */
export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <AnalyticsProvider>
          {/* Client-side environment validation */}
          <EnvValidation />
          {children}
        </AnalyticsProvider>
      </UserProvider>
    </QueryProvider>
  );
}
