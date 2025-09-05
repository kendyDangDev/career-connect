import { prisma } from '@/lib/prisma';
import { Prisma } from '@/generated/prisma';
import { 
  JobView, 
  JobViewInput, 
  JobViewsQuery, 
  JobViewsResponse, 
  JobViewStats 
} from '@/types/candidate/job-view.types';
import { startOfDay, endOfDay, subDays, format } from 'date-fns';

export class JobViewService {
  /**
   * Create a new job view record
   */
  static async createJobView(
    data: JobViewInput & { userId?: string }
  ): Promise<JobView> {
    const { jobId, userId, ipAddress = '', userAgent = '' } = data;

    // Check if job exists and is active
    const job = await prisma.job.findFirst({
      where: {
        id: jobId,
        status: 'ACTIVE'
      }
    });

    if (!job) {
      throw new Error('Job not found or not active');
    }

    // Create job view
    const jobView = await prisma.jobView.create({
      data: {
        jobId,
        userId,
        ipAddress,
        userAgent
      },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    // Increment view count on the job
    await prisma.job.update({
      where: { id: jobId },
      data: {
        viewCount: {
          increment: 1
        }
      }
    });

    return this.formatJobView(jobView);
  }

  /**
   * Get job views for a specific user
   */
  static async getJobViews(
    userId: string,
    query: JobViewsQuery
  ): Promise<JobViewsResponse> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'viewedAt',
      sortOrder = 'desc',
      startDate,
      endDate
    } = query;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.JobViewWhereInput = {
      userId
    };

    if (startDate) {
      where.viewedAt = {
        ...where.viewedAt,
        gte: startOfDay(new Date(startDate))
      };
    }

    if (endDate) {
      where.viewedAt = {
        ...where.viewedAt,
        lte: endOfDay(new Date(endDate))
      };
    }

    // Build orderBy clause
    const orderBy: Prisma.JobViewOrderByWithRelationInput = {};
    if (sortBy === 'viewedAt') {
      orderBy.viewedAt = sortOrder;
    } else if (sortBy === 'jobTitle') {
      orderBy.job = {
        title: sortOrder
      };
    }

    // Execute queries
    const [jobViews, total] = await Promise.all([
      prisma.jobView.findMany({
        where,
        include: {
          job: {
            include: {
              company: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      prisma.jobView.count({ where })
    ]);

    return {
      data: jobViews.map(this.formatJobView),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get job view statistics for a user
   */
  static async getJobViewStats(userId: string): Promise<JobViewStats> {
    const last30Days = subDays(new Date(), 30);

    // Get total views and unique jobs
    const [totalViews, uniqueJobsResult] = await Promise.all([
      prisma.jobView.count({
        where: { userId }
      }),
      prisma.jobView.groupBy({
        by: ['jobId'],
        where: { userId },
        _count: true
      })
    ]);

    const uniqueJobs = uniqueJobsResult.length;

    // Get views by date for last 30 days
    const viewsByDateResult = await prisma.$queryRaw<Array<{
      date: Date;
      count: bigint;
    }>>`
      SELECT DATE(viewed_at) as date, COUNT(*) as count
      FROM job_views
      WHERE user_id = ${userId}
        AND viewed_at >= ${last30Days}
      GROUP BY DATE(viewed_at)
      ORDER BY date DESC
    `;

    const viewsByDate = viewsByDateResult.map(row => ({
      date: format(row.date, 'yyyy-MM-dd'),
      count: Number(row.count)
    }));

    // Get top viewed jobs
    const topViewedJobsResult = await prisma.jobView.groupBy({
      by: ['jobId'],
      where: { userId },
      _count: {
        jobId: true
      },
      orderBy: {
        _count: {
          jobId: 'desc'
        }
      },
      take: 5
    });

    const topViewedJobs = await Promise.all(
      topViewedJobsResult.map(async (result) => {
        const job = await prisma.job.findUnique({
          where: { id: result.jobId },
          include: { company: true }
        });
        
        return {
          jobId: result.jobId,
          jobTitle: job?.title || 'Unknown',
          companyName: job?.company.companyName || 'Unknown',
          viewCount: result._count.jobId
        };
      })
    );

    // Get recent views
    const recentViewsResult = await prisma.jobView.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      },
      orderBy: {
        viewedAt: 'desc'
      },
      take: 10
    });

    const recentViews = recentViewsResult.map(this.formatJobView);

    return {
      totalViews,
      uniqueJobs,
      viewsByDate,
      topViewedJobs,
      recentViews
    };
  }

  /**
   * Check if a user has viewed a specific job
   */
  static async hasUserViewedJob(
    userId: string,
    jobId: string
  ): Promise<boolean> {
    const count = await prisma.jobView.count({
      where: {
        userId,
        jobId
      }
    });

    return count > 0;
  }

  /**
   * Get all views for a specific job (for analytics)
   */
  static async getJobViewsAnalytics(
    jobId: string,
    startDate?: Date,
    endDate?: Date
  ) {
    const where: Prisma.JobViewWhereInput = {
      jobId
    };

    if (startDate || endDate) {
      where.viewedAt = {};
      if (startDate) {
        where.viewedAt.gte = startDate;
      }
      if (endDate) {
        where.viewedAt.lte = endDate;
      }
    }

    const views = await prisma.jobView.findMany({
      where,
      orderBy: {
        viewedAt: 'desc'
      }
    });

    return views;
  }

  /**
   * Format job view data
   */
  private static formatJobView(jobView: any): JobView {
    return {
      id: jobView.id,
      jobId: jobView.jobId,
      userId: jobView.userId,
      ipAddress: jobView.ipAddress,
      userAgent: jobView.userAgent,
      viewedAt: jobView.viewedAt,
      job: jobView.job ? {
        id: jobView.job.id,
        title: jobView.job.title,
        slug: jobView.job.slug,
        company: {
          id: jobView.job.company.id,
          companyName: jobView.job.company.companyName,
          logoUrl: jobView.job.company.logoUrl
        },
        locationCity: jobView.job.locationCity,
        locationProvince: jobView.job.locationProvince,
        jobType: jobView.job.jobType,
        salaryMin: jobView.job.salaryMin?.toNumber() || null,
        salaryMax: jobView.job.salaryMax?.toNumber() || null,
        currency: jobView.job.currency,
        status: jobView.job.status
      } : undefined
    };
  }
}
