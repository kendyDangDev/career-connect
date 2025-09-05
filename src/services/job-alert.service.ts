import { prisma } from '@/lib/prisma';
import {
  JobAlert,
  Prisma,
  AlertFrequency,
  JobStatus,
  JobType,
  ExperienceLevel
} from '@/generated/prisma';
import {
  GetJobAlertsParams,
  CreateJobAlertParams,
  UpdateJobAlertParams,
  DeleteJobAlertParams,
  ToggleJobAlertStatusParams,
  TestJobAlertParams,
  JobAlertWithRelations,
  JobAlertFilters,
  PaginationParams,
  JobAlertStatsResponse,
  parseJobAlertJsonFields
} from '@/types/job-alert.types';

export class JobAlertService {
  /**
   * Get paginated list of job alerts for a candidate
   */
  static async getJobAlerts({
    candidateId,
    filters = {},
    pagination = {}
  }: GetJobAlertsParams): Promise<{
    jobAlerts: JobAlertWithRelations[];
    total: number;
  }> {
    const {
      search,
      isActive,
      frequency,
      hasKeywords,
      hasLocations,
      hasCategories,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = filters;

    const { page = 1, limit = 20 } = pagination;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.JobAlertWhereInput = {
      candidateId,
      ...(search && {
        OR: [
          { alertName: { contains: search, mode: 'insensitive' } },
          { keywords: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(isActive !== undefined && { isActive }),
      ...(frequency && frequency.length > 0 && {
        frequency: { in: frequency }
      }),
      ...(hasKeywords === true && {
        NOT: { keywords: null }
      }),
      ...(hasKeywords === false && {
        keywords: null
      }),
      ...(hasLocations === true && {
        NOT: { locationIds: Prisma.DbNull }
      }),
      ...(hasLocations === false && {
        locationIds: Prisma.DbNull
      }),
      ...(hasCategories === true && {
        NOT: { categoryIds: Prisma.DbNull }
      }),
      ...(hasCategories === false && {
        categoryIds: Prisma.DbNull
      })
    };

    // Build orderBy clause
    const orderBy: Prisma.JobAlertOrderByWithRelationInput = {
      [sortBy]: sortOrder
    };

    // Execute queries in parallel
    const [jobAlerts, total] = await Promise.all([
      prisma.jobAlert.findMany({
        where,
        include: {
          candidate: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.jobAlert.count({ where })
    ]);

    // Add matching jobs count for each alert
    const alertsWithCounts = await Promise.all(
      jobAlerts.map(async (alert) => {
        const matchingJobsCount = await this.countMatchingJobs(alert);
        return {
          ...alert,
          _count: {
            matchingJobs: matchingJobsCount
          }
        } as JobAlertWithRelations;
      })
    );

    return {
      jobAlerts: alertsWithCounts,
      total
    };
  }

  /**
   * Create a new job alert
   */
  static async createJobAlert({
    candidateId,
    data
  }: CreateJobAlertParams): Promise<JobAlertWithRelations> {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId }
    });

    if (!candidate) {
      throw new Error('Candidate not found');
    }

    // Check alert limit (e.g., max 10 alerts per candidate)
    const alertCount = await prisma.jobAlert.count({
      where: { candidateId }
    });

    if (alertCount >= 10) {
      throw new Error('Maximum number of job alerts reached (10)');
    }

    // Create the job alert
    const jobAlert = await prisma.jobAlert.create({
      data: {
        candidateId,
        alertName: data.alertName,
        keywords: data.keywords || null,
        locationIds: data.locationIds && data.locationIds.length > 0 
          ? data.locationIds 
          : Prisma.JsonNull,
        categoryIds: data.categoryIds && data.categoryIds.length > 0 
          ? data.categoryIds 
          : Prisma.JsonNull,
        jobType: data.jobType || null,
        salaryMin: data.salaryMin ? new Prisma.Decimal(data.salaryMin) : null,
        experienceLevel: data.experienceLevel || null,
        frequency: data.frequency || AlertFrequency.WEEKLY,
        isActive: true
      },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Add matching jobs count
    const matchingJobsCount = await this.countMatchingJobs(jobAlert);

    return {
      ...jobAlert,
      _count: {
        matchingJobs: matchingJobsCount
      }
    } as JobAlertWithRelations;
  }

  /**
   * Update an existing job alert
   */
  static async updateJobAlert({
    id,
    candidateId,
    data
  }: UpdateJobAlertParams): Promise<JobAlertWithRelations> {
    // Check if job alert exists and belongs to candidate
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        candidateId
      }
    });

    if (!existingAlert) {
      throw new Error('Job alert not found');
    }

    // Update the job alert
    const updatedAlert = await prisma.jobAlert.update({
      where: { id },
      data: {
        ...(data.alertName !== undefined && { alertName: data.alertName }),
        ...(data.keywords !== undefined && { keywords: data.keywords || null }),
        ...(data.locationIds !== undefined && {
          locationIds: data.locationIds.length > 0 
            ? data.locationIds 
            : Prisma.JsonNull
        }),
        ...(data.categoryIds !== undefined && {
          categoryIds: data.categoryIds.length > 0 
            ? data.categoryIds 
            : Prisma.JsonNull
        }),
        ...(data.jobType !== undefined && { jobType: data.jobType || null }),
        ...(data.salaryMin !== undefined && {
          salaryMin: data.salaryMin ? new Prisma.Decimal(data.salaryMin) : null
        }),
        ...(data.experienceLevel !== undefined && {
          experienceLevel: data.experienceLevel || null
        }),
        ...(data.frequency !== undefined && { frequency: data.frequency }),
        ...(data.isActive !== undefined && { isActive: data.isActive })
      },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Add matching jobs count
    const matchingJobsCount = await this.countMatchingJobs(updatedAlert);

    return {
      ...updatedAlert,
      _count: {
        matchingJobs: matchingJobsCount
      }
    } as JobAlertWithRelations;
  }

  /**
   * Delete a job alert
   */
  static async deleteJobAlert({
    id,
    candidateId
  }: DeleteJobAlertParams): Promise<boolean> {
    // Check if job alert exists and belongs to candidate
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        candidateId
      }
    });

    if (!existingAlert) {
      throw new Error('Job alert not found');
    }

    // Delete the job alert
    await prisma.jobAlert.delete({
      where: { id }
    });

    return true;
  }

  /**
   * Toggle job alert active status
   */
  static async toggleJobAlertStatus({
    id,
    candidateId,
    isActive
  }: ToggleJobAlertStatusParams): Promise<JobAlertWithRelations> {
    // Check if job alert exists and belongs to candidate
    const existingAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        candidateId
      }
    });

    if (!existingAlert) {
      throw new Error('Job alert not found');
    }

    // Update the status
    const updatedAlert = await prisma.jobAlert.update({
      where: { id },
      data: { isActive },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Add matching jobs count
    const matchingJobsCount = await this.countMatchingJobs(updatedAlert);

    return {
      ...updatedAlert,
      _count: {
        matchingJobs: matchingJobsCount
      }
    } as JobAlertWithRelations;
  }

  /**
   * Test a job alert by finding matching jobs
   */
  static async testJobAlert({
    id,
    candidateId
  }: TestJobAlertParams): Promise<{
    alert: JobAlertWithRelations;
    matchingJobs: any[];
    totalMatches: number;
  }> {
    // Get the job alert
    const jobAlert = await prisma.jobAlert.findFirst({
      where: {
        id,
        candidateId
      },
      include: {
        candidate: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    if (!jobAlert) {
      throw new Error('Job alert not found');
    }

    // Find matching jobs
    const where = this.buildJobSearchConditions(jobAlert);
    
    const [matchingJobs, totalMatches] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              companyName: true,
              companySlug: true,
              logoUrl: true,
              city: true,
              province: true
            }
          },
          _count: {
            select: {
              applications: true,
              savedJobs: true
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        take: 10 // Return first 10 matches for testing
      }),
      prisma.job.count({ where })
    ]);

    return {
      alert: {
        ...jobAlert,
        _count: {
          matchingJobs: totalMatches
        }
      } as JobAlertWithRelations,
      matchingJobs,
      totalMatches
    };
  }

  /**
   * Get job alert statistics for a candidate
   */
  static async getJobAlertStats(candidateId: string): Promise<JobAlertStatsResponse> {
    const alerts = await prisma.jobAlert.findMany({
      where: { candidateId },
      select: {
        isActive: true,
        frequency: true
      }
    });

    const stats: JobAlertStatsResponse = {
      totalAlerts: alerts.length,
      activeAlerts: alerts.filter(a => a.isActive).length,
      inactiveAlerts: alerts.filter(a => !a.isActive).length,
      byFrequency: {
        daily: alerts.filter(a => a.frequency === AlertFrequency.DAILY).length,
        weekly: alerts.filter(a => a.frequency === AlertFrequency.WEEKLY).length,
        instant: alerts.filter(a => a.frequency === AlertFrequency.INSTANT).length
      }
    };

    return stats;
  }

  /**
   * Count matching jobs for a job alert
   */
  private static async countMatchingJobs(jobAlert: JobAlert): Promise<number> {
    const where = this.buildJobSearchConditions(jobAlert);
    return await prisma.job.count({ where });
  }

  /**
   * Build Prisma where conditions based on job alert criteria
   */
  private static buildJobSearchConditions(jobAlert: JobAlert): Prisma.JobWhereInput {
    const parsedAlert = parseJobAlertJsonFields(jobAlert);

    const where: Prisma.JobWhereInput = {
      status: JobStatus.ACTIVE,
      ...(parsedAlert.keywords && {
        OR: [
          { title: { contains: parsedAlert.keywords, mode: 'insensitive' } },
          { description: { contains: parsedAlert.keywords, mode: 'insensitive' } },
          { requirements: { contains: parsedAlert.keywords, mode: 'insensitive' } }
        ]
      }),
      ...(parsedAlert.locationIds.length > 0 && {
        OR: [
          {
            locationCity: {
              in: parsedAlert.locationIds
            }
          },
          {
            locationProvince: {
              in: parsedAlert.locationIds
            }
          }
        ]
      }),
      ...(parsedAlert.categoryIds.length > 0 && {
        jobCategories: {
          some: {
            categoryId: {
              in: parsedAlert.categoryIds
            }
          }
        }
      }),
      ...(jobAlert.jobType && {
        jobType: jobAlert.jobType
      }),
      ...(jobAlert.salaryMin && {
        OR: [
          {
            salaryMax: {
              gte: jobAlert.salaryMin
            }
          },
          {
            salaryNegotiable: true
          }
        ]
      }),
      ...(jobAlert.experienceLevel && {
        experienceLevel: jobAlert.experienceLevel
      }),
      // Only show jobs with future deadlines or no deadline
      OR: [
        { applicationDeadline: null },
        { applicationDeadline: { gte: new Date() } }
      ]
    };

    return where;
  }

  /**
   * Get active job alerts that need to be processed
   */
  static async getAlertsToProcess(frequency: AlertFrequency): Promise<JobAlert[]> {
    const now = new Date();
    let lastSentBefore: Date;

    switch (frequency) {
      case AlertFrequency.DAILY:
        lastSentBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago
        break;
      case AlertFrequency.WEEKLY:
        lastSentBefore = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
        break;
      case AlertFrequency.INSTANT:
        lastSentBefore = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
        break;
    }

    return await prisma.jobAlert.findMany({
      where: {
        isActive: true,
        frequency,
        OR: [
          { lastSentAt: null },
          { lastSentAt: { lt: lastSentBefore } }
        ]
      },
      include: {
        candidate: {
          include: {
            user: true
          }
        }
      }
    });
  }

  /**
   * Update last sent timestamp for a job alert
   */
  static async updateLastSent(id: string): Promise<void> {
    await prisma.jobAlert.update({
      where: { id },
      data: { lastSentAt: new Date() }
    });
  }
}
