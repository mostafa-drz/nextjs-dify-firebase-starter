'use server';

import {
  checkUserRateLimitByAction,
  checkUserRateLimit,
  RateLimitConfig,
} from '@/lib/utils/simple-rate-limit';

/**
 * Server action to check user rate limit
 * Can be used in API routes and server components
 *
 * @param userId - User ID to check rate limit for
 * @param action - Action type (key from RATE_LIMIT_CONFIGS)
 * @returns Promise resolving to rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkUserRateLimitAction('user123', 'chat_message');
 * if (!result.allowed) {
 *   return NextResponse.json({ error: result.error }, { status: 429 });
 * }
 * ```
 */
export async function checkUserRateLimitAction(
  userId: string,
  action: 'chat_message' | 'file_upload' | 'credit_purchase'
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}> {
  try {
    const result = await checkUserRateLimitByAction(userId, action);
    return result;
  } catch (error) {
    console.error('Rate limit check failed:', error);

    // On error, allow the request but log the issue
    // This prevents rate limiting from breaking the app
    return {
      allowed: true,
      remaining: 10, // Default remaining
      resetTime: Date.now() + 60000, // 1 minute from now
    };
  }
}

/**
 * Server action to check custom rate limit
 *
 * @param userId - User ID to check rate limit for
 * @param config - Custom rate limit configuration
 * @returns Promise resolving to rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkCustomRateLimitAction('user123', {
 *   maxRequests: 5,
 *   windowMs: 300000,
 *   action: 'custom_action'
 * });
 * ```
 */
export async function checkCustomRateLimitAction(
  userId: string,
  config: RateLimitConfig
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
  error?: string;
}> {
  try {
    const result = await checkUserRateLimit(userId, config);
    return result;
  } catch (error) {
    console.error('Custom rate limit check failed:', error);

    // On error, allow the request but log the issue
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}
