/**
 * Authentication Cookie Utilities
 * Handles setting and clearing Firebase ID tokens in HTTP-only cookies
 */

import { User as FirebaseUser } from 'firebase/auth';

/**
 * Set Firebase ID token in HTTP-only cookie
 */
export async function setAuthCookie(
  user: FirebaseUser
): Promise<{ success: boolean; error?: string }> {
  try {
    const idToken = await user.getIdToken();
    // Use the cookie name constant

    const response = await fetch('/api/auth/set-token', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${idToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to set auth cookie' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error setting auth cookie:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Clear Firebase ID token cookie
 */
export async function clearAuthCookie(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/auth/clear-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json();
      return { success: false, error: error.error || 'Failed to clear auth cookie' };
    }

    return { success: true };
  } catch (error) {
    console.error('Error clearing auth cookie:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Refresh token and update cookie
 */
export async function refreshToken(user: FirebaseUser): Promise<string> {
  try {
    // Get fresh token
    const idToken = await user.getIdToken(true);

    // Update the cookie with the new token
    await setAuthCookie(user);

    return idToken;
  } catch (error) {
    console.error('Error refreshing token:', error);
    // Fallback to regular token
    return await user.getIdToken();
  }
}
