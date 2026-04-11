'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  BarChart3,
  Briefcase,
  Building2,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Search,
  Users,
} from 'lucide-react';

import { Providers } from '@/components/providers/providers';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/employer/dashboard', icon: LayoutDashboard },
  { name: 'Quản lý công ty', href: '/employer/company', icon: Building2 },
  { name: 'Quản lý tin tuyển dụng', href: '/employer/jobs', icon: Briefcase },
  { name: 'Quản lý ứng viên', href: '/employer/applications', icon: Users },
  { name: 'Tin nhắn', href: '/employer/messages', icon: MessageSquare },
  { name: 'Báo cáo & Thống kê', href: '/employer/analytics', icon: BarChart3 },
];

function getDisplayInitials(displayName: string, fallbackEmail?: string | null) {
  const nameSource = displayName.trim() || fallbackEmail?.trim() || 'Employer';
  const parts = nameSource.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase();
}

function EmployerLayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const displayName = session?.user?.name || session?.user?.email || 'Employer';
  const displayEmail = session?.user?.email || 'No email';
  const initials = useMemo(
    () => getDisplayInitials(displayName, session?.user?.email),
    [displayName, session?.user?.email]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50/30">
      <aside className="shadow-soft-lg fixed inset-y-0 left-0 z-50 w-64 border-r border-purple-100 bg-white">
        <div className="flex h-16 items-center justify-center border-b border-purple-100 bg-gradient-to-r from-purple-600 to-purple-500">
          <Link href="/employer/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
              <Briefcase className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">CareerConnect</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-md shadow-purple-200'
                    : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 transition-transform duration-200',
                    isActive ? 'text-white' : 'text-gray-500 group-hover:text-purple-600',
                    'group-hover:scale-110'
                  )}
                />
                <span className="flex-1">{item.name}</span>
                {isActive ? <ChevronRight className="h-4 w-4 text-white" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="absolute right-0 bottom-0 left-0 border-t border-purple-100 bg-gradient-to-r from-purple-50/50 to-transparent p-4">
          <div className="flex items-center gap-3 rounded-lg bg-white p-3 shadow-sm">
            {session?.user?.avatarUrl ? (
              <img
                src={session.user.avatarUrl}
                alt={displayName}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-purple-400 font-semibold text-white">
                {initials}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
              <p className="truncate text-xs text-gray-500">{displayEmail}</p>
            </div>

            <button
              className="cursor-pointer text-gray-400 transition-colors hover:text-purple-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <div className="pl-64">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-purple-100 bg-white/80 px-6 shadow-sm backdrop-blur-md">
          <div className="max-w-xl flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Tìm kiếm công việc, ứng viên..."
                className="w-full rounded-lg border border-purple-100 bg-white py-2 pr-4 pl-10 text-sm transition-all outline-none focus:border-purple-300 focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/employer/jobs/create"
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-2 text-sm font-medium text-white shadow-md shadow-purple-200 transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-300"
            >
              <Briefcase className="h-4 w-4" />
              Đăng tin tuyển dụng
            </Link>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

export default function EmployerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <EmployerLayoutShell>{children}</EmployerLayoutShell>
    </Providers>
  );
}
