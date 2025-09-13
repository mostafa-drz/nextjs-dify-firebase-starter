import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AuthErrorBoundary } from '@/components/error-boundaries/AuthErrorBoundary';
import { FirebaseProvider } from '@/components/providers/FirebaseProvider';
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
  title: 'Dify Firebase Boilerplate',
  description: 'Next.js boilerplate with Dify.ai integration, Firebase auth, and credit management',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <FirebaseProvider>
            <AuthErrorBoundary>
              <ClientProviders>{children}</ClientProviders>
            </AuthErrorBoundary>
          </FirebaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
