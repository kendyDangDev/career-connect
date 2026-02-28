'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  Loader2,
  RefreshCw,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import JobCard, { JobCardData } from '../home/JobCard';
import JobSearchBar from './JobSearchBar';
import JobFiltersPanel from './JobFiltersPanel';
import QuickFilters from './QuickFilters';
import ActiveFilters from './ActiveFilters';
import TrendingJobs from './TrendingJobs';
import { useDebounce } from '@/hooks/useDebounced';

export interface JobListFilters {
  page: number;
  limit: number;
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  locationCity?: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

// Stats
const jobStats = [
  {
    label: 'Tổng việc làm',
    value: '15.2K+',
    icon: Briefcase,
    gradient: 'from-purple-500 to-purple-700',
  },
  {
    label: 'Công ty tuyển dụng',
    value: '3.5K',
    icon: Building2,
    gradient: 'from-indigo-500 to-indigo-700',
  },
  {
    label: 'Ứng viên mới',
    value: '28K+',
    icon: Users,
    gradient: 'from-violet-500 to-violet-700',
  },
  {
    label: 'Việc làm hot',
    value: '892',
    icon: TrendingUp,
    gradient: 'from-fuchsia-500 to-fuchsia-700',
  },
];

export default function JobListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<JobListFilters>(() => ({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || undefined,
    jobType: searchParams.get('jobType') || undefined,
    experienceLevel: searchParams.get('experienceLevel') || undefined,
    locationCity: searchParams.get('locationCity') || searchParams.get('location') || undefined,
    salaryMin: searchParams.get('salaryMin') ? parseInt(searchParams.get('salaryMin')!) : undefined,
    salaryMax: searchParams.get('salaryMax') ? parseInt(searchParams.get('salaryMax')!) : undefined,
    categoryId: searchParams.get('categoryId') || undefined,
    sortBy: searchParams.get('sortBy') || 'publishedAt',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  }));

  const [inputValue, setInputValue] = useState(filters.search || '');
  const [showFilters, setShowFilters] = useState(false);
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [error, setError] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Debounce search input
  const debouncedInput = useDebounce(inputValue, 500);

  // Sync debounced input to filters
  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === (debouncedInput || undefined)) return prev;
      return { ...prev, search: debouncedInput || undefined, page: 1 };
    });
  }, [debouncedInput]);

  // Build query params from filters
  const buildParams = useCallback((f: JobListFilters) => {
    const params = new URLSearchParams();
    params.set('page', String(f.page));
    params.set('limit', String(f.limit));
    if (f.search) params.set('search', f.search);
    if (f.jobType) params.set('jobType', f.jobType);
    if (f.experienceLevel) params.set('experienceLevel', f.experienceLevel);
    if (f.locationCity) params.set('locationCity', f.locationCity);
    if (f.salaryMin) params.set('salaryMin', String(f.salaryMin));
    if (f.salaryMax) params.set('salaryMax', String(f.salaryMax));
    if (f.categoryId) params.set('categoryId', f.categoryId);
    if (f.sortBy) params.set('sortBy', f.sortBy);
    if (f.sortOrder) params.set('sortOrder', f.sortOrder);
    return params;
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(
    async (f: JobListFilters, append = false) => {
      try {
        setError(false);
        const params = buildParams(f);
        const res = await fetch(`/api/jobs?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        const newJobs: JobCardData[] = data.data?.jobs ?? data.data ?? [];
        setJobs((prev) => (append ? [...prev, ...newJobs] : newJobs));
        setPagination({
          page: data.data?.pagination?.page ?? data.pagination?.page ?? f.page,
          totalPages: data.data?.pagination?.totalPages ?? data.pagination?.totalPages ?? 1,
          total: data.data?.pagination?.total ?? data.pagination?.total ?? newJobs.length,
        });
      } catch {
        setError(true);
      }
    },
    [buildParams]
  );

  // Initial load & filter changes
  useEffect(() => {
    setLoading(true);
    fetchJobs(filters, false).finally(() => setLoading(false));
    // Update URL
    const params = buildParams(filters);
    params.delete('page');
    params.delete('limit');
    const qs = params.toString();
    router.replace(`/jobs${qs ? `?${qs}` : ''}`, { scroll: false });
  }, [filters, fetchJobs, buildParams, router]);

  // Load more
  const handleLoadMore = async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;
    setLoadingMore(true);
    const nextFilters = { ...filters, page: pagination.page + 1 };
    await fetchJobs(nextFilters, true);
    setLoadingMore(false);
  };

  // Search
  const handleSearchSubmit = useCallback((query: string) => {
    setInputValue(query);
    setFilters((prev) => ({ ...prev, search: query || undefined, page: 1 }));
  }, []);

  // Filter changes
  const handleFilterChange = useCallback((newFilters: Partial<JobListFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
    setShowFilters(false);
  }, []);

  // Quick filter
  const handleQuickFilter = useCallback((filterData: Partial<JobListFilters>) => {
    setFilters((prev) => ({ ...prev, ...filterData, page: 1 }));
  }, []);

  // Clear all
  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12, sortBy: 'publishedAt', sortOrder: 'desc' });
    setInputValue('');
  }, []);

  // Remove single filter
  const handleRemoveFilter = useCallback((key: keyof JobListFilters) => {
    setFilters((prev) => ({ ...prev, [key]: undefined, page: 1 }));
    if (key === 'search') setInputValue('');
  }, []);

  // Save job
  const handleSave = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && value !== undefined
    ).length;
  }, [filters]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/60 via-white to-white pt-16">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 py-12 md:py-16">
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-purple-500/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-indigo-500/30 blur-3xl" />
          <svg
            className="absolute inset-0 h-full w-full opacity-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="jobs-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#jobs-grid)" />
          </svg>
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl lg:text-5xl">
              Tìm kiếm{' '}
              <span className="bg-gradient-to-r from-yellow-300 to-purple-300 bg-clip-text text-transparent">
                việc làm
              </span>
            </h1>
            <p className="mb-8 text-purple-200 md:text-lg">
              Hàng ngàn cơ hội đang chờ bạn — Tìm công việc phù hợp ngay hôm nay
            </p>

            {/* Search Bar */}
            <JobSearchBar
              value={inputValue}
              onChange={setInputValue}
              onSubmit={handleSearchSubmit}
            />
          </div>

          {/* Stats mini row */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {jobStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-sm"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${stat.gradient} shadow`}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="text-lg leading-tight font-bold text-white">{stat.value}</div>
                    <div className="text-xs text-purple-300">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Top bar: filter count + filter toggle */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">
              {loading ? (
                'Đang tải...'
              ) : (
                <>
                  Tìm thấy <span className="text-purple-600">{pagination.total}</span> việc làm
                </>
              )}
            </h2>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                {activeFilterCount} bộ lọc
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Sort dropdown */}
            <select
              value={`${filters.sortBy || 'publishedAt'}_${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('_');
                setFilters((prev) => ({
                  ...prev,
                  sortBy,
                  sortOrder: sortOrder as 'asc' | 'desc',
                  page: 1,
                }));
              }}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition focus:border-purple-300 focus:ring-2 focus:ring-purple-100 focus:outline-none"
            >
              <option value="publishedAt_desc">Mới nhất</option>
              <option value="viewCount_desc">Xem nhiều nhất</option>
              <option value="applicationCount_desc">Ứng tuyển nhiều nhất</option>
              <option value="salaryMax_desc">Lương cao nhất</option>
              <option value="salaryMin_asc">Lương thấp nhất</option>
            </select>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                showFilters
                  ? 'border-purple-300 bg-purple-50 text-purple-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-purple-200 hover:bg-purple-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Bộ lọc
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-600 text-[10px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters
          filters={filters}
          onRemove={handleRemoveFilter}
          onClearAll={handleClearFilters}
        />

        {/* Quick Filters */}
        <QuickFilters currentFilters={filters} onFilter={handleQuickFilter} />

        {/* Trending Jobs */}
        <TrendingJobs />

        {/* Content */}
        <div className="flex gap-8">
          {/* Sidebar Filters — desktop only */}
          {showFilters && (
            <aside className="hidden w-72 shrink-0 lg:block">
              <JobFiltersPanel
                filters={filters}
                onApply={handleFilterChange}
                onClose={() => setShowFilters(false)}
                inline
              />
            </aside>
          )}

          {/* Jobs grid */}
          <div className="min-w-0 flex-1">
            {loading ? (
              <div
                className={`grid grid-cols-1 gap-4 ${showFilters ? 'lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse rounded-2xl border border-gray-100 bg-white p-5"
                  >
                    <div className="mb-4 flex gap-3">
                      <div className="h-12 w-12 rounded-xl bg-gray-200" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 w-1/3 rounded bg-gray-200" />
                        <div className="h-4 w-2/3 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="mb-4 flex gap-2">
                      <div className="h-5 w-20 rounded-full bg-gray-200" />
                      <div className="h-5 w-24 rounded-full bg-gray-200" />
                    </div>
                    <div className="h-3 w-1/2 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
                  <RefreshCw className="h-10 w-10 text-red-400" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">Đã xảy ra lỗi</h3>
                <p className="mb-6 text-gray-500">
                  Không thể tải danh sách việc làm. Vui lòng thử lại sau.
                </p>
                <button
                  onClick={() => {
                    setLoading(true);
                    fetchJobs(filters, false).finally(() => setLoading(false));
                  }}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-indigo-700"
                >
                  Thử lại
                </button>
              </div>
            ) : jobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50">
                  <Briefcase className="h-12 w-12 text-purple-300" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-gray-900">Không tìm thấy việc làm</h3>
                <p className="mb-8 max-w-sm text-gray-500">
                  Hãy thử điều chỉnh tiêu chí tìm kiếm của bạn hoặc quay lại sau để tìm cơ hội mới
                </p>
                <button
                  onClick={handleClearFilters}
                  className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-md shadow-purple-200 transition hover:from-purple-700 hover:to-indigo-700"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`grid grid-cols-1 gap-4 ${showFilters ? 'lg:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}
                >
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      saved={savedIds.has(job.id)}
                      onSave={handleSave}
                    />
                  ))}
                </div>

                {/* Load More */}
                {pagination.page < pagination.totalPages && (
                  <div className="mt-10 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-2 rounded-full border border-purple-200 bg-white px-10 py-3 text-sm font-semibold text-purple-700 shadow-sm transition hover:bg-purple-50 disabled:opacity-60"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang tải...
                        </>
                      ) : (
                        'Tải thêm việc làm'
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute top-0 right-0 h-full w-full max-w-md overflow-y-auto bg-white shadow-2xl">
            <JobFiltersPanel
              filters={filters}
              onApply={handleFilterChange}
              onClose={() => setShowFilters(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
