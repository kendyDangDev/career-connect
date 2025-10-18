import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { getUsersQuerySchema } from '@/lib/validations/user.validation';

// GET /api/users - List users with pagination and filters
export const GET = withAuth(async (req: AuthenticatedRequest) => {

  try {
    const { searchParams } = new URL(req.url);
    const parse = getUsersQuerySchema.safeParse(Object.fromEntries(searchParams));
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid query params', details: parse.error.flatten() }, { status: 400 });
    }

    const { page, limit, search, userType, status, sortBy, sortOrder } = parse.data;

    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (userType) where.userType = userType;
    if (status) where.status = status;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          userType: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      data: users,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('GET /api/users error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

