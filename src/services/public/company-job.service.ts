import { prisma } from '@/lib/prisma';
import { Prisma, JobStatus, JobType, ExperienceLevel, WorkLocationType } from '@/generated/prisma';

export interface CompanyJobsParams {
  page?: number;
  limit?: number;
  jobType?: string;
  experienceLevel?: string;
  workLocationType?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeExpired?: boolean;
}

export class CompanyJobService {
  /**
   * Get all jobs for a specific company
   * @param companySlugOrId - Company slug or ID
   * @param params - Query parameters for filtering and pagination
   */
  static async getCompanyJobs(companySlugOrId: string, params: CompanyJobsParams) {
    const {
      page = 1,
      limit = 10,
      jobType,
      experienceLevel,
      workLocationType,
      search,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
      includeExpired = false,
    } = params;

    // First, find the company
    const company = await prisma.company.findFirst({
      where: {
        OR: [{ id: companySlugOrId }, { companySlug: companySlugOrId }],
      },
      select: {
        id: true,
        companyName: true,
        companySlug: true,
        logoUrl: true,
        coverImageUrl: true,
        description: true,
        websiteUrl: true,
        address: true,
        city: true,
        province: true,
        country: true,
        companySize: true,
        foundedYear: true,
        verificationStatus: true,
        industry: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            jobs: {
              where: {
                status: JobStatus.ACTIVE,
              },
            },
            companyFollowers: true,
          },
        },
      },
    });

    if (!company) {
      return null;
    }

    // Build where conditions for jobs
    const where: Prisma.JobWhereInput = {
      companyId: company.id,
      status: includeExpired ? { in: [JobStatus.ACTIVE, JobStatus.EXPIRED] } : JobStatus.ACTIVE,
    };

    // Apply filters
    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    if (jobType) {
      where.jobType = jobType as JobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel as ExperienceLevel;
    }

    if (workLocationType) {
      where.workLocationType = workLocationType as WorkLocationType;
    }

    // If not including expired, filter out jobs past deadline
    if (!includeExpired) {
      where.OR = [{ applicationDeadline: null }, { applicationDeadline: { gte: new Date() } }];
    }

    // Build orderBy
    const orderBy: Prisma.JobOrderByWithRelationInput = {};

    // Handle special sorting cases
    if (sortBy === 'salary') {
      orderBy.salaryMax = sortOrder;
    } else if (sortBy === 'applicationDeadline') {
      orderBy.applicationDeadline = sortOrder;
    } else {
      (orderBy as any)[sortBy] = sortOrder;
    }

    // Execute queries in parallel
    const [jobs, totalJobs] = await Promise.all([
      prisma.job.findMany({
        where,
        select: {
          id: true,
          title: true,
          slug: true,
          jobType: true,
          workLocationType: true,
          experienceLevel: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
          salaryNegotiable: true,
          locationCity: true,
          locationProvince: true,
          locationCountry: true,
          applicationDeadline: true,
          status: true,
          viewCount: true,
          applicationCount: true,
          featured: true,
          urgent: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,

          // Include skills
          jobSkills: {
            select: {
              requiredLevel: true,
              minYearsExperience: true,
              skill: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  category: true,
                },
              },
            },
          },

          // Include categories
          jobCategories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },

          // Count applications and saved
          _count: {
            select: {
              applications: true,
              savedJobs: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Get job statistics for the company
    const jobStats = await prisma.job.groupBy({
      by: ['status'],
      where: {
        companyId: company.id,
      },
      _count: {
        status: true,
      },
    });

    const stats = {
      active: 0,
      closed: 0,
      expired: 0,
      pending: 0,
      total: 0,
    };

    jobStats.forEach((stat) => {
      const status = stat.status.toLowerCase() as keyof typeof stats;
      if (status in stats) {
        stats[status] = stat._count.status;
        stats.total += stat._count.status;
      }
    });

    return {
      company: {
        ...company,
        stats: {
          totalJobs: stats.total,
          activeJobs: stats.active,
          totalFollowers: company._count.companyFollowers,
        },
      },
      jobs,
      pagination: {
        page,
        limit,
        total: totalJobs,
        totalPages: Math.ceil(totalJobs / limit),
        hasNext: page < Math.ceil(totalJobs / limit),
        hasPrev: page > 1,
      },
      jobStats: stats,
    };
  }

  /**
   * Get job statistics for a company
   * @param companyId - Company ID
   */
  static async getCompanyJobStats(companyId: string) {
    const [
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      jobsByType,
      jobsByLocation,
      recentJobs,
    ] = await Promise.all([
      // Total jobs count
      prisma.job.count({
        where: { companyId },
      }),

      // Active jobs count
      prisma.job.count({
        where: {
          companyId,
          status: JobStatus.ACTIVE,
        },
      }),

      // Total applications
      prisma.application.count({
        where: {
          job: { companyId },
        },
      }),

      // Total job views
      prisma.jobView.count({
        where: {
          job: { companyId },
        },
      }),

      // Jobs by type
      prisma.job.groupBy({
        by: ['jobType'],
        where: {
          companyId,
          status: JobStatus.ACTIVE,
        },
        _count: {
          jobType: true,
        },
      }),

      // Jobs by location
      prisma.job.groupBy({
        by: ['locationCity'],
        where: {
          companyId,
          status: JobStatus.ACTIVE,
          locationCity: { not: null },
        },
        _count: {
          locationCity: true,
        },
        orderBy: {
          _count: {
            locationCity: 'desc',
          },
        },
        take: 5,
      }),

      // Recent jobs
      prisma.job.findMany({
        where: {
          companyId,
          status: JobStatus.ACTIVE,
        },
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
          applicationCount: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
      }),
    ]);

    return {
      totalJobs,
      activeJobs,
      totalApplications,
      totalViews,
      jobsByType: jobsByType.map((item) => ({
        type: item.jobType,
        count: item._count.jobType,
      })),
      topLocations: jobsByLocation.map((item) => ({
        city: item.locationCity,
        count: item._count.locationCity,
      })),
      recentJobs,
      averageApplicationsPerJob: totalJobs > 0 ? Math.round(totalApplications / totalJobs) : 0,
      averageViewsPerJob: totalJobs > 0 ? Math.round(totalViews / totalJobs) : 0,
    };
  }
}
