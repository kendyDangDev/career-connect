import { BadgeCheck, PauseCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type JobStatus = 'ACTIVE' | 'PENDING' | 'CLOSED' | 'EXPIRED';

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const map = {
    ACTIVE: {
      label: 'Đang hoạt động',
      className: 'bg-green-100 text-green-700 border-green-200',
      icon: BadgeCheck,
    },
    PENDING: {
      label: 'Đang chờ duyệt',
      className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: PauseCircle,
    },
    CLOSED: {
      label: 'Đã đóng',
      className: 'bg-gray-100 text-gray-700 border-gray-200',
      icon: XCircle,
    },
    EXPIRED: {
      label: 'Hết hạn',
      className: 'bg-red-100 text-red-700 border-red-200',
      icon: XCircle,
    },
  } as const;

  const cfg = map[status];
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        cfg.className
      )}
    >
      <Icon className="h-3.5 w-3.5" /> {cfg.label}
    </span>
  );
}
