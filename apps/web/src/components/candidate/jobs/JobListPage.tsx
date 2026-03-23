'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Briefcase, Loader2, RefreshCw, ChevronDown } from 'lucide-react';
import { JobCardData } from '../home/JobCard';
import SearchFilterSection from './SearchFilterSection';
import JobResultsHeader from './JobResultsHeader';
import ModernJobCard from './ModernJobCard';
import { useDebounce } from '@/hooks/useDebounced';
import { normalizeVietnamProvinceName } from '@/api/vietnam-provinces.api';

export interface JobListFilters {
  page: number;
  limit: number;
  search?: string;
  jobType?: string;
  experienceLevel?: string;
  locationCity?: string;
  locationProvince?: string;
  salaryMin?: number;
  salaryMax?: number;
  categoryId?: string;
  skills?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface Pagination {
  page: number;
  totalPages: number;
  total: number;
}

const LEGACY_EXPERIENCE_LEVEL_MAP: Record<string, string> = {
  ENTRY_LEVEL: 'ENTRY',
  MID_LEVEL: 'MID',
  SENIOR_LEVEL: 'SENIOR',
};

const normalizeExperienceLevel = (value?: string | null) => {
  if (!value) return undefined;

  const normalizedValue = value.toUpperCase().replace(/-/g, '_');
  return LEGACY_EXPERIENCE_LEVEL_MAP[normalizedValue] ?? normalizedValue;
};

const normalizeSalaryFilterValue = (value?: string | null) => {
  if (!value) return undefined;

  const parsedValue = Number(value);
  if (!Number.isFinite(parsedValue)) return undefined;

  // Legacy salary filters were stored in "thousand" units instead of raw VND.
  if (parsedValue >= 1000 && parsedValue < 1_000_000) {
    return parsedValue * 1000;
  }

  return parsedValue;
};

const parseListFilter = (value?: string | null) => {
  if (!value) return undefined;

  const items = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))];
  return items.length > 0 ? items : undefined;
};

const normalizeSkills = (skills?: string[]) => {
  if (!skills) return undefined;

  const seenSkills = new Set<string>();
  const normalizedSkills = skills.reduce<string[]>((result, skill) => {
    const normalizedSkill = skill.trim().replace(/\s+/g, ' ');
    if (!normalizedSkill) return result;

    const lookupKey = normalizedSkill.toLowerCase();
    if (seenSkills.has(lookupKey)) return result;

    seenSkills.add(lookupKey);
    result.push(normalizedSkill);
    return result;
  }, []);

  return normalizedSkills.length > 0 ? normalizedSkills : undefined;
};

const getNormalizedSalaryRange = (salaryMin?: number, salaryMax?: number) => {
  if (salaryMin !== undefined && salaryMax !== undefined && salaryMin > salaryMax) {
    return {
      salaryMin: salaryMax,
      salaryMax: salaryMin,
    };
  }

  return { salaryMin, salaryMax };
};

export default function JobListPage({ rightSidebar }: { rightSidebar?: React.ReactNode }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<JobListFilters>(() => ({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || undefined,
    jobType: searchParams.get('jobType') || undefined,
    experienceLevel: normalizeExperienceLevel(searchParams.get('experienceLevel')),
    locationCity: searchParams.get('locationCity') || searchParams.get('location') || undefined,
    locationProvince: searchParams.get('locationProvince')
      ? normalizeVietnamProvinceName(searchParams.get('locationProvince')!)
      : undefined,
    salaryMin: normalizeSalaryFilterValue(searchParams.get('salaryMin')),
    salaryMax: normalizeSalaryFilterValue(searchParams.get('salaryMax')),
    categoryId: searchParams.get('categoryId') || undefined,
    skills: parseListFilter(searchParams.get('skills')),
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

  const debouncedInput = useDebounce(inputValue, 500);

  useEffect(() => {
    setFilters((prev) => {
      if (prev.search === (debouncedInput || undefined)) return prev;
      return { ...prev, search: debouncedInput || undefined, page: 1 };
    });
  }, [debouncedInput]);

  const buildParams = useCallback((nextFilters: JobListFilters) => {
    const params = new URLSearchParams();
    const normalizedSkills = normalizeSkills(nextFilters.skills);
    const { salaryMin, salaryMax } = getNormalizedSalaryRange(
      nextFilters.salaryMin,
      nextFilters.salaryMax
    );

    params.set('page', String(nextFilters.page));
    params.set('limit', String(nextFilters.limit));

    if (nextFilters.search) params.set('search', nextFilters.search);
    if (nextFilters.jobType) params.set('jobType', nextFilters.jobType);
    if (nextFilters.experienceLevel) params.set('experienceLevel', nextFilters.experienceLevel);
    if (nextFilters.locationCity) params.set('locationCity', nextFilters.locationCity);
    if (nextFilters.locationProvince)
      params.set('locationProvince', nextFilters.locationProvince);
    if (salaryMin !== undefined) params.set('salaryMin', String(salaryMin));
    if (salaryMax !== undefined) params.set('salaryMax', String(salaryMax));
    if (nextFilters.categoryId) params.set('categoryId', nextFilters.categoryId);
    if (normalizedSkills) params.set('skills', normalizedSkills.join(','));
    if (nextFilters.sortBy) params.set('sortBy', nextFilters.sortBy);
    if (nextFilters.sortOrder) params.set('sortOrder', nextFilters.sortOrder);

    return params;
  }, []);

  const fetchJobs = useCallback(
    async (nextFilters: JobListFilters, append = false) => {
      try {
        setError(false);
        const params = buildParams(nextFilters);
        const response = await fetch(`/api/jobs?${params.toString()}`);

        if (!response.ok) throw new Error('Failed to fetch');

        const data = await response.json();
        const nextJobs: JobCardData[] = data.data?.jobs ?? data.data ?? [];

        setJobs((prevJobs) => (append ? [...prevJobs, ...nextJobs] : nextJobs));
        setPagination({
          page: data.data?.pagination?.page ?? data.pagination?.page ?? nextFilters.page,
          totalPages: data.data?.pagination?.totalPages ?? data.pagination?.totalPages ?? 1,
          total: data.data?.pagination?.total ?? data.pagination?.total ?? nextJobs.length,
        });
      } catch {
        setError(true);
      }
    },
    [buildParams]
  );

  useEffect(() => {
    setLoading(true);
    fetchJobs(filters, false).finally(() => setLoading(false));

    const params = buildParams(filters);
    params.delete('page');
    params.delete('limit');

    const queryString = params.toString();
    router.replace(`/candidate/jobs${queryString ? `?${queryString}` : ''}`, {
      scroll: false,
    });
  }, [filters, fetchJobs, buildParams, router]);

  const handleLoadMore = async () => {
    if (loadingMore || pagination.page >= pagination.totalPages) return;

    setLoadingMore(true);
    const nextFilters = { ...filters, page: pagination.page + 1 };
    await fetchJobs(nextFilters, true);
    setLoadingMore(false);
  };

  const handleSearchSubmit = useCallback((query: string) => {
    setInputValue(query);
    setFilters((prev) => ({ ...prev, search: query || undefined, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((newFilters: Partial<JobListFilters>) => {
    const hasExperienceLevel = Object.prototype.hasOwnProperty.call(
      newFilters,
      'experienceLevel'
    );
    const hasLocationProvince = Object.prototype.hasOwnProperty.call(
      newFilters,
      'locationProvince'
    );
    const hasSkills = Object.prototype.hasOwnProperty.call(newFilters, 'skills');

    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      experienceLevel:
        hasExperienceLevel
          ? normalizeExperienceLevel(newFilters.experienceLevel)
          : prev.experienceLevel,
      locationProvince:
        hasLocationProvince
          ? newFilters.locationProvince
            ? normalizeVietnamProvinceName(newFilters.locationProvince)
            : undefined
          : prev.locationProvince,
      skills: hasSkills ? normalizeSkills(newFilters.skills) : prev.skills,
      page: 1,
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ page: 1, limit: 12, sortBy: 'publishedAt', sortOrder: 'desc' });
    setInputValue('');
  }, []);

  const handleSortChange = useCallback((sortBy: string, sortOrder: 'asc' | 'desc') => {
    setFilters((prev) => ({ ...prev, sortBy, sortOrder, page: 1 }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/30 via-white to-white">
      <SearchFilterSection
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearFilters}
        searchValue={inputValue}
        onSearchChange={setInputValue}
        onSearchSubmit={handleSearchSubmit}
      />

      <main className="flex-1 px-6 pb-20 lg:px-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
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
                  <h3 className="mb-2 text-xl font-bold text-gray-900">Something went wrong</h3>
                  <p className="mb-6 text-gray-500">
                    We could not load the job list. Please try again.
                  </p>
                  <button
                    onClick={() => {
                      setLoading(true);
                      fetchJobs(filters, false).finally(() => setLoading(false));
                    }}
                    className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all hover:bg-purple-700"
                  >
                    Try Again
                  </button>
                </div>
              ) : jobs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-purple-50">
                    <Briefcase className="h-12 w-12 text-purple-300" />
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">No jobs found</h3>
                  <p className="mb-8 max-w-sm text-gray-500">
                    Try adjusting your search criteria or check back later for new opportunities.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    className="rounded-xl bg-purple-600 px-8 py-3 font-bold text-white transition-all hover:bg-purple-700"
                  >
                    Clear Filters
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

            {rightSidebar && (
              <div className="flex flex-col gap-6 lg:col-span-1">
                <div className="sticky top-24">{rightSidebar}</div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
