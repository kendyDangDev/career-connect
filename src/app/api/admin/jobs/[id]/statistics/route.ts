import { NextRequest, NextResponse } from 'next/server';
import { withPermission, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/jobs/[id]/statistics - Get statistics for a specific job
 * Requires 'job.view' permission
 */
export const GET = withPermission(
  'job.view',
  async (req: AuthenticatedRequest, { params }: { params: { id: string } }) => {
    try {
      const jobId = params.id;
      const job = await prisma.job.findUnique({
        where: { id: jobId },
        select: {
          id: true,
          title: true,
          status: true,
          applicationCount: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
          jobSkills: {
            select: {
              skill: { select: { id: true, name: true } },
            },
          },
          jobCategories: {
            select: {
              category: { select: { id: true, name: true } },
            },
          },
          applications: {
            select: {
              id: true,
              status: true,
              createdAt: true,
            },
          },
        },
      });

      if (!job) {
        return NextResponse.json({ success: false, error: 'Job not found' }, { status: 404 });
      }

      // Calculate conversion rate using both counter fields and actual counts for accuracy
      const totalViews = job.viewCount || 0;
      const totalApplications = job.applicationCount || 0;
      const conversionRate = totalViews > 0 ? (totalApplications / totalViews) * 100 : 0;

      // Application status breakdown
      const statusCounts: Record<string, number> = {};
      job.applications.forEach((app) => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });

      return NextResponse.json({
        success: true,
        message: 'Job statistics retrieved successfully',
        data: {
          id: job.id,
          title: job.title,
          status: job.status,
          applicationCount: totalApplications,
          viewCount: totalViews,
          conversionRate: conversionRate.toFixed(1),
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
          skills: job.jobSkills.map((js) => js.skill),
          categories: job.jobCategories.map((jc) => jc.category),
          applicationStatusCounts: statusCounts,
        },
      });
    } catch (error) {
      console.error('Error fetching job statistics:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch job statistics',
          message: 'Đã xảy ra lỗi khi tải thống kê việc làm',
        },
        { status: 500 }
      );
    }
  }
);
