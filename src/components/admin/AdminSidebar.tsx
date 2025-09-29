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
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard & Analytics',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Quản lý việc làm',
    icon: Briefcase,
    badge: '12',
    children: [
      {
        title: 'Tất cả tin',
        href: '/admin/jobs',
        icon: FolderOpen,
        badge: '250',
      },
      {
        title: 'Đang chờ duyệt',
        href: '/admin/jobs/pending',
        icon: Clock,
        badge: '8',
      },
      {
        title: 'Đã duyệt',
        href: '/admin/jobs/approved',
        icon: CheckCircle,
        badge: '180',
      },
      {
        title: 'Hết hạn',
        href: '/admin/jobs/expired',
        icon: XCircle,
        badge: '62',
      },
    ],
  },
  {
    title: 'Quản lý ứng viên',
    icon: Users,
    children: [
      {
        title: 'Danh sách',
        href: '/admin/candidates',
        icon: Users,
        badge: '1.2k',
      },
      {
        title: 'Hồ sơ',
        href: '/admin/candidates/profiles',
        icon: FileSearch,
      },
      {
        title: 'Đánh giá',
        href: '/admin/candidates/reviews',
        icon: Star,
      },
    ],
  },
  {
    title: 'Quản lý nhà tuyển dụng',
    icon: Building2,
    children: [
      {
        title: 'Công ty',
        href: '/admin/companies',
        icon: Building2,
        badge: '85',
      },
      {
        title: 'Tài khoản',
        href: '/admin/employers',
        icon: UserCheck,
      },
      {
        title: 'Gói dịch vụ',
        href: '/admin/packages',
        icon: Package,
      },
    ],
  },
  {
    title: 'Báo cáo & Thống kê',
    icon: BarChart3,
    children: [
      {
        title: 'Tổng quan',
        href: '/admin/reports',
        icon: TrendingUp,
      },
      {
        title: 'Doanh thu',
        href: '/admin/reports/revenue',
        icon: DollarSign,
      },
      {
        title: 'Người dùng',
        href: '/admin/users',
        icon: Users,
      },
      {
        title: 'Tuyển dụng',
        href: '/admin/reports/recruitment',
        icon: Briefcase,
      },
    ],
  },
  {
    title: 'Cài đặt hệ thống',
    icon: Settings,
    children: [
      {
        title: 'Cài đặt chung',
        href: '/admin/settings',
        icon: Settings,
      },
      {
        title: 'Danh mục hệ thống',
        icon: Database,
        children: [
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
          {
            title: 'Địa điểm',
            href: '/admin/locations',
            icon: Globe,
          },
        ],
      },
      {
        title: 'Phân quyền',
        href: '/admin/permissions',
        icon: Shield,
      },
      {
        title: 'Giao diện',
        href: '/admin/appearance',
        icon: Palette,
      },
      {
        title: 'SEO & Marketing',
        href: '/admin/seo',
        icon: Globe,
      },
    ],
  },
];

interface AdminSidebarProps {
  className?: string;
}

export function AdminSidebar({ className }: AdminSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const isParentActive = (item: NavItem): boolean => {
    if (item.href && isActive(item.href)) return true;
    if (item.children) {
      return item.children.some((child) => {
        if (child.href && isActive(child.href)) return true;
        if (child.children) {
          return child.children.some((grandchild) => isActive(grandchild.href));
        }
        return false;
      });
    }
    return false;
  };

  const renderNavItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = item.href ? isActive(item.href) : isParentActive(item);

    if (collapsed && level === 0) {
      return (
        <div key={item.title}>
          {item.href ? (
            <Link href={item.href}>
              <Button
                variant={active ? 'secondary' : 'ghost'}
                className={cn('h-12 w-full justify-center p-2', active && 'bg-secondary')}
                title={item.title}
              >
                <item.icon className="h-5 w-5" />
              </Button>
            </Link>
          ) : (
            <Button
              variant={active ? 'secondary' : 'ghost'}
              className={cn('h-12 w-full justify-center p-2', active && 'bg-secondary')}
              onClick={() => {
                setCollapsed(false);
                toggleExpanded(item.title);
              }}
              title={item.title}
            >
              <item.icon className="h-5 w-5" />
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
              variant={active ? 'secondary' : 'ghost'}
              className={cn(
                'h-10 w-full justify-start gap-3',
                level === 1 && 'pl-8',
                level === 2 && 'pl-12',
                active && 'bg-secondary'
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 text-left">{item.title}</span>
              {item.badge && (
                <Badge variant="secondary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Button>
          </Link>
        ) : (
          <Button
            variant={active ? 'secondary' : 'ghost'}
            className={cn(
              'h-10 w-full justify-start gap-3',
              level === 1 && 'pl-8',
              level === 2 && 'pl-12',
              active && 'bg-secondary'
            )}
            onClick={() => toggleExpanded(item.title)}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="mr-2 ml-auto">
                {item.badge}
              </Badge>
            )}
            {hasChildren && (
              <ChevronRight
                className={cn('h-4 w-4 shrink-0 transition-transform', isExpanded && 'rotate-90')}
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
        'bg-background sticky top-16 h-[calc(100vh-4rem)] border-r transition-all duration-300',
        collapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Collapse Toggle */}
        <div className="flex items-center justify-end p-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        <Separator />

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-2">
          <nav className="space-y-1">{navItems.map((item) => renderNavItem(item))}</nav>
        </ScrollArea>

        {/* Footer */}
        {!collapsed && (
          <>
            <Separator />
            <div className="p-4">
              <p className="text-muted-foreground text-center text-xs">© 2024 Career Connect</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
