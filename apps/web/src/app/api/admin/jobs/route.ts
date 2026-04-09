import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import {
  notificationService,
  type NewActiveJobNotificationEvent,
} from '@/lib/services/notification-service';
import { z } from 'zod';
import { JobStatus, JobType, WorkLocationType, ExperienceLevel, Prisma } from '@/generated/prisma';

// Validation schemas
const queryParamsSchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),

  // Sorting
  sortBy: z
    .enum([
      'createdAt',
      'updatedAt',
      'publishedAt',
      'title',
      'applicationCount',
      'viewCount',
      'applicationDeadline',
    ])
    .default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Filtering
  search: z.string().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  jobType: z.nativeEnum(JobType).optional(),
  workLocationType: z.nativeEnum(WorkLocationType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  companyId: z.string().optional(),
  recruiterId: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  urgent: z.coerce.boolean().optional(),

  // Date range filters
  createdFrom: z.string().datetime().optional(),
  createdTo: z.string().datetime().optional(),
  publishedFrom: z.string().datetime().optional(),
  publishedTo: z.string().datetime().optional(),
  deadlineFrom: z.string().datetime().optional(),
  deadlineTo: z.string().datetime().optional(),

  // Location filters
  locationCity: z.string().optional(),
  locationProvince: z.string().optional(),

  // Salary filters
  salaryMin: z.coerce.number().optional(),
  salaryMax: z.coerce.number().optional(),

  // Category and skills
  categoryId: z.string().optional(),
  skillIds: z.string().optional(), // comma-separated
});

const createJobSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  title: z.string().min(3).max(200),
  description: z.string().min(50),
  requirements: z.string().min(50),
  benefits: z.string().optional(),
  jobType: z.nativeEnum(JobType),
  workLocationType: z.nativeEnum(WorkLocationType),
  experienceLevel: z.nativeEnum(ExperienceLevel),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('VND'),
  salaryNegotiable: z.boolean().default(false),
  address: z.string().min(5).max(200).optional(),
  locationCity: z.string().optional(),
  locationProvince: z.string().optional(),
  locationCountry: z.string().default('Vietnam'),
  applicationDeadline: z.string().datetime().optional(),
  status: z.nativeEnum(JobStatus).default(JobStatus.PENDING),
  featured: z.boolean().default(false),
  urgent: z.boolean().default(false),

  // Related data
  skills: z
    .array(
      z.object({
        skillId: z.string(),
        name: z.string().optional(), // Allow skill name for creating new skills
        requiredLevel: z.enum(['NICE_TO_HAVE', 'PREFERRED', 'REQUIRED']),
        minYearsExperience: z.number().optional(),
      })
    )
    .optional(),
  categoryIds: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/jobs
 * Get paginated list of jobs with filtering, sorting, and search
 * Requires: job.view permission
 */
export const GET = withPermission('job.view', async (req: AuthenticatedRequest) => {
  try {
    const searchParams = Object.fromEntries(req.nextUrl.searchParams);
    const params = queryParamsSchema.parse(searchParams);

    // Build where clause
    const where: Prisma.JobWhereInput = {};

    // Text search
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { company: { companyName: { contains: params.search, mode: 'insensitive' } } },
      ];
    }

    // Status filter
    if (params.status) {
      where.status = params.status;
    }

    // Job type filters
    if (params.jobType) where.jobType = params.jobType;
    if (params.workLocationType) where.workLocationType = params.workLocationType;
    if (params.experienceLevel) where.experienceLevel = params.experienceLevel;

    // Company and recruiter filters
    if (params.companyId) where.companyId = params.companyId;
    if (params.recruiterId) where.recruiterId = params.recruiterId;

    // Boolean filters
    if (params.featured !== undefined) where.featured = params.featured;
    if (params.urgent !== undefined) where.urgent = params.urgent;

    // Date range filters
    if (params.createdFrom || params.createdTo) {
      where.createdAt = {};
      if (params.createdFrom) where.createdAt.gte = new Date(params.createdFrom);
      if (params.createdTo) where.createdAt.lte = new Date(params.createdTo);
    }

    if (params.publishedFrom || params.publishedTo) {
      where.publishedAt = {};
      if (params.publishedFrom) where.publishedAt.gte = new Date(params.publishedFrom);
      if (params.publishedTo) where.publishedAt.lte = new Date(params.publishedTo);
    }

    if (params.deadlineFrom || params.deadlineTo) {
      where.applicationDeadline = {};
      if (params.deadlineFrom) where.applicationDeadline.gte = new Date(params.deadlineFrom);
      if (params.deadlineTo) where.applicationDeadline.lte = new Date(params.deadlineTo);
    }

    // Location filters
    if (params.locationCity) {
      where.locationCity = { contains: params.locationCity, mode: 'insensitive' };
    }
    if (params.locationProvince) {
      where.locationProvince = { contains: params.locationProvince, mode: 'insensitive' };
    }

    // Salary filters
    if (params.salaryMin !== undefined || params.salaryMax !== undefined) {
      if (!Array.isArray(where.AND)) {
        where.AND = [];
      }
      if (params.salaryMin !== undefined) {
        where.AND.push({ salaryMax: { gte: params.salaryMin } });
      }
      if (params.salaryMax !== undefined) {
        where.AND.push({ salaryMin: { lte: params.salaryMax } });
      }
    }

    // Category filter
    if (params.categoryId) {
      where.jobCategories = {
        some: { categoryId: params.categoryId },
      };
    }

    // Skills filter
    if (params.skillIds) {
      const skillIds = params.skillIds.split(',');
      where.jobSkills = {
        some: { skillId: { in: skillIds } },
      };
    }

    // Build orderBy
    const orderBy: Prisma.JobOrderByWithRelationInput = {
      [params.sortBy]: params.sortOrder,
    };

    // Build stats where clause (without status filter for overall stats)
    const statsWhere: Prisma.JobWhereInput = { ...where };
    delete statsWhere.status; // Remove status filter for stats

    // Execute query with pagination and stats
    const [jobs, total, totalJobs, activeJobs, pendingJobs, closedJobs] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companySlug: true,
              logoUrl: true,
              verificationStatus: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              avatarUrl: true,
            },
          },
          jobCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          jobSkills: {
            include: {
              skill: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
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
      }),
      prisma.job.count({ where }),
      prisma.job.count({ where: statsWhere }),
      prisma.job.count({ where: { ...statsWhere, status: JobStatus.ACTIVE } }),
      prisma.job.count({ where: { ...statsWhere, status: JobStatus.PENDING } }),
      prisma.job.count({ where: { ...statsWhere, status: JobStatus.EXPIRED } }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / params.limit);
    const hasNextPage = params.page < totalPages;
    const hasPrevPage = params.page > 1;

    // Map jobs to include application count
    const mappedJobs = jobs.map((job) => ({
      ...job,
      applicationCount: job._count.applications,
      savedJobsCount: job._count.savedJobs,
      viewCount: job._count.jobViews,
    }));

    return NextResponse.json({
      success: true,
      data: {
        jobs: mappedJobs,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        stats: {
          totalJobs,
          activeJobs,
          pendingJobs,
          closedJobs,
        },
      },
    });
  } catch (error) {
    console.error('Admin jobs list error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: error.flatten(),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch jobs',
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/admin/jobs
 * Create a new job
 * Requires: job.create permission
 */
export const POST = withPermission('job.create', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();

    // Validate input
    const validationResult = createJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input',
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Verify company exists
    const company = await prisma.company.findUnique({
      where: { id: data.companyId },
    });

    if (!company) {
      return NextResponse.json(
        {
          success: false,
          error: 'Company not found',
        },
        { status: 404 }
      );
    }

    // Create job in transaction
    const job = await prisma.$transaction(async (tx) => {
      // Generate slug from title
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Ensure unique slug
      let slug = baseSlug;
      let counter = 1;
      while (await tx.job.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create the job
      const newJob = await tx.job.create({
        data: {
          companyId: data.companyId,
          recruiterId: req.user!.id,
          title: data.title,
          slug,
          description: data.description,
          requirements: data.requirements,
          benefits: data.benefits,
          jobType: data.jobType,
          workLocationType: data.workLocationType,
          experienceLevel: data.experienceLevel,
          salaryMin: data.salaryMin,
          salaryMax: data.salaryMax,
          currency: data.currency,
          salaryNegotiable: data.salaryNegotiable,
          address: data.address,
          locationCity: data.locationCity,
          locationProvince: data.locationProvince,
          locationCountry: data.locationCountry,
          applicationDeadline: data.applicationDeadline
            ? new Date(data.applicationDeadline)
            : undefined,
          status: data.status,
          featured: data.featured,
          urgent: data.urgent,
          publishedAt: data.status === JobStatus.ACTIVE ? new Date() : undefined,
        },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companySlug: true,
              logoUrl: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      // Add job skills if provided
      if (data.skills && data.skills.length > 0) {
        const jobSkillsData = [];

        for (const skillData of data.skills) {
          let skillId = skillData.skillId;

          // If skill ID is temporary (starts with 'temp-'), create the skill first
          if (skillId.startsWith('temp-') && skillData.name) {
            // Check if skill already exists
            let existingSkill = await tx.skill.findFirst({
              where: {
                name: { equals: skillData.name, mode: 'insensitive' },
              },
            });

            // Create skill if it doesn't exist
            if (!existingSkill) {
              // Generate base slug
              const baseSlug = skillData.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)/g, '');

              // Ensure unique slug
              let skillSlug = baseSlug;
              let slugCounter = 1;
              while (await tx.skill.findUnique({ where: { slug: skillSlug } })) {
                skillSlug = `${baseSlug}-${slugCounter}`;
                slugCounter++;
              }

              existingSkill = await tx.skill.create({
                data: {
                  name: skillData.name,
                  slug: skillSlug,
                  category: 'TECHNICAL', // Default category, you can make this configurable
                },
              });
            }

            skillId = existingSkill.id;
          }

          jobSkillsData.push({
            jobId: newJob.id,
            skillId: skillId,
            requiredLevel: skillData.requiredLevel as any,
            minYearsExperience: skillData.minYearsExperience || 0,
          });
        }

        await tx.jobSkill.createMany({
          data: jobSkillsData,
        });
      }

      // Add job categories if provided
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.jobCategory.createMany({
          data: data.categoryIds.map((categoryId) => ({
            jobId: newJob.id,
            categoryId,
          })),
        });
      }

      // Create audit log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CREATE_JOB',
          tableName: 'jobs',
          recordId: newJob.id,
          newValues: {
            jobId: newJob.id,
            title: newJob.title,
            status: newJob.status,
            companyId: newJob.companyId,
          },
          ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown',
        },
      });

      return newJob;
    });

    if (job.status === JobStatus.ACTIVE) {
      const notificationEvent: NewActiveJobNotificationEvent = {
        jobId: job.id,
        jobTitle: job.title,
        companyId: job.company.id,
        companyName: job.company.companyName,
      };

      await notificationService.notifyFollowersOfNewActiveJobs([notificationEvent]);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Job created successfully',
        data: job,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create job',
      },
      { status: 500 }
    );
  }
});
