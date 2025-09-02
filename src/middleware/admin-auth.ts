import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';
import { UserType } from '../generated/prisma';

export interface AdminAuthContext {
  user: {
    id: string;
    email: string;
    userType: UserType;
    firstName?: string | null;
    lastName?: string | null;
  };
}

export async function withAdminAuth(
  request: NextRequest,
  handler: (req: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session from NextAuth
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized',
          message: 'Bạn cần đăng nhập để thực hiện thao tác này',
        },
        { status: 401 }
      );
    }

    // Get user details from database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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
        {
          success: false,
          error: 'User not found',
          message: 'Người dùng không tồn tại',
        },
        { status: 404 }
      );
    }

    // Check if user is admin
    if (user.userType !== UserType.ADMIN) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'Bạn không có quyền thực hiện thao tác này',
        },
        { status: 403 }
      );
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        {
          success: false,
          error: 'Account suspended',
          message: 'Tài khoản của bạn đã bị tạm ngưng',
        },
        { status: 403 }
      );
    }

    // Call the handler with admin context
    const context: AdminAuthContext = {
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };

    return await handler(request, context);
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: 'Đã có lỗi xảy ra, vui lòng thử lại sau',
      },
      { status: 500 }
    );
  }
}

// Helper function to create admin-only route handler
export function createAdminHandler(
  handler: (req: NextRequest, context: AdminAuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    return withAdminAuth(req, handler);
  };
}

// Audit log helper
export async function createAuditLog(
  userId: string,
  action: string,
  tableName: string,
  recordId: string,
  oldValues?: any,
  newValues?: any,
  request?: NextRequest
) {
  try {
    const ipAddress =
      request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || 'unknown';
    const userAgent = request?.headers.get('user-agent') || 'unknown';

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : null,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : null,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit log failure shouldn't break the main operation
  }
}

// Permission check helper (for future use)
export function checkPermission(
  userPermissions: string[] | undefined,
  requiredPermission: string
): boolean {
  if (!userPermissions) return false;
  return userPermissions.includes(requiredPermission) || userPermissions.includes('*'); // Super admin
}

// Rate limiting helper
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  userId: string,
  limit: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const userLimit = requestCounts.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    requestCounts.set(userId, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (userLimit.count >= limit) {
    return false;
  }

  userLimit.count++;
  return true;
}

// Response helpers
export function successResponse<T>(data: T, message?: string, status: number = 200): NextResponse {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    },
    { status }
  );
}

export function errorResponse(error: string, message: string, status: number = 400): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error,
      message,
    },
    { status }
  );
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  status: number = 200
): NextResponse {
  const totalPages = Math.ceil(total / limit);

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    },
    { status }
  );
}
