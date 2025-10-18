import { FileText, UserCheck, Calendar, Star, Clock, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { RecentActivity as ActivityType } from '@/types/employer/dashboard.types';

interface RecentActivityProps {
  activities: ActivityType[];
  isLoading?: boolean;
}

const activityIcons = {
  application: FileText,
  interview: Calendar,
  rating: Star,
  status_change: UserCheck,
  job_posted: Briefcase,
};

const activityColors = {
  application: 'from-blue-500 to-indigo-600',
  interview: 'from-purple-500 to-purple-600',
  rating: 'from-yellow-500 to-orange-600',
  status_change: 'from-green-500 to-emerald-600',
  job_posted: 'from-cyan-500 to-blue-600',
};

export function RecentActivity({ activities, isLoading }: RecentActivityProps) {
  return (
    <div className="shadow-soft rounded-xl border border-purple-50 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
          <p className="mt-1 text-sm text-gray-500">Cập nhật mới nhất về ứng tuyển</p>
        </div>
        <Link
          href="/employer/applications"
          className="text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-3/4 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            </div>
          ))
        ) : activities.length === 0 ? (
          // Empty state
          <div className="py-12 text-center">
            <Clock className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-gray-600">Chưa có hoạt động nào</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const gradient = activityColors[activity.type];

            return (
              <div
                key={activity.id}
                className="group flex items-start gap-4 rounded-lg border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
              >
                {/* Avatar/Icon */}
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
                      gradient
                    )}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  {index < activities.length - 1 && (
                    <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-transparent" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 transition-colors group-hover:text-purple-700">
                        {activity.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                    </div>
                    {activity.avatar && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-xs font-bold text-purple-700">
                        {activity.avatar}
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {activity.time}
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
