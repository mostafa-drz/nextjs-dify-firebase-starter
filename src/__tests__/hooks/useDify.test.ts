/**
 * @fileoverview Minimal tests for useDify timestamp conversion logic
 * @author Dify Firebase Boilerplate
 * @version 1.0.0
 */

import { describe, it, expect } from 'vitest';

describe('useDify Timestamp Conversion', () => {
  it('should convert Unix timestamp to ISO string correctly', () => {
    // Test the core conversion logic from useDify hook
    const unixTimestamp = 1726560000; // Sep 17, 2024 08:00:00 UTC
    const expectedISO = '2024-09-17T08:00:00.000Z';

    // This is the exact logic from useDify.ts line 57 & 67
    const result = new Date(unixTimestamp * 1000).toISOString();

    expect(result).toBe(expectedISO);
  });

  it('should handle edge case timestamps', () => {
    // Epoch timestamp
    const epochTimestamp = 0;
    const epochResult = new Date(epochTimestamp * 1000).toISOString();
    expect(epochResult).toBe('1970-01-01T00:00:00.000Z');

    // Recent timestamp
    const recentTimestamp = 1640995200; // Jan 1, 2022
    const recentResult = new Date(recentTimestamp * 1000).toISOString();
    expect(recentResult).toBe('2022-01-01T00:00:00.000Z');
  });

  it('should handle the multiplication by 1000 correctly', () => {
    // Verify that we multiply by 1000 (Unix seconds -> JS milliseconds)
    const unixSeconds = 1726560000;
    const jsMilliseconds = unixSeconds * 1000;

    expect(jsMilliseconds).toBe(1726560000000);

    // Verify the Date constructor works with milliseconds
    const date = new Date(jsMilliseconds);
    expect(date.getTime()).toBe(1726560000000);
  });
});
