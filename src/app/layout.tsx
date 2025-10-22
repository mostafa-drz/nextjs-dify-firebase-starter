import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { ClientProviders } from '@/components/providers/ClientProviders';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Next.js Dify Firebase Starter',
  description: 'Next.js boilerplate with Dify.ai integration, Firebase auth, and credit management',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <AuthErrorBoundary>
            <ClientProviders>{children}</ClientProviders>
          </AuthErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  );
}
