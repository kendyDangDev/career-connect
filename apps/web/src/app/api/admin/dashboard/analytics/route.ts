import { NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/lib/middleware/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@/generated/prisma';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import type { AdminDashboardAnalytics, TimeRange } from '@/types/admin/dashboard.types';
import {
  getDateRangeFromTimeRange,
  getPreviousPeriodRange,
  generateDailyIntervals,
  generateWeeklyIntervals,
  generateMonthlyIntervals,
  calculateGrowth,
  groupSalariesIntoRanges,
  calculateMedian,
  calculateAverage,
  getRecommendedGrouping,
  calculateConversionRate,
  safeDivide,
  roundTo,
} from '@/lib/utils/admin-dashboard.utils';
/**
 * GET /api/admin/dashboard/analytics
 * Lấy analytics chi tiết với time range và time series data
 * Requires: ADMIN role
 *
 * Query params:
 * - timeRange: '7days' | '30days' | '90days' | '6months' | 'year' | 'custom' | 'all'
 * - dateFrom: string (ISO date) - for custom range
 * - dateTo: string (ISO date) - for custom range
 * - includeTimeSeries: boolean - default true
 * - groupBy: 'day' | 'week' | 'month' - auto if not provided
 */
export const GET = withAdmin(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get('timeRange') as TimeRange) || '30days';
    const dateFrom = searchParams.get('dateFrom') || undefined;
    const dateTo = searchParams.get('dateTo') || undefined;
    const includeTimeSeries = searchParams.get('includeTimeSeries') !== 'false';
    const groupBy = (searchParams.get('groupBy') as 'day' | 'week' | 'month') || undefined;

    // Get date range
    const dateRange = getDateRangeFromTimeRange(timeRange, dateFrom, dateTo);
    const previousRange = getPreviousPeriodRange(dateRange.from, dateRange.to);

    // Determine grouping
    const effectiveGroupBy = groupBy || getRecommendedGrouping(dateRange.from, dateRange.to);

    // 1. GET DATA FOR CURRENT PERIOD
    const [
      users,
      companies,
      jobs,
      applications,
      // Previous period for comparison
      prevUsers,
      prevCompanies,
      prevJobs,
      prevApplications,
    ] = await Promise.all([
      // Current period
      prisma.user.findMany({
        where: { createdAt: { gte: dateRange.from, lte: dateRange.to } },
        select: { id: true, createdAt: true, userType: true },
      }),
      prisma.company.findMany({
        where: { createdAt: { gte: dateRange.from, lte: dateRange.to } },
        select: { id: true, createdAt: true },
      }),
      prisma.job.findMany({
        where: { createdAt: { gte: dateRange.from, lte: dateRange.to } },
        select: {
          id: true,
          createdAt: true,
          viewCount: true,
          salaryMin: true,
          salaryMax: true,
          currency: true,
        },
      }),
      prisma.application.findMany({
        where: { appliedAt: { gte: dateRange.from, lte: dateRange.to } },
        select: {
          id: true,
          appliedAt: true,
          status: true,
          statusUpdatedAt: true,
          job: {
            select: {
              createdAt: true,
            },
          },
        },
      }),
      // Previous period
      prisma.user.count({
        where: { createdAt: { gte: previousRange.from, lte: previousRange.to } },
      }),
      prisma.company.count({
        where: { createdAt: { gte: previousRange.from, lte: previousRange.to } },
      }),
      prisma.job.count({
        where: { createdAt: { gte: previousRange.from, lte: previousRange.to } },
      }),
      prisma.application.count({
        where: { appliedAt: { gte: previousRange.from, lte: previousRange.to } },
      }),
    ]);

    // 2. CALCULATE GROWTH METRICS
    const growthMetrics = {
      userGrowth: calculateGrowth(users.length, prevUsers),
      companyGrowth: calculateGrowth(companies.length, prevCompanies),
      jobGrowth: calculateGrowth(jobs.length, prevJobs),
      applicationGrowth: calculateGrowth(applications.length, prevApplications),
    };

    // 3. CONVERSION FUNNEL
    const totalJobViews = jobs.reduce((sum, job) => sum + job.viewCount, 0);
    const conversionFunnel = {
      jobViews: totalJobViews,
      applications: applications.length,
      screening: applications.filter((a) => a.status === ApplicationStatus.SCREENING).length,
      interviewing: applications.filter((a) => a.status === ApplicationStatus.INTERVIEWING).length,
      offered: applications.filter((a) => a.status === ApplicationStatus.OFFERED).length,
      hired: applications.filter((a) => a.status === ApplicationStatus.HIRED).length,
      rejected: applications.filter((a) => a.status === ApplicationStatus.REJECTED).length,
    };

    // 4. TIME SERIES DATA (if requested)
    let timeSeries: AdminDashboardAnalytics['timeSeries'] = {
      daily: [],
      weekly: undefined,
      monthly: undefined,
    };

    if (includeTimeSeries) {
      if (effectiveGroupBy === 'day') {
        const days = generateDailyIntervals(dateRange.from, dateRange.to);

        timeSeries.daily = days.map((day) => {
          const dayStr = format(day, 'yyyy-MM-dd');

          return {
            date: dayStr,
            users: users.filter((u) => format(u.createdAt, 'yyyy-MM-dd') === dayStr).length,
            companies: companies.filter((c) => format(c.createdAt, 'yyyy-MM-dd') === dayStr).length,
            jobs: jobs.filter((j) => format(j.createdAt, 'yyyy-MM-dd') === dayStr).length,
            applications: applications.filter((a) => format(a.appliedAt, 'yyyy-MM-dd') === dayStr)
              .length,
            jobViews: jobs
              .filter((j) => format(j.createdAt, 'yyyy-MM-dd') === dayStr)
              .reduce((sum, j) => sum + j.viewCount, 0),
          };
        });
      } else if (effectiveGroupBy === 'week') {
        const weeks = generateWeeklyIntervals(dateRange.from, dateRange.to);

        timeSeries.weekly = weeks.map((week, index) => ({
          week: `W${index + 1}`,
          startDate: week.start.toISOString(),
          endDate: week.end.toISOString(),
          users: users.filter((u) => u.createdAt >= week.start && u.createdAt <= week.end).length,
          companies: companies.filter((c) => c.createdAt >= week.start && c.createdAt <= week.end)
            .length,
          jobs: jobs.filter((j) => j.createdAt >= week.start && j.createdAt <= week.end).length,
          applications: applications.filter(
            (a) => a.appliedAt >= week.start && a.appliedAt <= week.end
          ).length,
          jobViews: jobs
            .filter((j) => j.createdAt >= week.start && j.createdAt <= week.end)
            .reduce((sum, j) => sum + j.viewCount, 0),
        }));
      } else {
        const months = generateMonthlyIntervals(dateRange.from, dateRange.to);

        timeSeries.monthly = months.map((month) => ({
          month: month.label,
          year: month.start.getFullYear(),
          monthNumber: month.start.getMonth() + 1,
          users: users.filter((u) => u.createdAt >= month.start && u.createdAt <= month.end).length,
          companies: companies.filter((c) => c.createdAt >= month.start && c.createdAt <= month.end)
            .length,
          jobs: jobs.filter((j) => j.createdAt >= month.start && j.createdAt <= month.end).length,
          applications: applications.filter(
            (a) => a.appliedAt >= month.start && a.appliedAt <= month.end
          ).length,
          jobViews: jobs
            .filter((j) => j.createdAt >= month.start && j.createdAt <= month.end)
            .reduce((sum, j) => sum + j.viewCount, 0),
          hired: applications.filter(
            (a) =>
              a.status === ApplicationStatus.HIRED &&
              a.appliedAt >= month.start &&
              a.appliedAt <= month.end
          ).length,
        }));
      }
    }

    // 5. TOP SKILLS
    const skillsData = await prisma.candidateSkill.groupBy({
      by: ['skillId'],
      _count: { skillId: true },
      orderBy: { _count: { skillId: 'desc' } },
      take: 20,
    });

    const skillsWithDetails = await Promise.all(
      skillsData.map(async (skill) => {
        const skillInfo = await prisma.skill.findUnique({
          where: { id: skill.skillId },
          select: { name: true, category: true },
        });

        // Get jobs requiring this skill
        const jobsWithSkill = await prisma.jobSkill.findMany({
          where: { skillId: skill.skillId },
          select: {
            job: {
              select: { salaryMin: true, salaryMax: true },
            },
          },
        });

        const salaries = jobsWithSkill
          .map((js) => {
            if (js.job.salaryMin && js.job.salaryMax) {
              return ((js.job.salaryMin?.toNumber() ?? 0) + (js.job.salaryMax?.toNumber() ?? 0)) / 2;
            }
            return null;
          })
          .filter((s): s is number => s !== null);

        const avgSalary = salaries.length > 0 ? calculateAverage(salaries) : undefined;

        return {
          skillId: skill.skillId,
          skillName: skillInfo?.name || 'Unknown',
          count: skill._count.skillId,
          percentage: roundTo(
            (skill._count.skillId / skillsData.reduce((sum, s) => sum + s._count.skillId, 0)) * 100,
            1
          ),
          averageSalary: avgSalary ? Math.round(avgSalary) : undefined,
          category: skillInfo?.category || 'OTHER',
        };
      })
    );

    // 6. INDUSTRY DISTRIBUTION
    const industriesData = await prisma.company.groupBy({
      by: ['industryId'],
      where: {
        industryId: { not: null },
        createdAt: { gte: dateRange.from, lte: dateRange.to },
      },
      _count: { industryId: true },
      orderBy: { _count: { industryId: 'desc' } },
      take: 10,
    });

    const totalIndustryCompanies = industriesData.reduce((sum, i) => sum + i._count.industryId, 0);

    const industryDistribution = await Promise.all(
      industriesData.map(async (ind) => {
        const industry = await prisma.industry.findUnique({
          where: { id: ind.industryId! },
          select: { name: true },
        });

        const [jobCount, applicationCount] = await Promise.all([
          prisma.job.count({
            where: {
              company: { industryId: ind.industryId },
              createdAt: { gte: dateRange.from, lte: dateRange.to },
            },
          }),
          prisma.application.count({
            where: {
              job: { company: { industryId: ind.industryId } },
              appliedAt: { gte: dateRange.from, lte: dateRange.to },
            },
          }),
        ]);

        return {
          industryId: ind.industryId!,
          industryName: industry?.name || 'Unknown',
          companyCount: ind._count.industryId,
          jobCount,
          applicationCount,
          percentage: roundTo((ind._count.industryId / totalIndustryCompanies) * 100, 1),
        };
      })
    );

    // 7. LOCATION DISTRIBUTION
    const locationsData = await prisma.job.groupBy({
      by: ['locationCity', 'locationProvince'],
      where: {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
        locationCity: { not: null },
        locationProvince: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });

    const totalLocationJobs = locationsData.reduce((sum, l) => sum + l._count.id, 0);

    const locationDistribution = await Promise.all(
      locationsData.map(async (loc) => {
        const [companyCount, userCount] = await Promise.all([
          prisma.company.count({
            where: {
              province: loc.locationProvince || undefined,
            },
          }),
          prisma.userProfile.count({
            where: {
              province: loc.locationProvince || undefined,
            },
          }),
        ]);

        return {
          city: loc.locationCity || '',
          province: loc.locationProvince || '',
          country: 'Vietnam',
          jobCount: loc._count.id,
          companyCount,
          userCount,
          percentage: roundTo((loc._count.id / totalLocationJobs) * 100, 1),
        };
      })
    );

    // 8. SALARY INSIGHTS
    const salaries = jobs
      .map((job) => {
        if (job.salaryMin && job.salaryMax) {
          return ((job.salaryMin.toNumber() ?? 0) + (job.salaryMax.toNumber() ?? 0)) / 2;
        }
        return null;
      })
      .filter((s): s is number => s !== null);

    const salaryInsights = {
      averageSalary: salaries.length > 0 ? Math.round(calculateAverage(salaries)) : 0,
      medianSalary: salaries.length > 0 ? Math.round(calculateMedian(salaries)) : 0,
      salaryRanges: groupSalariesIntoRanges(salaries),
    };

    // 9. PERFORMANCE METRICS
    const averageApplicationsPerJob = safeDivide(applications.length, jobs.length);
    const averageViewsPerJob = safeDivide(totalJobViews, jobs.length);

    // Calculate average time to first application
    const jobsWithApps = await prisma.job.findMany({
      where: {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
        applications: { some: {} },
      },
      select: {
        createdAt: true,
        applications: {
          select: { appliedAt: true },
          orderBy: { appliedAt: 'asc' },
          take: 1,
        },
      },
    });

    const timeToFirstAppHours = jobsWithApps
      .map((job) => {
        if (job.applications.length > 0) {
          return (
            (job.applications[0].appliedAt.getTime() - job.createdAt.getTime()) / (1000 * 60 * 60)
          );
        }
        return null;
      })
      .filter((t): t is number => t !== null);

    const averageTimeToFirstApplication =
      timeToFirstAppHours.length > 0 ? roundTo(calculateAverage(timeToFirstAppHours), 1) : 0;

    // Calculate average response time (from application to status change)
    const appsWithResponse = applications.filter(
      (a) => a.status !== ApplicationStatus.APPLIED && a.statusUpdatedAt
    );

    const responseTimeHours = appsWithResponse.map(
      (app) => (app.statusUpdatedAt.getTime() - app.appliedAt.getTime()) / (1000 * 60 * 60)
    );

    const averageResponseTime =
      responseTimeHours.length > 0 ? roundTo(calculateAverage(responseTimeHours), 1) : 0;

    // Job fill rate (jobs that got at least one hire)
    const jobsWithHires = await prisma.job.count({
      where: {
        createdAt: { gte: dateRange.from, lte: dateRange.to },
        applications: {
          some: { status: ApplicationStatus.HIRED },
        },
      },
    });

    const jobFillRate = roundTo(safeDivide(jobsWithHires, jobs.length) * 100, 1);

    const performanceMetrics = {
      averageApplicationsPerJob: roundTo(averageApplicationsPerJob, 1),
      averageViewsPerJob: roundTo(averageViewsPerJob, 0),
      averageTimeToFirstApplication,
      averageResponseTime,
      jobFillRate,
    };

    // BUILD RESPONSE
    const analyticsData: AdminDashboardAnalytics = {
      timeRange,
      dateRange: {
        from: dateRange.from.toISOString(),
        to: dateRange.to.toISOString(),
      },
      timeSeries,
      conversionFunnel,
      growthMetrics,
      topSkills: skillsWithDetails,
      industryDistribution,
      locationDistribution,
      salaryInsights,
      performanceMetrics,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Admin dashboard analytics error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch analytics data',
        message: 'Đã xảy ra lỗi khi tải dữ liệu phân tích',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
});
