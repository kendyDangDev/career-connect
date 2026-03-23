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
  skills?: string[];
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
      skills,
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
    // Treat the requested range as an overlap filter against the job salary range.
    const andConditions: Prisma.JobWhereInput[] = [];
    const reqSalaryMin =
      salaryMin !== undefined && salaryMin !== null ? Number(salaryMin) : undefined;
    const reqSalaryMax =
      salaryMax !== undefined && salaryMax !== null ? Number(salaryMax) : undefined;

    const hasMin = reqSalaryMin !== undefined && !Number.isNaN(reqSalaryMin as number);
    const hasMax = reqSalaryMax !== undefined && !Number.isNaN(reqSalaryMax as number);

    if (hasMin && hasMax) {
      andConditions.push({ salaryMin: { lte: reqSalaryMax } });
      andConditions.push({ salaryMax: { gte: reqSalaryMin } });
    } else if (hasMin) {
      andConditions.push({ salaryMax: { gte: reqSalaryMin } });
    } else if (hasMax) {
      andConditions.push({ salaryMin: { lte: reqSalaryMax } });
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
    const normalizedSkillTerms = [...new Set((skills ?? []).map((skill) => skill.trim()).filter(Boolean))];
    if (normalizedSkillTerms.length > 0) {
      andConditions.push({
        OR: normalizedSkillTerms.flatMap((skillTerm) => [
          {
            jobSkills: {
              some: {
                OR: [
                  {
                    skillId: skillTerm,
                  },
                  {
                    skill: {
                      name: {
                        contains: skillTerm,
                        mode: 'insensitive',
                      },
                    },
                  },
                ],
              },
            },
          },
          {
            requirements: {
              contains: skillTerm,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: skillTerm,
              mode: 'insensitive',
            },
          },
        ]),
      });
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
          address: true,
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
              companySize: true,
              description: true,
            },
          },
          jobSkills: {
            select: {
              requiredLevel: true,
              skill: {
                select: {
                  id: true,
                  name: true,
                },
              },
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
            companySize: true,
            description: true,
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
