/**
 * @fileoverview Dify service utilities for common operations
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a timestamp for display in chat messages
 * Shows relative time for recent messages, absolute time for older ones
 *
 * @param timestamp - ISO string timestamp
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * import { formatMessageTimestamp } from '@/lib/services/dify/utils';
 *
 * const timestamp = '2024-01-15T12:00:00Z';
 * const formatted = formatMessageTimestamp(timestamp);
 * console.log(formatted); // "2 hours ago" or "Jan 15, 2:30 PM"
 * ```
 */
export function formatMessageTimestamp(timestamp: string): string {
  const messageTime = new Date(timestamp);
  const now = new Date();

  // Show relative time for recent messages (within 7 days)
  const diffInDays = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays < 7) {
    return formatDistanceToNow(messageTime, { addSuffix: true });
  } else {
    // Show absolute time for older messages
    return format(messageTime, 'MMM d, h:mm a');
  }
}

/**
 * Format a Unix timestamp for display in chat messages
 * Converts Unix timestamp to Date and formats it
 *
 * @param unixTimestamp - Unix timestamp (seconds)
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * import { formatUnixTimestamp } from '@/lib/services/dify/utils';
 *
 * const unixTimestamp = 1640995200;
 * const formatted = formatUnixTimestamp(unixTimestamp);
 * console.log(formatted); // "2 hours ago" or "Jan 15, 2:30 PM"
 * ```
 */
export function formatUnixTimestamp(unixTimestamp: number): string {
  const messageTime = new Date(unixTimestamp * 1000);
  return formatMessageTimestamp(messageTime.toISOString());
}

/**
 * Parse Dify message timestamp and return formatted string
 * Handles both ISO strings and Unix timestamps from Dify API
 *
 * @param timestamp - Timestamp from Dify API (ISO string or Unix number)
 * @returns Formatted time string
 *
 * @example
 * ```typescript
 * import { formatDifyTimestamp } from '@/lib/services/dify/utils';
 *
 * // From conversation history (Unix timestamp)
 * const formatted1 = formatDifyTimestamp(1640995200);
 *
 * // From message response (ISO string)
 * const formatted2 = formatDifyTimestamp('2024-01-15T12:00:00Z');
 * ```
 */
export function formatDifyTimestamp(timestamp: string | number): string {
  if (typeof timestamp === 'number') {
    return formatUnixTimestamp(timestamp);
  } else {
    return formatMessageTimestamp(timestamp);
  }
}
