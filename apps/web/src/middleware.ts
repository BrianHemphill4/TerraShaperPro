import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AppConfig, AllLocales } from './utils/AppConfig';

// Helper function to get allowed origins
function getAllowedOrigins(): string[] {
  const origins: string[] = [];
  
  // Development origins
  if (process.env.NODE_ENV === 'development') {
    origins.push(
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'http://127.0.0.1:3002'
    );
  }
  
  // Production origins
  if (process.env.NEXT_PUBLIC_API_URL) {
    origins.push(process.env.NEXT_PUBLIC_API_URL);
  }
  
  // Add production domains
  origins.push(
    'https://terrashaperpro.com',
    'https://www.terrashaperpro.com',
    'https://app.terrashaperpro.com',
    'https://api.terrashaperpro.com'
  );
  
  return origins;
}

// Apply security headers
function applySecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const origin = request.headers.get('origin');
    const allowedOrigins = getAllowedOrigins();
    
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    }
    
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT,OPTIONS');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return NextResponse.rewrite(new URL(request.url), { status: 200, headers: response.headers });
    }
  }
  
  // Security headers for all routes
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  
  // Only apply HSTS in production
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Content Security Policy - exclude upgrade-insecure-requests in development
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' blob: data: https: http://localhost:*",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self' https://clerk.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://api.sentry.io https://*.ingest.sentry.io",
    "frame-src 'self' https://clerk.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "media-src 'self'",
    "object-src 'none'",
    ...(process.env.NODE_ENV === 'production' ? ["upgrade-insecure-requests"] : []),
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', cspHeader);
  
  return response;
}

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  '/api(.*)',
  '/:locale/api(.*)',
]);

export default function middleware(
  request: NextRequest,
  event: NextFetchEvent,
) {
  if (
    request.nextUrl.pathname.includes('/sign-in')
    || request.nextUrl.pathname.includes('/sign-up')
    || isProtectedRoute(request)
  ) {
    return clerkMiddleware(async (auth, req) => {
      if (isProtectedRoute(req)) {
        const locale
          = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';

        const signInUrl = new URL(`${locale}/sign-in`, req.url);

        await auth.protect({
          // `unauthenticatedUrl` is needed to avoid error: "Unable to find `next-intl` locale because the middleware didn't run on this request"
          unauthenticatedUrl: signInUrl.toString(),
        });
      }

      const authObj = await auth();

      if (
        authObj.userId
        && !authObj.orgId
        && req.nextUrl.pathname.includes('/dashboard')
        && !req.nextUrl.pathname.endsWith('/organization-selection')
      ) {
        const orgSelection = new URL(
          '/onboarding/organization-selection',
          req.url,
        );

        return NextResponse.redirect(orgSelection);
      }

      const response = intlMiddleware(req);
      return applySecurityHeaders(response, req);
    })(request, event);
  }

  const response = intlMiddleware(request);
  return applySecurityHeaders(response, request);
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
