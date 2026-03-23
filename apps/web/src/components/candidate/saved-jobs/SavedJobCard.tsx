import Link from 'next/link';
import {
  ArrowUpRight,
  AlertTriangle,
  BookmarkX,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Clock3,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';

import type { CandidateSavedJobListItem } from '@/api/candidate/saved-jobs.api';
import { Button } from '@/components/ui/button';

interface SavedJobCardProps {
  savedJob: CandidateSavedJobListItem;
  isApplicationExpired?: boolean;
  onRemove: (savedJob: CandidateSavedJobListItem) => void;
  isRemoving?: boolean;
}

function normalizeMoneyValue(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? null : numericValue;
}

function formatSalary(
  min?: number | string | null,
  max?: number | string | null,
  currency: string | null | undefined = 'VND',
  salaryNegotiable?: boolean
) {
  if (salaryNegotiable) {
    return 'Thỏa thuận';
  }

  const normalizedMin = normalizeMoneyValue(min);
  const normalizedMax = normalizeMoneyValue(max);

  if (!normalizedMin && !normalizedMax) {
    return 'Thỏa thuận';
  }

  const formatter = (amount: number) =>
    currency === 'VND' ? `${Math.round(amount / 1_000_000)} triệu` : `$${Math.round(amount / 1000)}k`;

  if (normalizedMin && normalizedMax) {
    return `${formatter(normalizedMin)} - ${formatter(normalizedMax)}`;
  }

  if (normalizedMin) {
    return `Từ ${formatter(normalizedMin)}`;
  }

  return `Đến ${formatter(normalizedMax!)}`;
}

function formatDate(date?: string | null) {
  if (!date) {
    return null;
  }

  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function getJobTypeLabel(value: string) {
  const labels: Record<string, string> = {
    FULL_TIME: 'Toàn thời gian',
    PART_TIME: 'Bán thời gian',
    CONTRACT: 'Hợp đồng',
    INTERNSHIP: 'Thực tập',
  };

  return labels[value] || value;
}

function getLocationTypeLabel(value: string) {
  const labels: Record<string, string> = {
    ONSITE: 'Onsite',
    REMOTE: 'Remote',
    HYBRID: 'Hybrid',
  };

  return labels[value] || value;
}

function getExperienceLabel(value: string) {
  const labels: Record<string, string> = {
    ENTRY: 'Mới đi làm',
    MID: 'Trung cấp',
    SENIOR: 'Senior',
    LEAD: 'Lead',
    EXECUTIVE: 'Quản lý',
  };

  return labels[value] || value;
}

export default function SavedJobCard({
  savedJob,
  isApplicationExpired = false,
  onRemove,
  isRemoving = false,
}: SavedJobCardProps) {
  const { job } = savedJob;
  const location = job.locationProvince || job.locationCity || job.company.province || 'Remote';
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency, job.salaryNegotiable);
  const savedDate = formatDate(savedJob.createdAt);
  const deadline = formatDate(job.applicationDeadline);

  return (
    <article
      className={`overflow-hidden rounded-[28px] border shadow-sm ${
        isApplicationExpired
          ? 'border-rose-200 bg-gradient-to-br from-rose-50/95 via-white to-white shadow-rose-900/5'
          : 'border-purple-100 bg-white/95 shadow-purple-900/5'
      }`}
    >
      <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border ${
              isApplicationExpired
                ? 'border-rose-100 bg-rose-50'
                : 'border-purple-100 bg-purple-50'
            }`}
          >
            {job.company.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company.logoUrl}
                alt={job.company.companyName}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-purple-500" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isApplicationExpired
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-purple-50 text-purple-700'
                }`}
              >
                Đã lưu {savedDate}
              </span>
              {isApplicationExpired && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Đã hết hạn ứng tuyển
                </span>
              )}
              {job.featured && (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Nổi bật
                </span>
              )}
              {job.urgent && (
                <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                  Gấp
                </span>
              )}
            </div>

            <Link
              href={`/candidate/jobs/${job.id}`}
              className="mt-3 block text-2xl font-semibold tracking-tight text-slate-900 transition hover:text-purple-700"
            >
              {job.title}
            </Link>

            {job.company.companySlug ? (
              <Link
                href={`/candidate/companies/${job.company.companySlug}`}
                className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-purple-700"
              >
                <BriefcaseBusiness className="h-4 w-4 text-purple-500" />
                {job.company.companyName}
              </Link>
            ) : (
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                <BriefcaseBusiness className="h-4 w-4 text-purple-500" />
                {job.company.companyName}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {getJobTypeLabel(job.jobType)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {getLocationTypeLabel(job.workLocationType)}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                {getExperienceLabel(job.experienceLevel)}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-purple-500" />
                {location}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                {job._count.applications} ứng tuyển
              </span>
              {deadline && (
                <span
                  className={`inline-flex items-center gap-2 ${
                    isApplicationExpired ? 'font-medium text-rose-600' : ''
                  }`}
                >
                  <CalendarDays
                    className={`h-4 w-4 ${isApplicationExpired ? 'text-rose-500' : 'text-purple-500'}`}
                  />
                  {isApplicationExpired ? `Đã hết hạn từ ${deadline}` : `Hạn nộp ${deadline}`}
                </span>
              )}
              <span className="inline-flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-purple-500" />
                Đăng {formatDate(job.publishedAt || job.createdAt)}
              </span>
            </div>

            {isApplicationExpired && (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Tin tuyển dụng này đã quá hạn nộp hồ sơ. Bạn vẫn có thể xem lại chi tiết hoặc bỏ lưu khỏi danh sách.
              </div>
            )}
          </div>
        </div>

        <div
          className={`flex min-w-[220px] flex-col items-start gap-3 rounded-3xl border p-5 lg:items-end ${
            isApplicationExpired
              ? 'border-rose-100 bg-rose-50/80'
              : 'border-purple-100 bg-purple-50/70'
          }`}
        >
          <div className="w-full lg:text-right">
            <p
              className={`text-xs font-semibold tracking-[0.2em] uppercase ${
                isApplicationExpired ? 'text-rose-500' : 'text-purple-500'
              }`}
            >
              Mức lương
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{salary}</p>
          </div>

          <div className="flex w-full flex-col gap-2">
            <Button
              asChild
              className={`w-full text-white ${
                isApplicationExpired
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              <Link href={`/candidate/jobs/${job.id}`}>
                Xem chi tiết
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              type="button"
              variant="outline"
              className={`w-full bg-white ${
                isApplicationExpired
                  ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                  : 'border-purple-200 text-purple-700 hover:bg-purple-50'
              }`}
              onClick={() => onRemove(savedJob)}
              disabled={isRemoving}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Đang xử lý
                </>
              ) : (
                <>
                  <BookmarkX className="h-4 w-4" />
                  Bỏ lưu
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
