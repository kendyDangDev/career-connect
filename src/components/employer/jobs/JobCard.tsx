import Link from 'next/link';
import {
  Briefcase,
  Eye,
  Users,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  MoreVertical,
  Edit,
  Copy,
  Trash2,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { JobStatusBadge, JobStatus } from './JobStatusBadge';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  type: string;
  location: string;
  salary?: string;
  status: JobStatus;
  applications: number;
  views: number;
  daysLeft: number;
  createdAt: string;
  description?: string;
}

interface JobCardProps {
  job: Job;
  onStatusChange?: (id: string, status: JobStatus) => void;
  onDuplicate?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function JobCard({ job, onStatusChange, onDuplicate, onDelete }: JobCardProps) {
  return (
    <div className="group shadow-soft relative rounded-xl border border-gray-200 bg-white p-6 transition-all duration-200 hover:border-purple-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        {/* Main Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-md">
              <Briefcase className="h-6 w-6 text-white" />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Link
                    href={`/employer/jobs/${job.id}`}
                    className="text-lg font-semibold text-gray-900 transition-colors hover:text-purple-700"
                  >
                    {job.title}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.type}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                    </span>
                    {job.salary && (
                      <span className="flex items-center gap-1 font-semibold text-purple-600">
                        <DollarSign className="h-3.5 w-3.5" />
                        {job.salary}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {job.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{job.description}</p>
              )}

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Users className="h-4 w-4 text-purple-600" />
                  <span className="font-semibold">{job.applications}</span>
                  <span className="text-gray-500">ứng viên</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold">{job.views}</span>
                  <span className="text-gray-500">lượt xem</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-700">
                  <Calendar className="h-4 w-4 text-orange-600" />
                  {job.status === 'ACTIVE' && (
                    <span
                      className={cn(
                        'font-medium',
                        job.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-700'
                      )}
                    >
                      Còn {job.daysLeft} ngày
                    </span>
                  )}
                  {job.status !== 'ACTIVE' && <span className="text-gray-500">Đã tạm dừng</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <JobStatusBadge status={job.status} />

          <div className="group/menu relative">
            <button className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-purple-50 hover:text-purple-600">
              <MoreVertical className="h-5 w-5" />
            </button>

            {/* Dropdown */}
            <div className="invisible absolute top-full right-0 z-9 mt-1 w-52 rounded-lg border border-gray-200 bg-white opacity-0 shadow-lg transition-all duration-200 group-hover/menu:visible group-hover/menu:opacity-100">
              <div className="p-1">
                <Link
                  href={`/employer/jobs/${job.id}/edit`}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa
                </Link>

                <button
                  onClick={() => onDuplicate?.(job.id)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép
                </button>

                <button
                  onClick={() =>
                    onStatusChange?.(job.id, job.status === 'CLOSED' ? 'ACTIVE' : 'CLOSED')
                  }
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
                >
                  {job.status === 'CLOSED' ? (
                    <>
                      <PlayCircle className="h-4 w-4" />
                      Mở lại
                    </>
                  ) : (
                    <>
                      <PauseCircle className="h-4 w-4" />
                      Đóng tuyển dụng
                    </>
                  )}
                </button>

                <div className="my-1 h-px bg-gray-200" />

                <button
                  onClick={() => onDelete?.(job.id)}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa công việc
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
