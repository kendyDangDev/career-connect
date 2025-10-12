'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  BriefcaseIcon, 
  ChartBarIcon, 
  PlusIcon, 
  QueueListIcon,
  Cog6ToothIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface AdminJobsLayoutProps {
  children: ReactNode;
}

const AdminJobsLayout: React.FC<AdminJobsLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Tổng quan',
      href: '/admin/jobs',
      icon: ChartBarIcon,
      current: pathname === '/admin/jobs'
    },
    {
      name: 'Danh sách việc làm',
      href: '/admin/jobs/list',
      icon: QueueListIcon,
      current: pathname === '/admin/jobs/list'
    },
    {
      name: 'Tạo việc làm',
      href: '/admin/jobs/create',
      icon: PlusIcon,
      current: pathname === '/admin/jobs/create'
    },
    {
      name: 'Thống kê',
      href: '/admin/jobs/analytics',
      icon: ChartBarIcon,
      current: pathname === '/admin/jobs/analytics'
    },
    {
      name: 'Cài đặt',
      href: '/admin/jobs/settings',
      icon: Cog6ToothIcon,
      current: pathname === '/admin/jobs/settings'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <BriefcaseIcon className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">
                Quản lý Việc làm
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Tạo việc làm mới
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`${
                        item.current
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      } group flex items-center px-3 py-2 text-sm font-medium border-l-4 transition-colors duration-200`}
                    >
                      <Icon
                        className={`${
                          item.current
                            ? 'text-blue-500'
                            : 'text-gray-400 group-hover:text-gray-500'
                        } mr-3 h-5 w-5`}
                      />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Quick Stats */}
          <div className="mt-8 px-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">
                Thống kê nhanh
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Việc làm đang tuyển</span>
                  <span className="font-medium text-green-600">24</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nháp</span>
                  <span className="font-medium text-yellow-600">8</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Hết hạn</span>
                  <span className="font-medium text-red-600">5</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminJobsLayout;