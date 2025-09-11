// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust trace sample rate for production (0.1 = 10% of transactions)
  // Lower sampling in production to focus on critical issues
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Disable debug in production
  debug: process.env.NODE_ENV !== 'production',

  environment: process.env.NODE_ENV,

  // Configure error filtering for server-side
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      
      // Ignore expected Firebase Admin errors
      if (error && error instanceof Error) {
        // Ignore token verification errors (handled by app logic)
        if (
          error.message?.includes('auth/id-token-expired') ||
          error.message?.includes('auth/argument-error') ||
          error.message?.includes('auth/invalid-credential')
        ) {
          return null;
        }

        // Ignore rate limiting errors (expected behavior)
        if (error.message?.includes('429') || 
            error.message?.includes('rate limit')) {
          // Log to console but don't send to Sentry
          console.warn('Rate limit encountered:', error.message);
          return null;
        }
      }

      // Filter out health check endpoints
      if (event.request?.url?.includes('/api/health')) {
        return null;
      }
    }

    return event;
  },

  // Server-specific error filtering
  ignoreErrors: [
    // Firebase Admin errors that are handled
    'auth/id-token-expired',
    'auth/invalid-credential',
    'auth/argument-error',
    // API errors that are expected
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    // Next.js specific
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
  ],

  // Configure integrations
  integrations: [
    // Capture unhandled promise rejections
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
    // Add request data to errors
    Sentry.requestDataIntegration({
      include: {
        cookies: false, // Don't include cookies for privacy
        data: true,
        headers: true,
        ip: false, // Don't include IP for privacy
        query_string: true,
        url: true,
      },
    }),
  ],
});