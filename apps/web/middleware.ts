import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to handle CORS for all API routes
 * Allows all origins while properly handling credentials
 */
console.log('middle called');
export function middleware(request: NextRequest) {
  console.log('middleware called');
  const isPreflight = request.method === 'OPTIONS';
  const url = request.nextUrl.pathname;
  const origin = request.headers.get('origin');

  // Always log for debugging
  console.log(
    `[MIDDLEWARE] ${request.method} ${url} - Origin: ${origin || 'none'} - isPreflight: ${isPreflight}`
  );

  // Log request for debugging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[CORS] ${request.method} ${url} - Origin: ${origin || 'none'}`);
  }

  // Create response
  const response = isPreflight ? new Response(null, { status: 200 }) : NextResponse.next();

  // Add CORS headers for API routes
  if (url.startsWith('/api/')) {
    // When credentials are included, we must specify the exact origin
    // instead of using '*' for Access-Control-Allow-Origin
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin);
    } else {
      // For requests without origin (server-to-server), use wildcard
      response.headers.set('Access-Control-Allow-Origin', '*');
    }

    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, Cookie'
    );
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
  ],
};
