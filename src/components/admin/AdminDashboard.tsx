'use client';

import React from 'react';
import {
  Users,
  Briefcase,
  Building2,
  FileText,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  Calendar,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { StatsCard } from './dashboard/StatsCard';
import { RecentActivity } from './dashboard/RecentActivity';

export function AdminDashboard() {
  // Mock data - replace with real data from API
  const stats = [
    {
      title: 'Tổng người dùng',
      value: '12,345',
      change: 12.5,
      icon: Users,
      description: 'Tăng 1,234 so với tháng trước',
    },
    {
      title: 'Việc làm đang tuyển',
      value: '3,456',
      change: -5.2,
      icon: Briefcase,
      description: 'Giảm 182 so với tháng trước',
    },
    {
      title: 'Nhà tuyển dụng',
      value: '1,234',
      change: 8.7,
      icon: Building2,
      description: 'Tăng 98 so với tháng trước',
    },
    {
      title: 'Đơn ứng tuyển',
      value: '45,678',
      change: 23.1,
      icon: FileText,
      description: 'Tăng 8,567 so với tháng trước',
    },
  ];

  const topJobs = [
    { title: 'Senior React Developer', company: 'Tech Corp', applications: 234, progress: 80 },
    { title: 'UI/UX Designer', company: 'Design Studio', applications: 189, progress: 65 },
    { title: 'Backend Engineer', company: 'Startup XYZ', applications: 156, progress: 52 },
    { title: 'Product Manager', company: 'Big Company', applications: 145, progress: 48 },
    { title: 'Data Scientist', company: 'AI Solutions', applications: 123, progress: 41 },
  ];

  const topEmployers = [
    { name: 'Tech Corp', jobs: 45, applications: 1234, logo: '🏢' },
    { name: 'Design Studio', jobs: 32, applications: 987, logo: '🎨' },
    { name: 'Startup XYZ', jobs: 28, applications: 876, logo: '🚀' },
    { name: 'Big Company', jobs: 25, applications: 765, logo: '🏛️' },
    { name: 'AI Solutions', jobs: 23, applications: 654, logo: '🤖' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Xin chào Admin, đây là tổng quan hệ thống của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="mr-2 h-4 w-4" />
            Tháng này
          </Button>
          <Button variant="outline" size="sm">
            <Clock className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top Jobs Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="text-primary h-5 w-5" />
              Top việc làm nhiều ứng tuyển
            </CardTitle>
            <CardDescription>5 việc làm có nhiều người ứng tuyển nhất</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topJobs.map((job, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{job.title}</p>
                    <p className="text-muted-foreground text-sm">{job.company}</p>
                  </div>
                  <span className="text-sm font-medium">{job.applications} ứng tuyển</span>
                </div>
                <Progress value={job.progress} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Employers Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="text-primary h-5 w-5" />
              Top nhà tuyển dụng
            </CardTitle>
            <CardDescription>Nhà tuyển dụng hoạt động tích cực nhất</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topEmployers.map((employer, index) => (
                <div
                  key={index}
                  className="hover:bg-muted flex items-center justify-between rounded-lg p-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{employer.logo}</div>
                    <div>
                      <p className="font-medium">{employer.name}</p>
                      <p className="text-muted-foreground text-sm">{employer.jobs} việc làm</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{employer.applications}</p>
                    <p className="text-muted-foreground text-sm">ứng tuyển</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Quick Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity - Takes 2 columns */}
        <div className="lg:col-span-2">
          <RecentActivity />
        </div>

        {/* Quick Stats */}
        <div className="space-y-6">
          {/* Conversion Rate */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="text-primary h-5 w-5" />
                Tỷ lệ chuyển đổi
              </CardTitle>
              <CardDescription>Tỷ lệ ứng tuyển thành công</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">Phỏng vấn</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <Progress value={68} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">Tuyển dụng</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <Progress value={42} className="h-2" />
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm">Hoàn thành hồ sơ</span>
                    <span className="text-sm font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                Tình trạng hệ thống
              </CardTitle>
              <CardDescription>Hoạt động 24/7</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Response</span>
                  <span className="text-sm font-medium text-green-600">124ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Uptime</span>
                  <span className="text-sm font-medium text-green-600">99.98%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <span className="text-sm font-medium text-green-600">Healthy</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Queue Jobs</span>
                  <span className="text-sm font-medium text-orange-600">1,234</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
