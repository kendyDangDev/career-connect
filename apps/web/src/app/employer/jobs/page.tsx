'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Briefcase,
  Plus,
  Search,
  SlidersHorizontal,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { JobCard } from '@/components/employer/jobs/JobCard';
import { JobStatus } from '@/components/employer/jobs/JobStatusBadge';
import { adminJobApi } from '@/api/job.api';
import type { JobListItem } from '@/types/employer/job';

export default function JobsPage() {
  const { data: session, status: sessionStatus } = useSession();
  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | JobStatus>('ALL');
  const [showFilters, setShowFilters] = useState(false);
  const [jobTypeFilter, setJobTypeFilter] = useState<
    'ALL' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
  >('ALL');
  const [locationFilter, setLocationFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<
    'createdAt' | 'applicationCount' | 'viewCount' | 'applicationDeadline'
  >('createdAt');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    closed: 0,
  });

  // Get company ID from session
  const companyId = session?.user?.companyId;

  // Fetch jobs function
  const fetchJobs = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchQuery || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        jobType:
          jobTypeFilter !== 'ALL'
            ? (jobTypeFilter as 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP')
            : undefined,
        locationCity: locationFilter !== 'ALL' ? locationFilter : undefined,
        companyId: companyId, // Filter by company
        sortBy: sortBy,
        sortOrder: 'desc' as const,
      };

      const response = await adminJobApi.getJobsList(params);

      setJobs(response.jobs);
      setPagination({
        page: response.pagination.page,
        limit: response.pagination.limit,
        total: response.pagination.total,
        totalPages: response.pagination.totalPages,
      });

      if (response.stats) {
        setStats({
          total: response.stats.totalJobs,
          active: response.stats.activeJobs,
          pending: response.stats.pendingJobs,
          closed: response.stats.closedJobs,
        });
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
      setError('Không thể tải danh sách công việc. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
      console.log('stats: ...', stats);
    }
  };

  // Fetch jobs when component mounts or filters change
  useEffect(() => {
    if (sessionStatus === 'loading') {
      return;
    }
    if (!companyId) {
      setLoading(false);
      setError('Không tìm thấy thông tin công ty. Vui lòng đăng nhập lại.');
      return;
    }
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    companyId,
    pagination.page,
    searchQuery,
    statusFilter,
    jobTypeFilter,
    locationFilter,
    sortBy,
    sessionStatus,
  ]);

  // Handle status change
  const handleStatusChange = async (jobId: string, status: JobStatus) => {
    try {
      await adminJobApi.updateJobStatus(jobId, { status });
      // Refresh jobs list
      fetchJobs();
    } catch (err) {
      console.error('Failed to update job status:', err);
      alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
    }
  };

  // Handle duplicate job
  const handleDuplicate = async (jobId: string) => {
    try {
      await adminJobApi.duplicateJob(jobId);
      // Refresh jobs list
      fetchJobs();
      alert('Đã sao chép công việc thành công!');
    } catch (err) {
      console.error('Failed to duplicate job:', err);
      alert('Không thể sao chép công việc. Vui lòng thử lại.');
    }
  };

  // Handle delete job
  const handleDelete = async (jobId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      return;
    }

    try {
      await adminJobApi.deleteJob(jobId);
      // Refresh jobs list
      fetchJobs();
      alert('Đã xóa công việc thành công!');
    } catch (err) {
      console.error('Failed to delete job:', err);
      alert('Không thể xóa công việc. Vui lòng thử lại.');
    }
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setJobTypeFilter('ALL');
    setLocationFilter('ALL');
    setSortBy('createdAt');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if any filter is active
  const hasActiveFilters =
    searchQuery ||
    statusFilter !== 'ALL' ||
    jobTypeFilter !== 'ALL' ||
    locationFilter !== 'ALL' ||
    sortBy !== 'createdAt';

  // Calculate days left
  const calculateDaysLeft = (deadline: Date | null): number => {
    if (!deadline) return 0;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diff = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Map jobs to card format
  const mappedJobs = jobs.map((job) => ({
    ...job,
    type: job.jobType,
    location: job.address ? `${job?.address} - ${job?.locationProvince}` : 'Remote',
    salary:
      job.salaryMin && job.salaryMax
        ? `${job.salaryMin / 1000000}-${job.salaryMax / 1000000} triệu`
        : job.salaryNegotiable
          ? 'Thỏa thuận'
          : undefined,
    applications: job.applicationCount,
    views: job.viewCount,
    daysLeft: calculateDaysLeft(job.applicationDeadline || null),
    description: undefined, // Description is not in list view
    // Convert Date objects to ISO strings for JobCard component
    createdAt: job.createdAt instanceof Date ? job.createdAt.toISOString() : job.createdAt,
    updatedAt: job.updatedAt instanceof Date ? job.updatedAt.toISOString() : job.updatedAt,
    applicationDeadline: job.applicationDeadline
      ? job.applicationDeadline instanceof Date
        ? job.applicationDeadline.toISOString()
        : job.applicationDeadline
      : null,
    publishedAt: job.publishedAt
      ? job.publishedAt instanceof Date
        ? job.publishedAt.toISOString()
        : job.publishedAt
      : null,
  }));

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => fetchJobs()}
            className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-white" />
            <div>
              <h1 className="mb-1 text-2xl font-bold text-white">Quản lý công việc</h1>
              <p className="text-purple-100">
                Tổng cộng <span className="font-semibold text-white">{pagination.total}</span> công
                việc
              </p>
            </div>
          </div>

          <Link
            href="/employer/jobs/create"
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-purple-700 shadow-md transition-all hover:scale-105 hover:shadow-lg"
          >
            <Plus className="h-4 w-4" />
            Đăng tin mới
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <button
          onClick={() => setStatusFilter('ALL')}
          disabled={loading}
          className={`shadow-soft relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
            statusFilter === 'ALL'
              ? 'border-purple-500 bg-purple-50'
              : 'border-gray-200 bg-white hover:border-purple-200'
          }`}
        >
          <div
            className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-10`}
          />
          <div className="relative">
            <p className="text-sm font-medium text-gray-600">Tất cả</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('ACTIVE')}
          disabled={loading}
          className={`shadow-soft relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
            statusFilter === 'ACTIVE'
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 bg-white hover:border-green-200'
          }`}
        >
          <div
            className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 opacity-10`}
          />
          <div className="relative">
            <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('PENDING')}
          disabled={loading}
          className={`shadow-soft relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
            statusFilter === 'PENDING'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200 bg-white hover:border-yellow-200'
          }`}
        >
          <div
            className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 opacity-10`}
          />
          <div className="relative">
            <p className="text-sm font-medium text-gray-600">Chờ duyệt</p>
            <p className="mt-1 text-2xl font-bold text-yellow-700">{stats.pending}</p>
          </div>
        </button>

        <button
          onClick={() => setStatusFilter('CLOSED')}
          disabled={loading}
          className={`shadow-soft relative overflow-hidden rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 ${
            statusFilter === 'CLOSED'
              ? 'border-gray-500 bg-gray-50'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div
            className={`absolute -top-4 -right-4 h-16 w-16 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 opacity-10`}
          />
          <div className="relative">
            <p className="text-sm font-medium text-gray-600">Đã đóng</p>
            <p className="mt-1 text-2xl font-bold text-gray-700">{stats.closed}</p>
          </div>
        </button>
      </div>

      {/* Search & Filters */}
      <div className="shadow-soft rounded-xl border border-purple-100 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm công việc..."
              className="w-full rounded-lg border border-purple-100 bg-white py-2.5 pr-4 pl-10 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
              showFilters
                ? 'border-purple-600 bg-purple-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Bộ lọc
          </button>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Xóa lọc
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Loại công việc</label>
              <select
                value={jobTypeFilter}
                onChange={(e) =>
                  setJobTypeFilter(
                    e.target.value as 'ALL' | 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP'
                  )
                }
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              >
                <option value="ALL">Tất cả</option>
                <option value="FULL_TIME">Full-time</option>
                <option value="PART_TIME">Part-time</option>
                <option value="CONTRACT">Hợp đồng</option>
                <option value="INTERNSHIP">Thực tập</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Địa điểm</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              >
                <option value="ALL">Tất cả</option>
                <option value="Hà Nội">Hà Nội</option>
                <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
                <option value="Hải Phòng">Hải Phòng</option>
                <option value="Cần Thơ">Cần Thơ</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">Sắp xếp theo</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full rounded-lg border border-purple-100 bg-white px-4 py-2 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="applicationCount">Nhiều ứng viên nhất</option>
                <option value="viewCount">Nhiều lượt xem nhất</option>
                <option value="applicationDeadline">Sắp hết hạn</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Jobs List */}
      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-purple-600" />
          <p className="mt-4 text-sm text-gray-600">Đang tải danh sách công việc...</p>
        </div>
      ) : mappedJobs.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">Không tìm thấy công việc</h3>
          <p className="mt-2 text-sm text-gray-600">
            {searchQuery || statusFilter !== 'ALL'
              ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách đăng tin tuyển dụng đầu tiên'}
          </p>
          {!searchQuery && statusFilter === 'ALL' && (
            <Link
              href="/employer/jobs/create"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md transition-all hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {mappedJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onStatusChange={handleStatusChange}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-600">
                Hiển thị{' '}
                <span className="font-medium text-gray-900">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                -
                <span className="font-medium text-gray-900">
                  {' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                trong tổng số
                <span className="font-medium text-gray-900"> {pagination.total}</span> công việc
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Trước
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        disabled={loading}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-all ${
                          pagination.page === pageNum
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                        } disabled:cursor-not-allowed disabled:opacity-50`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || loading}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Tiếp
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
