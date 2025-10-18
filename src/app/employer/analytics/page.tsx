'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  Briefcase,
  TrendingUp,
  Eye,
  Clock,
  Target,
  Award,
  Download,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { MetricsCard } from '@/components/employer/analytics/MetricsCard';
import { useApplicationStats, TimeRange } from '@/hooks/useApplicationStats';

const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7days', label: '7 ngày qua' },
  { value: '30days', label: '30 ngày qua' },
  { value: '90days', label: '90 ngày qua' },
  { value: 'year', label: '1 năm qua' },
];

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const { data, loading, error, refetch } = useApplicationStats({ timeRange });

  // Handle export functionality
  const handleExport = () => {
    // TODO: Implement export to CSV/PDF
    alert('Tính năng xuất báo cáo sẽ sớm được bổ sung');
  };

  // Loading state
  if (loading && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-purple-600" />
          <p className="text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
          <h3 className="mb-2 text-lg font-semibold text-red-900">Lỗi tải dữ liệu</h3>
          <p className="mb-4 text-red-700">{error}</p>
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

  // Prepare conversion funnel data from API
  const conversionData = data
    ? [
        {
          stage: 'Ứng tuyển',
          count: data.conversionFunnel.applied,
          percentage: 100,
          color: 'bg-blue-500',
        },
        {
          stage: 'Xem xét',
          count: data.conversionFunnel.reviewed,
          percentage:
            data.conversionFunnel.applied > 0
              ? Math.round((data.conversionFunnel.reviewed / data.conversionFunnel.applied) * 100)
              : 0,
          color: 'bg-purple-500',
        },
        {
          stage: 'Phỏng vấn',
          count: data.conversionFunnel.interviewed,
          percentage:
            data.conversionFunnel.applied > 0
              ? Math.round(
                  (data.conversionFunnel.interviewed / data.conversionFunnel.applied) * 100
                )
              : 0,
          color: 'bg-yellow-500',
        },
        {
          stage: 'Tuyển dụng',
          count: data.conversionFunnel.hired,
          percentage:
            data.conversionFunnel.applied > 0
              ? Math.round((data.conversionFunnel.hired / data.conversionFunnel.applied) * 100)
              : 0,
          color: 'bg-green-500',
        },
        {
          stage: 'Từ chối',
          count: data.conversionFunnel.rejected,
          percentage:
            data.conversionFunnel.applied > 0
              ? Math.round((data.conversionFunnel.rejected / data.conversionFunnel.applied) * 100)
              : 0,
          color: 'bg-red-500',
        },
      ]
    : [];

  // Get top performer from applicationsByJob
  const topPerformer =
    data?.applicationsByJob && data.applicationsByJob.length > 0 ? data.applicationsByJob[0] : null;

  // Get most popular job
  const mostPopular =
    data?.applicationsByJob && data.applicationsByJob.length > 0
      ? data.applicationsByJob.reduce((max, job) => (job.count > max.count ? job : max))
      : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-white" />
            <div>
              <h1 className="mb-1 text-2xl font-bold text-white">Báo cáo & Thống kê</h1>
              <p className="text-purple-100">Phân tích hiệu quả tuyển dụng và xu hướng</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="cursor-pointer rounded-lg border-0 bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30"
            >
              {TIME_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value} className="text-gray-900">
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg"
            >
              <Download className="h-4 w-4" />
              Xuất báo cáo
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Tổng ứng tuyển"
          value={data?.summary.totalApplications || 0}
          icon={Users}
          description={`Trong ${TIME_RANGE_OPTIONS.find((o) => o.value === timeRange)?.label.toLowerCase() || ''}`}
          gradient="from-blue-500 to-indigo-600"
        />
        <MetricsCard
          title="Công việc hoạt động"
          value={data?.applicationsByJob.length || 0}
          icon={Briefcase}
          description="Có ứng viên ứng tuyển"
          gradient="from-purple-500 to-purple-600"
        />
        <MetricsCard
          title="Tỷ lệ tuyển dụng"
          value={`${data?.summary.hireRate || 0}%`}
          icon={Target}
          description="Từ ứng tuyển đến tuyển dụng"
          gradient="from-green-500 to-emerald-600"
        />
        <MetricsCard
          title="Thời gian tuyển dụng"
          value={`${data?.summary.averageTimeToHire || 0} ngày`}
          icon={Clock}
          description="Trung bình thời gian từ ứng tuyển"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Phễu chuyển đổi</h2>
              <p className="mt-1 text-sm text-gray-500">Từ ứng tuyển đến tuyển dụng</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">{data?.summary.hireRate || 0}%</p>
              <p className="text-xs text-gray-500">Tỷ lệ tuyển dụng</p>
            </div>
          </div>

          <div className="space-y-4">
            {conversionData.map((stage, index) => (
              <div key={index} className="relative">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900">{stage.count}</span>
                    <span className="text-gray-500">({stage.percentage}%)</span>
                  </div>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                {index < conversionData.length - 1 && (
                  <div className="absolute right-0 -bottom-2 left-0 flex justify-center">
                    <div className="h-4 w-px bg-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Top Skills */}
        <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Kỹ năng phổ biến</h2>
            <p className="mt-1 text-sm text-gray-500">
              Kỹ năng xuất hiện nhiều nhất trong ứng viên
            </p>
          </div>

          <div className="space-y-3">
            {data?.topSkills && data.topSkills.length > 0 ? (
              data.topSkills.slice(0, 6).map((skill, index) => {
                const maxCount = data.topSkills[0]?.count || 1;
                const barWidth = (skill.count / maxCount) * 100;

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-32 truncate text-sm font-medium text-gray-700">
                      {skill.skill}
                    </div>
                    <div className="flex-1">
                      <div className="relative h-7 w-full overflow-hidden rounded-lg bg-gray-100">
                        <div
                          className="flex h-full items-center bg-gradient-to-r from-purple-500 to-purple-600 px-3 transition-all duration-500"
                          style={{ width: `${barWidth}%` }}
                        >
                          <span className="text-xs font-semibold text-white">{skill.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center text-gray-500">
                <p>Chưa có dữ liệu kỹ năng</p>
              </div>
            )}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {data?.summary.averageTimeToHire || 0}
              </p>
              <p className="mt-1 text-xs text-gray-500">Ngày tuyển dụng TB</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{data?.topSkills.length || 0}</p>
              <p className="mt-1 text-xs text-gray-500">Kỹ năng khác nhau</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hiệu suất công việc</h2>
            <p className="mt-1 text-sm text-gray-500">So sánh hiệu quả các tin tuyển dụng</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {data?.applicationsByJob && data.applicationsByJob.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                  <th className="pb-3">Vị trí</th>
                  <th className="pb-3 text-center">Ứng tuyển</th>
                  <th className="pb-3 text-center">% Tổng ứng tuyển</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {data.applicationsByJob.map((job, index) => {
                  const percentage =
                    data.summary.totalApplications > 0
                      ? ((job.count / data.summary.totalApplications) * 100).toFixed(1)
                      : 0;

                  return (
                    <tr
                      key={job.jobId}
                      className="border-b border-gray-100 transition-colors hover:bg-purple-50/50"
                    >
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                            <Briefcase className="h-5 w-5 text-white" />
                          </div>
                          <span className="font-medium text-gray-900">{job.jobTitle}</span>
                        </div>
                      </td>
                      <td className="py-4 text-center font-semibold text-gray-900">{job.count}</td>
                      <td className="py-4 text-center">
                        <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
              <p>Chưa có dữ liệu công việc</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
          <Users className="mb-3 h-8 w-8 text-purple-600" />
          <h3 className="mb-1 font-semibold text-purple-900">Nhiều nhất</h3>
          <p className="truncate text-2xl font-bold text-purple-700">
            {mostPopular?.jobTitle || 'Chưa có dữ liệu'}
          </p>
          <p className="mt-2 text-sm text-purple-600">
            {mostPopular ? `${mostPopular.count} ứng tuyển` : 'Không có ứng tuyển'}
          </p>
        </div>

        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
          <Target className="mb-3 h-8 w-8 text-blue-600" />
          <h3 className="mb-1 font-semibold text-blue-900">Tỷ lệ tuyển dụng</h3>
          <p className="text-2xl font-bold text-blue-700">{data?.summary.hireRate || 0}%</p>
          <p className="mt-2 text-sm text-blue-600">
            {data?.conversionFunnel.hired || 0} người được tuyển dụng
          </p>
        </div>

        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
          <Clock className="mb-3 h-8 w-8 text-green-600" />
          <h3 className="mb-1 font-semibold text-green-900">Thời gian TB</h3>
          <p className="text-2xl font-bold text-green-700">
            {data?.summary.averageTimeToHire || 0} ngày
          </p>
          <p className="mt-2 text-sm text-green-600">Từ ứng tuyển đến tuyển dụng</p>
        </div>
      </div>
    </div>
  );
}
