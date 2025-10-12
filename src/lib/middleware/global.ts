import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { verifyAccessToken, extractBearerToken } from '@/lib/jwt-utils';

/**
 * Global middleware for page-level protection
 * Used in Next.js middleware.ts file
 */
export async function middleware(request: NextRequest) {
  try {
    let user = null;

    // Try JWT token first (for React Native apps accessing web routes)
    const authHeader = request.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (token) {
      const decoded = verifyAccessToken(token);
      if (decoded) {
        user = decoded;
      }
    }

    // Fallback to NextAuth token (for web)
    if (!user) {
      const nextAuthToken = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      });
      user = nextAuthToken;
    }

    // Protect admin routes
    if (request.nextUrl.pathname.startsWith('/admin')) {
      if (!user || user.userType !== 'ADMIN') {
        return NextResponse.redirect(
          new URL('/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url)
        );
      }
    }

    // Protect dashboard routes
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (!user) {
        return NextResponse.redirect(
          new URL('/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url)
        );
      }
    }

    // Protect candidate routes
    if (request.nextUrl.pathname.startsWith('/candidate')) {
      if (!user) {
        return NextResponse.redirect(
          new URL('/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url)
        );
      }
      if (user.userType !== 'CANDIDATE') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    // Protect employer routes
    if (request.nextUrl.pathname.startsWith('/employer')) {
      if (!user) {
        return NextResponse.redirect(
          new URL('/auth/signin?callbackUrl=' + encodeURIComponent(request.url), request.url)
        );
      }
      if (user.userType !== 'EMPLOYER') {
        return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/candidate/:path*', '/employer/:path*'],
};