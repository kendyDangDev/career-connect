'use client';

import {
  Briefcase,
  Users,
  TrendingUp,
  Eye,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { StatsCard } from '@/components/employer/dashboard/StatsCard';
import { QuickActions } from '@/components/employer/dashboard/QuickActions';
import { JobsOverview } from '@/components/employer/dashboard/JobsOverview';
import { ApplicationsChart } from '@/components/employer/dashboard/ApplicationsChart';
import { RecentActivity } from '@/components/employer/dashboard/RecentActivity';
import { useDashboardSummary } from '@/hooks/employer/useDashboard';
import Link from 'next/link';

export default function EmployerDashboard() {
  const { data, isLoading, error, refetch } = useDashboardSummary();

  // Full page loading state
  if (isLoading && !data) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải dữ liệu dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">Lỗi tải dữ liệu</h3>
          <p className="mb-4 text-red-700">Không thể tải dữ liệu dashboard. Vui lòng thử lại.</p>
          <button
            onClick={() => refetch()}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  const dashboardData = data?.data;
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="mb-2 text-3xl font-bold text-white">Chào mừng trở lại! 👋</h1>
          <p className="text-lg text-purple-100">
            Bạn có{' '}
            <span className="font-semibold text-white">
              {dashboardData?.summary.newApplicationsThisWeek || 0} ứng viên mới
            </span>{' '}
            tuần này và{' '}
            <span className="font-semibold text-white">
              {dashboardData?.summary.interviewsToday || 0} phỏng vấn
            </span>{' '}
            hôm nay
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 backdrop-blur-sm" />
        <div className="absolute top-16 -right-24 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Công việc đang tuyển"
          value={dashboardData?.summary.activeJobs || 0}
          subtitle={`${dashboardData?.summary.expiringJobsCount || 0} sắp hết hạn`}
          icon={Briefcase}
          trend={{
            value: dashboardData?.summary.trends.jobs.value || '+0',
            isPositive: dashboardData?.summary.trends.jobs.isPositive ?? true,
          }}
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Tổng ứng tuyển"
          value={dashboardData?.summary.totalApplications || 0}
          subtitle={`${dashboardData?.summary.newApplicationsThisWeek || 0} ứng tuyển tuần này`}
          icon={Users}
          trend={{
            value: dashboardData?.summary.trends.applications.value || '+0%',
            isPositive: dashboardData?.summary.trends.applications.isPositive ?? true,
          }}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatsCard
          title="Lượt xem hồ sơ"
          value={dashboardData?.summary.totalViews || 0}
          subtitle="Tăng so với tháng trước"
          icon={Eye}
          trend={{
            value: dashboardData?.summary.trends.views.value || '+0%',
            isPositive: dashboardData?.summary.trends.views.isPositive ?? true,
          }}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Tỷ lệ tuyển dụng"
          value={`${dashboardData?.summary.hireRate || 0}%`}
          subtitle={
            dashboardData?.summary.hireRate && dashboardData.summary.hireRate >= 10
              ? 'Hiệu suất tốt'
              : 'Cần cải thiện'
          }
          icon={TrendingUp}
          trend={{
            value: dashboardData?.summary.trends.hireRate.value || '0%',
            isPositive: dashboardData?.summary.trends.hireRate.isPositive ?? true,
          }}
          gradient="from-pink-500 to-rose-600"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jobs Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <JobsOverview jobs={dashboardData?.recentJobs || []} isLoading={isLoading} />
        </div>

        {/* Pipeline Stats */}
        <div className="shadow-soft rounded-xl border border-purple-50 bg-white p-6">
          <h2 className="mb-6 text-lg font-bold text-gray-900">Pipeline ứng viên</h2>

          <div className="space-y-4">
            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Mới ứng tuyển</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {dashboardData?.pipeline.applied || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                  style={{
                    width: `${dashboardData?.pipeline.total ? (dashboardData.pipeline.applied / dashboardData.pipeline.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Đang xem xét</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {dashboardData?.pipeline.screening || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                  style={{
                    width: `${dashboardData?.pipeline.total ? (dashboardData.pipeline.screening / dashboardData.pipeline.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Phỏng vấn</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {dashboardData?.pipeline.interviewing || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                  style={{
                    width: `${dashboardData?.pipeline.total ? (dashboardData.pipeline.interviewing / dashboardData.pipeline.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="group">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-gray-700">Tuyển dụng</span>
                </div>
                <span className="text-sm font-bold text-gray-900">
                  {dashboardData?.pipeline.hired || 0}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                  style={{
                    width: `${dashboardData?.pipeline.total ? (dashboardData.pipeline.hired / dashboardData.pipeline.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tổng cộng</span>
              <span className="text-2xl font-bold text-purple-600">
                {dashboardData?.pipeline.total || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationsChart data={dashboardData?.applicationsChart || null} isLoading={isLoading} />
        <RecentActivity activities={dashboardData?.recentActivity || []} isLoading={isLoading} />
      </div>

      {/* Upcoming Interviews */}
      <div className="shadow-soft rounded-xl border border-purple-50 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lịch phỏng vấn sắp tới</h2>
            <p className="mt-1 text-sm text-gray-500">Các buổi phỏng vấn trong tuần</p>
          </div>
          <button className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700">
            Xem lịch đầy đủ
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dashboardData && dashboardData.upcomingInterviews.length > 0 ? (
            dashboardData.upcomingInterviews.map((interview, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/30 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex items-start gap-3">
                  {interview.candidateAvatar ? (
                    <img
                      src={interview.candidateAvatar}
                      alt={interview.candidateName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-sm font-bold text-purple-700">
                      {interview.candidateName.split(' ')[0][0]}
                      {interview.candidateName.split(' ').pop()?.[0]}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {interview.candidateName}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-600">{interview.position}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {interview.time}
                    </div>
                  </div>
                  {interview.status === 'confirmed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : interview.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-yellow-500" />
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center">
              <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p className="text-gray-600">Chưa có lịch phỏng vấn sắp tới</p>
            </div>
          )}
        </div>
      </div>

      {/* Alerts & Notifications */}
      {dashboardData && dashboardData.notifications.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {dashboardData.notifications.map((notification) => {
            const colorMap = {
              warning: {
                container: 'from-orange-50 to-orange-100/50 border-orange-200',
                icon: 'bg-orange-500',
                text: 'text-orange-900',
                subtext: 'text-orange-700',
                button: 'text-orange-700 hover:text-orange-800',
              },
              success: {
                container: 'from-green-50 to-green-100/50 border-green-200',
                icon: 'bg-green-500',
                text: 'text-green-900',
                subtext: 'text-green-700',
                button: 'text-green-700 hover:text-green-800',
              },
              info: {
                container: 'from-blue-50 to-blue-100/50 border-blue-200',
                icon: 'bg-blue-500',
                text: 'text-blue-900',
                subtext: 'text-blue-700',
                button: 'text-blue-700 hover:text-blue-800',
              },
              error: {
                container: 'from-red-50 to-red-100/50 border-red-200',
                icon: 'bg-red-500',
                text: 'text-red-900',
                subtext: 'text-red-700',
                button: 'text-red-700 hover:text-red-800',
              },
            };

            const colors = colorMap[notification.type];
            const IconComponent = notification.type === 'warning' ? AlertCircle : TrendingUp;

            return (
              <div
                key={notification.id}
                className={`rounded-xl border bg-gradient-to-br p-6 ${colors.container}`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg shadow-md ${colors.icon}`}
                  >
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold ${colors.text}`}>{notification.title}</h3>
                    <p className={`mt-1 text-sm ${colors.subtext}`}>{notification.message}</p>
                    {notification.actionText && notification.actionUrl && (
                      <Link
                        href={notification.actionUrl}
                        className={`mt-3 inline-block text-sm font-medium underline ${colors.button}`}
                      >
                        {notification.actionText} →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
