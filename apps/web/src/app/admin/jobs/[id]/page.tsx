'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  ExclamationTriangleIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import { useJobDetail, useJobAnalytics, useJobMutations } from '@/hooks/useJobManagement';
import { useConfirm } from '@/hooks/useConfirm';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ApplicationsTab from '@/components/admin/ApplicationsTab';

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

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const styles = {
    ACTIVE: 'bg-green-100 text-green-800 border-green-200',
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    CLOSED: 'bg-red-100 text-red-800 border-red-200',
    EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const labels = {
    ACTIVE: 'Đang tuyển',
    PENDING: 'Chờ duyệt',
    CLOSED: 'Đã đóng',
    EXPIRED: 'Hết hạn',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${styles[status as keyof typeof styles] || styles.PENDING}`}
    >
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
    red: 'text-red-600 bg-red-100',
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p
              className={`mt-1 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-600'}`}
            >
              {change} so với tuần trước
            </p>
          )}
        </div>
        <div className={`rounded-lg p-3 ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
};

const JobDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const jobId = params?.id as string;
  const [activeTab, setActiveTab] = useState('overview');

  // Settings form state
  const [settingsForm, setSettingsForm] = useState({
    status: '',
    featured: false,
    urgent: false,
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { job, loading, error, refetch } = useJobDetail(jobId);
  const { statistics, loading: statsLoading } = useJobAnalytics(jobId);
  const jobMutations = useJobMutations();
  const { confirmWarning, confirmUnsavedChanges } = useConfirm();

  // Initialize settings form when job data is loaded
  useEffect(() => {
    if (job) {
      setSettingsForm({
        status: job.status || '',
        featured: job.featured || false,
        urgent: job.urgent || false,
      });
    }
  }, [job]);

  // Handle settings form changes
  const handleSettingsChange = (field: string, value: any) => {
    setSettingsForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);
  };

  // Handle settings form save
  const handleSettingsSave = async () => {
    try {
      await jobMutations.updateJob(jobId, {
        status: settingsForm.status as any,
        featured: settingsForm.featured,
        urgent: settingsForm.urgent,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Failed to update job settings:', error);
    }
  };

  // Handle settings form cancel
  const handleSettingsCancel = async () => {
    if (hasUnsavedChanges) {
      await confirmUnsavedChanges(() => {
        // Reset form to original values
        if (job) {
          setSettingsForm({
            status: job.status || '',
            featured: job.featured || false,
            urgent: job.urgent || false,
          });
        }
        setHasUnsavedChanges(false);
      });
    }
  };

  // Handle tab change with unsaved changes check
  const handleTabChange = async (tabId: string) => {
    if (activeTab === 'settings' && hasUnsavedChanges) {
      await confirmUnsavedChanges(() => {
        setActiveTab(tabId);
        setHasUnsavedChanges(false);
      });
    } else {
      setActiveTab(tabId);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="py-12 text-center">
        <ExclamationTriangleIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <p className="mb-4 text-gray-500">{error || 'Không tìm thấy việc làm'}</p>
        <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Tổng quan' },
    { id: 'statistics', name: 'Thống kê' },
    { id: 'applications', name: 'Ứng viên' },
    { id: 'settings', name: 'Cài đặt' },
  ];

  const formatSalary = (min?: any, max?: any, currency?: string | null) => {
    const currencyCode = currency || 'VND';
    const minValue = min
      ? typeof min === 'object' && min.toNumber
        ? min.toNumber()
        : Number(min)
      : null;
    const maxValue = max
      ? typeof max === 'object' && max.toNumber
        ? max.toNumber()
        : Number(max)
      : null;

    if (!minValue && !maxValue) return 'Thỏa thuận';
    if (minValue && maxValue) {
      return `${minValue.toLocaleString()} - ${maxValue.toLocaleString()} ${currencyCode}`;
    }
    if (minValue) return `Từ ${minValue.toLocaleString()} ${currencyCode}`;
    if (maxValue) return `Lên đến ${maxValue.toLocaleString()} ${currencyCode}`;
    return 'Thỏa thuận';
  };

  const getJobTypeLabel = (type: string) => {
    const labels = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      INTERNSHIP: 'Thực tập',
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getExperienceLabel = (level: string) => {
    const labels = {
      ENTRY: 'Mới ra trường',
      MID: 'Trung cấp',
      SENIOR: 'Cao cấp',
      LEAD: 'Trưởng nhóm',
      EXECUTIVE: 'Điều hành',
    };
    return labels[level as keyof typeof labels] || level;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-4 flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
              <StatusBadge status={job.status} />
            </div>

            <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 md:grid-cols-2 lg:grid-cols-4">
              <div className="flex items-center">
                <BuildingOfficeIcon className="mr-2 h-4 w-4" />
                {job.company.companyName}
              </div>
              <div className="flex items-center">
                <MapPinIcon className="mr-2 h-4 w-4" />
                {/* {job.locationCity && `${job.locationCity}, `} */}
                {`${job.address}, ${job.locationProvince}`}
              </div>
              <div className="flex items-center">
                <ClockIcon className="mr-2 h-4 w-4" />
                {getJobTypeLabel(job.jobType)}
              </div>
              <div className="flex items-center">
                <AcademicCapIcon className="mr-2 h-4 w-4" />
                {getExperienceLabel(job.experienceLevel)}
              </div>
            </div>

            <div className="mt-4 flex items-center text-sm text-gray-500">
              <CalendarDaysIcon className="mr-2 h-4 w-4" />
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
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <ShareIcon className="mr-2 h-4 w-4" />
              Chia sẻ
            </button>
            <button className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
              Nhân bản
            </button>
            <button
              onClick={() => router.push(`/admin/jobs/${jobId}/edit`)}
              className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <PencilIcon className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Lượt xem"
          value={job.statistics?.totalViews || job.viewCount || 0}
          icon={EyeIcon}
          color="blue"
          change={job.statistics?.viewsChange || '+0%'}
          changeType={job.statistics?.viewsChangeType || 'increase'}
        />
        <StatCard
          title="Số ứng viên"
          value={job.statistics?.totalApplications || job.applicationCount || 0}
          icon={UserGroupIcon}
          color="green"
          change={job.statistics?.applicationsChange || '+0%'}
          changeType={job.statistics?.applicationsChangeType || 'increase'}
        />
        <StatCard
          title="Lượt lưu"
          value={job.statistics?.totalSaved || job._count?.savedJobs || 0}
          icon={TagIcon}
          color="purple"
          change={job.statistics?.savedChange || '+0%'}
          changeType={job.statistics?.savedChangeType || 'increase'}
        />
        <StatCard
          title="Tỷ lệ chuyển đổi"
          value={job.statistics?.conversionRate ? `${job.statistics.conversionRate}%` : '0%'}
          icon={ChartBarIcon}
          color="orange"
          change={job.statistics?.conversionChange || '+0%'}
          changeType={job.statistics?.conversionChangeType || 'decrease'}
        />
      </div>

      {/* Tabs */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`border-b-2 px-1 py-4 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab.name}
                {tab.id === 'settings' && hasUnsavedChanges && (
                  <span className="ml-1 h-2 w-2 rounded-full bg-orange-400" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Basic Info */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Mức lương</span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Loại hình làm việc</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.workLocationType === 'ONSITE'
                          ? 'Tại văn phòng'
                          : job.workLocationType === 'REMOTE'
                            ? 'Từ xa'
                            : 'Linh Hoạt (Hybrid)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Trạng thái</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="flex items-center justify-between border-b border-gray-100 py-2">
                      <span className="text-sm text-gray-600">Người đăng</span>
                      <span className="text-sm font-medium text-gray-900">
                        {job.company.companyName}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Kỹ năng yêu cầu</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.jobSkills?.map((jobSkill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800"
                      >
                        {jobSkill.skill.name}
                        {jobSkill.requiredLevel === 'REQUIRED' && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </span>
                    )) || <span className="text-gray-500">Chưa có kỹ năng yêu cầu</span>}
                  </div>

                  <h3 className="mt-6 mb-4 text-lg font-medium text-gray-900">Danh mục</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.jobCategories?.map((jobCategory, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
                      >
                        {jobCategory.category.name}
                      </span>
                    )) || <span className="text-gray-500">Chưa có danh mục</span>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Mô tả công việc</h3>
                <div className="prose max-w-none">
                  <div
                    className="whitespace-pre-wrap text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h3 className="mb-4 text-lg font-medium text-gray-900">Yêu cầu ứng viên</h3>
                <div className="prose max-w-none">
                  <div
                    className="whitespace-pre-wrap text-gray-700"
                    dangerouslySetInnerHTML={{ __html: job.requirements }}
                  />
                </div>
              </div>

              {/* Benefits */}
              {job.benefits && (
                <div>
                  <h3 className="mb-4 text-lg font-medium text-gray-900">Quyền lợi</h3>
                  <div className="prose max-w-none">
                    <div
                      className="whitespace-pre-wrap text-gray-700"
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
                <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    <div className="rounded-lg bg-blue-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-blue-600">Tổng lượt xem</p>
                          <p className="text-2xl font-semibold text-blue-900">
                            {job.statistics?.totalViews || 0}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            job.statistics?.viewsChangeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {job.statistics?.viewsChange || '+0%'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-green-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-green-600">Tổng ứng viên</p>
                          <p className="text-2xl font-semibold text-green-900">
                            {job.statistics?.totalApplications || 0}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            job.statistics?.applicationsChangeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {job.statistics?.applicationsChange || '+0%'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-purple-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-purple-600">Lượt lưu</p>
                          <p className="text-2xl font-semibold text-purple-900">
                            {job.statistics?.totalSaved || 0}
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            job.statistics?.savedChangeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {job.statistics?.savedChange || '+0%'}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-orange-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-orange-600">Tỷ lệ chuyển đổi</p>
                          <p className="text-2xl font-semibold text-orange-900">
                            {job.statistics?.conversionRate || 0}%
                          </p>
                        </div>
                        <div
                          className={`text-sm font-medium ${
                            job.statistics?.conversionChangeType === 'increase'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {job.statistics?.conversionChange || '+0%'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Comparison */}
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    {/* Current vs Previous Week */}
                    <div className="rounded-lg bg-gray-50 p-6">
                      <h4 className="text-md mb-4 font-medium text-gray-900">
                        So sánh tuần này vs tuần trước
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lượt xem</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {job.statistics?.previousWeek.views || 0} →{' '}
                              {job.statistics?.currentWeek.views || 0}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                job.statistics?.viewsChangeType === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {job.statistics?.viewsChange || '+0%'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Ứng tuyển</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {job.statistics?.previousWeek.applications || 0} →{' '}
                              {job.statistics?.currentWeek.applications || 0}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                job.statistics?.applicationsChangeType === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {job.statistics?.applicationsChange || '+0%'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Lưu tin</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {job.statistics?.previousWeek.saved || 0} →{' '}
                              {job.statistics?.currentWeek.saved || 0}
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                job.statistics?.savedChangeType === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {job.statistics?.savedChange || '+0%'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tỷ lệ chuyển đổi</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-500">
                              {job.statistics?.previousWeek.conversionRate || 0}% →{' '}
                              {job.statistics?.currentWeek.conversionRate || 0}%
                            </span>
                            <span
                              className={`text-sm font-medium ${
                                job.statistics?.conversionChangeType === 'increase'
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {job.statistics?.conversionChange || '+0%'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Analysis */}
                    <div className="rounded-lg bg-gray-50 p-6">
                      <h4 className="text-md mb-4 font-medium text-gray-900">
                        Phân tích hiệu suất
                      </h4>
                      <div className="space-y-4">
                        <div className="rounded-lg bg-white p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Hiệu suất tuần này
                            </span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                (job.statistics?.currentWeek.views || 0) >
                                (job.statistics?.previousWeek.views || 0)
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {(job.statistics?.currentWeek.views || 0) >
                              (job.statistics?.previousWeek.views || 0)
                                ? 'Tăng'
                                : 'Giảm'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {job.statistics?.currentWeek.views || 0} lượt xem,{' '}
                            {job.statistics?.currentWeek.applications || 0} ứng tuyển
                          </div>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <div className="mb-1 flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Xu hướng</span>
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                parseFloat(String(job.statistics?.conversionRate || '0')) >= 5
                                  ? 'bg-green-100 text-green-800'
                                  : parseFloat(String(job.statistics?.conversionRate || '0')) >= 2
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {parseFloat(String(job.statistics?.conversionRate || '0')) >= 5
                                ? 'Tốt'
                                : parseFloat(String(job.statistics?.conversionRate || '0')) >= 2
                                  ? 'Trung bình'
                                  : 'Cần cải thiện'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Tỷ lệ chuyển đổi: {job.statistics?.conversionRate || 0}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Placeholder for charts */}
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <ChartBarIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                <p className="text-gray-500">Biểu đồ thống kê sẽ được hiển thị tại đây</p>
                <p className="mt-1 text-sm text-gray-400">
                  Tích hợp với thư viện biểu đồ như Chart.js hoặc Recharts
                </p>
              </div>
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === 'applications' && (
            <ApplicationsTab jobId={jobId} onApplicationUpdate={refetch} />
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Cài đặt việc làm</h3>
                {hasUnsavedChanges && (
                  <Alert className="w-auto border-orange-200 bg-orange-50">
                    <AlertDescription className="text-sm text-orange-800">
                      Có thay đổi chưa lưu
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {jobMutations.error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{jobMutations.error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Trạng thái *
                  </label>
                  <Select
                    value={settingsForm.status}
                    onValueChange={(value) => handleSettingsChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                      <SelectItem value="ACTIVE">Đang tuyển</SelectItem>
                      <SelectItem value="CLOSED">Đã đóng</SelectItem>
                      <SelectItem value="EXPIRED">Hết hạn</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Việc làm nổi bật
                  </label>
                  <Select
                    value={settingsForm.featured.toString()}
                    onValueChange={(value) => handleSettingsChange('featured', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Không</SelectItem>
                      <SelectItem value="true">Có</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Tuyển gấp</label>
                  <Select
                    value={settingsForm.urgent.toString()}
                    onValueChange={(value) => handleSettingsChange('urgent', value === 'true')}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Không</SelectItem>
                      <SelectItem value="true">Có</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Settings summary */}
              {hasUnsavedChanges && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <h4 className="mb-2 text-sm font-medium text-blue-900">
                    Thay đổi sẽ được áp dụng:
                  </h4>
                  <ul className="space-y-1 text-sm text-blue-800">
                    {settingsForm.status !== job?.status && (
                      <li>
                        • Trạng thái: {job?.status} → {settingsForm.status}
                      </li>
                    )}
                    {settingsForm.featured !== job?.featured && (
                      <li>
                        • Nổi bật: {job?.featured ? 'Có' : 'Không'} →{' '}
                        {settingsForm.featured ? 'Có' : 'Không'}
                      </li>
                    )}
                    {settingsForm.urgent !== job?.urgent && (
                      <li>
                        • Tuyển gấp: {job?.urgent ? 'Có' : 'Không'} →{' '}
                        {settingsForm.urgent ? 'Có' : 'Không'}
                      </li>
                    )}
                  </ul>
                </div>
              )}

              <div className="flex justify-start space-x-3 border-t pt-4">
                <Button
                  onClick={handleSettingsSave}
                  disabled={jobMutations.loading || !hasUnsavedChanges}
                  className="min-w-[120px]"
                >
                  {jobMutations.loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <CheckIcon className="mr-2 h-4 w-4" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSettingsCancel}
                  disabled={jobMutations.loading}
                >
                  Hủy
                </Button>

                {!hasUnsavedChanges && (
                  <div className="flex items-center text-sm text-green-600">
                    <CheckIcon className="mr-1 h-4 w-4" />
                    Đã lưu
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
