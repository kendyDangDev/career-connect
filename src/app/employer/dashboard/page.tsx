'use client';

import { Briefcase, Users, TrendingUp, Eye, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { StatsCard } from '@/components/employer/dashboard/StatsCard';
import { QuickActions } from '@/components/employer/dashboard/QuickActions';
import { JobsOverview } from '@/components/employer/dashboard/JobsOverview';
import { ApplicationsChart } from '@/components/employer/dashboard/ApplicationsChart';
import { RecentActivity } from '@/components/employer/dashboard/RecentActivity';

export default function EmployerDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 p-8 shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-white mb-2">
            Chào mừng trở lại! 👋
          </h1>
          <p className="text-purple-100 text-lg">
            Bạn có <span className="font-semibold text-white">12 ứng viên mới</span> và{' '}
            <span className="font-semibold text-white">3 phỏng vấn</span> hôm nay
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 backdrop-blur-sm" />
        <div className="absolute -right-24 top-16 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm" />
        <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/10 backdrop-blur-sm" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Công việc đang tuyển"
          value={8}
          subtitle="3 sắp hết hạn"
          icon={Briefcase}
          trend={{ value: '+2', isPositive: true }}
          gradient="from-purple-500 to-purple-600"
        />
        <StatsCard
          title="Tổng ứng tuyển"
          value={156}
          subtitle="24 ứng tuyển tuần này"
          icon={Users}
          trend={{ value: '+18%', isPositive: true }}
          gradient="from-blue-500 to-indigo-600"
        />
        <StatsCard
          title="Lượt xem hồ sơ"
          value="2.4K"
          subtitle="Tăng so với tháng trước"
          icon={Eye}
          trend={{ value: '+12%', isPositive: true }}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Tỷ lệ tuyển dụng"
          value="18%"
          subtitle="Cao hơn trung bình 3%"
          icon={TrendingUp}
          trend={{ value: '+3%', isPositive: true }}
          gradient="from-pink-500 to-rose-600"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Jobs Overview - Takes 2 columns */}
        <div className="lg:col-span-2">
          <JobsOverview />
        </div>

        {/* Pipeline Stats */}
        <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
          <h2 className="text-lg font-bold text-gray-900 mb-6">Pipeline ứng viên</h2>
          
          <div className="space-y-4">
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Mới ứng tuyển</span>
                </div>
                <span className="text-sm font-bold text-gray-900">42</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" style={{ width: '70%' }} />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium text-gray-700">Đang xem xét</span>
                </div>
                <span className="text-sm font-bold text-gray-900">28</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500" style={{ width: '47%' }} />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-yellow-500" />
                  <span className="text-sm font-medium text-gray-700">Phỏng vấn</span>
                </div>
                <span className="text-sm font-bold text-gray-900">12</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-500" style={{ width: '20%' }} />
              </div>
            </div>

            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-gray-700">Chấp nhận</span>
                </div>
                <span className="text-sm font-bold text-gray-900">8</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-500" style={{ width: '13%' }} />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Tổng cộng</span>
              <span className="text-2xl font-bold text-purple-600">90</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ApplicationsChart />
        <RecentActivity />
      </div>

      {/* Upcoming Interviews */}
      <div className="rounded-xl bg-white p-6 shadow-soft border border-purple-50">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Lịch phỏng vấn sắp tới</h2>
            <p className="text-sm text-gray-500 mt-1">Các buổi phỏng vấn trong tuần</p>
          </div>
          <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors">
            Xem lịch đầy đủ
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { name: 'Nguyễn Văn A', position: 'Frontend Developer', time: 'Hôm nay, 10:00', status: 'confirmed' },
            { name: 'Trần Thị B', position: 'Product Manager', time: 'Hôm nay, 14:00', status: 'confirmed' },
            { name: 'Lê Văn C', position: 'Backend Developer', time: 'Mai, 9:00', status: 'pending' },
          ].map((interview, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-white to-gray-50/30 p-4 transition-all duration-200 hover:border-purple-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 text-sm font-bold text-purple-700">
                  {interview.name.split(' ')[0][0]}{interview.name.split(' ').pop()?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">{interview.name}</h3>
                  <p className="text-xs text-gray-600 mt-0.5">{interview.position}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    {interview.time}
                  </div>
                </div>
                {interview.status === 'confirmed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-yellow-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerts & Notifications */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500 shadow-md">
              <AlertCircle className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-orange-900">3 công việc sắp hết hạn</h3>
              <p className="text-sm text-orange-700 mt-1">
                Hãy gia hạn hoặc đóng các tin tuyển dụng để tránh mất cơ hội
              </p>
              <button className="mt-3 text-sm font-medium text-orange-700 hover:text-orange-800 underline">
                Xem chi tiết →
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500 shadow-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-900">Hiệu suất tuyển dụng tốt</h3>
              <p className="text-sm text-green-700 mt-1">
                Tỷ lệ tuyển dụng của bạn cao hơn 15% so với trung bình ngành
              </p>
              <button className="mt-3 text-sm font-medium text-green-700 hover:text-green-800 underline">
                Xem báo cáo →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
