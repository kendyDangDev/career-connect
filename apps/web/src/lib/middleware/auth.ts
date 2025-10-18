import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getToken } from 'next-auth/jwt';
import { authOptions } from '@/lib/auth-config';
import { UserType } from '@/generated/prisma';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/auth';
import { verifyAccessToken, extractBearerToken, isTokenBlacklisted } from '@/lib/jwt-utils';
import { prisma } from '@/lib/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    userType: UserType;
    firstName?: string | null;
    lastName?: string | null;
  };
  ip?: string;
}

/**
 * Enhanced authentication function that supports both JWT tokens and NextAuth sessions
 */
export async function authenticateUser(
  req: NextRequest
): Promise<AuthenticatedRequest['user'] | null> {
  let user = null;

  // First, try to get user from Bearer token (React Native/Mobile apps)
  const authHeader = req.headers.get('authorization');
  const token = extractBearerToken(authHeader);

  if (token) {
    console.log('Auth middleware - Processing token:', token.substring(0, 50) + '...');

    // Check if token is blacklisted
    if (!isTokenBlacklisted(token)) {
      let decoded = null;

      // First try custom JWT_SECRET (for mobile app tokens)
      decoded = verifyAccessToken(token);
      if (decoded) {
        console.log('Auth middleware - Decoded with JWT_SECRET:', decoded);
      } else {
        console.log('Auth middleware - JWT_SECRET failed, trying NEXTAUTH_SECRET');
        // Try with NEXTAUTH_SECRET (for internal socket tokens)
        try {
          const jwt = require('jsonwebtoken');
          decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
          console.log('Auth middleware - Decoded with NEXTAUTH_SECRET:', decoded);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Unknown error';
          console.log('Auth middleware - NEXTAUTH_SECRET also failed:', errorMessage);
        }
      }

      const userId = decoded?.id || decoded?.userId;
      if (decoded && userId) {
        console.log('Auth middleware - Found user ID:', userId);

        // Verify user still exists and is active
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            userType: true,
            firstName: true,
            lastName: true,
            status: true,
          },
        });

        console.log('Auth middleware - DB user lookup result:', dbUser);

        if (dbUser && dbUser.status === 'ACTIVE') {
          user = {
            id: dbUser.id,
            email: dbUser.email,
            userType: dbUser.userType as UserType,
            firstName: dbUser.firstName,
            lastName: dbUser.lastName,
          };
          console.log('Auth middleware - Successfully authenticated user:', user.id);
        } else {
          console.log('Auth middleware - User not found or inactive');
        }
      } else {
        console.log('Auth middleware - Invalid token - no user ID found');
      }
    } else {
      console.log('Auth middleware - Token is blacklisted');
    }
  } else {
    console.log('Auth middleware - No Bearer token found');
  }

  // If no Bearer token or invalid, try NextAuth session (Web apps)
  if (!user) {
    // Try NextAuth JWT token first (more efficient)
    const nextAuthToken = await getToken({
      req: req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (nextAuthToken && nextAuthToken.id) {
      // Verify user exists in database
      const dbUser = await prisma.user.findUnique({
        where: { id: nextAuthToken.id as string },
        select: {
          id: true,
          email: true,
          userType: true,
          firstName: true,
          lastName: true,
          status: true,
        },
      });

      if (dbUser && dbUser.status === 'ACTIVE') {
        user = {
          id: dbUser.id,
          email: dbUser.email,
          userType: dbUser.userType as UserType,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
        };
      }
    } else {
      // Fallback to session (less efficient but more compatible)
      const session = await getServerSession(authOptions);
      if (session?.user && session.user.id) {
        user = {
          id: session.user.id,
          email: session.user.email,
          userType: session.user.userType,
          firstName: session.user.firstName,
          lastName: session.user.lastName,
        };
      }
    }
  }

  return user;
}

/**
 * Basic authentication middleware - checks if user is logged in
 */
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const user = await authenticateUser(req);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to continue' },
        { status: 401 }
      );
    }

    // Add user and IP to request object
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = user;
    authenticatedReq.ip = getClientIP(req);

    return await handler(authenticatedReq);
  };
}

/**
 * Role-based authorization middleware
 */
export function withRole(
  allowedRoles: UserType[],
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !allowedRoles.includes(req.user.userType)) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have permission to access this resource' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req);
  };
}

/**
 * Admin-only authorization middleware (shorthand for withRole(['ADMIN']))
 */
export function withAdmin(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return withRole(['ADMIN'], handler);
}

/**
 * Permission-based authorization middleware
 */
export function withPermission(
  requiredPermission: Permission,
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !hasPermission(req.user.userType, requiredPermission)) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have the required permission' },
          { status: 403 }
        );
      }
      return handler(req, context);
    })(req);
  };
}

/**
 * Multiple permissions authorization middleware (ANY)
 */
export function withAnyPermission(
  permissions: Permission[],
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !hasAnyPermission(req.user.userType, permissions)) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have any of the required permissions' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req);
  };
}

/**
 * Multiple permissions authorization middleware (ALL)
 */
export function withAllPermissions(
  permissions: Permission[],
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      if (!req.user || !hasAllPermissions(req.user.userType, permissions)) {
        return NextResponse.json(
          { error: 'Forbidden - You do not have all of the required permissions' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req);
  };
}

/**
 * Ownership-based authorization middleware
 */
export function withOwnership(
  checkOwnership: (req: AuthenticatedRequest) => Promise<boolean>,
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return (req: NextRequest, context?: any) => {
    return withAuth(async (req: AuthenticatedRequest) => {
      const isOwner = await checkOwnership(req);

      if (!isOwner && req.user?.userType !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Forbidden - You can only access your own resources' },
          { status: 403 }
        );
      }

      return handler(req, context);
    })(req);
  };
}

/**
 * Optional authentication - doesn't fail if no user is authenticated
 */
export function withOptionalAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const user = await authenticateUser(req);

    const authenticatedReq = req as AuthenticatedRequest;
    if (user) {
      authenticatedReq.user = user;
    }
    authenticatedReq.ip = getClientIP(req);

    return await handler(authenticatedReq);
  };
}

/**
 * Extract client IP address from request headers
 */
export function getClientIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-client-ip') ||
    'unknown'
  );
}

/**
 * Helper function to get user from request (for use in handlers)
 */
export function getUserFromRequest(req: NextRequest) {
  return (req as AuthenticatedRequest).user || null;
}

/**
 * Backwards compatibility function for authenticate
 * Returns NextResponse if authentication fails, null if succeeds
 */
export async function authenticate(req: NextRequest): Promise<NextResponse | null> {
  const user = await authenticateUser(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized - Please login to continue' }, { status: 401 });
  }

  // Add user to request for getUserFromRequest
  const authenticatedReq = req as AuthenticatedRequest;
  authenticatedReq.user = user;
  authenticatedReq.ip = getClientIP(req);

  return null; // No error, authentication succeeded
}
