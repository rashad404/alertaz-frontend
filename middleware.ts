import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';

function getLocale(request: NextRequest): string {
  // For now, return the default locale
  // Later you can implement Accept-Language header parsing
  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for static files and Next.js internals
  if (
    pathname.includes('_next') ||
    pathname.includes('/api/') ||
    pathname.includes('.') // has file extension
  ) {
    return NextResponse.next();
  }

  // Check if pathname starts with a non-default locale (en or ru)
  const nonDefaultLocales = i18n.locales.filter(locale => locale !== 'az');
  const hasNonDefaultLocale = nonDefaultLocales.some(
    locale => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Check if pathname starts with /az (which we want to redirect)
  const hasAzPrefix = pathname.startsWith('/az/') || pathname === '/az';

  // If URL has /az prefix, redirect to URL without it
  if (hasAzPrefix) {
    const newPathname = pathname.replace(/^\/az(\/|$)/, '/');
    const url = new URL(newPathname || '/', request.url);
    // Preserve query parameters during redirect
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url);
  }

  // If no locale prefix and not a default locale path, treat as 'az' locale
  if (!hasNonDefaultLocale) {
    // Rewrite to /az path internally (not redirect)
    const newUrl = `/az${pathname === '/' ? '' : pathname}`;
    // Preserve query parameters
    const url = new URL(newUrl, request.url);
    url.search = request.nextUrl.search;
    return NextResponse.rewrite(url);
  }

  // Don't add cache headers in development
  const response = NextResponse.next();

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Cache-Control', 's-maxage=1, stale-while-revalidate');
    response.headers.set('X-Build-Version', Date.now().toString());
  }

  return response;
}

export const config = {
  // Matcher ignoring `/_next/`, `/api/`, and static files
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};