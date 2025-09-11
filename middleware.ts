import { NextRequest, NextResponse } from 'next/server';
import { getAuthStatus } from '@/lib/auth/middleware-auth';

/**
 * Next.js 15 Middleware for Authentication and Route Protection
 * Handles server-side auth redirects and route protection
 */

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/chat', '/conversations'];
const AUTH_ROUTES = ['/login', '/auth/callback'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get authentication status using Firebase token verification
  const authResult = await getAuthStatus(request);
  const isAuthenticated = authResult.isAuthenticated;

  // Handle auth callback route
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/chat', request.url));
  }

  // Redirect unauthenticated users from protected routes
  if (!isAuthenticated && PROTECTED_ROUTES.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect root to appropriate page based on auth status
  if (pathname === '/') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/chat', request.url));
    } else {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
