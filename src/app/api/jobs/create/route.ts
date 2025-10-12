import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { z } from 'zod';

// Validation schema for creating a job
const createJobSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(50),
  requirements: z.string().min(50),
  benefits: z.string().optional(),
  jobType: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  workLocationType: z.enum(['ONSITE', 'REMOTE', 'HYBRID']),
  experienceLevel: z.enum(['ENTRY', 'MID', 'SENIOR', 'LEAD', 'EXECUTIVE']),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('VND'),
  salaryNegotiable: z.boolean().default(false),
  locationCity: z.string().optional(),
  locationProvince: z.string().optional(),
  applicationDeadline: z.string().datetime().optional(),
  skills: z.array(z.object({
    skillId: z.string(),
    requiredLevel: z.enum(['NICE_TO_HAVE', 'PREFERRED', 'REQUIRED']),
    minYearsExperience: z.number().optional(),
  })).optional(),
  categoryIds: z.array(z.string()).optional(),
});

// POST - Create a new job (requires 'job.create' permission)
export const POST = withPermission('job.create', async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Validate input
    const validationResult = createJobSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    
    // Get the company ID for the current user
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        userId: req.user!.id,
        role: {
          in: ['ADMIN', 'RECRUITER', 'HR_MANAGER']
        }
      },
      include: {
        company: true
      }
    });

    if (!companyUser) {
      return NextResponse.json(
        { error: 'You must be associated with a company to create jobs' },
        { status: 403 }
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
          companyId: companyUser.companyId,
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
          locationCity: data.locationCity,
          locationProvince: data.locationProvince,
          applicationDeadline: data.applicationDeadline ? new Date(data.applicationDeadline) : undefined,
          status: 'DRAFT',
        },
      });

      // Add job skills if provided
      if (data.skills && data.skills.length > 0) {
        await tx.jobSkill.createMany({
          data: data.skills.map(skill => ({
            jobId: newJob.id,
            skillId: skill.skillId,
            requiredLevel: skill.requiredLevel,
            minYearsExperience: skill.minYearsExperience,
          })),
        });
      }

      // Add job categories if provided
      if (data.categoryIds && data.categoryIds.length > 0) {
        await tx.jobCategory.createMany({
          data: data.categoryIds.map(categoryId => ({
            jobId: newJob.id,
            categoryId,
          })),
        });
      }

      return newJob;
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_JOB',
        tableName: 'jobs',
        recordId: job.id,
        newValues: { jobId: job.id, title: job.title },
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Job created successfully',
      data: {
        id: job.id,
        slug: job.slug,
        title: job.title,
        status: job.status,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create job error:', error);
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    );
  }
});
