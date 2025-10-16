import Link from 'next/link';
import { Briefcase, Eye, Users, MoreVertical, Edit, Copy, Trash2, PauseCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'closed';
  applications: number;
  views: number;
  daysLeft: number;
  createdAt: string;
}

const jobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Developer',
    status: 'active',
    applications: 23,
    views: 145,
    daysLeft: 15,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Product Manager',
    status: 'active',
    applications: 18,
    views: 98,
    daysLeft: 7,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    title: 'UI/UX Designer',
    status: 'paused',
    applications: 12,
    views: 67,
    daysLeft: 0,
    createdAt: '2024-01-10',
  },
  {
    id: '4',
    title: 'Backend Developer (Node.js)',
    status: 'active',
    applications: 31,
    views: 203,
    daysLeft: 22,
    createdAt: '2024-01-18',
  },
];

const statusConfig = {
  active: {
    label: 'Đang tuyển',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  paused: {
    label: 'Tạm dừng',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  closed: {
    label: 'Đã đóng',
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
};

export function JobsOverview() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Công việc đang tuyển</h2>
          <p className="text-sm text-gray-500 mt-1">Quản lý các tin tuyển dụng</p>
        </div>
        <Link
          href="/employer/jobs"
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {jobs.map((job) => {
          const status = statusConfig[job.status];
          
          return (
            <div
              key={job.id}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/30 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 shadow-sm">
                      <Briefcase className="h-5 w-5 text-white" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/employer/jobs/${job.id}`}
                        className="font-semibold text-gray-900 hover:text-purple-700 transition-colors"
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
                        {job.status === 'active' && (
                          <span className={cn(
                            'flex items-center gap-1 font-medium',
                            job.daysLeft <= 7 ? 'text-orange-600' : 'text-gray-600'
                          )}>
                            {job.daysLeft} ngày còn lại
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
                    status.className
                  )}>
                    {status.label}
                  </span>
                  
                  <div className="relative group/menu">
                    <button className="rounded-lg p-1.5 text-gray-400 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                    
                    {/* Dropdown Menu */}
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 z-10">
                      <div className="p-1">
                        <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <Edit className="h-4 w-4" />
                          Chỉnh sửa
                        </button>
                        <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <Copy className="h-4 w-4" />
                          Sao chép
                        </button>
                        <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          <PauseCircle className="h-4 w-4" />
                          {job.status === 'paused' ? 'Kích hoạt' : 'Tạm dừng'}
                        </button>
                        <div className="my-1 h-px bg-gray-200" />
                        <button className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
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
        })}
      </div>
    </div>
  );
}
