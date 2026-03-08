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
      name: 'Total Jobs',
      value: stats?.totalJobs || 128,
      icon: BriefcaseIcon,
      change: '+12.5%',
      changeType: 'increase' as 'increase' | 'decrease' | 'neutral',
      description: 'Tổng số tin tuyển dụng trong hệ thống',
      category: 'overview',
    },
    {
      name: 'Pending Review',
      value: stats?.pendingJobs || 23,
      icon: ClockIcon,
      change: '+8.2%',
      changeType: 'increase' as 'increase' | 'decrease' | 'neutral',
      description: 'Tin tuyển dụng đang chờ được duyệt',
      category: 'pending',
    },
    {
      name: 'Active Jobs',
      value: stats?.activeJobs || 94,
      icon: CheckCircleIcon,
      change: '+15.7%',
      changeType: 'increase' as 'increase' | 'decrease' | 'neutral',
      description: 'Tin tuyển dụng đang được đăng tải',
      category: 'active',
    },
    {
      name: 'Expired',
      value: stats?.expiredJobs || 11,
      icon: XCircleIcon,
      change: '-3.1%',
      changeType: 'decrease' as 'increase' | 'decrease' | 'neutral',
      description: 'Tin tuyển dụng đã hết hạn ứng tuyển',
      category: 'expired',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Navigation Tabs and Action Button */}
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Quản lý việc làm</h1>
          <Link
            href="/admin/jobs/create"
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Tạo việc làm mới
          </Link>
        </div>
        <nav className="-mb-px flex space-x-8">
          {navigation.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href) || false;
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
                    {item.status === JobStatus.EXPIRED && stats.expiredJobs}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Modern Stats Dashboard */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          const colorThemes = [
            {
              bg: 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-700',
              accent: 'bg-blue-100/20',
              glow: 'shadow-blue-500/25',
              text: 'text-blue-600',
              lightBg: 'from-blue-50 to-indigo-50',
            },
            {
              bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
              accent: 'bg-orange-100/20',
              glow: 'shadow-orange-500/25',
              text: 'text-orange-600',
              lightBg: 'from-amber-50 to-orange-50',
            },
            {
              bg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600',
              accent: 'bg-green-100/20',
              glow: 'shadow-green-500/25',
              text: 'text-green-600',
              lightBg: 'from-emerald-50 to-green-50',
            },
            {
              bg: 'bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700',
              accent: 'bg-gray-100/20',
              glow: 'shadow-gray-500/25',
              text: 'text-gray-600',
              lightBg: 'from-slate-50 to-gray-50',
            },
          ];

          const theme = colorThemes[index % 4];

          return (
            <div key={stat.name} className="group relative overflow-hidden">
              {/* Main Card */}
              <div
                className={`relative h-full bg-gradient-to-br ${theme.lightBg} transform rounded-xl border border-white/20 p-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:rotate-1 hover:shadow-2xl`}
              >
                {/* Floating Orbs Background */}
                <div className="absolute -top-3 -right-3 h-16 w-16 rounded-full bg-gradient-to-br from-white/10 to-white/5 blur-lg"></div>
                <div className="absolute -bottom-1 -left-1 h-12 w-12 rounded-full bg-gradient-to-tr from-white/5 to-white/10 blur-md"></div>

                {/* Animated Border */}
                <div className="absolute inset-0 animate-pulse rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                {/* Header Section */}
                <div className="relative z-10">
                  <div className="mb-4 flex items-center justify-between">
                    {/* Floating Icon */}
                    <div
                      className={`relative p-3 ${theme.bg} rounded-xl ${theme.glow} shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:rotate-6`}
                    >
                      <Icon className="h-5 w-5 text-white drop-shadow-sm" />
                      {/* Icon Glow Effect */}
                      <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      {/* Pulse Ring */}
                      <div className="absolute -inset-1 animate-ping rounded-xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100"></div>
                    </div>

                    {/* Trend Indicator */}
                    {stat.changeType !== 'neutral' && (
                      <div
                        className={`flex items-center gap-1 rounded-full border px-2 py-1 backdrop-blur-sm ${
                          stat.changeType === 'increase'
                            ? 'border-emerald-200/50 bg-emerald-100/80 text-emerald-700'
                            : 'border-red-200/50 bg-red-100/80 text-red-700'
                        } shadow-md transition-transform duration-300 group-hover:scale-105`}
                      >
                        {stat.changeType === 'increase' ? (
                          <ArrowUpIcon className="h-3 w-3" />
                        ) : (
                          <ArrowDownIcon className="h-3 w-3" />
                        )}
                        <span className="text-xs font-bold">{stat.change}</span>
                      </div>
                    )}
                  </div>

                  {/* Content Section */}
                  <div className="space-y-3">
                    {/* Title */}
                    <div>
                      <h3 className="mb-0.5 text-xs font-semibold tracking-wider text-gray-500 uppercase">
                        {stat.name}
                      </h3>
                      <p className="line-clamp-1 text-xs font-medium text-gray-600">
                        {stat.description}
                      </p>
                    </div>

                    {/* Value Display */}
                    <div className="space-y-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-gray-800 transition-colors duration-300 group-hover:text-gray-900">
                          {typeof stat.value === 'number' && stat.value > 1000
                            ? (stat.value / 1000).toFixed(1) + 'K'
                            : stat.value.toLocaleString()}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {stat.value === 1 ? 'tin' : 'tin'}
                        </span>
                      </div>

                      {/* Interactive Progress Ring */}
                      <div className="relative mt-2">
                        <svg className="h-1.5 w-full" viewBox="0 0 200 6">
                          {/* Background Track */}
                          <rect
                            x="0"
                            y="1"
                            width="200"
                            height="3"
                            rx="1.5"
                            fill="currentColor"
                            className="text-gray-200"
                          />
                          {/* Progress Fill */}
                          <rect
                            x="0"
                            y="1"
                            width={`${Math.min((stat.value / Math.max(...statsCards.map((s) => s.value))) * 200, 200)}`}
                            height="3"
                            rx="1.5"
                            fill="url(#gradient)"
                            className="transition-all duration-700 ease-out"
                          />
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop
                                offset="0%"
                                stopColor={
                                  index % 4 === 0
                                    ? '#3B82F6'
                                    : index % 4 === 1
                                      ? '#F59E0B'
                                      : index % 4 === 2
                                        ? '#10B981'
                                        : '#6B7280'
                                }
                              />
                              <stop
                                offset="100%"
                                stopColor={
                                  index % 4 === 0
                                    ? '#8B5CF6'
                                    : index % 4 === 1
                                      ? '#EF4444'
                                      : index % 4 === 2
                                        ? '#059669'
                                        : '#4B5563'
                                }
                              />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Glassmorphism Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/10 via-transparent to-white/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100"></div>

                {/* Bottom Accent Line */}
                <div
                  className={`absolute right-0 bottom-0 left-0 h-1 ${theme.bg} scale-x-0 transform rounded-b-2xl transition-transform duration-500 group-hover:scale-x-100`}
                ></div>
              </div>

              {/* Floating Shadow */}
              <div
                className={`absolute inset-0 ${theme.bg} translate-y-4 transform rounded-2xl opacity-0 blur-2xl transition-all duration-500 group-hover:translate-y-2 group-hover:opacity-20`}
              ></div>
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
              onClick={() => refetch()}
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
