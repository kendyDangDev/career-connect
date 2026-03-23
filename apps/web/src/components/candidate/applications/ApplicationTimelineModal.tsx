'use client';

import { Building2, CalendarClock, RefreshCw } from 'lucide-react';

import type { CandidateApplicationListItem } from '@/api/candidate/applications.api';
import { useCandidateApplicationDetail } from '@/hooks/candidate/useApplications';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import ApplicationStatusBadge from './ApplicationStatusBadge';

interface ApplicationTimelineModalProps {
  application: CandidateApplicationListItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function getActorName(applicationUser: {
  firstName?: string | null;
  lastName?: string | null;
  userType: string;
}) {
  const fullName = [applicationUser.firstName, applicationUser.lastName]
    .filter(Boolean)
    .join(' ')
    .trim();

  if (fullName) {
    return fullName;
  }

  if (applicationUser.userType === 'EMPLOYER') {
    return 'Nhà tuyển dụng';
  }

  if (applicationUser.userType === 'CANDIDATE') {
    return 'Ứng viên';
  }

  return 'Hệ thống';
}

export default function ApplicationTimelineModal({
  application,
  open,
  onOpenChange,
}: ApplicationTimelineModalProps) {
  const {
    data: detail,
    isLoading,
    error,
    refetch,
  } = useCandidateApplicationDetail(application?.id, open && Boolean(application?.id));

  const timeline = detail?.timeline
    ? [...detail.timeline].sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
      )
    : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden border-purple-100 bg-white p-0 shadow-2xl shadow-purple-950/10">
        <div className="border-b border-purple-100 bg-gradient-to-r from-purple-700 via-violet-600 to-indigo-600 px-6 py-5 text-white">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-xl font-semibold">
              Lịch sử trạng thái ứng tuyển
            </DialogTitle>
            <DialogDescription className="text-sm text-purple-100">
              Theo dõi tiến trình xử lý hồ sơ cho vị trí bạn đã ứng tuyển.
            </DialogDescription>
          </DialogHeader>

          {application && (
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-purple-50">
              <div className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-1.5">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{application.job.company.companyName}</span>
              </div>
              <div className="rounded-full bg-white/12 px-3 py-1.5 font-medium">
                {application.job.title}
              </div>
            </div>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-6 py-5">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
              <Skeleton className="h-16 rounded-2xl" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-rose-200 bg-rose-50/70 px-6 py-12 text-center">
              <p className="max-w-md text-sm text-rose-700">
                Không thể tải lịch sử trạng thái. Vui lòng thử lại.
              </p>
              <Button
                type="button"
                variant="outline"
                className="border-rose-200 bg-white text-rose-700 hover:bg-rose-50"
                onClick={() => refetch()}
              >
                <RefreshCw className="h-4 w-4" />
                Tải lại
              </Button>
            </div>
          ) : timeline.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
              Chưa có lịch sử cập nhật trạng thái cho hồ sơ này.
            </div>
          ) : (
            <div className="-mx-6 min-h-0 flex-1 overflow-y-auto px-6">
              <div className="space-y-4 pr-3 pb-1">
                {timeline.map((item, index) => (
                  <div key={item.id} className="relative flex gap-4">
                    <div className="flex w-10 flex-col items-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-purple-200 bg-purple-50">
                        <CalendarClock className="h-4 w-4 text-purple-600" />
                      </div>
                      {index < timeline.length - 1 && (
                        <div className="mt-2 h-full min-h-8 w-px bg-gradient-to-b from-purple-200 to-purple-50" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 rounded-2xl border border-purple-100 bg-white p-4 shadow-sm shadow-purple-900/5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-2">
                          <ApplicationStatusBadge status={item.status} />
                          <p className="text-sm font-medium text-slate-900">
                            {getActorName(item.user)} cập nhật trạng thái
                          </p>
                        </div>

                        <p className="text-xs font-medium text-slate-500">
                          {formatDateTime(item.createdAt)}
                        </p>
                      </div>

                      {item.note && (
                        <p className="mt-3 rounded-2xl bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
                          {item.note}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
