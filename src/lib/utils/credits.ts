import { CREDIT_CONFIG } from '@/lib/config/constants';

/**
 * Calculate credits required based on token usage with configurable profit margin
 * @param tokens Number of tokens used
 * @returns Number of credits to deduct (always rounds up, includes profit margin)
 */
export function calculateCreditsFromTokens(tokens: number): number {
  const baseCredits = tokens / CREDIT_CONFIG.TOKENS_PER_CREDIT;
  return Math.ceil(baseCredits * CREDIT_CONFIG.PROFIT_MARGIN);
}

/**
 * Check if user has sufficient credits
 * @param availableCredits User's available credits
 * @param requiredCredits Credits needed for operation
 * @returns Boolean indicating if user has enough credits
 */
export function hasEnoughCredits(availableCredits: number, requiredCredits: number): boolean {
  return availableCredits >= requiredCredits;
}

/**
 * Format credits for display
 * @param credits Number of credits
 * @returns Formatted string
 */
export function formatCredits(credits: number): string {
  return credits.toLocaleString();
}

/**
 * Check if user should be warned about low credits
 * @param availableCredits User's available credits
 * @returns Boolean indicating if warning should be shown
 */
export function shouldWarnLowCredits(availableCredits: number): boolean {
  return availableCredits <= CREDIT_CONFIG.MIN_CREDITS_WARNING;
}
