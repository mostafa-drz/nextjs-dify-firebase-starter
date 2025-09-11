// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Adjust trace sample rate for production
  // Edge functions should have lower sampling to reduce overhead
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 1.0,

  // Disable debug in production
  debug: process.env.NODE_ENV !== 'production',

  environment: process.env.NODE_ENV,

  // Configure error filtering for edge runtime
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;
      
      // Ignore authentication redirects (expected behavior)
      if (error && error instanceof Error) {
        if (
          error.message?.includes('redirect') ||
          error.message?.includes('unauthorized')
        ) {
          return null;
        }
      }

      // Filter out middleware health checks
      if (event.request?.url?.includes('/api/health') ||
          event.request?.url?.includes('/_next/')) {
        return null;
      }
    }

    return event;
  },

  // Edge-specific error filtering
  ignoreErrors: [
    // Common edge runtime errors
    'NEXT_NOT_FOUND',
    'NEXT_REDIRECT',
    // Auth errors
    'unauthorized',
    'forbidden',
  ],
});