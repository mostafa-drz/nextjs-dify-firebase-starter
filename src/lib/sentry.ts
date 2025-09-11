import * as Sentry from '@sentry/nextjs';

/**
 * Custom error logging with Sentry
 * Provides minimal but essential error tracking
 */

// Log levels for different severity
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Log a custom message to Sentry
 * Use this for important events that aren't errors
 */
export function logMessage(message: string, level: LogLevel = LogLevel.INFO) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureMessage(message, level);
  } else {
    console.log(`[${level.toUpperCase()}]`, message);
  }
}

/**
 * Log an error with additional context
 * Use this for handled errors that you want to track
 */
export function logError(
  error: Error | unknown,
  context?: Record<string, unknown>,
  level: LogLevel = LogLevel.ERROR
) {
  if (process.env.NODE_ENV === 'production') {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional', context);
      }
      scope.setLevel(level);
      
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureException(new Error(String(error)));
      }
    });
  } else {
    console.error(`[${level.toUpperCase()}]`, error, context);
  }
}

/**
 * Set user context for better error tracking
 * Call this after user authentication
 */
export function setUserContext(user: {
  id?: string;
  email?: string;
  username?: string;
} | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      username: user.username,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Add breadcrumb for better error context
 * Use this to track user actions leading to errors
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Track API errors with additional context
 * Use this specifically for API/network errors
 */
export function logApiError(
  endpoint: string,
  error: Error | unknown,
  requestData?: unknown,
  statusCode?: number
) {
  const context = {
    endpoint,
    statusCode,
    requestData: requestData ? JSON.stringify(requestData).slice(0, 1000) : undefined, // Limit size
  };

  if (process.env.NODE_ENV === 'production') {
    // Don't log 4xx errors except 403 (forbidden) as they're usually user errors
    if (statusCode && statusCode >= 400 && statusCode < 500 && statusCode !== 403) {
      console.warn('API Client Error:', endpoint, statusCode);
      return;
    }

    Sentry.withScope((scope) => {
      scope.setTag('api.endpoint', endpoint);
      if (statusCode) {
        scope.setTag('api.status_code', statusCode);
      }
      scope.setContext('api', context);
      
      if (error instanceof Error) {
        Sentry.captureException(error);
      } else {
        Sentry.captureException(new Error(`API Error: ${endpoint}`));
      }
    });
  } else {
    console.error('API Error:', context, error);
  }
}

/**
 * Track Firebase errors with context
 * Use this for Firebase-specific errors
 */
export function logFirebaseError(
  operation: string,
  error: unknown,
  additionalContext?: Record<string, unknown>
) {
  const firebaseError = error as { code?: string; message?: string };
  const context = {
    operation,
    code: firebaseError?.code,
    ...additionalContext,
  };

  // Don't log expected auth errors
  const ignoredCodes = [
    'auth/popup-closed-by-user',
    'auth/cancelled-popup-request',
    'auth/network-request-failed',
    'auth/too-many-requests',
  ];

  if (firebaseError?.code && ignoredCodes.includes(firebaseError.code)) {
    console.warn('Firebase operation failed (expected):', operation, firebaseError.code);
    return;
  }

  logError(error, context);
}

/**
 * Performance monitoring helper
 * Use this to track slow operations
 */
export function measurePerformance<T>(
  operationName: string,
  operation: () => Promise<T> | T
): Promise<T> | T {
  const startTime = Date.now();

  try {
    const result = operation();
    
    if (result instanceof Promise) {
      return result
        .then((res) => {
          const duration = Date.now() - startTime;
          
          // Log slow operations
          if (duration > 3000) {
            logMessage(
              `Slow operation detected: ${operationName} took ${duration}ms`,
              LogLevel.WARNING
            );
          }
          
          return res;
        })
        .catch((error) => {
          const duration = Date.now() - startTime;
          logError(error, { operation: operationName, duration });
          throw error;
        });
    } else {
      const duration = Date.now() - startTime;
      
      if (duration > 1000) {
        logMessage(
          `Slow synchronous operation: ${operationName} took ${duration}ms`,
          LogLevel.WARNING
        );
      }
      
      return result;
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(error, { operation: operationName, duration });
    throw error;
  }
}