'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { JobCardData } from '../home/JobCard';
import SearchFilterSection from './SearchFilterSection';
import JobResultsHeader from './JobResultsHeader';
import ModernJobCard from './ModernJobCard';
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
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const [error, setError] = useState(false);

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
    router.replace(`/candidate/jobs${qs ? `?${qs}` : ''}`, { scroll: false });
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
  }, []);

  // Clear all
  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12, sortBy: 'publishedAt', sortOrder: 'desc' });
    setInputValue('');
  }, []);

  // Active filter count
  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(
      ([key, value]) =>
        !['page', 'limit', 'sortBy', 'sortOrder'].includes(key) && value !== undefined
    ).length;
  }, [filters]);

  // Handle sort change
  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      {/* Advanced Search Section */}
      <SearchFilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
        searchValue={inputValue}
        onSearchChange={setInputValue}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Job Results */}
      <main className="flex-1 px-6 pb-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl border border-purple-100 bg-white p-6"
                >
                  <div className="flex gap-6">
                    <div className="h-20 w-20 rounded-2xl bg-slate-200" />
                    <div className="flex-1 space-y-3">
                      <div className="h-6 w-1/3 rounded bg-slate-200" />
                      <div className="h-4 w-1/4 rounded bg-slate-200" />
                      <div className="flex gap-4">
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                        <div className="h-4 w-24 rounded bg-slate-200" />
                      </div>
                    </div>
                    <div className="w-32 space-y-3">
                      <div className="h-8 rounded bg-slate-200" />
                      <div className="h-10 rounded-xl bg-slate-200" />
                    </div>
                  </div>
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
                className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all hover:bg-purple-700"
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
                className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all hover:bg-purple-700"
              >
                Xóa bộ lọc
              </button>
            </div>
          ) : (
            <>
              <JobResultsHeader
                totalJobs={pagination.total}
                sortBy={filters.sortBy || 'publishedAt'}
                sortOrder={filters.sortOrder || 'desc'}
                onSortChange={handleSortChange}
              />

              <div className="space-y-4">
                {jobs.map((job, index) => (
                  <ModernJobCard key={job.id} job={job} isUrgent={index === 0} />
                ))}
              </div>

              {/* Load More */}
              {pagination.page < pagination.totalPages && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="group flex items-center gap-3 rounded-2xl border border-purple-100 bg-white px-12 py-4 font-black text-purple-600 shadow-sm transition-all hover:bg-purple-50 disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        Load More Opportunities
                        <ChevronDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
