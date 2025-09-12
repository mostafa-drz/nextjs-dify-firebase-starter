import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { UserProvider } from '@/components/auth/UserProvider';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { AnalyticsProvider } from '@/components/providers/AnalyticsProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { FirebaseProvider } from '@/components/providers/FirebaseProvider';
import { EnvValidation } from '@/components/EnvValidation';
import { locales } from '@/i18n/config';
import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: _locale } = await params;
  return {
    title: 'Dify Firebase Boilerplate',
    description:
      'Next.js boilerplate with Dify.ai integration, Firebase auth, and credit management',
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <NextIntlClientProvider messages={messages}>
            <FirebaseProvider>
              <EnvValidation />
              <AuthErrorBoundary>
                <QueryProvider>
                  <UserProvider>
                    <AnalyticsProvider>{children}</AnalyticsProvider>
                  </UserProvider>
                </QueryProvider>
              </AuthErrorBoundary>
            </FirebaseProvider>
          </NextIntlClientProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
