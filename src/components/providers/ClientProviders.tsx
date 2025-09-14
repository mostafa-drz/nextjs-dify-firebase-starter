'use client';

import { QueryProvider } from './QueryProvider';
import { UserProvider } from '@/components/auth/UserProvider';
import { AuthProvider } from '@/components/auth/AuthContext';
import { AnalyticsProvider } from './AnalyticsProvider';
import { FirebaseProvider } from './FirebaseProvider';
import { NextIntlClientProvider } from 'next-intl';
import { defaultLocale } from '@/i18n/config';

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
 * @param messages - NextIntl messages for internationalization
 */
export function ClientProviders({
  children,
  messages,
}: {
  children: React.ReactNode;
  messages: any;
}) {
  // Since we only have one locale (en) and use localePrefix: 'as-needed',
  // we can just use the default locale directly
  return (
    <NextIntlClientProvider messages={messages} locale={defaultLocale}>
      <FirebaseProvider>
        <AuthProvider>
          <QueryProvider>
            <UserProvider>
              <AnalyticsProvider>{children}</AnalyticsProvider>
            </UserProvider>
          </QueryProvider>
        </AuthProvider>
      </FirebaseProvider>
    </NextIntlClientProvider>
  );
}
