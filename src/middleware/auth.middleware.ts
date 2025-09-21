import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken } from '@/lib/jwt-utils';
import { prisma } from '@/lib/prisma';
import { UserType } from '@/generated/prisma';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    userType: UserType;
    firstName: string | null;
    lastName: string | null;
  };
}

/**
 * Middleware to authenticate JWT token
 */
export async function authenticate(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Account is inactive or suspended' },
        { status: 403 }
      );
    }

    // Add user to request object
    (req as any).user = user;
    return null; // Continue to the route handler
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

/**
 * Middleware to check if user has required role(s)
 */
export function authorize(...allowedRoles: UserType[]) {
  return async (req: NextRequest) => {
    const authResult = await authenticate(req);
    if (authResult) return authResult;

    const user = (req as any).user;
    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    if (!allowedRoles.includes(user.userType)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    return null; // Continue to the route handler
  };
}

/**
 * Optional authentication - doesn't fail if no token, but adds user if token is valid
 */
export async function optionalAuth(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader);

    if (!token) {
      return null; // No token, but that's okay
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return null; // Invalid token, but that's okay
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        status: true,
      },
    });

    if (user && user.status === 'ACTIVE') {
      (req as any).user = user;
    }

    return null; // Continue to the route handler
  } catch (error) {
    console.error('Optional auth error:', error);
    return null; // Continue without user
  }
}

/**
 * Helper to get user from request
 */
export function getUserFromRequest(req: NextRequest) {
  return (req as any).user || null;
}