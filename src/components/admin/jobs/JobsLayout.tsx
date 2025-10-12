'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FolderOpen,
  CheckCircle,
  FileText,
  XCircle,
  Clock,
  TrendingUp,
  Plus,
  Filter,
  Download,
  Upload,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TabItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  color?: string;
}

const tabs: TabItem[] = [
  {
    title: 'Tất cả việc làm',
    href: '/admin/jobs',
    icon: FolderOpen,
    badge: '250',
    color: 'purple',
  },
  {
    title: 'Đang tuyển',
    href: '/admin/jobs/active',
    icon: CheckCircle,
    badge: '180',
    color: 'green',
  },
  {
    title: 'Đang chờ duyệt',
    href: '/admin/jobs/pending',
    icon: FileText,
    badge: '8',
    color: 'gray',
  },
  {
    title: 'Hết hạn',
    href: '/admin/jobs/expired',
    icon: Clock,
    badge: '17',
    color: 'orange',
  },
  {
    title: 'Thống kê',
    href: '/admin/jobs/stats',
    icon: TrendingUp,
    color: 'blue',
  },
];

interface JobsLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function JobsLayout({ children, title, description }: JobsLayoutProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/admin/jobs') {
      return pathname === '/admin/jobs';
    }
    return pathname.startsWith(href);
  };

  const getTabColorClasses = (color?: string, active?: boolean) => {
    if (!active) return '';

    switch (color) {
      case 'green':
        return 'from-green-500/20 to-emerald-500/20 border-green-500 text-green-700 dark:text-green-300';
      case 'gray':
        return 'from-gray-500/20 to-slate-500/20 border-gray-500 text-gray-700 dark:text-gray-300';
      case 'red':
        return 'from-red-500/20 to-rose-500/20 border-red-500 text-red-700 dark:text-red-300';
      case 'orange':
        return 'from-orange-500/20 to-amber-500/20 border-orange-500 text-orange-700 dark:text-orange-300';
      case 'blue':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500 text-blue-700 dark:text-blue-300';
      default:
        return 'from-purple-500/20 to-violet-500/20 border-purple-500 text-purple-700 dark:text-purple-300';
    }
  };

  const getIconColorClasses = (color?: string, active?: boolean) => {
    if (!active) return 'text-gray-500';

    switch (color) {
      case 'green':
        return 'text-green-600 dark:text-green-400';
      case 'gray':
        return 'text-gray-600 dark:text-gray-400';
      case 'red':
        return 'text-red-600 dark:text-red-400';
      case 'orange':
        return 'text-orange-600 dark:text-orange-400';
      case 'blue':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-purple-600 dark:text-purple-400';
    }
  };

  const getBadgeColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'bg-green-500/20 text-green-700 dark:text-green-300 border-green-500/30';
      case 'gray':
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300 border-gray-500/30';
      case 'red':
        return 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-500/30';
      case 'orange':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30';
      case 'blue':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-500/30';
      default:
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-3xl font-bold text-transparent">
            {title || 'Quản lý việc làm'}
          </h1>
          {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10"
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10"
              >
                <Download className="mr-2 h-4 w-4" />
                Xuất dữ liệu
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Định dạng xuất</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Xuất Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Xuất CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Xuất PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant="outline"
            size="sm"
            className="transition-all hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10"
          >
            <Upload className="mr-2 h-4 w-4" />
            Nhập dữ liệu
          </Button>

          <Button
            size="sm"
            className={cn(
              'bg-gradient-to-r from-purple-600 to-blue-600',
              'hover:from-purple-700 hover:to-blue-700',
              'text-white shadow-lg transition-all hover:shadow-xl'
            )}
            onClick={() => (window.location.href = '/admin/jobs/create')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Tạo việc làm mới
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="relative">
        {/* Background gradient line */}
        <div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent"></div>

        <nav className="flex gap-1 overflow-x-auto pb-px">
          {tabs.map((tab) => {
            const active = isActive(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'group relative flex items-center gap-2 rounded-t-lg px-4 py-3 text-sm font-medium transition-all',
                  'hover:bg-gradient-to-b hover:from-purple-500/10 hover:to-transparent',
                  active && 'bg-gradient-to-b',
                  active && getTabColorClasses(tab.color, active)
                )}
              >
                {/* Active indicator */}
                {active && (
                  <div
                    className={cn(
                      'absolute right-0 bottom-0 left-0 h-1 rounded-t',
                      'bg-gradient-to-r',
                      tab.color === 'green' && 'from-green-500 to-emerald-500',
                      tab.color === 'gray' && 'from-gray-500 to-slate-500',
                      tab.color === 'red' && 'from-red-500 to-rose-500',
                      tab.color === 'orange' && 'from-orange-500 to-amber-500',
                      tab.color === 'blue' && 'from-blue-500 to-cyan-500',
                      (!tab.color || tab.color === 'purple') && 'from-purple-500 to-violet-500'
                    )}
                  />
                )}

                <tab.icon
                  className={cn(
                    'h-4 w-4 transition-colors',
                    getIconColorClasses(tab.color, active)
                  )}
                />

                <span
                  className={cn(
                    'transition-colors',
                    active
                      ? ''
                      : 'text-gray-600 group-hover:text-gray-900 dark:text-gray-400 dark:group-hover:text-gray-100'
                  )}
                >
                  {tab.title}
                </span>

                {tab.badge && (
                  <Badge
                    variant="secondary"
                    className={cn(
                      'ml-1.5 h-5 border px-1.5 text-[10px]',
                      active ? getBadgeColorClasses(tab.color) : 'bg-gray-100 dark:bg-gray-800'
                    )}
                  >
                    {tab.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content Area */}
      <div className="relative">{children}</div>
    </div>
  );
}
