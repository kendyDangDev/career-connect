import { NextResponse } from 'next/server';
import { withRole, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus, JobStatus, UserType } from '@/generated/prisma';
import { format, subMonths, subDays, differenceInDays, startOfDay } from 'date-fns';
import { vi } from 'date-fns/locale';

// Helper function to format time ago
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Vừa xong';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

  return format(date, 'dd/MM/yyyy', { locale: vi });
}

/**
 * GET /api/employer/dashboard/summary - Get employer dashboard summary
 * Requires EMPLOYER or ADMIN role
 */
export const GET = withRole(
  [UserType.EMPLOYER, UserType.ADMIN],
  async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        return NextResponse.json(
          { success: false, error: 'User not authenticated' },
          { status: 401 }
        );
      }

      // Get company for employer
      const companyUser = await prisma.companyUser.findFirst({
        where: { userId: req.user.id },
        select: { companyId: true },
      });

      if (!companyUser) {
        return NextResponse.json(
          { success: false, error: 'No company associated with this user' },
          { status: 403 }
        );
      }

      const companyId = companyUser.companyId;
      const now = new Date();
      const weekAgo = subDays(now, 7);
      const monthAgo = subMonths(now, 1);
      const sixMonthsAgo = subMonths(now, 6);

      // Fetch all jobs for company
      const jobs = await prisma.job.findMany({
        where: { companyId },
        include: {
          _count: {
            select: {
              applications: true,
            },
          },
          applications: {
            include: {
              candidate: {
                select: {
                  user: {
                    select: {
                      firstName: true,
                      lastName: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Calculate summary stats
      const activeJobs = jobs.filter((j) => j.status === JobStatus.ACTIVE).length;
      const totalApplications = jobs.reduce((sum, job) => sum + job._count.applications, 0);
      const totalViews = jobs.reduce((sum, job) => sum + job.viewCount, 0);

      // Applications this week
      const newApplicationsThisWeek = jobs.reduce((sum, job) => {
        return sum + job.applications.filter((app) => new Date(app.appliedAt) >= weekAgo).length;
      }, 0);

      // Previous week applications for trend
      const twoWeeksAgo = subDays(now, 14);
      const prevWeekApplications = jobs.reduce((sum, job) => {
        return (
          sum +
          job.applications.filter((app) => {
            const appliedDate = new Date(app.appliedAt);
            return appliedDate >= twoWeeksAgo && appliedDate < weekAgo;
          }).length
        );
      }, 0);

      // Expiring jobs (deadline within 7 days)
      const expiringJobsCount = jobs.filter((job) => {
        if (job.status !== JobStatus.ACTIVE || !job.applicationDeadline) return false;
        const daysLeft = differenceInDays(new Date(job.applicationDeadline), now);
        return daysLeft > 0 && daysLeft <= 7;
      }).length;

      // Interviews today
      const todayStart = startOfDay(now);
      const interviewsToday = jobs.reduce((sum, job) => {
        return (
          sum +
          job.applications.filter(
            (app) =>
              app.interviewScheduledAt &&
              startOfDay(new Date(app.interviewScheduledAt)).getTime() === todayStart.getTime()
          ).length
        );
      }, 0);

      // Pending reviews (APPLIED status)
      const pendingReviews = jobs.reduce((sum, job) => {
        return (
          sum + job.applications.filter((app) => app.status === ApplicationStatus.APPLIED).length
        );
      }, 0);

      // Hired applications
      const hiredApplications = jobs.reduce((sum, job) => {
        return (
          sum + job.applications.filter((app) => app.status === ApplicationStatus.HIRED).length
        );
      }, 0);

      console.log(hiredApplications, totalApplications);
      const hireRate =
        totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0;

      // Calculate trends
      const applicationsTrend =
        prevWeekApplications > 0
          ? (
              ((newApplicationsThisWeek - prevWeekApplications) / prevWeekApplications) *
              100
            ).toFixed(1)
          : '+0';

      // Pipeline stats
      const pipeline = {
        applied: pendingReviews,
        screening: jobs.reduce((sum, job) => {
          return (
            sum +
            job.applications.filter((app) => app.status === ApplicationStatus.SCREENING).length
          );
        }, 0),
        interviewing: jobs.reduce((sum, job) => {
          return (
            sum +
            job.applications.filter((app) => app.status === ApplicationStatus.INTERVIEWING).length
          );
        }, 0),
        hired: hiredApplications,
        total: totalApplications,
      };

      // Recent jobs (last 5 active jobs)
      const recentJobs = jobs
        .filter((job) => job.status === JobStatus.ACTIVE)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map((job) => ({
          id: job.id,
          title: job.title,
          status: job.status,
          applications: job._count.applications,
          views: job.viewCount,
          daysLeft: job.applicationDeadline
            ? differenceInDays(new Date(job.applicationDeadline), now)
            : null,
          createdAt: job.createdAt.toISOString(),
          applicationDeadline: job.applicationDeadline?.toISOString() || null,
        }));

      // Applications chart data (last 6 months)
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
        const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);

        const monthApplications = jobs.reduce((sum, job) => {
          return (
            sum +
            job.applications.filter((app) => {
              const appliedDate = new Date(app.appliedAt);
              return appliedDate >= monthStart && appliedDate <= monthEnd;
            }).length
          );
        }, 0);

        const monthInterviews = jobs.reduce((sum, job) => {
          return (
            sum +
            job.applications.filter((app) => {
              const appliedDate = new Date(app.appliedAt);
              return (
                appliedDate >= monthStart &&
                appliedDate <= monthEnd &&
                app.status === ApplicationStatus.INTERVIEWING
              );
            }).length
          );
        }, 0);

        monthlyData.push({
          month: format(monthDate, 'MMM', { locale: vi }),
          applications: monthApplications,
          interviews: monthInterviews,
        });
      }

      const totalInterviews = pipeline.interviewing;
      const conversionRate =
        totalApplications > 0 ? Math.round((totalInterviews / totalApplications) * 100) : 0;

      // Recent activity (last 5 activities)
      const allApplications = jobs.flatMap((job) =>
        job.applications.map((app) => ({
          ...app,
          jobTitle: job.title,
        }))
      );

      const recentActivity = allApplications
        .sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime())
        .slice(0, 5)
        .map((app) => {
          const candidateName =
            `${app.candidate.user.firstName || ''} ${app.candidate.user.lastName || ''}`.trim();
          return {
            id: app.id,
            type:
              app.status === ApplicationStatus.INTERVIEWING
                ? ('interview' as const)
                : ('application' as const),
            title:
              app.status === ApplicationStatus.INTERVIEWING
                ? 'Phỏng vấn được lên lịch'
                : `${candidateName} đã ứng tuyển`,
            description: app.jobTitle,
            time: formatTimeAgo(new Date(app.appliedAt)),
            createdAt: app.appliedAt.toISOString(),
            avatar: candidateName
              .split(' ')
              .map((n: string) => n[0])
              .join('')
              .toUpperCase(),
            jobTitle: app.jobTitle,
            applicantName: candidateName,
            metadata: {
              applicationId: app.id,
              jobId: app.jobId,
            },
          };
        });

      // Upcoming interviews (next 7 days)
      const upcomingInterviews = allApplications
        .filter(
          (app) =>
            app.interviewScheduledAt &&
            new Date(app.interviewScheduledAt) >= now &&
            differenceInDays(new Date(app.interviewScheduledAt), now) <= 7
        )
        .sort(
          (a, b) =>
            new Date(a.interviewScheduledAt!).getTime() -
            new Date(b.interviewScheduledAt!).getTime()
        )
        .slice(0, 3)
        .map((app) => {
          const candidateName =
            `${app.candidate.user.firstName || ''} ${app.candidate.user.lastName || ''}`.trim();
          return {
            id: app.id,
            candidateName,
            position: app.jobTitle,
            jobId: app.jobId,
            applicationId: app.id,
            scheduledAt: app.interviewScheduledAt!.toISOString(),
            time: format(new Date(app.interviewScheduledAt!), 'dd/MM, HH:mm', { locale: vi }),
            status: 'confirmed' as const,
            candidateAvatar: app.candidate.user.avatarUrl || undefined,
          };
        });

      // Notifications
      const notifications = [];

      if (expiringJobsCount > 0) {
        notifications.push({
          id: 'expiring-jobs',
          type: 'warning' as const,
          title: `${expiringJobsCount} công việc sắp hết hạn`,
          message: 'Hãy gia hạn hoặc đóng các tin tuyển dụng để tránh mất cơ hội',
          actionText: 'Xem chi tiết',
          actionUrl: '/employer/jobs',
          icon: 'AlertCircle',
          count: expiringJobsCount,
        });
      }

      if (hireRate >= 15) {
        notifications.push({
          id: 'good-performance',
          type: 'success' as const,
          title: 'Hiệu suất tuyển dụng tốt',
          message: `Tỷ lệ tuyển dụng của bạn đạt ${hireRate}%`,
          actionText: 'Xem báo cáo',
          actionUrl: '/employer/analytics',
          icon: 'TrendingUp',
        });
      }

      const dashboardData = {
        summary: {
          activeJobs,
          totalApplications,
          totalViews,
          hireRate,
          newApplicationsThisWeek,
          expiringJobsCount,
          interviewsToday,
          pendingReviews,
          trends: {
            jobs: {
              value: `+${activeJobs - jobs.filter((j) => j.status === JobStatus.CLOSED).length}`,
              isPositive: true,
            },
            applications: {
              value: `${applicationsTrend}%`,
              isPositive: parseFloat(applicationsTrend) >= 0,
            },
            views: {
              value: '+12%',
              isPositive: true,
            },
            hireRate: {
              value: `${hireRate}%`,
              isPositive: hireRate >= 10,
            },
          },
        },
        pipeline,
        recentJobs,
        applicationsChart: {
          totalApplications,
          totalInterviews,
          conversionRate,
          trend: {
            value: applicationsTrend,
            isPositive: parseFloat(applicationsTrend) >= 0,
          },
          monthlyData,
        },
        recentActivity,
        upcomingInterviews,
        notifications,
      };

      return NextResponse.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch dashboard data',
        },
        { status: 500 }
      );
    }
  }
);
