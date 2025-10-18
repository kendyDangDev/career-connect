'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
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

interface JobStatusPageProps {
  status: JobStatus;
  title: string;
  description: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  bulkActions?: Array<{
    label: string;
    action: string;
    color: string;
    confirm?: boolean;
  }>;
}

export function JobStatusPage({
  status,
  title,
  description,
  bgColor,
  borderColor,
  textColor,
  bulkActions = [],
}: JobStatusPageProps) {
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
  } = useAdminJobs({ status });

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

  const handleBulkAction = async (action: string, confirm?: boolean) => {
    if (selectedJobs.length === 0) return;

    if (confirm && !window.confirm(`Thực hiện thao tác cho ${selectedJobs.length} việc làm?`)) {
      return;
    }

    await bulkUpdate(
      selectedJobs,
      action,
      action === 'UPDATE_STATUS' ? { status: JobStatus.ACTIVE } : undefined
    );
    setSelectedJobs([]);
  };

  return (
    <div className="space-y-6">
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

      {/* Page Header */}
      <div className={`${bgColor} border ${borderColor} rounded-lg p-4`}>
        <h2 className={`text-lg font-semibold ${textColor}`}>{title}</h2>
        <p className={`mt-1 text-sm ${textColor} opacity-90`}>{description}</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative max-w-md flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder={`Tìm kiếm trong ${title.toLowerCase()}...`}
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
              <span className="text-sm text-gray-500">Đã chọn {selectedJobs.length} việc làm</span>
              {bulkActions.map((action) => (
                <button
                  key={action.action}
                  onClick={() => handleBulkAction(action.action, action.confirm)}
                  className={`text-sm ${action.color}`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Jobs Table */}
      <JobsTable
        jobs={jobs}
        loading={loading}
        onDelete={deleteJob}
        onStatusChange={updateJobStatus}
        onSort={handleSort}
        sortBy={params.sortBy}
        sortOrder={params.sortOrder}
        selectedJobs={selectedJobs}
        onSelectJob={handleSelectJob}
        onSelectAll={handleSelectAll}
      />

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
