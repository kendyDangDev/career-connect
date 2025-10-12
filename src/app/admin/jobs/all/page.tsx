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
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { JobsTable } from '@/components/admin/jobs/JobsTable';
import { useAdminJobs, useJobStatistics } from '@/hooks/admin/useAdminJobs';
import { JobStatus } from '@/generated/prisma';

const navigation = [
  { name: 'Tất cả tin', href: '/admin/jobs/all', icon: BriefcaseIcon, status: null, exact: true },
  {
    name: 'Đang chờ duyệt',
    href: '/admin/jobs/pending',
    icon: ClockIcon,
    status: JobStatus.PENDING,
  },
  {
    name: 'Đã duyệt',
    href: '/admin/jobs/approved',
    icon: CheckCircleIcon,
    status: JobStatus.ACTIVE,
  },
  { name: 'Hết hạn', href: '/admin/jobs/expired', icon: XCircleIcon, status: JobStatus.EXPIRED },
];

export default function AdminJobsPage() {
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
    bulkDelete,
    refetch,
  } = useAdminJobs();

  const { stats, loading: statsLoading } = useJobStatistics();

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

  const handleBulkAction = async (action: string) => {
    if (selectedJobs.length === 0) return;

    if (action === 'DELETE') {
      if (confirm(`Bạn có chắc muốn xóa ${selectedJobs.length} việc làm?`)) {
        await bulkDelete(selectedJobs);
        setSelectedJobs([]);
      }
    } else {
      await bulkUpdate(selectedJobs, action);
      setSelectedJobs([]);
    }
  };

  const statsCards = [
    {
      name: 'Tổng số tin',
      value: stats?.totalJobs || 0,
      icon: BriefcaseIcon,
      change: '+12%',
      changeType: 'increase' as const,
      color: 'bg-blue-500',
    },
    {
      name: 'Đang chờ duyệt',
      value: stats?.pendingJobs || 0,
      icon: ClockIcon,
      change: `${stats?.pendingJobs || 0}`,
      changeType: 'neutral' as const,
      color: 'bg-yellow-500',
    },
    {
      name: 'Đã duyệt',
      value: stats?.activeJobs || 0,
      icon: CheckCircleIcon,
      change: '+18%',
      changeType: 'increase' as const,
      color: 'bg-green-500',
    },
    {
      name: 'Hết hạn',
      value: stats?.expiredJobs || 0,
      icon: XCircleIcon,
      change: `${stats?.expiredJobs || 0}`,
      changeType: 'neutral' as const,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
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
                {item.status && stats && (
                  <span
                    className={`ml-2 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      isActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {item.status === JobStatus.ACTIVE && stats.activeJobs}
                    {item.status === JobStatus.PENDING && stats.pendingJobs}
                    {item.status === JobStatus.CLOSED && stats.closedJobs}
                    {item.status === JobStatus.EXPIRED && stats.expiredJobs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="relative overflow-hidden rounded-lg bg-white px-4 pt-5 pb-12 shadow sm:px-6 sm:pt-6"
            >
              <dt>
                <div className={`absolute rounded-md ${stat.color} p-3`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
              </dt>
              <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
                <p className="text-2xl font-semibold text-gray-900">
                  {typeof stat.value === 'number' && stat.value > 1000
                    ? (stat.value / 1000).toFixed(1) + 'K'
                    : stat.value}
                </p>
                {stat.changeType !== 'neutral' && (
                  <p
                    className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.changeType === 'increase' ? (
                      <ArrowUpIcon className="h-4 w-4" />
                    ) : (
                      <ArrowDownIcon className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {stat.changeType === 'increase' ? 'Increased' : 'Decreased'} by
                    </span>
                    {stat.change}
                  </p>
                )}
              </dd>
            </div>
          );
        })}
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
                placeholder="Tìm kiếm việc làm..."
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
              <button
                onClick={() => handleBulkAction('FEATURE')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Đánh dấu nổi bật
              </button>
              <button
                onClick={() => handleBulkAction('DELETE')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Xóa
              </button>
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
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => updateParams({ page: pagination.page - 1 })}
              disabled={!pagination.hasPrevPage}
              className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <button
              onClick={() => updateParams({ page: pagination.page + 1 })}
              disabled={!pagination.hasNextPage}
              className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
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
            <div>
              <nav className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => updateParams({ page: pagination.page - 1 })}
                  disabled={!pagination.hasPrevPage}
                  className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Trước
                </button>
                {[...Array(pagination.totalPages)].map((_, i) => {
                  const pageNum = i + 1;
                  if (
                    pageNum === 1 ||
                    pageNum === pagination.totalPages ||
                    (pageNum >= pagination.page - 1 && pageNum <= pagination.page + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => updateParams({ page: pageNum })}
                        className={`relative inline-flex items-center border px-4 py-2 text-sm font-medium ${
                          pageNum === pagination.page
                            ? 'z-10 border-blue-500 bg-blue-50 text-blue-600'
                            : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  if (pageNum === pagination.page - 2 || pageNum === pagination.page + 2) {
                    return (
                      <span
                        key={pageNum}
                        className="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => updateParams({ page: pagination.page + 1 })}
                  disabled={!pagination.hasNextPage}
                  className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Sau
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
