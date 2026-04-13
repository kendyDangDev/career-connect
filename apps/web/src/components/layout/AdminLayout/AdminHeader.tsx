'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, MessageSquare, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BrandLogo } from '@/components/brand/BrandLogo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AdminChatModal } from '@/components/admin/chat/AdminChatModal';

interface AdminHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  className?: string;
}

export function AdminHeader({ user, className }: AdminHeaderProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isChatOpen, setIsChatOpen] = React.useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/admin/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const getInitials = (name?: string | null) => {
    if (!name) return 'AD';
    const parts = name.split(' ');
    return parts
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full backdrop-blur-xl',
        'bg-gradient-to-r from-white/80 via-white/95 to-white/80',
        'dark:from-gray-950/80 dark:via-gray-950/95 dark:to-gray-950/80',
        'border-b border-gray-200/50 dark:border-gray-800/50',
        'shadow-lg shadow-gray-200/20 dark:shadow-gray-900/20',
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <BrandLogo
            href="/admin"
            size={40}
            priority
            className="group gap-3"
            iconClassName="rounded-xl shadow-xl transition-transform group-hover:scale-110"
            labelClassName="hidden text-lg font-bold text-gray-900 md:inline-flex"
          />
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto max-w-md flex-1">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Search className="text-purple-500 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 z-10" />
            <Input
              type="search"
              placeholder="Tìm kiếm trong hệ thống..."
              className={cn(
                'relative w-full pr-4 pl-10 h-10',
                'bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-950',
                'border-gray-200/50 dark:border-gray-800/50',
                'focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20',
                'placeholder:text-gray-400 dark:placeholder:text-gray-600'
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'relative rounded-lg transition-all duration-200',
              'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
              'hover:shadow-md hover:scale-110'
            )}
            onClick={() => router.push('/admin/notifications')}
          >
            <Bell className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <Badge
              className={cn(
                'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]',
                'bg-gradient-to-r from-red-500 to-pink-500 text-white border-0'
              )}
            >
              3
            </Badge>
          </Button>

          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'relative rounded-lg transition-all duration-200',
              'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
              'hover:shadow-md hover:scale-110'
            )}
            onClick={() => setIsChatOpen(true)}
          >
            <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <Badge
              className={cn(
                'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]',
                'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0'
              )}
            >
              5
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className={cn(
                  'relative h-auto p-2 rounded-lg transition-all duration-200',
                  'hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10',
                  'hover:shadow-md'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="hidden text-right md:block">
                    <p className="text-sm leading-none font-semibold bg-gradient-to-r from-gray-700 to-gray-900 dark:from-gray-200 dark:to-gray-100 bg-clip-text text-transparent">
                      {user?.name || 'Admin'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 text-xs">
                      {user?.email || 'admin@careerconnect.com'}
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full blur opacity-25"></div>
                    <Avatar className="h-9 w-9 border-2 border-white dark:border-gray-800 shadow-lg">
                      <AvatarImage src={user?.image || ''} alt={user?.name || 'Admin'} />
                      <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <ChevronDown className="text-purple-500 dark:text-purple-400 h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className={cn(
                'w-56 rounded-xl',
                'bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl',
                'border border-gray-200/50 dark:border-gray-800/50',
                'shadow-2xl shadow-gray-200/20 dark:shadow-gray-900/20'
              )} 
              align="end" 
              forceMount
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-purple-500/20">
                    <AvatarImage src={user?.image || ''} alt={user?.name || 'Admin'} />
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none font-semibold">{user?.name || 'Admin'}</p>
                    <p className="text-muted-foreground text-xs leading-none">
                      {user?.email || 'admin@careerconnect.com'}
                    </p>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <DropdownMenuItem 
                onClick={() => router.push('/admin/profile')}
                className="mx-2 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all"
              >
                <User className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span>Hồ sơ của tôi</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => router.push('/admin/settings')}
                className="mx-2 rounded-lg cursor-pointer hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-blue-500/10 transition-all"
              >
                <Settings className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
              <DropdownMenuItem 
                onClick={handleSignOut} 
                className="mx-2 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-all"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Chat Modal */}
      <AdminChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
}
