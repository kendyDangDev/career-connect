import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withAuth, AuthenticatedRequest } from '@/lib/middleware/auth';
import { z } from 'zod';

// Query schema for candidates
const getCandidatesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
  availabilityStatus: z.enum(['AVAILABLE', 'NOT_AVAILABLE', 'PASSIVE']).optional(),
  preferredWorkType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'FREELANCE']).optional(),
  minExperience: z.coerce.number().int().min(0).optional(),
  maxExperience: z.coerce.number().int().min(0).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// GET /api/candidates - List candidates with pagination and filters
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const parse = getCandidatesQuerySchema.safeParse(Object.fromEntries(searchParams));

    if (!parse.success) {
      return NextResponse.json(
        { error: 'Invalid query params', details: parse.error.flatten() },
        { status: 400 }
      );
    }

    const {
      page,
      limit,
      search,
      status,
      availabilityStatus,
      preferredWorkType,
      minExperience,
      maxExperience,
      sortBy,
      sortOrder,
    } = parse.data;

    // Build where clause
    const where: any = {
      userType: 'CANDIDATE',
    };

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { candidate: { currentPosition: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (status) {
      where.status = status;
    }

    // Candidate specific filters
    if (availabilityStatus) {
      where.candidate = where.candidate || {};
      where.candidate.availabilityStatus = availabilityStatus;
    }

    if (preferredWorkType) {
      where.candidate = where.candidate || {};
      where.candidate.preferredWorkType = preferredWorkType;
    }

    if (minExperience !== undefined || maxExperience !== undefined) {
      where.candidate = where.candidate || {};
      where.candidate.experienceYears = {};
      if (minExperience !== undefined) {
        where.candidate.experienceYears.gte = minExperience;
      }
      if (maxExperience !== undefined) {
        where.candidate.experienceYears.lte = maxExperience;
      }
    }

    // Handle sorting
    let orderBy: any = {};
    if (sortBy === 'experienceYears') {
      orderBy = { candidate: { experienceYears: sortOrder } };
    } else if (sortBy === 'currentPosition') {
      orderBy = { candidate: { currentPosition: sortOrder } };
    } else {
      orderBy = { [sortBy]: sortOrder };
    }

    // Execute queries
    const [total, candidates] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          status: true,
          emailVerified: true,
          phoneVerified: true,
          createdAt: true,
          updatedAt: true,
          profile: {
            select: {
              city: true,
              province: true,
              country: true,
            },
          },
          candidate: {
            select: {
              id: true,
              currentPosition: true,
              experienceYears: true,
              availabilityStatus: true,
              preferredWorkType: true,
              preferredLocationType: true,
              expectedSalaryMin: true,
              expectedSalaryMax: true,
              currency: true,
              skills: {
                select: {
                  skill: {
                    select: {
                      id: true,
                      name: true,
                      category: true,
                    },
                  },
                  proficiencyLevel: true,
                },
                take: 5, // Limit skills for list view
              },
            },
          },
        },
      }),
    ]);

    // Format response
    const formattedCandidates = candidates.map((user) => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      status: user.status,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      profile: user.profile,
      candidateInfo: user.candidate
        ? {
            ...user.candidate,
            expectedSalaryMin: user.candidate.expectedSalaryMin
              ? parseFloat(user.candidate.expectedSalaryMin.toString())
              : null,
            expectedSalaryMax: user.candidate.expectedSalaryMax
              ? parseFloat(user.candidate.expectedSalaryMax.toString())
              : null,
          }
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedCandidates,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/candidates error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
