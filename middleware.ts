import { NextRequest, NextResponse } from 'next/server';
import { getAuthStatus } from '@/lib/auth/middleware-auth';
import createIntlMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

/**
 * Next.js 15 Middleware for Authentication, Route Protection, and i18n
 * Handles server-side auth redirects, route protection, and internationalization
 */

// Define protected routes that require authentication
const PROTECTED_ROUTES = ['/chat', '/conversations'];
const AUTH_ROUTES = ['/login', '/auth/callback'];

// Create i18n middleware
const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only show /en for non-default
});

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

  // Handle auth callback route BEFORE i18n middleware
  if (pathname === '/auth/callback') {
    return NextResponse.next();
  }

  // Handle i18n routing
  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    return intlResponse;
  }

  // Get authentication status using Firebase token verification
  const authResult = await getAuthStatus(request);
  const isAuthenticated = authResult.isAuthenticated;

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
     * - locales (i18n files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|locales).*)',
  ],
};
