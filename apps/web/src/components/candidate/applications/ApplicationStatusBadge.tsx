import { ApplicationStatus } from '@/generated/prisma';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const APPLICATION_STATUS_META = {
  [ApplicationStatus.APPLIED]: {
    label: 'Đã ứng tuyển',
    className: 'border-slate-200 bg-slate-100 text-slate-700',
  },
  [ApplicationStatus.SCREENING]: {
    label: 'Đang sàng lọc',
    className: 'border-violet-200 bg-violet-50 text-violet-700',
  },
  [ApplicationStatus.INTERVIEWING]: {
    label: 'Đang phỏng vấn',
    className: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  [ApplicationStatus.OFFERED]: {
    label: 'Đã nhận offer',
    className: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700',
  },
  [ApplicationStatus.HIRED]: {
    label: 'Trúng tuyển',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  [ApplicationStatus.REJECTED]: {
    label: 'Bị từ chối',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
  [ApplicationStatus.WITHDRAWN]: {
    label: 'Đã rút hồ sơ',
    className: 'border-zinc-200 bg-zinc-100 text-zinc-700',
  },
} satisfies Record<ApplicationStatus, { label: string; className: string }>;

export function getApplicationStatusLabel(status: ApplicationStatus) {
  return APPLICATION_STATUS_META[status].label;
}

export function isWithdrawableApplication(status: ApplicationStatus) {
  return status === ApplicationStatus.APPLIED || status === ApplicationStatus.SCREENING;
}

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  className?: string;
}

export default function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const meta = APPLICATION_STATUS_META[status];

  return (
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-3 py-1 text-[11px] font-semibold tracking-wide',
        meta.className,
        className
      )}
    >
      {meta.label}
    </Badge>
  );
}
