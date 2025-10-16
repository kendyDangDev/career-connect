import { FileText, UserCheck, Calendar, Star, Clock } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Activity {
  id: string;
  type: 'application' | 'interview' | 'rating' | 'status_change';
  title: string;
  description: string;
  time: string;
  avatar?: string;
  jobTitle?: string;
}

const activities: Activity[] = [
  {
    id: '1',
    type: 'application',
    title: 'Nguyễn Văn A đã ứng tuyển',
    description: 'Senior Frontend Developer',
    time: '5 phút trước',
    avatar: 'NA',
    jobTitle: 'Senior Frontend Developer',
  },
  {
    id: '2',
    type: 'interview',
    title: 'Phỏng vấn được lên lịch',
    description: 'Trần Thị B - Product Manager',
    time: '30 phút trước',
    avatar: 'TB',
  },
  {
    id: '3',
    type: 'rating',
    title: 'Đánh giá ứng viên',
    description: 'Lê Văn C được đánh giá 5 sao',
    time: '1 giờ trước',
    avatar: 'LC',
  },
  {
    id: '4',
    type: 'status_change',
    title: 'Trạng thái ứng tuyển thay đổi',
    description: 'Phạm Thị D chuyển sang vòng phỏng vấn',
    time: '2 giờ trước',
    avatar: 'PD',
  },
  {
    id: '5',
    type: 'application',
    title: 'Hoàng Văn E đã ứng tuyển',
    description: 'Backend Developer',
    time: '3 giờ trước',
    avatar: 'HE',
    jobTitle: 'Backend Developer',
  },
];

const activityIcons = {
  application: FileText,
  interview: Calendar,
  rating: Star,
  status_change: UserCheck,
};

const activityColors = {
  application: 'from-blue-500 to-indigo-600',
  interview: 'from-purple-500 to-purple-600',
  rating: 'from-yellow-500 to-orange-600',
  status_change: 'from-green-500 to-emerald-600',
};

export function RecentActivity() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Hoạt động gần đây</h2>
          <p className="text-sm text-gray-500 mt-1">Cập nhật mới nhất về ứng tuyển</p>
        </div>
        <Link 
          href="/employer/activity" 
          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
        >
          Xem tất cả
        </Link>
      </div>

      <div className="space-y-3">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          const gradient = activityColors[activity.type];
          
          return (
            <div
              key={activity.id}
              className="group flex items-start gap-4 rounded-lg border border-gray-100 bg-gradient-to-r from-white to-gray-50/50 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
            >
              {/* Avatar/Icon */}
              <div className="flex flex-col items-center gap-2">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br shadow-sm',
                  gradient
                )}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                {index < activities.length - 1 && (
                  <div className="h-8 w-px bg-gradient-to-b from-gray-200 to-transparent" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-700 transition-colors">
                      {activity.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
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
        })}
      </div>
    </div>
  );
}
