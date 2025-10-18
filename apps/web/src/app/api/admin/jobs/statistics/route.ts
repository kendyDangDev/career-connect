import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/jobs/statistics - Get admin job statistics summary
 * Requires 'job.view' permission
 */
export const GET = withPermission('job.view', async (req: AuthenticatedRequest) => {
  try {
    // Get job counts by status
    const [totalJobs, activeJobs, pendingJobs, closedJobs, expiredJobs] = await Promise.all([
      prisma.job.count(),
      prisma.job.count({ where: { status: 'ACTIVE' } }),
      prisma.job.count({ where: { status: 'PENDING' } }),
      prisma.job.count({ where: { status: 'CLOSED' } }),
      prisma.job.count({ where: { status: 'EXPIRED' } }),
    ]);

    // Get application and view statistics
    const aggregateStats = await prisma.job.aggregate({
      _sum: {
        applicationCount: true,
        viewCount: true,
      },
      _avg: {
        viewCount: true,
      },
    });

    const totalApplications = aggregateStats._sum.applicationCount || 0;
    const totalViews = aggregateStats._sum.viewCount || 0;
    const averageViewsPerJob = aggregateStats._avg.viewCount || 0;

    // Calculate conversion rate
    const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

    // Get top performing jobs
    const topPerformingJobs = await prisma.job.findMany({
      where: { status: 'ACTIVE' },
      select: {
        id: true,
        title: true,
        applicationCount: true,
        viewCount: true,
        company: {
          select: {
            companyName: true,
          },
        },
      },
      orderBy: {
        applicationCount: 'desc',
      },
      take: 5,
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentJobs = await prisma.job.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        applicationCount: true,
        viewCount: true,
      },
    });

    // Group recent activity by date
    const recentActivity: {
      [key: string]: { jobsCreated: number; applications: number; views: number };
    } = {};

    recentJobs.forEach((job) => {
      const date = job.createdAt.toISOString().split('T')[0];
      if (!recentActivity[date]) {
        recentActivity[date] = { jobsCreated: 0, applications: 0, views: 0 };
      }
      recentActivity[date].jobsCreated++;
      recentActivity[date].applications += job.applicationCount || 0;
      recentActivity[date].views += job.viewCount || 0;
    });

    const recentActivityArray = Object.entries(recentActivity).map(([date, stats]) => ({
      date,
      ...stats,
    }));

    return NextResponse.json({
      success: true,
      message: 'Statistics retrieved successfully',
      data: {
        totalJobs,
        activeJobs,
        pendingJobs,
        closedJobs,
        expiredJobs,
        totalApplications,
        totalViews,
        averageViewsPerJob,
        conversionRate,
        topPerformingJobs: topPerformingJobs.map((job) => ({
          id: job.id,
          title: job.title,
          company: job.company?.companyName || 'Unknown',
          applications: job.applicationCount || 0,
          views: job.viewCount || 0,
          conversionRate:
            job.viewCount > 0 ? ((job.applicationCount || 0) / job.viewCount) * 100 : 0,
        })),
        recentActivity: recentActivityArray,
      },
    });
  } catch (error) {
    console.error('Error fetching admin job statistics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch statistics',
        message: 'Đã xảy ra lỗi khi tải thống kê',
      },
      { status: 500 }
    );
  }
});
