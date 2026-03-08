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
      {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tin đang chờ duyệt</h1>
          <p className="mt-1 text-sm text-gray-500">
            Xem xét và duyệt các tin tuyển dụng mới từ nhà tuyển dụng
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4 text-sm">
            <div className="text-gray-600">
              Có <span className="font-semibold text-yellow-600">{pagination?.total || 0}</span> tin
              chờ duyệt
            </div>
            {jobs.length > 0 && (
              <>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">
                  Công ty đã xác thực:{' '}
                  <span className="font-semibold text-green-600">
                    {jobs.filter((job) => job.company?.verificationStatus === 'VERIFIED').length}
                  </span>
                </div>
                <div className="text-gray-400">|</div>
                <div className="text-gray-600">
                  Thiếu thông tin:{' '}
                  <span className="font-semibold text-red-600">
                    {jobs.filter((job) => !job.title || !job.description || !job.salaryMin).length}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div> */}

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
              {jobs.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                    <span className="text-xs font-medium">Thiếu tiêu đề:</span>
                    <span className="text-xs font-bold text-red-600">
                      {jobs.filter((job) => !job.title).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                    <span className="text-xs font-medium">Thiếu mô tả:</span>
                    <span className="text-xs font-bold text-red-600">
                      {jobs.filter((job) => !job.description).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                    <span className="text-xs font-medium">Thiếu lương:</span>
                    <span className="text-xs font-bold text-red-600">
                      {jobs.filter((job) => !job.salaryMin && !job.salaryNegotiable).length}
                    </span>
                  </div>
                </div>
              )}
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
              onClick={() => refetch()}
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
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-600" />
            </div>
            <p className="font-medium text-gray-600">Đang tải dữ liệu...</p>
            <p className="mt-1 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-8 w-8 text-green-600" />
            </div>
            <p className="mb-2 text-lg font-medium text-gray-900">Tất cả tin đã được xử lý</p>
            <p className="text-gray-500">Không có tin tuyển dụng nào đang chờ duyệt</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedJobs.length === jobs.length && jobs.length > 0}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      {selectedJobs.length > 0 && (
                        <span className="ml-2 text-xs font-medium text-gray-600">
                          {selectedJobs.length}
                        </span>
                      )}
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Tin tuyển dụng
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Công ty
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Người tạo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Mức lương
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Hạn nộp
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Ngày tạo
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-3 text-center text-xs font-semibold tracking-wider text-gray-700 uppercase"
                  >
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {jobs.map((job, index) => (
                  <tr
                    key={job.id}
                    className="group transition-colors duration-200 hover:bg-blue-50/50"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedJobs.includes(job.id)}
                          onChange={() => handleSelectJob(job.id)}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        {/* Status Indicators - Horizontal */}
                        <div className="flex gap-1">
                          {job.urgent && (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-red-500"
                              title="Tin gấp"
                            />
                          )}
                          {job.featured && (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-yellow-500"
                              title="Tin nổi bật"
                            />
                          )}
                          {(!job.title || !job.description) && (
                            <span
                              className="inline-block h-2 w-2 rounded-full bg-orange-500"
                              title="Thiếu thông tin"
                            />
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="max-w-xs">
                        <div className="mb-1 w-60 truncate text-sm font-semibold text-gray-900">
                          {job.title || (
                            <span className="text-red-500 italic">Chưa có tiêu đề</span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                              {job.jobType === 'FULL_TIME'
                                ? 'Full-time'
                                : job.jobType === 'PART_TIME'
                                  ? 'Part-time'
                                  : job.jobType === 'CONTRACT'
                                    ? 'Contract'
                                    : job.jobType === 'INTERNSHIP'
                                      ? 'Internship'
                                      : job.jobType}
                            </span>
                            <span className="inline-flex items-center rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                              {job.experienceLevel === 'ENTRY'
                                ? 'Entry'
                                : job.experienceLevel === 'JUNIOR'
                                  ? 'Junior'
                                  : job.experienceLevel === 'MIDDLE'
                                    ? 'Middle'
                                    : job.experienceLevel === 'SENIOR'
                                      ? 'Senior'
                                      : job.experienceLevel === 'LEAD'
                                        ? 'Lead'
                                        : job.experienceLevel}
                            </span>
                          </div>
                          <div className="flex items-center text-gray-500">
                            <span>
                              📍{' '}
                              {job.locationCity ||
                                job.locationProvince ||
                                job.locationCountry ||
                                'Chưa xác định'}
                            </span>
                          </div>
                          {/* {job.jobSkills && job.jobSkills.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {job.jobSkills.slice(0, 3).map((skill: any, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700"
                                >
                                  {skill.skill?.name}
                                </span>
                              ))}
                              {job.jobSkills.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{job.jobSkills.length - 3}
                                </span>
                              )}
                            </div>
                          )} */}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          {job.company?.logoUrl ? (
                            <img
                              src={job.company.logoUrl}
                              alt={job.company?.companyName}
                              className="h-8 w-8 rounded border border-gray-200 object-cover"
                            />
                          ) : (
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-gray-200">
                              <BriefcaseIcon className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {job.company?.companyName}
                          </div>
                          {job.company?.verificationStatus === 'VERIFIED' && (
                            <div className="mt-0.5 flex items-center text-xs text-green-600">
                              <CheckCircleIcon className="mr-1 h-3 w-3" />
                              Đã xác thực
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0">
                          {job.recruiter?.avatarUrl ? (
                            <img
                              src={job.recruiter.avatarUrl}
                              alt={`${job.recruiter?.firstName} ${job.recruiter?.lastName}`}
                              className="h-7 w-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200">
                              <span className="text-xs font-medium text-gray-600">
                                {job.recruiter?.firstName?.charAt(0)}
                                {job.recruiter?.lastName?.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-gray-900">
                            {job.recruiter?.firstName} {job.recruiter?.lastName}
                          </div>
                          <div className="truncate text-xs text-gray-500">
                            {job.recruiter?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.salaryMin && job.salaryMax ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {job.salaryMin?.toLocaleString('vi-VN')} -{' '}
                            {job.salaryMax?.toLocaleString('vi-VN')}
                          </div>
                          <div className="text-xs text-gray-500">{job.currency}</div>
                        </div>
                      ) : job.salaryNegotiable ? (
                        <span className="inline-flex items-center rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          Thỏa thuận
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">Chưa cập nhật</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {job.applicationDeadline ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {new Date(job.applicationDeadline).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="text-xs">
                            {(() => {
                              const deadline = new Date(job.applicationDeadline);
                              const today = new Date();
                              const diffTime = deadline.getTime() - today.getTime();
                              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                              if (diffDays < 0) {
                                return <span className="text-red-600">Đã hết hạn</span>;
                              } else if (diffDays <= 7) {
                                return <span className="text-orange-600">Còn {diffDays} ngày</span>;
                              } else {
                                return <span className="text-green-600">Còn {diffDays} ngày</span>;
                              }
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">Không giới hạn</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(job.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200"
                          title="Xem chi tiết"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleApprove(job.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-green-100 text-green-600 transition-colors hover:bg-green-200"
                          title="Duyệt tin này"
                        >
                          <CheckIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleReject(job.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded bg-red-100 text-red-600 transition-colors hover:bg-red-200"
                          title="Từ chối tin này"
                        >
                          <XMarkIcon className="h-4 w-4" />
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
        <div className="rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-600">
              <span className="mr-2">📊</span>
              Hiển thị{' '}
              <span className="mx-1 font-semibold text-gray-900">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{' '}
              đến{' '}
              <span className="mx-1 font-semibold text-gray-900">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{' '}
              trong <span className="mx-1 font-semibold text-blue-600">{pagination.total}</span> kết
              quả
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-2 text-sm text-gray-500">
                Trang {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => updateParams({ page: pagination.page - 1 })}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white"
              >
                ← Trước
              </button>
              <button
                onClick={() => updateParams({ page: pagination.page + 1 })}
                disabled={!pagination.hasNextPage}
                className="relative inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all duration-200 hover:border-gray-400 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white"
              >
                Sau →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
