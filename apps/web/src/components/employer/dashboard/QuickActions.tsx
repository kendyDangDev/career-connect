import Link from 'next/link';
import { LucideIcon, Plus, Users, FileText, Calendar, Upload } from 'lucide-react';

interface Action {
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
  gradient: string;
}

const actions: Action[] = [
  {
    label: 'Đăng tin tuyển dụng',
    href: '/employer/jobs/create',
    icon: Plus,
    description: 'Tạo bài đăng tuyển dụng mới',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    label: 'Xem ứng viên',
    href: '/employer/applications',
    icon: Users,
    description: 'Quản lý và đánh giá ứng viên',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    label: 'Phỏng vấn hôm nay',
    href: '/employer/interviews',
    icon: Calendar,
    description: 'Xem lịch phỏng vấn',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    label: 'Tải CV ứng viên',
    href: '/employer/applications?action=import',
    icon: Upload,
    description: 'Nhập CV từ file',
    gradient: 'from-emerald-500 to-teal-600',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Thao tác nhanh</h2>
          <p className="text-sm text-gray-500 mt-1">Các tác vụ thường dùng</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-4 transition-all duration-300 hover:border-purple-300 hover:shadow-md hover:-translate-y-1"
          >
            <div className="relative z-10">
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br ${action.gradient} shadow-md mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">
                {action.label}
              </h3>
              <p className="text-xs text-gray-500">
                {action.description}
              </p>
            </div>
            
            {/* Hover gradient effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          </Link>
        ))}
      </div>
    </div>
  );
}
