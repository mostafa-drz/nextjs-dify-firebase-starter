/**
 * @fileoverview Tests for credit utility functions
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import {
  calculateCreditsFromTokens,
  hasEnoughCredits,
  formatCredits,
  shouldWarnLowCredits,
} from '../credits';

describe('Credit Utilities', () => {
  describe('calculateCreditsFromTokens', () => {
    it('should calculate credits correctly for small token amounts', () => {
      const credits = calculateCreditsFromTokens(100);
      expect(credits).toBe(1); // 100 tokens = 0.1 credits * 1.1 profit margin = 0.11, rounded up to 1
    });

    it('should calculate credits correctly for large token amounts', () => {
      const credits = calculateCreditsFromTokens(5000);
      expect(credits).toBe(6); // 5000 tokens = 5 credits * 1.1 profit margin = 5.5, rounded up to 6
    });

    it('should round up fractional credits', () => {
      const credits = calculateCreditsFromTokens(1500);
      expect(credits).toBe(2); // 1500 tokens = 1.5 credits * 1.1 profit margin = 1.65, rounded up to 2
    });

    it('should handle zero tokens', () => {
      const credits = calculateCreditsFromTokens(0);
      expect(credits).toBe(0); // 0 tokens = 0 credits * 1.1 profit margin = 0
    });

    it('should handle negative tokens gracefully', () => {
      const credits = calculateCreditsFromTokens(-100);
      expect(credits).toBeCloseTo(0); // -100 tokens = -0.1 credits * 1.1 profit margin = -0.11, rounded up to -0
    });
  });

  describe('hasEnoughCredits', () => {
    it('should return true when user has sufficient credits', () => {
      expect(hasEnoughCredits(100, 50)).toBe(true);
    });

    it('should return true when user has exactly enough credits', () => {
      expect(hasEnoughCredits(50, 50)).toBe(true);
    });

    it('should return false when user has insufficient credits', () => {
      expect(hasEnoughCredits(30, 50)).toBe(false);
    });

    it('should handle zero credits correctly', () => {
      expect(hasEnoughCredits(0, 10)).toBe(false);
      expect(hasEnoughCredits(10, 0)).toBe(true);
    });
  });

  describe('formatCredits', () => {
    it('should format credits as numbers with locale formatting', () => {
      expect(formatCredits(1)).toBe('1');
      expect(formatCredits(0)).toBe('0');
      expect(formatCredits(100)).toBe('100');
    });

    it('should handle large numbers correctly', () => {
      expect(formatCredits(1000)).toBe('1,000');
      expect(formatCredits(1234567)).toBe('1,234,567');
    });
  });

  describe('shouldWarnLowCredits', () => {
    it('should warn when credits are below threshold', () => {
      expect(shouldWarnLowCredits(5)).toBe(true);
      expect(shouldWarnLowCredits(10)).toBe(true);
    });

    it('should not warn when credits are above threshold', () => {
      expect(shouldWarnLowCredits(15)).toBe(false);
      expect(shouldWarnLowCredits(100)).toBe(false);
    });

    it('should warn when credits are exactly at threshold', () => {
      expect(shouldWarnLowCredits(10)).toBe(true);
    });
  });
});
