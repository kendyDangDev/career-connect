import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { UserType, JobStatus, ApplicationStatus, VerificationStatus } from '@/generated/prisma';
import { subDays } from 'date-fns';
import type { AdminDashboardOverview } from '@/types/admin/dashboard.types';

/**
 * GET /api/admin/dashboard/overview
 * Lấy tổng quan dashboard admin với thống kê toàn hệ thống
 * Requires: ADMIN role
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const includeTopPerformers = searchParams.get('includeTopPerformers') !== 'false';
    const topLimit = parseInt(searchParams.get('topLimit') || '5');

    const now = new Date();
    const thirtyDaysAgo = subDays(now, 30);
    const sixtyDaysAgo = subDays(now, 60);

    // 1. SYSTEM STATISTICS - Parallel queries for performance
    const [
      totalUsers,
      totalCompanies,
      totalJobs,
      totalApplications,
      activeUsers,
      verifiedCompanies,
      activeJobs,
      // Previous period data for trends
      prevPeriodUsers,
      prevPeriodCompanies,
      prevPeriodJobs,
      prevPeriodApplications,
      // User breakdown
      candidateCount,
      employerCount,
      adminCount,
      // Job status breakdown
      pendingJobs,
      closedJobs,
      expiredJobs,
      draftJobs,
      // Application pipeline
      appliedApps,
      screeningApps,
      interviewingApps,
      offeredApps,
      hiredApps,
      rejectedApps,
      // Recruitment metrics
      totalJobViews,
      hiredApplications,
    ] = await Promise.all([
      // Current totals
      prisma.user.count(),
      prisma.company.count(),
      prisma.job.count(),
      prisma.application.count(),

      // Active users (status ACTIVE)
      prisma.user.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      // Verified companies
      prisma.company.count({
        where: { verificationStatus: VerificationStatus.VERIFIED },
      }),

      // Active jobs
      prisma.job.count({
        where: { status: JobStatus.ACTIVE },
      }),

      // Previous period counts (30-60 days ago)
      prisma.user.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.company.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.job.count({
        where: {
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),
      prisma.application.count({
        where: {
          appliedAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      }),

      // User breakdown by type
      prisma.user.count({ where: { userType: UserType.CANDIDATE } }),
      prisma.user.count({ where: { userType: UserType.EMPLOYER } }),
      prisma.user.count({ where: { userType: UserType.ADMIN } }),

      // Job status breakdown
      prisma.job.count({ where: { status: JobStatus.PENDING } }),
      prisma.job.count({ where: { status: JobStatus.CLOSED } }),
      prisma.job.count({ where: { status: JobStatus.EXPIRED } }),
      0, // DRAFT status not in enum, set to 0

      // Application pipeline
      prisma.application.count({ where: { status: ApplicationStatus.APPLIED } }),
      prisma.application.count({ where: { status: ApplicationStatus.SCREENING } }),
      prisma.application.count({ where: { status: ApplicationStatus.INTERVIEWING } }),
      prisma.application.count({ where: { status: ApplicationStatus.OFFERED } }),
      prisma.application.count({ where: { status: ApplicationStatus.HIRED } }),
      prisma.application.count({ where: { status: ApplicationStatus.REJECTED } }),

      // Recruitment metrics
      prisma.job.aggregate({
        _sum: { viewCount: true },
      }),
      prisma.application.count({ where: { status: ApplicationStatus.HIRED } }),
    ]);

    // Calculate trends
    const currentPeriodUsers = await prisma.user.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const currentPeriodCompanies = await prisma.company.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const currentPeriodJobs = await prisma.job.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    const currentPeriodApplications = await prisma.application.count({
      where: { appliedAt: { gte: thirtyDaysAgo } },
    });

    const calculateTrend = (current: number, previous: number) => {
      if (previous === 0) {
        return {
          value: current > 0 ? '+100%' : '0%',
          isPositive: current > 0,
          count: current,
        };
      }
      const change = ((current - previous) / previous) * 100;
      return {
        value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
        isPositive: change >= 0,
        count: current - previous,
      };
    };

    // 2. RECRUITMENT METRICS
    const totalViewCount = totalJobViews._sum.viewCount || 0;
    const conversionRate =
      totalViewCount > 0 ? ((totalApplications / totalViewCount) * 100).toFixed(2) : '0';

    // Calculate average time to hire
    const hiredAppsWithTime = await prisma.application.findMany({
      where: { status: ApplicationStatus.HIRED },
      select: {
        appliedAt: true,
        statusUpdatedAt: true,
      },
    });

    const avgTimeToHire =
      hiredAppsWithTime.length > 0
        ? hiredAppsWithTime.reduce((sum, app) => {
            const days = Math.floor(
              (app.statusUpdatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60 * 24)
            );
            return sum + days;
          }, 0) / hiredAppsWithTime.length
        : 0;

    const hireRate =
      totalApplications > 0 ? ((hiredApplications / totalApplications) * 100).toFixed(1) : '0';

    // 3. TOP PERFORMERS (optional)
    let topPerformers: AdminDashboardOverview['topPerformers'] = {
      companies: [],
      jobs: [],
      categories: [],
      locations: [],
    };

    if (includeTopPerformers) {
      // Top Companies
      const topCompaniesData = await prisma.company.findMany({
        take: topLimit,
        select: {
          id: true,
          companyName: true,
          logoUrl: true,
          verificationStatus: true,
          _count: {
            select: {
              jobs: true,
            },
          },
          jobs: {
            where: { status: JobStatus.ACTIVE },
            select: {
              _count: {
                select: {
                  applications: true,
                },
              },
              applications: {
                where: { status: ApplicationStatus.HIRED },
              },
            },
          },
        },
        orderBy: {
          jobs: {
            _count: 'desc',
          },
        },
      });

      topPerformers.companies = topCompaniesData.map((company) => {
        const totalApps = company.jobs.reduce((sum, job) => sum + job._count.applications, 0);
        const totalHired = company.jobs.reduce((sum, job) => sum + job.applications.length, 0);
        const activeJobsCount = company.jobs.length;

        return {
          id: company.id,
          name: company.companyName,
          logoUrl: company.logoUrl || undefined,
          totalJobs: company._count.jobs,
          activeJobs: activeJobsCount,
          totalApplications: totalApps,
          hireRate: totalApps > 0 ? parseFloat(((totalHired / totalApps) * 100).toFixed(1)) : 0,
          verificationStatus: company.verificationStatus,
        };
      });

      // Top Jobs
      const topJobsData = await prisma.job.findMany({
        take: topLimit,
        where: {
          status: JobStatus.ACTIVE,
        },
        select: {
          id: true,
          title: true,
          viewCount: true,
          createdAt: true,
          status: true,
          company: {
            select: {
              id: true,
              companyName: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          applications: {
            _count: 'desc',
          },
        },
      });

      topPerformers.jobs = topJobsData.map((job) => ({
        id: job.id,
        title: job.title,
        companyName: job.company.companyName,
        companyId: job.company.id,
        applications: job._count.applications,
        views: job.viewCount,
        conversionRate:
          job.viewCount > 0
            ? parseFloat(((job._count.applications / job.viewCount) * 100).toFixed(2))
            : 0,
        status: job.status,
        createdAt: job.createdAt.toISOString(),
      }));

      // Top Categories
      const topCategoriesData = await prisma.category.findMany({
        take: topLimit,
        select: {
          id: true,
          name: true,
          jobCategories: {
            select: {
              job: {
                select: {
                  id: true,
                  salaryMin: true,
                  salaryMax: true,
                  applications: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: {
          jobCategories: {
            _count: 'desc',
          },
        },
      });

      topPerformers.categories = topCategoriesData.map((cat) => {
        const jobCount = cat.jobCategories.length;
        const applicationCount = cat.jobCategories.reduce(
          (sum, jc) => sum + jc.job.applications.length,
          0
        );
        const avgSalary =
          cat.jobCategories.reduce((sum, jc) => {
            const midSalary = jc.job.salaryMin && jc.job.salaryMax 
              ? ((jc.job.salaryMin.toNumber() ?? 0) + (jc.job.salaryMax.toNumber() ?? 0)) / 2
              : 0;
            return sum + midSalary;
          }, 0) / (jobCount || 1);

        return {
          id: cat.id,
          name: cat.name,
          jobCount,
          applicationCount,
          averageSalary: avgSalary > 0 ? Math.round(avgSalary) : undefined,
        };
      });

      // Top Locations
      const topLocationsData = await prisma.job.groupBy({
        by: ['locationCity', 'locationProvince'],
        where: {
          locationCity: { not: null },
          locationProvince: { not: null },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: topLimit,
      });

      const locationDetailsPromises = topLocationsData.map(async (loc) => {
        const [companyCount, applicationCount] = await Promise.all([
          prisma.company.count({
            where: {
              city: loc.locationCity || undefined,
              province: loc.locationProvince || undefined,
            },
          }),
          prisma.application.count({
            where: {
              job: {
                locationCity: loc.locationCity || undefined,
                locationProvince: loc.locationProvince || undefined,
              },
            },
          }),
        ]);

        return {
          city: loc.locationCity || '',
          province: loc.locationProvince || '',
          jobCount: loc._count.id,
          companyCount,
          applicationCount,
        };
      });

      topPerformers.locations = await Promise.all(locationDetailsPromises);
    }

    // Build response
    const dashboardData: AdminDashboardOverview = {
      systemStats: {
        totalUsers,
        totalCompanies,
        totalJobs,
        totalApplications,
        activeUsers,
        verifiedCompanies,
        activeJobs,
        trends: {
          users: calculateTrend(currentPeriodUsers, prevPeriodUsers),
          companies: calculateTrend(currentPeriodCompanies, prevPeriodCompanies),
          jobs: calculateTrend(currentPeriodJobs, prevPeriodJobs),
          applications: calculateTrend(currentPeriodApplications, prevPeriodApplications),
        },
      },
      recruitmentMetrics: {
        totalApplications,
        totalHired: hiredApplications,
        hireRate: parseFloat(hireRate),
        averageTimeToHire: Math.round(avgTimeToHire),
        conversionRate: parseFloat(conversionRate),
        totalJobViews: totalViewCount,
      },
      userBreakdown: {
        candidates: candidateCount,
        employers: employerCount,
        admins: adminCount,
      },
      jobStatusBreakdown: {
        active: activeJobs,
        pending: pendingJobs,
        closed: closedJobs,
        expired: expiredJobs,
        draft: draftJobs,
      },
      applicationPipeline: {
        applied: appliedApps,
        screening: screeningApps,
        interviewing: interviewingApps,
        offered: offeredApps,
        hired: hiredApps,
        rejected: rejectedApps,
      },
      topPerformers,
    };

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin dashboard overview error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch dashboard overview',
        message: 'Đã xảy ra lỗi khi tải dữ liệu tổng quan',
      },
      { status: 500 }
    );
  }
});
