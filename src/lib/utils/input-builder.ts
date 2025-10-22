/**
 * @fileoverview Flexible input builder utility for Dify API
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 *
 * This utility provides a flexible way to build inputs for Dify API calls.
 * Developers can customize inputs based on their specific use cases.
 */

/**
 * Base input interface that can be extended
 */
export interface BaseInputs extends Record<string, unknown> {
  /** Current timestamp for context */
  timestamp?: string;
}

/**
 * Common input fields that many applications might need
 */
export interface CommonInputs extends BaseInputs {
  /** User's language preference */
  language?: string;
  /** User's timezone */
  timezone?: string;
  /** User ID for personalization */
  user_id?: string;
}

/**
 * Build basic inputs with timestamp
 * @param additionalInputs - Additional inputs to include
 * @returns Input object for Dify API
 */
export function buildBasicInputs(additionalInputs: Record<string, unknown> = {}): BaseInputs {
  return {
    timestamp: new Date().toISOString(),
    ...additionalInputs,
  };
}

/**
 * Build common inputs with typical user context
 * @param user - User object (can be any shape)
 * @param locale - User's locale
 * @param additionalInputs - Additional inputs to include
 * @returns Input object for Dify API
 */
export function buildCommonInputs(
  user: Record<string, unknown> = {},
  locale: string = 'en',
  additionalInputs: Record<string, unknown> = {}
): CommonInputs {
  return {
    timestamp: new Date().toISOString(),
    language: locale,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    user_id: (user.uid as string) || (user.id as string) || undefined,
    ...additionalInputs,
  };
}

/**
 * Build custom inputs - fully flexible
 * @param inputs - Any inputs you want to pass to Dify
 * @returns Input object for Dify API
 */
export function buildCustomInputs(inputs: Record<string, unknown>): Record<string, unknown> {
  return {
    ...inputs,
    // Always include timestamp for debugging/tracking
    timestamp: new Date().toISOString(),
  };
}

/**
 * Example usage functions for common scenarios
 */

/**
 * Example: E-commerce chatbot inputs
 */
export function buildEcommerceInputs(user: {
  id: string;
  cartItems: number;
  lastPurchase?: string;
}): Record<string, unknown> {
  return buildCustomInputs({
    user_id: user.id,
    cart_items_count: user.cartItems,
    last_purchase: user.lastPurchase,
    context_type: 'ecommerce',
  });
}

/**
 * Example: Customer support inputs
 */
export function buildSupportInputs(user: {
  uid: string;
  previousTickets?: number;
}): Record<string, unknown> {
  return buildCustomInputs({
    user_id: user.uid,
    previous_tickets: user.previousTickets || 0,
    context_type: 'support',
  });
}

/**
 * Example: Educational platform inputs
 */
export function buildEducationInputs(user: {
  id: string;
  courseProgress: Record<string, number>;
  level: string;
}): Record<string, unknown> {
  return buildCustomInputs({
    user_id: user.id,
    course_progress: user.courseProgress,
    user_level: user.level,
    context_type: 'education',
  });
}
