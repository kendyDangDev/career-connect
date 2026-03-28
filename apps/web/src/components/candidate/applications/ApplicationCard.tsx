'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  Building2,
  CalendarDays,
  Clock3,
  FileText,
  History,
  MapPin,
  MessageSquare,
  Undo2,
  Wallet,
} from 'lucide-react';

import type { CandidateApplicationListItem } from '@/api/candidate/applications.api';
import { Button } from '@/components/ui/button';

import ApplicationStatusBadge, {
  isWithdrawableApplication,
} from './ApplicationStatusBadge';

interface ApplicationCardProps {
  application: CandidateApplicationListItem;
  onMakeChat: (application: CandidateApplicationListItem) => void;
  onOpenTimeline: (application: CandidateApplicationListItem) => void;
  onWithdraw: (application: CandidateApplicationListItem) => void;
  isWithdrawing?: boolean;
}

const workLocationLabels = {
  ONSITE: 'Tại văn phòng',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
} as const;

function formatShortDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function toNumber(value?: number | string | null) {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const normalizedValue = Number(value);
  return Number.isFinite(normalizedValue) ? normalizedValue : null;
}

function formatSalary(application: CandidateApplicationListItem) {
  const minimumSalary = toNumber(application.job.salaryMin);
  const maximumSalary = toNumber(application.job.salaryMax);
  const currency = application.job.currency ?? 'VND';

  if (application.job.salaryNegotiable || (!minimumSalary && !maximumSalary)) {
    return 'Thỏa thuận';
  }

  const formatCurrency = (value: number) => {
    if (currency === 'VND') {
      return `${new Intl.NumberFormat('vi-VN', {
        maximumFractionDigits: 0,
      }).format(value / 1_000_000)} triệu`;
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (minimumSalary && maximumSalary) {
    return `${formatCurrency(minimumSalary)} - ${formatCurrency(maximumSalary)}`;
  }

  if (minimumSalary) {
    return `Từ ${formatCurrency(minimumSalary)}`;
  }

  return `Đến ${formatCurrency(maximumSalary!)}`;
}

function formatLocation(application: CandidateApplicationListItem) {
  const locationParts = [application.job.locationCity, application.job.locationProvince].filter(Boolean);
  const workLocationLabel = application.job.workLocationType
    ? workLocationLabels[application.job.workLocationType]
    : null;

  if (locationParts.length === 0) {
    return workLocationLabel ?? 'Chưa cập nhật địa điểm';
  }

  if (workLocationLabel && application.job.workLocationType !== 'ONSITE') {
    return `${locationParts.join(', ')} · ${workLocationLabel}`;
  }

  return locationParts.join(', ');
}

export default function ApplicationCard({
  application,
  onMakeChat,
  onOpenTimeline,
  onWithdraw,
  isWithdrawing = false,
}: ApplicationCardProps) {
  const canWithdraw = isWithdrawableApplication(application.status);
  const companyInitial = application.job.company.companyName.charAt(0).toUpperCase();

  return (
    <article className="group overflow-hidden rounded-[28px] border border-purple-100 bg-white/95 p-6 shadow-sm shadow-purple-900/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-900/10">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-purple-100 bg-purple-50">
              {application.job.company.logoUrl ? (
                <img
                  src={application.job.company.logoUrl}
                  alt={application.job.company.companyName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-lg font-semibold text-purple-700">{companyInitial}</span>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-slate-900">
                  {application.job.title}
                </h3>
                <ApplicationStatusBadge status={application.status} />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Building2 className="h-4 w-4 text-purple-400" />
                <span className="font-medium">{application.job.company.companyName}</span>
              </div>
            </div>
          </div>

          <Button
            asChild
            variant="outline"
            className="border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100"
          >
            <Link href={`/candidate/jobs/${application.jobId}`}>
              Xem tin
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 rounded-3xl border border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="flex items-start gap-3">
            <MapPin className="mt-0.5 h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Địa điểm
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatLocation(application)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Wallet className="mt-0.5 h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Mức lương
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatSalary(application)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 className="mt-0.5 h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Ngày ứng tuyển
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {formatShortDate(application.appliedAt)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 h-4 w-4 text-purple-500" />
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Lịch phỏng vấn
              </p>
              <p className="mt-1 text-sm font-medium text-slate-700">
                {application.interviewScheduledAt
                  ? formatShortDate(application.interviewScheduledAt)
                  : 'Chưa lên lịch'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {application.cvFileUrl && (
            <Button
              asChild
              variant="outline"
              className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            >
              <a href={application.cvFileUrl} target="_blank" rel="noreferrer">
                <FileText className="h-4 w-4" />
                Xem CV đã nộp
              </a>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            className="border-purple-200 bg-purple-50/70 text-purple-700 hover:bg-purple-100"
            onClick={() => onMakeChat(application)}
          >
            <MessageSquare className="h-4 w-4" />
            Trao đổi với công ty
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="text-slate-700 hover:bg-purple-50 hover:text-purple-700"
            onClick={() => onOpenTimeline(application)}
          >
            <History className="h-4 w-4" />
            Lịch sử trạng thái
          </Button>

          {canWithdraw && (
            <Button
              type="button"
              variant="outline"
              className="ml-auto border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100"
              onClick={() => onWithdraw(application)}
              disabled={isWithdrawing}
            >
              <Undo2 className="h-4 w-4" />
              {isWithdrawing ? 'Đang xử lý...' : 'Rút hồ sơ'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
