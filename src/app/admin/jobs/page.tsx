'use client';

import React from 'react';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  EyeIcon, 
  ClipboardDocumentCheckIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const AdminJobsDashboard: React.FC = () => {
  // Mock data - sẽ được thay thế bằng real API calls
  const stats = [
    {
      name: 'Tổng số việc làm',
      value: '248',
      change: '+12%',
      changeType: 'increase' as const,
      icon: BriefcaseIcon,
      color: 'blue'
    },
    {
      name: 'Việc làm đang tuyển',
      value: '156',
      change: '+18%',
      changeType: 'increase' as const,
      icon: ClipboardDocumentCheckIcon,
      color: 'green'
    },
    {
      name: 'Tổng lượt xem',
      value: '12.4K',
      change: '+8%',
      changeType: 'increase' as const,
      icon: EyeIcon,
      color: 'purple'
    },
    {
      name: 'Tổng ứng viên',
      value: '2.8K',
      change: '-3%',
      changeType: 'decrease' as const,
      icon: UsersIcon,
      color: 'orange'
    }
  ];

  const recentJobs = [
    {
      id: '1',
      title: 'Senior Frontend Developer',
      company: 'Tech Viet Solutions',
      status: 'ACTIVE',
      applications: 24,
      views: 156,
      publishedAt: '2024-01-15',
      applicationDeadline: '2024-02-15'
    },
    {
      id: '2',
      title: 'Marketing Manager',
      company: 'Digital Innovation Co.',
      status: 'DRAFT',
      applications: 0,
      views: 0,
      publishedAt: null,
      applicationDeadline: '2024-02-20'
    },
    {
      id: '3',
      title: 'DevOps Engineer',
      company: 'Cloud Systems Ltd.',
      status: 'ACTIVE',
      applications: 18,
      views: 89,
      publishedAt: '2024-01-12',
      applicationDeadline: '2024-02-10'
    },
    {
      id: '4',
      title: 'UX/UI Designer',
      company: 'Creative Studio',
      status: 'CLOSED',
      applications: 45,
      views: 234,
      publishedAt: '2024-01-05',
      applicationDeadline: '2024-01-25'
    }
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      CLOSED: 'bg-red-100 text-red-800 border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    const labels = {
      ACTIVE: 'Đang tuyển',
      DRAFT: 'Nháp',
      CLOSED: 'Đã đóng',
      EXPIRED: 'Hết hạn'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Tổng quan việc làm</h1>
        <p className="mt-2 text-gray-600">
          Quản lý và theo dõi các việc làm của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = {
            blue: 'text-blue-600 bg-blue-100',
            green: 'text-green-600 bg-green-100',
            purple: 'text-purple-600 bg-purple-100',
            orange: 'text-orange-600 bg-orange-100'
          };

          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-1">
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">so với tháng trước</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Jobs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Việc làm gần đây</h2>
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Xem tất cả
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Việc làm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ứng viên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lượt xem
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hạn nộp
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500">{job.company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(job.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {job.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Thao tác nhanh</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              📝 Tạo việc làm mới
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              📊 Xem báo cáo chi tiết
            </button>
            <button className="w-full text-left px-4 py-2 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors">
              ⚙️ Cài đặt thông báo
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Cần chú ý</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">5 việc làm sắp hết hạn</p>
                <p className="text-xs text-gray-500">Trong 3 ngày tới</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-900">8 việc làm ở trạng thái nháp</p>
                <p className="text-xs text-gray-500">Cần xem xét và xuất bản</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Hiệu suất</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Tỷ lệ xem/ứng tuyển</span>
              <span className="text-sm font-medium text-gray-900">22.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Thời gian phản hồi TB</span>
              <span className="text-sm font-medium text-gray-900">2.3 ngày</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Đánh giá TB</span>
              <span className="text-sm font-medium text-gray-900">4.2/5</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminJobsDashboard;