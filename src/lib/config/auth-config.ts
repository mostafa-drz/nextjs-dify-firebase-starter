/**
 * Simple Authentication Configuration
 * Minimal settings with sensible defaults
 */

export const AUTH_COOKIE_NAME = 'firebase-auth-token';
export const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
export const AUTH_COOKIE_SECURE = process.env.NODE_ENV === 'production';
export const AUTH_COOKIE_SAME_SITE = 'strict' as const;
export const AUTH_COOKIE_HTTP_ONLY = true;
