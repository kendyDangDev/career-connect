import { prisma } from '@/lib/prisma';
import { Prisma, JobStatus, Job } from '@/generated/prisma';
import {
  CreateJobDTO,
  UpdateJobDTO,
  JobDetail,
  JobListItem,
  JobListResponse,
  JobListParams,
  JobStatistics,
  DuplicateJobDTO,
  UpdateJobStatusDTO,
} from '@/types/employer/job';
import { generateJobSlug } from '@/lib/utils/job-utils';
import {
  notificationService,
  type NewActiveJobNotificationEvent,
} from '@/lib/services/notification-service';

export class EmployerJobService {
  /**
   * Get paginated list of jobs for a company
   */
  static async getCompanyJobs(companyId: string, params: JobListParams): Promise<JobListResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      jobType,
      experienceLevel,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fromDate,
      toDate,
    } = params;

    // Build where clause
    const where: Prisma.JobWhereInput = {
      companyId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { locationCity: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    } else {
      // By default, don't show expired jobs unless specifically requested
      where.status = { not: JobStatus.EXPIRED };
    }

    if (jobType) {
      where.jobType = jobType;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Build orderBy
    const orderBy: Prisma.JobOrderByWithRelationInput = {};
    orderBy[sortBy] = sortOrder;

    // Execute queries
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
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.job.count({ where }),
    ]);

    // Get job stats
    const stats = await this.getJobStatusStats(companyId);

    return {
      jobs: jobs as JobListItem[],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    };
  }

  /**
   * Get job status statistics
   */
  private static async getJobStatusStats(companyId: string) {
    const statusCounts = await prisma.job.groupBy({
      by: ['status'],
      where: { companyId },
      _count: true,
    });

    const stats = {
      totalJobs: 0,
      activeJobs: 0,
      pendingJobs: 0,
      closedJobs: 0,
    };

    statusCounts.forEach(({ status, _count }) => {
      stats.totalJobs += _count;
      switch (status) {
        case JobStatus.ACTIVE:
          stats.activeJobs = _count;
          break;
        case JobStatus.PENDING:
          stats.pendingJobs = _count;
          break;
        case JobStatus.CLOSED:
        case JobStatus.EXPIRED:
          stats.closedJobs += _count;
          break;
      }
    });

    return stats;
  }

  /**
   * Get detailed job information
   */
  static async getJobDetail(jobId: string, companyId: string): Promise<JobDetail | null> {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
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

    return job as JobDetail;
  }

  /**
   * Create a new job posting
   */
  static async createJob(companyId: string, recruiterId: string, data: CreateJobDTO): Promise<Job> {
    // Get company name for slug
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: {
        companyName: true,
        address: true,
        city: true,
        province: true,
        country: true,
      },
    });

    // Generate unique slug
    let slug = generateJobSlug(data.title, company?.companyName);

    // Check if slug exists
    const existingCount = await prisma.job.count({
      where: {
        slug: {
          startsWith: slug,
        },
      },
    });

    if (existingCount > 0) {
      slug = `${slug}-${existingCount + 1}`;
    }

    // Extract skills and categories
    const { skills, categories, ...jobData } = data;

    // Create job with relations
    const job = await prisma.job.create({
      data: {
        ...jobData,
        slug,
        companyId,
        recruiterId,
        status: JobStatus.PENDING,
        address: company?.address?.trim() || null,
        locationCity: company?.city?.trim() || null,
        locationProvince: company?.province?.trim() || null,
        locationCountry: company?.country?.trim() || jobData.locationCountry || 'Vietnam',
        // Create skill relations
        ...(skills &&
          skills.length > 0 && {
            jobSkills: {
              create: skills.map((skill) => ({
                skillId: skill.skillId,
                requiredLevel: skill.requiredLevel,
                minYearsExperience: skill.minYearsExperience,
              })),
            },
          }),
        // Create category relations
        ...(categories &&
          categories.length > 0 && {
            jobCategories: {
              create: categories.map((categoryId) => ({
                categoryId,
              })),
            },
          }),
      },
    });

    return job;
  }

  /**
   * Update existing job
   */
  static async updateJob(
    jobId: string,
    companyId: string,
    data: UpdateJobDTO
  ): Promise<Job | null> {
    // Check if job exists and belongs to company
    const existingJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!existingJob) {
      return null;
    }

    // Extract skills and categories
    const { skills, categories, ...jobData } = data;
    const isBecomingActive =
      jobData.status === JobStatus.ACTIVE && existingJob.status !== JobStatus.ACTIVE;

    // If title changed, update slug
    if (data.title && data.title !== existingJob.title) {
      const company = await prisma.company.findUnique({
        where: { id: companyId },
        select: { companyName: true },
      });

      let newSlug = generateJobSlug(data.title, company?.companyName);

      // Check if new slug exists
      const existingCount = await prisma.job.count({
        where: {
          slug: {
            startsWith: newSlug,
          },
          id: { not: jobId },
        },
      });

      if (existingCount > 0) {
        newSlug = `${newSlug}-${existingCount + 1}`;
      }

      jobData.slug = newSlug;
    }

    // Update job in transaction
    let notificationEvent: NewActiveJobNotificationEvent | null = null;

    const updatedJob = await prisma.$transaction(async (tx) => {
      // Update job data
      const job = await tx.job.update({
        where: { id: jobId },
        data: {
          ...jobData,
          ...(isBecomingActive &&
            !existingJob.publishedAt && {
              publishedAt: new Date(),
            }),
          updatedAt: new Date(),
        },
      });

      // Update skills if provided
      if (skills !== undefined) {
        // Delete existing skills
        await tx.jobSkill.deleteMany({
          where: { jobId },
        });

        // Create new skills
        if (skills.length > 0) {
          await tx.jobSkill.createMany({
            data: skills.map((skill) => ({
              jobId,
              skillId: skill.skillId,
              requiredLevel: skill.requiredLevel,
              minYearsExperience: skill.minYearsExperience,
            })),
          });
        }
      }

      // Update categories if provided
      if (categories !== undefined) {
        // Delete existing categories
        await tx.jobCategory.deleteMany({
          where: { jobId },
        });

        // Create new categories
        if (categories.length > 0) {
          await tx.jobCategory.createMany({
            data: categories.map((categoryId) => ({
              jobId,
              categoryId,
            })),
          });
        }
      }

      if (isBecomingActive) {
        const company = await tx.company.findUnique({
          where: { id: companyId },
          select: { companyName: true },
        });

        if (company?.companyName) {
          notificationEvent = {
            jobId,
            jobTitle: job.title,
            companyId,
            companyName: company.companyName,
          };
        }
      }

      return job;
    });

    if (notificationEvent) {
      await notificationService.notifyFollowersOfNewActiveJobs([notificationEvent]);
    }

    return updatedJob;
  }

  /**
   * Update job status
   */
  static async updateJobStatus(
    jobId: string,
    companyId: string,
    data: UpdateJobStatusDTO
  ): Promise<{ success: boolean; message: string }> {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!job) {
      return { success: false, message: 'Job not found' };
    }

    const isBecomingActive = job.status !== JobStatus.ACTIVE && data.status === JobStatus.ACTIVE;

    let notificationEvent: NewActiveJobNotificationEvent | null = null;

    await prisma.$transaction(async (tx) => {
      await tx.job.update({
        where: { id: jobId },
        data: {
          status: data.status,
          ...(isBecomingActive &&
            !job.publishedAt && {
              publishedAt: new Date(),
            }),
          updatedAt: new Date(),
        },
      });

      if (isBecomingActive) {
        const company = await tx.company.findUnique({
          where: { id: companyId },
          select: { companyName: true },
        });

        if (company?.companyName) {
          notificationEvent = {
            jobId,
            jobTitle: job.title,
            companyId,
            companyName: company.companyName,
          };
        }
      }
    });

    if (notificationEvent) {
      await notificationService.notifyFollowersOfNewActiveJobs([notificationEvent]);
    }

    // TODO: If notifyApplicants is true, send notifications to all applicants

    return { success: true, message: `Job status updated to ${data.status}` };
  }

  /**
   * Duplicate a job
   */
  static async duplicateJob(
    jobId: string,
    companyId: string,
    recruiterId: string,
    data?: DuplicateJobDTO
  ): Promise<Job | null> {
    // Get original job with relations
    const originalJob = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
      include: {
        jobSkills: true,
        jobCategories: true,
      },
    });

    if (!originalJob) {
      return null;
    }

    // Prepare new job data
    const newTitle = data?.title || `${originalJob.title} (Copy)`;
    const company = await prisma.company.findUnique({
      where: { id: companyId },
      select: { companyName: true },
    });

    // Generate unique slug
    let slug = generateJobSlug(newTitle, company?.companyName);
    const existingCount = await prisma.job.count({
      where: {
        slug: {
          startsWith: slug,
        },
      },
    });

    if (existingCount > 0) {
      slug = `${slug}-${existingCount + 1}`;
    }

    // Create duplicated job
    const duplicatedJob = await prisma.job.create({
      data: {
        title: newTitle,
        slug,
        description: originalJob.description,
        requirements: originalJob.requirements,
        benefits: originalJob.benefits,
        jobType: originalJob.jobType,
        workLocationType: originalJob.workLocationType,
        experienceLevel: originalJob.experienceLevel,
        salaryMin: originalJob.salaryMin,
        salaryMax: originalJob.salaryMax,
        currency: originalJob.currency,
        salaryNegotiable: originalJob.salaryNegotiable,
        locationCity: originalJob.locationCity,
        locationProvince: originalJob.locationProvince,
        locationCountry: originalJob.locationCountry,
        applicationDeadline: originalJob.applicationDeadline,
        status: data?.status || JobStatus.PENDING,
        featured: false, // Reset featured status
        urgent: false, // Reset urgent status
        companyId,
        recruiterId,
        // Duplicate skills
        jobSkills: {
          create: originalJob.jobSkills.map((skill) => ({
            skillId: skill.skillId,
            requiredLevel: skill.requiredLevel,
            minYearsExperience: skill.minYearsExperience,
          })),
        },
        // Duplicate categories
        jobCategories: {
          create: originalJob.jobCategories.map((cat) => ({
            categoryId: cat.categoryId,
          })),
        },
      },
    });

    return duplicatedJob;
  }

  /**
   * Delete a job (soft delete by changing status)
   */
  static async deleteJob(jobId: string, companyId: string): Promise<boolean> {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!job) {
      return false;
    }

    // Soft delete by changing status to CLOSED
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: JobStatus.CLOSED,
        updatedAt: new Date(),
      },
    });

    return true;
  }

  /**
   * Get job statistics
   */
  static async getJobStatistics(jobId: string, companyId: string): Promise<JobStatistics | null> {
    // Verify job belongs to company
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!job) {
      return null;
    }

    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get view statistics
    const [totalViews, uniqueViews, viewsLastWeek, viewsLastMonth] = await Promise.all([
      prisma.jobView.count({ where: { jobId } }),
      prisma.jobView
        .groupBy({
          by: ['userId'],
          where: { jobId, userId: { not: null } },
          _count: true,
        })
        .then((result) => result.length),
      prisma.jobView.count({
        where: {
          jobId,
          viewedAt: { gte: lastWeek },
        },
      }),
      prisma.jobView.count({
        where: {
          jobId,
          viewedAt: { gte: lastMonth },
        },
      }),
    ]);

    // Get previous week for comparison
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const viewsPreviousWeek = await prisma.jobView.count({
      where: {
        jobId,
        viewedAt: { gte: twoWeeksAgo, lt: lastWeek },
      },
    });

    // Get application statistics
    const [totalApplications, applicationsLastWeek, applicationsLastMonth, applicationsByStatus] =
      await Promise.all([
        prisma.application.count({ where: { jobId } }),
        prisma.application.count({
          where: {
            jobId,
            appliedAt: { gte: lastWeek },
          },
        }),
        prisma.application.count({
          where: {
            jobId,
            appliedAt: { gte: lastMonth },
          },
        }),
        prisma.application.groupBy({
          by: ['status'],
          where: { jobId },
          _count: true,
        }),
      ]);

    // Get previous week applications for comparison
    const applicationsPreviousWeek = await prisma.application.count({
      where: {
        jobId,
        appliedAt: { gte: twoWeeksAgo, lt: lastWeek },
      },
    });

    // Get saved jobs count
    const totalSaved = await prisma.savedJob.count({ where: { jobId } });
    const savedLastWeek = await prisma.savedJob.count({
      where: {
        jobId,
        createdAt: { gte: lastWeek },
      },
    });
    const savedPreviousWeek = await prisma.savedJob.count({
      where: {
        jobId,
        createdAt: { gte: twoWeeksAgo, lt: lastWeek },
      },
    });

    // Calculate conversion rates
    const currentWeekConversion =
      viewsLastWeek > 0 ? (applicationsLastWeek / viewsLastWeek) * 100 : 0;
    const previousWeekConversion =
      viewsPreviousWeek > 0 ? (applicationsPreviousWeek / viewsPreviousWeek) * 100 : 0;
    const overallConversion = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

    // Calculate changes
    const viewsChange =
      viewsPreviousWeek > 0
        ? Math.abs(((viewsLastWeek - viewsPreviousWeek) / viewsPreviousWeek) * 100).toFixed(1)
        : '0';
    const viewsChangeType = viewsLastWeek >= viewsPreviousWeek ? 'increase' : 'decrease';

    const applicationsChange =
      applicationsPreviousWeek > 0
        ? Math.abs(
            ((applicationsLastWeek - applicationsPreviousWeek) / applicationsPreviousWeek) * 100
          ).toFixed(1)
        : '0';
    const applicationsChangeType =
      applicationsLastWeek >= applicationsPreviousWeek ? 'increase' : 'decrease';

    const savedChange =
      savedPreviousWeek > 0
        ? Math.abs(((savedLastWeek - savedPreviousWeek) / savedPreviousWeek) * 100).toFixed(1)
        : '0';
    const savedChangeType = savedLastWeek >= savedPreviousWeek ? 'increase' : 'decrease';

    const conversionChange =
      previousWeekConversion > 0
        ? Math.abs(
            ((currentWeekConversion - previousWeekConversion) / previousWeekConversion) * 100
          ).toFixed(1)
        : '0';
    const conversionChangeType =
      currentWeekConversion >= previousWeekConversion ? 'increase' : 'decrease';

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

    // TODO: Calculate average time to apply and get referrers from analytics
    return {
      // Basic stats
      totalViews,
      totalApplications,
      totalSaved,
      conversionRate: overallConversion.toFixed(2) + '%',

      // Weekly comparison
      viewsChange: viewsChange + '%',
      viewsChangeType: viewsChangeType as 'increase' | 'decrease',
      applicationsChange: applicationsChange + '%',
      applicationsChangeType: applicationsChangeType as 'increase' | 'decrease',
      savedChange: savedChange + '%',
      savedChangeType: savedChangeType as 'increase' | 'decrease',
      conversionChange: conversionChange + '%',
      conversionChangeType: conversionChangeType as 'increase' | 'decrease',

      // Detailed weekly stats
      currentWeek: {
        views: viewsLastWeek,
        applications: applicationsLastWeek,
        saved: savedLastWeek,
        conversionRate: currentWeekConversion.toFixed(2) + '%',
      },
      previousWeek: {
        views: viewsPreviousWeek,
        applications: applicationsPreviousWeek,
        saved: savedPreviousWeek,
        conversionRate: previousWeekConversion.toFixed(2) + '%',
      },

      // Legacy fields for backward compatibility
      uniqueViews,
      viewsLastWeek,
      viewsLastMonth,
      applicationsLastWeek,
      applicationsLastMonth,
      applicationsByStatus: applicationsByStatus.map((item) => ({
        status: item.status,
        count: item._count,
      })),
      viewsByDate: [], // TODO: Implement daily view tracking
      applicationsByDate: [], // TODO: Implement daily application tracking
      averageTimeToApply: 0, // TODO: Implement
      topReferrers: [], // TODO: Implement referrer tracking
    } as unknown as JobStatistics;
  }

  /**
   * Check if user has permission to manage job
   */
  static async checkJobPermission(
    jobId: string,
    companyId: string,
    userId: string
  ): Promise<boolean> {
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        companyId,
      },
    });

    if (!job) return false;

    // Check if user is part of the company
    const companyUser = await prisma.companyUser.findFirst({
      where: {
        companyId,
        userId,
      },
    });

    return !!companyUser;
  }

  /**
   * Auto-expire jobs past deadline
   */
  static async expireOverdueJobs(): Promise<number> {
    const result = await prisma.job.updateMany({
      where: {
        status: JobStatus.ACTIVE,
        applicationDeadline: {
          lt: new Date(),
        },
      },
      data: {
        status: JobStatus.EXPIRED,
        updatedAt: new Date(),
      },
    });

    return result.count;
  }
}
