/**
 * Server Actions Error Handling System
 * Provides comprehensive error handling for server actions
 */

/**
 * Base error class for server actions
 */
export class ServerActionError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ServerActionError';
  }
}

/**
 * Authentication related errors
 */
export class AuthenticationError extends ServerActionError {
  constructor(message: string = 'Authentication required', details?: Record<string, unknown>) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Authorization related errors
 */
export class AuthorizationError extends ServerActionError {
  constructor(message: string = 'Insufficient permissions', details?: Record<string, unknown>) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

/**
 * Validation related errors
 */
export class ValidationError extends ServerActionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Resource not found errors
 */
export class NotFoundError extends ServerActionError {
  constructor(message: string = 'Resource not found', details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND_ERROR', 404, details);
    this.name = 'NotFoundError';
  }
}

/**
 * External API errors
 */
export class ExternalApiError extends ServerActionError {
  constructor(
    message: string,
    public service: string,
    public originalError?: Error,
    details?: Record<string, unknown>
  ) {
    super(message, 'EXTERNAL_API_ERROR', 502, details);
    this.name = 'ExternalApiError';
  }
}

/**
 * Rate limiting errors
 */
export class RateLimitError extends ServerActionError {
  constructor(message: string = 'Rate limit exceeded', details?: Record<string, unknown>) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Database related errors
 */
export class DatabaseError extends ServerActionError {
  constructor(
    message: string,
    public operation: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Credit related errors
 */
export class CreditError extends ServerActionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CREDIT_ERROR', 402, details);
    this.name = 'CreditError';
  }
}

/**
 * Error handler function for server actions
 */
export function handleServerActionError(error: unknown): ServerActionError {
  // If it's already a ServerActionError, return as is
  if (error instanceof ServerActionError) {
    return error;
  }

  // Handle different types of errors
  if (error instanceof Error) {
    // Check for specific error patterns
    if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      return new AuthorizationError(error.message);
    }

    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return new NotFoundError(error.message);
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return new ValidationError(error.message);
    }

    if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
      return new RateLimitError(error.message);
    }

    if (error.message.includes('credits') || error.message.includes('insufficient')) {
      return new CreditError(error.message);
    }

    // Default to generic server error
    return new ServerActionError(error.message, 'UNKNOWN_ERROR', 500);
  }

  // Handle non-Error objects
  if (typeof error === 'string') {
    return new ServerActionError(error, 'UNKNOWN_ERROR', 500);
  }

  // Fallback for unknown error types
  return new ServerActionError('An unexpected error occurred', 'UNKNOWN_ERROR', 500);
}

/**
 * Safe server action wrapper
 * Wraps server actions with comprehensive error handling
 */
export function withErrorHandling<T extends unknown[], R>(action: (...args: T) => Promise<R>) {
  return async (...args: T): Promise<R> => {
    try {
      return await action(...args);
    } catch (error) {
      const serverError = handleServerActionError(error);

      // Log the error for debugging
      console.error('Server action error:', {
        error: serverError.message,
        code: serverError.code,
        statusCode: serverError.statusCode,
        details: serverError.details,
        stack: serverError.stack,
      });

      // Re-throw the processed error
      throw serverError;
    }
  };
}

/**
 * Error response formatter
 * Formats errors for client consumption
 */
export function formatErrorResponse(error: ServerActionError) {
  return {
    success: false,
    error: {
      code: error.code,
      message: error.message,
      status: error.statusCode,
      details: error.details,
    },
  };
}

/**
 * Success response formatter
 * Formats successful responses
 */
export function formatSuccessResponse<T>(data: T) {
  return {
    success: true,
    data,
  };
}
