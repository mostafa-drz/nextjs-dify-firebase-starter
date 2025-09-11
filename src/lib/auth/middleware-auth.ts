import { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { AUTH_COOKIE_NAME } from '@/lib/config/auth-config';

/**
 * Firebase Authentication Middleware Utilities
 * Handles server-side token verification for Next.js middleware
 */

interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
}

/**
 * Verify Firebase ID token from HTTP-only cookie
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Get token from HTTP-only cookie
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return { isAuthenticated: false };
    }

    // ✅ Proper JWT verification with Firebase Admin SDK
    const decodedToken = await getAuth().verifyIdToken(token);

    return {
      isAuthenticated: true,
      userId: decodedToken.uid,
      email: decodedToken.email || '',
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Get authentication status from request
 * This is the main function used by middleware
 */
export async function getAuthStatus(request: NextRequest): Promise<AuthResult> {
  return await verifyFirebaseToken(request);
}
