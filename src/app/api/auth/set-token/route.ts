import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import {
  AUTH_COOKIE_NAME,
  AUTH_COOKIE_MAX_AGE,
  AUTH_COOKIE_SECURE,
  AUTH_COOKIE_SAME_SITE,
  AUTH_COOKIE_HTTP_ONLY,
} from '@/lib/config/auth-config';
import { withErrorHandler } from '@/lib/api-error-handler';

/**
 * POST /api/auth/set-token
 * Sets Firebase ID token in HTTP-only cookie
 */
export const POST = withErrorHandler(async (request: NextRequest) => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Authorization header required' }, { status: 401 });
  }

  const idToken = authHeader.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ error: 'Token not provided' }, { status: 401 });
  }

  try {
    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(idToken);

    // Set HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, idToken, {
      httpOnly: AUTH_COOKIE_HTTP_ONLY,
      secure: AUTH_COOKIE_SECURE,
      sameSite: AUTH_COOKIE_SAME_SITE,
      maxAge: AUTH_COOKIE_MAX_AGE,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Token verification failed:', error);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
});
