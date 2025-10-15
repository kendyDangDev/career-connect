import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { JobStatus, JobType, WorkLocationType, ExperienceLevel } from '@/generated/prisma';

interface Params {
  params: {
    id: string;
  };
}

const updateJobSchema = z.object({
  title: z.string().min(3).max(200).optional(),
  description: z.string().min(50).optional(),
  requirements: z.string().min(50).optional(),
  benefits: z.string().nullable().optional(),
  jobType: z.nativeEnum(JobType).optional(),
  workLocationType: z.nativeEnum(WorkLocationType).optional(),
  experienceLevel: z.nativeEnum(ExperienceLevel).optional(),
  salaryMin: z.number().nullable().optional(),
  salaryMax: z.number().nullable().optional(),
  currency: z.string().optional(),
  salaryNegotiable: z.boolean().optional(),
  address: z.string().max(200).optional(),
  locationCity: z.string().optional(),
  locationProvince: z.string().optional(),
  locationCountry: z.string().optional(),
  applicationDeadline: z.string().nullable().optional(),
  status: z.nativeEnum(JobStatus).optional(),
  featured: z.boolean().optional(),
  urgent: z.boolean().optional(),

  // Related data
  skills: z
    .array(
      z.object({
        skillId: z.string(),
        requiredLevel: z.enum(['NICE_TO_HAVE', 'PREFERRED', 'REQUIRED']),
        minYearsExperience: z.number().optional(),
      })
    )
    .optional(),
  categoryIds: z.array(z.string()).optional(),
});

/**
 * GET /api/admin/jobs/:id
 * Get job details by ID
 * Requires: job.view permission
 */
export const GET = withPermission(
  'job.view',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;

      const job = await prisma.job.findUnique({
        where: { id },
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companySlug: true,
              logoUrl: true,
              verificationStatus: true,
              description: true,
              websiteUrl: true,
              city: true,
              province: true,
              companySize: true,
            },
          },
          recruiter: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
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
                  category: true,
                },
              },
            },
          },
          applications: {
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
                    orderBy: {
                      proficiencyLevel: 'desc',
                    },
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
            orderBy: {
              appliedAt: 'desc',
            },
            take: 10,
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

      if (!job) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
          },
          { status: 404 }
        );
      }

      // Get current date ranges
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      // Get statistics for current week
      const [
        currentWeekViews,
        previousWeekViews,
        currentWeekApplications,
        previousWeekApplications,
        currentWeekSaved,
        previousWeekSaved,
      ] = await Promise.all([
        // Current week views
        prisma.jobView.count({
          where: {
            jobId: id,
            viewedAt: {
              gte: oneWeekAgo,
            },
          },
        }),
        // Previous week views
        prisma.jobView.count({
          where: {
            jobId: id,
            viewedAt: {
              gte: twoWeeksAgo,
              lt: oneWeekAgo,
            },
          },
        }),
        // Current week applications
        prisma.application.count({
          where: {
            jobId: id,
            appliedAt: {
              gte: oneWeekAgo,
            },
          },
        }),
        // Previous week applications
        prisma.application.count({
          where: {
            jobId: id,
            appliedAt: {
              gte: twoWeeksAgo,
              lt: oneWeekAgo,
            },
          },
        }),
        // Current week saved jobs
        prisma.savedJob.count({
          where: {
            jobId: id,
            createdAt: {
              gte: oneWeekAgo,
            },
          },
        }),
        // Previous week saved jobs
        prisma.savedJob.count({
          where: {
            jobId: id,
            createdAt: {
              gte: twoWeeksAgo,
              lt: oneWeekAgo,
            },
          },
        }),
      ]);

      // Calculate percentage changes
      const calculateChange = (current: number, previous: number) => {
        if (previous === 0) {
          return current > 0 ? '+100%' : '0%';
        }
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
      };

      const calculateChangeType = (current: number, previous: number): 'increase' | 'decrease' => {
        return current >= previous ? 'increase' : 'decrease';
      };

      // Calculate conversion rates
      // Use the counter fields from database for better performance and consistency
      const totalViews = job.viewCount || job._count.jobViews || 0;
      const totalApplications = job.applicationCount || job._count.applications || 0;
      const totalSaved = job._count.savedJobs || 0;

      const currentConversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

      const previousWeekConversionRate =
        previousWeekViews > 0 ? (previousWeekApplications / previousWeekViews) * 100 : 0;

      return NextResponse.json({
        success: true,
        data: {
          ...job,
          statistics: {
            // Basic stats - prioritize counter fields over _count for performance
            totalViews: totalViews,
            totalApplications: totalApplications,
            totalSaved: totalSaved,
            conversionRate: currentConversionRate.toFixed(1),

            // Weekly comparison stats
            viewsChange: calculateChange(currentWeekViews, previousWeekViews),
            viewsChangeType: calculateChangeType(currentWeekViews, previousWeekViews),
            applicationsChange: calculateChange(currentWeekApplications, previousWeekApplications),
            applicationsChangeType: calculateChangeType(
              currentWeekApplications,
              previousWeekApplications
            ),
            savedChange: calculateChange(currentWeekSaved, previousWeekSaved),
            savedChangeType: calculateChangeType(currentWeekSaved, previousWeekSaved),
            conversionChange: calculateChange(currentConversionRate, previousWeekConversionRate),
            conversionChangeType: calculateChangeType(
              currentConversionRate,
              previousWeekConversionRate
            ),

            // Detailed weekly stats
            currentWeek: {
              views: currentWeekViews,
              applications: currentWeekApplications,
              saved: currentWeekSaved,
              conversionRate:
                currentWeekViews > 0
                  ? ((currentWeekApplications / currentWeekViews) * 100).toFixed(1)
                  : '0',
            },
            previousWeek: {
              views: previousWeekViews,
              applications: previousWeekApplications,
              saved: previousWeekSaved,
              conversionRate:
                previousWeekViews > 0
                  ? ((previousWeekApplications / previousWeekViews) * 100).toFixed(1)
                  : '0',
            },
          },
        },
      });
    } catch (error) {
      console.error('Get job error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch job',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/admin/jobs/:id
 * Update job details
 * Requires: job.update permission
 */
export const PUT = withPermission(
  'job.edit',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;
      const body = await req.json();

      console.log('🔍 Request body received:', body);

      // Validate input
      const validationResult = updateJobSchema.safeParse(body);
      if (!validationResult.success) {
        console.log('❌ Validation failed:', validationResult.error.flatten());
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

      // Check if job exists
      const existingJob = await prisma.job.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          status: true,
          slug: true,
        },
      });

      if (!existingJob) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
          },
          { status: 404 }
        );
      }

      // Update job in transaction
      const updatedJob = await prisma.$transaction(async (tx) => {
        // Update slug if title changed
        let newSlug = existingJob.slug;
        if (data.title && data.title !== existingJob.title) {
          const baseSlug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          newSlug = baseSlug;
          let counter = 1;
          while (
            await tx.job.findFirst({
              where: {
                slug: newSlug,
                NOT: { id },
              },
            })
          ) {
            newSlug = `${baseSlug}-${counter}`;
            counter++;
          }
        }

        // Update job
        const job = await tx.job.update({
          where: { id },
          data: {
            title: data.title,
            slug: newSlug,
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
            publishedAt:
              data.status === JobStatus.ACTIVE && existingJob.status !== JobStatus.ACTIVE
                ? new Date()
                : undefined,
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

        // Update skills if provided
        if (data.skills !== undefined) {
          // Delete existing skills
          await tx.jobSkill.deleteMany({
            where: { jobId: id },
          });

          // Add new skills
          if (data.skills.length > 0) {
            await tx.jobSkill.createMany({
              data: data.skills.map((skill) => ({
                jobId: id,
                skillId: skill.skillId,
                requiredLevel: skill.requiredLevel as any,
                minYearsExperience: skill.minYearsExperience,
              })),
            });
          }
        }

        console.log('category Ids:', data.categoryIds);
        console.log('DATA in backend:', data);

        // Update categories if provided
        if (data.categoryIds !== undefined) {
          // Delete existing categories
          await tx.jobCategory.deleteMany({
            where: { jobId: id },
          });

          // Add new categories
          if (data.categoryIds.length > 0) {
            await tx.jobCategory.createMany({
              data: data.categoryIds.map((categoryId) => ({
                jobId: id,
                categoryId,
              })),
            });
          }
        }

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'UPDATE_JOB',
            tableName: 'jobs',
            recordId: id,
            oldValues: existingJob,
            newValues: data,
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
          },
        });

        return job;
      });

      return NextResponse.json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob,
      });
    } catch (error) {
      console.error('Update job error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update job',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/admin/jobs/:id
 * Delete job (soft delete by changing status to CLOSED)
 * Requires: job.delete permission
 */
export const DELETE = withPermission(
  'job.delete',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;

      // Check if job exists
      const existingJob = await prisma.job.findUnique({
        where: { id },
        select: {
          id: true,
          title: true,
          status: true,
          _count: {
            select: {
              applications: {
                where: {
                  status: {
                    in: ['APPLIED', 'SCREENING', 'INTERVIEWING', 'OFFERED'],
                  },
                },
              },
            },
          },
        },
      });

      if (!existingJob) {
        return NextResponse.json(
          {
            success: false,
            error: 'Job not found',
          },
          { status: 404 }
        );
      }

      // Check if there are active applications
      if (existingJob._count.applications > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Cannot delete job with active applications',
            details: `This job has ${existingJob._count.applications} active applications`,
          },
          { status: 400 }
        );
      }

      // Soft delete by updating status
      await prisma.$transaction(async (tx) => {
        // Update job status to CLOSED
        await tx.job.update({
          where: { id },
          data: {
            status: JobStatus.CLOSED,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'DELETE_JOB',
            tableName: 'jobs',
            recordId: id,
            oldValues: { status: existingJob.status },
            newValues: { status: JobStatus.CLOSED },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
          },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Job deleted successfully',
      });
    } catch (error) {
      console.error('Delete job error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete job',
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/admin/jobs/:id
 * Update job status
 * Requires: job.update permission
 */
export const PATCH = withPermission(
  'job.edit',
  async (req: AuthenticatedRequest, { params }: Params) => {
    try {
      const { id } = await params;
      const { status, reason } = await req.json();

      // Validate status
      if (!Object.values(JobStatus).includes(status)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid status',
          },
          { status: 400 }
        );
      }

      // Update job status
      const job = await prisma.$transaction(async (tx) => {
        const updatedJob = await tx.job.update({
          where: { id },
          data: {
            status,
            publishedAt: status === JobStatus.ACTIVE ? new Date() : undefined,
          },
          select: {
            id: true,
            title: true,
            status: true,
          },
        });

        // Create audit log
        await tx.auditLog.create({
          data: {
            userId: req.user!.id,
            action: 'UPDATE_JOB_STATUS',
            tableName: 'jobs',
            recordId: id,
            newValues: { status, reason },
            ipAddress: req.headers.get('x-forwarded-for') || 'unknown',
            userAgent: req.headers.get('user-agent') || 'unknown',
          },
        });

        return updatedJob;
      });

      return NextResponse.json({
        success: true,
        message: 'Job status updated successfully',
        data: job,
      });
    } catch (error) {
      console.error('Update job status error:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update job status',
        },
        { status: 500 }
      );
    }
  }
);
