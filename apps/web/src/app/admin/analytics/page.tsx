'use client';

import React, { useState } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Calendar,
  Download,
  Loader2,
  AlertCircle,
  Target,
  Clock,
  Award,
  Eye,
  DollarSign,
  MapPin,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  XCircle,
  UserCheck,
  Zap,
  User,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAdminDashboard, useAdminDashboardAnalytics } from '@/hooks/useAdminDashboard';
import type { TimeRange } from '@/types/admin/dashboard.types';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function AdminAnalyticsPage() {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      <AdminAnalyticsContent />
    </ProtectedRoute>
  );
}

function AdminAnalyticsContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch dashboard data
  const {
    overview,
    activities,
    isLoading: overviewLoading,
  } = useAdminDashboard({
    overviewParams: { includeTopPerformers: true, topLimit: 10 },
  });

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useAdminDashboardAnalytics({
    timeRange,
    includeTimeSeries: true,
  });

  const isLoading = overviewLoading || analyticsLoading;
  const overviewData = overview.data?.data;
  const analytics = analyticsData?.data;

  if (isLoading && !overviewData && !analytics) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-5 p-4 md:p-6">
        {/* Compact Header with Glass Effect */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-4 shadow-xl md:p-5">
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="text-white">
              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight md:text-3xl">
                <div className="rounded-xl bg-white/20 p-2 backdrop-blur-md">
                  <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                Dashboard & Analytics
              </h1>
              <p className="mt-1.5 text-sm font-medium text-white/90 md:text-base">
                📊 Tổng quan và phân tích hệ thống
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[140px] border-white/30 bg-white/20 text-sm text-white backdrop-blur-md hover:bg-white/30 md:w-[160px]">
                  <Calendar className="mr-1.5 h-3.5 w-3.5" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 ngày</SelectItem>
                  <SelectItem value="30days">30 ngày</SelectItem>
                  <SelectItem value="90days">90 ngày</SelectItem>
                  <SelectItem value="6months">6 tháng</SelectItem>
                  <SelectItem value="year">1 năm</SelectItem>
                </SelectContent>
              </Select>
              {/* <Button
                variant="outline"
                size="sm"
                className="hidden border-white/30 bg-white/20 text-white backdrop-blur-md hover:bg-white/30 hover:text-white md:flex"
              >
                <Download className="mr-1.5 h-3.5 w-3.5" />
                <span className="hidden lg:inline">Xuất</span>
              </Button> */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="border-white/30 bg-white/20 p-2 text-white backdrop-blur-md hover:bg-white/30 hover:text-white"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
          {/* Animated gradient background */}
          <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        {/* Compact Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid w-full max-w-sm grid-cols-2 rounded-xl bg-white/80 p-1 shadow-lg backdrop-blur-sm dark:bg-slate-900/80">
            <TabsTrigger
              value="overview"
              className="rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="rounded-lg text-sm data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
            >
              <BarChart3 className="mr-1.5 h-3.5 w-3.5" />
              Phân tích
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-5">
            {/* Key Metrics - Compact */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <MetricCard
                title="Tổng người dùng"
                value={overviewData?.systemStats.totalUsers.toLocaleString() || '0'}
                trend={overviewData?.systemStats.trends.users}
                icon={Users}
                description="Người dùng hoạt động"
                gradient="from-blue-500 to-blue-600"
              />
              <MetricCard
                title="Việc làm đang tuyển"
                value={overviewData?.systemStats.activeJobs.toLocaleString() || '0'}
                trend={overviewData?.systemStats.trends.jobs}
                icon={Briefcase}
                description="Tin tuyển dụng"
                gradient="from-green-500 to-green-600"
              />
              <MetricCard
                title="Công ty"
                value={overviewData?.systemStats.totalCompanies.toLocaleString() || '0'}
                trend={overviewData?.systemStats.trends.companies}
                icon={Building2}
                description={`${overviewData?.systemStats.verifiedCompanies || 0} đã xác thực`}
                gradient="from-purple-500 to-purple-600"
              />
              <MetricCard
                title="Đơn ứng tuyển"
                value={overviewData?.systemStats.totalApplications.toLocaleString() || '0'}
                trend={overviewData?.systemStats.trends.applications}
                icon={FileText}
                description="Tổng ứng tuyển"
                gradient="from-orange-500 to-orange-600"
              />
            </div>

            {/* Recruitment Metrics - Compact */}
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ tuyển dụng</CardTitle>
                  <Target className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewData?.recruitmentMetrics.hireRate.toFixed(1)}%
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {overviewData?.recruitmentMetrics.totalHired.toLocaleString()} được tuyển
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Thời gian tuyển dụng TB</CardTitle>
                  <Clock className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewData?.recruitmentMetrics.averageTimeToHire || 0} ngày
                  </div>
                  <p className="text-muted-foreground text-xs">Từ ứng tuyển đến tuyển dụng</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tỷ lệ chuyển đổi</CardTitle>
                  <Activity className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewData?.recruitmentMetrics.conversionRate.toFixed(2)}%
                  </div>
                  <p className="text-muted-foreground text-xs">Lượt xem → Ứng tuyển</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Lượt xem việc làm</CardTitle>
                  <Eye className="text-muted-foreground h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewData?.recruitmentMetrics.totalJobViews.toLocaleString()}
                  </div>
                  <p className="text-muted-foreground text-xs">Tổng lượt xem</p>
                </CardContent>
              </Card>
            </div>

            {/* Pipeline & Distribution - Side by Side */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Application Pipeline - 2 columns */}
              <div className="lg:col-span-2">
                <Card className="h-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Pipeline ứng tuyển</CardTitle>
                    <CardDescription className="text-xs">Trạng thái đơn ứng tuyển</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <PipelineItem
                      label="Mới ứng tuyển"
                      count={overviewData?.applicationPipeline.applied || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-blue-500"
                    />
                    <PipelineItem
                      label="Đang sàng lọc"
                      count={overviewData?.applicationPipeline.screening || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-yellow-500"
                    />
                    <PipelineItem
                      label="Phỏng vấn"
                      count={overviewData?.applicationPipeline.interviewing || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-purple-500"
                    />
                    <PipelineItem
                      label="Đề nghị"
                      count={overviewData?.applicationPipeline.offered || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-indigo-500"
                    />
                    <PipelineItem
                      label="Đã tuyển"
                      count={overviewData?.applicationPipeline.hired || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-green-500"
                    />
                    <PipelineItem
                      label="Từ chối"
                      count={overviewData?.applicationPipeline.rejected || 0}
                      total={overviewData?.systemStats.totalApplications || 1}
                      color="bg-red-500"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* User Distribution - 1 column */}
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Phân bố người dùng</CardTitle>
                  <CardDescription className="text-xs">Theo loại tài khoản</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  <UserDistributionItem
                    label="Ứng viên"
                    count={overviewData?.userBreakdown.candidates || 0}
                    total={overviewData?.systemStats.totalUsers || 1}
                    color="bg-blue-500"
                    icon={Users}
                  />
                  <UserDistributionItem
                    label="Nhà tuyển dụng"
                    count={overviewData?.userBreakdown.employers || 0}
                    total={overviewData?.systemStats.totalUsers || 1}
                    color="bg-green-500"
                    icon={Building2}
                  />
                  <UserDistributionItem
                    label="Quản trị viên"
                    count={overviewData?.userBreakdown.admins || 0}
                    total={overviewData?.systemStats.totalUsers || 1}
                    color="bg-purple-500"
                    icon={Award}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Top Performers & Activities - 3-Column Layout */}
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Top Companies - Smaller */}
              <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-purple-50/20 to-white shadow-lg transition-all duration-300 hover:shadow-xl dark:from-slate-900 dark:via-purple-950/10 dark:to-slate-900">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl" />

                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 p-1.5 shadow-md">
                      <Building2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-sm font-bold text-transparent">
                        Top Công ty
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-1.5">
                    {overviewData?.topPerformers.companies.slice(0, 3).map((company, index) => (
                      <div
                        key={company.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:border-purple-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-purple-700"
                      >
                        {/* Rank Badge - Top Left Corner */}
                        <div className="absolute top-0 left-0 z-10">
                          <div
                            className={`flex h-6 w-6 items-center justify-center rounded-tl-xl rounded-br-lg shadow-lg transition-transform group-hover:scale-110 ${
                              index === 0
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                : index === 1
                                  ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                                  : 'bg-gradient-to-br from-orange-400 to-red-500'
                            }`}
                          >
                            <span className="text-xs font-black text-white drop-shadow">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          </div>
                        </div>

                        <div className="relative p-2 pt-2.5">
                          <div className="flex items-center gap-2">
                            {/* Company Logo - Smaller */}
                            <div className="relative flex-shrink-0">
                              {company.logoUrl ? (
                                <div className="h-10 w-10 overflow-hidden rounded-lg bg-slate-100 ring-2 ring-slate-200 transition-all group-hover:ring-purple-300 dark:bg-slate-700 dark:ring-slate-600 dark:group-hover:ring-purple-600">
                                  <img
                                    src={company.logoUrl}
                                    alt={`${company.name} logo`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                      const parent = (e.target as HTMLImageElement).parentElement;
                                      if (parent) {
                                        parent.innerHTML = `<div class="h-full w-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800"><span class="text-base font-bold text-purple-600 dark:text-purple-300">${company.name.charAt(0).toUpperCase()}</span></div>`;
                                      }
                                    }}
                                  />
                                </div>
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-purple-200 ring-2 ring-slate-200 transition-all group-hover:ring-purple-300 dark:from-purple-900 dark:to-purple-800 dark:ring-slate-600 dark:group-hover:ring-purple-600">
                                  <span className="text-base font-bold text-purple-600 dark:text-purple-300">
                                    {company.name.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {/* Verified Badge on Logo */}
                              {company.verificationStatus === 'VERIFIED' && (
                                <div className="absolute -right-0.5 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-md dark:bg-slate-800">
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                </div>
                              )}
                            </div>

                            {/* Company Info - Compact */}
                            <div className="min-w-0 flex-1">
                              <p className="mb-0.5 truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-purple-600 dark:text-white dark:group-hover:text-purple-400">
                                {company.name}
                              </p>
                              <div className="text-muted-foreground relative flex items-center gap-1 text-xs">
                                <span className="flex items-center gap-0.5">
                                  <Briefcase className="h-2.5 w-2.5" />
                                  {`${company.activeJobs} jobs`}
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-0.5">
                                  <User className="h-2.5 w-2.5" />
                                  {`${company.totalApplications} applications `}
                                </span>
                                <span className="top-o absolute right-0 rounded bg-green-100 px-1 py-0.5 text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  {company.hireRate.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Slim Progress bar */}
                          <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500"
                              style={{
                                width: `${Math.min((company.totalApplications / (overviewData?.topPerformers.companies[0]?.totalApplications || 1)) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Top Jobs - Smaller */}
              <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-green-50/20 to-white shadow-lg transition-all duration-300 hover:shadow-xl dark:from-slate-900 dark:via-green-950/10 dark:to-slate-900">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-green-500/5 blur-2xl" />

                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 p-1.5 shadow-md">
                      <Briefcase className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-sm font-bold text-transparent">
                        Top Việc làm
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-1.5">
                    {overviewData?.topPerformers.jobs.slice(0, 3).map((job, index) => (
                      <div
                        key={job.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:border-green-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-green-700"
                      >
                        <div className="relative flex items-center gap-2">
                          {/* Rank Badge - Smaller */}
                          <div className="relative flex-shrink-0">
                            <div
                              className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-md transition-transform group-hover:scale-105 ${
                                index === 0
                                  ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                  : index === 1
                                    ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                                    : 'bg-gradient-to-br from-orange-400 to-red-500'
                              }`}
                            >
                              <span className="text-xs font-black text-white">
                                {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                              </span>
                            </div>
                          </div>

                          {/* Job Info - Compact */}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold text-slate-900 transition-colors group-hover:text-green-600 dark:text-white dark:group-hover:text-green-400">
                              {job.title}
                            </p>
                            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
                              <Building2 className="h-2.5 w-2.5 flex-shrink-0" />
                              <span className="truncate">{job.companyName}</span>
                            </div>
                          </div>

                          {/* Metrics - Compact */}
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {job.applications}
                            </span>
                            <div className="rounded bg-blue-100 px-1 py-0.5 dark:bg-blue-900/30">
                              <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                {job.conversionRate.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Slim Progress bar */}
                        <div className="mt-1.5 h-0.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-500"
                            style={{
                              width: `${Math.min((job.applications / (overviewData?.topPerformers.jobs[0]?.applications || 1)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-blue-50/20 to-white shadow-lg dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900">
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />

                <CardHeader className="relative pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 p-1.5 shadow-md">
                      <Activity className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-sm font-bold text-transparent">
                        Hoạt động gần đây
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-1.5">
                    {activities.data?.data.recentActivities.slice(0, 4).map((activity) => (
                      <div
                        key={activity.id}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-blue-700"
                      >
                        <div className="relative flex items-start gap-2">
                          {/* Activity Icon */}
                          {/* <div className="mt-0.5 flex-shrink-0">
                            <ActivityIcon type={activity.type} />
                          </div> */}

                          {/* Activity Info */}
                          <div className="min-w-0 flex-1">
                            <p className="mb-0.5 line-clamp-2 text-xs font-semibold text-slate-900 dark:text-white">
                              {activity.description}
                            </p>
                            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                              <span className="truncate">{`${activity.userName || 'System'}(${activity.userType?.toLocaleLowerCase()})`}</span>
                              <span>•</span>
                              <span className="whitespace-nowrap">
                                {formatDistanceToNow(new Date(activity.timestamp), {
                                  addSuffix: true,
                                  locale: vi,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-5">
            {analyticsLoading ? (
              <LoadingState />
            ) : analyticsError ? (
              <ErrorState error={analyticsError} />
            ) : (
              <>
                {/* Growth Metrics - Modern Cards */}
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <GrowthCard
                    title="Tăng trưởng người dùng"
                    data={analytics?.growthMetrics.userGrowth}
                    icon={Users}
                  />
                  <GrowthCard
                    title="Tăng trưởng công ty"
                    data={analytics?.growthMetrics.companyGrowth}
                    icon={Building2}
                  />
                  <GrowthCard
                    title="Tăng trưởng việc làm"
                    data={analytics?.growthMetrics.jobGrowth}
                    icon={Briefcase}
                  />
                  <GrowthCard
                    title="Tăng trưởng ứng tuyển"
                    data={analytics?.growthMetrics.applicationGrowth}
                    icon={FileText}
                  />
                </div>

                {/* Conversion Funnel & Performance - 3 Columns */}
                <div className="grid gap-4 lg:grid-cols-3">
                  {/* Conversion Funnel */}
                  <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-blue-50/20 to-white shadow-lg dark:from-slate-900 dark:via-blue-950/10 dark:to-slate-900">
                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl" />
                    <CardHeader className="relative pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 p-1.5 shadow-md">
                          <TrendingDown className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text font-bold text-transparent">
                          Phễu chuyển đổi
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Từ lượt xem đến tuyển dụng
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <FunnelStep
                        label="Lượt xem việc làm"
                        count={analytics?.conversionFunnel.jobViews || 0}
                        percentage={100}
                        color="bg-blue-500"
                      />
                      <FunnelStep
                        label="Ứng tuyển"
                        count={analytics?.conversionFunnel.applications || 0}
                        percentage={
                          analytics?.conversionFunnel.jobViews
                            ? (analytics.conversionFunnel.applications /
                                analytics.conversionFunnel.jobViews) *
                              100
                            : 0
                        }
                        color="bg-green-500"
                      />
                      <FunnelStep
                        label="Sàng lọc"
                        count={analytics?.conversionFunnel.screening || 0}
                        percentage={
                          analytics?.conversionFunnel.jobViews
                            ? (analytics.conversionFunnel.screening /
                                analytics.conversionFunnel.jobViews) *
                              100
                            : 0
                        }
                        color="bg-yellow-500"
                      />
                      <FunnelStep
                        label="Phỏng vấn"
                        count={analytics?.conversionFunnel.interviewing || 0}
                        percentage={
                          analytics?.conversionFunnel.jobViews
                            ? (analytics.conversionFunnel.interviewing /
                                analytics.conversionFunnel.jobViews) *
                              100
                            : 0
                        }
                        color="bg-purple-500"
                      />
                      <FunnelStep
                        label="Tuyển dụng"
                        count={analytics?.conversionFunnel.hired || 0}
                        percentage={
                          analytics?.conversionFunnel.jobViews
                            ? (analytics.conversionFunnel.hired /
                                analytics.conversionFunnel.jobViews) *
                              100
                            : 0
                        }
                        color="bg-emerald-500"
                      />
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-purple-50/20 to-white shadow-lg dark:from-slate-900 dark:via-purple-950/10 dark:to-slate-900">
                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-purple-500/5 blur-2xl" />
                    <CardHeader className="relative pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 p-1.5 shadow-md">
                          <Target className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text font-bold text-transparent">
                          Chỉ số hiệu suất
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">Các chỉ số quan trọng</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-4">
                      <div className="rounded-xl border-2 border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Ứng tuyển/Việc làm TB
                          </span>
                          <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                            {analytics?.performanceMetrics.averageApplicationsPerJob.toFixed(1)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            (analytics?.performanceMetrics.averageApplicationsPerJob || 0) * 2,
                            100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div className="rounded-xl border-2 border-green-100 bg-green-50/50 p-3 dark:border-green-900/30 dark:bg-green-950/20">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Lượt xem/Việc làm TB
                          </span>
                          <span className="text-xl font-black text-green-600 dark:text-green-400">
                            {analytics?.performanceMetrics.averageViewsPerJob.toFixed(0)}
                          </span>
                        </div>
                        <Progress
                          value={Math.min(
                            (analytics?.performanceMetrics.averageViewsPerJob || 0) / 10,
                            100
                          )}
                          className="h-2"
                        />
                      </div>

                      <div className="rounded-xl border-2 border-orange-100 bg-orange-50/50 p-3 dark:border-orange-900/30 dark:bg-orange-950/20">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Thời gian ứng tuyển đầu tiên
                          </span>
                          <span className="text-xl font-black text-orange-600 dark:text-orange-400">
                            {analytics?.performanceMetrics.averageTimeToFirstApplication.toFixed(1)}
                            h
                          </span>
                        </div>
                        <Progress
                          value={Math.max(
                            100 -
                              (analytics?.performanceMetrics.averageTimeToFirstApplication || 0) *
                                2,
                            0
                          )}
                          className="h-2"
                        />
                      </div>

                      <div className="rounded-xl border-2 border-purple-100 bg-purple-50/50 p-3 dark:border-purple-900/30 dark:bg-purple-950/20">
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Tỷ lệ lấp đầy việc làm
                          </span>
                          <span className="text-xl font-black text-purple-600 dark:text-purple-400">
                            {analytics?.performanceMetrics.jobFillRate.toFixed(1)}%
                          </span>
                        </div>
                        <Progress
                          value={analytics?.performanceMetrics.jobFillRate || 0}
                          className="h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats Card - 3rd Column */}
                  <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-emerald-50/20 to-white shadow-lg dark:from-slate-900 dark:via-emerald-950/10 dark:to-slate-900">
                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-emerald-500/5 blur-2xl" />
                    <CardHeader className="relative pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 p-1.5 shadow-md">
                          <Zap className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text font-bold text-transparent">
                          Thống kê nhanh
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">Chỉ số quan trọng</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="rounded-xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:border-blue-900/30 dark:from-blue-950/30 dark:to-blue-900/20">
                        <div className="mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Tổng ứng tuyển
                          </p>
                        </div>
                        <p className="text-3xl font-black text-blue-600 dark:text-blue-400">
                          {(analytics?.conversionFunnel.applications || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:border-green-900/30 dark:from-green-950/30 dark:to-green-900/20">
                        <div className="mb-2 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Đã tuyển dụng
                          </p>
                        </div>
                        <p className="text-3xl font-black text-green-600 dark:text-green-400">
                          {(analytics?.conversionFunnel.hired || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 dark:border-purple-900/30 dark:from-purple-950/30 dark:to-purple-900/20">
                        <div className="mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Tỷ lệ chuyển đổi
                          </p>
                        </div>
                        <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                          {analytics?.conversionFunnel.jobViews
                            ? (
                                (analytics.conversionFunnel.applications /
                                  analytics.conversionFunnel.jobViews) *
                                100
                              ).toFixed(1)
                            : '0'}
                          %
                        </p>
                      </div>

                      <div className="rounded-xl border-2 border-orange-100 bg-gradient-to-br from-orange-50 to-orange-100/50 p-4 dark:border-orange-900/30 dark:from-orange-950/30 dark:to-orange-900/20">
                        <div className="mb-2 flex items-center gap-2">
                          <Eye className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Tổng lượt xem
                          </p>
                        </div>
                        <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
                          {(analytics?.conversionFunnel.jobViews || 0).toLocaleString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Top Skills & Salary Insights */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Top Skills */}
                  <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-yellow-50/20 to-white shadow-lg dark:from-slate-900 dark:via-yellow-950/10 dark:to-slate-900">
                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-yellow-500/5 blur-2xl" />
                    <CardHeader className="relative pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 p-1.5 shadow-md">
                          <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text font-bold text-transparent">
                          Kỹ năng phổ biến
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Top 10 kỹ năng được yêu cầu nhiều nhất
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-2.5">
                        {analytics?.topSkills.slice(0, 8).map((skill, index) => (
                          <div
                            key={skill.skillId}
                            className="group rounded-lg border border-slate-200 bg-white p-2.5 transition-all hover:border-yellow-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:hover:border-yellow-700"
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold text-white shadow-sm ${
                                  index === 0
                                    ? 'bg-gradient-to-br from-yellow-400 to-orange-500'
                                    : index === 1
                                      ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                                      : index === 2
                                        ? 'bg-gradient-to-br from-orange-400 to-red-500'
                                        : 'bg-gradient-to-br from-slate-400 to-slate-600'
                                }`}
                              >
                                {index + 1}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                  <span className="truncate text-xs font-semibold text-slate-900 dark:text-white">
                                    {skill.skillName}
                                  </span>
                                  <span className="text-muted-foreground ml-2 text-xs">
                                    {skill.count}{' '}
                                    <span className="font-bold text-yellow-600 dark:text-yellow-500">
                                      ({skill.percentage}%)
                                    </span>
                                  </span>
                                </div>
                                <Progress value={skill.percentage} className="h-1.5" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Salary Insights */}
                  <Card className="relative overflow-hidden border bg-gradient-to-br from-white via-green-50/20 to-white shadow-lg dark:from-slate-900 dark:via-green-950/10 dark:to-slate-900">
                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-green-500/5 blur-2xl" />
                    <CardHeader className="relative pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <div className="rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 p-1.5 shadow-md">
                          <DollarSign className="h-4 w-4 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text font-bold text-transparent">
                          Phân tích lương
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Phân bố mức lương trong hệ thống
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="mb-4 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border-2 border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 p-3 dark:border-green-900/30 dark:from-green-950/30 dark:to-green-900/20">
                          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            Mức lương TB
                          </p>
                          <p className="text-lg font-black text-green-600 dark:text-green-400">
                            {((analytics?.salaryInsights.averageSalary || 0) / 1000000).toFixed(1)}M
                          </p>
                        </div>
                        <div className="rounded-xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-100/50 p-3 dark:border-emerald-900/30 dark:from-emerald-950/30 dark:to-emerald-900/20">
                          <p className="mb-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            Mức lương trung vị
                          </p>
                          <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                            {((analytics?.salaryInsights.medianSalary || 0) / 1000000).toFixed(1)}M
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {analytics?.salaryInsights.salaryRanges.map((range) => (
                          <div key={range.range}>
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-sm font-medium">{range.range}</span>
                              <span className="text-muted-foreground text-sm">
                                {range.count} ({range.percentage}%)
                              </span>
                            </div>
                            <Progress value={range.percentage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Industry & Location Distribution */}
                <div className="grid gap-4 lg:grid-cols-2">
                  {/* Industry Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Phân bố ngành nghề</CardTitle>
                      <CardDescription>Top ngành có nhiều việc làm nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics?.industryDistribution.slice(0, 6).map((industry) => (
                          <div
                            key={industry.industryId}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{industry.industryName}</p>
                              <p className="text-muted-foreground text-sm">
                                {industry.companyCount} công ty • {industry.jobCount} việc làm
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{industry.applicationCount}</p>
                              <p className="text-muted-foreground text-xs">ứng tuyển</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Location Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-red-500" />
                        Phân bố địa lý
                      </CardTitle>
                      <CardDescription>Top địa điểm có nhiều việc làm nhất</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analytics?.locationDistribution.slice(0, 6).map((location, index) => (
                          <div
                            key={location.province}
                            className="flex items-center justify-between rounded-lg border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-red-600 text-sm font-bold text-white">
                                #{index + 1}
                              </div>
                              <div>
                                <p className="font-medium">{location.province}</p>
                                <p className="text-muted-foreground text-sm">
                                  {location.jobCount} việc làm • {location.companyCount} công ty
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">{location.percentage.toFixed(1)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, trend, icon: Icon, description, gradient }: any) {
  return (
    <Card className="group relative overflow-hidden border bg-gradient-to-br from-white to-slate-50 shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg dark:from-slate-900 dark:to-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </CardTitle>
        <div
          className={`rounded-lg bg-gradient-to-br ${gradient} p-2 shadow-md transition-transform group-hover:scale-105`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        {trend && (
          <div className="mt-1 flex items-center gap-1">
            <div
              className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 ${
                trend.isPositive
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              <span className="text-xs font-bold">{trend.value}</span>
            </div>
          </div>
        )}
        <p className="text-muted-foreground mt-1.5 text-xs">{description}</p>
      </CardContent>
    </Card>
  );
}

function PipelineItem({ label, count, total, color }: any) {
  const percentage = (count / total) * 100;
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {count.toLocaleString()}{' '}
          <span className="text-muted-foreground text-xs">({percentage.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function UserDistributionItem({ label, count, total, color, icon: Icon }: any) {
  const percentage = (count / total) * 100;
  return (
    <div className="group rounded-lg border border-transparent bg-white p-2.5 transition-all hover:border-purple-200 hover:shadow-sm dark:bg-slate-800 dark:hover:border-purple-700">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`rounded-lg ${color} p-1.5 text-white shadow-md`}>
            <Icon className="h-3 w-3" />
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-900 dark:text-white">
          {count.toLocaleString()}
        </span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const getIconAndColor = () => {
    if (type.includes('VERIFICATION'))
      return {
        icon: CheckCircle2,
        color: 'bg-gradient-to-br from-green-500 to-emerald-600',
        text: 'text-white',
      };
    if (type.includes('HIRED'))
      return {
        icon: UserCheck,
        color: 'bg-gradient-to-br from-green-500 to-teal-600',
        text: 'text-white',
      };
    if (type.includes('REJECTED') || type.includes('SUSPENDED'))
      return {
        icon: XCircle,
        color: 'bg-gradient-to-br from-red-500 to-rose-600',
        text: 'text-white',
      };
    if (type.includes('UPDATE'))
      return {
        icon: Zap,
        color: 'bg-gradient-to-br from-yellow-500 to-orange-600',
        text: 'text-white',
      };
    return {
      icon: Activity,
      color: 'bg-gradient-to-br from-blue-500 to-cyan-600',
      text: 'text-white',
    };
  };

  const { icon: IconComponent, color, text } = getIconAndColor();

  return (
    <div className={`rounded-lg p-1.5 ${color} ${text} shadow-md`}>
      <IconComponent className="h-3 w-3" />
    </div>
  );
}

function GrowthCard({ title, data, icon: Icon }: any) {
  return (
    <Card className="group relative overflow-hidden border shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          {title}
        </CardTitle>
        <div
          className={`rounded-lg p-2 ${
            data?.isPositive
              ? 'bg-gradient-to-br from-green-500 to-emerald-600'
              : 'bg-gradient-to-br from-red-500 to-rose-600'
          } shadow-md`}
        >
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {data?.current.toLocaleString()}
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <div
            className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 ${
              data?.isPositive
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {data?.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span className="text-xs font-bold">
              {data?.growthRate >= 0 ? '+' : ''}
              {data?.growthRate.toFixed(1)}%
            </span>
          </div>
          <span className="text-muted-foreground text-xs">
            ({data?.growthCount >= 0 ? '+' : ''}
            {data?.growthCount})
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelStep({ label, count, percentage, color }: any) {
  return (
    <div className="group">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            {count.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">({percentage.toFixed(0)}%)</span>
        </div>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-30 blur-2xl" />
          <Loader2
            className="relative mx-auto h-16 w-16 animate-spin bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent"
            strokeWidth={3}
          />
        </div>
        <div className="space-y-2">
          <p className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-lg font-semibold text-transparent">
            Đang tải dữ liệu phân tích...
          </p>
          <p className="text-muted-foreground text-sm">Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="max-w-md rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-8 text-center shadow-2xl dark:from-red-950 dark:to-rose-950">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-500 opacity-20 blur-3xl" />
          <AlertCircle
            className="relative mx-auto mb-6 h-16 w-16 text-red-600 dark:text-red-400"
            strokeWidth={2.5}
          />
        </div>
        <h3 className="mb-3 text-2xl font-bold text-red-900 dark:text-red-100">
          ❌ Lỗi tải dữ liệu
        </h3>
        <p className="mb-6 font-medium text-red-700 dark:text-red-300">{error.message}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg hover:from-red-700 hover:to-rose-700"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </div>
    </div>
  );
}
