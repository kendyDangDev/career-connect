'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ApplicationDetail } from '@/types/employer/job';
import { ApplicationStatus } from '@/generated/prisma';
import { useApplicationMutations } from '@/hooks/useApplicationManagement';
import { useJobApplications } from '@/hooks/useJobApplications';
import {
  UserIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarDaysIcon,
  EnvelopeIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface ApplicationsTabProps {
  jobId: string;
  onApplicationUpdate?: () => void;
}

const ApplicationsTab: React.FC<ApplicationsTabProps> = ({ jobId, onApplicationUpdate }) => {
  const { updateApplicationStatus, loading: updateLoading } = useApplicationMutations();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState<'appliedAt' | 'name' | 'experience'>('appliedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch applications with the new hook
  const {
    data: applicationsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobApplications({
    jobId,
    page: currentPage,
    limit: itemsPerPage,
    search: searchTerm,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  // Use debounced search to avoid too many API calls
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when search/filter changes
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [searchTerm, statusFilter]);

  // Get data from API response
  const applications = applicationsData?.applications || [];
  const pagination = applicationsData?.pagination;
  const totalPages = pagination?.totalPages || 0;

  // Ensure all status options are always available, even with 0 count
  const allStatusOptions = {
    all: applicationsData?.statusCounts?.all || 0,
    APPLIED: applicationsData?.statusCounts?.APPLIED || 0,
    SCREENING: applicationsData?.statusCounts?.SCREENING || 0,
    INTERVIEWING: applicationsData?.statusCounts?.INTERVIEWING || 0,
    OFFERED: applicationsData?.statusCounts?.OFFERED || 0,
    HIRED: applicationsData?.statusCounts?.HIRED || 0,
    REJECTED: applicationsData?.statusCounts?.REJECTED || 0,
    WITHDRAWN: applicationsData?.statusCounts?.WITHDRAWN || 0,
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    const statusConfig = {
      APPLIED: { label: 'Đã ứng tuyển', color: 'bg-blue-100 text-blue-800' },
      SCREENING: { label: 'Sàng lọc', color: 'bg-yellow-100 text-yellow-800' },
      INTERVIEWING: { label: 'Phỏng vấn', color: 'bg-purple-100 text-purple-800' },
      OFFERED: { label: 'Đã offer', color: 'bg-green-100 text-green-800' },
      HIRED: { label: 'Đã tuyển', color: 'bg-emerald-100 text-emerald-800' },
      REJECTED: { label: 'Từ chối', color: 'bg-red-100 text-red-800' },
      WITHDRAWN: { label: 'Đã rút', color: 'bg-gray-100 text-gray-800' },
    };

    const config = statusConfig[status] || statusConfig.APPLIED;
    return <Badge className={`${config.color} border-0`}>{config.label}</Badge>;
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatExperience = (experienceYears?: number | null) => {
    if (!experienceYears) return 'Chưa có kinh nghiệm';
    return `${experienceYears} năm kinh nghiệm`;
  };

  const formatSalaryExpectation = (min?: number | null, max?: number | null, currency = 'VND') => {
    if (!min && !max) return 'Thỏa thuận';

    const formatNumber = (num: number) => {
      return new Intl.NumberFormat('vi-VN').format(num);
    };

    if (min && max) {
      return `${formatNumber(min)} - ${formatNumber(max)} ${currency}`;
    } else if (min) {
      return `Từ ${formatNumber(min)} ${currency}`;
    } else if (max) {
      return `Tối đa ${formatNumber(max)} ${currency}`;
    }

    return 'Thỏa thuận';
  };

  const getTopSkills = (skills: ApplicationDetail['candidate']['skills'], count = 3) => {
    return skills
      .filter((s) => s.proficiencyLevel === 'EXPERT' || s.proficiencyLevel === 'ADVANCED')
      .slice(0, count)
      .map((s) => s.skill.name);
  };

  const getLatestPosition = (experience: ApplicationDetail['candidate']['experience']) => {
    const current = experience.find((exp) => exp.isCurrent);
    if (current) return current.positionTitle;

    if (experience.length > 0) {
      return experience[0].positionTitle;
    }

    return null;
  };

  const getHighestEducation = (education: ApplicationDetail['candidate']['education']) => {
    if (education.length === 0) return null;

    // Priority order for degree types
    const degreeOrder = ['DOCTORATE', 'MASTER', 'BACHELOR', 'ASSOCIATE', 'DIPLOMA'];

    const sortedEducation = education.sort((a, b) => {
      const aIndex = degreeOrder.indexOf(a.degreeType);
      const bIndex = degreeOrder.indexOf(b.degreeType);

      if (aIndex !== bIndex) {
        return aIndex - bIndex;
      }

      // If same degree type, sort by end date (most recent first)
      return (
        new Date(b.endDate || b.startDate).getTime() - new Date(a.endDate || a.startDate).getTime()
      );
    });

    return sortedEducation[0];
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: ApplicationStatus) => {
    try {
      await updateApplicationStatus({
        applicationId,
        status: newStatus,
        reason: `Status updated from admin panel`,
      });

      // Trigger refresh of applications list
      await refetch();
      if (onApplicationUpdate) {
        onApplicationUpdate();
      }
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-2 text-gray-500">Đang tải danh sách ứng viên...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="py-12 text-center">
        <div className="text-red-500">
          <p className="mb-2 text-lg font-medium">Có lỗi xảy ra</p>
          <p className="text-sm">{error?.message || 'Không thể tải danh sách ứng viên'}</p>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Danh sách ứng viên ({pagination?.totalCount || 0})
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {Object.entries(allStatusOptions).map(([status, count]) => (
            <Badge
              key={status}
              variant={statusFilter === status ? 'default' : count === 0 ? 'outline' : 'secondary'}
              className={`cursor-pointer transition-colors ${
                count === 0 && statusFilter !== status
                  ? 'opacity-60 hover:opacity-100'
                  : 'hover:opacity-80'
              }`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all'
                ? 'Tất cả'
                : status === 'APPLIED'
                  ? 'Mới ứng tuyển'
                  : status === 'SCREENING'
                    ? 'Sàng lọc'
                    : status === 'INTERVIEWING'
                      ? 'Phỏng vấn'
                      : status === 'OFFERED'
                        ? 'Đã offer'
                        : status === 'HIRED'
                          ? 'Đã tuyển'
                          : status === 'REJECTED'
                            ? 'Từ chối'
                            : status === 'WITHDRAWN'
                              ? 'Đã rút'
                              : status}{' '}
              ({count})
            </Badge>
          ))}
          {statusFilter !== 'all' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStatusFilter('all')}
              className="ml-2 text-xs text-gray-500 hover:text-gray-700"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {/* Filters and search */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <FunnelIcon className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value="APPLIED">Đã ứng tuyển</SelectItem>
            <SelectItem value="SCREENING">Sàng lọc</SelectItem>
            <SelectItem value="INTERVIEWING">Phỏng vấn</SelectItem>
            <SelectItem value="OFFERED">Đã offer</SelectItem>
            <SelectItem value="HIRED">Đã tuyển</SelectItem>
            <SelectItem value="REJECTED">Từ chối</SelectItem>
            <SelectItem value="WITHDRAWN">Đã rút</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(value: 'appliedAt' | 'name' | 'experience') => setSortBy(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sắp xếp theo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="appliedAt">Thời gian ứng tuyển</SelectItem>
            <SelectItem value="name">Tên ứng viên</SelectItem>
            <SelectItem value="experience">Kinh nghiệm</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortOrder} onValueChange={(value: 'asc' | 'desc') => setSortOrder(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Thứ tự" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Giảm dần</SelectItem>
            <SelectItem value="asc">Tăng dần</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Empty state or Applications table */}
      {applications.length === 0 ? (
        <div className="py-12 text-center">
          <UserIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">Chưa có ứng viên nào</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all'
              ? 'Không tìm thấy ứng viên phù hợp với bộ lọc.'
              : 'Việc làm này chưa nhận được đơn ứng tuyển nào.'}
          </p>
          {(searchTerm || statusFilter !== 'all') && (
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}
              className="mt-4"
            >
              Xóa bộ lọc
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Ứng viên
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Vị trí & Kinh nghiệm
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Trạng thái
                </th>
                <th className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Thời gian ứng tuyển
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                  CV
                </th>
                <th className="px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {applications.map((application) => {
                const latestPosition = getLatestPosition(application.candidate.experience);
                const highestEducation = getHighestEducation(application.candidate.education);
                const topSkills = getTopSkills(application.candidate.skills);

                return (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4">
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={application.candidate.user.avatarUrl || ''} />
                          <AvatarFallback>
                            {getInitials(
                              application.candidate.user.firstName,
                              application.candidate.user.lastName
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {application.candidate.user.firstName}{' '}
                            {application.candidate.user.lastName}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <EnvelopeIcon className="mr-1 h-3 w-3" />
                            {application.candidate.user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <div className="space-y-1">
                        {latestPosition && (
                          <div className="text-sm font-medium text-gray-900">{latestPosition}</div>
                        )}
                        <div className="text-xs text-gray-500">
                          {formatExperience(application.candidate.experienceYears)}
                        </div>
                        {topSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {topSkills.slice(0, 2).map((skill, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                            {application.candidate.skills.length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{application.candidate.skills.length - 2}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                      {application.rating && (
                        <div className="mt-1 flex items-center">
                          <span className="text-xs text-yellow-500">
                            {'⭐'.repeat(application.rating)}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <CalendarDaysIcon className="mr-1 h-4 w-4" />
                        {formatDate(application.appliedAt)}
                      </div>
                      {application.interviewScheduledAt && (
                        <div className="mt-1 text-xs text-purple-600">
                          🗓️ PV: {formatDate(application.interviewScheduledAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-center whitespace-nowrap">
                      {(() => {
                        // Ưu tiên CV chính, nếu không có thì lấy CV đầu tiên
                        const primaryCV = application.candidate.cvs?.find((cv) => cv.isPrimary);
                        const firstCV = application.candidate.cvs?.[0];
                        const selectedCV = primaryCV || firstCV;
                        const cvUrl = application.cvFileUrl || selectedCV?.fileUrl;
                        const cvName = selectedCV?.cvName || 'CV';
                        const totalCVs = application.candidate.cvs?.length || 0;

                        return cvUrl ? (
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(cvUrl, '_blank')}
                              title={`Xem ${cvName}${totalCVs > 1 ? ` (+${totalCVs - 1} CV khác)` : ''}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Xem CV
                            </Button>
                            {totalCVs > 1 && (
                              <Badge variant="secondary" className="text-xs">
                                {totalCVs}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Chưa có CV</span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            window.open(`/admin/applications/${application.id}`, '_blank');
                          }}
                          title="Xem chi tiết ứng viên"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Select
                          value={application.status}
                          onValueChange={(newStatus: ApplicationStatus) =>
                            handleStatusUpdate(application.id, newStatus)
                          }
                          disabled={updateLoading}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="APPLIED">Đã ứng tuyển</SelectItem>
                            <SelectItem value="SCREENING">Sàng lọc</SelectItem>
                            <SelectItem value="INTERVIEWING">Phỏng vấn</SelectItem>
                            <SelectItem value="OFFERED">Đã offer</SelectItem>
                            <SelectItem value="HIRED">Đã tuyển</SelectItem>
                            <SelectItem value="REJECTED">Từ chối</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Hiển thị {((pagination?.page || 1) - 1) * (pagination?.limit || 10) + 1} đến{' '}
                {Math.min(
                  (pagination?.page || 1) * (pagination?.limit || 10),
                  pagination?.totalCount || 0
                )}{' '}
                trong {pagination?.totalCount || 0} ứng viên
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Trước
                </Button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  Sau
                  <ChevronRightIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;
