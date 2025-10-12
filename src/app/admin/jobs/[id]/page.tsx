'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  EyeIcon, 
  UserGroupIcon, 
  CalendarDaysIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  TagIcon,
  AcademicCapIcon,
  ChartBarIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  ShareIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useJobDetail, useJobAnalytics } from '@/hooks/useJobManagement';

const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${styles[status as keyof typeof styles] || styles.DRAFT}`}>
      {labels[status as keyof typeof labels] || status}
    </span>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: string | number; 
  icon: React.ComponentType<any>; 
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}> = ({ title, value, icon: Icon, color, change, changeType }) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    purple: 'text-purple-600 bg-purple-100',
    orange: 'text-orange-600 bg-orange-100',
    red: 'text-red-600 bg-red-100'
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}>
              {change} so với tuần trước
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const JobDetailPage: React.FC = () => {
  const params = useParams();
  const jobId = params.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  const { job, loading, error } = useJobDetail(jobId);
  const { statistics, loading: statsLoading } = useJobAnalytics(jobId);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="text-center py-12">
        <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{error || 'Không tìm thấy việc làm'}</p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan' },
    { id: 'statistics', name: 'Thống kê' },
    { id: 'applications', name: 'Ứng viên' },
    { id: 'settings', name: 'Cài đặt' }
  ];

  const formatSalary = (min?: number | null, max?: number | null, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';
    if (min && max) {
      return `${min.toLocaleString()} - ${max.toLocaleString()} ${currency}`;
    }
    if (min) return `Từ ${min.toLocaleString()} ${currency}`;
    if (max) return `Lên đến ${max.toLocaleString()} ${currency}`;
    return 'Thỏa thuận';
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian', 
      CONTRACT: 'Hợp đồng',
      INTERNSHIP: 'Thực tập'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels = {
      ENTRY: 'Mới ra trường',
      MID: 'Trung cấp',
      SENIOR: 'Cao cấp',
      LEAD: 'Trưởng nhóm',
      EXECUTIVE: 'Điều hành'
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <StatusBadge status={job.status} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                {job.company.companyName}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {job.locationCity && `${job.locationCity}, `}{job.locationProvince}
              </div>
              <div className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-2" />
                {getJobTypeLabel(job.jobType)}
              </div>
              <div className="flex items-center">
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                {getExperienceLabel(job.experienceLevel)}
              </div>
            </div>

            <div className="flex items-center mt-4 text-sm text-gray-500">
              <CalendarDaysIcon className="h-4 w-4 mr-2" />
              Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}
              {job.applicationDeadline && (
                <>
                  <span className="mx-2">•</span>
                  Hạn nộp: {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <ShareIcon className="h-4 w-4 mr-2" />
              Chia sẻ
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Nhân bản
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              <PencilIcon className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Lượt xem"
          value={job.viewCount || 0}
          icon={EyeIcon}
          color="blue"
          change="+12%"
          changeType="increase"
        />
        <StatCard
          title="Số ứng viên"
          value={job.applicationCount || 0}
          icon={UserGroupIcon}
          color="green"
          change="+5%"
          changeType="increase"
        />
        <StatCard
          title="Lượt lưu"
          value={job._count?.savedJobs || 0}
          icon={TagIcon}
          color="purple"
          change="+8%"
          changeType="increase"
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={job.viewCount ? `${((job.applicationCount / job.viewCount) * 100).toFixed(1)}%` : '0%'}
          icon={ChartBarIcon}
          color="orange"
          change="-2%"
          changeType="decrease"
        />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Mức lương</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Loại hình làm việc</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.workLocationType === 'ONSITE' ? 'Tại văn phòng' : 
                         job.workLocationType === 'REMOTE' ? 'Từ xa' : 'Lai ghép'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Trạng thái</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Người đăng</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.company.companyName}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.jobSkills?.map((jobSkill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {jobSkill.skill.name}
                        {jobSkill.requiredLevel === 'REQUIRED' && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </span>
                    )) || <span className="text-gray-500">Chưa có kỹ năng yêu cầu</span>}
                  </div>

                  <h3 className="text-lg font-medium text-gray-900 mb-4 mt-6">Danh mục</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.jobCategories?.map((jobCategory, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {jobCategory.category.name}
                      </span>
                    )) || <span className="text-gray-500">Chưa có danh mục</span>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mô tả công việc</h3>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Yêu cầu ứng viên</h3>
                <div className="prose max-w-none">
                  <div 
                    className="text-gray-700 whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quyền lợi</h3>
                  <div className="prose max-w-none">
                    <div 
                      className="text-gray-700 whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: job.benefits }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Thống kê chi tiết</h3>
              
              {statsLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* View Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Thống kê lượt xem</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tổng lượt xem</span>
                        <span className="text-sm font-medium">{statistics?.totalViews || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Lượt xem duy nhất</span>
                        <span className="text-sm font-medium">{statistics?.uniqueViews || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">7 ngày qua</span>
                        <span className="text-sm font-medium">{statistics?.viewsLastWeek || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">30 ngày qua</span>
                        <span className="text-sm font-medium">{statistics?.viewsLastMonth || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Application Statistics */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-md font-medium text-gray-900 mb-4">Thống kê ứng tuyển</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tổng ứng viên</span>
                        <span className="text-sm font-medium">{statistics?.totalApplications || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">7 ngày qua</span>
                        <span className="text-sm font-medium">{statistics?.applicationsLastWeek || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">30 ngày qua</span>
                        <span className="text-sm font-medium">{statistics?.applicationsLastMonth || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                        <span className="text-sm font-medium">{statistics?.conversionRate || 0}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for charts */}
              <div className="bg-gray-50 rounded-lg p-8 text-center">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Biểu đồ thống kê sẽ được hiển thị tại đây</p>
                <p className="text-sm text-gray-400 mt-1">
                  Tích hợp với thư viện biểu đồ như Chart.js hoặc Recharts
                </p>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <div className="text-center py-8">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Danh sách ứng viên sẽ được hiển thị tại đây</p>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Cài đặt việc làm</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trạng thái
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="DRAFT">Nháp</option>
                    <option value="ACTIVE">Đang tuyển</option>
                    <option value="CLOSED">Đã đóng</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nổi bật
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option value="false">Không</option>
                    <option value="true">Có</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-start space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Lưu thay đổi
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                  Hủy
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;