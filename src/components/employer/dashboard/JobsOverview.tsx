import Link from 'next/link';
import { Briefcase, Eye, Users, MoreVertical, Edit, Copy, Trash2, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardJob } from '@/types/employer/dashboard.types';
import { JobStatus } from '@/generated/prisma';

interface JobsOverviewProps {
  jobs: DashboardJob[];
  isLoading?: boolean;
}

const statusConfig: Record<JobStatus, { label: string; className: string }> = {
  [JobStatus.ACTIVE]: {
    label: 'Đang tuyển',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  // [JobStatus.DRAFT]: {
  //   label: 'Nháp',
  //   className: 'bg-gray-100 text-gray-700 border-gray-200',
  // },
  [JobStatus.CLOSED]: {
    label: 'Đã đóng',
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  [JobStatus.EXPIRED]: {
    label: 'Hết hạn',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
  },
  [JobStatus.PENDING]: {
    label: 'Chờ duyệt',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  // [JobStatus.REJECTED]: {
  //   label: 'Từ chối',
  //   className: 'bg-red-100 text-red-700 border-red-200',
  // },
};

export function JobsOverview({ jobs, isLoading }: JobsOverviewProps) {
  return (
    <div className="shadow-soft rounded-xl border border-purple-50 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Công việc đang tuyển</h2>
          <p className="mt-1 text-sm text-gray-500">Quản lý các tin tuyển dụng</p>
        </div>
        <Link
          href="/employer/jobs"
          className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))
        ) : jobs.length === 0 ? (
          // Empty state
          <div className="py-12 text-center">
            <Briefcase className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-600">Chưa có công việc nào</p>
            <Link
              href="/employer/jobs/new"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-purple-700"
            >
              Tạo tin tuyển dụng
            </Link>
          </div>
        ) : (
          jobs.map((job) => {
            const status = statusConfig[job.status];

            return (
              <div
                key={job.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/30 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Job Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                        <Briefcase className="h-5 w-5 text-white" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/employer/jobs/${job.id}`}
                          className="font-semibold text-gray-900 transition-colors hover:text-purple-700"
                        >
                          {job.title}
                        </Link>

                        <div className="mt-2 flex items-center gap-4 text-xs text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-3.5 w-3.5" />
                            <span>{job.applications} ứng viên</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" />
                            <span>{job.views} lượt xem</span>
                          </div>
                          {job.status === 'ACTIVE' && (
                            <span
                              className={cn(
                                'flex items-center gap-1 font-medium',
                                job?.daysLeft !== null && job?.daysLeft <= 7
                                  ? 'text-orange-600'
                                  : 'text-gray-600'
                              )}
                            >
                              {job.daysLeft === null
                                ? 'Không giới hạn'
                                : job.daysLeft <= 0
                                  ? 'Đã hết hạn'
                                  : `${job.daysLeft} ngày còn lại`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                        status.className
                      )}
                    >
                      {status.label}
                    </span>

                    <div className="group/menu relative">
                      <button className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
                        <MoreVertical className="h-4 w-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <div className="invisible absolute top-full right-0 z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/menu:visible group-hover/menu:opacity-100">
                        <div className="p-1">
                          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700">
                            <Edit className="h-4 w-4" />
                            Chỉnh sửa
                          </button>
                          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700">
                            <Copy className="h-4 w-4" />
                            Sao chép
                          </button>
                          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700">
                            <PauseCircle className="h-4 w-4" />
                            {job.status === 'CLOSED' ? 'Kích hoạt' : 'Đã đóng'}
                          </button>
                          <div className="my-1 h-px bg-gray-200" />
                          <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                            Xóa
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
