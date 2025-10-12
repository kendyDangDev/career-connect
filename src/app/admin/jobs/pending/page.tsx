'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { JobsTable } from '@/components/admin/jobs/JobsTable';
import { useAdminJobs } from '@/hooks/admin/useAdminJobs';
import { JobStatus } from '@/generated/prisma';

const navigation = [
  { name: 'Tất cả tin', href: '/admin/jobs/all', icon: BriefcaseIcon },
  { name: 'Đang chờ duyệt', href: '/admin/jobs/pending', icon: ClockIcon },
  { name: 'Đã duyệt', href: '/admin/jobs/approved', icon: CheckCircleIcon },
  { name: 'Hết hạn', href: '/admin/jobs/expired', icon: XCircleIcon },
];

export default function PendingJobsPage() {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobs, setSelectedJobs] = useState<string[]>([]);

  const {
    jobs,
    loading,
    error,
    pagination,
    params,
    updateParams,
    deleteJob,
    updateJobStatus,
    bulkUpdate,
    refetch,
  } = useAdminJobs({ status: JobStatus.PENDING });

  const handleSearch = () => {
    updateParams({ search: searchTerm, page: 1 });
  };

  const handleSort = (field: string) => {
    const newOrder = params.sortBy === field && params.sortOrder === 'desc' ? 'asc' : 'desc';
    updateParams({ sortBy: field, sortOrder: newOrder });
  };

  const handleSelectJob = (jobId: string) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId) ? prev.filter((id) => id !== jobId) : [...prev, jobId]
    );
  };

  const handleSelectAll = () => {
    if (selectedJobs.length === jobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(jobs.map((job) => job.id));
    }
  };

  const handleApprove = async (jobId?: string) => {
    const jobsToApprove = jobId ? [jobId] : selectedJobs;
    if (jobsToApprove.length === 0) return;

    for (const id of jobsToApprove) {
      await updateJobStatus(id, JobStatus.ACTIVE, 'Approved by admin');
    }
    setSelectedJobs([]);
  };

  const handleReject = async (jobId?: string) => {
    const jobsToReject = jobId ? [jobId] : selectedJobs;
    if (jobsToReject.length === 0) return;

    const reason = prompt('Lý do từ chối:');
    if (!reason) return;

    for (const id of jobsToReject) {
      await updateJobStatus(id, JobStatus.CLOSED, reason);
    }
    setSelectedJobs([]);
  };

  const handleBulkApprove = () => {
    if (confirm(`Duyệt ${selectedJobs.length} tin tuyển dụng?`)) {
      handleApprove();
    }
  };

  const handleBulkReject = () => {
    if (confirm(`Từ chối ${selectedJobs.length} tin tuyển dụng?`)) {
      handleReject();
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin đang chờ duyệt</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem xét và duyệt các tin tuyển dụng mới từ nhà tuyển dụng
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            Có <span className="font-semibold text-yellow-600">{pagination?.total || 0}</span> tin
            chờ duyệt
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } `}
              >
                <Icon
                  className={`mr-2 -ml-0.5 h-5 w-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'} `}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Alert Box */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ClockIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Tin tuyển dụng đang chờ duyệt</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Vui lòng kiểm tra kỹ nội dung tin tuyển dụng trước khi duyệt. Đảm bảo tin tuyển dụng
                tuân thủ quy định và chính sách của hệ thống.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Actions Bar */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Tìm kiếm tin chờ duyệt..."
                className="block w-full rounded-md border-gray-300 py-2 pr-3 pl-10 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Tìm kiếm
            </button>
            <button
              onClick={refetch}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <ArrowPathIcon className="mr-2 h-4 w-4" />
              Làm mới
            </button>
          </div>

          {selectedJobs.length > 0 && (
            <div className="flex gap-2">
              <span className="mr-2 text-sm text-gray-500">Đã chọn {selectedJobs.length} tin</span>
              <button
                onClick={handleBulkApprove}
                className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
              >
                <CheckIcon className="mr-1 h-4 w-4" />
                Duyệt
              </button>
              <button
                onClick={handleBulkReject}
                className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
              >
                <XMarkIcon className="mr-1 h-4 w-4" />
                Từ chối
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Jobs Table with Quick Actions */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {loading ? (
          <div className="p-8 text-center">
            <ArrowPathIcon className="mx-auto h-8 w-8 animate-spin text-gray-400" />
            <p className="mt-2 text-gray-500">Đang tải...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircleIcon className="mx-auto h-12 w-12 text-green-400" />
            <p className="mt-2 text-gray-500">Không có tin nào đang chờ duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedJobs.length === jobs.length && jobs.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Tin tuyển dụng
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Công ty
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Ngày tạo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase"
                  >
                    Thao tác nhanh
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedJobs.includes(job.id)}
                        onChange={() => handleSelectJob(job.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{job.title}</div>
                        <div className="text-sm text-gray-500">
                          {job.jobType} • {job.locationCity}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{job.company?.companyName}</div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium whitespace-nowrap">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleApprove(job.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Duyệt"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReject(job.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Từ chối"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border-t border-gray-200 bg-white px-4 py-3 shadow sm:px-6">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Hiển thị{' '}
                <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span>{' '}
                đến{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                trong <span className="font-medium">{pagination.total}</span> kết quả
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => updateParams({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => updateParams({ page: pagination.page + 1 })}
                disabled={!pagination.hasNextPage}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sau
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
