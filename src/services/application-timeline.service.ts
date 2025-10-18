import { PrismaClient, ApplicationStatus, ApplicationTimeline, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';
import {
  ApplicationTimelineWithRelations,
  ApplicationTimelineQueryParams,
  CreateApplicationTimelineDTO,
  UpdateApplicationTimelineDTO,
  ApplicationTimelineStats,
  TimelineProgress,
  BulkCreateTimelineDTO,
  BulkUpdateStatusDTO,
  ApplicationTimelineErrorCode,
  isValidStatusTransition,
} from '@/types/application-timeline.types';

export class ApplicationTimelineService {
  private static prisma: PrismaClient = prisma;

  /**
   * Create a new timeline entry for an application
   */
  static async create(
    data: CreateApplicationTimelineDTO,
    userId: string
  ): Promise<ApplicationTimeline> {
    // Verify application exists
    const application = await this.prisma.application.findUnique({
      where: { id: data.applicationId },
      select: { id: true, status: true },
    });

    if (!application) {
      throw new Error(ApplicationTimelineErrorCode.APPLICATION_NOT_FOUND);
    }

    // Validate status transition
    if (!isValidStatusTransition(application.status, data.status)) {
      throw new Error(ApplicationTimelineErrorCode.INVALID_STATUS_TRANSITION);
    }

    // Create timeline entry in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create timeline entry
      const timeline = await tx.applicationTimeline.create({
        data: {
          applicationId: data.applicationId,
          status: data.status,
          note: data.note || null,
          changedBy: userId,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              userType: true,
            },
          },
        },
      });

      // Update application status
      await tx.application.update({
        where: { id: data.applicationId },
        data: {
          status: data.status,
          statusUpdatedAt: new Date(),
        },
      });

      return timeline;
    });
  }

  /**
   * Get timeline entry by ID
   */
  static async getById(
    id: string,
    includeRelations: boolean = false
  ): Promise<ApplicationTimelineWithRelations | null> {
    return await this.prisma.applicationTimeline.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                company: {
                  select: {
                    id: true,
                    companyName: true,
                    companySlug: true,
                  },
                },
              },
            },
            candidate: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    userType: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
    });
  }

  /**
   * Get all timeline entries for an application
   */
  static async getByApplicationId(
    applicationId: string
  ): Promise<ApplicationTimelineWithRelations[]> {
    return await this.prisma.applicationTimeline.findMany({
      where: { applicationId },
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                company: {
                  select: {
                    id: true,
                    companyName: true,
                    companySlug: true,
                  },
                },
              },
            },
            candidate: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    userType: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * List timeline entries with filters and pagination
   */
  static async list(params: ApplicationTimelineQueryParams): Promise<{
    data: ApplicationTimelineWithRelations[];
    total: number;
  }> {
    const {
      applicationId,
      status,
      changedBy,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const where: Prisma.ApplicationTimelineWhereInput = {};

    if (applicationId) {
      where.applicationId = applicationId;
    }

    if (status) {
      if (Array.isArray(status)) {
        where.status = { in: status };
      } else {
        where.status = status;
      }
    }

    if (changedBy) {
      where.changedBy = changedBy;
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

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.applicationTimeline.findMany({
        where,
        include: {
          application: {
            include: {
              job: {
                select: {
                  id: true,
                  title: true,
                  slug: true,
                  company: {
                    select: {
                      id: true,
                      companyName: true,
                      companySlug: true,
                    },
                  },
                },
              },
              candidate: {
                include: {
                  user: {
                    select: {
                      id: true,
                      email: true,
                      firstName: true,
                      lastName: true,
                      userType: true,
                    },
                  },
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              userType: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      this.prisma.applicationTimeline.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Update a timeline entry (only note can be updated)
   */
  static async update(
    id: string,
    data: UpdateApplicationTimelineDTO
  ): Promise<ApplicationTimeline> {
    return await this.prisma.applicationTimeline.update({
      where: { id },
      data: {
        note: data.note,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
    });
  }

  /**
   * Delete a timeline entry (soft delete recommended)
   */
  static async delete(id: string): Promise<void> {
    await this.prisma.applicationTimeline.delete({
      where: { id },
    });
  }

  /**
   * Bulk create timeline entries
   */
  static async bulkCreate(
    data: BulkCreateTimelineDTO,
    userId: string
  ): Promise<ApplicationTimeline[]> {
    const results: ApplicationTimeline[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const entry of data.entries) {
        const timeline = await tx.applicationTimeline.create({
          data: {
            applicationId: entry.applicationId,
            status: entry.status,
            note: entry.note || null,
            changedBy: userId,
          },
        });

        // Update application status
        await tx.application.update({
          where: { id: entry.applicationId },
          data: {
            status: entry.status,
            statusUpdatedAt: new Date(),
          },
        });

        results.push(timeline);
      }
    });

    return results;
  }

  /**
   * Bulk update status for multiple applications
   */
  static async bulkUpdateStatus(
    data: BulkUpdateStatusDTO,
    userId: string
  ): Promise<ApplicationTimeline[]> {
    const results: ApplicationTimeline[] = [];

    await this.prisma.$transaction(async (tx) => {
      for (const applicationId of data.applicationIds) {
        // Get current application status
        const application = await tx.application.findUnique({
          where: { id: applicationId },
          select: { status: true },
        });

        if (!application) continue;

        // Validate status transition
        if (!isValidStatusTransition(application.status, data.status)) {
          continue; // Skip invalid transitions
        }

        // Create timeline entry
        const timeline = await tx.applicationTimeline.create({
          data: {
            applicationId,
            status: data.status,
            note: data.note || null,
            changedBy: userId,
          },
        });

        // Update application status
        await tx.application.update({
          where: { id: applicationId },
          data: {
            status: data.status,
            statusUpdatedAt: new Date(),
          },
        });

        results.push(timeline);
      }
    });

    return results;
  }

  /**
   * Get timeline statistics for an application
   */
  static async getStats(applicationId: string): Promise<ApplicationTimelineStats> {
    const timelines = await this.prisma.applicationTimeline.findMany({
      where: { applicationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    if (timelines.length === 0) {
      throw new Error(ApplicationTimelineErrorCode.TIMELINE_NOT_FOUND);
    }

    // Get current application status
    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      select: { status: true },
    });

    if (!application) {
      throw new Error(ApplicationTimelineErrorCode.APPLICATION_NOT_FOUND);
    }

    // Calculate statistics
    const statusCounts: Record<string, number> = {};
    const timeInStatus: Record<string, number> = {};
    const progress: TimelineProgress[] = [];

    for (let i = 0; i < timelines.length; i++) {
      const current = timelines[i];
      const next = timelines[i + 1];

      // Count status occurrences
      statusCounts[current.status] = (statusCounts[current.status] || 0) + 1;

      // Calculate time in status
      const enteredAt = current.createdAt;
      const exitedAt = next ? next.createdAt : new Date();
      const durationMs = exitedAt.getTime() - enteredAt.getTime();
      const durationHours = durationMs / (1000 * 60 * 60);

      if (!timeInStatus[current.status]) {
        timeInStatus[current.status] = 0;
      }
      timeInStatus[current.status] += durationHours;

      // Add to progress
      progress.push({
        status: current.status,
        enteredAt: current.createdAt,
        exitedAt: next ? next.createdAt : undefined,
        durationHours,
        note: current.note || undefined,
        changedBy: current.user as any,
      });
    }

    // Calculate average time in each status
    const averageTimeInStatus: Record<string, number> = {};
    for (const [status, totalHours] of Object.entries(timeInStatus)) {
      averageTimeInStatus[status] = totalHours / (statusCounts[status] || 1);
    }

    return {
      applicationId,
      totalStatusChanges: timelines.length,
      currentStatus: application.status,
      statusCounts: statusCounts as Record<ApplicationStatus, number>,
      averageTimeInStatus: averageTimeInStatus as Record<ApplicationStatus, number>,
      lastUpdateDate: timelines[timelines.length - 1].createdAt,
      timelineProgress: progress,
    };
  }

  /**
   * Get recent timeline activities for a user or company
   */
  static async getRecentActivities(
    userId?: string,
    companyId?: string,
    limit: number = 10
  ): Promise<ApplicationTimelineWithRelations[]> {
    const where: Prisma.ApplicationTimelineWhereInput = {};

    if (userId) {
      where.changedBy = userId;
    }

    if (companyId) {
      where.application = {
        job: {
          companyId,
        },
      };
    }

    return await this.prisma.applicationTimeline.findMany({
      where,
      include: {
        application: {
          include: {
            job: {
              select: {
                id: true,
                title: true,
                slug: true,
                company: {
                  select: {
                    id: true,
                    companyName: true,
                    companySlug: true,
                  },
                },
              },
            },
            candidate: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    userType: true,
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            userType: true,
          },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Check if user has permission to access timeline
   */
  static async checkAccess(timelineId: string, userId: string, userType: string): Promise<boolean> {
    const timeline = await this.prisma.applicationTimeline.findUnique({
      where: { id: timelineId },
      include: {
        application: {
          include: {
            job: {
              select: {
                companyId: true,
                recruiterId: true,
              },
            },
          },
        },
      },
    });

    if (!timeline) return false;

    // Check based on user type
    if (userType === 'ADMIN') return true;

    if (userType === 'CANDIDATE') {
      return timeline.application.userId === userId;
    }

    if (userType === 'EMPLOYER') {
      // Check if user is associated with the company
      const companyUser = await this.prisma.companyUser.findFirst({
        where: {
          userId,
          companyId: timeline.application.job.companyId,
        },
      });
      return !!companyUser;
    }

    return false;
  }
}
