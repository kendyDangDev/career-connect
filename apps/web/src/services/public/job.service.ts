import { prisma } from '@/lib/prisma';
import { Prisma, JobStatus } from '@/generated/prisma';

export interface PublicJobListParams {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  locationCity?: string;
  locationProvince?: string;
  categoryId?: string;
  companyId?: string;
  sortBy?: 'createdAt' | 'publishedAt' | 'viewCount' | 'applicationCount';
  sortOrder?: 'asc' | 'desc';
}

export class PublicJobService {
  static async list(params: PublicJobListParams) {
    const {
      page = 1,
      limit = 10,
      search,
      jobType,
      experienceLevel,
      locationCity,
      locationProvince,
      categoryId,
      companyId,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locationCity: { contains: search, mode: 'insensitive' } },
        { locationProvince: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (jobType) where.jobType = jobType as any;
    if (experienceLevel) where.experienceLevel = experienceLevel as any;
    if (locationCity) where.locationCity = { contains: locationCity, mode: 'insensitive' };
    if (locationProvince)
      where.locationProvince = { contains: locationProvince, mode: 'insensitive' };
    if (companyId) where.companyId = companyId;
    if (categoryId) {
      where.jobCategories = {
        some: {
          categoryId,
        },
      };
    }

    const orderBy: Prisma.JobOrderByWithRelationInput = {};
    (orderBy as any)[sortBy] = sortOrder;

    const [jobs, total] = await Promise.all([
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
          applicationDeadline: true,
          status: true,
          viewCount: true,
          applicationCount: true,
          featured: true,
          urgent: true,
          createdAt: true,
          updatedAt: true,
          publishedAt: true,
          description: true,
          requirements: true,
          benefits: true,

          company: {
            select: {
              id: true,
              companyName: true,
              companySlug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    return {
      jobs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async detailByIdOrSlug(idOrSlug: string) {
    const job = await prisma.job.findFirst({
      where: {
        status: JobStatus.ACTIVE,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
      include: {
        company: {
          select: {
            id: true,
            companyName: true,
            companySlug: true,
            logoUrl: true,
            verificationStatus: true,
            websiteUrl: true,
            city: true,
          },
        },
        jobSkills: {
          include: {
            skill: true,
          },
        },
        jobCategories: {
          include: {
            category: true,
          },
        },
        _count: {
          select: {
            applications: true,
            savedJobs: true,
            jobViews: true,
          },
        },
      },
    });
    return job;
  }
}
