import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';

// Response utilities
export function successResponse(data: any, message: string = 'Success', statusCode: number = 200) {
  return NextResponse.json({
    success: true,
    message,
    data,
  }, { status: statusCode });
}

export function errorResponse(message: string, statusCode: number = 400, errors?: any) {
  return NextResponse.json({
    success: false,
    message,
    ...(errors && { errors }),
  }, { status: statusCode });
}

// Pagination response
export function paginatedResponse(
  data: any[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success'
) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return NextResponse.json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNext,
      hasPrev,
    },
  });
}

// Error handler
export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    return errorResponse('Validation failed', 400, formattedErrors);
  }

  if (error instanceof Error) {
    // Check for Prisma errors
    if (error.message.includes('P2002')) {
      return errorResponse('Duplicate entry found', 409);
    }
    if (error.message.includes('P2025')) {
      return errorResponse('Record not found', 404);
    }
    if (error.message.includes('P2003')) {
      return errorResponse('Foreign key constraint failed', 400);
    }

    return errorResponse(error.message, 500);
  }

  return errorResponse('Internal server error', 500);
}

// Auth check utility
export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Check if user has access to resource
export async function hasAccessToCV(cvId: string, userId: string, prisma: any) {
  try {
    const cv = await prisma.userCv.findFirst({
      where: {
        id: cvId,
        userId: userId,
      },
    });
    return !!cv;
  } catch (error) {
    console.error('Error checking CV access:', error);
    return false;
  }
}

// Parse request body safely
export async function parseRequestBody(request: NextRequest) {
  try {
    const body = await request.json();
    return body;
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}

// Build Prisma order by clause
export function buildOrderBy(sortBy?: string, sortOrder: 'asc' | 'desc' = 'desc') {
  if (!sortBy) {
    return { createdAt: 'desc' };
  }
  return { [sortBy]: sortOrder };
}

// Build Prisma where clause for search
export function buildSearchWhere(search?: string, fields: string[] = []) {
  if (!search || fields.length === 0) {
    return {};
  }

  return {
    OR: fields.map(field => ({
      [field]: {
        contains: search,
        mode: 'insensitive',
      },
    })),
  };
}

// Validate UUID
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Check required authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    return errorResponse('Authentication required', 401);
  }
  return user;
}
