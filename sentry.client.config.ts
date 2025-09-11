// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Add Session Replay integration with conservative settings
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      maskAllInputs: true,
      // Block all media elements
      blockAllMedia: true,
    }),
  ],

  // Adjust trace sample rate for production (0.1 = 10% of transactions)
  // This helps reduce noise and focuses on essential performance data
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session replay sample rates
  // Only capture 1% of regular sessions to minimize data collection
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.01 : 0.1,

  // Capture 100% of sessions with errors for debugging
  replaysOnErrorSampleRate: 1.0,

  // Disable debug in production to reduce console noise
  debug: process.env.NODE_ENV !== 'production',

  environment: process.env.NODE_ENV,

  // Configure error filtering to reduce noise
  beforeSend(event, hint) {
    // Filter out non-critical errors in production
    if (process.env.NODE_ENV === 'production') {
      const error = hint.originalException;

      // Ignore network errors that are often transient
      if (error && error instanceof Error) {
        if (
          error.message?.includes('Network request failed') ||
          error.message?.includes('Failed to fetch') ||
          error.message?.includes('Load failed')
        ) {
          return null;
        }
      }

      // Ignore errors from browser extensions
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some((frame) =>
          frame.filename?.includes('extension://')
        )
      ) {
        return null;
      }

      // Ignore ResizeObserver errors (common browser quirk)
      if (error && error instanceof Error && error.message?.includes('ResizeObserver')) {
        return null;
      }
    }

    return event;
  },

  // Ignore specific errors and transactions
  ignoreErrors: [
    // Browser quirks
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    // Network errors
    'NetworkError',
    'Network request failed',
    // Firebase auth errors that are handled in the app
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    // Common non-critical errors
    'Non-Error promise rejection captured',
    'AbortError',
  ],

  // Only send errors from your domain
  allowUrls:
    process.env.NODE_ENV === 'production'
      ? [/^https:\/\/.*\.vercel\.app/, /^https:\/\/yourdomain\.com/]
      : [],
});
