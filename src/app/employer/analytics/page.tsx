'use client';

import { BarChart3, Users, Briefcase, TrendingUp, Eye, Clock, Target, Award, Download, Calendar } from 'lucide-react';
import { MetricsCard } from '@/components/employer/analytics/MetricsCard';

const conversionData = [
  { stage: 'Ứng tuyển', count: 328, percentage: 100, color: 'bg-blue-500' },
  { stage: 'Xem xét', count: 156, percentage: 47.6, color: 'bg-purple-500' },
  { stage: 'Phỏng vấn', count: 95, percentage: 29, color: 'bg-yellow-500' },
  { stage: 'Offer', count: 42, percentage: 12.8, color: 'bg-orange-500' },
  { stage: 'Chấp nhận', count: 28, percentage: 8.5, color: 'bg-green-500' },
];

const jobPerformance = [
  { job: 'Senior Frontend Developer', applications: 45, views: 342, conversion: 12.5, status: 'Active' },
  { job: 'Product Manager', applications: 38, views: 298, conversion: 15.8, status: 'Active' },
  { job: 'Backend Developer', applications: 52, views: 421, conversion: 10.2, status: 'Active' },
  { job: 'UI/UX Designer', applications: 31, views: 267, conversion: 18.3, status: 'Closed' },
  { job: 'DevOps Engineer', applications: 28, views: 189, conversion: 14.2, status: 'Active' },
];

const timeToHire = [
  { month: 'Tháng 1', days: 28, applications: 45 },
  { month: 'Tháng 2', days: 32, applications: 52 },
  { month: 'Tháng 3', days: 25, applications: 48 },
  { month: 'Tháng 4', days: 22, applications: 61 },
  { month: 'Tháng 5', days: 19, applications: 55 },
  { month: 'Tháng 6', days: 21, applications: 67 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-white" />
            <div>
              <h1 className="text-2xl font-bold text-white mb-1">Báo cáo & Thống kê</h1>
              <p className="text-purple-100">Phân tích hiệu quả tuyển dụng và xu hướng</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <select className="rounded-lg bg-white/20 backdrop-blur-sm border-0 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white/30">
              <option>30 ngày qua</option>
              <option>60 ngày qua</option>
              <option>90 ngày qua</option>
              <option>1 năm qua</option>
            </select>
            
            <button className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:shadow-lg">
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
          value={328}
          change={{ value: '+18.2%', isPositive: true }}
          icon={Users}
          description="So với tháng trước"
          gradient="from-blue-500 to-indigo-600"
        />
        <MetricsCard
          title="Công việc đang tuyển"
          value={8}
          change={{ value: '+2', isPositive: true }}
          icon={Briefcase}
          description="3 sắp hết hạn"
          gradient="from-purple-500 to-purple-600"
        />
        <MetricsCard
          title="Tỷ lệ chuyển đổi"
          value="8.5%"
          change={{ value: '+2.3%', isPositive: true }}
          icon={Target}
          description="Từ ứng tuyển đến chấp nhận"
          gradient="from-green-500 to-emerald-600"
        />
        <MetricsCard
          title="Thời gian tuyển dụng"
          value="21 ngày"
          change={{ value: '-3 ngày', isPositive: true }}
          icon={Clock}
          description="Trung bình tháng này"
          gradient="from-orange-500 to-red-500"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Phễu chuyển đổi</h2>
              <p className="text-sm text-gray-500 mt-1">Từ ứng tuyển đến chấp nhận</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-purple-600">8.5%</p>
              <p className="text-xs text-gray-500">Tỷ lệ chuyển đổi</p>
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
                <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={`h-full ${stage.color} transition-all duration-500 rounded-full`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
                {index < conversionData.length - 1 && (
                  <div className="absolute -bottom-2 left-0 right-0 flex justify-center">
                    <div className="h-4 w-px bg-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Time to Hire Trend */}
        <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Thời gian tuyển dụng</h2>
            <p className="text-sm text-gray-500 mt-1">Số ngày trung bình theo tháng</p>
          </div>

          <div className="space-y-3">
            {timeToHire.map((item, index) => {
              const maxDays = Math.max(...timeToHire.map(t => t.days));
              const barWidth = (item.days / maxDays) * 100;
              
              return (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-600">{item.month}</div>
                  <div className="flex-1">
                    <div className="relative h-8 w-full rounded-lg bg-gray-100 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-500 flex items-center justify-center"
                        style={{ width: `${barWidth}%` }}
                      >
                        <span className="text-xs font-semibold text-white">{item.days} ngày</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm text-gray-500">{item.applications} UV</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">21</p>
              <p className="text-xs text-gray-500 mt-1">Trung bình</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">19</p>
              <p className="text-xs text-gray-500 mt-1">Tốt nhất</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">32</p>
              <p className="text-xs text-gray-500 mt-1">Chậm nhất</p>
            </div>
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="rounded-xl border border-purple-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Hiệu suất công việc</h2>
            <p className="text-sm text-gray-500 mt-1">So sánh hiệu quả các tin tuyển dụng</p>
          </div>
          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
            Xem chi tiết
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-sm font-semibold text-gray-700">
                <th className="pb-3">Vị trí</th>
                <th className="pb-3 text-center">Ứng tuyển</th>
                <th className="pb-3 text-center">Lượt xem</th>
                <th className="pb-3 text-center">Tỷ lệ chuyển đổi</th>
                <th className="pb-3 text-center">Trạng thái</th>
                <th className="pb-3 text-center">Hiệu suất</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {jobPerformance.map((job, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-purple-50/50 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">{job.job}</span>
                    </div>
                  </td>
                  <td className="py-4 text-center font-semibold text-gray-900">{job.applications}</td>
                  <td className="py-4 text-center text-gray-600">{job.views}</td>
                  <td className="py-4 text-center">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                      {job.conversion}%
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      job.status === 'Active' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Award
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(job.conversion / 4)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50 p-6">
          <Eye className="h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-blue-900 mb-1">Top Performer</h3>
          <p className="text-2xl font-bold text-blue-700">UI/UX Designer</p>
          <p className="text-sm text-blue-600 mt-2">18.3% tỷ lệ chuyển đổi cao nhất</p>
        </div>

        <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50 p-6">
          <Users className="h-8 w-8 text-purple-600 mb-3" />
          <h3 className="font-semibold text-purple-900 mb-1">Most Popular</h3>
          <p className="text-2xl font-bold text-purple-700">Backend Developer</p>
          <p className="text-sm text-purple-600 mt-2">52 ứng tuyển trong tháng</p>
        </div>

        <div className="rounded-xl border border-green-200 bg-gradient-to-br from-green-50 to-green-100/50 p-6">
          <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
          <h3 className="font-semibold text-green-900 mb-1">Trending Up</h3>
          <p className="text-2xl font-bold text-green-700">+18.2%</p>
          <p className="text-sm text-green-600 mt-2">Tăng trưởng ứng tuyển tháng này</p>
        </div>
      </div>
    </div>
  );
}
