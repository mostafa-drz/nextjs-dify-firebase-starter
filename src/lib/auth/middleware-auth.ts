import { NextRequest } from 'next/server';
import { getFirestoreAdmin } from '@/lib/utils/firebase-admin';
import { Firestore } from 'firebase-admin/firestore';

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
 * Verify Firebase ID token from request headers or cookies
 */
export async function verifyFirebaseToken(request: NextRequest): Promise<AuthResult> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization');
    let token: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get token from cookies (for client-side requests)
      token = request.cookies.get('firebase-auth-token')?.value || null;
    }

    if (!token) {
      return { isAuthenticated: false };
    }

    // For now, we'll use a simple approach
    // In production, you should verify the token with Firebase Admin SDK
    // This is a placeholder implementation
    const db = getFirestoreAdmin();

    // Check if user exists in Firestore (basic validation)
    // In a real implementation, you'd verify the JWT token signature
    const userId = await validateUserToken(token, db);

    if (userId) {
      return {
        isAuthenticated: true,
        userId,
        email: '', // You'd extract this from the verified token
      };
    }

    return { isAuthenticated: false };
  } catch (error) {
    console.error('Token verification error:', error);
    return { isAuthenticated: false };
  }
}

/**
 * Validate user token and return user ID if valid
 * This is a simplified implementation - in production, use Firebase Admin SDK
 */
async function validateUserToken(token: string, db: Firestore): Promise<string | null> {
  try {
    // This is a placeholder - in production you would:
    // 1. Verify the JWT signature using Firebase Admin SDK
    // 2. Check token expiration
    // 3. Validate the token claims

    // For now, we'll do a basic check by looking for the token in a user document
    // This is NOT secure and should be replaced with proper JWT verification

    // Extract user ID from token (this is a hack for demo purposes)
    // In production, decode and verify the JWT properly
    const userId = extractUserIdFromToken(token);

    if (userId) {
      // Check if user exists in Firestore
      const userDoc = await db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userId;
      }
    }

    return null;
  } catch (error) {
    console.error('User validation error:', error);
    return null;
  }
}

/**
 * Extract user ID from token (placeholder implementation)
 * In production, this should be done by properly decoding the JWT
 */
function extractUserIdFromToken(token: string): string | null {
  try {
    // This is a placeholder - in production, use proper JWT decoding
    // For Firebase tokens, you'd use Firebase Admin SDK to verify and decode

    // Simple base64 decode of the payload (NOT secure for production)
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id || payload.sub || null;
  } catch (error) {
    console.error('Token extraction error:', error);
    return null;
  }
}

/**
 * Get authentication status from request
 * This is the main function used by middleware
 */
export async function getAuthStatus(request: NextRequest): Promise<AuthResult> {
  return await verifyFirebaseToken(request);
}
