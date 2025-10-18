import { NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const getApplicationsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
  search: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['appliedAt', 'name', 'experience']).default('appliedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

interface Params {
  params: {
    id: string;
  };
}

/**
 * GET /api/admin/jobs/:id/applications
 * Get paginated applications for a job with detailed candidate information
 * Requires: job.view permission
 */
export const GET = withPermission(
  'job.view',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id: jobId } = await params;
      const { searchParams } = new URL(req.url);

      // Parse and validate query parameters
      const queryParams = {
        page: parseInt(searchParams.get('page') || '1'),
        limit: parseInt(searchParams.get('limit') || '10'),
        search: searchParams.get('search') || undefined,
        status: searchParams.get('status') || undefined,
        sortBy: (searchParams.get('sortBy') as 'appliedAt' | 'name' | 'experience') || 'appliedAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      };

      const validationResult = getApplicationsSchema.safeParse(queryParams);
      if (!validationResult.success) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid query parameters',
            details: validationResult.error.flatten(),
          },
          { status: 400 }
        );
      }

      const { page, limit, search, status, sortBy, sortOrder } = validationResult.data;

      // Check if job exists
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true },
      });

      if (!job) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
          },
          { status: 404 }
        );
      }

      // Build where clause
      const where: any = {
        jobId,
      };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          {
            candidate: {
              user: {
                firstName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            candidate: {
              user: {
                lastName: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
          {
            candidate: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive',
                },
              },
            },
          },
        ];
      }

      // Build order by clause
      let orderBy: any;
      switch (sortBy) {
        case 'appliedAt':
          orderBy = { appliedAt: sortOrder };
          break;
        case 'name':
          orderBy = {
            candidate: {
              user: {
                firstName: sortOrder,
              },
            },
          };
          break;
        case 'experience':
          orderBy = {
            candidate: {
              experienceYears: sortOrder,
            },
          };
          break;
        default:
          orderBy = { appliedAt: sortOrder };
      }

      // Get applications with pagination
      const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          select: {
            id: true,
            status: true,
            appliedAt: true,
            statusUpdatedAt: true,
            coverLetter: true,
            cvFileUrl: true,
            recruiterNotes: true,
            rating: true,
            interviewScheduledAt: true,
            candidate: {
              select: {
                id: true,
                currentPosition: true,
                experienceYears: true,
                expectedSalaryMin: true,
                expectedSalaryMax: true,
                currency: true,
                availabilityStatus: true,
                preferredWorkType: true,
                preferredLocationType: true,
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phone: true,
                    avatarUrl: true,
                    profile: {
                      select: {
                        dateOfBirth: true,
                        gender: true,
                        address: true,
                        city: true,
                        province: true,
                        bio: true,
                        websiteUrl: true,
                        linkedinUrl: true,
                        githubUrl: true,
                        portfolioUrl: true,
                      },
                    },
                  },
                },
                skills: {
                  select: {
                    proficiencyLevel: true,
                    yearsExperience: true,
                    skill: {
                      select: {
                        id: true,
                        name: true,
                        category: true,
                      },
                    },
                  },
                  orderBy: [{ proficiencyLevel: 'desc' }, { yearsExperience: 'desc' }],
                },
                experience: {
                  select: {
                    id: true,
                    companyName: true,
                    positionTitle: true,
                    employmentType: true,
                    startDate: true,
                    endDate: true,
                    isCurrent: true,
                    description: true,
                    achievements: true,
                  },
                  orderBy: {
                    startDate: 'desc',
                  },
                },
                education: {
                  select: {
                    id: true,
                    institutionName: true,
                    degreeType: true,
                    fieldOfStudy: true,
                    startDate: true,
                    endDate: true,
                    gpa: true,
                    description: true,
                  },
                  orderBy: {
                    startDate: 'desc',
                  },
                },
                certifications: {
                  select: {
                    id: true,
                    certificationName: true,
                    issuingOrganization: true,
                    issueDate: true,
                    expiryDate: true,
                    credentialUrl: true,
                  },
                  orderBy: {
                    issueDate: 'desc',
                  },
                },
                cvs: {
                  select: {
                    id: true,
                    cvName: true,
                    fileUrl: true,
                    fileSize: true,
                    mimeType: true,
                    isPrimary: true,
                    uploadedAt: true,
                    viewCount: true,
                  },
                  orderBy: [{ isPrimary: 'desc' }, { uploadedAt: 'desc' }],
                },
              },
            },
          },
        }),
        prisma.application.count({ where }),
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Get status counts
      const statusCounts = await prisma.application.groupBy({
        by: ['status'],
        where: { jobId },
        _count: { status: true },
      });

      const statusCountsMap = statusCounts.reduce(
        (acc, item) => {
          acc[item.status] = item._count.status;
          return acc;
        },
        { all: totalCount } as Record<string, number>
      );

      return NextResponse.json({
        success: true,
        data: {
          applications,
          pagination: {
            page,
            limit,
            totalCount,
            totalPages,
            hasNextPage,
            hasPrevPage,
          },
          statusCounts: statusCountsMap,
          job: {
            id: job.id,
            title: job.title,
          },
        },
      });
    } catch (error) {
      console.error('Get job applications error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch applications',
        },
        { status: 500 }
      );
    }
  }
);
