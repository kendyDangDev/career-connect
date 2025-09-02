import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRole, AuthenticatedRequest } from '@/middleware/auth';
import { UserType, UserStatus } from '@/generated/prisma';

// GET - List all users (ADMIN only)
export const GET = withRole(['ADMIN'], async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Filters
    const userType = searchParams.get('userType') as UserType | null;
    const status = searchParams.get('status') as UserStatus | null;
    const search = searchParams.get('search');

    // Build where clause
    const where: any = {};
    if (userType) where.userType = userType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }

    // Get users with pagination
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          userType: true,
          status: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              city: true,
              province: true,
              country: true,
            },
          },
          companyUsers: {
            include: {
              company: {
                select: {
                  id: true,
                  companyName: true,
                },
              },
            },
          },
          candidate: {
            select: {
              id: true,
              currentPosition: true,
              experienceYears: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.user.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Create audit log for viewing user list
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'VIEW_USER_LIST',
        tableName: 'users',
        recordId: 'all',
        newValues: { filters: { userType, status, search } },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      },
    });
  } catch (error) {
    console.error('List users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
});

// PATCH - Update user status/role (ADMIN only)
export const PATCH = withRole(['ADMIN'], async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Validate updates
    const allowedUpdates = ['status', 'userType'];
    const updateKeys = Object.keys(updates);
    const isValidUpdate = updateKeys.every((key) => allowedUpdates.includes(key));

    if (!isValidUpdate) {
      return NextResponse.json({ error: 'Invalid update fields' }, { status: 400 });
    }

    // Prevent admin from changing their own role
    if (userId === req.user!.id && updates.userType) {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 403 });
    }

    // Get current user data for audit log
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        status: true,
        userType: true,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        userType: true,
        status: true,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_USER',
        tableName: 'users',
        recordId: userId,
        oldValues: currentUser,
        newValues: updates,
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
});
