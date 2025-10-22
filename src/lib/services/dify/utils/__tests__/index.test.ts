/**
 * @fileoverview Minimal tests for Dify service utilities
 * @author Next.js Dify Firebase Starter
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';
import { formatMessageTimestamp, formatUnixTimestamp, formatDifyTimestamp } from '../index';

describe('Dify Service Utilities', () => {
  describe('formatMessageTimestamp', () => {
    it('should format recent timestamps with relative time', () => {
      const recentTimestamp = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(); // 2 hours ago
      const result = formatMessageTimestamp(recentTimestamp);
      expect(result).toContain('ago'); // Should contain relative time
    });

    it('should format older timestamps with absolute time', () => {
      const oldTimestamp = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 days ago
      const result = formatMessageTimestamp(oldTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);
    });
  });

  describe('formatUnixTimestamp', () => {
    it('should convert Unix timestamp to formatted string', () => {
      const unixTimestamp = 1640995200; // Jan 1, 2022 00:00:00 UTC
      const result = formatUnixTimestamp(unixTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);
    });

    it('should handle epoch timestamp', () => {
      const epochTimestamp = 0; // Jan 1, 1970 00:00:00 UTC
      const result = formatUnixTimestamp(epochTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);
    });
  });

  describe('formatDifyTimestamp', () => {
    it('should handle Unix timestamp (number)', () => {
      const unixTimestamp = 1640995200;
      const result = formatDifyTimestamp(unixTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);
    });

    it('should handle ISO string timestamp', () => {
      const isoTimestamp = '2022-01-01T00:00:00Z';
      const result = formatDifyTimestamp(isoTimestamp);
      expect(result).toMatch(/^[A-Za-z]{3} \d{1,2}, \d{1,2}:\d{2} [AP]M$/);
    });
  });
});
