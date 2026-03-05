'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  Building2,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Circle,
  TrendingUp,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  FolderOpen,
  FileSearch,
  Star,
  Package,
  DollarSign,
  BarChart3,
  Database,
  Shield,
  Palette,
  Globe,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeKey?: string; // Key để mapping với API data
  children?: NavItem[];
}

interface JobStatistics {
  totalJobs: number;
  activeJobs: number;
  pendingJobs: number;

  closedJobs: number;
  expiredJobs: number;
}

// Function to generate navItems with dynamic data
const getNavItems = (jobStats: JobStatistics | null, isLoading: boolean): NavItem[] => [
  {
    title: 'Dashboard & Analytics',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Quản lý việc làm',
    icon: Briefcase,
    badge: jobStats ? jobStats.totalJobs.toString() : isLoading ? '...' : '0',
    badgeKey: 'totalJobs',
    children: [
      {
        title: 'Tất cả việc làm',
        href: '/admin/jobs/all',
        icon: FolderOpen,
        badge: jobStats ? jobStats.totalJobs.toString() : isLoading ? '...' : '0',
        badgeKey: 'totalJobs',
      },
      {
        title: 'Đang chờ duyệt',
        href: '/admin/jobs/pending',
        icon: Clock,
        badge: jobStats ? jobStats.pendingJobs.toString() : isLoading ? '...' : '0',
        badgeKey: 'pendingJobs',
      },
      {
        title: 'Đã duyệt',
        href: '/admin/jobs/approved',
        icon: CheckCircle,
        badge: jobStats ? jobStats.activeJobs.toString() : isLoading ? '...' : '0',
        badgeKey: 'activeJobs',
      },
      {
        title: 'Hết hạn',
        href: '/admin/jobs/expired',
        icon: Clock,
        badge: jobStats ? jobStats.expiredJobs.toString() : isLoading ? '...' : '0',
        badgeKey: 'expiredJobs',
      },
      // {
      //   title: 'Thống kê',
      //   href: '/admin/jobs/analytics',
      //   icon: TrendingUp,
      // },
    ],
  },
  // {
  //   title: 'Quản lý ứng viên',
  //   icon: Users,
  //   children: [
  {
    title: 'Danh sách ứng viên',
    href: '/admin/candidates',
    icon: Users,
  },
  //     {
  //       title: 'Hồ sơ',
  //       href: '/admin/candidates/profiles',
  //       icon: FileSearch,
  //     },
  //     {
  //       title: 'Đánh giá',
  //       href: '/admin/candidates/reviews',
  //       icon: Star,
  //     },
  //   ],
  // },
  // {
  //   title: 'Báo cáo & Thống kê',
  //   icon: BarChart3,
  //   children: [
  //     {
  //       title: 'Tổng quan',
  //       href: '/admin/reports',
  //       icon: TrendingUp,
  //     },
  //     {
  //       title: 'Doanh thu',
  //       href: '/admin/reports/revenue',
  //       icon: DollarSign,
  //     },
  // {
  //   title: 'Người dùng',
  //   href: '/admin/users',
  //   icon: Users,
  // },
  //     {
  //       title: 'Tuyển dụng',
  //       href: '/admin/reports/recruitment',
  //       icon: Briefcase,
  //     },
  //   ],
  // },
  // {
  //   title: 'Quản lý nhà tuyển dụng',
  //   icon: Building2,
  //   children: [
  {
    title: 'Công ty',
    href: '/admin/companies',
    icon: Building2,
  },
  {
    title: 'Tài khoản',
    href: '/admin/users',
    icon: UserCheck,
  },
  // {
  //   title: 'Gói dịch vụ',
  //   href: '/admin/packages',
  //   icon: Package,
  // },
  //   ],
  // },

  // {
  //   title: 'Cài đặt hệ thống',
  //   icon: Settings,
  //   children: [
  // {
  //   title: 'Cài đặt chung',
  //   href: '/admin/settings',
  //   icon: Settings,
  // },
  // {
  //   title: 'Danh mục hệ thống',
  //   icon: Database,
  //   children: [
  {
    title: 'Ngành nghề',
    href: '/admin/industries',
    icon: Briefcase,
  },
  {
    title: 'Danh mục công việc',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    title: 'Kỹ năng',
    href: '/admin/skills',
    icon: Star,
  },
  // {
  //   title: 'Địa điểm',
  //   href: '/admin/locations',
  //   icon: Globe,
  // },

  // ],
  // },
  // {
  //   title: 'Phân quyền',
  //   href: '/admin/permissions',
  //   icon: Shield,
  // },
  // {
  //   title: 'Giao diện',
  //   href: '/admin/appearance',
  //   icon: Palette,
  // },
  // {
  //   title: 'SEO & Marketing',
  //   href: '/admin/seo',
  //   icon: Globe,
  // },
  //   ],
  // },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);
  const [jobStats, setJobStats] = React.useState<JobStatistics | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Fetch job statistics
  React.useEffect(() => {
    const fetchJobStatistics = async () => {
      try {
        const response = await fetch('/api/admin/jobs/statistics');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setJobStats(result.data);
          }
        }
      } catch (error) {
        console.error('Error fetching job statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobStatistics();
  }, []);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = React.useCallback(
    (href?: string) => {
      if (!href || !pathname) return false;
      // Kiểm tra exact match trước
      if (pathname === href) return true;
      // Chỉ kiểm tra startsWith nếu href không phải là /admin (tránh match tất cả)
      if (href === '/admin') return pathname === '/admin';
      // Với các route khác, kiểm tra startsWith nhưng phải có / phía sau
      return pathname.startsWith(href + '/');
    },
    [pathname]
  );

  // Generate navItems with dynamic data
  const navItems = getNavItems(jobStats, loading);

  // Auto-expand items that have active children
  React.useEffect(() => {
    if (!pathname) return;

    const itemsToExpand: string[] = [];
    const currentNavItems = getNavItems(jobStats, loading);

    const checkExpansion = (items: NavItem[]) => {
      items.forEach((item) => {
        if (item.children) {
          const hasActive = item.children.some((child) => {
            if (child.href && isActive(child.href)) return true;
            if (child.children) {
              return child.children.some((grandchild) => isActive(grandchild.href));
            }
            return false;
          });

          if (hasActive) {
            itemsToExpand.push(item.title);
          }

          checkExpansion(item.children);
        }
      });
    };

    checkExpansion(currentNavItems);

    if (itemsToExpand.length > 0) {
      setExpandedItems((prev) => [...new Set([...prev, ...itemsToExpand])]);
    }
  }, [pathname]); // Chỉ depend vào pathname

  const getBadgeVariant = React.useCallback((badgeKey?: string, badge?: string | number) => {
    if (!badgeKey || !badge || badge === '...' || badge === '0') return 'secondary';

    switch (badgeKey) {
      case 'pendingJobs':
        return 'outline'; // Vàng cho đang chờ duyệt
      case 'activeJobs':
        return 'default'; // Xanh lá cho đã duyệt
      case 'expiredJobs':
        return 'destructive'; // Đỏ cho hết hạn
      default:
        return 'secondary';
    }
  }, []);

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    // Chỉ highlight item nếu nó có href và đang active
    const active = item.href ? isActive(item.href) : false;

    if (collapsed && level === 0) {
      return (
        <div key={item.title}>
          {item.href ? (
            <Link href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  'h-12 w-full justify-center p-2 transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-purple-500 hover:to-purple-500',
                  'hover:scale-105 hover:shadow-md',
                  active && 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
                  active && 'scale-105 shadow-lg shadow-purple-500/10'
                )}
                title={item.title}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-colors',
                    active && 'text-purple-600 dark:text-purple-400'
                  )}
                />
              </Button>
            </Link>
          ) : (
            <Button
              variant="ghost"
              className={cn(
                'h-12 w-full justify-center p-2 transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
                'hover:scale-105 hover:shadow-md',
                active && 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
                active && 'scale-105 shadow-lg shadow-purple-500/10'
              )}
              onClick={() => {
                setCollapsed(false);
                toggleExpanded(item.title);
              }}
              title={item.title}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 transition-colors',
                  active && 'text-purple-600 dark:text-purple-400'
                )}
              />
            </Button>
          )}
        </div>
      );
    }

    return (
      <div key={item.title}>
        {item.href ? (
          <Link href={item.href}>
            <Button
              variant="ghost"
              className={cn(
                'h-11 w-full justify-start gap-3 rounded-lg transition-all duration-200',
                'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
                'hover:translate-x-1 hover:shadow-md',
                level === 1 && 'pl-10',
                level === 2 && 'pl-14',
                active && 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
                active && 'border-l-4 border-purple-500 shadow-lg shadow-purple-500/10'
              )}
            >
              <item.icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active && 'text-purple-600 dark:text-purple-400'
                )}
              />
              <span
                className={cn(
                  'flex-1 text-left font-medium',
                  active && 'text-purple-700 dark:text-purple-300'
                )}
              >
                {item.title}
              </span>
              {item.badge && (
                <Badge
                  variant={getBadgeVariant(item.badgeKey, item.badge)}
                  className={cn(
                    'ml-auto',
                    loading && 'animate-pulse',
                    active && 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
                    item.badgeKey === 'pendingJobs' &&
                      'bg-yellow-400 text-yellow-700 dark:text-yellow-400',
                    item.badgeKey === 'activeJobs' &&
                      'bg-green-500/20 text-green-700 dark:text-green-400',
                    item.badgeKey === 'closedJobs' &&
                      'bg-gray-500/20 text-gray-700 dark:text-gray-400',
                    item.badgeKey === 'expiredJobs' &&
                      'bg-red-500/20 text-red-700 dark:text-red-400'
                  )}
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ) : (
          <Button
            variant="ghost"
            className={cn(
              'h-11 w-full justify-start gap-3 rounded-lg transition-all duration-200',
              'hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-blue-500/20',
              'hover:translate-x-1 hover:shadow-md',
              level === 1 && 'pl-10',
              level === 2 && 'pl-14',
              active && 'bg-gradient-to-r from-purple-500/20 to-blue-500/20',
              active && 'border-l-4 border-purple-500 shadow-lg shadow-purple-500/10'
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <item.icon
              className={cn(
                'h-4 w-4 shrink-0 transition-colors',
                active && 'text-purple-600 dark:text-purple-400'
              )}
            />
            <span
              className={cn(
                'flex-1 text-left font-medium',
                active && 'text-purple-700 dark:text-purple-300'
              )}
            >
              {item.title}
            </span>
            {item.badge && (
              <Badge
                variant={getBadgeVariant(item.badgeKey, item.badge)}
                className={cn('mr-2 ml-auto', loading && 'animate-pulse')}
              >
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <ChevronRight
                className={cn(
                  'h-4 w-4 shrink-0 transition-transform duration-200',
                  isExpanded && 'rotate-90 text-purple-500'
                )}
              />
            )}
          </Button>
        )}

        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={cn(
        'sticky top-16 h-[calc(100vh-4rem)] transition-all duration-300',
        'bg-gradient-to-b from-white via-gray-50/50 to-white dark:from-gray-950 dark:via-gray-900/50 dark:to-gray-950',
        'border-r border-gray-200/50 dark:border-gray-800/50',
        'shadow-xl shadow-gray-200/20 dark:shadow-gray-900/20',
        collapsed ? 'w-16' : 'w-72',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-end p-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'h-9 w-9 rounded-lg transition-all duration-200',
              'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
              'hover:scale-110 hover:shadow-md'
            )}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            )}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-2">{navItems.map((item) => renderNavItem(item))}</nav>
        </ScrollArea>

        {/* Footer */}
        {!collapsed && (
          <>
            <Separator className="bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
            <div className="p-4">
              <div className="rounded-lg bg-gradient-to-r from-purple-500/5 to-blue-500/5 p-3">
                <p className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-center text-xs font-medium text-transparent">
                  © 2025 Career Connect
                </p>
                <p className="text-muted-foreground mt-1 text-center text-[10px]">
                  Admin Dashboard v2.0
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
