import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME } from '@/lib/config/auth-config';
import { withErrorHandler } from '@/lib/api-error-handler';

/**
 * POST /api/auth/clear-token
 * Clears Firebase ID token cookie
 */
export const POST = withErrorHandler(async (_request: NextRequest) => {
  const response = NextResponse.json({ success: true });

  // Clear the auth cookie
  response.cookies.delete(AUTH_COOKIE_NAME);

  return response;
});
