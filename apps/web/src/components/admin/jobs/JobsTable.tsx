'use client';

import React from 'react';
import Link from 'next/link';
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UsersIcon,
  CalendarIcon,
  MapPinIcon,
  BanknotesIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { JobStatus, JobType, ExperienceLevel } from '@/generated/prisma';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotification } from '@/hooks/useNotification';

interface Job {
  id: string;
  title: string;
  slug: string;
  status: JobStatus;
  jobType: JobType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  locationCity?: string;
  locationProvince?: string;
  applicationDeadline?: string;
  viewCount: number;
  applicationCount: number;
  featured: boolean;
  urgent: boolean;
  createdAt: string;
  publishedAt?: string;
  company: {
    id: string;
    companyName: string;
    logoUrl?: string;
  };
  _count?: {
    applications: number;
    savedJobs: number;
    jobViews: number;
  };
}

interface JobsTableProps {
  jobs: Job[];
  loading?: boolean;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: JobStatus) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  selectedJobs?: string[];
  onSelectJob?: (id: string) => void;
  onSelectAll?: () => void;
}

export function JobsTable({
  jobs,
  loading,
  onDelete,
  onStatusChange,
  onSort,
  sortBy,
  sortOrder,
  selectedJobs = [],
  onSelectJob,
  onSelectAll,
}: JobsTableProps) {
  const { success, error, warning, promise } = useNotification();

  // Enhanced delete handler with notifications
  const handleDelete = async (job: Job) => {
    try {
      // Use promise-based notification for async operation
      if (onDelete) {
        await promise(
          new Promise<void>((resolve, reject) => {
            try {
              onDelete(job.id);
              // Simulate async operation completion
              setTimeout(resolve, 500);
            } catch (err) {
              reject(err);
            }
          }),
          {
            loading: 'Đang xóa việc làm...',
            success: `Đã xóa việc làm "${job.title}" thành công`,
            error: (err) => `Lỗi khi xóa việc làm: ${err.message || 'Có lỗi xảy ra'}`,
          }
        );
      }
    } catch (err) {
      // Error is already handled by the promise notification
      console.error('Delete job error:', err);
    }
  };

  // Enhanced status change handler
  const handleStatusChange = async (job: Job, newStatus: JobStatus) => {
    try {
      if (onStatusChange) {
        await promise(
          new Promise<void>((resolve, reject) => {
            try {
              onStatusChange(job.id, newStatus);
              setTimeout(resolve, 500);
            } catch (err) {
              reject(err);
            }
          }),
          {
            loading: 'Đang cập nhật trạng thái...',
            success: `Đã cập nhật trạng thái việc làm "${job.title}" thành công`,
            error: 'Lỗi khi cập nhật trạng thái việc làm',
          }
        );
      }
    } catch (err) {
      console.error('Status change error:', err);
    }
  };

  // Copy job link handler
  const handleCopyLink = async (job: Job) => {
    try {
      const jobUrl = `${window.location.origin}/jobs/${job.slug}`;
      await navigator.clipboard.writeText(jobUrl);
      success('Đã sao chép', 'Link việc làm đã được sao chép vào clipboard');
    } catch (err) {
      error('Lỗi sao chép', 'Không thể sao chép link việc làm');
    }
  };

  const getStatusBadge = (status: JobStatus, job?: Job) => {
    const styles = {
      [JobStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
      [JobStatus.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [JobStatus.CLOSED]: 'bg-red-100 text-red-800 border-red-200',
      [JobStatus.EXPIRED]: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    const labels = {
      [JobStatus.ACTIVE]: 'Đang tuyển',
      [JobStatus.PENDING]: 'Chờ duyệt',
      [JobStatus.CLOSED]: 'Đã đóng',
      [JobStatus.EXPIRED]: 'Hết hạn',
    };

    if (onStatusChange && job) {
      return (
        <div className="group relative">
          <span
            className={`inline-flex cursor-pointer items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 ${styles[status]}`}
            title="Click để thay đổi trạng thái"
          >
            {labels[status]}
            <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
          <div className="ring-opacity-5 invisible absolute top-full left-0 z-10 mt-1 w-32 rounded-md bg-white py-1 shadow-lg ring-1 ring-black group-hover:visible">
            {Object.values(JobStatus).map((statusOption) => (
              <button
                key={statusOption}
                onClick={() => handleStatusChange(job, statusOption)}
                className={`block w-full px-3 py-1 text-left text-xs hover:bg-gray-100 ${
                  statusOption === status ? 'bg-gray-50 font-medium' : ''
                }`}
              >
                {labels[statusOption]}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <span
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getJobTypeBadge = (type: JobType) => {
    const labels = {
      [JobType.FULL_TIME]: 'Toàn thời gian',
      [JobType.PART_TIME]: 'Bán thời gian',
      [JobType.CONTRACT]: 'Hợp đồng',
      [JobType.INTERNSHIP]: 'Thực tập',
    };
    return labels[type];
  };

  const formatSalary = (min?: number, max?: number, currency?: string) => {
    if (!min && !max) return 'Thương lượng';
    const formatter = new Intl.NumberFormat('vi-VN');
    if (min && max) {
      return `${formatter.format(min)} - ${formatter.format(max)} ${currency || 'VND'}`;
    }
    if (min) {
      return `Từ ${formatter.format(min)} ${currency || 'VND'}`;
    }
    return `Đến ${formatter.format(max!)} ${currency || 'VND'}`;
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) {
      return <div className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white shadow">
        <div className="animate-pulse p-6">
          <div className="mb-4 h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 rounded bg-gray-200"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="rounded-lg bg-white p-12 text-center shadow">
        <p className="text-gray-500">Không có việc làm nào</p>
        <Link
          href="/admin/jobs/create"
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          Tạo việc làm mới
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg bg-white shadow">
      <table className="w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {onSelectAll && (
              <th scope="col" className="w-12 px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === jobs.length && jobs.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            <th
              scope="col"
              className="cursor-pointer px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
              onClick={() => onSort?.('title')}
            >
              <div className="flex items-center gap-1">
                Việc làm
                <SortIcon field="title" />
              </div>
            </th>
            <th
              scope="col"
              className="px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Trạng thái
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase sm:table-cell"
            >
              Loại
            </th>
            <th
              scope="col"
              className="cursor-pointer px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
              onClick={() => onSort?.('applicationCount')}
            >
              <div className="flex items-center justify-center gap-1">
                <UsersIcon className="h-4 w-4" />
                <span className="hidden md:inline">Ứng viên</span>
                <SortIcon field="applicationCount" />
              </div>
            </th>
            <th
              scope="col"
              className="hidden cursor-pointer px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase lg:table-cell"
              onClick={() => onSort?.('viewCount')}
            >
              <div className="flex items-center justify-center gap-1">
                <EyeIcon className="h-4 w-4" />
                <span className="hidden xl:inline">Lượt xem</span>
                <SortIcon field="viewCount" />
              </div>
            </th>
            <th
              scope="col"
              className="hidden px-3 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase xl:table-cell"
            >
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden 2xl:inline">Hạn nộp</span>
              </div>
            </th>
            <th
              scope="col"
              className="w-20 px-3 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase"
            >
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {jobs.map((job) => (
            <tr key={job.id} className="hover:bg-gray-50">
              {onSelectJob && (
                <td className="px-3 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedJobs.includes(job.id)}
                    onChange={() => onSelectJob(job.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
              )}
              <td className="px-4 py-4">
                <div className="flex max-w-80 min-w-0 items-center">
                  {job.company.logoUrl && (
                    <img
                      className="mr-3 h-8 w-8 flex-shrink-0 rounded-full"
                      src={job.company.logoUrl}
                      alt={job.company.companyName}
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="line-clamp-2 overflow-hidden text-sm font-medium text-ellipsis text-gray-900">
                      <Link href={`/admin/jobs/${job.id}`} className="hover:text-blue-600">
                        {job.title}
                      </Link>
                    </div>
                    <div className="w-[200px] truncate text-sm text-gray-500">
                      {job.company.companyName}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {job.featured && (
                        <span className="inline-flex items-center rounded bg-purple-100 px-1.5 py-0.5 text-xs font-medium text-purple-800">
                          Nổi bật
                        </span>
                      )}
                      {job.urgent && (
                        <span className="inline-flex items-center rounded bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
                          Gấp
                        </span>
                      )}
                      <div className="text-xs text-gray-500 sm:hidden">
                        {getJobTypeBadge(job.jobType)}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 lg:hidden">
                      👁 {job.viewCount || 0} | 👤 {job.applicationCount || 0}
                    </div>
                    <div className="mt-1 text-xs text-gray-500 xl:hidden">
                      💰{' '}
                      {formatSalary(job.salaryMin as number, job.salaryMax as number, job.currency)}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">{getStatusBadge(job.status, job)}</td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-900 sm:table-cell">
                {getJobTypeBadge(job.jobType)}
              </td>
              <td className="px-3 py-4 text-center text-sm whitespace-nowrap text-gray-900">
                <div className="flex items-center justify-center">
                  <UsersIcon className="mr-1 h-4 w-4 text-gray-400" />
                  {job.applicationCount || 0}
                </div>
              </td>
              <td className="hidden px-3 py-4 text-center text-sm whitespace-nowrap text-gray-900 lg:table-cell">
                <div className="flex items-center justify-center">
                  <EyeIcon className="mr-1 h-4 w-4 text-gray-400" />
                  {job.viewCount || 0}
                </div>
              </td>
              <td className="hidden px-3 py-4 text-sm whitespace-nowrap text-gray-900 xl:table-cell">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4 text-gray-400" />
                  <span className="truncate">
                    {job.applicationDeadline
                      ? new Date(job.applicationDeadline).toLocaleDateString('vi-VN')
                      : 'Không giới hạn'}
                  </span>
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  💰 {formatSalary(job.salaryMin as number, job.salaryMax as number, job.currency)}
                </div>
              </td>
              <td className="px-3 py-4 text-center text-sm font-medium whitespace-nowrap">
                <div className="flex items-center justify-center gap-1">
                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="p-1 text-blue-600 hover:text-blue-900"
                    title="Xem chi tiết"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/admin/jobs/${job.id}/edit`}
                    className="p-1 text-green-600 hover:text-green-900"
                    title="Chỉnh sửa"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleCopyLink(job)}
                    className="p-1 text-gray-600 hover:text-gray-900"
                    title="Sao chép link"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(job)}
                      className="p-1 text-red-600 hover:text-red-900"
                      title="Xóa"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
