'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import {
  ApplicationStatus,
  type ApplicationStatus as ApplicationStatusValue,
} from '@/generated/prisma';
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Loader2,
  RefreshCw,
  SearchX,
  Sparkles,
} from 'lucide-react';

import type { CandidateApplicationListItem } from '@/api/candidate/applications.api';
import {
  useCandidateApplications,
  useCandidateApplicationStats,
  useWithdrawApplication,
} from '@/hooks/candidate/useApplications';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

import ApplicationCard from './ApplicationCard';
import ApplicationTimelineModal from './ApplicationTimelineModal';

type ApplicationsTab = 'all' | 'processing' | 'interviewing' | 'rejected';

const DEFAULT_LIMIT = 6;
const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: ApplicationStatus.APPLIED, label: 'Đã ứng tuyển' },
  { value: ApplicationStatus.SCREENING, label: 'Sàng lọc' },
  { value: ApplicationStatus.INTERVIEWING, label: 'Phỏng vấn' },
  { value: ApplicationStatus.OFFERED, label: 'Đã nhận offer' },
  { value: ApplicationStatus.HIRED, label: 'Trúng tuyển' },
  { value: ApplicationStatus.REJECTED, label: 'Bị từ chối' },
  { value: ApplicationStatus.WITHDRAWN, label: 'Đã rút hồ sơ' },
] as const;

function isValidTab(value: string | null): value is ApplicationsTab {
  return (
    value === 'all' || value === 'processing' || value === 'interviewing' || value === 'rejected'
  );
}

function normalizeTab(value: string | null): ApplicationsTab {
  return isValidTab(value) ? value : 'all';
}

function normalizePage(value: string | null) {
  const parsedPage = Number(value);
  return Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
}

function normalizeLimit(value: string | null) {
  const parsedLimit = Number(value);
  return Number.isInteger(parsedLimit) && parsedLimit > 0 ? parsedLimit : DEFAULT_LIMIT;
}

function normalizeDateValue(value: string | null) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : '';
}

function normalizeStatusValue(value: string | null): ApplicationStatusValue | 'all' {
  if (!value) {
    return 'all';
  }

  return Object.values(ApplicationStatus).includes(value as ApplicationStatusValue)
    ? (value as ApplicationStatusValue)
    : 'all';
}

function getStatusesFromTab(tab: ApplicationsTab): ApplicationStatusValue[] | undefined {
  if (tab === 'processing') {
    return [ApplicationStatus.APPLIED, ApplicationStatus.SCREENING];
  }

  if (tab === 'interviewing') {
    return [ApplicationStatus.INTERVIEWING];
  }

  if (tab === 'rejected') {
    return [ApplicationStatus.REJECTED];
  }

  return undefined;
}

function getStatusCount(
  byStatus: Partial<Record<ApplicationStatusValue, number>> | undefined,
  status: ApplicationStatusValue
) {
  return byStatus?.[status] ?? 0;
}

export default function CandidateApplicationsClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isRouting, startTransition] = useTransition();
  const [timelineApplication, setTimelineApplication] =
    useState<CandidateApplicationListItem | null>(null);

  const tab = normalizeTab(searchParams.get('tab'));
  const page = normalizePage(searchParams.get('page'));
  const limit = normalizeLimit(searchParams.get('limit'));
  const statusFilter = normalizeStatusValue(searchParams.get('status'));
  const dateFrom = normalizeDateValue(searchParams.get('dateFrom'));
  const dateTo = normalizeDateValue(searchParams.get('dateTo'));
  const activeStatuses = statusFilter !== 'all' ? [statusFilter] : getStatusesFromTab(tab);

  const {
    data: applicationsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useCandidateApplications({
    page,
    limit,
    statuses: activeStatuses,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const { data: statsData, isLoading: isStatsLoading } = useCandidateApplicationStats({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  const withdrawMutation = useWithdrawApplication();
  const withdrawingApplicationId = withdrawMutation.variables;
  const applications = applicationsData?.applications ?? [];
  const pagination = applicationsData?.pagination;
  const totalApplications = statsData?.total ?? 0;
  const processingCount =
    getStatusCount(statsData?.byStatus, ApplicationStatus.APPLIED) +
    getStatusCount(statsData?.byStatus, ApplicationStatus.SCREENING);
  const interviewingCount = getStatusCount(statsData?.byStatus, ApplicationStatus.INTERVIEWING);
  const rejectedCount = getStatusCount(statsData?.byStatus, ApplicationStatus.REJECTED);
  const hasActiveFilters =
    tab !== 'all' || statusFilter !== 'all' || Boolean(dateFrom) || Boolean(dateTo);
  const errorMessage =
    error instanceof Error ? error.message : 'Không thể tải danh sách ứng tuyển.';

  const updateQueryParams = (updates: Record<string, string | null>) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set('limit', String(limit));

    Object.entries(updates).forEach(([key, value]) => {
      if (!value) {
        nextSearchParams.delete(key);
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

  const handleTabChange = (nextTab: string) => {
    if (!isValidTab(nextTab)) {
      return;
    }

    updateQueryParams({
      tab: nextTab === 'all' ? null : nextTab,
      status: null,
      page: null,
    });
  };

  const handleStatusFilterChange = (value: string) => {
    const nextStatus = normalizeStatusValue(value);

    updateQueryParams({
      status: nextStatus === 'all' ? null : nextStatus,
      tab: nextStatus === 'all' && tab !== 'all' ? tab : null,
      page: null,
    });
  };

  const handleDateChange = (field: 'dateFrom' | 'dateTo', value: string) => {
    updateQueryParams({
      [field]: value || null,
      page: null,
    });
  };

  const handlePageChange = (nextPage: number) => {
    updateQueryParams({
      page: nextPage <= 1 ? null : String(nextPage),
    });
  };

  const clearFilters = () => {
    updateQueryParams({
      tab: null,
      status: null,
      dateFrom: null,
      dateTo: null,
      page: null,
    });
  };

  const handleWithdraw = (application: CandidateApplicationListItem) => {
    const shouldWithdraw = window.confirm(`Rút hồ sơ cho vị trí "${application.job.title}"?`);

    if (!shouldWithdraw) {
      return;
    }

    withdrawMutation.mutate(application.id);
  };

  return (
    <>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.14),_transparent_45%),linear-gradient(180deg,#f8f5ff_0%,#ffffff_32%,#f8fafc_100%)] pt-20 pb-12">
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
                    Việc làm đã ứng tuyển
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-purple-100 sm:text-base">
                    Theo dõi tiến trình hồ sơ, xem lại CV đã gửi và quản lý các cơ hội bạn đã nộp.
                  </p>
                </div>
              </div>

              <Button
                asChild
                variant="secondary"
                className="border-0 bg-white text-purple-700 shadow-lg shadow-purple-950/10 hover:bg-purple-50"
              >
                <Link href="/candidate/jobs">Tìm kiếm việc làm</Link>
              </Button>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: 'Tổng đã ứng tuyển', value: totalApplications, accent: 'text-purple-700' },
              { label: 'Đang xử lý', value: processingCount, accent: 'text-violet-700' },
              { label: 'Phỏng vấn', value: interviewingCount, accent: 'text-amber-700' },
              { label: 'Từ chối', value: rejectedCount, accent: 'text-rose-700' },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-[28px] border border-white/80 bg-white/90 p-5 shadow-sm shadow-purple-900/5 backdrop-blur"
              >
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                {isStatsLoading ? (
                  <Skeleton className="mt-3 h-9 w-24 rounded-xl" />
                ) : (
                  <p className={`mt-3 text-3xl font-semibold tracking-tight ${item.accent}`}>
                    {item.value}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="rounded-[30px] border border-purple-100 bg-white/95 p-5 shadow-sm shadow-purple-900/5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <Tabs value={tab} onValueChange={handleTabChange} className="w-full xl:w-auto">
                <TabsList className="h-auto flex-wrap rounded-2xl bg-purple-50 p-1.5">
                  <TabsTrigger
                    value="all"
                    className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700"
                  >
                    Tất cả ({totalApplications})
                  </TabsTrigger>
                  <TabsTrigger
                    value="processing"
                    className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700"
                  >
                    Đang xử lý ({processingCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="interviewing"
                    className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700"
                  >
                    Phỏng vấn ({interviewingCount})
                  </TabsTrigger>
                  <TabsTrigger
                    value="rejected"
                    className="rounded-xl px-4 py-2 data-[state=active]:bg-white data-[state=active]:text-purple-700"
                  >
                    Đã từ chối ({rejectedCount})
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  className="text-slate-600 hover:bg-purple-50 hover:text-purple-700"
                  onClick={clearFilters}
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>

            <div className="mt-5 grid gap-4 rounded-[26px] border border-slate-100 bg-slate-50/80 p-4 lg:grid-cols-[1fr_1fr_220px]">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Ngày ứng tuyển từ
                </label>
                <Input
                  type="date"
                  value={dateFrom}
                  max={dateTo || undefined}
                  className="border-slate-200 bg-white"
                  onChange={(event) => handleDateChange('dateFrom', event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Ngày ứng tuyển đến
                </label>
                <Input
                  type="date"
                  value={dateTo}
                  min={dateFrom || undefined}
                  className="border-slate-200 bg-white"
                  onChange={(event) => handleDateChange('dateTo', event.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  Trạng thái chi tiết
                </label>
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="border-slate-200 bg-white">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_FILTER_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Danh sách ứng tuyển
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {pagination?.total ?? 0} hồ sơ phù hợp với bộ lọc hiện tại.
                </p>
              </div>

              {(isRouting || isFetching) && (
                <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-slate-500 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  Đang cập nhật
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="grid gap-5">
                <Skeleton className="h-72 rounded-[28px]" />
                <Skeleton className="h-72 rounded-[28px]" />
                <Skeleton className="h-72 rounded-[28px]" />
              </div>
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
            ) : applications.length === 0 ? (
              <div className="rounded-[32px] border border-dashed border-purple-200 bg-white/90 px-6 py-16 text-center shadow-sm shadow-purple-900/5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 text-purple-600">
                  <SearchX className="h-7 w-7" />
                </div>
                <h3 className="mt-5 text-xl font-semibold text-slate-900">
                  {hasActiveFilters
                    ? 'Không có hồ sơ phù hợp với bộ lọc hiện tại'
                    : 'Bạn chưa ứng tuyển công việc nào'}
                </h3>
                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  {hasActiveFilters
                    ? 'Thử điều chỉnh khoảng thời gian hoặc trạng thái để xem thêm kết quả.'
                    : 'Khi bạn ứng tuyển công việc mới, toàn bộ tiến trình xử lý hồ sơ sẽ xuất hiện tại đây.'}
                </p>
                <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <Button asChild className="bg-purple-600 text-white hover:bg-purple-700">
                    <Link href="/candidate/jobs">
                      <Briefcase className="h-4 w-4" />
                      Tìm kiếm việc làm
                    </Link>
                  </Button>
                  {hasActiveFilters && (
                    <Button
                      type="button"
                      variant="outline"
                      className="border-slate-200 bg-white"
                      onClick={clearFilters}
                    >
                      Xóa bộ lọc
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="grid gap-5">
                  {applications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onOpenTimeline={setTimelineApplication}
                      onWithdraw={handleWithdraw}
                      isWithdrawing={
                        withdrawMutation.isPending && withdrawingApplicationId === application.id
                      }
                    />
                  ))}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <div className="flex flex-col items-center justify-between gap-4 rounded-[28px] border border-slate-100 bg-white/95 px-5 py-4 shadow-sm sm:flex-row">
                    <p className="text-sm text-slate-500">
                      Trang <span className="font-semibold text-slate-900">{pagination.page}</span>{' '}
                      /{' '}
                      <span className="font-semibold text-slate-900">{pagination.totalPages}</span>
                    </p>

                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="border-slate-200 bg-white"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1 || isRouting}
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Trước
                      </Button>
                      <Button
                        type="button"
                        className="bg-purple-600 text-white hover:bg-purple-700"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages || isRouting}
                      >
                        Sau
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>

      <ApplicationTimelineModal
        application={timelineApplication}
        open={Boolean(timelineApplication)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setTimelineApplication(null);
          }
        }}
      />
    </>
  );
}
