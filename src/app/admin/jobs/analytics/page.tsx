'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UsersIcon,
  EyeIcon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { useAdminDashboard } from '@/hooks/useJobManagement';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div
      className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`}
    />
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  change?: string;
  changeType?: 'increase' | 'decrease';
  color: string;
  description?: string;
}> = ({ title, value, icon: Icon, change, changeType, color, description }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <div className="mt-2 flex items-center">
              {changeType === 'increase' ? (
                <ArrowUpIcon className="mr-1 h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownIcon className="mr-1 h-4 w-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${
                  changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {change}
              </span>
              <span className="ml-1 text-sm text-gray-500">so với tháng trước</span>
            </div>
          )}
          {description && <p className="mt-2 text-xs text-gray-500">{description}</p>}
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const ChartPlaceholder: React.FC<{ title: string; description: string; height?: string }> = ({
  title,
  description,
  height = 'h-64',
}) => (
  <div
    className={`rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 ${height} flex flex-col items-center justify-center p-6`}
  >
    <ChartBarIcon className="mb-4 h-12 w-12 text-gray-400" />
    <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
    <p className="max-w-sm text-center text-sm text-gray-500">{description}</p>
    <p className="mt-2 text-xs text-gray-400">Tích hợp với Chart.js, Recharts hoặc D3.js</p>
  </div>
);

const MetricCard: React.FC<{
  label: string;
  value: string | number;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}> = ({ label, value, subValue, trend }) => (
  <div className="text-center">
    <div className="mb-2 flex items-center justify-center">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      {trend && (
        <div
          className={`ml-2 flex items-center text-sm ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}
        >
          {trend === 'up' && <TrendingUpIcon className="h-4 w-4" />}
          {trend === 'down' && <TrendingDownIcon className="h-4 w-4" />}
        </div>
      )}
    </div>
    <p className="mb-1 text-sm text-gray-600">{label}</p>
    {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
  </div>
);

const AnalyticsPage: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState('applications');

  // Mock data - should be replaced with real API calls
  const mockData = {
    totalJobs: 248,
    activeJobs: 156,
    totalApplications: 2847,
    totalViews: 12456,
    conversionRate: 22.8,
    averageViewsPerJob: 50.2,

    // Trending data
    trendsData: {
      jobsCreated: { current: 23, previous: 18, change: '+27.8%' },
      applications: { current: 347, previous: 298, change: '+16.4%' },
      views: { current: 1580, previous: 1420, change: '+11.3%' },
      companies: { current: 45, previous: 41, change: '+9.8%' },
    },

    // Top performing jobs
    topJobs: [
      {
        id: '1',
        title: 'Senior React Developer',
        company: 'TechCorp',
        applications: 45,
        views: 234,
        conversionRate: 19.2,
      },
      {
        id: '2',
        title: 'Product Manager',
        company: 'StartupXYZ',
        applications: 38,
        views: 189,
        conversionRate: 20.1,
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        company: 'DesignStudio',
        applications: 32,
        views: 156,
        conversionRate: 20.5,
      },
      {
        id: '4',
        title: 'DevOps Engineer',
        company: 'CloudTech',
        applications: 28,
        views: 145,
        conversionRate: 19.3,
      },
      {
        id: '5',
        title: 'Data Scientist',
        company: 'AILabs',
        applications: 25,
        views: 132,
        conversionRate: 18.9,
      },
    ],

    // Category breakdown
    categories: [
      { name: 'Công nghệ thông tin', count: 89, percentage: 35.9 },
      { name: 'Marketing & Sales', count: 45, percentage: 18.1 },
      { name: 'Thiết kế & Sáng tạo', count: 32, percentage: 12.9 },
      { name: 'Tài chính & Kế toán', count: 28, percentage: 11.3 },
      { name: 'Khác', count: 54, percentage: 21.8 },
    ],

    // Location stats
    locations: [
      { city: 'Hà Nội', count: 78, percentage: 31.5 },
      { city: 'TP.HCM', count: 92, percentage: 37.1 },
      { city: 'Đà Nẵng', count: 35, percentage: 14.1 },
      { city: 'Cần Thơ', count: 18, percentage: 7.3 },
      { city: 'Khác', count: 25, percentage: 10.1 },
    ],
  };

  const timeRangeLabels = {
    '7d': '7 ngày',
    '30d': '30 ngày',
    '90d': '3 tháng',
    '1y': '1 năm',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Phân tích & Thống kê</h1>
          <p className="mt-1 text-gray-600">Theo dõi hiệu suất và xu hướng của các việc làm</p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Khoảng thời gian:</span>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(timeRangeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tổng số việc làm"
          value={mockData.totalJobs.toLocaleString()}
          icon={BriefcaseIcon}
          change={mockData.trendsData.jobsCreated.change}
          changeType="increase"
          color="blue"
          description="Việc làm đã tạo trong hệ thống"
        />
        <StatCard
          title="Tổng lượt ứng tuyển"
          value={mockData.totalApplications.toLocaleString()}
          icon={UsersIcon}
          change={mockData.trendsData.applications.change}
          changeType="increase"
          color="green"
          description="Ứng viên đã nộp hồ sơ"
        />
        <StatCard
          title="Tổng lượt xem"
          value={mockData.totalViews.toLocaleString()}
          icon={EyeIcon}
          change={mockData.trendsData.views.change}
          changeType="increase"
          color="purple"
          description="Lượt xem tất cả việc làm"
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={`${mockData.conversionRate}%`}
          icon={TrendingUpIcon}
          change="+2.3%"
          changeType="increase"
          color="orange"
          description="Tỷ lệ xem/ứng tuyển trung bình"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Application Trends Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Xu hướng ứng tuyển</h2>
            <select className="rounded border border-gray-300 px-2 py-1 text-sm">
              <option>Ứng tuyển</option>
              <option>Lượt xem</option>
              <option>Việc làm mới</option>
            </select>
          </div>
          <ChartPlaceholder
            title="Biểu đồ xu hướng"
            description="Theo dõi số lượng ứng tuyển theo thời gian với các mốc quan trọng"
          />
        </div>

        {/* Job Performance Chart */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-lg font-medium text-gray-900">Hiệu suất theo danh mục</h2>
          <ChartPlaceholder
            title="Biểu đồ tròn/cột"
            description="Phân tích hiệu suất công việc theo từng danh mục nghề nghiệp"
          />
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Performing Jobs */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="mb-6 text-lg font-medium text-gray-900">Việc làm có hiệu suất cao</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-sm font-medium text-gray-500">Việc làm</th>
                  <th className="py-3 text-left text-sm font-medium text-gray-500">Ứng viên</th>
                  <th className="py-3 text-left text-sm font-medium text-gray-500">Lượt xem</th>
                  <th className="py-3 text-left text-sm font-medium text-gray-500">Tỷ lệ CV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mockData.topJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.company}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium text-gray-900">{job.applications}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm text-gray-900">{job.views}</span>
                    </td>
                    <td className="py-3">
                      <span className="text-sm font-medium text-green-600">
                        {job.conversionRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Category Breakdown */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Theo danh mục</h3>
            <div className="space-y-3">
              {mockData.categories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-1 items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                    <span className="text-sm text-gray-700">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{category.count}</span>
                    <span className="text-xs text-gray-500">({category.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Location Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-medium text-gray-900">Theo địa điểm</h3>
            <div className="space-y-3">
              {mockData.locations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex flex-1 items-center">
                    <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                    <span className="text-sm text-gray-700">{location.city}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{location.count}</span>
                    <span className="text-xs text-gray-500">({location.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Chỉ số hiệu suất chi tiết</h2>
          <div className="flex items-center text-sm text-gray-500">
            <InformationCircleIcon className="mr-1 h-4 w-4" />
            Dữ liệu cập nhật realtime
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          <MetricCard
            label="Trung bình lượt xem/việc"
            value={mockData.averageViewsPerJob.toFixed(1)}
            trend="up"
          />
          <MetricCard
            label="Thời gian phản hồi TB"
            value="2.3 ngày"
            subValue="Giảm 0.5 ngày"
            trend="up"
          />
          <MetricCard
            label="Tỷ lệ việc làm nổi bật"
            value="12.5%"
            subValue="31 trong 248 việc làm"
            trend="neutral"
          />
          <MetricCard label="Công ty hoạt động" value="45" subValue="Tăng 4 công ty" trend="up" />
          <MetricCard label="Đánh giá TB" value="4.2/5" subValue="Từ 2,847 đánh giá" trend="up" />
          <MetricCard label="Việc làm hết hạn" value="5" subValue="Trong 7 ngày tới" trend="down" />
        </div>
      </div>

      {/* Large Chart Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-medium text-gray-900">Phân tích tổng quan</h2>
          <div className="flex space-x-2">
            <button className="rounded bg-blue-100 px-3 py-1 text-sm text-blue-700">Tuần</button>
            <button className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
              Tháng
            </button>
            <button className="rounded px-3 py-1 text-sm text-gray-600 hover:bg-gray-100">
              Quý
            </button>
          </div>
        </div>
        <ChartPlaceholder
          title="Biểu đồ tổng hợp"
          description="Hiển thị tất cả các chỉ số quan trọng trên cùng một biểu đồ để so sánh và phân tích xu hướng"
          height="h-96"
        />
      </div>

      {/* Export and Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Xuất báo cáo</h3>
            <p className="text-sm text-gray-600">
              Tải xuống báo cáo chi tiết dưới các định dạng khác nhau
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Xuất PDF
            </button>
            <button className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              Xuất Excel
            </button>
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Lên lịch báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
