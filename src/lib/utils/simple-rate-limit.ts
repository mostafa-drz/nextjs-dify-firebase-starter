/**
 * @fileoverview Simple user rate limiting utility for MVP
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 *
 * Provides basic rate limiting functionality using Firestore for storage.
 * Designed for MVP with 10k users - simple, effective, and production-safe.
 */

import { getFirestoreAdmin, FieldValue } from '@/lib/firebase/admin';

/**
 * Rate limit configuration interface
 */
export interface RateLimitConfig {
  /** Maximum number of requests allowed */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Action being rate limited (e.g., 'chat_message', 'file_upload') */
  action: string;
}

/**
 * Rate limit check result
 */
export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of requests remaining in current window */
  remaining: number;
  /** When the rate limit resets (timestamp) */
  resetTime: number;
  /** Error message if not allowed */
  error?: string;
}

/**
 * Default rate limit configurations for different actions
 */
export const RATE_LIMIT_CONFIGS = {
  chat_message: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
    action: 'chat_message',
  },
  file_upload: {
    maxRequests: 5,
    windowMs: 300000, // 5 minutes
    action: 'file_upload',
  },
  credit_purchase: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
    action: 'credit_purchase',
  },
} as const;

/**
 * Simple rate limiting utility using Firestore
 *
 * @param userId - User ID to check rate limit for
 * @param config - Rate limit configuration
 * @returns Promise resolving to rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkUserRateLimit('user123', {
 *   maxRequests: 10,
 *   windowMs: 60000,
 *   action: 'chat_message'
 * });
 *
 * if (!result.allowed) {
 *   throw new Error(result.error);
 * }
 * ```
 */
export async function checkUserRateLimit(
  userId: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  try {
    const db = getFirestoreAdmin();
    const now = Date.now();
    const key = `${userId}:${config.action}`;

    // Get current rate limit data
    const rateLimitRef = db.collection('rate_limits').doc(key);
    const rateLimitDoc = await rateLimitRef.get();
    const rateLimitData = rateLimitDoc.data();

    // If no data exists or window has expired, reset the limit
    if (!rateLimitData || now > rateLimitData.resetTime) {
      await rateLimitRef.set({
        userId,
        action: config.action,
        count: 1,
        resetTime: now + config.windowMs,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Check if limit exceeded
    if (rateLimitData.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: rateLimitData.resetTime,
        error: `Rate limit exceeded. Maximum ${config.maxRequests} ${config.action} requests per ${config.windowMs / 1000} seconds. Try again in ${Math.ceil((rateLimitData.resetTime - now) / 1000)} seconds.`,
      };
    }

    // Increment the count
    await rateLimitRef.update({
      count: rateLimitData.count + 1,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      allowed: true,
      remaining: config.maxRequests - (rateLimitData.count + 1),
      resetTime: rateLimitData.resetTime,
    };
  } catch (error) {
    console.error('Rate limit check failed:', error);

    // On error, allow the request but log the issue
    // This prevents rate limiting from breaking the app
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Check rate limit using predefined configuration
 *
 * @param userId - User ID to check rate limit for
 * @param action - Action type (key from RATE_LIMIT_CONFIGS)
 * @returns Promise resolving to rate limit result
 *
 * @example
 * ```typescript
 * const result = await checkUserRateLimitByAction('user123', 'chat_message');
 * if (!result.allowed) {
 *   throw new Error(result.error);
 * }
 * ```
 */
export async function checkUserRateLimitByAction(
  userId: string,
  action: keyof typeof RATE_LIMIT_CONFIGS
): Promise<RateLimitResult> {
  const config = RATE_LIMIT_CONFIGS[action];
  return checkUserRateLimit(userId, config);
}

/**
 * Reset rate limit for a specific user and action
 * Useful for testing or admin operations
 *
 * @param userId - User ID to reset rate limit for
 * @param action - Action type to reset
 * @returns Promise resolving to success status
 *
 * @example
 * ```typescript
 * await resetUserRateLimit('user123', 'chat_message');
 * ```
 */
export async function resetUserRateLimit(
  userId: string,
  action: keyof typeof RATE_LIMIT_CONFIGS
): Promise<{ success: boolean; message: string }> {
  try {
    const db = getFirestoreAdmin();
    const key = `${userId}:${action}`;

    await db.collection('rate_limits').doc(key).delete();

    return {
      success: true,
      message: `Rate limit reset for user ${userId} and action ${action}`,
    };
  } catch (error) {
    console.error('Rate limit reset failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to reset rate limit',
    };
  }
}

/**
 * Get current rate limit status for a user
 * Useful for displaying remaining requests to users
 *
 * @param userId - User ID to check
 * @param action - Action type to check
 * @returns Promise resolving to current rate limit status
 *
 * @example
 * ```typescript
 * const status = await getUserRateLimitStatus('user123', 'chat_message');
 * console.log(`Remaining requests: ${status.remaining}`);
 * ```
 */
export async function getUserRateLimitStatus(
  userId: string,
  action: keyof typeof RATE_LIMIT_CONFIGS
): Promise<RateLimitResult> {
  try {
    const db = getFirestoreAdmin();
    const key = `${userId}:${action}`;
    const now = Date.now();

    const rateLimitDoc = await db.collection('rate_limits').doc(key).get();
    const rateLimitData = rateLimitDoc.data();

    if (!rateLimitData || now > rateLimitData.resetTime) {
      // No active rate limit
      const config = RATE_LIMIT_CONFIGS[action];
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
      };
    }

    const config = RATE_LIMIT_CONFIGS[action];
    const remaining = Math.max(0, config.maxRequests - rateLimitData.count);

    return {
      allowed: remaining > 0,
      remaining,
      resetTime: rateLimitData.resetTime,
    };
  } catch (error) {
    console.error('Get rate limit status failed:', error);

    // On error, return a safe default
    const config = RATE_LIMIT_CONFIGS[action];
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
}

/**
 * Clean up expired rate limit records
 * Should be run periodically to prevent Firestore bloat
 *
 * @returns Promise resolving to cleanup result
 *
 * @example
 * ```typescript
 * // Run this in a scheduled function or cron job
 * const result = await cleanupExpiredRateLimits();
 * console.log(`Cleaned up ${result.cleanedCount} expired records`);
 * ```
 */
export async function cleanupExpiredRateLimits(): Promise<{
  success: boolean;
  cleanedCount: number;
  message: string;
}> {
  try {
    const db = getFirestoreAdmin();
    const now = Date.now();

    // Query for expired rate limits
    const expiredQuery = db.collection('rate_limits').where('resetTime', '<', now);

    const expiredDocs = await expiredQuery.get();

    if (expiredDocs.empty) {
      return {
        success: true,
        cleanedCount: 0,
        message: 'No expired rate limits found',
      };
    }

    // Delete expired documents in batches
    const batch = db.batch();
    let cleanedCount = 0;

    expiredDocs.forEach((doc) => {
      batch.delete(doc.ref);
      cleanedCount++;
    });

    await batch.commit();

    return {
      success: true,
      cleanedCount,
      message: `Successfully cleaned up ${cleanedCount} expired rate limit records`,
    };
  } catch (error) {
    console.error('Rate limit cleanup failed:', error);
    return {
      success: false,
      cleanedCount: 0,
      message: error instanceof Error ? error.message : 'Failed to cleanup expired rate limits',
    };
  }
}
