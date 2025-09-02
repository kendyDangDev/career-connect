import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { UserType } from '@/generated/prisma';
import { Permission, hasPermission, hasAnyPermission, hasAllPermissions } from '@/types/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    userType: UserType;
  };
  ip?: string;
}

// Authentication middleware - checks if user is logged in
export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest) => {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to continue' },
        { status: 401 }
      );
    }

    // Add user to request object
    const authenticatedReq = req as AuthenticatedRequest;
    authenticatedReq.user = {
      id: session.user.id,
      email: session.user.email,
      userType: session.user.userType,
    };

    // Extract IP address from various possible headers
    authenticatedReq.ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      req.headers.get('cf-connecting-ip') ||
      'unknown';

    return await handler(authenticatedReq);
  };
}

// Role-based authorization middleware
export function withRole(
  allowedRoles: UserType[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user || !allowedRoles.includes(req.user.userType)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have permission to access this resource' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Permission-based authorization middleware
export function withPermission(
  requiredPermission: Permission,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user || !hasPermission(req.user.userType, requiredPermission)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have the required permission' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Multiple permissions authorization middleware (ANY)
export function withAnyPermission(
  permissions: Permission[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user || !hasAnyPermission(req.user.userType, permissions)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have any of the required permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Multiple permissions authorization middleware (ALL)
export function withAllPermissions(
  permissions: Permission[],
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user || !hasAllPermissions(req.user.userType, permissions)) {
      return NextResponse.json(
        { error: 'Forbidden - You do not have all of the required permissions' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}

// Helper function to check ownership before allowing access
export function withOwnership(
  checkOwnership: (req: AuthenticatedRequest) => Promise<boolean>,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): (req: NextRequest) => Promise<NextResponse> {
  return withAuth(async (req: AuthenticatedRequest) => {
    const isOwner = await checkOwnership(req);

    if (!isOwner && req.user?.userType !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - You can only access your own resources' },
        { status: 403 }
      );
    }

    return handler(req);
  });
}
