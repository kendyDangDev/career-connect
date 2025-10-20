import { prisma } from '@/lib/prisma';
import { Prisma, JobStatus } from '@/generated/prisma';

export interface PublicJobListParams {
  page?: number;
  limit?: number;
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  salaryMin?: number;
  salaryMax?: number;
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
      salaryMin,
      salaryMax,
      locationCity,
      locationProvince,
      categoryId,
      companyId,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = params;

    // Build where conditions
    const whereConditions: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
    };

    if (search) {
      whereConditions.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locationCity: { contains: search, mode: 'insensitive' } },
        { locationProvince: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (jobType) whereConditions.jobType = jobType as Prisma.EnumJobTypeFilter<'Job'>;
    if (experienceLevel && experienceLevel !== 'undefined')
      whereConditions.experienceLevel = experienceLevel as Prisma.EnumExperienceLevelFilter<'Job'>;

    // Build AND conditions for salary range filtering.
    // Convert inputs to numbers (caller may pass strings). Behavior:
    // - If both reqSalaryMin and reqSalaryMax provided: require job.salaryMin >= reqSalaryMin AND job.salaryMax <= reqSalaryMax
    //   (job's salary range entirely inside requested range)
    // - If only reqSalaryMin provided: require job.salaryMax >= reqSalaryMin (potential overlap above min)
    // - If only reqSalaryMax provided: require job.salaryMin <= reqSalaryMax (potential overlap below max)
    const andConditions: Prisma.JobWhereInput[] = [];
    const reqSalaryMin =
      salaryMin !== undefined && salaryMin !== null ? Number(salaryMin) : undefined;
    const reqSalaryMax =
      salaryMax !== undefined && salaryMax !== null ? Number(salaryMax) : undefined;

    const hasMin = reqSalaryMin !== undefined && !Number.isNaN(reqSalaryMin as number);
    const hasMax = reqSalaryMax !== undefined && !Number.isNaN(reqSalaryMax as number);

    if (hasMin && hasMax) {
      // Require the job's salary range to be fully inside requested range
      andConditions.push({ salaryMin: { gte: reqSalaryMin } });
      andConditions.push({ salaryMax: { lte: reqSalaryMax } });
    } else if (hasMin) {
      // If only min provided, require the job's minimum salary to meet the requested minimum
      andConditions.push({ salaryMin: { gte: reqSalaryMin } });
    } else if (hasMax) {
      // If only max provided, require the job's maximum salary to be at most the requested max
      andConditions.push({ salaryMax: { lte: reqSalaryMax } });
    }

    if (locationCity)
      whereConditions.locationCity = { contains: locationCity, mode: 'insensitive' };
    if (locationProvince)
      whereConditions.locationProvince = { contains: locationProvince, mode: 'insensitive' };
    if (companyId) whereConditions.companyId = companyId;
    if (categoryId) {
      whereConditions.jobCategories = {
        some: {
          categoryId,
        },
      };
    }

    // Combine all conditions
    let where: Prisma.JobWhereInput = { ...whereConditions };

    // Merge existing AND conditions (if any) with salary-related ANDs instead of replacing.
    if (andConditions.length > 0) {
      const existingAnd = (where.AND as Prisma.JobWhereInput[]) ?? [];
      where.AND = [...existingAnd, ...andConditions];
    }

    // return where;

    const orderBy: Prisma.JobOrderByWithRelationInput = {};
    (orderBy as any)[sortBy] = sortOrder as Prisma.SortOrder;

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
