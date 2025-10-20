import { NextResponse } from 'next/server';
import { withCompanyAuth, CompanyAuthenticatedRequest } from '@/lib/middleware/company-auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@/generated/prisma';

export const GET = withCompanyAuth(async (request: CompanyAuthenticatedRequest) => {
  try {
    const companyId = request.company!.id;

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const jobId = searchParams.get('jobId') || '';
    const sortBy = searchParams.get('sortBy') || 'appliedAt';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    // Build where clause
    const where: any = {
      job: {
        companyId,
      },
    };

    // Add filters
    if (jobId) {
      where.jobId = jobId;
    }

    if (status) {
      const statuses = status.split(',');
      where.status = {
        in: statuses,
      };
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
        {
          job: {
            title: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    // Get total count
    const total = await prisma.application.count({ where });

    // Get paginated applications
    const applications = await prisma.application.findMany({
      where,
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                avatarUrl: true,
              },
            },
            skills: {
              include: {
                skill: true,
              },
            },
          },
        },
        job: {
          select: {
            id: true,
            title: true,
            address: true,
            locationCity: true,
            locationProvince: true,
            workLocationType: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Format response
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      candidateId: app.candidateId,
      userId: app.candidate.userId, // User ID for conversations
      jobId: app.jobId,
      firstName: app.candidate.user.firstName || '',
      lastName: app.candidate.user.lastName || '',
      email: app.candidate.user.email,
      phone: app.candidate.user.phone,
      avatarUrl: app.candidate.user.avatarUrl,
      position: app.job.title,
      location:
        [app.job.locationCity, app.job.locationProvince].filter(Boolean).join(', ') ||
        app.job.address,
      experience: `${app.candidate.experienceYears}+ năm`,
      appliedDate: app.appliedAt.toISOString(),
      status: app.status,
      rating: app.rating,
      matchScore: 0, // matchScore is not in schema, defaulting to 0
      skills: app.candidate.skills.map((s) => s.skill.name),
      notes: app.recruiterNotes,
      coverLetter: app.coverLetter,
      cvFileUrl: app.cvFileUrl,
      interviewDate: app.interviewScheduledAt?.toISOString(),
    }));

    // Get stats by status
    const statsData = await prisma.application.groupBy({
      by: ['status'],
      where: {
        job: {
          companyId,
        },
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      total,
      byStatus: Object.values(ApplicationStatus).reduce(
        (acc, status) => {
          const found = statsData.find((s) => s.status === status);
          acc[status] = found?._count.status || 0;
          return acc;
        },
        {} as Record<ApplicationStatus, number>
      ),
    };

    return NextResponse.json({
      success: true,
      data: {
        applications: formattedApplications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      },
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch applications',
      },
      { status: 500 }
    );
  }
});
