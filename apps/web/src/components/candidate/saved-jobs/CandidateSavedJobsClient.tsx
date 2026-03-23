'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RefreshCw, Sparkles } from 'lucide-react';

import type {
  CandidateSavedJobListItem,
  CandidateSavedJobsApplicationStatus,
} from '@/api/candidate/saved-jobs.api';
import { useCandidateSavedJobs, useRemoveSavedJob } from '@/hooks/candidate/useSavedJobs';
import { Button } from '@/components/ui/button';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import EmptySavedJobs from './EmptySavedJobs';
import SavedJobCard from './SavedJobCard';
import SavedJobsFilters from './SavedJobsFilters';
import SavedJobsSkeleton from './SavedJobsSkeleton';

const DEFAULT_LIMIT = 6;
const DEFAULT_APPLICATION_STATUS = 'all' as const;
const DEFAULT_SORT_BY = 'savedAt' as const;
const DEFAULT_SORT_ORDER = 'desc' as const;
const LEGACY_FILTER_KEYS = [
  'jobType[]',
  'workLocationType[]',
  'experienceLevel[]',
  'salaryMin',
  'salaryMax',
  'locationProvince',
] as const;

function getValidDeadline(date?: string | null) {
  if (!date) {
    return null;
  }

  const parsedDate = new Date(date);
  return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

function isDeadlineOpen(date?: string | null) {
  const deadline = getValidDeadline(date);
  if (!deadline) {
    return false;
  }

  return deadline.getTime() >= Date.now();
}

function isApplicationExpired(date?: string | null) {
  const deadline = getValidDeadline(date);
  if (!deadline) {
    return false;
  }

  return deadline.getTime() < Date.now();
}

function normalizePage(value: string | null) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : 1;
}

function normalizeLimit(value: string | null) {
  const parsedValue = Number(value);
  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : DEFAULT_LIMIT;
}

function normalizeSortBy(value: string | null): 'savedAt' | 'deadline' | 'salary' | 'jobTitle' {
  return value === 'deadline' || value === 'salary' || value === 'jobTitle'
    ? value
    : DEFAULT_SORT_BY;
}

function normalizeSortOrder(value: string | null): 'asc' | 'desc' {
  return value === 'asc' ? 'asc' : DEFAULT_SORT_ORDER;
}

function normalizeApplicationStatus(value: string | null): CandidateSavedJobsApplicationStatus {
  return value === 'open' || value === 'expired' ? value : DEFAULT_APPLICATION_STATUS;
}

function buildPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, 'ellipsis-right', totalPages] as const;
  }

  if (currentPage >= totalPages - 2) {
    return [
      1,
      'ellipsis-left',
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ] as const;
  }

  return [
    1,
    'ellipsis-left',
    currentPage - 1,
    currentPage,
    currentPage + 1,
    'ellipsis-right',
    totalPages,
  ] as const;
}

export default function CandidateSavedJobsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouting, startTransition] = useTransition();

  const page = normalizePage(searchParams.get('page'));
  const limit = normalizeLimit(searchParams.get('limit'));
  const search = (searchParams.get('search') || '').trim();
  const applicationStatus = normalizeApplicationStatus(searchParams.get('applicationStatus'));
  const sortBy = normalizeSortBy(searchParams.get('sortBy'));
  const sortOrder = normalizeSortOrder(searchParams.get('sortOrder'));

  const [draftSearch, setDraftSearch] = useState(search);

  useEffect(() => {
    setDraftSearch(search);
  }, [search]);

  const queryParams = useMemo(
    () => ({
      page,
      limit,
      search: search || undefined,
      applicationStatus,
      sortBy,
      sortOrder,
    }),
    [applicationStatus, limit, page, search, sortBy, sortOrder]
  );

  const { data, isLoading, isFetching, error, refetch } = useCandidateSavedJobs(queryParams);
  const totalSavedQuery = useCandidateSavedJobs({ page: 1, limit: 1 });
  const removeSavedJobMutation = useRemoveSavedJob();

  const savedJobs = data?.savedJobs ?? [];
  const pagination = data?.pagination;
  const totalSavedJobs = totalSavedQuery.data?.pagination.total ?? pagination?.total ?? 0;
  const filteredTotal = pagination?.total ?? 0;
  const jobsWithOpenDeadline = savedJobs.filter((savedJob) =>
    isDeadlineOpen(savedJob.job.applicationDeadline)
  ).length;
  const hasActiveFilters =
    Boolean(search) ||
    applicationStatus !== DEFAULT_APPLICATION_STATUS ||
    sortBy !== DEFAULT_SORT_BY ||
    sortOrder !== DEFAULT_SORT_ORDER;

  const errorMessage =
    error instanceof Error ? error.message : 'Không thể tải danh sách việc làm đã lưu.';

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('limit', String(limit));

    LEGACY_FILTER_KEYS.forEach((key) => {
      nextSearchParams.delete(key);
    });

    Object.keys(updates).forEach((key) => {
      nextSearchParams.delete(key);
    });

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '') {
        return;
      }

      nextSearchParams.set(key, value);
    });

    const nextQueryString = nextSearchParams.toString();

    startTransition(() => {
      router.replace(nextQueryString ? `${pathname}?${nextQueryString}` : pathname, {
        scroll: false,
      });
    });
  };

  const applyDraftFilters = () => {
    updateQueryParams({
      search: draftSearch.trim() || null,
      page: null,
    });
  };

  const getDraftSearchParam = () => draftSearch.trim() || null;

  const clearFilters = () => {
    setDraftSearch('');

    updateQueryParams({
      search: null,
      applicationStatus: null,
      sortBy: null,
      sortOrder: null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateQueryParams({
      page: nextPage <= 1 ? null : String(nextPage),
    });
  };

  const handleRemoveSavedJob = async (savedJob: CandidateSavedJobListItem) => {
    const willGoToPreviousPage = savedJobs.length === 1 && page > 1;

    try {
      await removeSavedJobMutation.mutateAsync({
        savedJobId: savedJob.id,
        jobId: savedJob.job.id,
      });

      if (willGoToPreviousPage) {
        handlePageChange(page - 1);
      }
    } catch {
      return;
    }
  };

  const pageItems = pagination ? buildPageItems(pagination.page, pagination.totalPages) : [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.16),_transparent_40%),linear-gradient(180deg,#faf5ff_0%,#ffffff_32%,#f8fafc_100%)] pt-20 pb-12">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-[32px] border border-purple-200/70 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-600 px-6 py-8 text-white shadow-2xl shadow-purple-950/10 sm:px-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.22),_transparent_55%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-sm font-medium text-purple-50">
                <Sparkles className="h-4 w-4" />
                Candidate workspace
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Việc làm đã lưu của tôi
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">
                  Tổng hợp những cơ hội bạn quan tâm để theo dõi, so sánh và quay lại ứng tuyển đúng
                  lúc.
                </p>
              </div>
            </div>

            <Button
              asChild
              variant="secondary"
              className="border-0 bg-white text-purple-700 shadow-lg shadow-purple-950/10 hover:bg-purple-50"
            >
              <Link href="/candidate/jobs">Khám phá việc làm</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-purple-900/5 backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Tổng việc làm đã lưu</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-purple-700">
              {totalSavedJobs}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-purple-900/5 backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Kết quả đang hiển thị</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-violet-700">
              {filteredTotal}
            </p>
          </div>
          <div className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-purple-900/5 backdrop-blur">
            <p className="text-sm font-medium text-slate-500">Còn hạn nộp hồ sơ</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-indigo-700">
              {jobsWithOpenDeadline}
            </p>
          </div>
        </section>

        <SavedJobsFilters
          searchValue={draftSearch}
          applicationStatus={applicationStatus}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isBusy={isRouting || isFetching}
          hasActiveFilters={hasActiveFilters}
          onSearchValueChange={setDraftSearch}
          onApplicationStatusChange={(value) => {
            updateQueryParams({
              search: getDraftSearchParam(),
              applicationStatus: value === DEFAULT_APPLICATION_STATUS ? null : value,
              page: null,
            });
          }}
          onSortByChange={(value) => {
            updateQueryParams({
              search: getDraftSearchParam(),
              sortBy: value === DEFAULT_SORT_BY ? null : value,
              page: null,
            });
          }}
          onSortOrderChange={(value) => {
            updateQueryParams({
              search: getDraftSearchParam(),
              sortOrder: value === DEFAULT_SORT_ORDER ? null : value,
              page: null,
            });
          }}
          onClearFilters={clearFilters}
          onApply={applyDraftFilters}
        />

        <section className="space-y-5">
          {isLoading ? (
            <SavedJobsSkeleton />
          ) : error ? (
            <div className="rounded-[30px] border border-rose-200 bg-rose-50/80 px-6 py-14 text-center shadow-sm">
              <p className="mx-auto max-w-lg text-sm leading-6 text-rose-700">{errorMessage}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-5 border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Thử lại
              </Button>
            </div>
          ) : savedJobs.length === 0 ? (
            <EmptySavedJobs hasActiveFilters={hasActiveFilters} onClearFilters={clearFilters} />
          ) : (
            <>
              <div className="grid gap-5">
                {savedJobs.map((savedJob) => (
                  <SavedJobCard
                    key={savedJob.id}
                    savedJob={savedJob}
                    isApplicationExpired={isApplicationExpired(savedJob.job.applicationDeadline)}
                    onRemove={handleRemoveSavedJob}
                    isRemoving={
                      removeSavedJobMutation.isPending &&
                      removeSavedJobMutation.variables?.savedJobId === savedJob.id
                    }
                  />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="rounded-[28px] border border-slate-100 bg-white/95 px-5 py-4 shadow-sm shadow-purple-900/5">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          className={
                            pagination.page <= 1 || isRouting
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            if (pagination.page > 1 && !isRouting) {
                              handlePageChange(pagination.page - 1);
                            }
                          }}
                        />
                      </PaginationItem>

                      {pageItems.map((item, index) => (
                        <PaginationItem key={`saved-jobs-page-${item}-${index}`}>
                          {item === 'ellipsis-left' || item === 'ellipsis-right' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              href="#"
                              isActive={item === pagination.page}
                              onClick={(event) => {
                                event.preventDefault();
                                if (item !== pagination.page && !isRouting) {
                                  handlePageChange(item);
                                }
                              }}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          className={
                            pagination.page >= pagination.totalPages || isRouting
                              ? 'pointer-events-none opacity-50'
                              : undefined
                          }
                          onClick={(event) => {
                            event.preventDefault();
                            if (pagination.page < pagination.totalPages && !isRouting) {
                              handlePageChange(pagination.page + 1);
                            }
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
