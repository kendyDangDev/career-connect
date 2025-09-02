'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Bell, MessageSquare, Search, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

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
        'bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur',
        className
      )}
    >
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-lg">
              CC
            </div>
            <span className="hidden md:inline-block">Career Connect</span>
          </Link>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mx-auto max-w-md flex-1">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Tìm kiếm..."
              className="w-full pr-4 pl-9"
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
            className="relative"
            onClick={() => router.push('/admin/notifications')}
          >
            <Bell className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              3
            </Badge>
          </Button>

          {/* Messages */}
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => router.push('/admin/messages')}
          >
            <MessageSquare className="h-5 w-5" />
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-[10px]"
            >
              5
            </Badge>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-auto p-0 pl-2">
                <div className="flex items-center gap-3">
                  <div className="hidden text-right md:block">
                    <p className="text-sm leading-none font-medium">{user?.name || 'Admin'}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {user?.email || 'admin@careerconnect.com'}
                    </p>
                  </div>
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user?.image || ''} alt={user?.name || 'Admin'} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm leading-none font-medium">{user?.name || 'Admin'}</p>
                  <p className="text-muted-foreground text-xs leading-none">
                    {user?.email || 'admin@careerconnect.com'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/admin/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Hồ sơ</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/admin/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Cài đặt</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Đăng xuất</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
