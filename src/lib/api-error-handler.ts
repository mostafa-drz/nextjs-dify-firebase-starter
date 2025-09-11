import { NextRequest, NextResponse } from 'next/server';
import { logApiError, logError } from './sentry';

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

/**
 * Create a standardized API error response
 */
export function createApiError(
  message: string,
  status: number = 500,
  code?: string
): NextResponse {
  const error = {
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  };

  // Log server errors to Sentry (5xx)
  if (status >= 500) {
    logApiError('api-error', new Error(message), null, status);
  }

  return NextResponse.json(error, { status });
}

/**
 * Wrap API route handlers with error handling
 */
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<NextResponse | R>
) {
  return async (...args: T): Promise<NextResponse | R> => {
    try {
      return await handler(...args);
    } catch (error) {
      // Handle known Firebase errors
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as any;
        
        switch (firebaseError.code) {
          case 'auth/invalid-credential':
          case 'auth/user-not-found':
            return createApiError('Invalid credentials', 401, firebaseError.code);
          
          case 'auth/too-many-requests':
            return createApiError('Too many requests. Please try again later.', 429, firebaseError.code);
          
          case 'permission-denied':
            return createApiError('Permission denied', 403, firebaseError.code);
          
          case 'not-found':
            return createApiError('Resource not found', 404, firebaseError.code);
          
          default:
            // Log unexpected Firebase errors
            logError(firebaseError, { code: firebaseError.code });
            return createApiError('An error occurred', 500, firebaseError.code);
        }
      }

      // Handle standard errors
      if (error instanceof Error) {
        logError(error);
        return createApiError(
          process.env.NODE_ENV === 'production' 
            ? 'Internal server error' 
            : error.message,
          500
        );
      }

      // Handle unknown errors
      logError(new Error('Unknown error'), { originalError: error });
      return createApiError('An unexpected error occurred', 500);
    }
  };
}

/**
 * Extract and validate request body with error handling
 */
export async function parseRequestBody<T>(
  request: NextRequest,
  validator?: (data: any) => data is T
): Promise<T> {
  try {
    const body = await request.json();
    
    if (validator && !validator(body)) {
      throw new Error('Invalid request body');
    }
    
    return body as T;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON in request body');
    }
    throw error;
  }
}

/**
 * Rate limiting helper for API routes
 */
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(identifier);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (limit.count >= maxRequests) {
    return false;
  }

  limit.count++;
  return true;
}

/**
 * Middleware for API authentication check
 */
export async function requireAuth(
  request: NextRequest,
  checkAuth: (request: NextRequest) => Promise<any>
): Promise<any> {
  try {
    const user = await checkAuth(request);
    if (!user) {
      throw new Error('Unauthorized');
    }
    return user;
  } catch (error) {
    logError(error, { context: 'auth-check' });
    throw error;
  }
}